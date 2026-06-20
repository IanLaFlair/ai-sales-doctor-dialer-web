import { useState } from 'react'
import LeadsScreen from './components/LeadsScreen.jsx'
import SessionScreen from './components/SessionScreen.jsx'
import CrmInspectorScreen from './components/CrmInspectorScreen.jsx'

export default function App() {
  // No router per spec — switch screens via state.
  const [screen, setScreen] = useState('leads') // 'leads' | 'session' | 'crm'
  const [sessionId, setSessionId] = useState(null)
  const [crmReturn, setCrmReturn] = useState('leads') // where CRM's Back goes

  function openCrm(from) {
    setCrmReturn(from)
    setScreen('crm')
  }

  if (screen === 'crm') {
    return <CrmInspectorScreen onBack={() => setScreen(crmReturn)} />
  }

  if (screen === 'session' && sessionId) {
    return (
      <SessionScreen
        sessionId={sessionId}
        onBack={() => setScreen('leads')}
        onOpenCrm={() => openCrm('session')}
      />
    )
  }

  return (
    <LeadsScreen
      onSessionCreated={(id) => {
        setSessionId(id)
        setScreen('session')
      }}
      onOpenCrm={() => openCrm('leads')}
    />
  )
}
