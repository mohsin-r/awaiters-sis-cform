/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, Form, Input, message, Typography, Select } from 'antd'
import { useState } from 'react'
import { getCookie, host } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'

export default function TransferStudent(props: {
  id: string
  name: string
  disabled: boolean
  setSection: any
  remove: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const params = useParams()
  const opts = ['aw1', 'aw2', 'aw3', 'aw4', 'aw5', 'aw6', 'aw8', 'aw9']
  opts.splice(opts.indexOf(params.section!), 1)
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
    await fetch(`${host}/people`, {
      method: 'put',
      body: JSON.stringify({
        transfer: true,
        id: props.id,
        class: values.new
      }),
      // @ts-expect-error bad TS
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    messageApi.success('Student transferred successfully.')
    setTimeout(() => {
      props.remove(props.id)
      setLoading(false)
      setOpen(false)
      form.resetFields()
    }, 2000)
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  type FieldType = {
    current: string
    new: string
  }
  return (
    <>
      {contextHolder}
      <Typography.Link onClick={() => openModal()} style={{ marginRight: 8 }}>
        Transfer
      </Typography.Link>
      <Modal
        title={`Transfer ${props.name}`}
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form={`transfer-student-${props.id}`}
            key="submit"
            htmlType="submit"
            loading={loading}
          >
            Transfer
          </Button>
        ]}
      >
        <Form
          form={form}
          id={`transfer-student-${props.id}`}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ current: params.section }}
        >
          <Form.Item<FieldType> label="Current Class" name="current">
            <Input disabled />
          </Form.Item>

          <Form.Item<FieldType> label="New Class" name="new">
            <Select
              options={opts.map((opt) => {
                return { value: opt, label: opt }
              })}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
