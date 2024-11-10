/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  DatePicker,
  Checkbox,
  Typography
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { getCookie, host } from 'utils'
import dayjs from 'dayjs'

export default function HolidayEditor(props: {
  disabled: boolean
  mode: 'new' | 'edit'
  holidays: Array<any>
  setHolidays: any
  editingHoliday?: any
}) {
  const [open, setOpen] = useState(false)
  const [multi, setMulti] = useState(
    props.mode === 'new'
      ? false
      : props.editingHoliday.startDate !== props.editingHoliday.endDate
  )
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const { RangePicker } = DatePicker

  const openModal = () => {
    setOpen(true)
  }

  const getInitialValues = () => {
    if (props.mode === 'new') {
      return {}
    }
    if (props.editingHoliday.startDate === props.editingHoliday.endDate) {
      return {
        date: dayjs(props.editingHoliday.startDate!, 'YYYY-MM-DD'),
        description: props.editingHoliday.description
      }
    } else {
      return {
        dates: [
          dayjs(props.editingHoliday.startDate!, 'YYYY-MM-DD'),
          dayjs(props.editingHoliday.endDate!, 'YYYY-MM-DD')
        ],
        description: props.editingHoliday.description
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    console.log('Submitted form.')
    console.log(values)
    setLoading(true)
    const newHoliday: any = {
      startDate: multi
        ? values.dates[0].format('YYYY-MM-DD')
        : values.date.format('YYYY-MM-DD'),
      endDate: multi
        ? values.dates[1].format('YYYY-MM-DD')
        : values.date.format('YYYY-MM-DD'),
      description: values.description
    }
    if (props.mode === 'new') {
      fetch(`${host}/holidays`, {
        method: 'post',
        body: JSON.stringify(newHoliday),
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
          console.log(json)
          if (json) {
            messageApi.success(`Holiday added successfully.`)
            props.setHolidays([
              ...props.holidays,
              {
                ...newHoliday,
                key: json.id,
                holidayId: json.id
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
    } else {
      fetch(`${host}/holidays`, {
        method: 'put',
        body: JSON.stringify({
          id: props.editingHoliday.holidayId,
          newHoliday
        }),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json()
          }
          throw new Error()
        })
        .then((json) => {
          if (json) {
            messageApi.success(`Holiday saved successfully.`)
            const editingIdx = props.holidays.findIndex(
              (hol: any) => hol.holidayId === props.editingHoliday.holidayId
            )
            const holidaysCopy = [...props.holidays]
            holidaysCopy[editingIdx] = {
              ...newHoliday,
              key: props.editingHoliday.holidayId,
              holidayId: props.editingHoliday.holidayId
            }
            props.setHolidays(holidaysCopy)
            setOpen(false)
            setLoading(false)
          }
        })
        .catch((error) => {
          messageApi.error(`Failed to save holiday.`)
          setLoading(false)
          console.log(error)
        })
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const onCheckboxChange = (e: any) => {
    setMulti((e.target as HTMLInputElement).checked)
  }

  return (
    <>
      {contextHolder}
      {props.mode === 'new' && (
        <Button
          className="ml-auto text-sm md:text-lg"
          type="primary"
          onClick={openModal}
        >
          <PlusOutlined />
          Add holiday
        </Button>
      )}
      {props.mode === 'edit' && (
        <Typography.Link
          disabled={loading || props.disabled}
          onClick={openModal}
          style={{ marginRight: 8 }}
        >
          Edit
        </Typography.Link>
      )}
      <Modal
        title={props.mode === 'new' ? 'Add Holiday' : 'Edit Holiday'}
        open={open}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            type="primary"
            form={
              props.mode === 'new'
                ? 'addHolidayForm'
                : `editHolidayForm${props.editingHoliday.holidayId}`
            }
            key="submit"
            htmlType="submit"
            loading={loading}
          >
            {props.mode === 'new' ? 'Add' : 'Save'}
          </Button>
        ]}
      >
        <Form
          form={form}
          id={
            props.mode === 'new'
              ? 'addHolidayForm'
              : `editHolidayForm${props.editingHoliday.holidayId}`
          }
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          autoComplete="off"
          initialValues={getInitialValues()}
        >
          <Checkbox
            className="mb-4 mt-2"
            checked={multi}
            onChange={onCheckboxChange}
          >
            Multi-day Holiday
          </Checkbox>
          {multi && (
            <Form.Item
              label={`Dates`}
              name="dates"
              rules={[
                {
                  required: true,
                  message: `Dates of holiday are required.`
                }
              ]}
            >
              <RangePicker disabled={[false, false]} />
            </Form.Item>
          )}
          {!multi && (
            <Form.Item
              label={`Date`}
              name="date"
              rules={[
                {
                  required: true,
                  message: `Date of holiday is required.`
                }
              ]}
            >
              <DatePicker />
            </Form.Item>
          )}
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
