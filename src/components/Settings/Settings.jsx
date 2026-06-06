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
  { value: 'fa-plane-departure', label: 'Decolagem' },
  { value: 'fa-rocket', label: 'Foguete' },
  { value: 'fa-helicopter', label: 'Helicóptero' },
  { value: 'fa-ship', label: 'Navio' },
  { value: 'fa-car', label: 'Carro' },
  { value: 'fa-bicycle', label: 'Bicicleta' },
  { value: 'fa-running', label: 'Corrida' },
  { value: 'fa-globe', label: 'Globo' },
  { value: 'fa-route', label: 'Rota' },
  { value: 'fa-map-marker-alt', label: 'Marcador' },
  { value: 'fa-compass', label: 'Bússola' },
  { value: 'fa-ticket-alt', label: 'Ticket' },
  { value: 'fa-users', label: 'Equipe' },
  { value: 'fa-gamepad', label: 'Controle' },
  { value: 'fa-shield-alt', label: 'Escudo' },
  { value: 'fa-lightbulb', label: 'Ideia' },
  { value: 'fa-music', label: 'Música' },
  { value: 'fa-flag', label: 'Bandeira' },
  { value: 'fa-smile', label: 'Sorriso' },
  { value: 'fa-gift', label: 'Presente' },
  { value: 'fa-brain', label: 'Cérebro' },
  { value: 'fa-book', label: 'Livro' },
  { value: 'fa-laptop', label: 'Notebook' },
  { value: 'fa-graduation-cap', label: 'Formatura' },
  { value: 'fa-umbrella', label: 'Guarda-chuva' },
  { value: 'fa-hourglass-half', label: 'Ampulheta' }
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
  points_label: 'PONTOS',
  challenge_label: 'Desafio',
  challenge_label_plural: 'Desafios'
}

export default function Settings({ showAlert, showConfirm, onRefreshSettings }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [courses, setCourses] = useState([])
  const [newCourseName, setNewCourseName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchSettings()
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
    }
  }

  async function addCourse(e) {
    e.preventDefault()
    const name = newCourseName.trim()
    if (!name) return

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{ name }])
        .select()
        .single()
      
      if (error) throw error
      setCourses(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)))
      setNewCourseName('')
      showAlert('Curso adicionado com sucesso!', 'Sucesso')
    } catch (error) {
      console.error('Erro ao adicionar curso:', error)
      showAlert('Erro ao adicionar curso. O nome pode ser duplicado.')
    }
  }

  function removeCourse(id) {
    showConfirm('Deseja realmente remover este curso? Alunos já cadastrados com ele não serão afetados, mas novos alunos não poderão selecioná-lo.', async () => {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        setCourses(prev => prev.filter(c => c.id !== id))
      } catch (error) {
        console.error('Erro ao remover curso:', error)
        showAlert('Erro ao remover curso.')
      }
    })
  }

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
      if (onRefreshSettings) onRefreshSettings()
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

          <div className="form-row">
            <div className="form-group">
              <label>Rótulo de Desafio (Singular)</label>
              <input type="text" name="challenge_label" value={settings.challenge_label || 'Desafio'} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rótulo de Desafio (Plural)</label>
              <input type="text" name="challenge_label_plural" value={settings.challenge_label_plural || 'Desafios'} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <i className="fas fa-save"></i> {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>Gerenciar Cursos</h2>
        </div>
        
        <form onSubmit={addCourse} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Nome do Novo Curso</label>
            <input 
              type="text" 
              value={newCourseName} 
              onChange={e => setNewCourseName(e.target.value)} 
              placeholder="Ex: Superior - Tecnologia em Alimentos"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '2.8rem' }}>Adicionar</button>
        </form>

        <div className="table-responsive">
          <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nome do Curso</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', width: '5rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm" 
                      onClick={() => removeCourse(c.id)} 
                      title="Excluir Curso"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                    Nenhum curso cadastrado. O sistema usará a lista padrão.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
