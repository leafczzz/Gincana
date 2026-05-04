import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileModal({ profile, user, onClose, onUpdate }) {
  const [name, setName] = useState(profile?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (error) throw error

      onUpdate({ ...profile, name })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.message)
      alert('Erro ao atualizar perfil')
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
            <label>Nome</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Função</label>
            <input type="text" value={profile?.role === 'admin' ? 'Administrador' : profile?.role === 'professor' ? 'Professor' : profile?.role === 'student' ? 'Aluno' : 'Supervisor'} disabled />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>Voltar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
