/* eslint-disable @typescript-eslint/no-explicit-any */
import AddStudent from 'components/AddStudent'
import React, { useState, useEffect } from 'react'
import { Form, Input, Popconfirm, Table, Typography } from 'antd'
import { compareString, getCookie, host } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'

interface Student {
  key: string
  id: string
  name: string
  email: string
  phone: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  sorter: Function
  defaultSortOrder: string
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: string
  record: Student
  index: number
  children: React.ReactNode
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input />

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={
            dataIndex === 'name'
              ? [
                  {
                    required: true,
                    message: `${title} is required.`
                  }
                ]
              : dataIndex === 'id'
                ? [
                    {
                      required: true,
                      message: `${title} is required.`
                    },
                    {
                      message: 'Student ID is assigned to another student.',
                      validator: async (_, value) => {
                        if (value === record.id || value === '') {
                          return Promise.resolve()
                        }
                        const res = await fetch(`${host}/person/${value}`, {
                          // @ts-expect-error TS BEING DUMB
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCookie('csrf_access_token')
                          },
                          credentials: 'include'
                        })
                        if (res.ok) {
                          return Promise.reject()
                        }
                        return Promise.resolve()
                      }
                    }
                  ]
                : []
          }
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}

const StudentTable = (props: {
  students: Student[]
  setStudents: any
  loading: boolean
  setSection: any
}) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const params = useParams()
  const [editingName, setEditingName] = useState('')
  const [usingDb, setUsingDb] = useState(false)

  const isEditing = (record: Student) => record.key === editingName

  const edit = (record: Partial<Student>) => {
    form.setFieldsValue({ id: '', name: '', email: '', phone: '', ...record })
    setEditingName(record.key!)
  }

  const remove = async (record: Partial<Student>) => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    const index = props.students.findIndex(
      (student) => student.key === record.key
    )
    if (index !== -1) {
      const studentsCopy = [...props.students]
      studentsCopy.splice(index, 1)
      props.setStudents(studentsCopy)
      setUsingDb(true)
      await fetch(`${host}/people`, {
        method: 'delete',
        body: JSON.stringify({
          id: record.id
        }),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
      setUsingDb(false)
    }
  }

  const cancel = () => {
    setEditingName('')
  }

  const save = async (id: React.Key) => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    try {
      const row = (await form.validateFields()) as Student

      const newData: Student[] = [...props.students]
      const index = newData.findIndex((item) => id === item.key)
      if (index > -1) {
        const item = newData[index]
        row.key = row.id
        newData.splice(index, 1, {
          ...item,
          ...row
        })
        props.setStudents(newData)
        setUsingDb(true)
        await fetch(`${host}/people`, {
          method: 'put',
          body: JSON.stringify({
            id: id,
            newPerson: {
              id: row.id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              type: 'student'
            }
          }),
          // @ts-expect-error bad TS
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
          },
          credentials: 'include'
        })
        setUsingDb(false)
        setEditingName('')
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'id',
      width: '20%',
      editable: true,
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) =>
        compareString(a.id.toLowerCase(), b.id.toLowerCase())
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '20%',
      editable: true,
      sorter: (a: any, b: any) => a.name.toLowerCase() - b.name.toLowerCase()
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      width: '20%',
      editable: true
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      width: '20%',
      editable: true
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Student) => {
        const editable = isEditing(record)
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Typography.Link type="danger" onClick={cancel}>
              Cancel
            </Typography.Link>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingName !== '' || usingDb}
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
            >
              Edit
            </Typography.Link>
            <Popconfirm
              title="Are you sure you want to remove the student?"
              onConfirm={() => remove(record)}
              disabled={editingName !== '' || usingDb}
            >
              <Typography.Link
                disabled={editingName !== '' || usingDb}
                type="danger"
              >
                Delete
              </Typography.Link>
            </Popconfirm>
          </span>
        )
      }
    }
  ]

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: Student) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  return (
    <Form form={form} component={false}>
      <Table
        loading={props.loading}
        className="mt-4"
        components={{
          body: {
            cell: EditableCell
          }
        }}
        bordered
        dataSource={props.students}
        columns={mergedColumns as any}
        rowClassName="editable-row"
        pagination={{
          defaultPageSize: 10,
          hideOnSinglePage: true
        }}
      />
    </Form>
  )
}

function Sis(props: any) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const navigate = useNavigate()

  const loadStudents = async () => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    setLoading(true)
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
      json.map((student: { key: any; id: any }) => {
        student.key = student.id
        return student
      })
    )
    setLoading(false)
  }
  useEffect(() => {
    loadStudents()
  }, [])
  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">Students</h2>
        <AddStudent
          students={students}
          setStudents={setStudents}
          setSection={props.setSection}
        />
      </div>
      <StudentTable
        setSection={props.setSection}
        loading={loading}
        students={students}
        setStudents={setStudents}
      />
    </div>
  )
}

export default Sis
