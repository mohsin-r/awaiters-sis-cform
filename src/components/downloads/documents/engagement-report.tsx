/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer'
import DocumentTable from 'components/reports/documents/DocumentTable'

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: '16px',
    paddingVertical: '12px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    fontFamily: 'Helvetica-Bold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px',
    textDecoration: 'underline'
  },
  field: {
    marginTop: '5px',
    fontFamily: `Helvetica`,
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'row'
  },
  marks: {
    marginTop: '5px',
    fontFamily: `Helvetica`,
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column'
  },
  subtitle: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    fontSize: '15px',
    textDecoration: 'underline',
    marginTop: '20px'
  },
  student: {
    marginTop: '8px',
    borderTop: '1px solid black',
    paddingTop: '3px'
  }
})

const marksColumns: Array<any> = [
  {
    title: 'Course',
    key: 'course',
    width: '25%'
  },
  {
    title: 'Final Mark',
    key: 'finalMark',
    width: '25%%'
  },
  {
    title: 'Final Grade',
    key: 'finalGrade',
    width: '25%%'
  },
  {
    title: 'Class Average',
    key: 'classAverage',
    width: '25%%'
  }
]

const eventsColumns: Array<any> = [
  {
    title: 'Name',
    key: 'name',
    width: '25%'
  },
  {
    title: 'Type',
    key: 'type',
    width: '25%%'
  },
  {
    title: 'Date',
    key: 'date',
    width: '25%%'
  },
  {
    title: 'Time',
    key: 'start',
    render: (row: any) => (
      <Text>
        {row.start ?? 'Not Provided'} to {row.end ?? 'Not Provided'}
      </Text>
    ),
    width: '25%%'
  }
]

// Create Document Component
export default function EngagementDocument(props: { report: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header}>
          <Image src={'/logo.png'} style={{ height: '64px' }} />
          <Text
            style={{ fontWeight: 'bold', fontSize: '22px', marginTop: '2px' }}
          >
            Student Engagement Report
          </Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Date Generated: </Text>
          <Text>{new Date().toISOString().split('T')[0]}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Date From: </Text>
          <Text>{props.report.from}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Date To: </Text>
          <Text>{props.report.to}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Student ID: </Text>
          <Text>{props.report.student.id}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Full Name: </Text>
          <Text>{props.report.student.name}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Class Number: </Text>
          <Text>{props.report.class.toUpperCase()}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Class Day: </Text>
          <Text>{props.report.day}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Classes Attended: </Text>
          <Text>{props.report.student.classesAttended}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Percent Attendance: </Text>
          <Text>{props.report.student.percentAttendanceWithoutPenalty}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>
            Percent Attendance (with late penalty):{' '}
          </Text>
          <Text>{props.report.student.percentAttendanceWithPenalty}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Classes Late: </Text>
          <Text>{props.report.student.classesLate}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Percent Classes Late: </Text>
          <Text>{props.report.student.percentClassesLate}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Average Minutes Late: </Text>
          <Text>{props.report.student.averageMinutesLate}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Total Ayaat Recited: </Text>
          <Text>{props.report.student.totalAyahs}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>
            Average Weekly Ayaat Recited:{' '}
          </Text>
          <Text>{props.report.student.averageAyahs}</Text>
        </View>
        <Text style={styles.subtitle}>Course Marks</Text>
        {props.report.student.marks.length > 0 && (
          <DocumentTable
            data={props.report.student.marks.map((mark: any) => {
              mark.key = mark.course
              return mark
            })}
            columns={marksColumns}
            marginTop={20}
          />
        )}
        {props.report.student.marks.length === 0 && (
          <Text
            style={{
              marginTop: '20px',
              fontFamily: `Helvetica`,
              fontSize: '12px'
            }}
          >
            There are no grades to report because no courses have been completed
            yet by this student.
          </Text>
        )}
        <Text style={styles.subtitle}>Events Attended</Text>
        {props.report.student.events.length > 0 && (
          <DocumentTable
            data={props.report.student.events.map((event: any) => {
              event.key = JSON.stringify(event)
              return event
            })}
            columns={eventsColumns}
            marginTop={20}
            cellPadding={5}
          />
        )}
        {props.report.student.events.length === 0 && (
          <Text
            style={{
              marginTop: '20px',
              fontFamily: `Helvetica`,
              fontSize: '12px'
            }}
          >
            There are no events to report because no events have been attended
            yet by this student.
          </Text>
        )}
      </Page>
    </Document>
  )
}
