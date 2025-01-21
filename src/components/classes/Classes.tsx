import { Table } from 'antd'
import type { TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { compareString, host, prefixLength } from 'utils'

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
        return a.class.slice(0, prefixLength) === b.class.slice(0, prefixLength)
          ? Number(a.class.slice(prefixLength)) -
              Number(b.class.slice(prefixLength))
          : compareString(a.class, b.class)
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
            href={`https://${
              import.meta.env.VITE_GENDER === 'brothers'
                ? 'awaiters-sis-cform'
                : 'awaiters-sisters-sis'
            }.netlify.app/${cl.class.toLowerCase()}/login`}
          >{`https://${
            import.meta.env.VITE_GENDER === 'brothers'
              ? 'awaiters-sis-cform'
              : 'awaiters-sisters-sis'
          }.netlify.app/${cl.class.toLowerCase()}/login`}</a>
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
