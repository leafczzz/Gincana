import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './FlightPlan.css'

const defaultTicketSettings = {
  title: 'PLANO DE VOO',
  leaderLabel: 'PILOTO',
  membersLabel: 'TRIPULAÇÃO',
  airline: 'IFF AIRLINES',
  passTitle: 'TICKET DE EMBARQUE',
  icon: 'fa-plane',
  removeRoute: false
}

export default function FlightPlan({ teams, challenges, eventSettings }) {
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [customLabels, setCustomLabels] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  const [ticketSettings, setTicketSettings] = useState(defaultTicketSettings)

  // Rótulos temporários para o modal de configurações
  const [tempTitle, setTempTitle] = useState(defaultTicketSettings.title)
  const [tempLeaderLabel, setTempLeaderLabel] = useState(defaultTicketSettings.leaderLabel)
  const [tempMembersLabel, setTempMembersLabel] = useState(defaultTicketSettings.membersLabel)
  const [tempAirline, setTempAirline] = useState(defaultTicketSettings.airline)
  const [tempPassTitle, setTempPassTitle] = useState(defaultTicketSettings.passTitle)
  const [tempIcon, setTempIcon] = useState(defaultTicketSettings.icon)
  const [tempRemoveRoute, setTempRemoveRoute] = useState(defaultTicketSettings.removeRoute)

  // Sincroniza temporários quando abre o modal
  useEffect(() => {
    if (showConfigModal) {
      setTempTitle(ticketSettings.title)
      setTempLeaderLabel(ticketSettings.leaderLabel)
      setTempMembersLabel(ticketSettings.membersLabel)
      setTempAirline(ticketSettings.airline)
      setTempPassTitle(ticketSettings.passTitle)
      setTempIcon(ticketSettings.icon)
      setTempRemoveRoute(!!ticketSettings.removeRoute)
    }
  }, [showConfigModal, ticketSettings])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    const newSettings = {
      title: tempTitle.trim() || 'PLANO DE VOO',
      leaderLabel: tempLeaderLabel.trim() || 'PILOTO',
      membersLabel: tempMembersLabel.trim() || 'TRIPULAÇÃO',
      airline: tempAirline.trim() || 'IFF AIRLINES',
      passTitle: tempPassTitle.trim() || 'TICKET DE EMBARQUE',
      icon: tempIcon,
      removeRoute: tempRemoveRoute
    }

    // Salva localmente primeiro (resiliência instantânea)
    setTicketSettings(newSettings)
    localStorage.setItem('gincana_ticket_settings', JSON.stringify(newSettings))

    // Tenta salvar no Supabase
    try {
      const { data: currentSettings, error: selectError } = await supabase
        .from('event_settings')
        .select('id')
        .single()

      if (selectError) throw selectError

      if (currentSettings) {
        const { error: updateError } = await supabase
          .from('event_settings')
          .update({
            ticket_title: newSettings.title,
            ticket_leader_label: newSettings.leaderLabel,
            ticket_members_label: newSettings.membersLabel,
            ticket_airline: newSettings.airline,
            ticket_pass_title: newSettings.passTitle,
            ticket_icon: newSettings.icon,
            ticket_remove_route: newSettings.removeRoute
          })
          .eq('id', currentSettings.id)

        if (updateError) throw updateError
        console.log('Configurações de tickets atualizadas com sucesso no Supabase.')
      }
    } catch (err) {
      console.warn('Não foi possível salvar as configurações de tickets no Supabase (as colunas podem não ter sido criadas ainda). Elas foram mantidas localmente.', err)
    }

    setShowConfigModal(false)
  }

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


  useEffect(() => {
    async function fetchLabels() {
      // Função auxiliar para carregar do localStorage
      const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('gincana_ticket_settings')
        if (saved) {
          try {
            setTicketSettings(prev => ({ ...prev, ...JSON.parse(saved) }))
          } catch (e) {
            setTicketSettings(defaultTicketSettings)
          }
        } else {
          setTicketSettings(defaultTicketSettings)
        }
      }

      try {
        // Tenta primeiro consultar incluindo as colunas do ticket
        const { data, error } = await supabase
          .from('event_settings')
          .select('id_prefix, id_label, team_label, leader_label, points_label, panel_title, primary_color, ticket_title, ticket_leader_label, ticket_members_label, ticket_airline, ticket_pass_title, ticket_icon, ticket_remove_route')
          .single()

        if (error) {
          // Se falhou (por exemplo, porque as colunas de ticket não existem no BD ainda), faz a consulta básica
          console.warn('Erro ao buscar novas colunas de ticket no BD, tentando query padrão:', error)
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('event_settings')
            .select('id_prefix, id_label, team_label, leader_label, points_label, panel_title, primary_color')
            .single()

          if (fallbackError && fallbackError.code !== 'PGRST116') throw fallbackError

          if (fallbackData) {
            setCustomLabels({
              idPrefix: fallbackData.id_prefix,
              idLabel: fallbackData.id_label,
              teamLabel: fallbackData.team_label,
              leaderLabel: fallbackData.leader_label,
              pointsLabel: fallbackData.points_label,
              panelTitle: fallbackData.panel_title
            })
          } else {
            // Tenta carregar do localStorage legado se houver
            const savedLegacy = localStorage.getItem('gincana_custom_labels')
            if (savedLegacy) {
              try { setCustomLabels(JSON.parse(savedLegacy)) } catch(e) { setCustomLabels({}) }
            } else {
              setCustomLabels({})
            }
          }
          // Carrega as configurações de ticket do localStorage
          loadFromLocalStorage()
        } else if (data) {
          setCustomLabels({
            idPrefix: data.id_prefix,
            idLabel: data.id_label,
            teamLabel: data.team_label,
            leaderLabel: data.leader_label,
            pointsLabel: data.points_label,
            panelTitle: data.panel_title
          })

          // Se a tabela já possuir as novas colunas e elas não forem nulas, usa-as. Caso contrário, usa fallback do localStorage/default.
          const savedLocal = localStorage.getItem('gincana_ticket_settings')
          let localObj = {}
          if (savedLocal) {
            try { localObj = JSON.parse(savedLocal) } catch(e) {}
          }
          
          setTicketSettings({
            title: data.ticket_title || localObj.title || defaultTicketSettings.title,
            leaderLabel: data.ticket_leader_label || localObj.leaderLabel || defaultTicketSettings.leaderLabel,
            membersLabel: data.ticket_members_label || localObj.membersLabel || defaultTicketSettings.membersLabel,
            airline: data.ticket_airline || localObj.airline || defaultTicketSettings.airline,
            passTitle: data.ticket_pass_title || localObj.passTitle || defaultTicketSettings.passTitle,
            icon: data.ticket_icon || localObj.icon || defaultTicketSettings.icon,
            removeRoute: data.ticket_remove_route !== null && data.ticket_remove_route !== undefined ? data.ticket_remove_route : (localObj.removeRoute !== undefined ? localObj.removeRoute : defaultTicketSettings.removeRoute)
          })
        }
      } catch (err) {
        console.error('Erro geral ao buscar labels do plano de voo:', err)
        setCustomLabels({})
        loadFromLocalStorage()
      } finally {
        setLoading(false)
      }
    }
    fetchLabels()
  }, [])

  if (loading || !customLabels) return <div className="loading-state">Preparando planos de voo...</div>

  const handleGenerate = () => {
    if (!selectedTeamId) return
    const team = teams.find(t => String(t.id) === String(selectedTeamId))
    if (!team) return

    const shuffled = [...challenges]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    setGeneratedPlan({
      team,
      challenges: shuffled,
      date: new Date().toLocaleDateString()
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section id="flight-plan" className="section">
      <div className="card hide-on-print">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Gerador de Tickets</h2>
          <button className="btn btn-secondary" onClick={() => setShowConfigModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-cog"></i> Configuração
          </button>
        </div>
        
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label>Selecione a Equipe</label>
          <select 
            value={selectedTeamId} 
            onChange={(e) => setSelectedTeamId(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={!selectedTeamId || challenges.length === 0}>
          <i className="fas fa-random"></i> Gerar Aleatório
        </button>

        {challenges.length === 0 && (
          <p className="text-muted" style={{ marginTop: '1rem' }}>Cadastre desafios primeiro.</p>
        )}
      </div>

      {generatedPlan && (
        <div className="generated-plan-container">
          <div className="hide-on-print" style={{ margin: '2rem 0', textAlign: 'right' }}>
            <button className="btn btn-accent" onClick={handlePrint}>
              <i className="fas fa-print"></i> Imprimir PDF
            </button>
          </div>

          <div className="print-area" ref={printRef}>
            <div className="plan-header" style={{ marginBottom: '1.5rem' }}>
              {ticketSettings.removeRoute ? (
                <div className="plane-icon-centered-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', margin: '0 auto 0.5rem auto' }}>
                  <i className={`fas ${ticketSettings.icon}`} style={{ color: 'var(--primary-color, var(--primary))', fontSize: '3.5rem' }}></i>
                </div>
              ) : (
                <div className="plane-route-container" style={{ position: 'relative', width: '180px', height: '60px', margin: '0 auto 0.5rem auto' }}>
                  <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
                    <path d="M10 50 Q 60 10, 130 30 T 150 15" stroke="var(--primary-color, var(--primary))" strokeWidth="3" strokeDasharray="6 6" fill="none"/>
                    <circle cx="10" cy="50" r="5" fill="var(--primary-color, var(--primary))"/>
                  </svg>
                  <i className={`fas ${ticketSettings.icon}`} style={{ position: 'absolute', right: '15px', top: '0', color: 'var(--primary-color, var(--primary))', fontSize: '2rem', transform: 'rotate(35deg)' }}></i>
                </div>
              )}
              
              <h1 style={{ marginBottom: '0.5rem' }}>{ticketSettings.title.toUpperCase()}</h1>
              
              <div className="plan-info">
                <span><strong>{ticketSettings.membersLabel.toUpperCase()}:</strong> {generatedPlan.team.name.toUpperCase()}</span>
                <span className="dot-separator">•</span>
                <span><strong>{ticketSettings.leaderLabel.toUpperCase()}:</strong> {generatedPlan.team.profiles?.name?.toUpperCase() || 'N/A'}</span>
              </div>
            </div>

            <div className="tickets-list">
              {generatedPlan.challenges.map((c) => {
                let local = ''
                let cleanDesc = c.description || ''
                const localMatch = cleanDesc.match(/\[Local:\s*(.*?)\]/i)
                if (localMatch) {
                  local = localMatch[1]
                  cleanDesc = cleanDesc.replace(localMatch[0], '').trim()
                }

                return (
                <div className="premium-ticket" key={c.id}>
                  <div className="ticket-main">
                    <div className="ticket-topbar">
                      <span className="airline-name"><i className={`fas ${ticketSettings.icon}`}></i> {ticketSettings.airline}</span>
                      <span className="board-pass-title">{ticketSettings.passTitle}</span>
                    </div>
                    
                    <div className="ticket-body">
                      <div className="ticket-title-large">
                        <i className={`fas ${ticketSettings.icon}`}></i> <span>{c.title}</span>
                      </div>

                      <div className="ticket-challenge-details">
                        {local && <p><strong>LOCAL:</strong> {local}</p>}
                        {cleanDesc && <p><strong>DESCRIÇÃO:</strong> {cleanDesc}</p>}
                      </div>

                       <div className="ticket-passenger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', marginTop: 'auto' }}>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-color, var(--primary))', margin: 0, fontSize: '1.2rem', wordBreak: 'break-word', textAlign: 'left' }}>
                          {eventSettings?.name || 'Carregando...'}
                        </h3>
                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                          <small style={{ display: 'block', fontSize: '0.7rem', color: '#95a5a6', textTransform: 'uppercase', marginBottom: '0.1rem' }}>VALOR</small>
                          <strong style={{ fontSize: '1.4rem', color: '#2c3e50', fontWeight: '800' }}>{c.win_points || c.points} <span style={{fontSize:'1rem', textTransform:'uppercase'}}>{eventSettings?.points_label || 'PTS'}</span></strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-rip"></div>

                  <div className="ticket-stub">
                    <div className="ticket-topbar">
                      <span className="board-pass-title">{ticketSettings.passTitle}</span>
                    </div>
                    <div className="ticket-stub-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div className="pass-box stub-pass" style={{ flex: 1 }}>
                          <small style={{ textTransform: 'uppercase' }}>{eventSettings?.challenge_label || 'DESAFIO'}</small>
                          <strong style={{ fontSize: '1rem', lineHeight: '1.2', marginTop: '0.2rem', display: 'block', wordBreak: 'break-word' }}>{c.title}</strong>
                        </div>
                        <div className="pass-box stub-pass" style={{ textAlign: 'right' }}>
                          <small style={{ textTransform: 'uppercase' }}>{eventSettings?.points_label || 'PTS'}</small>
                          <strong style={{ marginTop: '0.2rem', fontSize: '1.2rem', display: 'block' }}>{c.win_points || c.points}</strong>
                        </div>
                      </div>
                      
                      <div className="stamp-area">
                        <div className="stamp-circle">CARIMBO</div>
                      </div>

                      <div className="barcode-font">
                        *{c.id}GNC*
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Configurar Rótulos do Ticket</h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#95a5a6' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label>Título Principal do Bilhete</label>
                <input 
                  type="text" 
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  placeholder="Ex: PLANO DE VOO"
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Rótulo do Líder</label>
                  <input 
                    type="text" 
                    value={tempLeaderLabel}
                    onChange={e => setTempLeaderLabel(e.target.value)}
                    placeholder="Ex: PILOTO"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Rótulo dos Membros</label>
                  <input 
                    type="text" 
                    value={tempMembersLabel}
                    onChange={e => setTempMembersLabel(e.target.value)}
                    placeholder="Ex: TRIPULAÇÃO"
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Companhia Aérea</label>
                  <input 
                    type="text" 
                    value={tempAirline}
                    onChange={e => setTempAirline(e.target.value)}
                    placeholder="Ex: IFF AIRLINES"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Título do Ticket de Embarque</label>
                  <input 
                    type="text" 
                    value={tempPassTitle}
                    onChange={e => setTempPassTitle(e.target.value)}
                    placeholder="Ex: TICKET DE EMBARQUE"
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Nome do Evento</label>
                  <input 
                    type="text" 
                    value={eventSettings?.name || ''} 
                    disabled 
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#7f8c8d', cursor: 'not-allowed' }} 
                  />
                  <span style={{ fontSize: '0.75rem', color: '#95a5a6', fontStyle: 'italic', marginTop: '0.2rem', display: 'block' }}>segue o padrão da aba configurações</span>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Nome dos Pontos</label>
                  <input 
                    type="text" 
                    value={eventSettings?.points_label || ''} 
                    disabled 
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#7f8c8d', cursor: 'not-allowed' }} 
                  />
                  <span style={{ fontSize: '0.75rem', color: '#95a5a6', fontStyle: 'italic', marginTop: '0.2rem', display: 'block' }}>segue o padrão da aba configurações</span>
                </div>
              </div>

              <div className="form-group">
                <label>Desafio</label>
                <input 
                  type="text" 
                  value={eventSettings?.challenge_label || ''} 
                  disabled 
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#7f8c8d', cursor: 'not-allowed' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#95a5a6', fontStyle: 'italic', marginTop: '0.2rem', display: 'block' }}>segue o padrão da aba configurações</span>
              </div>

              <div className="form-group" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="remove-route-checkbox"
                  checked={tempRemoveRoute}
                  onChange={e => setTempRemoveRoute(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="remove-route-checkbox" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
                  Remover a linha de rota do cabeçalho?
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Ícone do Ticket e Rota</label>
                <div className="icon-select" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                  {iconOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`icon-option ${tempIcon === opt.value ? 'selected' : ''}`}
                      onClick={() => setTempIcon(opt.value)}
                      title={opt.label}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        border: tempIcon === opt.value ? '2px solid var(--primary-color, var(--primary))' : '2px solid transparent',
                        borderRadius: '4px',
                        background: tempIcon === opt.value ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className={`fas ${opt.value}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowConfigModal(false)}>Voltar</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-save"></i> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
