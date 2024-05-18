/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  Select,
  Space,
  DatePicker,
  Button,
  Divider,
  message,
  Flex,
  Spin
} from 'antd'
import Class, {
  CoveragePanel,
  StudentPanel,
  TeacherPanel
} from 'components/reports/Class'
import Student from 'components/reports/Student'
import All, { ClassPanel } from 'components/reports/All'
import { DetailedStudentPanel } from 'components/reports/Student'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { host, getCookie } from 'utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Reports(props: { role: string }) {
  const [initializing, setInitializing] = useState(props.role === 'admin')
  const [classes, setClasses] = useState([] as any[])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [type, setType] = useState('')
  const [generatedType, setGeneratedType] = useState('')
  const [result, setResult] = useState({} as any)
  const params = useParams()
  const [messageApi, contextHolder] = message.useMessage()
  const reportTypeOpts = [
    { value: 'class', label: 'Class' },
    { value: 'student', label: 'Student' }
  ]
  if (props.role === 'admin') {
    reportTypeOpts.push({ value: 'all', label: 'All Classes' })
  }

  const loadClasses = async () => {
    const res = await fetch(`${host}/classes`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    const json = await res.json()
    setClasses(
      json
        .map((cl: any) => {
          return { label: cl.class.toUpperCase(), value: cl.class }
        })
        .sort(
          (a: any, b: any) =>
            Number(a.value.slice(2)) - Number(b.value.slice(2))
        )
    )
    setInitializing(false)
  }
  useEffect(() => {
    if (initializing) {
      loadClasses()
    }
  }, [])

  const onTypeChange = (value: string) => {
    setType(value)
  }

  const generateReports = async (values: any) => {
    messageApi.open({
      duration: 0,
      type: 'loading',
      content: 'Generating reports...'
    })
    setLoading(true)
    setLoaded(false)
    const reqParams: any = {}
    if (values.from) {
      reqParams.from = values.from.format('YYYY-MM-DD')
    }
    if (values.to) {
      reqParams.to = values.to.format('YYYY-MM-DD')
    }
    const url =
      values.type === 'all'
        ? `${host}/reports/${values.type}?`
        : `${host}/${
            props.role === 'admin' ? values.class : params.section
          }/reports/${values.type}?`
    const res = await fetch(url + new URLSearchParams(reqParams), {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    messageApi.destroy()
    if (res.status === 200) {
      const json = await res.json()
      console.log(json)
      if (values.type === 'class') {
        json.coverageList = json.coverage.map((cov: any) => {
          const newCoverage: any = { key: cov.subject, label: cov.subject }
          newCoverage.children = <CoveragePanel coverage={cov} />
          return newCoverage
        })
        json.teachersList = json.teachers.map((teacher: any) => {
          const newTeacher: any = { key: teacher.id, label: teacher.name }
          newTeacher.children = <TeacherPanel teacher={teacher} />
          return newTeacher
        })
        json.studentsList = json.students.map((student: any) => {
          const newStudent: any = { key: student.id, label: student.name }
          newStudent.children = <StudentPanel student={student} />
          return newStudent
        })
        json.teachersTable = json.teachers.map((teacher: any) => {
          teacher.key = teacher.id
          return teacher
        })
        json.coverageTable = json.coverage.map((cov: any) => {
          cov.key = cov.subject
          return cov
        })
        json.studentsTable = json.students.map((student: any) => {
          student.key = student.id
          return student
        })
      } else if (values.type === 'student') {
        json.studentsTable = json.students.map((student: any) => {
          student.key = student.id
          return student
        })
        json.studentsList = json.students.map((student: any) => {
          const newStudent: any = { key: student.id, label: student.name }
          newStudent.children = <DetailedStudentPanel report={student} />
          return newStudent
        })
        delete json.students
      } else {
        json.classesTable = json.classes.sort(
          (a: any, b: any) =>
            Number(a.class.slice(2)) - Number(b.class.slice(2))
        )
        json.classesList = json.classes
          .map((cl: any) => {
            const newClass: any = {
              key: cl.class,
              label: cl.class.toUpperCase()
            }
            newClass.children = <ClassPanel cl={cl} />
            return newClass
          })
          .sort(
            (a: any, b: any) => Number(a.key.slice(2)) - Number(b.key.slice(2))
          )
        delete json.classes
      }
      messageApi.success('Successfully generated reports.')
      setLoaded(true)
      setGeneratedType(values.type)
      setResult(json)
    } else {
      messageApi.error(
        'Unable to generate reports as no classes were conducted in the requested dates.'
      )
    }
    setLoading(false)
  }
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
  }
  return (
    <div className="mx-4 mt-4 flex flex-col">
      {contextHolder}
      <h2 className="mt-0">Reports</h2>
      <Form
        id="report"
        layout="horizontal"
        size="large"
        onFinish={generateReports}
        autoComplete="off"
        disabled={loading}
        initialValues={{ type: 'class' }}
      >
        <Space
          direction="horizontal"
          size="large"
          className="flex-wrap gap-y-1"
        >
          <Form.Item
            label="Type of reports"
            name="type"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: `Report type is required.`
              }
            ]}
          >
            <Select options={reportTypeOpts} onChange={onTypeChange} />
          </Form.Item>
          {props.role === 'admin' && type !== 'all' && (
            <Form.Item
              label="Class"
              name="class"
              className="w-80"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: `Class is required.`
                }
              ]}
            >
              <Select options={classes} />
            </Form.Item>
          )}
          <Form.Item
            label="Date From"
            name="from"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <DatePicker size="large" className="w-full" />
          </Form.Item>
          <Form.Item
            label="Date To"
            name="to"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <DatePicker size="large" className="w-full" />
          </Form.Item>
        </Space>
        <Form.Item className="mt-2">
          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            className=""
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </Form.Item>
      </Form>
      <Divider className="mb-2 mt-0" />
      {loaded && generatedType === 'class' && <Class report={result} />}
      {loaded && generatedType === 'student' && <Student report={result} />}
      {loaded && generatedType === 'all' && <All report={result} />}
    </div>
  )
}

export default Reports
