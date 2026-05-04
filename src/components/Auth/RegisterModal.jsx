import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Aluno' },
  { value: 'professor', label: 'Professor' }
]

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    registration: '',
    course: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Nome é obrigatório'
    if (!formData.email.trim()) return 'Email é obrigatório'
    if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem'
    return null
  }

  const validateStep2 = () => {
    if (formData.role !== 'admin' && !formData.registration.trim()) return 'Matrícula é obrigatória'
    if (formData.role === 'student' && !formData.course.trim()) return 'Curso é obrigatório para alunos'
    return null
  }

  const handleNext = (e) => {
    if (e) e.preventDefault()
    const error = validateStep1()
    if (error) {
      setError(error)
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errorStep2 = validateStep2()
    if (errorStep2) {
      setError(errorStep2)
      return
    }

    setLoading(true)

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      registration: formData.registration,
      course: formData.role === 'student' ? formData.course : null,
      role: formData.role,
    })

    if (error) {
      setError('Erro ao criar conta: ' + error.message)
    } else {
      onClose()
      alert('Conta criada com sucesso! Faça login para continuar.')
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-auth" onClick={e => e.stopPropagation()}>
        <div className="auth-header">
          <h3>Criar Conta</h3>
          <p>Passo {step} de 2</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          {step === 1 ? (
            <>
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => updateField('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                  placeholder="Repita a senha"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Continuar
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Tipo de Usuário</label>
                <select
                  value={formData.role}
                  onChange={e => updateField('role', e.target.value)}
                  className="form-select"
                >
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.role !== 'admin' && (
                <div className="form-group">
                  <label>Matrícula</label>
                  <input
                    type="text"
                    value={formData.registration}
                    onChange={e => updateField('registration', e.target.value)}
                    placeholder="Sua matrícula"
                    required={formData.role !== 'admin'}
                  />
                </div>
              )}

              {formData.role === 'student' && (
                <div className="form-group">
                  <label>Curso</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={e => updateField('course', e.target.value)}
                    placeholder="Seu curso"
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Já tem conta?{' '}
            <button className="text-link" onClick={onSwitchToLogin}>
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
