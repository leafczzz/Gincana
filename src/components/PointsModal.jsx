import { useState, useEffect } from 'react'

export default function PointsModal({ teams, challenges, selectedChallenge, onClose, onSave, showAlert }) {
  const [activity, setActivity] = useState('custom')
  const [points, setPoints] = useState(10)
  const [winners, setWinners] = useState([])
  const [participants, setParticipants] = useState(teams.map(t => t.id))
  const [isConsolationMode, setIsConsolationMode] = useState(false)

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
    } else if (val === 'custom') {
      setPoints(10)
      setIsConsolationMode(false)
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
    if (winners.length === 0 && participants.length === 0) {
      showAlert("Selecione pelo menos uma equipe!")
      return
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
      desc,
      isConsolationMode,
      consolationPoints,
      challengeId
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Atribuir Pontos</h3>
        <form id="form-points" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Atividade / Desafio</label>
            <select value={activity} onChange={handleActivityChange}>
              <option value="custom">-- Lançamento Livre --</option>
              {challenges.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.win_points || c.points} pts / {c.consolation_points || 0} pts)</option>
              ))}
              <option value="penalty">Penalidade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pontos (Vitória / Lançamento)</label>
            <input 
              type="number" 
              value={points} 
              onChange={e => setPoints(parseInt(e.target.value) || 0)}
              required 
            />
          </div>

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
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Participou</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Venceu</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
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
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={winners.includes(t.id)}
                          onChange={() => toggleWinner(t.id)}
                          style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Voltar</button>
            <button type="submit" className="btn btn-accent">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  )
}