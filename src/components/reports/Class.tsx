/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Collapse,
  CollapseProps,
  Descriptions,
  Table,
  TableProps,
  Tabs
} from 'antd'
import { compareString, compareRecords } from 'utils'

interface CoverageType {
  subject: string
  from: string
  to: string
}
interface TeacherType {
  id: string
  name: string
  percentAttendanceWithoutPenalty: number
  percentAttendanceWithPenalty: number
  averageMinutesLate: number
}
interface StudentType {
  id: string
  name: string
  percentAttendanceWithoutPenalty: number
  percentAttendanceWithPenalty: number
  averageMinutesLate: number
  classesAttended: number
  totalAyahs: number
}

export function CoveragePanel(props: { coverage: CoverageType }) {
  return (
    <Descriptions column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}>
      <Descriptions.Item label="Subject">
        {props.coverage.subject}
      </Descriptions.Item>
      <Descriptions.Item label="Start">{props.coverage.from}</Descriptions.Item>
      <Descriptions.Item label="End">{props.coverage.to}</Descriptions.Item>
    </Descriptions>
  )
}

export function TeacherPanel(props: { teacher: TeacherType }) {
  return (
    <Descriptions column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}>
      <Descriptions.Item label="Student ID">
        {props.teacher.id}
      </Descriptions.Item>
      <Descriptions.Item label="Full Name">
        {props.teacher.name}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance">
        {props.teacher.percentAttendanceWithoutPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance (with 10% late penaltye penalty)">
        {props.teacher.percentAttendanceWithPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Average Minutes Late">
        {props.teacher.averageMinutesLate}
      </Descriptions.Item>
    </Descriptions>
  )
}

export function StudentPanel(props: { student: StudentType }) {
  return (
    <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 3 }}>
      <Descriptions.Item label="Student ID">
        {props.student.id}
      </Descriptions.Item>
      <Descriptions.Item label="Full Name">
        {props.student.name}
      </Descriptions.Item>
      <Descriptions.Item label="Classes Attended">
        {props.student.classesAttended}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance">
        {props.student.percentAttendanceWithoutPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Percent Attendance (with 10% late penalty)">
        {props.student.percentAttendanceWithPenalty}
      </Descriptions.Item>
      <Descriptions.Item label="Average Minutes Late">
        {props.student.averageMinutesLate}
      </Descriptions.Item>
      <Descriptions.Item label="Total Ayaat Recited">
        {props.student.totalAyahs}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default function Class(props: { report: any }) {
  const coverageColumns: TableProps<CoverageType>['columns'] = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      width: '33.3%'
    },
    {
      title: 'Start',
      dataIndex: 'from',
      width: '33.3%'
    },
    {
      title: 'End',
      dataIndex: 'to'
    }
  ]
  const teacherColumns: TableProps<TeacherType>['columns'] = [
    {
      title: 'Teacher ID',
      dataIndex: 'id',
      width: '20%'
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '20%',
      sorter: (a: any, b: any) =>
        compareString(a.name.toLowerCase(), b.name.toLowerCase())
    },
    {
      title: 'Percent Attendance',
      dataIndex: 'percentAttendanceWithoutPenalty',
      width: '20%',
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithoutPenalty')
    },
    {
      title: 'Percent Attendance (with 10% late penalty)',
      dataIndex: 'percentAttendanceWithPenalty',
      width: '20%',
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithPenalty')
    },
    {
      title: 'Average Minutes Late',
      dataIndex: 'averageMinutesLate',
      sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate')
    }
  ]
  const studentColumns: TableProps<StudentType>['columns'] = [
    {
      title: 'Student ID',
      dataIndex: 'id',
      width: '14.3%'
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      width: '14.3%',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.name}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareString(a.name.toLowerCase(), b.name.toLowerCase())
    },
    {
      title: 'Classes Attended',
      dataIndex: 'classesAttended',
      width: '14.3%',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.classesAttended}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'classesAttended')
    },
    {
      title: 'Percent Attendance',
      dataIndex: 'percentAttendanceWithoutPenalty',
      width: '14.3%',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.percentAttendanceWithoutPenalty}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithoutPenalty')
    },
    {
      title: 'Percent Attendance (with 10% late penalty)',
      dataIndex: 'percentAttendanceWithPenalty',
      width: '14.3%',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.percentAttendanceWithPenalty}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithPenalty')
    },
    {
      title: 'Average Minutes Late',
      dataIndex: 'averageMinutesLate',
      width: '14.3%',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.averageMinutesLate}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate')
    },
    {
      title: 'Total Ayaat Recited',
      dataIndex: 'totalAyahs',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.totalAyahs}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'totalAyahs')
    }
  ]
  const collapseItems: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Syllabus Coverage',
      children: (
        <Collapse
          className="my-2"
          items={props.report.coverageList}
          defaultActiveKey={[]}
        />
      )
    },
    {
      key: '2',
      label: 'Teachers',
      children: (
        <Collapse
          className="my-2"
          items={props.report.teachersList}
          defaultActiveKey={[]}
        />
      )
    },
    {
      key: '3',
      label: 'Students',
      children: (
        <Collapse
          className="my-2"
          items={props.report.studentsList}
          defaultActiveKey={[]}
        />
      )
    }
  ]
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
        <Descriptions.Item label="Number of Classes Expected">
          {props.report.sessionsExpected}
        </Descriptions.Item>
        <Descriptions.Item label="Number of Classes Conducted">
          {props.report.sessionsConducted}
        </Descriptions.Item>
        <Descriptions.Item label="Percent Conducted">
          {props.report.percentConducted}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: 'Table View',
            key: '1',
            children: (
              <>
                <Table
                  bordered
                  title={() => <h4 className="m-0">Syllabus Coverage</h4>}
                  className="mt-2 overflow-x-scroll"
                  columns={coverageColumns}
                  dataSource={props.report.coverageTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
                />
                <Table
                  bordered
                  title={() => <h4 className="m-0">Teachers</h4>}
                  className="mt-2 overflow-x-scroll"
                  columns={teacherColumns}
                  dataSource={props.report.teachersTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
                />
                <Table
                  bordered
                  title={() => <h4 className="m-0">Students</h4>}
                  className="my-2 overflow-x-scroll"
                  columns={studentColumns}
                  dataSource={props.report.studentsTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
                />
              </>
            )
          },
          {
            label: 'List View',
            key: '2',
            children: <Collapse className="my-2" items={collapseItems} />
          }
        ]}
      />
    </div>
  )
}
