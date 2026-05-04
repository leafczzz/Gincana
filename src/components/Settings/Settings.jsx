import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    name: 'Gincana MT',
    event_date: '',
    event_time: '',
    location: '',
    objective: '',
    organization: '',
    max_teams: 10,
    max_members_per_team: 5,
    theme: 'aviation',
    registration_open: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      if (data) setSettings(data)
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...settings }
      if (!payload.event_date) payload.event_date = null
      if (!payload.event_time) payload.event_time = null
      
      const { error } = await supabase
        .from('event_settings')
        .upsert({ id: 1, ...payload })
      
      if (error) throw error
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações. Verifique o console para mais detalhes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-state">Carregando configurações...</div>

  return (
    <div className="settings-container">
      <div className="card">
        <div className="card-header">
          <h2>Configurações do Evento</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Evento</label>
              <input type="text" name="name" value={settings.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Organização</label>
              <input type="text" name="organization" value={settings.organization || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input type="date" name="event_date" value={settings.event_date || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" name="event_time" value={settings.event_time || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Local</label>
            <input type="text" name="location" value={settings.location || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Objetivo</label>
            <textarea name="objective" value={settings.objective || ''} onChange={handleChange} rows="3"></textarea>
          </div>

          <h3 className="section-title">Regras de Inscrição</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Máximo de Equipes</label>
              <input type="number" name="max_teams" value={settings.max_teams || 10} onChange={handleChange} min="1" />
            </div>
            <div className="form-group">
              <label>Máximo de Membros por Equipe</label>
              <input type="number" name="max_members_per_team" value={settings.max_members_per_team || 5} onChange={handleChange} min="1" />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="registration_open" 
              name="registration_open" 
              checked={settings.registration_open !== false} 
              onChange={handleChange} 
            />
            <label htmlFor="registration_open">Inscrições Abertas</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </div>
  )
}
