import { useCallback, useEffect, useRef, useState } from 'react'
import { getCrmContacts, getCrmActivities, API_URL } from '../api.js'
import StatusBadge from './StatusBadge.jsx'
import ErrorBanner from './ErrorBanner.jsx'

const AUTO_MS = 2000

function fmtTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function CrmInspectorScreen({ onBack }) {
  const [contacts, setContacts] = useState([])
  const [activities, setActivities] = useState([])
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [auto, setAuto] = useState(false)
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([getCrmContacts(), getCrmActivities()])
      setContacts(c)
      setActivities(a)
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // initial fetch
  useEffect(() => {
    load()
  }, [load])

  // optional auto-refresh
  useEffect(() => {
    if (!auto) return
    timerRef.current = setInterval(load, AUTO_MS)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [auto, load])

  // ---- idempotency check ----
  const ids = activities.map((a) => a.callId)
  const unique = new Set(ids).size
  const noDupes = ids.length === unique

  return (
    <div className="screen-wrap">
      {/* header */}
      <div className="topbar compact">
        <div className="dialer-head-left">
          <button className="btn btn-back" onClick={onBack}>
            <span style={{ fontSize: 14 }}>←</span>Back
          </button>
          <div className="divider" />
          <div className="dialer-title">CRM Inspector</div>
          <div className="block-note">mock CRM · in-memory</div>
        </div>
        <div className="topbar-right">
          <label className="auto-toggle">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            Auto-refresh 2s
          </label>
          <button className="btn btn-back" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* body */}
      <div className="page dialer">
        {offline && <ErrorBanner apiUrl={API_URL} />}

        {/* Contacts */}
        <div className="block-head">
          <div className="block-title">Contacts</div>
          <div className="block-note">{contacts.length} synced</div>
        </div>
        <div className="card" style={{ marginBottom: 28 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>CRM ID</th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="mono cell-accent">{c.id}</td>
                  <td className="cell-strong">{c.name}</td>
                  <td>{c.company}</td>
                  <td className="mono">{c.phone}</td>
                  <td className="cell-muted">{c.email}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="cell-empty">
                    {loading ? 'Loading…' : offline ? 'Could not load contacts.' : 'No contacts synced yet — run a session first.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Activities */}
        <div className="block-head">
          <div className="block-title">Activities</div>
          <div className={`idem-badge ${noDupes ? 'ok' : 'bad'}`}>
            <span className="badge-dot" />
            Activities: {ids.length} · Unique callId: {unique} ·{' '}
            {noDupes ? '✓ No duplicates' : '✗ DUPLICATES'}
          </div>
        </div>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Lead</th>
                <th>Call</th>
                <th>Disposition</th>
                <th>Notes</th>
                <th>Activity ID</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td className="mono cell-muted">{fmtTime(a.createdAt)}</td>
                  <td className="mono">{a.leadId}</td>
                  <td className="mono">{a.callId}</td>
                  <td><StatusBadge status={a.disposition} size="sm" /></td>
                  <td className="cell-muted">{a.notes}</td>
                  <td className="mono cell-accent">{a.id}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={6} className="cell-empty">
                    {loading ? 'Loading…' : offline ? 'Could not load activities.' : 'No activities yet — run a session to STOPPED first.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
