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

const defaultSettings = {
  name: 'Gincana MT',
  event_date: '',
  event_time: '',
  location: '',
  objective: '',
  organization: '',
  min_members_per_team: 1,
  max_members_per_team: 5,
  max_teams: 10,
  theme: 'aviation',
  registration_open: true,
  icon: 'fa-leaf',
  logo_url: null,
  // Campos de aparência (antes no localStorage)
  primary_color: '#2ecc71',
  panel_title: 'PAINEL DE VOO',
  id_prefix: 'GNC',
  id_label: 'VOO',
  team_label: 'EQUIPE / DESTINO',
  leader_label: 'LÍDER',
  points_label: 'PONTOS'
}

export default function Settings({ showAlert }) {
  const [settings, setSettings] = useState(defaultSettings)
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
        setSettings(prev => ({ ...defaultSettings, ...data }))
        if (data.logo_url) setLogoPreview(data.logo_url)
        // Aplicar cor principal ao carregar
        if (data.primary_color) {
          document.documentElement.style.setProperty('--primary-color', data.primary_color)
          document.documentElement.style.setProperty('--primary', data.primary_color)
        }
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
      reader.onloadend = () => setLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let finalValue = value
    if (type === 'checkbox') finalValue = checked
    if (type === 'number') finalValue = parseInt(value) || 0

    setSettings(prev => ({ ...prev, [name]: finalValue }))

    // Preview instantâneo da cor principal
    if (name === 'primary_color') {
      document.documentElement.style.setProperty('--primary-color', value)
      document.documentElement.style.setProperty('--primary', value)
    }
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

      const { id, updated_at, ...rest } = settings
      const payload = { ...rest, logo_url: currentLogoUrl }

      if (!payload.event_date) payload.event_date = null
      if (!payload.event_time) payload.event_time = null

      const { error } = await supabase
        .from('event_settings')
        .upsert({ id: 1, ...payload })

      if (error) throw error

      // Limpar localStorage legado (migração)
      localStorage.removeItem('gincana_custom_labels')

      // Aplicar cor imediatamente
      if (payload.primary_color) {
        document.documentElement.style.setProperty('--primary-color', payload.primary_color)
        document.documentElement.style.setProperty('--primary', payload.primary_color)
      }

      showAlert('Configurações salvas com sucesso no banco de dados!', 'Sucesso!')
    } catch (error) {
      console.error('ERRO AO SALVAR:', error)
      showAlert(
        `Erro ao salvar: ${error.message || 'Erro desconhecido'}. Verifique se a tabela event_settings existe e se as permissões RLS estão corretas.`,
        'Erro'
      )
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
              <div className="image-upload-section" style={{ flex: 1, minWidth: '12.5rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem', display: 'block' }}>Upload de Imagem</label>
                <div className="image-upload-container">
                  {logoPreview ? (
                    <div className="image-preview">
                      <img src={logoPreview} alt="Logo Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setLogoPreview(null)
                          setSettings(p => ({ ...p, logo_url: null }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
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

              <div className="icon-selection-section" style={{ flex: 1, minWidth: '12.5rem' }}>
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
              <label>Mínimo de Membros</label>
              <input type="number" name="min_members_per_team" value={settings.min_members_per_team || 1} onChange={handleChange} min="1" />
            </div>
            <div className="form-group">
              <label>Máximo de Membros</label>
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

          <h3 className="section-title">Aparência do Painel de Voo e Site</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Cor Principal (Botões e Destaques)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  name="primary_color"
                  value={settings.primary_color || '#2ecc71'}
                  onChange={handleChange}
                  style={{ height: '2.5rem', width: '3.5rem', padding: '0.1rem', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  name="primary_color"
                  value={settings.primary_color || '#2ecc71'}
                  onChange={handleChange}
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.95rem' }}
                  placeholder="#2ecc71"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Título do Painel</label>
              <input type="text" name="panel_title" value={settings.panel_title || 'PAINEL DE VOO'} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prefixo do ID (ex: GNC)</label>
              <input type="text" name="id_prefix" value={settings.id_prefix || 'GNC'} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rótulo da Coluna de ID</label>
              <input type="text" name="id_label" value={settings.id_label || 'VOO'} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rótulo "Equipe/Destino"</label>
              <input type="text" name="team_label" value={settings.team_label || 'EQUIPE / DESTINO'} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rótulo "Líder"</label>
              <input type="text" name="leader_label" value={settings.leader_label || 'LÍDER'} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Rótulo "Pontos" (ex: Milhas)</label>
            <input type="text" name="points_label" value={settings.points_label || 'PONTOS'} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </div>
  )
}
