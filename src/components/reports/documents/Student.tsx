/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer'

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
  marks: {
    marginTop: '5px',
    fontFamily: `Helvetica`,
    fontSize: '11px',
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

// Create Document Component
export default function StudentDocument(props: { report: any }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header}>
          <Image src={'/logo.png'} style={{ height: '64px' }} />
          <Text
            style={{ fontWeight: 'bold', fontSize: '24px', marginTop: '2px' }}
          >
            Students Report
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
        <Text style={styles.subtitle}>Students</Text>
        {props.report.studentsTable.map((student: any, index: number) => (
          <View
            key={student.key}
            style={index === 0 ? { marginTop: '8px' } : styles.student}
          >
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Student ID: </Text>
              <Text>{student.id}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Full Name: </Text>
              <Text>{student.name}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Classes Attended: </Text>
              <Text>{student.classesAttended}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Percent Attendance: </Text>
              <Text>{student.percentAttendanceWithoutPenalty}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>
                Percent Attendance (with late penalty):{' '}
              </Text>
              <Text>{student.percentAttendanceWithPenalty}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Classes Late: </Text>
              <Text>{student.classesLate}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Percent Classes Late: </Text>
              <Text>{student.percentClassesLate}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Average Minutes Late: </Text>
              <Text>{student.averageMinutesLate}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>Total Ayaat Recited: </Text>
              <Text>{student.totalAyahs}</Text>
            </View>
            <View style={styles.field}>
              <Text style={{ color: '#808080' }}>
                Average Weekly Ayaat Recited:{' '}
              </Text>
              <Text>{student.averageAyahs}</Text>
            </View>
            <View
              style={student.marks.length === 0 ? styles.field : styles.marks}
            >
              <Text style={{ color: '#808080' }}>Course Marks: </Text>
              {student.marks.length === 0 && <Text>Not Available</Text>}
              {student.marks.map((mark: any) => (
                <Text
                  key={mark}
                  style={{ marginTop: '1px' }}
                >{`${mark.course}: ${mark.finalMark} (${mark.finalGrade}). Class Average: ${mark.classAverage}`}</Text>
              ))}
            </View>
            <View
              style={student.events.length === 0 ? styles.field : styles.marks}
            >
              <Text style={{ color: '#808080' }}>Events Attended: </Text>
              {student.events.length === 0 && <Text>No Events Attended</Text>}
              {student.events.map((event: any) => (
                <Text
                  key={event}
                  style={{ marginTop: '1px' }}
                >{`${event.name}. Type: ${event.type}. Date & Time: ${event.date} from ${event.start} to ${event.end}.`}</Text>
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}
