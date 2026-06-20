// Call status → color-coded badge, matching the Sales Dialer design.
// CONNECTED green · RINGING neutral (pulsing dot) ·
// NO_ANSWER/BUSY/VOICEMAIL amber · CANCELED_BY_DIALER red.
const STATUS = {
  RINGING: { label: 'Ringing', tone: 'neutral' },
  CONNECTED: { label: 'Connected', tone: 'green' },
  NO_ANSWER: { label: 'No answer', tone: 'amber' },
  BUSY: { label: 'Busy', tone: 'amber' },
  VOICEMAIL: { label: 'Voicemail', tone: 'amber' },
  CANCELED_BY_DIALER: { label: 'Canceled', tone: 'red' },
}

export function statusMeta(status) {
  return STATUS[status] || STATUS.RINGING
}

export default function StatusBadge({ status, size }) {
  if (!status) return null
  const { label, tone } = statusMeta(status)
  const ringing = status === 'RINGING' ? 'ringing' : ''
  return (
    <span className={`badge ${tone} ${ringing} ${size === 'sm' ? 'sm' : ''}`}>
      <span className="badge-dot" />
      {label}
    </span>
  )
}
