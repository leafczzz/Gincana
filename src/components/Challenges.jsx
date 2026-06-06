import { useState } from 'react'

export default function Challenges({ challenges, onApply, onAddNew, onEdit, onRemove, hasTeams, userRole, showAlert, eventSettings }) {
  const [challengeInfoModal, setChallengeInfoModal] = useState(null)
  const canManage = ['admin', 'professor'].includes(userRole)
  const canScore = ['admin', 'professor', 'supervisor'].includes(userRole)
  return (
    <section id="challenges" className="section">
      <div className="data-card">
        <div className="table-header">
          <h3>{eventSettings?.challenge_label_plural ? (eventSettings.challenge_label_plural.charAt(0).toUpperCase() + eventSettings.challenge_label_plural.slice(1).toLowerCase()) : 'Desafios'}</h3>
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={onAddNew}>
              + Novo
            </button>
          )}
        </div>
        <div className="challenges-grid">
          {challenges.length === 0 ? (
            <p className="text-muted">Nenhum cadastrado. Clique em "Novo" para começar.</p>
          ) : (
            challenges.map(c => (
              <div className="stat-card challenge-card" key={c.id}>
                <i className={`fas ${c.icon} fa-2x`}></i>
                <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', width: '100%', wordBreak: 'break-word', minHeight: '2.5rem' }}>
                  <span style={{ flexGrow: 1, textAlign: 'center' }}>{c.title}</span>
                  <button className="btn-icon text-info" onClick={() => setChallengeInfoModal(c)} style={{ padding: '0.2rem', fontSize: '1.1rem', color: '#3498db', flexShrink: 0 }} title="Ver Informações">
                    <i className="fas fa-info-circle"></i>
                  </button>
                </h4>
                <p>Valor: {c.points} {eventSettings?.points_label ? eventSettings.points_label.toLowerCase() : 'pts'}</p>
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
        <div className="modal-overlay" onClick={() => setChallengeInfoModal(null)}>
          <div className="modal" style={{ position: 'relative', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setChallengeInfoModal(null)}
              style={{ position: 'absolute', top: '0.8rem', right: '1rem' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className={`fas ${challengeInfoModal.icon}`}></i> {challengeInfoModal.title}
              </h3>
            </div>
            <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>
              <p style={{ marginBottom: '0.5rem' }}><strong>{eventSettings?.points_label ? (eventSettings.points_label.charAt(0).toUpperCase() + eventSettings.points_label.slice(1).toLowerCase()) : 'Pontos'} (Vitória):</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{challengeInfoModal.win_points || challengeInfoModal.points}</span></p>
              <p style={{ marginBottom: '0.5rem' }}><strong>{eventSettings?.points_label ? (eventSettings.points_label.charAt(0).toUpperCase() + eventSettings.points_label.slice(1).toLowerCase()) : 'Pontos'} (Participação):</strong> <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{challengeInfoModal.consolation_points || 0}</span></p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.08)', maxHeight: '12rem', overflowY: 'auto' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Descrição do {eventSettings?.challenge_label ? eventSettings.challenge_label.toLowerCase() : 'Desafio'}:</p>
                {challengeInfoModal.description ? challengeInfoModal.description.split('\n').map((line, i) => <p key={i} style={{ margin: 0, wordBreak: 'break-word' }}>{line}</p>) : <p>Sem detalhes.</p>}
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setChallengeInfoModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}