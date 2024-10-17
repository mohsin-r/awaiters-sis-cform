/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collapse, Descriptions, Table, TableProps, Tabs } from 'antd'
import { compareRecords, compareString } from 'utils'
import LatePenalty from './LatePenalty'

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
  marks: Array<{
    course: string
    finalMark: string
    finalGrade: string
    classAverage: string
  }>
}

const studentColumns: TableProps<StudentType>['columns'] = [
  {
    title: 'Student ID',
    dataIndex: 'id',
    width: 150,
    fixed: 'left'
  },
  {
    title: 'Full Name',
    dataIndex: 'name',
    sorter: (a: any, b: any) =>
      compareString(a.name.toLowerCase(), b.name.toLowerCase()),
    width: 150,
    fixed: 'left'
  },
  {
    title: 'Classes Attended',
    dataIndex: 'classesAttended',
    sorter: (a: any, b: any) => compareRecords(a, b, 'classesAttended'),
    width: 150
  },
  {
    title: 'Percent Attendance',
    dataIndex: 'percentAttendanceWithoutPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'percentAttendanceWithoutPenalty'),
    width: 150
  },
  {
    title: 'Percent Attendance (with late penalty)',
    dataIndex: 'percentAttendanceWithPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'percentAttendanceWithPenalty'),
    width: 150
  },
  {
    title: 'Classes Late',
    dataIndex: 'classesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'classesLate'),
    width: 150
  },
  {
    title: 'Percent Classes Late',
    dataIndex: 'percentClassesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'percentClassesLate'),
    width: 150
  },
  {
    title: 'Average Minutes Late',
    dataIndex: 'averageMinutesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate'),
    width: 150
  },
  {
    title: 'Total Ayaat Recited',
    dataIndex: 'totalAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'totalAyahs'),
    width: 150
  },
  {
    title: 'Average Weekly Ayaat Recited',
    dataIndex: 'averageAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageAyahs'),
    width: 150
  }
]

export function DetailedStudentPanel(props: { report: StudentType }) {
  return (
    <>
      <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 3 }}>
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
        <Descriptions.Item label="Percent Attendance (with late penalty)">
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
      {props.report.marks.length > 0 && (
        <Collapse
          items={[
            {
              key: 'marks',
              label: 'Course Marks',
              children: (
                <Collapse
                  items={props.report.marks.map((mark) => {
                    return {
                      key: mark.course,
                      label: mark.course,
                      children: (
                        <Descriptions
                          column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        >
                          <Descriptions.Item label="Final Mark">
                            {mark.finalMark}
                          </Descriptions.Item>
                          <Descriptions.Item label="Final Grade">
                            {mark.finalGrade}
                          </Descriptions.Item>
                          <Descriptions.Item label="Class Average">
                            {mark.classAverage}
                          </Descriptions.Item>
                        </Descriptions>
                      )
                    }
                  })}
                />
              )
            }
          ]}
        />
      )}
    </>
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
              <>
                <LatePenalty className="mb-4" />
                <Table
                  bordered
                  className="mb-4 mt-2"
                  columns={studentColumns}
                  dataSource={props.report.studentsTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
                  scroll={{ x: 1500, y: 500 }}
                />
                {(props.report.studentMarks.length > 0 ||
                  props.report.courseMarks.length > 0) && (
                  <>
                    <h3 className="my-0">Course Marks</h3>
                    <Tabs
                      defaultActiveKey="1"
                      items={[
                        {
                          label: 'By Student',
                          key: '1',
                          children: (
                            <Collapse
                              className="mb-4 mt-2"
                              items={props.report.studentMarks}
                              size="large"
                            />
                          )
                        },
                        {
                          label: 'By Course',
                          key: '2',
                          children: (
                            <Collapse
                              className="mb-4 mt-2"
                              items={props.report.courseMarks}
                              size="large"
                            />
                          )
                        }
                      ]}
                    />
                  </>
                )}
              </>
            )
          },
          {
            label: 'List View',
            key: '2',
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
        ]}
      />
    </div>
  )
}
