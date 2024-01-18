import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams
} from 'react-router-dom'
import { useState } from 'react'
import { ConfigProvider } from 'antd'
import Layout from 'components/Layout'
import Sis from 'components/Sis'
import Cform from 'components/Cform'
import CformEditor from 'components/CformEditor'

import Login from 'components/Login'
// import { getCookie } from 'utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequireAuth(props: { class: string | undefined; children: any }) {
  const params = useParams()
  if (props.class !== params.section) {
    return <Navigate to={`/${params.section}/login`} />
  }
  return props.children
}

/* function AlreadyLoggedIn(props) {
  const params = useParams()
  if (props.section === params.section) {
    return <Navigate to={`/${params.section}/sis`} />
  }
  return props.children
} */

function App() {
  const [section, setSection] = useState('')
  // const host = import.meta.env.VITE_API_HOST
  /* useEffect(() => {
    fetch(`${host}/check-session`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
      .then((res) => {
        // console.log("The status is", res.status)
        if (res.status === 200) {
          return res.json()
        } else {
          setSection('')
        }
      })
      .then((json) => {
        if (json) {
          console.log(json.class)
          setSection(json.class)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }, []) */
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#3b7273',
          colorLink: '#3b7273',
          colorInfo: '#3b7273',
          colorBorder: '#3b7273',
          colorBorderSecondary: '#3b7273',
          colorBgContainerDisabled: '#ffffff',
          colorTextDisabled: '#000000',
          fontSize: 16
        },
        components: {
          Menu: {
            iconSize: 18
          },
          Form: {
            labelHeight: 0,
            verticalLabelPadding: 0
          }
        }
      }}
    >
      <BrowserRouter basename="/awaiters-sis-cform">
        <Routes>
          <Route
            path="/:section/login"
            element={<Login setSection={setSection} />}
          />
          <Route
            path="/:section/"
            element={
              <RequireAuth class={section}>
                <Layout setSection={setSection} />
              </RequireAuth>
            }
          >
            <Route path="sis" element={<Sis />} />
            <Route path="cform" element={<Cform />} />
            <Route path="cform/new" element={<CformEditor mode="new" />} />
            <Route
              path="cform/view/:date"
              element={<CformEditor mode="view" />}
            />
            <Route
              path="cform/edit/:date"
              element={<CformEditor mode="edit" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
