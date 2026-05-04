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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-auth" onClick={e => e.stopPropagation()}>
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
