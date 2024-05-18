/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, Form, Input, message, InputNumber, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getCookie, host } from 'utils'

export default function AddClass(props: {
  classes: Array<any>
  setClasses: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  const openModal = () => {
    setOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    setLoading(true)
    fetch(`${host}/classes`, {
      method: 'post',
      body: JSON.stringify({
        class: `aw${values.number}`,
        password: values.password,
        day: values.day
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
          messageApi.success(`Class added successfully.`)
          props.setClasses([
            ...props.classes,
            {
              class: `AW${values.number}`,
              key: `aw${values.number}`,
              day: values.day
            }
          ])
          setOpen(false)
          setLoading(false)
          form.resetFields()
        }
      })
      .catch((error) => {
        messageApi.error(`Failed to add class.`)
        setLoading(false)
        console.log(error)
      })
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
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
        Add class
      </Button>
      <Modal
        title={`Add Class`}
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form="addClassForm"
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
          id="addClassForm"
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          autoComplete="off"
        >
          <Form.Item label={`Class Number`} required>
            <div className="flex items-center">
              <span className="pr-1">AW</span>
              <Form.Item
                name="number"
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: `Class number is required.`
                  },
                  {
                    message:
                      'This number is already assigned to another class.',
                    validator: async (_, value) => {
                      if (value === '') {
                        return Promise.resolve()
                      }
                      const res = await fetch(`${host}/classes/aw${value}`, {
                        headers: {
                          'Content-Type': 'application/json'
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
                <InputNumber />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item
            label="Class Day"
            name="day"
            rules={[
              {
                required: true,
                message: `Class day is required.`
              }
            ]}
          >
            <Select
              options={days.map((d) => {
                return { label: d, value: d }
              })}
              size="large"
            />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: `Password is required.`
              }
            ]}
            label="Password"
            name="password"
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Confirming your password is required.'
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error('The new password that you entered do not match!')
                  )
                }
              })
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
