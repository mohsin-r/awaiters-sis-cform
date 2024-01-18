/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  Button,
  DatePicker,
  Space,
  TimePicker,
  Input,
  InputNumber,
  Checkbox,
  Card,
  Spin,
  Flex,
  message
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCookie } from 'utils'
import dayjs from 'dayjs'

interface Student {
  key: string
  name: string
  late: number
  ayahs: number
  homework: boolean
}

export default function CformEditor(props: { mode: string }) {
  const [form] = Form.useForm()
  const [students, setStudents] = useState([] as Student[])
  const [date, setDate] = useState('' as any)
  const [start, setStart] = useState('' as any)
  const [end, setEnd] = useState('' as any)
  const [quran, setQuran] = useState('')
  const [generalTopic, setGeneralTopic] = useState('')
  const [akhlaqAhkam, setAkhlaqAhkam] = useState('')
  const [others, setOthers] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const host = 'https://awaiters-sis-cform-api.onrender.com'
  const navigate = useNavigate()
  const params = useParams()

  const addCoverage = async (values: any) => {
    const res = await fetch(`${host}/coverage`, {
      method: 'post',
      body: JSON.stringify({
        date: values.date,
        start: values.start || undefined,
        end: values.end || undefined,
        quran: values.quran,
        generalTopic: values.generalTopic,
        akhlaqAhkam: values.akhlaqAhkam,
        others: values.others
      }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    return res.status === 201
  }

  const updateCoverage = async (date: string, values: any) => {
    const res = await fetch(`${host}/coverage`, {
      method: 'put',
      body: JSON.stringify({
        date: date,
        newCoverage: {
          date: values.date,
          start: values.start || undefined,
          end: values.end || undefined,
          quran: values.quran,
          generalTopic: values.generalTopic,
          akhlaqAhkam: values.akhlaqAhkam,
          others: values.others
        }
      }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    return res.status === 200
  }

  const getExisting = async () => {
    const coverage = await fetch(`${host}/coverage/${params.date}`, {
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    if (coverage.ok) {
      const json = await coverage.json()
      setDate(dayjs(params.date!, 'YYYY-MM-DD'))
      if (json.start) {
        setStart(dayjs(json.start, 'h:mmA'))
      }
      if (json.end) {
        setEnd(dayjs(json.end, 'h:mmA'))
      }
      setQuran(json.quran)
      setGeneralTopic(json.generalTopic)
      setAkhlaqAhkam(json.akhlaqAhkam)
      setOthers(json.others)
    }
    const progress = await fetch(`${host}/progress/${params.date}`, {
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    if (progress.ok) {
      const json = await progress.json()
      setStudents(
        json.map((student: Student) => {
          student.key = student.name
          return student
        })
      )
    }
    setTimeout(() => {
      setLoaded(true)
    }, 500)
    if (!coverage.ok) {
      setNotFound(true)
    }
  }

  async function getStudents() {
    const res = await fetch(`${host}/people/student`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    const json = await res.json()
    setStudents(
      json.map((student: any) => {
        student.key = student.name
        delete student.email
        delete student.phone
        student.ayahs = 0
        student.late = 0
        student.homework = true
        return student
      })
    )
    setTimeout(() => {
      setLoaded(true)
    }, 500)
  }

  const addProgress = async (values: any) => {
    const res = await fetch(`${host}/progress`, {
      method: 'post',
      body: JSON.stringify({
        date: values.date,
        students: values.students
      }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    return res.status === 200
  }

  const updateProgress = async (date: string, values: any) => {
    const res = await fetch(`${host}/progress`, {
      method: 'put',
      body: JSON.stringify({
        date: date,
        students: values.students.map((student: any) => {
          const obj: any = { name: student.name }
          const newProgress = student
          newProgress.date = values.date
          delete newProgress.name
          obj.newProgress = newProgress
          return obj
        })
      }),
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
    values.date = values.date.format('YYYY-MM-DD')
    if (values.start) {
      values.start = values.start.format('h:mm a')
    }
    if (values.end) {
      values.end = values.end.format('h:mm a')
    }
    if (props.mode === 'new') {
      const coverageAdded = await addCoverage(values)
      const progressAdded =
        values.students && values.students.length > 0
          ? await addProgress(values)
          : true
      messageApi.destroy()
      if (coverageAdded && progressAdded) {
        messageApi.success('Successfully added record. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/cform`)
        }, 1500)
      } else {
        messageApi.error(
          'Failed to add record. A record for this date already exists.'
        )
        setSubmitting(false)
      }
    } else {
      const coverageUpdated = await updateCoverage(
        date.format('YYYY-MM-DD'),
        values
      )
      const progressUpdated =
        values.students && values.students.length > 0
          ? await updateProgress(date.format('YYYY-MM-DD'), values)
          : true
      messageApi.destroy()
      if (coverageUpdated && progressUpdated) {
        messageApi.success('Successfully updated record. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/cform`)
        }, 1500)
      } else {
        messageApi.error(
          'Failed to update record. A record for the new date you have selected already exists.'
        )
        setSubmitting(false)
      }
    }
  }

  useEffect(() => {
    if (props.mode === 'new') {
      getStudents()
    } else {
      getExisting()
    }
  }, [])
  if (!loaded) {
    return (
      <Flex
        gap="small"
        className="h-screen w-screen"
        align="center"
        justify="center"
      >
        <Spin size="large"></Spin>
      </Flex>
    )
  }
  return (
    <div className="mx-4">
      {contextHolder}
      <div className="flex items-center">
        {props.mode === 'new' && <h2>New CForm Entry</h2>}
        {props.mode === 'view' && <h2>View CForm Entry</h2>}
        {props.mode === 'edit' && <h2>Edit CForm Entry</h2>}
        <Button
          disabled={submitting}
          onClick={() => {
            navigate(`/${params.section}/cform`)
          }}
          type="primary"
          className="ml-auto"
        >
          Back to CForm Entries
        </Button>
      </div>
      {notFound &&
        'Unable to load form. Most likely a record for this date does not exist.'}
      {!notFound && (
        <Form
          id="cform"
          disabled={props.mode === 'view' || submitting}
          form={form}
          autoComplete="off"
          size="large"
          layout="horizontal"
          initialValues={{
            date: date,
            start: start,
            end: end,
            quran: quran,
            generalTopic: generalTopic,
            akhlaqAhkam: akhlaqAhkam,
            others: others,
            students: students
          }}
          onFinish={handleSubmit}
        >
          <Space direction="horizontal" size="large">
            <Form.Item
              label="Date"
              name="date"
              rules={[
                { required: true, message: 'Date of the class is required.' }
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item label="Start Time" name="start">
              <TimePicker use12Hours format="h:mm a" />
            </Form.Item>
            <Form.Item label="End Time" name="end">
              <TimePicker use12Hours format="h:mm a" />
            </Form.Item>
          </Space>
          <Space
            direction="horizontal"
            size="large"
            className="flex-wrap gap-y-1"
          >
            <Form.Item
              label="Quran"
              name="quran"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="General Topic"
              name="generalTopic"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Akhlaq/Ahkam"
              name="akhlaqAhkam"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Others"
              name="others"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
          </Space>
          <Form.List name="students">
            {(fields) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {fields.map((field, index) => (
                  <Card
                    size="small"
                    title={students[index].name}
                    key={field.key}
                  >
                    <Form.Item label="Minutes Late" name={[field.name, 'late']}>
                      <InputNumber />
                    </Form.Item>
                    <Form.Item
                      label="Ayaat Recited"
                      name={[field.name, 'ayahs']}
                    >
                      <InputNumber />
                    </Form.Item>
                    <Form.Item
                      label="Homework Done"
                      name={[field.name, 'homework']}
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Checkbox />
                    </Form.Item>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>
          {props.mode !== 'view' && (
            <Form.Item>
              <Button type="primary" htmlType="submit" className="mt-5">
                Submit
              </Button>
            </Form.Item>
          )}
        </Form>
      )}
    </div>
  )
}
