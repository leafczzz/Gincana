import { useState, useEffect } from 'react'
import './FlightPanel.css'

export default function FlightPanel({ teams, onBack }) {
  const [customLabels, setCustomLabels] = useState({
    idLabel: 'VOO',
    idPrefix: 'GNC',
    teamLabel: 'EQUIPE / DESTINO',
    leaderLabel: 'LÍDER',
    pointsLabel: 'PONTOS',
    panelTitle: 'PAINEL DE VOO'
  })
  const [eventSettings, setEventSettings] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('gincana_custom_labels')
    if (saved) {
      try {
        setCustomLabels(prev => ({ ...prev, ...JSON.parse(saved) }))
      } catch (e) {
        console.error(e)
      }
    }
    const savedEventSettings = localStorage.getItem('gincana_event_settings')
    if (savedEventSettings) {
      try {
        setEventSettings(JSON.parse(savedEventSettings))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  return (
    <section id="flight-panel" className="section">
      <div className="flight-board">
        <div className="flight-board-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn-back-flight" title="Voltar">
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <h2><i className={`fas ${eventSettings?.icon || 'fa-plane-departure'}`}></i> {customLabels.panelTitle}</h2>
          </div>
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>AO VIVO</span>
          </div>
        </div>
        
        <div className="flight-table-container">
          <table className="flight-table">
            <thead>
              <tr>
                <th>{customLabels.idLabel}</th>
                <th>{customLabels.teamLabel}</th>
                <th>{customLabels.leaderLabel}</th>
                <th>{customLabels.pointsLabel}</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">NENHUM VOO PROGRAMADO</td>
                </tr>
              ) : (
                teams.map((t, index) => {
                  const flightNumber = `${customLabels.idPrefix}-${String(index + 1).padStart(3, '0')}`
                  const maxScore = Math.max(...teams.map(team => team.score))
                  const isLeader = t.score > 0 && t.score === maxScore
                  const isWaiting = t.score === 0
                  
                  let statusText = 'DISPUTANDO'
                  let dotClass = ''
                  let statusColor = '#2ecc71'
                  
                  if (isLeader) {
                    statusText = 'LIDERANDO'
                    dotClass = 'leading'
                    statusColor = '#e74c3c'
                  } else if (isWaiting) {
                    statusText = 'AGUARDANDO'
                    dotClass = 'waiting'
                    statusColor = '#f1c40f'
                  }
                  
                  return (
                    <tr key={t.id}>
                      <td className="flight-number">{flightNumber}</td>
                      <td className="team-name">
                        {t.name.toUpperCase()}
                      </td>
                      <td className="leader-name">
                        {t.profiles?.name ? t.profiles.name.toUpperCase() : 'N/A'}
                      </td>
                      <td className="points-col">
                        {String(t.score).padStart(4, '0')}
                      </td>
                      <td className="status-col" style={{ color: statusColor }}>
                        <span className={`pulse-dot-small ${dotClass}`}></span>
                        <span style={{ verticalAlign: 'middle' }}>{statusText}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
