/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collapse, Descriptions, Table, TableProps, Tabs } from 'antd'
import { compareRecords } from 'utils'

export function ClassPanel(props: { cl: ClassType }) {
  return (
    <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}>
      <Descriptions.Item label="Class Number">
        {props.cl.class.toUpperCase()}
      </Descriptions.Item>
      <Descriptions.Item label="Class Day">{props.cl.day}</Descriptions.Item>
      <Descriptions.Item label="Number of Students">
        {props.cl.numberOfStudents}
      </Descriptions.Item>
      <Descriptions.Item label="Number of Classes Expected">
        {props.cl.sessionsExpected}
      </Descriptions.Item>
      <Descriptions.Item label="Number of Classes Conducted">
        {props.cl.sessionsConducted}
      </Descriptions.Item>
      <Descriptions.Item label="Average Percent Attendance">
        {props.cl.averagePercentAttendanceWithoutPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Average Percent Attendance (with 10% late penalty)">
        {props.cl.averagePercentAttendanceWithPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Average Minutes Late">
        {props.cl.averageMinutesLate}
      </Descriptions.Item>
      <Descriptions.Item label="Average Weekly Ayaat Recited">
        {props.cl.averageAyahs}
      </Descriptions.Item>
    </Descriptions>
  )
}

interface ClassType {
  class: string
  day: string
  numberOfStudents: number
  sessionsExpected: number
  sessionsConducted: number
  averagePercentAttendanceWithoutPenalty: number
  averagePercentAttendanceWithPenalty: number
  averageMinutesLate: number
  averageAyahs: number
}

const classColumns: TableProps<ClassType>['columns'] = [
  {
    title: 'Class Number',
    dataIndex: 'class',
    render: (_: any, cl: ClassType) => {
      return <span>{cl.class.toUpperCase()}</span>
    }
  },
  {
    title: 'Class Day',
    dataIndex: 'day'
  },
  {
    title: 'Number of Students',
    dataIndex: 'numberOfStudents',
    sorter: (a: any, b: any) => compareRecords(a, b, 'numberOfStudents')
  },
  {
    title: 'Number of Classes Expected',
    dataIndex: 'sessionsExpected',
    sorter: (a: any, b: any) => compareRecords(a, b, 'sessionsExpected')
  },
  {
    title: 'Number of Classes Conducted',
    dataIndex: 'sessionsConducted',
    sorter: (a: any, b: any) => compareRecords(a, b, 'sessionsConducted')
  },
  {
    title: 'Average Percent Attendance',
    dataIndex: 'averagePercentAttendanceWithoutPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'averagePercentAttendanceWithoutPenalty')
  },
  {
    title: 'Average Percent Attendance (with 10% late penalty)',
    dataIndex: 'averagePercentAttendanceWithPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'averagePercentAttendanceWithPenalty')
  },
  {
    title: 'Average Minutes Late',
    dataIndex: 'averageMinutesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate')
  },
  {
    title: 'Average Weekly Ayaat Recited',
    dataIndex: 'averageAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageAyahs')
  }
]
export default function Class(props: { report: any }) {
  return (
    <div className="flex flex-col">
      <Descriptions>
        <Descriptions.Item label="Date From">
          {props.report.from}
        </Descriptions.Item>
        <Descriptions.Item label="Date To">{props.report.to}</Descriptions.Item>
        <Descriptions.Item label="Number of Classes">
          {props.report.numberOfClasses}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: 'Table View',
            key: '1',
            children: (
              <Table
                bordered
                className="my-2 overflow-x-scroll"
                columns={classColumns}
                dataSource={props.report.classesTable}
                pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
              />
            )
          },
          {
            label: 'List View',
            key: '2',
            children: (
              <Collapse
                className="my-2"
                items={props.report.classesList}
                defaultActiveKey={[]}
              />
            )
          }
        ]}
      />
    </div>
  )
}
