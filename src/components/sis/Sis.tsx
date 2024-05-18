/* eslint-disable @typescript-eslint/no-explicit-any */
import People from 'components/sis/People'

function Sis(props: any) {
  return <People setSection={props.setSection} type="student" />
}

export default Sis
