/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collapse, Descriptions, Table, TableProps, Tabs } from 'antd'
import { compareRecords, compareString } from 'utils'

interface StudentType {
  id: string
  name: string
  classesAttended: number
  percentAttendanceWithoutPenalty: number
  percentAttendanceWithPenalty: number
  averageMinutesLate: number
  totalAyahs: number
  classesLate: number
  percentClassesLate: number
  averageAyahs: number
}

const studentColumns: TableProps<StudentType>['columns'] = [
  {
    title: 'Student ID',
    dataIndex: 'id'
  },
  {
    title: 'Full Name',
    dataIndex: 'name',
    sorter: (a: any, b: any) =>
      compareString(a.name.toLowerCase(), b.name.toLowerCase())
  },
  {
    title: 'Classes Attended',
    dataIndex: 'classesAttended',
    sorter: (a: any, b: any) => compareRecords(a, b, 'classesAttended')
  },
  {
    title: 'Percent Attendance',
    dataIndex: 'percentAttendanceWithoutPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'percentAttendanceWithoutPenalty')
  },
  {
    title: 'Percent Attendance (with penalty)',
    dataIndex: 'percentAttendanceWithPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'percentAttendanceWithPenalty')
  },
  {
    title: 'Classes Late',
    dataIndex: 'classesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'classesLate')
  },
  {
    title: 'Percent Classes Late',
    dataIndex: 'percentClassesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'percentClassesLate')
  },
  {
    title: 'Average Minutes Late',
    dataIndex: 'averageMinutesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate')
  },
  {
    title: 'Total Ayaat Recited',
    dataIndex: 'totalAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'totalAyahs')
  },
  {
    title: 'Average Weekly Ayaat Recited',
    dataIndex: 'averageAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageAyahs')
  }
]

export function DetailedStudentPanel(props: { report: StudentType }) {
  return (
    <Descriptions column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}>
      <Descriptions.Item label="Student ID">
        {props.report.id}
      </Descriptions.Item>
      <Descriptions.Item label="Full Name">
        {props.report.name}
      </Descriptions.Item>
      <Descriptions.Item label="Classes Attended">
        {props.report.classesAttended}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance">
        {props.report.percentAttendanceWithoutPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance (with penalty)">
        {props.report.percentAttendanceWithPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Classes Late">
        {props.report.classesLate}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Classes Late">
        {props.report.percentClassesLate}
      </Descriptions.Item>
      <Descriptions.Item label="Average Minutes Late">
        {props.report.averageMinutesLate}
      </Descriptions.Item>
      <Descriptions.Item label="Total Ayaat Recited">
        {props.report.totalAyahs}
      </Descriptions.Item>
      <Descriptions.Item label="Average Weekly Ayaat Recited">
        {props.report.averageAyahs}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default function Student(props: { report: any }) {
  return (
    <div className="flex flex-col">
      <Descriptions>
        <Descriptions.Item label="Date From">
          {props.report.from}
        </Descriptions.Item>
        <Descriptions.Item label="Date To">{props.report.to}</Descriptions.Item>
        <Descriptions.Item label="Class Number">
          {props.report.class.toUpperCase()}
        </Descriptions.Item>
        <Descriptions.Item label="Class Day">
          {props.report.day}
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
                columns={studentColumns}
                dataSource={props.report.studentsTable}
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
                items={props.report.studentsList}
                defaultActiveKey={[]}
              />
            )
          }
        ]}
      />
    </div>
  )
}
