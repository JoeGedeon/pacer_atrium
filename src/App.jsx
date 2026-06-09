import { useState, useEffect } from 'react'
import LeftNav from './components/LeftNav'
import ObservationStream from './components/ObservationStream'
import PACERProcessing from './components/PACERProcessing'

function loadObservations() {
  try {
    return JSON.parse(localStorage.getItem('pacer_observations') || '[]').map(o => ({
      ...o,
      timestamp: new Date(o.timestamp),
    }))
  } catch {
    return []
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('notice')
  const [observations, setObservations] = useState(loadObservations)
  const [activeObservation, setActiveObservation] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('pacer_observations', JSON.stringify(observations))
    } catch { /* storage full */ }
  }, [observations])

  function submitObservation(obs) {
    const entry = {
      id: Date.now(),
      text: obs.text,
      type: obs.type,
      timestamp: new Date(),
      status: 'received',
      destination: null,
    }
    setObservations(prev => [entry, ...prev])
    setActiveObservation(entry)
  }

  function routeObservation(id, destination) {
    setObservations(prev =>
      prev.map(obs => obs.id === id ? { ...obs, destination, status: 'routed' } : obs)
    )
    setActiveObservation(prev =>
      prev?.id === id ? { ...prev, destination, status: 'routed' } : prev
    )
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#07090f', color: '#dde3f0' }}
    >
      <LeftNav activeSection={activeSection} onSelect={setActiveSection} />
      <ObservationStream
        observations={observations}
        onSubmit={submitObservation}
        activeObservation={activeObservation}
        onSelectObservation={setActiveObservation}
        activeSection={activeSection}
      />
      <PACERProcessing
        observation={activeObservation}
        onRoute={routeObservation}
      />
    </div>
  )
}
