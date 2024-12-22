/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collapse, Descriptions, Table, TableProps, Tabs } from 'antd'
import { compareRecords } from 'utils'
import LatePenalty from './LatePenalty'

export function ClassPanel(props: { cl: ClassType }) {
  return (
    <>
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
        <Descriptions.Item
          labelStyle={{ maxWidth: '80%' }}
          label="Average Percent Attendance (with late penalty)"
        >
          {props.cl.averagePercentAttendanceWithPenalty}
        </Descriptions.Item>
        <Descriptions.Item label="Average Minutes Late">
          {props.cl.averageMinutesLate}
        </Descriptions.Item>
        <Descriptions.Item label="Average Weekly Ayaat Recited">
          {props.cl.averageAyahs}
        </Descriptions.Item>
      </Descriptions>
      {props.cl.marks.length > 0 && (
        <Collapse
          className="mt-4"
          items={[
            {
              key: 'marks',
              label: 'Course Marks',
              children: (
                <Collapse
                  items={props.cl.marks.map((mark) => {
                    return {
                      key: mark.course,
                      label: mark.course,
                      children: (
                        <Descriptions
                          column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        >
                          <Descriptions.Item label="Average Mark">
                            {mark.averageMark}
                          </Descriptions.Item>
                          <Descriptions.Item label="Highest Mark">
                            {mark.highestMark}
                          </Descriptions.Item>
                          <Descriptions.Item label="Lowest Mark">
                            {mark.lowestMark}
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
  marks: Array<{
    course: string
    averageMark: string
    highestMark: string
    lowestMark: string
  }>
}

const classColumns: TableProps<ClassType>['columns'] = [
  {
    title: 'Class Number',
    dataIndex: 'class',
    render: (_: any, cl: ClassType) => {
      return <span>{cl.class.toUpperCase()}</span>
    },
    fixed: 'left',
    width: 100
  },
  {
    title: 'Class Day',
    dataIndex: 'day',
    width: 100
  },
  {
    title: 'Number of Students',
    dataIndex: 'numberOfStudents',
    sorter: (a: any, b: any) => compareRecords(a, b, 'numberOfStudents'),
    width: 100
  },
  {
    title: 'Number of Classes Expected',
    dataIndex: 'sessionsExpected',
    sorter: (a: any, b: any) => compareRecords(a, b, 'sessionsExpected'),
    width: 100
  },
  {
    title: 'Number of Classes Conducted',
    dataIndex: 'sessionsConducted',
    sorter: (a: any, b: any) => compareRecords(a, b, 'sessionsConducted'),
    width: 100
  },
  {
    title: 'Average Percent Attendance',
    dataIndex: 'averagePercentAttendanceWithoutPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'averagePercentAttendanceWithoutPenalty'),
    width: 100
  },
  {
    title: 'Average Percent Attendance (with late penalty)',
    dataIndex: 'averagePercentAttendanceWithPenalty',
    sorter: (a: any, b: any) =>
      compareRecords(a, b, 'averagePercentAttendanceWithPenalty'),
    width: 100
  },
  {
    title: 'Average Minutes Late',
    dataIndex: 'averageMinutesLate',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageMinutesLate'),
    width: 100
  },
  {
    title: 'Average Weekly Ayaat Recited',
    dataIndex: 'averageAyahs',
    sorter: (a: any, b: any) => compareRecords(a, b, 'averageAyahs'),
    width: 100
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
              <>
                <LatePenalty className="mb-4" />
                <Table
                  bordered
                  className="my-2"
                  columns={classColumns}
                  dataSource={props.report.classesTable}
                  pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
                  scroll={{ x: 1200, y: 500 }}
                />
                <h3 className="my-0">Course Marks</h3>
                <Tabs
                  defaultActiveKey="1"
                  items={[
                    {
                      label: 'By Class',
                      key: '1',
                      children: (
                        <Collapse
                          className="mb-4 mt-2"
                          items={props.report.classesMarks}
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
                          items={props.report.coursesMarks}
                          size="large"
                        />
                      )
                    }
                  ]}
                />
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
                  items={props.report.classesList}
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
