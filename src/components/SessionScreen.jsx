import { useEffect, useRef, useState } from 'react'
import { getSession, startSession, stopSession, API_URL } from '../api.js'
import StatusBadge from './StatusBadge.jsx'
import LineCard from './LineCard.jsx'
import ErrorBanner from './ErrorBanner.jsx'

const POLL_MS = 1500

export default function SessionScreen({ sessionId, onBack }) {
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  // Bumped to (re)arm the polling effect, e.g. after Start following a STOPPED state.
  const [pollToken, setPollToken] = useState(0)
  const timerRef = useRef(null)

  // Poll GET /sessions/:id every 1.5s. Stop on unmount and when STOPPED.
  useEffect(() => {
    let cancelled = false

    function clearTimer() {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    async function poll() {
      try {
        const data = await getSession(sessionId)
        if (cancelled) return
        setSession(data)
        setError(null)
        // One final fetch is fine; then stop the loop.
        if (data.status === 'STOPPED') clearTimer()
      } catch (err) {
        if (cancelled) return
        setError(err.message)
      }
    }

    poll() // immediate first fetch
    timerRef.current = setInterval(poll, POLL_MS)

    return () => {
      cancelled = true
      clearTimer()
    }
  }, [sessionId, pollToken])

  async function handleStart() {
    setBusy(true)
    setError(null)
    try {
      const data = await startSession(sessionId)
      setSession(data)
      setPollToken((t) => t + 1) // re-arm polling if it had stopped
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleStop() {
    setBusy(true)
    setError(null)
    try {
      const data = await stopSession(sessionId)
      setSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleBack() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    onBack() // LeadsScreen re-fetches /leads on mount
  }

  if (!session && !error) {
    return (
      <section className="screen">
        <p className="muted">Loading session…</p>
      </section>
    )
  }

  const running = session?.status === 'RUNNING'
  const lines = session?.lines || []
  const metrics = session?.metrics || {}
  const recentCalls = session?.recentCalls || []
  const winnerCallId = session?.winnerCallId

  return (
    <section className="screen">
      <div className="screen-head">
        <div className="session-title">
          <button className="btn btn-ghost" onClick={handleBack}>← Back to Leads</button>
          <span className="session-status">
            Session <span className="mono">{sessionId}</span>
            {session && (
              <span className={`pill pill-${running ? 'on' : 'off'}`}>{session.status}</span>
            )}
          </span>
        </div>
        <div className="actions">
          {running ? (
            <button className="btn btn-danger" onClick={handleStop} disabled={busy}>
              {busy ? '…' : 'Stop'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleStart} disabled={busy}>
              {busy ? '…' : 'Start'}
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Two concurrent lines */}
      <div className="lines-grid">
        {[0, 1].map((i) => {
          const line = lines[i]
          const isWinner = !!line && !!winnerCallId && line.callId === winnerCallId
          return <LineCard key={i} index={i} line={line} isWinner={isWinner} />
        })}
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <StatTile label="Attempted" value={metrics.attempted ?? 0} tone="neutral" />
        <StatTile label="Connected" value={metrics.connected ?? 0} tone="green" />
        <StatTile label="Failed" value={metrics.failed ?? 0} tone="amber" />
        <StatTile label="Canceled" value={metrics.canceled ?? 0} tone="red" />
      </div>

      {/* Call history + CRM status */}
      <div className="history">
        <h3>Call history</h3>
        {recentCalls.length === 0 ? (
          <p className="muted">No calls yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Disposition</th>
                <th>CRM</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id}>
                  <td>{call.leadName}</td>
                  <td><StatusBadge status={call.status} /></td>
                  <td><CrmCell call={call} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="api-note">API: {API_URL} · polling every {POLL_MS / 1000}s</p>
    </section>
  )
}

function StatTile({ label, value, tone }) {
  return (
    <div className={`stat-tile stat-${tone}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function CrmCell({ call }) {
  if (call.crmSynced) {
    return <span className="crm-ok">✓ {call.crmActivityId || 'synced'}</span>
  }
  if (call.status === 'RINGING') {
    return <span className="muted">in progress…</span>
  }
  return <span className="crm-pending">pending</span>
}
