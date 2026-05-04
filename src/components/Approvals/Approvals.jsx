import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './Approvals.css'

export default function Approvals({ showAlert }) {
  const [pendingTeams, setPendingTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingTeams()
  }, [])

  async function fetchPendingTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, profiles!teams_leader_id_fkey(name)')
        .eq('status', 'pending')
      
      if (error) throw error
      setPendingTeams(data || [])
    } catch (error) {
      console.error('Erro ao buscar equipes pendentes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(teamId, newStatus) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ status: newStatus })
        .eq('id', teamId)
      
      if (error) throw error
      
      setPendingTeams(pendingTeams.filter(t => t.id !== teamId))
      showAlert(`Equipe ${newStatus === 'approved' ? 'Aprovada' : 'Rejeitada'} com sucesso!`, 'Aprovação')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showAlert('Erro ao atualizar status')
    }
  }

  return (
    <div className="approvals-container">
      <div className="card">
        <div className="card-header">
          <h2>Aprovação de Equipes</h2>
        </div>
        
        {loading ? (
          <div className="loading-state">Buscando solicitações...</div>
        ) : (
          <div className="approvals-grid">
            {pendingTeams.map(team => (
              <div key={team.id} className="approval-card" style={{ borderTop: `4px solid ${team.color}` }}>
                {team.image_url && <img src={team.image_url} alt={team.name} className="team-avatar" />}
                <h3>{team.name}</h3>
                <p><strong>Líder:</strong> {team.profiles?.name || 'Não informado'}</p>
                <div className="approval-actions">
                  <button className="btn btn-primary" onClick={() => handleApproval(team.id, 'approved')}>
                    <i className="fas fa-check"></i> Aprovar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleApproval(team.id, 'rejected')}>
                    <i className="fas fa-times"></i> Rejeitar
                  </button>
                </div>
              </div>
            ))}
            {pendingTeams.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-check-circle"></i>
                <p>Nenhuma equipe pendente de aprovação.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
