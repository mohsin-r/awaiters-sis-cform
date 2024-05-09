/* eslint-disable @typescript-eslint/no-explicit-any */
import People from 'components/sis/People'

function Teachers(props: any) {
  if (props.role === 'admin') {
    return (
      <div className="mx-4 mt-4">
        <h2 className="m-0">Teachers</h2>
        <p>Coming soon!</p>
      </div>
    )
  }
  return <People setSection={props.setSection} type="teacher" />
}

export default Teachers
