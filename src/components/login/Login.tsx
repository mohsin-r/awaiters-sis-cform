/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'
import logo from 'assets/logo.png'
import { useEffect, useState } from 'react'
import { host } from 'utils'

function Login(props: any) {
  const { section } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const onFinish = (values: any) => {
    messageApi.open({
      type: 'loading',
      duration: 0,
      content: 'Checking your credentials...'
    })
    setLoading(true)
    const request = new Request(`${host}/login`, {
      method: 'post',
      body: JSON.stringify({
        username: values.class,
        password: values.password
      }),
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
      .then((json) => {
        messageApi.destroy()
        messageApi.success('Login was successful. Redirecting...')
        setTimeout(() => {
          props.setSection(values.class)
          props.setRole(json.role)
          setLoading(false)
          if (json.role === 'teacher') {
            navigate(`/${values.class}/c-form`)
          } else {
            navigate(`/${values.class}/classes`)
          }
          props.setStarted(true)
        }, 1500)
      })
      .catch(() => {
        messageApi.destroy()
        messageApi.error(
          'Login failed. Your username or password is incorrect.'
        )
        setLoading(false)
      })
  }

  const onFinishFailed = (errorInfo: any) => {
    // console.log('Failed:', errorInfo)
  }

  type FieldType = {
    class?: string
    password?: string
  }

  useEffect(() => {
    if (props.started) {
      messageApi.error('Session Expired. Please login again.')
    }
  }, [])

  return (
    <div className="flex h-screen flex-col items-center justify-center rounded-lg text-[#3b7273]">
      {contextHolder}
      <img src={logo} className="h-20"></img>
      <h1 className="text-center">
        Login to the SIS system for {import.meta.env.VITE_GENDER}
      </h1>
      <Form
        disabled={loading}
        size="large"
        layout="vertical"
        initialValues={{ class: section }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType> label="Class" name="class">
          <Input disabled />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" className="mt-2">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login
