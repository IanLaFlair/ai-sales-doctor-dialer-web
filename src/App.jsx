import { useState } from 'react'
import LeadsScreen from './components/LeadsScreen.jsx'
import SessionScreen from './components/SessionScreen.jsx'

export default function App() {
  // No router per spec — switch screens via state.
  const [sessionId, setSessionId] = useState(null)

  return sessionId ? (
    <SessionScreen sessionId={sessionId} onBack={() => setSessionId(null)} />
  ) : (
    <LeadsScreen onSessionCreated={(id) => setSessionId(id)} />
  )
}
