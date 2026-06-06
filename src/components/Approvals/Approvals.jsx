import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import TeamDetailsModal from '../TeamDetailsModal'
import './Approvals.css'

export default function Approvals({ showAlert, profile, eventSettings, showConfirm }) {
  const [pendingTeams, setPendingTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailsTeam, setDetailsTeam] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)

  useEffect(() => {
    fetchPendingTeams()
  }, [])

  async function fetchPendingTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, profiles!teams_leader_id_fkey(name)')
        .neq('status', 'approved')
        .order('status', { ascending: false })
      
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
      showAlert(`Equipe ${newStatus === 'approved' ? 'Aprovada' : 'Bloqueada'} com sucesso!`, 'Aprovação')
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
              <div key={team.id} className="approval-card" style={{ borderTop: `0.25rem solid ${team.color}` }}>
                {team.image_url ? (
                  <img 
                    src={team.image_url} 
                    alt={team.name} 
                    className="team-avatar" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => setFullscreenImage({ url: team.image_url, name: team.name })} 
                    title="Clique para ampliar a imagem"
                  />
                ) : (
                  <div 
                    className="team-avatar" 
                    style={{ 
                      background: team.color || 'var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white', 
                      fontSize: '1.8rem' 
                    }}
                  >
                    <i className={`fas ${team.icon || 'fa-users'}`}></i>
                  </div>
                )}
                <h3>{team.name}</h3>
                <p><strong>Líder:</strong> {team.profiles?.name || 'Não informado'}</p>
                <div className="approval-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '1rem' }}>
                  <button 
                    className="btn-icon text-info" 
                    onClick={() => setDetailsTeam(team)} 
                    title="Exibir Detalhes"
                    style={{ color: '#3498db', fontSize: '1.25rem', padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <i className="fas fa-info-circle"></i>
                  </button>
                  <button className="btn btn-primary" onClick={() => handleApproval(team.id, 'approved')}>
                    <i className="fas fa-check"></i> Aprovar
                  </button>
                  {team.status !== 'blocked' && (
                    <button className="btn btn-danger" onClick={() => handleApproval(team.id, 'blocked')}>
                      <i className="fas fa-ban"></i> Bloquear/Rejeitar
                    </button>
                  )}
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

      {detailsTeam && (
        <TeamDetailsModal 
          team={detailsTeam}
          userProfile={profile}
          onClose={() => setDetailsTeam(null)}
          onUpdateTeam={(updatedTeam) => {
            setPendingTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t))
            setDetailsTeam(updatedTeam)
          }}
          eventSettings={eventSettings}
          showConfirm={showConfirm}
        />
      )}

      {fullscreenImage && (
        <div className="modal-overlay" onClick={() => setFullscreenImage(null)} style={{ zIndex: 3000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', width: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--surface)' }}>
            <div className="modal-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Visualizar Imagem - {fullscreenImage.name}</h3>
              <button className="btn-close" onClick={() => setFullscreenImage(null)}><i className="fas fa-times"></i></button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', background: '#111', borderRadius: '0.5rem', marginBottom: '1.5rem', padding: '1rem' }}>
              <img src={fullscreenImage.url} alt={fullscreenImage.name} style={{ width: '18.75rem', height: '18.75rem', objectFit: 'contain' }} />
            </div>

            <div className="modal-actions" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFullscreenImage(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
