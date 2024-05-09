import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ConfigProvider, Flex, Spin } from 'antd'
import Layout from 'components/Layout'
import Sis from 'components/sis/Sis'
import Cform from 'components/c-form/Cform'
import CformEditor from 'components/c-form/CformEditor'
import logo from 'assets/logo.png'

import Login from 'components/login/Login'
import { getCookie, host } from 'utils'
import Teachers from 'components/teachers/Teachers'
import Grades from 'components/grades/Grades'
import Reports from 'components/reports/Reports'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequireAuth(props: { class: string | undefined; children: any }) {
  const params = useParams()
  if (props.class !== params.section) {
    return <Navigate to={`/${params.section}/login`} />
  }
  return props.children
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AlreadyLoggedIn(props: { class: string | undefined; children: any }) {
  const params = useParams()
  if (props.class === params.section) {
    return <Navigate to={`/${params.section}/cform`} />
  }
  return props.children
}

function App() {
  const [role, setRole] = useState('')
  const [section, setSection] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (import.meta.env.VITE_DOWN === 'false') {
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
            setLoaded(true)
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((json: any) => {
          if (json) {
            setSection(json.user)
            setRole(json.role)
            setLoaded(true)
          }
        })
    }
  }, [])
  if (import.meta.env.VITE_DOWN === 'true') {
    return (
      <Flex
        gap="small"
        className="h-screen w-screen text-[#3b7273]"
        vertical
        align="center"
        justify="center"
      >
        <img src={logo} className="h-20"></img>
        <h1 className="m-0 p-0">SIS and C-Form</h1>
        <h2 className="m-0 p-0">
          System is down for implementing improvements.
        </h2>
        <h3 className="m-0 p-0">Please check back later.</h3>
      </Flex>
    )
  }
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
      {!loaded && (
        <Flex
          gap="small"
          className="h-screen w-screen text-[#3b7273]"
          vertical
          align="center"
          justify="center"
        >
          <Spin size="large"></Spin>
          <h3 className="m-0 p-0">Loading...</h3>
          <p className="m-0 p-0">
            This will take a while (maybe a minute or so) due to free version
            limits
          </p>
        </Flex>
      )}
      {loaded && (
        <BrowserRouter>
          <Routes>
            <Route
              path="/:section/login"
              element={
                <AlreadyLoggedIn class={section}>
                  <Login
                    setSection={setSection}
                    started={started}
                    setStarted={setStarted}
                    setRole={setRole}
                  />
                </AlreadyLoggedIn>
              }
            />
            <Route
              path="/:section/"
              element={
                <RequireAuth class={section}>
                  <Layout role={role} setSection={setSection} />
                </RequireAuth>
              }
            >
              <Route
                path="sis"
                element={<Sis setSection={setSection} role={role} />}
              />
              <Route path="teachers" element={<Teachers role={role} />} />
              <Route path="cform" element={<Cform role={role} />} />
              <Route
                path="cform/new"
                element={
                  <CformEditor setSection={setSection} mode="new" role={role} />
                }
              />
              <Route
                path="cform/view/:date"
                element={
                  <CformEditor
                    setSection={setSection}
                    mode="view"
                    role={role}
                  />
                }
              />
              <Route
                path="cform/edit/:date"
                element={
                  <CformEditor
                    setSection={setSection}
                    mode="edit"
                    role={role}
                  />
                }
              />
              <Route path="grades" element={<Grades role={role} />} />
              <Route path="reports" element={<Reports role={role} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </ConfigProvider>
  )
}

export default App
