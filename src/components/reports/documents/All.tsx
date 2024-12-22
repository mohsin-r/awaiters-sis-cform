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
  },
  courseRow: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    fontSize: '11px',
    padding: '3px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid black',
    borderBottom: 0
  }
})

const classesColumns: Array<any> = [
  {
    title: 'Class Number',
    key: 'class',
    width: '7.6%'
  },
  {
    title: 'Class Day',
    key: 'day',
    width: '11.1%'
  },
  {
    title: 'Number of Students',
    key: 'numberOfStudents',
    width: '11.6%'
  },
  {
    title: 'Number of Classes Expected',
    key: 'sessionsExpected',
    width: '11.6%'
  },
  {
    title: 'Number of Classes Conducted',
    key: 'sessionsConducted',
    width: '11.6%'
  },
  {
    title: 'Average Percent Attendance',
    key: 'averagePercentAttendanceWithoutPenalty',
    width: '11.6%'
  },
  {
    title: 'Average Percent Attendance (with late penalty)',
    key: 'averagePercentAttendanceWithPenalty',
    width: '11.6%'
  },
  {
    title: 'Average Minutes Late',
    key: 'averageMinutesLate',
    width: '11.6%'
  },
  {
    title: 'Average Weekly Ayaat Recited',
    key: 'averageAyahs',
    width: '11.7%'
  }
]

const marksColumns: Array<any> = [
  {
    title: 'Class Number',
    key: 'class',
    width: '25%'
  },
  {
    title: 'Average Mark',
    key: 'averageMark',
    width: '25%%'
  },
  {
    title: 'Highest Mark',
    key: 'highestMark',
    width: '25%%'
  },
  {
    title: 'Lowest Mark',
    key: 'lowestMark',
    width: '25%%'
  }
]

// Create Document Component
export default function AllDocument(props: { report: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header}>
          <Image src={'/logo.png'} style={{ height: '64px' }} />
          <Text
            style={{ fontWeight: 'bold', fontSize: '24px', marginTop: '2px' }}
          >
            All Classes Report
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
          <Text style={{ color: '#808080' }}>Number Of Classes: </Text>
          <Text>{props.report.numberOfClasses}</Text>
        </View>
        <DocumentTable
          data={props.report.classesTable.map((cl: any) => {
            cl.class = cl.class.toUpperCase()
            return cl
          })}
          columns={classesColumns}
          marginTop={20}
        />
        <Text style={styles.subtitle}>Course Marks</Text>
        {props.report.marksTables.map((course: any, index: number) => (
          <View
            key={course.course}
            style={{ marginTop: `${index === 0 ? 8 : 20}px` }}
          >
            <View style={styles.courseRow}>
              <Text>{course.course}</Text>
            </View>
            <DocumentTable
              cellPadding={3}
              data={course.classes.map((cl: any) => {
                cl.class = cl.class.toUpperCase()
                return cl
              })}
              columns={marksColumns}
              marginTop={0}
            />
          </View>
        ))}
      </Page>
    </Document>
  )
}
