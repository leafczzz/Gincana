import { useState, useRef, useEffect } from 'react'

export default function TeamModal({ team, onClose, onSave }) {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (team?.image_url) {
      setPreview(team.image_url)
    }
  }, [team])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
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
      onSave(name, color, file)
    }
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
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                  <button type="button" className="remove-image" onClick={() => { setPreview(null); fileInputRef.current.value = '' }}>
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
            <label>Nome</label>
            <input type="text" name="teamName" defaultValue={team?.name || ''} required />
          </div>
          <div className="form-group">
            <label>Cor</label>
            <input type="color" name="teamColor" defaultValue={team?.color || '#2D5A27'} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Voltar</button>
            <button type="submit" className="btn btn-primary">{team ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}