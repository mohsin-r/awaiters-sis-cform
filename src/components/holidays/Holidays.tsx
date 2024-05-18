/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { DatePicker, Form, Input, Popconfirm, Table, Typography } from 'antd'
import { compareString, host } from 'utils'
import AddHoliday from 'components/holidays/AddHoliday'
import dayjs from 'dayjs'

type Holiday = {
  key: string
  date: string
  description: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  sorter: Function
  defaultSortOrder: string
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: string
  record: Holiday
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
  const inputNode = dataIndex === 'date' ? <DatePicker /> : <Input />

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={
            dataIndex === 'date'
              ? [
                  {
                    required: true,
                    message: `${title} is required.`
                  },
                  {
                    message: 'This date is already assigned as a holiday.',
                    validator: async (_, value) => {
                      if (
                        value.format('YYYY-MM-DD') === record.date ||
                        value === ''
                      ) {
                        return Promise.resolve()
                      }
                      const res = await fetch(
                        `${host}/holidays/${value.format('YYYY-MM-DD')}`,
                        {
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          credentials: 'include'
                        }
                      )
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

const HolidaysTable = (props: {
  holidays: Array<Holiday>
  setHolidays: any
  loading: boolean
}) => {
  const [form] = Form.useForm()
  const [editingName, setEditingName] = useState('')
  const [usingDb, setUsingDb] = useState(false)

  const isEditing = (record: Holiday) => record.key === editingName

  const edit = (record: Partial<Holiday>) => {
    form.setFieldsValue({
      date: dayjs(record.date, 'YYYY-MM-DD'),
      description: record.description
    })
    setEditingName(record.key!)
  }

  const remove = async (record: Partial<Holiday>) => {
    const index = props.holidays.findIndex(
      (holiday) => holiday.key === record.key
    )
    if (index !== -1) {
      const holidaysCopy = [...props.holidays]
      holidaysCopy.splice(index, 1)
      props.setHolidays(holidaysCopy)
      setUsingDb(true)
      await fetch(`${host}/holidays`, {
        method: 'delete',
        body: JSON.stringify({
          date: record.date
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      setUsingDb(false)
    }
  }

  const cancel = () => {
    setEditingName('')
  }

  const save = async (date: React.Key) => {
    try {
      const row = await form.validateFields()

      const newData: Holiday[] = [...props.holidays]
      const index = newData.findIndex((item) => date === item.key)
      if (index > -1) {
        const item = newData[index]
        row.key = row.date.format('YYYY-MM-DD')
        row.date = row.date.format('YYYY-MM-DD')
        newData.splice(index, 1, {
          ...item,
          ...row
        })
        props.setHolidays(newData)
        setUsingDb(true)
        await fetch(`${host}/holidays`, {
          method: 'put',
          body: JSON.stringify({
            date: date,
            newHoliday: {
              date: row.date,
              description: row.description
            }
          }),
          headers: {
            'Content-Type': 'application/json'
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
      title: 'Date',
      dataIndex: 'date',
      editable: true,
      defaultSortOrder: 'ascend',
      width: '30%',
      sorter: (a: any, b: any) =>
        compareString(a.date.toLowerCase(), b.date.toLowerCase())
    },
    {
      title: 'Description',
      dataIndex: 'description',
      editable: true,
      width: '30%',
      sorter: (a: any, b: any) =>
        a.description.toLowerCase() - b.description.toLowerCase()
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Holiday) => {
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
              title={`Are you sure you want to remove the holiday?`}
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
      onCell: (record: Holiday) => ({
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
        dataSource={props.holidays}
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

function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)

  const loadHolidays = async () => {
    setLoading(true)
    const res = await fetch(`${host}/holidays/all`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const json = await res.json()
    console.log(json)
    setHolidays(
      json.map((holiday: { key: any; date: any }) => {
        holiday.key = holiday.date
        return holiday
      })
    )
    setLoading(false)
  }

  useEffect(() => {
    loadHolidays()
  }, [])

  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">Holidays</h2>
        <AddHoliday holidays={holidays} setHolidays={setHolidays} />
      </div>
      <HolidaysTable
        loading={loading}
        holidays={holidays}
        setHolidays={setHolidays}
      />
    </div>
  )
}

export default Holidays
