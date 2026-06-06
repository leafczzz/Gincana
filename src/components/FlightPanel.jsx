import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './FlightPanel.css'

const defaultLabels = {
  idLabel: 'VOO',
  idPrefix: 'GNC',
  teamLabel: 'EQUIPE / DESTINO',
  leaderLabel: 'LÍDER',
  pointsLabel: 'PONTOS',
  panelTitle: 'PAINEL DE VOO'
}

export default function FlightPanel({ teams, onBack }) {
  const [labels, setLabels] = useState(null)
  const [eventSettings, setEventSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('icon, logo_url, name, panel_title, id_prefix, id_label, team_label, leader_label, points_label, primary_color')
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setEventSettings(data)
          setLabels({
            idLabel: data.id_label || defaultLabels.idLabel,
            idPrefix: data.id_prefix || defaultLabels.idPrefix,
            teamLabel: data.team_label || defaultLabels.teamLabel,
            leaderLabel: data.leader_label || defaultLabels.leaderLabel,
            pointsLabel: data.points_label || defaultLabels.pointsLabel,
            panelTitle: data.panel_title || defaultLabels.panelTitle
          })
          if (data.primary_color) {
            document.documentElement.style.setProperty('--primary-color', data.primary_color)
            document.documentElement.style.setProperty('--primary', data.primary_color)
          }
        } else {
          setLabels(defaultLabels)
        }
      } catch (err) {
        console.error('Erro ao buscar configurações do painel:', err)
        setLabels(defaultLabels)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  if (loading || !labels) return <div className="loading-state">Sincronizando painel...</div>


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
            <h2><i className={`fas ${eventSettings?.icon || 'fa-plane-departure'}`}></i> {labels.panelTitle}</h2>
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
                <th>{labels.idLabel ? labels.idLabel.toUpperCase() : ''}</th>
                <th>{labels.teamLabel ? labels.teamLabel.toUpperCase() : ''}</th>
                <th>{labels.leaderLabel ? labels.leaderLabel.toUpperCase() : ''}</th>
                <th>{labels.pointsLabel ? labels.pointsLabel.toUpperCase() : ''}</th>
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
                  const flightNumber = `${labels.idPrefix}-${String(index + 1).padStart(3, '0')}`
                  const maxScore = Math.max(...teams.map(team => team.score))
                  const isLeader = t.score > 0 && t.score === maxScore
                  const isWaiting = t.score === 0
                  const isDisqualified = t.score < 0

                  let statusText = 'DISPUTANDO'
                  let dotClass = ''
                  let statusColor = '#2ecc71'

                  if (isDisqualified) {
                    statusText = 'DESCLASSIFICADO'
                    dotClass = 'disqualified'
                    statusColor = '#95a5a6'
                  } else if (isLeader) {
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
                      <td className="team-name">{t.name.toUpperCase()}</td>
                      <td className="leader-name">
                        {t.profiles?.name ? t.profiles.name.toUpperCase() : 'N/A'}
                      </td>
                      <td className="points-col">{t.score < 0 ? String(t.score) : String(t.score).padStart(4, '0')}</td>
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
