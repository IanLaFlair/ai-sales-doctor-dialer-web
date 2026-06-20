import { useEffect, useState } from 'react'
import { getLeads, createSession, API_URL } from '../api.js'
import ErrorBanner from './ErrorBanner.jsx'

const AGENT_ID = 'agent_1'

export default function LeadsScreen({ onSessionCreated }) {
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [offline, setOffline] = useState(false)

  async function loadLeads() {
    setLoading(true)
    try {
      const data = await getLeads()
      setLeads(data)
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (selected.size === 0) return
    setCreating(true)
    try {
      const session = await createSession(AGENT_ID, [...selected])
      onSessionCreated(session.id)
    } catch {
      setOffline(true)
      setCreating(false)
    }
  }

  const selectedLabel = `${selected.size} of ${leads.length} selected`
  const createDisabled = selected.size === 0 || creating

  return (
    <div className="screen-wrap">
      {/* header */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-logo">SD</div>
          <div className="brand-name">Sales Dialer</div>
          <div className="brand-tag">ADVANCED</div>
        </div>
        <div className="topbar-right">
          <div className={`conn-pill ${offline ? 'off' : 'ok'}`}>
            <span className="conn-dot" />
            {offline ? 'Backend unreachable' : 'API connected'}
          </div>
          <div className="agent-chip">
            <span className="agent-avatar">A1</span>agent_1
          </div>
        </div>
      </div>

      {/* body */}
      <div className="page leads">
        {offline && <ErrorBanner apiUrl={API_URL} />}

        <div className="section-head">
          <div>
            <div className="section-title">Leads</div>
            <div className="section-sub">
              Select leads to build a parallel-dial session. The dialer rings two lines at once.
            </div>
          </div>
          <div className="count-pill">{selectedLabel}</div>
        </div>

        <div className="card">
          <div className="leads-grid-head">
            <div></div>
            <div>Lead</div>
            <div>Phone</div>
            <div>Email</div>
            <div>CRM</div>
          </div>

          {leads.map((lead) => {
            const checked = selected.has(lead.id)
            return (
              <div
                key={lead.id}
                className={`leads-row ${checked ? 'selected' : ''}`}
                onClick={() => toggle(lead.id)}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${lead.name}`}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-company">{lead.company}</div>
                </div>
                <div className="lead-phone">{lead.phone}</div>
                <div className="lead-email">{lead.email}</div>
                <div>
                  {lead.crmExternalId ? (
                    <span className="crm-chip">
                      <span className="dot" />
                      {lead.crmExternalId}
                    </span>
                  ) : (
                    <span className="crm-dash">—</span>
                  )}
                </div>
              </div>
            )
          })}

          {leads.length === 0 && (
            <div className="empty-history">
              {loading ? 'Loading leads…' : offline ? 'Could not load leads.' : 'No leads found.'}
            </div>
          )}
        </div>
      </div>

      {/* sticky footer */}
      <div className="sticky-foot">
        <div className="sticky-foot-inner">
          <div className="foot-meta">
            {selectedLabel} · agent <span className="mono">agent_1</span>
          </div>
          <button className="btn btn-primary" disabled={createDisabled} onClick={handleCreate}>
            {creating ? 'Creating…' : 'Create Dialer Session'}
            <span style={{ fontSize: 15 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
