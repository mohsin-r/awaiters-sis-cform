/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Empty,
  Flex,
  Form,
  message,
  Select,
  Space,
  Spin
} from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { compareString, getCookie, host, prefixLength } from 'utils'
import JSZip from 'jszip'
import TranscriptDocument from './documents/transcript'
import EngagementDocument from './documents/engagement-report'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import useTrait from 'utils/trait'

export default function Downloads(props: { role: string }) {
  const [initializing, setInitializing] = useState(true)
  const [studentsList, setStudentsList] = useState([] as Array<any>)
  const [studentsObj, setStudentsObj] = useState({} as any)
  const [type, setType] = useState('transcripts')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [classes, setClasses] = useState([] as Array<string>)
  const [excludedNames, setExcludedNames] = useState([] as Array<string>)
  const [totalStudents, setTotalStudents] = useState(0)
  const [studentsExist, setStudentsExist] = useState(false)
  const completedStudents = useTrait(0)
  const params = useParams()

  const initialize = async () => {
    if (props.role === 'admin') {
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
      for (let i = 0; i < classes.length; i += 1) {
        const res = await fetch(`${host}/${classes[i].class}/people/student`, {
          // @ts-expect-error TS BEING DUMB
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
          },
          credentials: 'include'
        })
        const students = (await res.json()).map((student: any) => ({
          id: student.id,
          name: student.name,
          selected: true
        }))
        allClassesStudents[classes[i].class] = students
      }
      setStudentsExist(
        Object.keys(allClassesStudents).some(
          (cl: string) => allClassesStudents[cl].length > 0
        )
      )
      setStudentsObj(allClassesStudents)
      // // console.log(allClassesStudents)
    } else {
      // not in admin mode, get students list for that class
      const res = await fetch(`${host}/${params.section}/people/student`, {
        // @ts-expect-error TS BEING DUMB
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
      const students = (await res.json()).map((student: any) => ({
        id: student.id,
        name: student.name,
        selected: true
      }))
      setStudentsExist(students.length > 0)
      setStudentsList(students)
      // // console.log(students)
    }
    setInitializing(false)
  }

  const generateClassFiles = async (
    zip: JSZip,
    studentData: any,
    type: string
  ) => {
    // // console.log(studentData)
    const meta: any = { class: studentData.class, day: studentData.day }
    if (type !== 'transcripts') {
      meta.from = studentData.from
      meta.to = studentData.to
    }
    for (let i = 0; i < studentData.students.length; i += 1) {
      const student = studentData.students[i]
      // // console.log('Working on student:', student.name)
      const doc =
        type === 'transcripts' ? (
          <TranscriptDocument report={{ ...meta, student }} />
        ) : (
          <EngagementDocument report={{ ...meta, student }} />
        )
      const asPdf = pdf(doc) // {} is important, throws without an argument
      const blob = await asPdf.toBlob()
      zip.file(`${student.id}-${student.name}.pdf`, blob)
      completedStudents.set(completedStudents.get() + 1)
      // // console.log(completedStudents.get())
    }
  }

  const computeTotalStudents = (values: any) => {
    if (props.role === 'admin') {
      let n = 0
      // console.log(values)
      classes.forEach((cl: string) => {
        n += values[cl].filter((student: any) => student.selected).length
      })
      setTotalStudents(n)
    } else {
      setTotalStudents(
        values.students.filter((student: any) => student.selected).length
      )
    }
  }

  const fetchData = async (values: any) => {
    // // console.log(values)
    completedStudents.set(0)
    setExcludedNames([])
    setLoaded(false)
    computeTotalStudents(values)
    const reqParams: any = {}
    if (values.from) {
      reqParams.from = values.from.format('YYYY-MM-DD')
    }
    if (values.to) {
      reqParams.to = values.to.format('YYYY-MM-DD')
    }

    if (props.role === 'admin') {
      if (
        classes.some((cl: string) =>
          values[cl].some((student: any) => student.selected)
        )
      ) {
        // // console.log('At least one student is selected.')
        setLoading(true)
        const newExcludedStudents: Array<string> = []
        const downloadFolder = new JSZip()
        for (let i = 0; i < classes.length; i += 1) {
          const cl = classes[i]
          if (values[cl].some((student: any) => student.selected)) {
            // // console.log('Results for class:', cl)
            const url = `${host}/${cl}/reports/student?`
            const res = await fetch(url + new URLSearchParams(reqParams), {
              // @ts-expect-error TS BEING DUMB
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
              },
              credentials: 'include'
            })
            if (res.status === 200) {
              const reports = await res.json()
              // console.log('Reports:', reports)
              delete reports.marks
              reports.students = reports.students
                .filter((student: any) => {
                  const selectedStudent: any = values[cl].find(
                    (ss: any) => ss.id === student.id
                  )
                  return (
                    (selectedStudent?.selected ?? false) &&
                    (values.type !== 'transcripts' || student.marks.length > 0)
                  )
                })
                .map((student: any) => {
                  student.key = student.id
                  return student
                })
              for (let j = 0; j < values[cl].length; j += 1) {
                const selectedStudent = values[cl][j]
                if (
                  selectedStudent.selected &&
                  !reports.students.some(
                    (reportStudent: any) =>
                      reportStudent.id === selectedStudent.id
                  )
                ) {
                  newExcludedStudents.push(selectedStudent.name)
                  completedStudents.set(completedStudents.get() + 1)
                }
              }
              const classFolder = downloadFolder.folder(cl.toUpperCase())
              await generateClassFiles(classFolder!, reports, values.type)
            } else {
              messageApi.error(
                'An error occurred when generating the files. Please report this error.'
              )
              return
            }
          }
        }
        const downloadBlob = await downloadFolder.generateAsync({
          type: 'blob'
        })
        setLoading(false)
        setLoaded(true)
        setExcludedNames(newExcludedStudents)
        if (newExcludedStudents.length !== totalStudents) {
          const filename =
            values.type === 'transcripts'
              ? 'Transcripts'
              : 'Student Engagement Reports'
          saveAs(downloadBlob, `${filename}.zip`)
        }
      } else {
        messageApi.error(
          'No students are selected. Please select at least one student.'
        )
        return
      }
    } else {
      if (values.students.some((student: any) => student.selected)) {
        setLoading(true)
        const url = `${host}/${params.section}/reports/student?`
        const res = await fetch(url + new URLSearchParams(reqParams), {
          // @ts-expect-error TS BEING DUMB
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
          },
          credentials: 'include'
        })
        if (res.status === 200) {
          const reports = await res.json()
          delete reports.marks
          reports.students = reports.students
            .filter((student: any) => {
              const selectedStudent: any = values.students.find(
                (ss: any) => ss.id === student.id
              )
              return (
                (selectedStudent?.selected ?? false) &&
                (values.type !== 'transcripts' || student.marks.length > 0)
              )
            })
            .map((student: any) => {
              student.key = student.id
              return student
            })
          const newExcludedStudents: Array<string> = []
          for (let j = 0; j < values.students.length; j += 1) {
            const selectedStudent = values.students[j]
            if (
              selectedStudent.selected &&
              !reports.students.some(
                (reportStudent: any) => reportStudent.id === selectedStudent.id
              )
            ) {
              newExcludedStudents.push(selectedStudent.name)
              completedStudents.set(completedStudents.get() + 1)
            }
          }
          setExcludedNames(newExcludedStudents)
          const downloadFolder = new JSZip()
          await generateClassFiles(downloadFolder, reports, values.type)
          const downloadBlob = await downloadFolder.generateAsync({
            type: 'blob'
          })
          setLoading(false)
          setLoaded(true)
          if (newExcludedStudents.length < totalStudents) {
            const filename =
              values.type === 'transcripts'
                ? 'Transcripts'
                : 'Student Engagement Reports'
            saveAs(downloadBlob, `${filename}.zip`)
          }
        } else {
          messageApi.error(
            'An error occurred when generating the files. Please report this error.'
          )
        }
      } else {
        messageApi.error(
          'No students are selected. Please select at least one student.'
        )
        return
      }
    }
  }

  const toggleAllSelected = (value: boolean) => {
    if (props.role === 'admin') {
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
    } else {
      const newList = studentsList.map((student: any) => {
        student.selected = value
        return student
      })
      setStudentsList(newList)
      form.setFieldValue('students', newList)
    }
  }

  const toggleClassSelected = (cl: string, value: boolean) => {
    const newList = studentsObj[cl].map((student: any) => {
      student.selected = value
      return student
    })
    setStudentsObj({ ...studentsObj, [cl]: newList })
    form.setFieldValue(cl, newList)
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
    <div className="mx-4 mt-4 flex flex-col">
      {contextHolder}
      <Flex align="center">
        <h2 className="m-0">Downloads</h2>
        <Button
          size="large"
          loading={loading}
          type="primary"
          htmlType="submit"
          onClick={() => form.submit()}
          className="ml-auto"
          icon={<DownloadOutlined />}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </Flex>
      {loading && (
        <Alert
          className="mt-4"
          type="info"
          message="Downloading your files..."
          description={
            <div>
              <span>
                Please wait as this may take a while, especially if you have
                selected many students.
              </span>
              <br />
              <span>
                Completed {completedStudents.get()} out of {totalStudents}{' '}
                students.
              </span>
            </div>
          }
          showIcon
        />
      )}
      {loaded && excludedNames.length === totalStudents && (
        <Alert
          className="mt-4"
          type="warning"
          message="Warning!"
          description={
            <div>
              <span>
                Your files could not be downloaded because there{' '}
                {type === 'transcripts'
                  ? 'were no marks present for any student.'
                  : 'was no data for any selected student in the selected dates.'}
                .
              </span>{' '}
            </div>
          }
          showIcon
        />
      )}
      {loaded && excludedNames.length < totalStudents && (
        <Alert
          className="mt-4"
          type="success"
          message="Success!"
          description={
            <div>
              <span>
                Your files were successfully generated. They will be downloaded
                as a zipped folder.
              </span>{' '}
              {excludedNames.length > 0 && (
                <>
                  <span>
                    The following students files files were not included in the
                    downloads because{' '}
                    {type === 'transcripts'
                      ? 'no marks were present for them'
                      : 'no data was present for them in the selected dates'}
                    :
                  </span>
                  <ul className="my-0">
                    {excludedNames.map((name: string) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          }
          showIcon
        />
      )}
      <Form
        className="my-4"
        id="downloads"
        layout="horizontal"
        form={form}
        size="large"
        onFinish={fetchData}
        autoComplete="off"
        disabled={loading}
        initialValues={{
          ...studentsObj,
          type: 'transcripts',
          students: studentsList
        }}
      >
        <Space
          direction="horizontal"
          size="large"
          className="flex-wrap gap-y-1"
        >
          <Form.Item
            label="What would you like to download?"
            name="type"
            className="w-80"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Select
              options={[
                { value: 'transcripts', label: 'Transcripts' },
                {
                  value: 'student engagement reports',
                  label: 'Student Engagement Reports'
                }
              ]}
              onChange={(val: string) => setType(val)}
            />
          </Form.Item>
          {type !== 'transcripts' && (
            <>
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
            </>
          )}
        </Space>
        <Flex align="center">
          <h3 className="m-0">Students To Include</h3>
          <Button
            onClick={() => toggleAllSelected(true)}
            className="ml-auto"
            type="primary"
            disabled={loading}
          >
            Select All
          </Button>
          <Button
            onClick={() => toggleAllSelected(false)}
            className="ml-2"
            type="primary"
            disabled={loading}
          >
            Clear All
          </Button>
        </Flex>
        {props.role === 'admin' && (
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
                    disabled={loading}
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleClassSelected(cl, false)
                    }}
                    className="ml-2"
                    type="primary"
                    disabled={loading}
                  >
                    Clear All
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
        )}
        {props.role !== 'admin' && (
          <Form.List name="students">
            {(fields: any[]) => (
              <Flex className="mt-4" gap={8} wrap>
                {fields.map((field: { key: any; name: any }, index: number) => (
                  <Form.Item
                    key={studentsList[index].id}
                    name={[field.name, 'selected']}
                    valuePropName="checked"
                    className="m-0 w-52 max-w-full"
                  >
                    <Checkbox>{studentsList[index].name}</Checkbox>
                  </Form.Item>
                ))}
              </Flex>
            )}
          </Form.List>
        )}
      </Form>
    </div>
  )
}
