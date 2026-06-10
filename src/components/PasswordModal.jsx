import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PasswordModal({ user, onClose, showAlert }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!oldPassword.trim() || !newPassword.trim()) {
      showAlert('Por favor, preencha todos os campos.')
      return
    }

    if (newPassword.length < 6) {
      showAlert('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      })

      if (signInError) {
        showAlert('Senha antiga incorreta. Verifique e tente novamente.')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      showAlert('Senha alterada com sucesso!', 'Sucesso')
      onClose()
    } catch (error) {
      console.error('Erro ao alterar senha:', error.message)
      showAlert('Erro ao alterar senha: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Alterar Senha</h3>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#95a5a6' }}
            disabled={loading}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Senha Antiga</label>
            <input 
              type="password" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              placeholder="Digite sua senha antiga"
              required 
            />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Nova Senha</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Digite a nova senha (mín. 6 caracteres)"
              required 
            />
          </div>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-key"></i> {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
