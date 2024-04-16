/* eslint-disable @typescript-eslint/no-explicit-any */
import People from 'components/helpers/People'

function Teachers(props: any) {
  return <People setSection={props.setSection} type="teacher" />
}

export default Teachers
