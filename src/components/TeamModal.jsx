import { useState, useRef, useEffect } from 'react'

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

export default function TeamModal({ team, users, currentUserProfile, eventSettings, onClose, onSave, showConfirm }) {
  const [preview, setPreview] = useState(null)
  const [members, setMembers] = useState(team?.members || [])
  const [leaderId, setLeaderId] = useState(team?.leader_id || currentUserProfile?.id)
  const [icon, setIcon] = useState(team?.icon || 'fa-users')
  const [memberInput, setMemberInput] = useState('')
  const [imageRemoved, setImageRemoved] = useState(false)
  const [editingMemberIdx, setEditingMemberIdx] = useState(null)
  const [editingMemberValue, setEditingMemberValue] = useState('')
  const [isFullscreenImage, setIsFullscreenImage] = useState(false)
  const fileInputRef = useRef(null)

  const validateName = (name, maxTotal = 40, maxWord = 20) => {
    const trimmed = name.trim()
    if (!trimmed) return "O nome não pode estar vazio."
    if (trimmed.length > maxTotal) return `O nome não pode ter mais de ${maxTotal} caracteres.`
    const words = trimmed.split(/\s+/)
    for (const word of words) {
      if (word.length > maxWord) {
        return `Nenhuma palavra pode ter mais de ${maxWord} caracteres.`
      }
    }
    return null
  }

  const saveMemberEdit = (idx) => {
    const val = editingMemberValue.trim()
    if (val) {
      const error = validateName(val)
      if (error) {
        alert(error)
        return
      }
      const updated = [...members]
      updated[idx] = val
      setMembers(updated)
    }
    setEditingMemberIdx(null)
  }

  useEffect(() => {
    if (team?.image_url) {
      setPreview(team.image_url)
    }
  }, [team])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageRemoved(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = e.target.elements.teamName.value.trim()
    const color = e.target.elements.teamColor.value
    const file = fileInputRef.current?.files[0]
    
    if (name) {
      const minMembers = eventSettings?.min_members_per_team || 1
      const maxMembers = eventSettings?.max_members_per_team || 5

      if (members.length < minMembers) {
        alert(`A equipe deve ter no mínimo ${minMembers} membro(s).`)
        return
      }

      if (members.length > maxMembers) {
        alert(`A equipe pode ter no máximo ${maxMembers} membro(s).`)
        return
      }

      onSave(name, color, file, members, leaderId, icon, imageRemoved)
    }
  }

  const addMemberFromButton = () => {
    const newMember = memberInput.trim()
    if (newMember) {
      const error = validateName(newMember)
      if (error) {
        alert(error)
        return
      }
      if (!members.includes(newMember)) {
        setMembers([...members, newMember])
        setMemberInput('')
      } else {
        alert('Este membro já está cadastrado nesta equipe.')
      }
    }
  }

  const handleMemberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMemberFromButton()
    }
  }

  const removeMember = (indexToRemove) => {
    const memberName = members[indexToRemove]
    showConfirm(`Deseja realmente remover o membro "${memberName}" desta equipe?`, () => {
      setMembers(members.filter((_, idx) => idx !== indexToRemove))
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{team ? 'Editar Equipe' : 'Nova Equipe'}</h3>
        <form id="form-team" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Imagem (opcional)</label>
            <div className="image-upload-container">
              {preview ? (
                <div className="image-preview" style={{ position: 'relative' }}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ cursor: 'pointer', display: 'block', maxWidth: '100%', borderRadius: '4px' }} 
                    onClick={() => setIsFullscreenImage(true)} 
                    title="Clique para ampliar a imagem"
                  />
                  <button type="button" className="remove-image" onClick={() => { setPreview(null); fileInputRef.current.value = ''; setImageRemoved(true); }}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                  <i className="fas fa-image"></i>
                  <span>Clique para adicionar imagem</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Nome da Equipe</label>
            <input type="text" name="teamName" defaultValue={team?.name || ''} required />
          </div>

          <div className="form-group">
            <label>Líder da Equipe</label>
            {['admin', 'professor'].includes(currentUserProfile?.role) ? (
              <select 
                value={leaderId} 
                onChange={(e) => setLeaderId(e.target.value)}
                required
              >
                <option value="">Selecione um líder</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                value={team?.profiles?.name || currentUserProfile?.name} 
                readOnly 
                style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
              />
            )}
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
              {['admin', 'professor'].includes(currentUserProfile?.role) 
                ? 'Apenas professores e administradores podem trocar o líder.' 
                : 'O líder da equipe não pode ser alterado por alunos.'}
            </p>
          </div>

          <div className="form-group">
            <label>Membros da Equipe (pressione Enter ou clique em salvar)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={handleMemberKeyDown}
                placeholder="Digite o nome do aluno"
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn-icon" 
                onClick={addMemberFromButton}
                style={{ padding: '0 0.5rem', cursor: 'pointer' }}
                title="Salvar"
              >
                <i className="fas fa-save" style={{ fontSize: '1.25rem' }}></i>
              </button>
            </div>
            <div className="members-list" style={{ marginTop: '0.5rem' }}>
              {members.map((member, idx) => (
                <div key={idx} className="member-tag" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editingMemberIdx === idx ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={editingMemberValue} 
                        onChange={e => setEditingMemberValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveMemberEdit(idx)
                          } else if (e.key === 'Escape') {
                            setEditingMemberIdx(null)
                          }
                        }}
                        onBlur={() => saveMemberEdit(idx)}
                        autoFocus
                        maxLength={40}
                        style={{ flex: 1, padding: '0.2rem', fontSize: '0.95rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}
                      />
                      <button
                        type="button"
                        className="btn-icon"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          saveMemberEdit(idx)
                        }}
                        style={{ padding: '0.2rem', cursor: 'pointer' }}
                        title="Salvar alteração"
                      >
                        <i className="fas fa-save" style={{ fontSize: '1rem' }}></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ flexGrow: 1, minWidth: 0, wordBreak: 'break-word', textAlign: 'left', paddingRight: '0.5rem' }}>{member}</span>
                      <div className="member-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        <button type="button" className="edit-btn" onClick={() => { setEditingMemberIdx(idx); setEditingMemberValue(member); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }} title="Editar membro">
                          <i className="fas fa-edit" style={{ fontSize: '0.85rem' }}></i>
                        </button>
                        <button type="button" className="remove-btn" onClick={() => removeMember(idx)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, opacity: 1 }} title="Remover membro">
                          <i className="fas fa-times" style={{ fontSize: '0.85rem' }}></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Ícone da Equipe (usado se não houver imagem)</label>
            <div className="icon-select">
              {iconOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`icon-option ${icon === opt.value && !preview ? 'selected' : ''}`}
                  onClick={() => {
                    setIcon(opt.value)
                    setPreview(null)
                    if(fileInputRef.current) fileInputRef.current.value = ''
                    setImageRemoved(true)
                  }}
                  title={opt.label}
                >
                  <i className={`fas ${opt.value}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Cor</label>
            <input type="color" name="teamColor" defaultValue={team?.color || '#2D5A27'} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Voltar</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-save"></i> {team ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {isFullscreenImage && preview && (
        <div className="modal-overlay" onClick={() => setIsFullscreenImage(false)} style={{ zIndex: 3000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', width: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--surface)' }}>
            <div className="modal-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Visualizar Imagem</h3>
              <button className="btn-close" onClick={() => setIsFullscreenImage(false)}><i className="fas fa-times"></i></button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', background: '#111', borderRadius: '0.5rem', marginBottom: '1.5rem', padding: '1rem' }}>
              <img src={preview} alt="Preview Grande" style={{ width: '18.75rem', height: '18.75rem', objectFit: 'contain' }} />
            </div>

            <div className="modal-actions" style={{ width: '100%', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button type="button" className="btn btn-danger" onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; setImageRemoved(true); setIsFullscreenImage(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-trash"></i> Excluir
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { fileInputRef.current?.click(); setIsFullscreenImage(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-edit"></i> Editar
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFullscreenImage(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}