import { useState, useEffect } from 'react'

export default function PointsModal({ teams, challenges, selectedChallenge, onClose, onSave, showAlert, eventSettings }) {
  const [activity, setActivity] = useState('custom')
  const [points, setPoints] = useState(10)
  const [winners, setWinners] = useState([])
  const [participants, setParticipants] = useState([])
  const [isConsolationMode, setIsConsolationMode] = useState(false)
  const [justification, setJustification] = useState('')

  useEffect(() => {
    if (selectedChallenge) {
      setActivity(selectedChallenge.id.toString())
      setPoints(selectedChallenge.win_points || selectedChallenge.points)
      setIsConsolationMode(true)
    }
  }, [selectedChallenge])

  const handleActivityChange = (e) => {
    const val = e.target.value
    setActivity(val)
    
    if (val === 'penalty') {
      setPoints(-5)
      setIsConsolationMode(false)
      setWinners([]) // Limpa os vencedores já que é penalidade
    } else if (val === 'custom') {
      setPoints(10)
      setIsConsolationMode(false)
      setWinners([]) // Limpa os vencedores já que é lançamento livre
    } else {
      const challenge = challenges.find(c => c.id.toString() === val)
      if (challenge) {
        setPoints(challenge.win_points || challenge.points)
        setIsConsolationMode(true)
      }
    }
  }

  const toggleWinner = (teamId) => {
    setWinners(prev => {
      const isWinner = prev.includes(teamId)
      const newWinners = isWinner ? prev.filter(id => id !== teamId) : [...prev, teamId]
      
      // Se marcou como vencedor, automaticamente tem que ser participante
      if (!isWinner && !participants.includes(teamId)) {
        setParticipants(p => [...p, teamId])
      }
      return newWinners
    })
  }

  const toggleParticipant = (teamId) => {
    setParticipants(prev => {
      const isParticipant = prev.includes(teamId)
      
      // Se está desmarcando participante, tem que desmarcar como vencedor tbm
      if (isParticipant && winners.includes(teamId)) {
        setWinners(w => w.filter(id => id !== teamId))
      }
      
      return isParticipant ? prev.filter(id => id !== teamId) : [...prev, teamId]
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activity === 'penalty' || activity === 'custom') {
      if (participants.length === 0) {
        showAlert(activity === 'penalty' ? "Selecione pelo menos uma equipe para penalizar!" : "Selecione pelo menos uma equipe contemplada!")
        return
      }
    } else {
      if (winners.length === 0 && participants.length === 0) {
        showAlert("Selecione pelo menos uma equipe!")
        return
      }
    }

    let desc = 'Pontuação Manual'
    let challengeId = null
    let consolationPoints = 0

    if (activity === 'penalty') {
      desc = 'Penalidade'
    } else if (activity !== 'custom') {
      const challenge = challenges.find(c => c.id.toString() === activity)
      if (challenge) {
        desc = challenge.title
        challengeId = challenge.id
        consolationPoints = challenge.consolation_points || 0
      }
    }

    onSave({
      winners,
      participants,
      points,
      desc: activity === 'penalty' ? `Penalidade: ${justification.trim()}` : desc,
      isConsolationMode,
      consolationPoints,
      challengeId
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Atribuir {eventSettings?.points_label ? (eventSettings.points_label.charAt(0).toUpperCase() + eventSettings.points_label.slice(1).toLowerCase()) : 'Pontos'}</h3>
        <form id="form-points" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Atividade / {eventSettings?.challenge_label ? (eventSettings.challenge_label.charAt(0).toUpperCase() + eventSettings.challenge_label.slice(1).toLowerCase()) : 'Desafio'}</label>
            <select value={activity} onChange={handleActivityChange}>
              <option value="custom">-- Lançamento Livre --</option>
              {challenges.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.win_points || c.points} {eventSettings?.points_label ? eventSettings.points_label.toLowerCase() : 'pts'} / {c.consolation_points || 0} {eventSettings?.points_label ? eventSettings.points_label.toLowerCase() : 'pts'})</option>
              ))}
              <option value="penalty">Penalidade</option>
            </select>
          </div>

          {(activity === 'custom' || activity === 'penalty') && (
            <div className="form-group">
              <label>{eventSettings?.points_label ? (eventSettings.points_label.charAt(0).toUpperCase() + eventSettings.points_label.slice(1).toLowerCase()) : 'Pontos'} (Lançamento)</label>
              <input 
                type="number" 
                value={points} 
                onChange={e => setPoints(parseInt(e.target.value) || 0)}
                required 
              />
            </div>
          )}

          {activity === 'penalty' && (
            <div className="form-group">
              <label>Justificativa da Penalidade (Obrigatória)</label>
              <textarea
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Descreva o motivo da penalidade..."
                required
                rows="3"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
              />
            </div>
          )}

          <div className="form-group">
            <label>Seleção de Equipes</label>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
              Marque as equipes que participaram da atividade e as que venceram.
            </p>
            <div className="team-checkbox-list" style={{ maxHeight: '15.625rem', overflowY: 'auto', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '0.5rem', borderRadius: '0.3125rem', background: 'transparent' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
                    <th style={{ padding: '0.5rem' }}>Equipe</th>
                    {activity === 'penalty' || activity === 'custom' ? (
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {activity === 'penalty' ? 'Penalizado' : 'Contemplado'}
                      </th>
                    ) : (
                      <>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Participou</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Venceu</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.05))' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold', color: t.color }}>{t.name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={participants.includes(t.id)}
                          onChange={() => toggleParticipant(t.id)}
                          style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                        />
                      </td>
                      {activity !== 'penalty' && activity !== 'custom' && (
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={winners.includes(t.id)}
                            onChange={() => toggleWinner(t.id)}
                            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Voltar</button>
            <button type="submit" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-save"></i> Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}