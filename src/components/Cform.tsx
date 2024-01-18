import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Table, Space, Typography, Popconfirm } from 'antd'
import type { TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { getCookie } from 'utils'

interface DataType {
  key: string
  date: string
}

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
      width: '30%'
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/cform/view/${record.date}`)
            }}
          >
            View
          </Typography.Link>
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/cform/edit/${record.date}`)
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
    const host = import.meta.env.VITE_API_HOST
    fetch(`${host}/dates`, {
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
      const host = import.meta.env.VITE_API_HOST
      setDates(datesCopy)
      setDeleting(true)
      await fetch(`${host}/coverage`, {
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
      await fetch(`${host}/progress`, {
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
        <h2 className="m-0">CForm Entries</h2>
        <Button
          className="ml-auto"
          type="primary"
          onClick={() => {
            navigate(`/${params.section}/cform/new`)
          }}
        >
          <PlusOutlined />
          Add entry
        </Button>
      </div>
      <Table
        bordered
        className="mt-4"
        columns={columns}
        dataSource={dates}
        loading={loading}
        pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
      />
    </div>
  )
}

export default Cform