/* eslint-disable @typescript-eslint/no-explicit-any */
import People from 'components/sis/People'

function Sis(props: any) {
  if (props.role === 'admin') {
    return (
      <div className="mx-4 mt-4">
        <h2 className="m-0">SIS</h2>
        <p>Coming soon!</p>
      </div>
    )
  }
  return <People setSection={props.setSection} type="student" />
}

export default Sis
