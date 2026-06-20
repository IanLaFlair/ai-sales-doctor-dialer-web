import StatusBadge from './StatusBadge.jsx'

// One of the two concurrent lines. `line` may be undefined → idle.
export default function LineCard({ index, line, isWinner }) {
  const idle = !line || !line.callId

  return (
    <div className={`line-card ${isWinner ? 'line-winner' : ''} ${idle ? 'line-idle' : ''}`}>
      <div className="line-head">
        <span className="line-label">Line {index + 1}</span>
        {!idle && <StatusBadge status={line.status} />}
      </div>

      {idle ? (
        <div className="line-body line-empty">
          <span className="muted">Idle</span>
        </div>
      ) : (
        <div className="line-body">
          <div className="line-name">{line.leadName}</div>
          <div className="line-phone mono">{line.phone}</div>
          {isWinner && (
            <div className="winner-flag">🏆 Agent is on this line with {line.leadName}</div>
          )}
        </div>
      )}
    </div>
  )
}
