/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Checkbox, Select, Modal, Form, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { getCookie, host } from 'utils'
import { useNavigate, useParams } from 'react-router-dom'

export default function AddPerson(props: {
  people: Array<any>
  setPeople: any
  setSection: any
  type: string
}) {
  const [existing, setExisting] = useState(true)
  const [existingOptions, setExistingOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const params = useParams()
  const navigate = useNavigate()

  const loadPeople = async () => {
    if (params.section !== localStorage.getItem('section')) {
      navigate(`/${params.section}/login`)
      props.setSection('')
      return
    }
    setLoading(true)
    const res = await fetch(`${host}/all/people`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
    const json = await res.json()
    const allIds = props.people.map((person) => person.id)
    setExistingOptions(
      json
        .map((person: any, idx: number) => {
          person.value = `${idx}`
          person.label = person.name
          return person
        })
        .filter((person: any) => !allIds.includes(person.id))
    )
    setLoading(false)
  }
  useEffect(() => {
    if (props.type === 'teacher') {
      loadPeople()
    }
  }, [])

  const onCheckboxChange = (e: any) => {
    setExisting((e.target as HTMLInputElement).checked)
  }

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
    if (existing) {
      const idx = Number(values.selection)
      values = existingOptions[idx]
      values.existing = true
    }
    setLoading(true)
    fetch(`${host}/people`, {
      method: 'post',
      body: JSON.stringify({
        id: values.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        type: props.type,
        existing: values.existing ?? false
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
          messageApi.success(
            `${
              props.type === 'student' ? 'Student' : 'Teacher'
            } added successfully.`
          )
          props.setPeople([
            ...props.people,
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
        messageApi.error(`Failed to add ${props.type}.`)
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
    selection: any
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
        Add {props.type}
      </Button>
      <Modal
        title={`Add ${props.type}`}
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form="addPersonForm"
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
          id="addPersonForm"
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          autoComplete="off"
        >
          {props.type === 'teacher' && (
            <Checkbox
              className="mb-2"
              checked={existing}
              onChange={onCheckboxChange}
            >
              Use existing person as new teacher
            </Checkbox>
          )}
          {props.type === 'teacher' && existing && (
            <Form.Item<FieldType>
              label="New Teacher"
              name="selection"
              rules={[
                {
                  required: true,
                  message: `Teacher name is required.`
                }
              ]}
            >
              <Select
                showSearch
                loading={loading}
                optionFilterProp="children"
                filterOption={(input, option: any) =>
                  (option?.label ?? '').includes(input)
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={existingOptions}
              />
            </Form.Item>
          )}
          {(props.type === 'student' || !existing) && (
            <>
              <Form.Item<FieldType>
                label={`${props.type === 'student' ? 'Student' : 'Teacher'} ID`}
                name="id"
                rules={[
                  {
                    required: true,
                    message: `${
                      props.type === 'student' ? 'Student' : 'Teacher'
                    } ID is required.`
                  },
                  {
                    message: 'This ID is assigned to someone else.',
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
                rules={[
                  {
                    required: true,
                    message: `${
                      props.type === 'student' ? 'Student' : 'Teacher'
                    } name is required.`
                  }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item<FieldType> label="Email Address" name="email">
                <Input />
              </Form.Item>

              <Form.Item<FieldType> label="Phone Number" name="phone">
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  )
}
