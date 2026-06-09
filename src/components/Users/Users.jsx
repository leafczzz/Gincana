import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Users.css'

export default function Users({ showAlert, showConfirm }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userInfoModal, setUserInfoModal] = useState(null)
  const [resetPasswordUser, setResetPasswordUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const [courses, setCourses] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createCourse, setCreateCourse] = useState('')
  const [createRole, setCreateRole] = useState('student')
  const [creating, setCreating] = useState(false)

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!resetPasswordUser || !newPassword.trim()) return
    if (newPassword.length < 6) {
      showAlert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setResetting(true)
    try {
      const { error } = await supabase.rpc('admin_reset_user_password', {
        target_user_id: resetPasswordUser.id,
        new_password: newPassword
      })

      if (error) throw error
      showAlert(`Senha redefinida com sucesso para o usuário "${resetPasswordUser.name}"!`, 'Sucesso')
      setResetPasswordUser(null)
      setNewPassword('')
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      showAlert('Erro ao redefinir senha: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCourses()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name')
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name')
      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Erro ao buscar cursos:', error)
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      showAlert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    if (createPassword.length < 6) {
      showAlert('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: createEmail.trim(),
        user_password: createPassword,
        user_name: createName.trim(),
        user_course: createCourse || null,
        user_role: createRole
      })

      if (error) throw error

      showAlert(`Usuário "${createName}" criado com sucesso!`, 'Sucesso')
      
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
      setCreateCourse('')
      setCreateRole('student')
      setShowCreateModal(false)

      fetchUsers()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      showAlert('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido. Verifique se o e-mail já está em uso.'))
    } finally {
      setCreating(false)
    }
  }

  async function updateRole(userId, newRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      console.error('Erro ao atualizar papel:', error)
      showAlert('Erro ao atualizar permissão')
    }
  }

  async function updateStatus(userId, newStatus) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)
      
      if (error) throw error
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showAlert('Erro ao atualizar status')
    }
  }

  async function deleteUser(userId) {
    showConfirm('Deseja realmente apagar este usuário? Esta ação removerá o perfil dele do sistema.', async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)
        
        if (error) throw error
        setUsers(users.filter(u => u.id !== userId))
      } catch (error) {
        console.error('Erro ao apagar usuário:', error)
        showAlert('Erro ao apagar usuário')
      }
    })
  }

  const roleMap = {
    'admin': 'Administrador',
    'professor': 'Professor',
    'supervisor': 'Supervisor',
    'student': 'Aluno'
  }

  return (
    <div className="users-container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Usuários do Sistema</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-user-plus"></i> Novo Usuário
          </button>
        </div>
        
        {loading ? (
          <div className="loading-state">Carregando usuários...</div>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Nome</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Info</th>
                  <th style={{ width: '40%', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-icon text-info" onClick={() => setUserInfoModal(user)} style={{ color: '#3498db' }}>
                        <i className="fas fa-info-circle"></i>
                      </button>
                    </td>
                    <td className="actions-cell-users" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <select 
                        className="role-select"
                        value={user.role} 
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        style={{ padding: '0.3rem', fontSize: '0.9rem' }}
                      >
                        <option value="student">Aluno</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="professor">Professor</option>
                        <option value="admin">Administrador</option>
                      </select>
                      
                      {user.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(user.id, 'approved')} title="Aprovar">
                          Aprovar
                        </button>
                      )}
                      
                      {(user.status === 'approved' || !user.status) && (
                        <button className="btn btn-warning btn-sm" onClick={() => updateStatus(user.id, 'blocked')} title="Bloquear Login">
                          Bloquear
                        </button>
                      )}

                      {user.status === 'blocked' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(user.id, 'approved')} title="Desbloquear">
                          Desbloquear
                        </button>
                      )}

                      <button 
                        className="btn btn-sm" 
                        style={{ background: '#f39c12', color: 'white' }} 
                        onClick={() => { setResetPasswordUser(user); setNewPassword(''); }} 
                        title="Alterar Senha"
                      >
                        <i className="fas fa-key"></i>
                      </button>

                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)} title="Apagar Usuário">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {userInfoModal && (
        <div className="modal-overlay" onClick={() => setUserInfoModal(null)}>
          <div className="modal" style={{ position: 'relative', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setUserInfoModal(null)}
              style={{ position: 'absolute', top: '0.8rem', right: '1rem' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>Detalhes do Usuário</h3>
            </div>
            <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>
              <p style={{ marginBottom: '0.5rem' }}><strong>Nome:</strong> {userInfoModal.name}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {userInfoModal.email}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Curso:</strong> {userInfoModal.course || 'Não informado'}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Papel:</strong> <span className={`role-badge role-${userInfoModal.role}`}>{roleMap[userInfoModal.role] || userInfoModal.role}</span></p>
              <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}><strong>Status:</strong> <span style={{ color: userInfoModal.status === 'blocked' ? '#e74c3c' : (userInfoModal.status === 'pending' ? '#f1c40f' : '#2ecc71'), fontWeight: 'bold' }}>
                {userInfoModal.status === 'blocked' ? 'Bloqueado' : (userInfoModal.status === 'pending' ? 'Pendente' : 'Ativo')}
              </span></p>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setUserInfoModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="modal-overlay" onClick={() => setResetPasswordUser(null)}>
          <div className="modal" style={{ position: 'relative', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setResetPasswordUser(null)}
              style={{ position: 'absolute', top: '0.8rem', right: '1rem' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>Redefinir Senha</h3>
            </div>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.2rem', color: 'var(--text-main)' }}>Alterando senha de: <strong style={{ color: 'var(--primary)' }}>{resetPasswordUser.name}</strong></p>
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <label>Nova Senha (mín. 6 caracteres)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setResetPasswordUser(null)} disabled={resetting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={resetting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <i className="fas fa-save"></i> {resetting ? 'Alterando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ position: 'relative', textAlign: 'left', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '0.8rem', right: '1rem' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3>Criar Novo Usuário</h3>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Email *</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Senha * (mín. 6 caracteres)</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Curso</label>
                <select
                  value={createCourse}
                  onChange={e => setCreateCourse(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.15)' }}
                >
                  <option value="">-- Selecione o Curso --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Papel do Usuário *</label>
                <select
                  value={createRole}
                  onChange={e => setCreateRole(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.15)' }}
                  required
                >
                  <option value="student">Aluno</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-save"></i> {creating ? 'Criando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
