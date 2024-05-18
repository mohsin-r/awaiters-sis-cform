import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Table, Space, Typography, Popconfirm } from 'antd'
import type { TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { compareString, getCookie, host } from 'utils'

interface DataType {
  key: string
  date: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Cform() {
  const params = useParams()
  const navigate = useNavigate()
  const [dates, setDates] = useState([] as DataType[])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '30%',
      defaultSortOrder: 'descend',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        compareString(a.date.toLowerCase(), b.date.toLowerCase())
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/c-form/view/${record.date}`)
            }}
          >
            View
          </Typography.Link>
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/c-form/edit/${record.date}`)
            }}
          >
            Edit
          </Typography.Link>
          <Popconfirm
            title="Are you sure you want to remove the entry?"
            onConfirm={() => remove(record.date)}
            disabled={deleting}
          >
            <Typography.Link type="danger" disabled={deleting}>
              Delete
            </Typography.Link>
          </Popconfirm>
        </Space>
      )
    }
  ]

  useEffect(() => {
    setLoading(true)
    fetch(`${host}/${params.section}/dates`, {
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
          setDates(
            json.map((date: string) => {
              return { date: date, key: date }
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

  const remove = async (date: string) => {
    const index = dates.findIndex((d) => d.date === date)
    if (index !== -1) {
      const datesCopy = [...dates]
      datesCopy.splice(index, 1)
      setDates(datesCopy)
      setDeleting(true)
      await fetch(`${host}/${params.section}/coverage`, {
        method: 'delete',
        body: JSON.stringify({
          date: date
        }),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
      await fetch(`${host}/${params.section}/progress`, {
        method: 'delete',
        body: JSON.stringify({
          date: date
        }),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
      setDeleting(false)
    }
  }
  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">C-Form Entries</h2>
        <Button
          className="ml-auto"
          type="primary"
          onClick={() => {
            navigate(`/${params.section}/c-form/new`)
          }}
        >
          <PlusOutlined />
          Add entry
        </Button>
      </div>
      <Table
        bordered
        className="mt-4 overflow-x-scroll"
        columns={columns}
        dataSource={dates}
        loading={loading}
        pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
      />
    </div>
  )
}

export default Cform
