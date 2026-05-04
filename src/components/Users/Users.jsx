import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Users.css'

export default function Users({ showAlert, showConfirm }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
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
        <div className="card-header">
          <h2>Usuários do Sistema</h2>
        </div>
        
        {loading ? (
          <div className="loading-state">Carregando usuários...</div>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Matrícula/Curso</th>
                  <th>Papel</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.registration}
                      {user.course && ` - ${user.course}`}
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {roleMap[user.role] || user.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: user.status === 'blocked' ? '#e74c3c' : (user.status === 'pending' ? '#f1c40f' : '#2ecc71'), 
                        fontWeight: 'bold' 
                      }}>
                        {user.status === 'blocked' ? 'Bloqueado' : (user.status === 'pending' ? 'Pendente' : 'Ativo')}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
    </div>
  )
}
