import { useState } from 'react'
import LeadsScreen from './components/LeadsScreen.jsx'
import SessionScreen from './components/SessionScreen.jsx'

export default function App() {
  // No router per spec — switch screens via state.
  const [sessionId, setSessionId] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>📞 AI Sales Dialer</h1>
      </header>
      <main className="app-main">
        {sessionId ? (
          <SessionScreen
            sessionId={sessionId}
            onBack={() => setSessionId(null)}
          />
        ) : (
          <LeadsScreen onSessionCreated={(id) => setSessionId(id)} />
        )}
      </main>
    </div>
  )
}
