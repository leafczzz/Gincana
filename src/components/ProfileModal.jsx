import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileModal({ profile, user, onClose, onUpdate, showAlert }) {
  const [name, setName] = useState(profile?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const trimmedName = name.trim()
    if (!trimmedName) {
      showAlert('Nome é obrigatório')
      return
    }
    if (trimmedName.length > 50) {
      showAlert('O nome não pode ter mais de 50 caracteres')
      return
    }
    const words = trimmedName.split(/\s+/)
    for (const word of words) {
      if (word.length > 20) {
        showAlert('Nenhuma palavra no nome pode ter mais de 20 caracteres')
        return
      }
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: trimmedName })
        .eq('id', user.id)

      if (error) throw error

      onUpdate({ ...profile, name: trimmedName })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.message)
      showAlert('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Meu Perfil</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
            <small className="text-muted">O email não pode ser alterado.</small>
          </div>
          <div className="form-group">
            <label>Nome (máx. 50 caracteres)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              maxLength={50}
              required 
            />
          </div>
          <div className="form-group">
            <label>Função</label>
            <input type="text" value={profile?.role === 'admin' ? 'Administrador' : profile?.role === 'professor' ? 'Professor' : profile?.role === 'student' ? 'Aluno' : 'Supervisor'} disabled />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>Voltar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-save"></i> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
