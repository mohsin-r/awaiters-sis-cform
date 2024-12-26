/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { compareRecords, host } from 'utils'
import { Collapse, Empty, Flex, Spin, Table, Tag } from 'antd'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function Grades() {
  const [courses, setCourses] = useState([])
  const [loaded, setLoaded] = useState(false)
  const params = useParams()
  const colours = ['red', 'blue', 'gold', 'green', 'purple', 'volcano']
  const assessmentColours = {} as any

  const startingColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      sorter: (a: any, b: any) => compareRecords(a, b, 'studentId'),
      fixed: 'left',
      width: 150
    },
    {
      title: 'Full Name',
      dataIndex: 'studentName',
      render: (_: any, grade: any) => {
        return (
          <span className={grade.studentId === '' ? 'font-bold' : ''}>
            {grade.studentName}
          </span>
        )
      },
      sorter: (a: any, b: any) => compareRecords(a, b, 'studentName'),
      fixed: 'left',
      width: 150
    }
  ]

  const loadGrades = async () => {
    const res = await fetch(`${host}/${params.section}/grades`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const json = await res.json()
    // console.log(json)
    setCourses(
      json.courses.map((course: any) => {
        const grades = json.grades[course.code].map((grade: any) => {
          grade.key = grade.studentId
          return grade
        })
        const assessmentColumns = json.assessments[course.code].map(
          (assessment: any) => {
            if (
              !assessmentColours[assessment.type] &&
              !['finalMark', 'finalGrade'].includes(assessment.type)
            ) {
              assessmentColours[assessment.type] = colours.shift()
            }
            return {
              title: (
                <Flex gap={6} vertical>
                  <span>{assessment.title}</span>
                  {!['finalMark', 'finalGrade'].includes(assessment.type) && (
                    <Tag
                      color={assessmentColours[assessment.type]}
                      className="max-w-fit"
                    >
                      {assessment.type}
                    </Tag>
                  )}
                </Flex>
              ),
              dataIndex: assessment.code,
              render: (_: any, grade: any) => {
                return (
                  <span className={grade.studentId === '' ? 'font-bold' : ''}>
                    {grade[assessment.code]}
                  </span>
                )
              },
              sorter: (a: any, b: any) => compareRecords(a, b, assessment.code)
            }
          }
        )
        return {
          key: course.code,
          label: `${course.code} ${course.title}`,
          children: (
            <Table
              bordered
              className="my-2"
              columns={startingColumns.concat(assessmentColumns) as any}
              dataSource={grades}
              pagination={{ hideOnSinglePage: true, defaultPageSize: 100 }}
              scroll={{
                x: 200 * startingColumns.concat(assessmentColumns).length,
                y: 500
              }}
            />
          )
        }
      })
    )
    setLoaded(true)
  }

  useEffect(() => {
    loadGrades()
  }, [])

  if (!loaded) {
    return (
      <Flex
        gap="small"
        vertical
        className="absolute h-full w-full"
        align="center"
        justify="center"
      >
        <Spin size="large"></Spin>
      </Flex>
    )
  } else if (courses.length === 0) {
    return (
      <Flex gap="small" vertical className="absolute h-full w-full">
        <h2 className="mx-4 mb-0 mt-4 basis-[38%]">Grades</h2>
        <Empty description="No Grades Available" />
      </Flex>
    )
  }
  return (
    <div className="mx-4 mt-4">
      <h2 className="m-0">Grades</h2>
      <Collapse className="my-4" items={courses} size="large" />
    </div>
  )
}

export default Grades
