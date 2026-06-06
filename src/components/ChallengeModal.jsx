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

export default function ChallengeModal({ challenge, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [winPoints, setWinPoints] = useState(10)
  const [consolationPoints, setConsolationPoints] = useState(5)
  const [icon, setIcon] = useState('fa-star')

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || '')
      let desc = challenge.description || ''
      let loc = ''
      if (desc.startsWith('[Local: ')) {
        const endIdx = desc.indexOf(']')
        if (endIdx > -1) {
          loc = desc.substring(8, endIdx)
          desc = desc.substring(endIdx + 1).replace(/^\n+/, '')
        }
      }
      setLocation(loc)
      setDescription(desc)
      setWinPoints(challenge.win_points || challenge.points || 10)
      setConsolationPoints(challenge.consolation_points || 5)
      setIcon(challenge.icon || 'fa-star')
    }
  }, [challenge])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      let finalDesc = description.trim()
      if (location.trim()) {
        finalDesc = `[Local: ${location.trim()}]\n\n${finalDesc}`
      }
      onSave(title.trim(), finalDesc, winPoints, consolationPoints, icon)
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
            <label>Local do Desafio</label>
            <input 
              type="text" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Onde acontecerá?"
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva a atividade..."
              rows="3"
              style={{ resize: 'vertical', minHeight: '6rem', maxHeight: '12rem', overflowY: 'auto' }}
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
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-save"></i> {challenge ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}