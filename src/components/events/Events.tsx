/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { compareString, getCookie, host, typeToColour } from 'utils'

export default function Events() {
  const params = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([] as any[])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const columns: Array<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        compareString(a.name.toLowerCase(), b.name.toLowerCase())
    },
    {
      title: 'Type',
      key: 'type',
      sorter: (a: any, b: any) =>
        compareString(a.type.toLowerCase(), b.type.toLowerCase()),
      render: (_: any, record: any) => (
        <Tag color={typeToColour[record.type]}>{record.type}</Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        compareString(a.date.toLowerCase(), b.date.toLowerCase())
    },
    {
      title: 'Time',
      key: 'time',
      render: (_: any, record: any) =>
        !record.start && !record.end
          ? 'Not Provided'
          : `${record.start ?? ''} to ${record.end ?? ''}`
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/event/view/${record.id}`)
            }}
          >
            View
          </Typography.Link>
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/${params.section}/event/edit/${record.id}`)
            }}
          >
            Edit
          </Typography.Link>
          <Popconfirm
            title="Are you sure you want to remove the event?"
            onConfirm={() => remove(record.id)}
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
    fetch(`${host}/events/all`, {
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
          setEvents(
            json.map((event: any) => {
              return { ...event, key: event.id }
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

  const remove = async (id: string) => {
    const index = events.findIndex((e) => e.id === id)
    if (index !== -1) {
      const eventsCopy = [...events]
      eventsCopy.splice(index, 1)
      setEvents(eventsCopy)
      setDeleting(true)
      await fetch(`${host}/events`, {
        method: 'delete',
        body: JSON.stringify({
          id
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
        <h2 className="m-0">Events</h2>
        <Button
          className="ml-auto"
          type="primary"
          onClick={() => {
            navigate(`/${params.section}/event/new`)
          }}
        >
          <PlusOutlined />
          Add event
        </Button>
      </div>
      <Table
        bordered
        className="mt-4"
        columns={columns}
        dataSource={events}
        loading={loading}
        pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
      />
    </div>
  )
}
