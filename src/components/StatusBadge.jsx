// Maps a call status to a color-coded badge.
// CONNECTED green, RINGING neutral, NO_ANSWER/BUSY/VOICEMAIL amber,
// CANCELED_BY_DIALER red.
const TONE = {
  RINGING: 'neutral',
  CONNECTED: 'green',
  NO_ANSWER: 'amber',
  BUSY: 'amber',
  VOICEMAIL: 'amber',
  CANCELED_BY_DIALER: 'red',
}

const LABEL = {
  RINGING: 'Ringing',
  CONNECTED: 'Connected',
  NO_ANSWER: 'No answer',
  BUSY: 'Busy',
  VOICEMAIL: 'Voicemail',
  CANCELED_BY_DIALER: 'Canceled',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const tone = TONE[status] || 'neutral'
  return <span className={`badge badge-${tone}`}>{LABEL[status] || status}</span>
}
