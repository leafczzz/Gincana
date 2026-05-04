export default function Teams({ teams, onRemove, onAddNew, onEdit, user, profile }) {
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
            teams.map(t => {
              const isLeader = t.leader_id === user?.id
              const canEdit = isAdminOrProf || isLeader

              return (
                <div className="stat-card team-card" key={t.id} style={{ borderTop: `4px solid ${t.color}` }}>
                  {t.image_url ? (
                    <div className="team-image">
                      <img src={t.image_url} alt={t.name} />
                    </div>
                  ) : (
                    <div className="color-dot" style={{ background: t.color }}></div>
                  )}
                  <h3>{t.name}</h3>
                  <p><strong>Líder:</strong> {t.profiles?.name || 'Não informado'}</p>
                  <p><strong>Status:</strong> {t.status === 'pending' ? 'Pendente' : t.status === 'approved' ? 'Aprovado' : 'Rejeitado'}</p>
                  <p className="score-badge">{t.score} PTS</p>
                  
                  {canEdit && (
                    <div className="team-actions">
                      <button className="btn-icon" onClick={() => onEdit(t)} title="Editar Equipe">
                        <i className="fas fa-edit"></i>
                      </button>
                      {(isAdminOrProf || isLeader) && (
                        <button className="btn-icon" onClick={() => onRemove(t.id)} title="Remover Equipe">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}