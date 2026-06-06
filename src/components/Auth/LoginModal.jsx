import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn({ email, password })

    if (error) {
      setError('Email ou senha incorretos')
    } else {
      onClose()
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-auth" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '0.8rem', 
            right: '1rem', 
            background: 'transparent', 
            border: 'none', 
            color: '#888', 
            fontSize: '1.25rem', 
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = '#888'}
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="auth-header">
          <h3>Entrar</h3>
          <p>Faça login para continuar</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem conta?{' '}
            <button className="text-link" onClick={onSwitchToRegister}>
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
