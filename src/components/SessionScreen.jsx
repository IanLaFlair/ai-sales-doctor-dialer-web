import { useEffect, useRef, useState } from 'react'
import { getSession, startSession, stopSession, API_URL } from '../api.js'
import StatusBadge from './StatusBadge.jsx'
import LineCard from './LineCard.jsx'
import ErrorBanner from './ErrorBanner.jsx'

const POLL_MS = 1000

export default function SessionScreen({ sessionId, onBack }) {
  const [session, setSession] = useState(null)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  // Bumped to (re)arm the polling effect, e.g. after Start following a STOPPED state.
  const [pollToken, setPollToken] = useState(0)
  const timerRef = useRef(null)

  // Poll GET /sessions/:id every 1s. Stop on unmount and when STOPPED.
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
        setOffline(false)
        if (data.status === 'STOPPED') clearTimer() // one final fetch is fine
      } catch {
        if (cancelled) return
        setOffline(true)
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
    try {
      const data = await startSession(sessionId)
      setSession(data)
      setOffline(false)
      setPollToken((t) => t + 1) // re-arm polling if it had stopped
    } catch {
      setOffline(true)
    } finally {
      setBusy(false)
    }
  }

  async function handleStop() {
    setBusy(true)
    try {
      const data = await stopSession(sessionId)
      setSession(data)
      setOffline(false)
    } catch {
      setOffline(true)
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

  const running = session?.status === 'RUNNING'
  const lines = session?.lines || []
  const metrics = session?.metrics || {}
  const recentCalls = session?.recentCalls || []
  const winnerCallId = session?.winnerCallId
  const queueRemaining = session?.leadQueue?.length ?? 0
  const concurrency = session?.concurrency ?? 2

  return (
    <div className="screen-wrap">
      {/* header */}
      <div className="topbar compact">
        <div className="dialer-head-left">
          <button className="btn btn-back" onClick={handleBack}>
            <span style={{ fontSize: 14 }}>←</span>Leads
          </button>
          <div className="divider" />
          <div className="dialer-title">Dialer session</div>
          <div className="sess-id">{sessionId}</div>
          {session && (
            <div className={`sess-status ${running ? 'running' : 'stopped'}`}>{session.status}</div>
          )}
        </div>
        <div className="topbar-right">
          <div className={`poll-ind ${running ? 'live' : 'paused'}`}>
            <span className="poll-dot" />
            {running ? 'Live · polling every 1s' : 'Polling paused'}
          </div>
          {running ? (
            <button className="btn btn-stop" onClick={handleStop} disabled={busy}>
              <span className="stop-sq" />
              {busy ? '…' : 'Stop'}
            </button>
          ) : (
            <button className="btn btn-start" onClick={handleStart} disabled={busy}>
              <span className="play-tri" />
              {busy ? '…' : 'Start'}
            </button>
          )}
        </div>
      </div>

      {/* body */}
      <div className="page dialer">
        {offline && <ErrorBanner apiUrl={API_URL} />}

        {/* live lines */}
        <div className="block-head">
          <div className="block-head-left">
            <div className="block-title">Live lines</div>
            <div className="block-note">concurrency {concurrency}</div>
          </div>
          <div className="queue-pill">{queueRemaining} in queue</div>
        </div>
        <div className="lines-grid">
          {[0, 1].map((i) => {
            const line = lines[i]
            const isWinner = !!line && !!winnerCallId && line.callId === winnerCallId
            return <LineCard key={i} index={i} line={line} isWinner={isWinner} running={running} />
          })}
        </div>

        {/* metrics */}
        <div className="block-title" style={{ marginBottom: 13 }}>Session metrics</div>
        <div className="metrics-grid">
          <Metric label="Attempted" value={metrics.attempted ?? 0} />
          <Metric label="Connected" value={metrics.connected ?? 0} tone="green" />
          <Metric label="Failed" value={metrics.failed ?? 0} tone="amber" />
          <Metric label="Canceled" value={metrics.canceled ?? 0} tone="red" />
        </div>

        {/* history */}
        <div className="block-head">
          <div className="block-title">Call history &amp; CRM sync</div>
          <div className="block-note">{recentCalls.length} calls</div>
        </div>
        <div className="card">
          {recentCalls.length === 0 ? (
            <div className="empty-history">
              No calls yet — press <strong>Start</strong> to begin dialing the queue.
            </div>
          ) : (
            <>
              <div className="hist-grid-head">
                <div>Lead</div>
                <div>Disposition</div>
                <div className="hist-head-right">CRM activity</div>
              </div>
              {recentCalls.map((call) => (
                <div className="hist-row" key={call.id}>
                  <div className="hist-name">{call.leadName}</div>
                  <div>
                    <StatusBadge status={call.status} size="sm" />
                  </div>
                  <div className={`hist-crm ${call.crmSynced ? 'synced' : ''}`}>
                    <CrmText call={call} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${tone || ''}`}>{value}</div>
    </div>
  )
}

function CrmText({ call }) {
  if (call.crmSynced) return <>✓ {call.crmActivityId || 'synced'}</>
  if (call.status === 'RINGING') return <>in progress…</>
  return <>syncing to CRM…</>
}
