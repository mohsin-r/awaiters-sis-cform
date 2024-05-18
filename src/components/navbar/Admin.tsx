/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation } from 'react-router-dom'
import {
  CoffeeOutlined,
  ExceptionOutlined,
  LogoutOutlined,
  GroupOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { host } from 'utils'

function AdminNavbar(props: any) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const items: MenuProps['items'] = [
    {
      label: (
        <label className="text-black">
          {params.section!.charAt(0).toUpperCase() + params.section!.slice(1)}
        </label>
      ),
      key: 'class',
      disabled: true
    },
    {
      label: 'Classes',
      key: 'classes',
      icon: <GroupOutlined />
    },
    {
      label: 'Holidays',
      key: 'holidays',
      icon: <CoffeeOutlined />
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
    if (location.pathname.includes('holidays')) {
      return 'holidays'
    } else if (location.pathname.includes('classes')) {
      return 'classes'
    } else if (location.pathname.includes('reports')) {
      return 'reports'
    } else {
      return ''
    }
  })

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    if (e.key !== 'logout') {
      navigate(`/${params.section}/${e.key}`)
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

export default AdminNavbar
