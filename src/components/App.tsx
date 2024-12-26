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
import Holidays from 'components/holidays/Holidays'
import Downloads from 'components/downloads/Downloads'
import Classes from 'components/classes/Classes'
import NotFound from 'components/NotFound'
import 'styles.css'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequireAuth(props: { class: string | undefined; children: any }) {
  const params = useParams()
  if (props.class !== params.section) {
    return <Navigate to={`/${params.section}/login`} />
  }
  return props.children
}

function AlreadyLoggedIn(props: {
  class: string | undefined
  role: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}) {
  const params = useParams()
  if (props.class === params.section) {
    if (props.role === 'teacher') {
      return <Navigate to={`/${params.section}/c-form`} />
    } else {
      return <Navigate to={`/${params.section}/classes`} />
    }
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
      dayjs.extend(customParseFormat)
      dayjs.extend(advancedFormat)
      dayjs.extend(weekday)
      dayjs.extend(localeData)
      dayjs.extend(weekOfYear)
      dayjs.extend(weekYear)
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
            setRole('')
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
                <AlreadyLoggedIn class={section} role={role}>
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
              {role === 'teacher' && (
                <>
                  <Route path="sis" element={<Sis setSection={setSection} />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="c-form" element={<Cform />} />
                  <Route
                    path="c-form/new"
                    element={<CformEditor setSection={setSection} mode="new" />}
                  />
                  <Route
                    path="c-form/view/:date"
                    element={
                      <CformEditor setSection={setSection} mode="view" />
                    }
                  />
                  <Route
                    path="c-form/edit/:date"
                    element={
                      <CformEditor setSection={setSection} mode="edit" />
                    }
                  />
                  <Route path="grades" element={<Grades />} />
                </>
              )}
              {role === 'admin' && (
                <>
                  <Route path="holidays" element={<Holidays />} />
                  <Route path="classes" element={<Classes />} />
                </>
              )}
              <Route path="downloads" element={<Downloads role={role} />} />
              <Route path="reports" element={<Reports role={role} />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </ConfigProvider>
  )
}

export default App
