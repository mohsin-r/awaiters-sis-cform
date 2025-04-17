/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Select,
  Space,
  Spin,
  TimePicker,
  message
} from 'antd'
import { useEffect, useState } from 'react'
import { compareString, getCookie, host, prefixLength } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

export default function EventEditor(props: { mode: string }) {
  const navigate = useNavigate()
  const params = useParams()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [studentsExist, setStudentsExist] = useState(false)
  const [studentsObj, setStudentsObj] = useState({} as any)
  const [classes, setClasses] = useState([] as Array<string>)
  const [messageApi, contextHolder] = message.useMessage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('' as any)
  const [start, setStart] = useState('' as any)
  const [end, setEnd] = useState('' as any)

  const initialize = async () => {
    let event: any = undefined
    let attendingIds: Array<string> = []
    if (props.mode !== 'new') {
      const res = await fetch(`${host}/events/${params.id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      event = await res.json()
      // console.log(event)
      setName(event.name)
      if (event.description) {
        setDescription(event.description)
      }
      setType(event.type)
      setDate(dayjs(event.date, 'YYYY-MM-DD'))
      if (event.start) {
        setStart(dayjs(event.start, 'h:mmA'))
      }
      if (event.end) {
        setEnd(dayjs(event.end, 'h:mmA'))
      }
      attendingIds = event.attendees.map(
        (attendee: { personId: string }) => attendee.personId
      )
    }
    const res = await fetch(`${host}/classes`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const classes = await res.json()
    setClasses(
      classes
        .map((cl: { class: string; day: string }) => cl.class)
        .sort((a: string, b: string) =>
          a.slice(0, prefixLength) === b.slice(0, prefixLength)
            ? Number(a.slice(prefixLength)) - Number(b.slice(prefixLength))
            : compareString(a, b)
        )
    )
    const allClassesStudents: any = {}
    const allClassesProms: Array<Promise<any>> = []
    for (let i = 0; i < classes.length; i += 1) {
      allClassesProms.push(
        fetch(`${host}/${classes[i].class}/people/student`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      )
    }
    const allClassesRes = await Promise.all(allClassesProms)
    for (let i = 0; i < allClassesRes.length; i += 1) {
      const students = (await allClassesRes[i].json()).map((student: any) => ({
        id: student.id,
        name: student.name,
        selected:
          props.mode === 'new' ? true : attendingIds.includes(student.id)
      }))
      allClassesStudents[classes[i].class] = students
    }
    setStudentsExist(
      Object.keys(allClassesStudents).some(
        (cl: string) => allClassesStudents[cl].length > 0
      )
    )
    setStudentsObj(allClassesStudents)
    // console.log(allClassesStudents)
    setInitializing(false)
  }

  const toggleAllSelected = (value: boolean) => {
    const newObj: any = {}
    classes.forEach((cl: string) => {
      const newList = studentsObj[cl].map((student: any) => {
        student.selected = value
        return student
      })
      newObj[cl] = newList
      form.setFieldValue(cl, newList)
    })
    setStudentsObj(newObj)
  }

  const toggleClassSelected = (cl: string, value: boolean) => {
    const newList = studentsObj[cl].map((student: any) => {
      student.selected = value
      return student
    })
    setStudentsObj({ ...studentsObj, [cl]: newList })
    form.setFieldValue(cl, newList)
  }

  const addEvent = async (payload: any) => {
    const res = await fetch(`${host}/events`, {
      method: 'post',
      body: JSON.stringify(payload),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    return res.status === 201
  }

  const updateEvent = async (payload: any) => {
    const res = await fetch(`${host}/events`, {
      method: 'put',
      body: JSON.stringify({ id: params.id, newEvent: payload }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    return res.status === 200
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    messageApi.open({
      duration: 0,
      type: 'loading',
      content: 'Submitting form...'
    })
    const payload: any = {
      name: values.name,
      type: values.type,
      date: values.date.format('YYYY-MM-DD')
    }
    if (values.start) {
      payload.start = values.start.format('h:mm a')
    }
    if (values.end) {
      payload.end = values.end.format('h:mm a')
    }
    if (values.description) {
      payload.description = values.description
    }
    payload.attendees = []
    for (const cl of classes) {
      const students = values[cl]
      if (students) {
        payload.attendees = payload.attendees.concat(
          students
            .filter((student: any) => student.selected)
            .map((student: any) => ({ id: student.id, role: 'attendee' }))
        )
      }
    }
    // console.log(payload)
    if (props.mode === 'new') {
      const eventAdded = await addEvent(payload)
      messageApi.destroy()
      if (eventAdded) {
        messageApi.success('Successfully added event. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/events`)
        }, 1500)
      } else {
        messageApi.error('Failed to add event.')
        setSubmitting(false)
      }
    } else {
      const eventUpdated = await updateEvent(payload)
      messageApi.destroy()
      if (eventUpdated) {
        messageApi.success('Successfully updated event. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/events`)
        }, 1500)
      } else {
        messageApi.error('Failed to update event. Please contact admin.')
        setSubmitting(false)
      }
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  if (initializing) {
    return (
      <Flex
        gap="small"
        className="h-screen w-screen text-[#3b7273]"
        vertical
        align="center"
        justify="center"
      >
        <Spin size="large"></Spin>
        <h3 className="m-0 p-0">Loading...</h3>
      </Flex>
    )
  } else if (!studentsExist) {
    return (
      <Flex gap="small" vertical className="absolute h-full w-full">
        <h2 className="mx-4 mb-0 mt-4 basis-[38%]">Downloads</h2>
        <Empty description="No Students Available" />
      </Flex>
    )
  }
  return (
    <div className="mx-4">
      {contextHolder}
      <div className="flex items-center">
        {props.mode === 'new' && <h2>New Event</h2>}
        {props.mode === 'view' && <h2>View Event</h2>}
        {props.mode === 'edit' && <h2>Edit Event</h2>}
        <Button
          onClick={() => {
            navigate(`/${params.section}/events`)
          }}
          type="primary"
          className="ml-auto"
        >
          Back to Events
        </Button>
      </div>
      <Form
        id="eventEditor"
        disabled={props.mode === 'view' || submitting}
        form={form}
        className="mb-4"
        autoComplete="off"
        size="large"
        layout="horizontal"
        onFinish={handleSubmit}
        initialValues={{
          ...studentsObj,
          name,
          description,
          type,
          date,
          start,
          end
        }}
      >
        <Space
          direction="horizontal"
          size="large"
          className="flex-wrap gap-y-1"
          align="start"
        >
          <Form.Item
            className="w-80"
            label="Name"
            name="name"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Name of the event is required.'
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            className="w-80"
            label="Description"
            name="description"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input.TextArea autoSize />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Type of the event is required.'
              }
            ]}
          >
            <Select
              options={[
                { value: 'Annual Day', label: 'Annual Day' },
                { value: 'Picnic', label: 'Picnic' },
                { value: 'Sports Event', label: 'Sports Event' },
                { value: 'Retreat', label: 'Retreat' },
                { value: 'Special Class', label: 'Special Class' },
                {
                  value: 'Teacher Training (TTC)',
                  label: 'Teacher Training (TTC)'
                },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </Form.Item>
        </Space>
        <Space
          direction="horizontal"
          size="large"
          className="flex-wrap gap-y-1"
        >
          <Form.Item
            label="Date"
            name="date"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[
              { required: true, message: 'Date of the event is required.' }
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="start"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <TimePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="end"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <TimePicker className="w-full" use12Hours format="h:mm a" />
          </Form.Item>
        </Space>
        <Flex align="center">
          <h3 className="m-0">Attendance</h3>
          <Button
            onClick={() => toggleAllSelected(true)}
            className="ml-auto"
            type="primary"
            disabled={props.mode === 'view' || submitting}
          >
            All Present
          </Button>
          <Button
            onClick={() => toggleAllSelected(false)}
            className="ml-2"
            type="primary"
            disabled={props.mode === 'view' || submitting}
          >
            All Absent
          </Button>
        </Flex>
        <Collapse
          size="middle"
          className="mt-4"
          defaultActiveKey={[...Array(classes.length).keys()]}
          items={classes.map((cl: string, idx: number) => ({
            key: idx,
            label: (
              <Flex align="center">
                <span>{cl.toUpperCase()}</span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleClassSelected(cl, true)
                  }}
                  className="ml-auto"
                  type="primary"
                  disabled={props.mode === 'view' || submitting}
                >
                  All Present
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleClassSelected(cl, false)
                  }}
                  className="ml-2"
                  type="primary"
                  disabled={props.mode === 'view' || submitting}
                >
                  All Absent
                </Button>
              </Flex>
            ),
            children: (
              <Form.List name={cl}>
                {(fields: any[]) => (
                  <Flex gap={8} wrap>
                    {fields.map(
                      (field: { key: any; name: any }, index: number) => (
                        <Form.Item
                          key={studentsObj[cl][index].id}
                          name={[field.name, 'selected']}
                          valuePropName="checked"
                          className="m-0 w-52 max-w-full"
                        >
                          <Checkbox>{studentsObj[cl][index].name}</Checkbox>
                        </Form.Item>
                      )
                    )}
                  </Flex>
                )}
              </Form.List>
            )
          }))}
        />
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mt-5">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
