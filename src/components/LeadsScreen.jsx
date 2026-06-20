import { useEffect, useState } from 'react'
import { getLeads, createSession, API_URL } from '../api.js'
import ErrorBanner from './ErrorBanner.jsx'

const AGENT_ID = 'agent_1'

export default function LeadsScreen({ onSessionCreated }) {
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  async function loadLeads() {
    setLoading(true)
    setError(null)
    try {
      const data = await getLeads()
      setLeads(data)
    } catch (err) {
      setError(err.message)
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
    setCreating(true)
    setError(null)
    try {
      const session = await createSession(AGENT_ID, [...selected])
      onSessionCreated(session.id)
    } catch (err) {
      setError(err.message)
      setCreating(false)
    }
  }

  return (
    <section className="screen">
      <div className="screen-head">
        <h2>Leads</h2>
        <button className="btn btn-ghost" onClick={loadLeads} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <ErrorBanner message={error} />

      {leads.length === 0 && !loading && !error ? (
        <p className="muted">No leads found.</p>
      ) : (
        <div className="table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th className="col-check"></th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>CRM</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={selected.has(lead.id) ? 'row-selected' : ''}
                  onClick={() => toggle(lead.id)}
                >
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggle(lead.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>
                  <td>{lead.name}</td>
                  <td>{lead.company}</td>
                  <td className="mono">{lead.phone}</td>
                  <td className="muted">{lead.email}</td>
                  <td>
                    {lead.crmExternalId ? (
                      <span className="crm-link" title={lead.crmExternalId}>
                        🔗 {lead.crmExternalId}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="screen-foot">
        <span className="muted">{selected.size} selected</span>
        <button
          className="btn btn-primary"
          disabled={selected.size === 0 || creating}
          onClick={handleCreate}
        >
          {creating ? 'Creating…' : 'Create Dialer Session'}
        </button>
      </div>

      <p className="api-note">API: {API_URL}</p>
    </section>
  )
}
