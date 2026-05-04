import { useState, useEffect } from 'react'

export default function PointsModal({ teams, challenges, selectedChallenge, onClose, onSave }) {
  const [activity, setActivity] = useState('custom')
  const [points, setPoints] = useState(10)
  const [winners, setWinners] = useState([])
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
    setWinners(prev => 
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (winners.length === 0) {
      alert("Selecione pelo menos uma equipe!")
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
            <label>{isConsolationMode ? "Equipes Vencedoras (as demais receberão consolação)" : "Equipes a receber os pontos"}</label>
            <div className="team-checkbox-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '5px' }}>
              {teams.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                  <input 
                    type="checkbox" 
                    id={`team-${t.id}`}
                    checked={winners.includes(t.id)}
                    onChange={() => toggleWinner(t.id)}
                  />
                  <label htmlFor={`team-${t.id}`} style={{ margin: 0, cursor: 'pointer' }}>{t.name}</label>
                </div>
              ))}
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