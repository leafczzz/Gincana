import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './LandingPage.css'

export default function LandingPage({ onEnterApp, onViewDashboard }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('*')
          .single()
        
        if (error) throw error
        setSettings(data)
      } catch (error) {
        console.error('Erro ao buscar configurações:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  if (loading) {
    return <div className="loading-screen">Carregando...</div>
  }

  const eventName = settings?.name || 'Gincana MT'
  const logoUrl = settings?.logo_url || null
  const dateStr = settings?.event_date ? new Date(settings.event_date).toLocaleDateString('pt-BR') : 'A definir'
  const timeStr = settings?.event_time ? settings.event_time.substring(0, 5) : ''
  const location = settings?.location || 'Local a definir'
  const objective = settings?.objective || 'Integração e diversão'
  const organization = settings?.organization || 'Comissão Organizadora'

  return (
    <div className="landing-page">
      <div className="landing-content">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo do Evento" className="landing-logo" />
        ) : (
          <div className="landing-icon"><i className="fas fa-leaf"></i></div>
        )}
        <h1 className="landing-title">{eventName}</h1>
        
        <div className="landing-details">
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span>{dateStr} {timeStr && `às ${timeStr}`}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{location}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-bullseye"></i>
            <span>{objective}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-users"></i>
            <span>Organização: {organization}</span>
          </div>
        </div>

        <div className="landing-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-large" onClick={onEnterApp}>
            Acessar Sistema
          </button>
          <button className="btn btn-secondary btn-large" onClick={onViewDashboard} style={{ background: 'transparent', border: '2px solid var(--primary-color)' }}>
            Ver Placar Público
          </button>
        </div>
      </div>
    </div>
  )
}
