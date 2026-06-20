// Thin fetch wrapper around the Advanced backend.
// VITE_API_URL is baked in at build time; defaults to localhost for dev.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (err) {
    // Network-level failure (backend unreachable, CORS, DNS, etc.)
    throw new Error(`Could not reach the backend at ${API_URL}`)
  }
  if (!res.ok) {
    throw new Error(`${options?.method || 'GET'} ${path} failed (${res.status})`)
  }
  return res.json()
}

export const getLeads = () => request('/leads')

export const createSession = (agentId, leadIds) =>
  request('/sessions', { method: 'POST', body: JSON.stringify({ agentId, leadIds }) })

export const startSession = (id) =>
  request(`/sessions/${id}/start`, { method: 'POST' })

export const stopSession = (id) =>
  request(`/sessions/${id}/stop`, { method: 'POST' })

export const getSession = (id) => request(`/sessions/${id}`)
