import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './FlightPlan.css'

export default function FlightPlan({ teams, challenges, eventSettings }) {
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [customLabels, setCustomLabels] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)

  useEffect(() => {
    async function fetchLabels() {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('id_prefix, id_label, team_label, leader_label, points_label, panel_title, primary_color')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        
        if (data) {
          setCustomLabels({
            idPrefix: data.id_prefix,
            idLabel: data.id_label,
            teamLabel: data.team_label,
            leaderLabel: data.leader_label,
            pointsLabel: data.points_label,
            panelTitle: data.panel_title
          })
        } else {
          // Fallback para localStorage legado
          const saved = localStorage.getItem('gincana_custom_labels')
          if (saved) {
            try { 
              setCustomLabels(JSON.parse(saved)) 
            } catch(e) {
              setCustomLabels({}) 
            }
          } else {
            setCustomLabels({})
          }
        }
      } catch (err) {
        console.error('Erro ao buscar labels do plano de voo:', err)
        setCustomLabels({})
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
        <div className="card-header">
          <h2>Gerador de Plano de Voo</h2>
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
              <div className="plane-route-container" style={{ position: 'relative', width: '180px', height: '60px', margin: '0 auto 0.5rem auto' }}>
                <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
                  <path d="M10 50 Q 60 10, 130 30 T 150 15" stroke="var(--primary-color, var(--primary))" strokeWidth="3" strokeDasharray="6 6" fill="none"/>
                  <circle cx="10" cy="50" r="5" fill="var(--primary-color, var(--primary))"/>
                </svg>
                <i className="fas fa-plane" style={{ position: 'absolute', right: '15px', top: '0', color: 'var(--primary-color, var(--primary))', fontSize: '2rem', transform: 'rotate(35deg)' }}></i>
              </div>
              
              <h1 style={{ marginBottom: '0.5rem' }}>PLANO DE VOO</h1>
              
              <div className="plan-info">
                <span><strong>TRIPULAÇÃO:</strong> {generatedPlan.team.name.toUpperCase()}</span>
                <span className="dot-separator">•</span>
                <span><strong>PILOTO:</strong> {generatedPlan.team.profiles?.name?.toUpperCase() || 'N/A'}</span>
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
                      <span className="airline-name"><i className="fas fa-plane-departure"></i> IFF AIRLINES</span>
                      <span className="board-pass-title">BOARDING PASS</span>
                    </div>
                    
                    <div className="ticket-body">
                      <div className="ticket-title-large">
                        <i className="fas fa-plane"></i> <span>{c.title}</span>
                      </div>

                      <div className="ticket-challenge-details">
                        {local && <p><strong>LOCAL:</strong> {local}</p>}
                        {cleanDesc && <p><strong>DESCRIÇÃO:</strong> {cleanDesc}</p>}
                      </div>

                      <div className="ticket-passenger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', marginTop: 'auto' }}>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-color, var(--primary))', margin: 0, fontSize: '1.2rem', wordBreak: 'break-word', textAlign: 'left' }}>
                          {eventSettings?.name || 'Gincana MT'}
                        </h3>
                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                          <small style={{ display: 'block', fontSize: '0.7rem', color: '#95a5a6', textTransform: 'uppercase', marginBottom: '0.1rem' }}>VALOR</small>
                          <strong style={{ fontSize: '1.4rem', color: '#2c3e50', fontWeight: '800' }}>{c.win_points || c.points} <span style={{fontSize:'1rem'}}>PTS</span></strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-rip"></div>

                  <div className="ticket-stub">
                    <div className="ticket-topbar">
                      <span className="board-pass-title">BOARDING PASS</span>
                    </div>
                    <div className="ticket-stub-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div className="pass-box stub-pass" style={{ flex: 1 }}>
                          <small>DESAFIO</small>
                          <strong style={{ fontSize: '1rem', lineHeight: '1.2', marginTop: '0.2rem', display: 'block', wordBreak: 'break-word' }}>{c.title}</strong>
                        </div>
                        <div className="pass-box stub-pass" style={{ textAlign: 'right' }}>
                          <small>PTS</small>
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
    </section>
  )
}
