/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AddStudent from 'components/AddStudent'
import React, { useState, useEffect } from 'react'
import { Form, Input, Popconfirm, Table, Typography } from 'antd'
import { getCookie } from 'utils'

interface Student {
  key: string
  name: string
  email: string
  phone: string
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
}) => {
  const [form] = Form.useForm()
  const [editingName, setEditingName] = useState('')
  const [usingDb, setUsingDb] = useState(false)

  const isEditing = (record: Student) => record.key === editingName

  const edit = (record: Partial<Student>) => {
    form.setFieldsValue({ name: '', email: '', phone: '', ...record })
    setEditingName(record.key!)
  }

  const remove = (record: Partial<Student>) => {
    const index = props.students.findIndex(
      (student) => student.key === record.key
    )
    if (index !== -1) {
      const studentsCopy = [...props.students]
      studentsCopy.splice(index, 1)
      const host = 'https://awaiters-sis-cform-api.onrender.com'
      props.setStudents(studentsCopy)
      setUsingDb(true)
      fetch(`${host}/people`, {
        method: 'delete',
        body: JSON.stringify({
          name: record.name
        }),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      }).then((res) => {
        setUsingDb(false)
      })
    }
  }

  const cancel = () => {
    setEditingName('')
  }

  const save = async (name: React.Key) => {
    try {
      const row = (await form.validateFields()) as Student

      const newData: Student[] = [...props.students]
      const index = newData.findIndex((item) => name === item.key)
      if (index > -1) {
        const item = newData[index]
        row.key = row.name
        newData.splice(index, 1, {
          ...item,
          ...row
        })
        props.setStudents(newData)
        setUsingDb(true)
        const host = 'https://awaiters-sis-cform-api.onrender.com'
        fetch(`${host}/people`, {
          method: 'put',
          body: JSON.stringify({
            name: name,
            newPerson: {
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
          .then((res) => {
            if (res.status === 200) {
              setUsingDb(false)
            }
          })
          .catch((error) => {
            console.log(error)
            setUsingDb(false)
          })
        setEditingName('')
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '25%',
      editable: true
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      width: '25%',
      editable: true
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      width: '25%',
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
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          defaultPageSize: 100,
          hideOnSinglePage: true
        }}
      />
    </Form>
  )
}

function Sis() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const host = 'https://awaiters-sis-cform-api.onrender.com'
    fetch(`${host}/people/student`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        }
        throw new Error()
      })
      .then((json) => {
        if (json) {
          setStudents(
            json.map((student: { key: any; name: any }) => {
              student.key = student.name
              return student
            })
          )
          setLoading(false)
        }
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [])
  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">Students</h2>
        <AddStudent students={students} setStudents={setStudents} />
      </div>
      <StudentTable
        loading={loading}
        students={students}
        setStudents={setStudents}
      />
    </div>
  )
}

export default Sis
