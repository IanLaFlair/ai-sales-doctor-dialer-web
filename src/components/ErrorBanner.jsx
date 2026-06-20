// Shown when the backend is unreachable; names the VITE_API_URL it tried.
export default function ErrorBanner({ apiUrl }) {
  return (
    <div className="offline-banner" role="alert">
      <span className="warn">⚠</span>
      <span>
        Cannot reach the dialer backend at{' '}
        <span className="mono" style={{ fontWeight: 600 }}>{apiUrl}</span> — retrying every 1s.
      </span>
    </div>
  )
}
