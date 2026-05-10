import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './TeamDetailsModal.css'

export default function TeamDetailsModal({ team, onClose, userProfile, onUpdateTeam }) {
  const isAdminOrProf = ['admin', 'professor'].includes(userProfile?.role)
  const [history, setHistory] = useState(team.history || [])
  const [editingLogId, setEditingLogId] = useState(null)
  const [editPoints, setEditPoints] = useState(0)
  const [editDesc, setEditDesc] = useState('')
  const [logInfoModal, setLogInfoModal] = useState(null)

  const startEdit = (log) => {
    setEditingLogId(log.id)
    setEditPoints(log.points)
    setEditDesc(log.desc)
  }

  const cancelEdit = () => {
    setEditingLogId(null)
  }

  const saveEdit = async (logId) => {
    const newHistory = history.map(log => {
      if (log.id === logId) {
        return { ...log, points: editPoints, desc: editDesc }
      }
      return log
    })

    const scoreDiff = newHistory.reduce((acc, log) => acc + log.points, 0)

    try {
      await supabase
        .from('teams')
        .update({ history: newHistory, score: scoreDiff })
        .eq('id', team.id)
      
      setHistory(newHistory)
      setEditingLogId(null)
      if (onUpdateTeam) onUpdateTeam({ ...team, history: newHistory, score: scoreDiff })
    } catch (error) {
      console.error('Erro ao atualizar log:', error)
      alert('Erro ao atualizar o lançamento.')
    }
  }

  const deleteLog = async (logId) => {
    if (!window.confirm('Tem certeza que deseja remover este lançamento?')) return
    
    const newHistory = history.filter(log => log.id !== logId)
    const scoreDiff = newHistory.reduce((acc, log) => acc + log.points, 0)

    try {
      await supabase
        .from('teams')
        .update({ history: newHistory, score: scoreDiff })
        .eq('id', team.id)
      
      setHistory(newHistory)
      if (onUpdateTeam) onUpdateTeam({ ...team, history: newHistory, score: scoreDiff })
    } catch (error) {
      console.error('Erro ao deletar log:', error)
      alert('Erro ao deletar o lançamento.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalhes da Equipe: {team.name}</h3>
          <button className="btn-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        <div className="details-content">
          <div className="details-section">
            <h4><i className="fas fa-users"></i> Membros da Equipe</h4>
            {team.members && team.members.length > 0 ? (
              <ul className="members-list-details">
                {team.members.map((m, idx) => (
                  <li key={idx}><i className="fas fa-user"></i> {m}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum membro cadastrado.</p>
            )}
          </div>

          <div className="details-section">
            <h4><i className="fas fa-history"></i> Histórico de Pontuações</h4>
            {history.length > 0 ? (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      {isAdminOrProf && <th>Ações</th>}
                      <th>Pontos</th>
                      <th className="hide-on-mobile">Autor</th>
                      <th className="hide-on-mobile">Motivo</th>
                      <th className="info-col show-on-mobile">Info</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((log, idx) => {
                      // format datetime
                      let timeStr = ''
                      let dateStr = log.date || ''
                      if (log.timestamp) {
                        const d = new Date(log.timestamp)
                        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        dateStr = d.toLocaleDateString()
                      } else {
                        // fallback if no timestamp
                        timeStr = '--:--'
                      }

                      return (
                      <tr key={log.id || `log-${idx}`}>
                        {isAdminOrProf && (
                          <td className="actions-cell">
                            {editingLogId === log.id ? (
                              <>
                                <button className="btn-icon text-success" onClick={() => saveEdit(log.id)}><i className="fas fa-check"></i></button>
                                <button className="btn-icon text-danger" onClick={cancelEdit}><i className="fas fa-times"></i></button>
                              </>
                            ) : (
                              <>
                                <button className="btn-icon" onClick={() => startEdit(log)}><i className="fas fa-edit"></i></button>
                                <button className="btn-icon text-danger" onClick={() => deleteLog(log.id)}><i className="fas fa-trash"></i></button>
                              </>
                            )}
                          </td>
                        )}
                        <td>
                          {editingLogId === log.id ? (
                            <input 
                              type="number" 
                              value={editPoints} 
                              onChange={e => setEditPoints(parseInt(e.target.value) || 0)} 
                              className="edit-input"
                              style={{ width: '5rem' }}
                            />
                          ) : (
                            <span className={log.points >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                              {log.points > 0 ? '+' : ''}{log.points}
                            </span>
                          )}
                        </td>
                        <td className="hide-on-mobile">{log.author || 'Desconhecido'}</td>
                        <td className="hide-on-mobile">
                          {editingLogId === log.id ? (
                            <input 
                              type="text" 
                              value={editDesc} 
                              onChange={e => setEditDesc(e.target.value)} 
                              className="edit-input"
                            />
                          ) : (
                            log.desc
                          )}
                        </td>
                        <td className="info-col show-on-mobile">
                          <button className="btn-icon text-info" onClick={() => setLogInfoModal(log)}>
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </td>
                        <td className="time-col">
                          <div className="time-primary">{timeStr}</div>
                          <div className="date-secondary">{dateStr}</div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhum histórico de pontuação.</p>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>

      {logInfoModal && (
        <div className="blur-modal-overlay" onClick={() => setLogInfoModal(null)}>
          <div className="blur-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Detalhes do Lançamento</h3>
            <p><strong>Autor:</strong> {logInfoModal.author || 'Desconhecido'}</p>
            <p><strong>Motivo:</strong> {logInfoModal.desc}</p>
            <button className="btn btn-primary" onClick={() => setLogInfoModal(null)} style={{ marginTop: '1rem', width: '100%' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
