/* eslint-disable @typescript-eslint/no-explicit-any */
import AddPeople from 'components/helpers/AddPeople'
import TransferStudent from 'components/TransferStudent'
import React, { useState, useEffect } from 'react'
import { Form, Input, Popconfirm, Table, Typography } from 'antd'
import { compareString, getCookie, host } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'

export interface Person {
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
  record: Person
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
                      message: 'This ID is assigned to someone else.',
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

const PersonTable = (props: {
  people: Person[]
  setPeople: any
  loading: boolean
  setSection: any
  type: string
}) => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const params = useParams()
  const [editingName, setEditingName] = useState('')
  const [usingDb, setUsingDb] = useState(false)

  const isEditing = (record: Person) => record.key === editingName

  const edit = (record: Partial<Person>) => {
    form.setFieldsValue({ id: '', name: '', email: '', phone: '', ...record })
    setEditingName(record.key!)
  }

  const removeLocal = (id: string) => {
    const peopleCopy = [...props.people]
    const index = peopleCopy.findIndex((person) => person.id === id)
    peopleCopy.splice(index, 1)
    props.setPeople(peopleCopy)
  }

  const remove = async (record: Partial<Person>) => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    const index = props.people.findIndex((person) => person.key === record.key)
    if (index !== -1) {
      const peopleCopy = [...props.people]
      peopleCopy.splice(index, 1)
      props.setPeople(peopleCopy)
      setUsingDb(true)
      await fetch(`${host}/people`, {
        method: 'delete',
        body: JSON.stringify({
          id: record.id,
          type: props.type
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
      const row = (await form.validateFields()) as Person

      const newData: Person[] = [...props.people]
      const index = newData.findIndex((item) => id === item.key)
      if (index > -1) {
        const item = newData[index]
        row.key = row.id
        newData.splice(index, 1, {
          ...item,
          ...row
        })
        props.setPeople(newData)
        setUsingDb(true)
        await fetch(`${host}/people`, {
          method: 'put',
          body: JSON.stringify({
            id: id,
            newPerson: {
              id: row.id,
              name: row.name,
              email: row.email,
              phone: row.phone
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
      title: props.type === 'student' ? 'Student ID' : 'Teacher ID',
      dataIndex: 'id',
      width: '15%',
      editable: true,
      defaultSortOrder: 'ascend',
      sorter: (a: any, b: any) =>
        compareString(a.id.toLowerCase(), b.id.toLowerCase())
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '15%',
      editable: true,
      sorter: (a: any, b: any) => a.name.toLowerCase() - b.name.toLowerCase()
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      width: '15%',
      editable: true
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      width: '15%',
      editable: true
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Person) => {
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
            {props.type === 'student' && (
              <TransferStudent
                disabled={editingName !== '' || usingDb}
                name={record.name}
                id={record.id}
                setSection={props.setSection}
                remove={removeLocal}
              />
            )}
            <Popconfirm
              title={`Are you sure you want to remove the ${props.type}?`}
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
      onCell: (record: Person) => ({
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
        dataSource={props.people}
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

function People(props: any) {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const navigate = useNavigate()

  const loadPeople = async () => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    setLoading(true)
    const res = await fetch(`${host}/people/${props.type}`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    const json = await res.json()
    setPeople(
      json.map((person: { key: any; id: any }) => {
        person.key = person.id
        return person
      })
    )
    setLoading(false)
  }
  useEffect(() => {
    loadPeople()
  }, [])
  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">
          {props.type === 'student' ? 'Students' : 'Teachers'}
        </h2>
        <AddPeople
          people={people}
          setPeople={setPeople}
          setSection={props.setSection}
          type={props.type}
        />
      </div>
      <PersonTable
        setSection={props.setSection}
        loading={loading}
        people={people}
        setPeople={setPeople}
        type={props.type}
      />
    </div>
  )
}

export default People
