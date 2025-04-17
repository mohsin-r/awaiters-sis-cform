/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View, StyleSheet } from '@react-pdf/renderer'

interface Column {
  title: string
  key: string
  width: string | number
  render?: (data: any) => React.ReactNode
}

export default function DocumentTable(props: {
  columns: Array<Column>
  data: Array<any>
  marginTop?: number
  cellPadding?: number
  summaryRow?: boolean
  tableCell?: any
}) {
  // Create styles
  const styles = StyleSheet.create({
    table: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      border: '1px solid black'
    },
    theadText: {
      fontFamily: `Helvetica-Bold`,
      wordBreak: 'break-word'
    },
    tbody: {
      padding: `${props.cellPadding ?? 4}px`,
      borderRight: '1px solid black',
      fontSize: '11px'
    },
    tbodyText: {
      fontFamily: `Helvetica`,
      fontSize: '11px'
    }
  })
  return (
    <View>
      <View style={{ ...styles.table, marginTop: `${props.marginTop ?? 8}px` }}>
        {props.columns.map((col: Column, index: number) => (
          <View
            key={col.key}
            style={{
              ...styles.tbody,
              width: col.width,
              borderRight:
                index === props.columns.length - 1 ? 0 : '1px solid black'
            }}
          >
            <Text style={styles.theadText}>{col.title}</Text>
          </View>
        ))}
      </View>
      {props.data.map((data: any, dataIndex: number) => (
        <View key={data.key} style={{ ...styles.table, borderTop: 0 }}>
          {props.columns.map((col: Column, colIndex: number) => (
            <View
              key={col.key}
              style={{
                ...styles.tbody,
                width: col.width,
                borderRight:
                  colIndex === props.columns.length - 1 ? 0 : '1px solid black'
              }}
            >
              {col.render ? (
                col.render(data)
              ) : Array.isArray(data[col.key]) ? (
                data[col.key].map((line: string) => (
                  <Text
                    key={line}
                    style={
                      props.summaryRow && dataIndex === props.data.length - 1
                        ? styles.theadText
                        : styles.tbodyText
                    }
                  >
                    {line}
                  </Text>
                ))
              ) : (
                <Text
                  style={
                    props.summaryRow && dataIndex === props.data.length - 1
                      ? styles.theadText
                      : styles.tbodyText
                  }
                >
                  {data[col.key]}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
