import StatusBadge from './StatusBadge.jsx'

// One of the two concurrent lines. `line` may be undefined → idle.
export default function LineCard({ index, line, isWinner, running }) {
  const idle = !line || !line.callId
  const label = `Line ${index + 1}`

  if (idle) {
    return (
      <div className="line-card idle">
        <div className="line-idle-body">
          <div className="line-label">{label}</div>
          <div className="idle-ring" />
          <div className="idle-text">{running ? 'Waiting to dial' : 'Idle'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`line-card ${isWinner ? 'winner' : ''}`}>
      <div className="line-filled">
        <div className="line-top">
          <div className="line-label">{label}</div>
          <StatusBadge status={line.status} />
        </div>
        <div>
          <div className="line-name">{line.leadName}</div>
          {line.company && <div className="line-company">{line.company}</div>}
        </div>
        <div className="line-phone">{line.phone}</div>
        {isWinner && (
          <div className="winner-banner">
            <span className="trophy">🏆</span>
            <div className="winner-text">Agent is on this line with {line.leadName}</div>
          </div>
        )}
      </div>
    </div>
  )
}
