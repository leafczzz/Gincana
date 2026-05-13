import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Auth.css'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Aluno' },
  { value: 'professor', label: 'Professor' }
]

export default function RegisterModal({ onClose, onSwitchToLogin, showAlert }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
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
    if (formData.role === 'student' && !formData.course) return 'Curso é obrigatório para alunos'
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
      course: formData.role === 'student' ? formData.course : null,
      role: formData.role,
    })

    if (error) {
      setError('Erro ao criar conta: ' + error.message)
    } else {
      onClose()
      showAlert('Conta criada com sucesso! Faça login para continuar.', 'Cadastro')
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
                  placeholder="Ex: João da Silva"
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
                <label>Curso</label>
                <select
                  value={formData.course}
                  onChange={e => updateField('course', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="" disabled>Selecione seu curso...</option>
                  <option value="Tec. Química">Tec. Química</option>
                  <option value="Tec. Administração">Tec. Administração</option>
                  <option value="Tec. Informática">Tec. Informática</option>
                  <option value="Superior - Sistemas de Informação">Superior - Sistemas de Informação</option>
                  <option value="Superior - Administração">Superior - Administração</option>
                  <option value="Superior - Engenharia">Superior - Engenharia</option>
                  <option value="Sou professor">Sou professor</option>
                </select>
              </div>

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
