import { useState } from 'react'
import TeamDetailsModal from './TeamDetailsModal'

export default function Teams({ teams, onRemove, onAddNew, onEdit, onUpdateTeam, onBlockTeam, user, profile, eventSettings, showConfirm }) {
  const [detailsTeam, setDetailsTeam] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const isAdminOrProf = ['admin', 'professor'].includes(profile?.role)
  const isStudentOrSupervisor = ['student', 'supervisor'].includes(profile?.role)

  return (
    <section id="teams" className="section">
      <div className="data-card">
        <div className="table-header">
          <h3>Equipes</h3>
          {isStudentOrSupervisor ? (
            <button className="btn btn-primary btn-sm" onClick={onAddNew}>
              + Criar Minha Equipe
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onAddNew}>
              + Nova Equipe
            </button>
          )}
        </div>
        <div className="teams-grid">
          {teams.length === 0 ? (
            <p className="text-muted">Clique em "Nova Equipe" para começar.</p>
          ) : (
            [...teams].sort((a, b) => a.name.localeCompare(b.name)).map(t => {
              const isLeader = t.leader_id === user?.id
              const canEdit = isAdminOrProf || isLeader

              return (
                <div className="stat-card team-card" key={t.id} style={{ borderTop: `0.25rem solid ${t.color}` }}>
                  {t.image_url ? (
                    <div className="team-image">
                      <img 
                        src={t.image_url} 
                        alt={t.name} 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setFullscreenImage({ url: t.image_url, name: t.name })} 
                        title="Clique para ampliar a imagem"
                      />
                    </div>
                  ) : t.icon ? (
                    <div className="team-image" style={{ background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                      <i className={`fas ${t.icon}`}></i>
                    </div>
                  ) : (
                    <div className="color-dot" style={{ background: t.color }}></div>
                  )}
                  <h3 style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.name}>{t.name}</h3>
                  <p style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.profiles?.name || 'Não informado'}>
                    <strong>Líder:</strong> {t.profiles?.name || 'Não informado'}
                  </p>
                  <p><strong>Status:</strong> {t.status === 'pending' ? 'Pendente' : t.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</p>
                  <p className="score-badge">{t.score} {eventSettings?.points_label ? eventSettings.points_label.toUpperCase() : 'PTS'}</p>
                  <div className="team-actions">
                    <button className="btn-icon text-info" onClick={() => setDetailsTeam(t)} title="Exibir Detalhes" style={{ color: '#3498db' }}>
                      <i className="fas fa-info-circle"></i>
                    </button>
                    {canEdit && (
                      <>
                        <button className="btn-icon" onClick={() => onEdit(t)} title="Editar Equipe">
                          <i className="fas fa-edit"></i>
                        </button>
                      {isAdminOrProf && (
                        <button 
                          className="btn-icon text-warning" 
                          onClick={() => showConfirm(`Deseja realmente enviar a equipe "${t.name}" para a fila de aprovações? Ela ficará oculta até ser aprovada novamente.`, () => onBlockTeam(t.id))} 
                          title="Bloquear Equipe (Enviar para Aprovações)"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      )}
                      {isAdminOrProf && (
                        <button className="btn-icon" onClick={() => onRemove(t.id)} title="Remover Equipe">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {detailsTeam && (
        <TeamDetailsModal 
          team={detailsTeam}
          userProfile={profile}
          onClose={() => setDetailsTeam(null)}
          onUpdateTeam={(t) => {
            setDetailsTeam(t)
            if (onUpdateTeam) onUpdateTeam(t)
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
    </section>
  )
}