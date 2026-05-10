import { useState } from 'react'

export default function Challenges({ challenges, onApply, onAddNew, onEdit, onRemove, hasTeams, userRole, showAlert }) {
  const [challengeInfoModal, setChallengeInfoModal] = useState(null)
  const canManage = ['admin', 'professor'].includes(userRole)
  const canScore = ['admin', 'professor', 'supervisor'].includes(userRole)
  return (
    <section id="challenges" className="section">
      <div className="data-card">
        <div className="table-header">
          <h3>Desafios</h3>
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={onAddNew}>
              + Novo
            </button>
          )}
        </div>
        <div className="challenges-grid">
          {challenges.length === 0 ? (
            <p className="text-muted">Clique em "Novo Desafio" para começar.</p>
          ) : (
            challenges.map(c => (
              <div className="stat-card challenge-card" key={c.id}>
                <i className={`fas ${c.icon} fa-2x`}></i>
                <h4>
                  {c.title}
                  <button className="btn-icon text-info" onClick={() => setChallengeInfoModal(c)} style={{ marginLeft: '0.5rem', fontSize: '1rem', color: '#3498db' }}>
                    <i className="fas fa-info-circle"></i>
                  </button>
                </h4>
                <p>Valor: {c.points} pts</p>
                {canScore && (
                  <div className="challenge-actions">
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => {
                        if (!hasTeams) {
                          showAlert('Cadastre uma equipe primeiro!')
                          return
                        }
                        onApply(c)
                      }}
                    >
                      Atribuir
                    </button>
                    {canManage && (
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => onEdit(c)} title="Editar Desafio">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon" onClick={() => onRemove(c.id)} title="Remover Desafio">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {challengeInfoModal && (
        <div className="blur-modal-overlay" onClick={() => setChallengeInfoModal(null)}>
          <div className="blur-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color, var(--primary))' }}>
              <i className={`fas ${challengeInfoModal.icon}`}></i> {challengeInfoModal.title}
            </h3>
            <div style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '1rem' }}>
              <p><strong>Pontos (Vitória):</strong> <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{challengeInfoModal.win_points || challengeInfoModal.points}</span></p>
              <p><strong>Pontos (Participação):</strong> <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{challengeInfoModal.consolation_points || 0}</span></p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#888' }}>Descrição do Desafio:</p>
                {challengeInfoModal.description ? challengeInfoModal.description.split('\n').map((line, i) => <p key={i} style={{ margin: 0 }}>{line}</p>) : <p>Sem detalhes.</p>}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setChallengeInfoModal(null)} style={{ width: '100%' }}>Fechar</button>
          </div>
        </div>
      )}
    </section>
  )
}