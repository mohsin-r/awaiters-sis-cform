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
  Typography,
  message
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCookie, host } from 'utils'
import dayjs from 'dayjs'

interface Student {
  key: string
  id: string
  name: string
  present: boolean
  late: number
  ayahs: number
  quranHomework: boolean
  ideologyHomework: boolean
  historyHomework: boolean
  akhlaqHomework: boolean
  visible: boolean
  new?: boolean
}

interface Teacher {
  key: string
  id: string
  name: string
  present: boolean
  late: number
  visible: boolean
  new?: boolean
}

export default function CformEditor(props: any) {
  const [form] = Form.useForm()
  const [students, setStudents] = useState([] as Student[])
  const [teachers, setTeachers] = useState([] as Teacher[])
  const [date, setDate] = useState('' as any)
  const [start, setStart] = useState('' as any)
  const [end, setEnd] = useState('' as any)
  const [quranArabic, setQuranArabic] = useState('')
  const [ideology, setIdeology] = useState('')
  const [history, setHistory] = useState('')
  const [akhlaq, setAkhlaq] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const params = useParams()

  const addCoverage = async (values: any) => {
    const res = await fetch(`${host}/${params.section}/coverage`, {
      method: 'post',
      body: JSON.stringify({
        date: values.date,
        start: values.start || undefined,
        end: values.end || undefined,
        quranArabic: values.quranArabic,
        ideology: values.ideology,
        history: values.history,
        akhlaq: values.akhlaq
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
    const res = await fetch(`${host}/${params.section}/coverage`, {
      method: 'put',
      body: JSON.stringify({
        date: date,
        newCoverage: {
          date: values.date,
          start: values.start || undefined,
          end: values.end || undefined,
          quranArabic: values.quranArabic,
          ideology: values.ideology,
          history: values.history,
          akhlaq: values.akhlaq
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
    const coverage = await fetch(
      `${host}/${params.section}/coverage/${params.date}`,
      {
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      }
    )
    if (coverage.ok) {
      const json = await coverage.json()
      setDate(dayjs(params.date!, 'YYYY-MM-DD'))
      if (json.start) {
        setStart(dayjs(json.start, 'h:mmA'))
      }
      if (json.end) {
        setEnd(dayjs(json.end, 'h:mmA'))
      }
      setQuranArabic(json.quranArabic)
      setIdeology(json.ideology)
      setHistory(json.history)
      setAkhlaq(json.akhlaq)
    }
    const progress = await fetch(
      `${host}/${params.section}/progress/${params.date}`,
      {
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      }
    )
    let entryStudents: Student[] = []
    let existingStudentIds = []
    let entryTeachers: Teacher[] = []
    let existingTeacherIds = []
    if (progress.ok) {
      const json = await progress.json()
      entryStudents = json.students.map((student: Student) => {
        student.key = student.name
        student.visible = true
        return student
      })
      existingStudentIds = json.students.map((student: Student) => student.id)
      entryTeachers = json.teachers.map((teacher: Teacher) => {
        teacher.key = teacher.name
        teacher.visible = true
        return teacher
      })
      existingTeacherIds = json.teachers.map((teacher: Teacher) => teacher.id)
    }
    if (props.mode === 'edit') {
      const remainingStudents = await getPeople('student', existingStudentIds)
      setStudents([...entryStudents, ...remainingStudents])
      const remainingTeachers = await getPeople('teacher', existingTeacherIds)
      setTeachers([...entryTeachers, ...remainingTeachers])
    } else {
      setStudents(entryStudents)
      setTeachers(entryTeachers)
    }
    setTimeout(() => {
      setLoaded(true)
    }, 500)
    if (!coverage.ok) {
      setNotFound(true)
    }
  }

  async function getPeople(type: string, existingIds?: string[]) {
    const res = await fetch(`${host}/${params.section}/people/${type}`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    const json = await res.json()
    const mappedPeople = json.map((student: any) => {
      student.key = student.name
      delete student.email
      delete student.phone
      student.late = 0
      student.present = true
      if (type === 'student') {
        student.ayahs = 0
        student.quranHomework = true
        student.ideologyHomework = true
        student.historyHomework = true
        student.akhlaqHomework = true
      }
      student.visible = true
      return student
    })
    if (props.mode === 'new') {
      if (type === 'student') {
        setStudents(mappedPeople)
      } else {
        setTeachers(mappedPeople)
      }
      return mappedPeople
    } else {
      const remainingPeople: any[] = []
      mappedPeople.forEach((mp: any) => {
        if (!existingIds?.includes(mp.id)) {
          mp.visible = false
          remainingPeople.push(mp)
        }
      })
      return remainingPeople
    }
  }

  async function getLast() {
    const coverage = await fetch(`${host}/${params.section}/coverage/last`, {
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    if (coverage.ok) {
      const json = await coverage.json()
      if (json.start) {
        setStart(dayjs(json.start, 'h:mmA'))
      }
      if (json.end) {
        setEnd(dayjs(json.end, 'h:mmA'))
      }
      setQuranArabic(json.quranArabic)
      setIdeology(json.ideology)
      setHistory(json.history)
      setAkhlaq(json.akhlaq)
    }
    setDate(dayjs(dayjs(), 'YYYY-MM-DD'))
    setTimeout(() => {
      setLoaded(true)
    }, 500)
  }

  const addProgress = async (values: any) => {
    const res = await fetch(`${host}/${params.section}/progress`, {
      method: 'post',
      body: JSON.stringify({
        date: values.date,
        students: values.students,
        teachers: values.teachers
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
    const updateStudents = values.students.filter((s: Student, idx: number) => {
      if (students[idx].visible && !students[idx].new) {
        return true
      }
      return false
    })
    const newStudents = values.students.filter((s: Student, idx: number) => {
      if (students[idx].visible && students[idx].new) {
        return true
      }
      return false
    })
    const updateTeachers = values.teachers.filter((t: Teacher, idx: number) => {
      if (teachers[idx].visible && !teachers[idx].new) {
        return true
      }
      return false
    })
    const newTeachers = values.teachers.filter((t: Teacher, idx: number) => {
      if (teachers[idx].visible && teachers[idx].new) {
        return true
      }
      return false
    })
    const res = await fetch(`${host}/${params.section}/progress`, {
      method: 'put',
      body: JSON.stringify({
        date: date,
        students: updateStudents.map((student: any) => {
          const obj: any = { name: student.name, id: student.id }
          const newProgress = student
          newProgress.date = values.date
          delete newProgress.name
          obj.newProgress = newProgress
          return obj
        }),
        teachers: updateTeachers.map((teacher: any) => {
          const obj: any = { name: teacher.name, id: teacher.id }
          const newProgress = teacher
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
    const json = await res.json()
    const addStatus = await addProgress({
      students: newStudents,
      teachers: newTeachers,
      date: date
    })
    return res.status === 200 && addStatus
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
        values.students && values.teachers ? await addProgress(values) : true
      messageApi.destroy()
      if (coverageAdded && progressAdded) {
        messageApi.success('Successfully added record. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/c-form`)
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
        values.students && values.teachers
          ? await updateProgress(date.format('YYYY-MM-DD'), values)
          : true
      messageApi.destroy()
      if (coverageUpdated && progressUpdated) {
        messageApi.success('Successfully updated record. Redirecting...')
        setTimeout(() => {
          setSubmitting(false)
          navigate(`/${params.section}/c-form`)
        }, 1500)
      } else {
        messageApi.error(
          'Failed to update record. Possibly a record for the new date you have selected already exists, or there was another error.'
        )
        setSubmitting(false)
      }
    }
  }

  const addToEntry = (type: string, index: number) => {
    const copy: any = type === 'student' ? [...students] : [...teachers]
    copy[index].visible = true
    copy[index].new = true
    if (type === 'student') {
      setStudents(copy)
    } else {
      setTeachers(copy)
    }
  }

  const initialize = async () => {
    if (props.mode === 'new') {
      await getPeople('student')
      await getPeople('teacher')
      await getLast()
    } else {
      await getExisting()
    }
  }

  useEffect(() => {
    initialize()
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
        {props.mode === 'new' && <h2>New C-Form Entry</h2>}
        {props.mode === 'view' && <h2>View C-Form Entry</h2>}
        {props.mode === 'edit' && <h2>Edit C-Form Entry</h2>}
        <Button
          disabled={submitting}
          onClick={() => {
            navigate(`/${params.section}/c-form`)
          }}
          type="primary"
          className="ml-auto"
        >
          Back to C-Form Entries
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
            quranArabic: quranArabic,
            ideology: ideology,
            history: history,
            akhlaq: akhlaq,
            students: students,
            teachers: teachers
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
              className="w-80"
              label="Quran/Arabic"
              name="quranArabic"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              className="w-80"
              label="Ideology"
              name="ideology"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              className="w-80"
              label="History"
              name="history"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              className="w-80"
              label="Akhlaq"
              name="akhlaq"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea />
            </Form.Item>
          </Space>
          <h3>Teachers</h3>
          <Form.List name="teachers">
            {(fields: any[]) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {fields.map((field: { key: any; name: any }, index: number) => (
                  <Card
                    size="small"
                    title={teachers[index].name}
                    className="relative"
                    key={field.key}
                  >
                    {!teachers[index].visible && props.mode === 'edit' && (
                      <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
                        <Button
                          onClick={() => {
                            addToEntry('teacher', index)
                          }}
                          type="primary"
                        >
                          Add to entry
                        </Button>
                      </div>
                    )}
                    <Form.Item
                      label="Present"
                      name={[field.name, 'present']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        teachers[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Minutes Late"
                      name={[field.name, 'late']}
                      className={`mb-2 ${
                        teachers[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>
          <h3>Students</h3>
          <Form.List name="students">
            {(fields: any[]) => (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {fields.map((field: { key: any; name: any }, index: number) => (
                  <Card
                    size="small"
                    title={students[index].name}
                    className="relative"
                    key={field.key}
                  >
                    {!students[index].visible && props.mode === 'edit' && (
                      <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
                        <Button
                          onClick={() => {
                            addToEntry('student', index)
                          }}
                          type="primary"
                        >
                          Add to entry
                        </Button>
                      </div>
                    )}
                    <Form.Item
                      label="Present"
                      name={[field.name, 'present']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Minutes Late"
                      name={[field.name, 'late']}
                      className={`mb-2 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <InputNumber />
                    </Form.Item>
                    <Form.Item
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                      label="Ayaat Recited"
                      name={[field.name, 'ayahs']}
                    >
                      <InputNumber />
                    </Form.Item>
                    <Form.Item
                      label="Quran/Arabic H/W Complete"
                      name={[field.name, 'quranHomework']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Ideology H/W Complete"
                      name={[field.name, 'ideologyHomework']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="History H/W Complete"
                      name={[field.name, 'historyHomework']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
                    >
                      <Checkbox />
                    </Form.Item>
                    <Form.Item
                      label="Akhlaq H/W Complete"
                      name={[field.name, 'akhlaqHomework']}
                      valuePropName="checked"
                      className={`mb-0 ${
                        students[index].visible ? '' : 'invisible'
                      }`}
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
