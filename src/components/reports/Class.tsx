/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Collapse,
  CollapseProps,
  Descriptions,
  Flex,
  Table,
  TableProps,
  Tabs
} from 'antd'
import { compareString, compareRecords } from 'utils'
import LatePenalty from './LatePenalty'

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
  marks: string | Array<string>
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
      <Descriptions.Item label="Percent Attendance (with late penalty penalty)">
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
    <div>
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
        <Descriptions.Item label="Percent Attendance (with late penalty)">
          {props.student.percentAttendanceWithPenalty}
        </Descriptions.Item>
        <Descriptions.Item label="Average Minutes Late">
          {props.student.averageMinutesLate}
        </Descriptions.Item>
        <Descriptions.Item label="Total Ayaat Recited">
          {props.student.totalAyahs}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 3 }}>
        <Descriptions.Item label="Course Marks">
          {Array.isArray(props.student.marks)
            ? props.student.marks.join(', ')
            : props.student.marks}
        </Descriptions.Item>
      </Descriptions>
    </div>
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
      fixed: 'left'
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      sorter: (a: any, b: any) =>
        compareString(a.name.toLowerCase(), b.name.toLowerCase()),
      fixed: 'left'
    },
    {
      title: 'Percent Attendance',
      dataIndex: 'percentAttendanceWithoutPenalty',
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithoutPenalty')
    },
    {
      title: 'Percent Attendance (with late penalty)',
      dataIndex: 'percentAttendanceWithPenalty',
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
      fixed: 'left',
      width: 150
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.name}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareString(a.name.toLowerCase(), b.name.toLowerCase()),
      fixed: 'left',
      width: 150
    },
    {
      title: 'Classes Attended',
      dataIndex: 'classesAttended',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.classesAttended}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'classesAttended'),
      width: 150
    },
    {
      title: 'Percent Attendance',
      dataIndex: 'percentAttendanceWithoutPenalty',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.percentAttendanceWithoutPenalty}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithoutPenalty'),
      width: 150
    },
    {
      title: 'Percent Attendance (with late penalty)',
      dataIndex: 'percentAttendanceWithPenalty',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.percentAttendanceWithPenalty}
          </span>
        )
      },
      sorter: (a: any, b: any) =>
        compareRecords(a, b, 'percentAttendanceWithPenalty'),
      width: 150
    },
    {
      title: 'Average Minutes Late',
      dataIndex: 'averageMinutesLate',
      render: (_: any, student: StudentType) => {
        return (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.averageMinutesLate}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate'),
      width: 150
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
      sorter: (a: any, b: any) => compareRecords(a, b, 'totalAyahs'),
      width: 150
    },
    {
      title: 'Course Marks',
      dataIndex: 'marks',
      render: (_: any, student: StudentType) => {
        return student.marks === 'Not Available' ? (
          <span className={student.id === '' ? 'font-bold' : ''}>
            {student.marks}
          </span>
        ) : (
          <Flex vertical>
            {(student.marks as Array<string>).map((mark) => (
              <span key={mark} className={student.id === '' ? 'font-bold' : ''}>
                {mark}
              </span>
            ))}
          </Flex>
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
        <>
          <LatePenalty className="mb-4" />
          <Collapse
            className="my-2"
            items={props.report.teachersList}
            defaultActiveKey={[]}
          />
        </>
      )
    },
    {
      key: '3',
      label: 'Students',
      children: (
        <>
          <LatePenalty className="mb-4" />
          <Collapse
            className="my-2"
            items={props.report.studentsList}
            defaultActiveKey={[]}
          />
        </>
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
                  className="mt-2"
                  columns={coverageColumns}
                  dataSource={props.report.coverageTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
                  scroll={{ x: true }}
                />
                <LatePenalty className="mt-4" />
                <Table
                  bordered
                  title={() => <h4 className="m-0">Teachers</h4>}
                  className="mt-4"
                  columns={teacherColumns}
                  dataSource={props.report.teachersTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
                  scroll={{ x: true }}
                />
                <Table
                  bordered
                  title={() => <h4 className="m-0">Students</h4>}
                  className="my-4"
                  columns={studentColumns}
                  dataSource={props.report.studentsTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
                  scroll={{ x: 1500, y: 500 }}
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
