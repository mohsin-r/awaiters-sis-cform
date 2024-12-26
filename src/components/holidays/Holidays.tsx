/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Popconfirm, Table, Typography } from 'antd'
import { compareString, host } from 'utils'
import HolidayEditor from 'components/holidays/HolidayEditor'
type Holiday = {
  key: string
  holidayId: number
  startDate: string
  endDate: string
  description: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  sorter: Function
  defaultSortOrder: string
}

const HolidaysTable = (props: {
  holidays: Array<Holiday>
  setHolidays: any
  loading: boolean
}) => {
  const [usingDb, setUsingDb] = useState(false)

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
          id: record.holidayId
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      setUsingDb(false)
    }
  }

  const columns = [
    {
      title: 'Date(s)',
      defaultSortOrder: 'descend',
      width: '30%',
      sorter: (a: Holiday, b: Holiday) =>
        compareString(a.startDate.toLowerCase(), b.startDate.toLowerCase()),
      render: (_: any, record: Holiday) => (
        <>
          {record.startDate === record.endDate
            ? record.startDate
            : `${record.startDate} to ${record.endDate}`}
        </>
      )
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
      render: (_: any, record: Holiday) => (
        <span>
          <HolidayEditor
            disabled={usingDb}
            mode="edit"
            holidays={props.holidays}
            setHolidays={props.setHolidays}
            editingHoliday={record}
          />
          <Popconfirm
            title={`Are you sure you want to remove the holiday?`}
            onConfirm={() => remove(record)}
            disabled={usingDb}
          >
            <Typography.Link disabled={usingDb} type="danger">
              Delete
            </Typography.Link>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <Table
      loading={props.loading}
      className="mt-4"
      bordered
      dataSource={props.holidays}
      columns={columns as Array<any>}
      pagination={{
        defaultPageSize: 10,
        hideOnSinglePage: true
      }}
    />
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
    setHolidays(
      json.map((holiday: any) => {
        holiday.key = holiday.id
        holiday.holidayId = holiday.id
        delete holiday.id
        return holiday
      })
    )
    // console.log(json)
    setLoading(false)
  }

  useEffect(() => {
    loadHolidays()
  }, [])

  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center">
        <h2 className="m-0">Holidays</h2>
        <HolidayEditor
          disabled={loading}
          mode="new"
          holidays={holidays}
          setHolidays={setHolidays}
        />
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
