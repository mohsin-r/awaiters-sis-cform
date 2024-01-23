/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, Form, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getCookie, host } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'

export default function AddStudent(props: {
  students: Array<any>
  setStudents: any
  setSection: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const params = useParams()
  const navigate = useNavigate()

  const openModal = () => {
    setOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    setLoading(true)
    fetch(`${host}/people`, {
      method: 'post',
      body: JSON.stringify({
        id: values.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        type: 'student'
      }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 201) {
          return res.json()
        }
        throw new Error()
      })
      .then((json) => {
        if (json) {
          messageApi.success('Student added successfully.')
          props.setStudents([
            ...props.students,
            {
              id: values.id,
              key: values.id,
              name: values.name,
              email: values.email,
              phone: values.phone
            }
          ])
          setOpen(false)
          setLoading(false)
          form.resetFields()
        }
      })
      .catch((error) => {
        messageApi.error('Failed to add student.')
        setLoading(false)
        console.log(error)
      })
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  type FieldType = {
    id: string
    name: string
    email?: string
    phone?: string
  }
  return (
    <>
      {contextHolder}
      <Button
        className="ml-auto text-sm md:text-lg"
        type="primary"
        onClick={openModal}
      >
        <PlusOutlined />
        Add student
      </Button>
      <Modal
        title="Add student"
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form="addStudentForm"
            key="submit"
            htmlType="submit"
            loading={loading}
          >
            Add
          </Button>
        ]}
      >
        <Form
          form={form}
          id="addStudentForm"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Student ID"
            name="id"
            rules={[
              { required: true, message: 'Student ID is required.' },
              {
                message: 'Student ID is assigned to another student.',
                validator: async (_, value) => {
                  if (value === '') {
                    return Promise.resolve()
                  }
                  const res = await fetch(`${host}/person/${value}`, {
                    // @ts-expect-error TS BEING DUMB
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': getCookie('csrf_access_token')
                    },
                    credentials: 'include'
                  })
                  if (res.ok) {
                    return Promise.reject()
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Student name is required.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType> label="Email Address" name="email">
            <Input />
          </Form.Item>

          <Form.Item<FieldType> label="Phone Number" name="phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
