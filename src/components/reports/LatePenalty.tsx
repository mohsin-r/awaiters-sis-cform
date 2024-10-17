import { Alert } from 'antd'

export default function LatePenalty(props: { className?: string }) {
  return (
    <Alert
      className={props.className}
      message="Late Penalty"
      description={
        <div>
          When calculating percent attendance with penalty, the following late
          penalties were applied:
          <ul className="mb-0">
            <li>10% for 1-15 minutes late</li>
            <li>20% for 16-30 minutes late</li>
            <li>30% for 31-45 minutes late</li>
            <li>50% for more than 45 minutes late</li>
          </ul>
        </div>
      }
      type="info"
      showIcon
      closable
    />
  )
}
