import { useState, useEffect } from 'react'

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
  { value: 'fa-cloud', label: 'Nuvem' }
]

export default function ChallengeModal({ challenge, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [winPoints, setWinPoints] = useState(10)
  const [consolationPoints, setConsolationPoints] = useState(5)
  const [icon, setIcon] = useState('fa-star')

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || '')
      setDescription(challenge.description || '')
      setWinPoints(challenge.win_points || challenge.points || 10)
      setConsolationPoints(challenge.consolation_points || 5)
      setIcon(challenge.icon || 'fa-star')
    }
  }, [challenge])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onSave(title.trim(), description.trim(), winPoints, consolationPoints, icon)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{challenge ? 'Editar Desafio' : 'Novo Desafio'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nome do desafio"
              required 
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva a atividade..."
              rows="3"
            />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Pontos (Vitória)</label>
              <input 
                type="number" 
                value={winPoints}
                onChange={e => setWinPoints(parseInt(e.target.value) || 0)}
                min="0"
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Pontos (Consolação)</label>
              <input 
                type="number" 
                value={consolationPoints}
                onChange={e => setConsolationPoints(parseInt(e.target.value) || 0)}
                min="0"
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Ícone</label>
            <div className="icon-select">
              {iconOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`icon-option ${icon === opt.value ? 'selected' : ''}`}
                  onClick={() => setIcon(opt.value)}
                  title={opt.label}
                >
                  <i className={`fas ${opt.value}`}></i>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Voltar</button>
            <button type="submit" className="btn btn-primary">{challenge ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}