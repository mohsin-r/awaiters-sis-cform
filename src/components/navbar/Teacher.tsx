/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation } from 'react-router-dom'
import {
  FormOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  ExceptionOutlined,
  CheckSquareOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { host } from 'utils'

function TeacherNavbar(props: any) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const items: MenuProps['items'] = [
    {
      label: (
        <label className="text-black">
          {`Class: ${params.section!.toUpperCase()}`}
        </label>
      ),
      key: 'class',
      disabled: true
    },
    {
      label: 'SIS',
      key: 'sis',
      icon: <DatabaseOutlined />
    },
    {
      label: 'Teachers',
      key: 'teachers',
      icon: <UserOutlined />
    },
    {
      label: 'C-Form',
      key: 'c-form',
      icon: <FormOutlined />
    },
    {
      label: 'Grades',
      key: 'grades',
      icon: <CheckSquareOutlined />
    },
    {
      label: 'Reports',
      key: 'reports',
      icon: <ExceptionOutlined />
    },
    {
      label: 'Logout',
      key: 'logout',
      icon: <LogoutOutlined />
    }
  ]

  const [current, setCurrent] = useState(() => {
    if (location.pathname.includes('sis')) {
      return 'sis'
    } else if (location.pathname.includes('teachers')) {
      return 'teachers'
    } else if (location.pathname.includes('c-form')) {
      return 'c-form'
    } else if (location.pathname.includes('grades')) {
      return 'grades'
    } else if (location.pathname.includes('reports')) {
      return 'reports'
    } else {
      return ''
    }
  })

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    if (e.key === 'sis') {
      navigate(`/${params.section}/sis`)
    } else if (e.key === 'teachers') {
      navigate(`/${params.section}/teachers`)
    } else if (e.key === 'c-form') {
      navigate(`/${params.section}/c-form`)
    } else if (e.key === 'grades') {
      navigate(`/${params.section}/grades`)
    } else if (e.key === 'reports') {
      navigate(`/${params.section}/reports`)
    } else {
      const request = new Request(`${host}/logout`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      })
      fetch(request)
        .then((res) => {
          if (res.status === 200) {
            return res.json()
          }
          throw new Error()
        })
        .then(() => {
          props.setSection('')
          navigate(`/${params.section}/login`)
        })
    }
  }

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  )
}

export default TeacherNavbar
