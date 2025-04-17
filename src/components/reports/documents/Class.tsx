/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer'
import DocumentTable from './DocumentTable'

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
    fontSize: '11px',
    display: 'flex',
    flexDirection: 'row'
  },
  subtitle: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    fontSize: '15px',
    textDecoration: 'underline',
    marginTop: '20px'
  }
})

const coverageColumns: Array<any> = [
  {
    title: 'Subject',
    key: 'subject',
    width: '26%'
  },
  {
    title: 'Start',
    key: 'from',
    width: '37%'
  },
  {
    title: 'End',
    key: 'to',
    width: '37%'
  }
]

const teacherColumns: Array<any> = [
  {
    title: 'Teacher ID',
    key: 'id',
    width: '17%'
  },
  {
    title: 'Full Name',
    key: 'name',
    width: '17%'
  },
  {
    title: 'Percent Attendance',
    key: 'percentAttendanceWithoutPenalty',
    width: '22%'
  },
  {
    title: 'Percent Attendance (with late penalty)',
    key: 'percentAttendanceWithPenalty',
    width: '22%'
  },
  {
    title: 'Average Minutes Late',
    key: 'averageMinutesLate',
    width: '22%'
  }
]

const studentEngagementColumns: Array<any> = [
  {
    title: 'Student ID',
    key: 'id',
    fixed: 'left',
    width: '12.5%'
  },
  {
    title: 'Full Name',
    key: 'name',
    width: '12.5%'
  },
  {
    title: 'Classes Attended',
    key: 'classesAttended',
    width: '15%'
  },
  {
    title: 'Percent Attendance',
    key: 'percentAttendanceWithoutPenalty',
    width: '15%'
  },
  {
    title: 'Percent Attendance (with late penalty)',
    key: 'percentAttendanceWithPenalty',
    width: '15%'
  },
  {
    title: 'Average Minutes Late',
    key: 'averageMinutesLate',
    width: '15%'
  },
  {
    title: 'Total Ayaat Recited',
    key: 'totalAyahs',
    width: '15%'
  }
]

const studentMarksColumns: Array<any> = [
  {
    title: 'Student ID',
    key: 'id',
    width: '15%'
  },
  {
    title: 'Full Name',
    key: 'name',
    width: '15%'
  },
  {
    title: 'Course Marks',
    key: 'marks',
    width: '70%'
  }
]

const studentEventsColumns: Array<any> = [
  {
    title: 'Student ID',
    key: 'id',
    width: '15%'
  },
  {
    title: 'Full Name',
    key: 'name',
    width: '15%'
  },
  {
    title: 'Events Attended',
    key: 'events',
    width: '70%'
  }
]

// Create Document Component
export default function ClassDocument(props: { report: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header}>
          <Image src={'/logo.png'} style={{ height: '64px' }} />
          <Text
            style={{ fontWeight: 'bold', fontSize: '24px', marginTop: '2px' }}
          >
            Class Report
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
          <Text style={{ color: '#808080' }}>Class Number: </Text>
          <Text>{props.report.class.toUpperCase()}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Class Day: </Text>
          <Text>{props.report.day}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Number of Classes Expected: </Text>
          <Text>{props.report.sessionsExpected}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>
            Number of Classes Conducted:{' '}
          </Text>
          <Text>{props.report.sessionsConducted}</Text>
        </View>
        <View style={styles.field}>
          <Text style={{ color: '#808080' }}>Percent Conducted: </Text>
          <Text>{props.report.percentConducted}</Text>
        </View>
        <Text style={styles.subtitle}>Syllabus Coverage</Text>
        <DocumentTable
          data={props.report.coverageTable}
          columns={coverageColumns}
        />
        <Text style={styles.subtitle}>Teachers</Text>
        <DocumentTable
          data={props.report.teachersTable}
          columns={teacherColumns}
        />
        <Text style={styles.subtitle}>Students</Text>
        <DocumentTable
          data={props.report.studentsTable}
          columns={studentEngagementColumns}
          summaryRow
        />
        <DocumentTable
          data={props.report.studentsTable}
          columns={studentMarksColumns}
          marginTop={20}
          summaryRow
        />
        <DocumentTable
          data={props.report.studentsTable.slice(
            0,
            props.report.studentsTable.length - 1
          )}
          columns={studentEventsColumns}
          marginTop={20}
        />
      </Page>
    </Document>
  )
}
