/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, Form, Input, message, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getCookie, host } from 'utils'

export default function AddHoliday(props: {
  holidays: Array<any>
  setHolidays: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const openModal = () => {
    setOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    console.log('Submitted form.')
    setLoading(true)
    fetch(`${host}/holidays`, {
      method: 'post',
      body: JSON.stringify({
        date: values.date.format('YYYY-MM-DD'),
        description: values.description
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
          messageApi.success(`Holiday added successfully.`)
          props.setHolidays([
            ...props.holidays,
            {
              date: values.date.format('YYYY-MM-DD'),
              description: values.description,
              key: values.date.format('YYYY-MM-DD')
            }
          ])
          setOpen(false)
          setLoading(false)
          form.resetFields()
        }
      })
      .catch((error) => {
        messageApi.error(`Failed to add holiday.`)
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
        Add holiday
      </Button>
      <Modal
        title={`Add Holiday`}
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form="addHolidayForm"
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
          id="addHolidayForm"
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          autoComplete="off"
        >
          <Form.Item
            label={`Date`}
            name="date"
            rules={[
              {
                required: true,
                message: `Date of holiday is required.`
              },
              {
                message: 'This date is already assigned as a holiday.',
                validator: async (_, value) => {
                  if (value === '') {
                    return Promise.resolve()
                  }
                  const res = await fetch(
                    `${host}/holidays/${value.format('YYYY-MM-DD')}`,
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      credentials: 'include'
                    }
                  )
                  if (res.ok) {
                    return Promise.reject()
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
