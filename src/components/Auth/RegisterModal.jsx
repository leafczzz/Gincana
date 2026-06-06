import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
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
  const [coursesList, setCoursesList] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('name')
          .order('name')
        
        if (error) throw error
        if (data && data.length > 0) {
          setCoursesList(data.map(c => c.name))
        } else {
          setCoursesList([
            "Tec. Química",
            "Tec. Administração",
            "Tec. Informática",
            "Superior - Sistemas de Informação",
            "Superior - Administração",
            "Superior - Engenharia"
          ])
        }
      } catch (err) {
        console.error('Erro ao buscar cursos:', err)
        setCoursesList([
          "Tec. Química",
          "Tec. Administração",
          "Tec. Informática",
          "Superior - Sistemas de Informação",
          "Superior - Administração",
          "Superior - Engenharia"
        ])
      }
    }
    fetchCourses()
  }, [])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    const name = formData.name.trim()
    if (!name) return 'Nome é obrigatório'
    if (name.length > 50) return 'O nome não pode ter mais de 50 caracteres'
    
    const words = name.split(/\s+/)
    for (const word of words) {
      if (word.length > 20) {
        return 'Nenhuma palavra no nome pode ter mais de 20 caracteres'
      }
    }

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
          <h3>Criar Conta</h3>
          <p>Passo {step} de 2</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          {step === 1 ? (
            <>
              <div className="form-group">
                <label>Nome Completo (máx. 50 caracteres)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Ex: João da Silva"
                  maxLength={50}
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
                  {coursesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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
