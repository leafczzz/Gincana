import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import './Settings.css'

const iconOptions = [
  { value: 'fa-star', label: 'Estrela' },
  { value: 'fa-trophy', label: 'Troféu' },
  { value: 'fa-medal', label: 'Medalha' },
  { value: 'fa-crown', label: 'Coroa' },
  { value: 'fa-bolt', label: 'Raio' },
  { value: 'fa-heart', label: 'Coração' },
  { value: 'fa-fire', label: 'Fogo' },
  { value: 'fa-mountain', label: 'Montanha' },
  { value: 'fa-tree', label: 'Árvore' },
  { value: 'fa-sun', label: 'Sol' },
  { value: 'fa-moon', label: 'Lua' },
  { value: 'fa-cloud', label: 'Nuvem' },
  { value: 'fa-leaf', label: 'Folha' },
  { value: 'fa-plane', label: 'Avião' },
  { value: 'fa-rocket', label: 'Foguete' },
  { value: 'fa-globe', label: 'Globo' }
]

export default function Settings({ showAlert }) {
  const [settings, setSettings] = useState({
    name: 'Gincana MT',
    event_date: '',
    event_time: '',
    location: '',
    objective: '',
    organization: '',
    max_members_per_team: 5,
    theme: 'aviation',
    registration_open: true,
    icon: 'fa-leaf',
    logo_url: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const fileInputRef = useRef(null)

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
      if (data) {
        setSettings(data)
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let finalValue = value
    if (type === 'checkbox') finalValue = checked
    if (type === 'number') finalValue = parseInt(value) || 0

    setSettings(prev => ({
      ...prev,
      [name]: finalValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let currentLogoUrl = settings.logo_url
      const file = fileInputRef.current?.files[0]

      if (file) {
        const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage.from('bd').upload(fileName, file)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('bd').getPublicUrl(fileName)
        currentLogoUrl = publicUrl
      }

      const { id, ...settingsWithoutId } = settings
      const payload = { ...settingsWithoutId, logo_url: currentLogoUrl }
      
      if (!payload.event_date) payload.event_date = null
      if (!payload.event_time) payload.event_time = null
      
      const { error } = await supabase
        .from('event_settings')
        .upsert({ id: 1, ...payload })
      
      if (error) throw error
      showAlert('Configurações salvas com sucesso!', 'Sucesso!')
    } catch (error) {
      console.error('ERRO COMPLETO AO SALVAR:', error)
      showAlert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}. Verifique se a tabela event_settings existe e se as permissões RLS estão corretas.`, 'Erro')
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

          <div className="form-group">
            <label>Logo do Evento (Imagem ou Ícone)</label>
            <div className="logo-options" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div className="image-upload-section" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem', display: 'block' }}>Upload de Imagem</label>
                <div className="image-upload-container">
                  {logoPreview ? (
                    <div className="image-preview">
                      <img src={logoPreview} alt="Logo Preview" />
                      <button type="button" className="remove-image" onClick={() => { setLogoPreview(null); setSettings(p => ({ ...p, logo_url: null })); if(fileInputRef.current) fileInputRef.current.value = ''; }}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                      <i className="fas fa-image"></i>
                      <span>Clique para subir logo PNG</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="icon-selection-section" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem', display: 'block' }}>Ou escolha um Ícone</label>
                <div className="icon-select" style={{ marginTop: '0', background: 'rgba(255,255,255,0.02)' }}>
                  {iconOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`icon-option ${settings.icon === opt.value && !logoPreview ? 'selected' : ''}`}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, icon: opt.value, logo_url: null }))
                        setLogoPreview(null)
                      }}
                      title={opt.label}
                    >
                      <i className={`fas ${opt.value}`}></i>
                    </button>
                  ))}
                </div>
              </div>
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
