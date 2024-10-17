import { Table } from 'antd'
import type { TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { host } from 'utils'
import AddClass from './AddClass'

interface AwClass {
  key: string
  class: string
  day: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Classes() {
  const [classes, setClasses] = useState([] as AwClass[])
  const [loading, setLoading] = useState(false)
  const columns: TableProps<AwClass>['columns'] = [
    {
      title: 'Class',
      dataIndex: 'class',
      defaultSortOrder: 'ascend',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) => {
        return Number(a.class.slice(2)) - Number(b.class.slice(2))
      }
    },
    {
      title: 'Day',
      dataIndex: 'day'
    },
    {
      title: 'Login Link',
      render: (_, cl: AwClass) => {
        return (
          <a
            href={`https://awaiters-sis-cform.netlify.app/${cl.class.toLowerCase()}/login`}
          >{`https://awaiters-sis-cform.netlify.app/${cl.class.toLowerCase()}/login`}</a>
        )
      }
    }
  ]

  useEffect(() => {
    setLoading(true)
    fetch(`${host}/classes`, {
      headers: {
        'Content-Type': 'application/json'
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
          setClasses(
            json.map((cl: { class: string; day: string }) => {
              return {
                class: cl.class.toUpperCase(),
                key: cl.class,
                day: cl.day
              }
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
        <h2 className="m-0">Classes</h2>
        <AddClass classes={classes} setClasses={setClasses} />
      </div>
      <Table
        bordered
        className="mt-4"
        columns={columns}
        dataSource={classes}
        loading={loading}
        pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
      />
    </div>
  )
}

export default Classes
