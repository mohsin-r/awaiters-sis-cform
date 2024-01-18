/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation } from 'react-router-dom'
import {
  FormOutlined,
  LogoutOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function Navbar(props: any) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const items: MenuProps['items'] = [
    {
      label: (
        <label className="text-black">{`Class: ${params.section!.toUpperCase()}`}</label>
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
      label: 'CForm',
      key: 'cform',
      icon: <FormOutlined />
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
    } else {
      return 'cform'
    }
  })

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    if (e.key === 'sis') {
      navigate(`/${params.section}/sis`)
    } else if (e.key === 'cform') {
      navigate(`/${params.section}/cform`)
    } else {
      const host = 'https://awaiters-sis-cform-api.onrender.com/api'
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

export default Navbar
