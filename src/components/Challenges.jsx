export default function Challenges({ challenges, onApply, onAddNew, onEdit, onRemove, hasTeams }) {
  return (
    <section id="challenges" className="section">
      <div className="data-card">
        <div className="table-header">
          <h3>Desafios</h3>
          <button className="btn btn-primary btn-sm" onClick={onAddNew}>
            + Novo
          </button>
        </div>
        <div className="challenges-grid">
          {challenges.length === 0 ? (
            <p className="text-muted">Clique em "Novo Desafio" para começar.</p>
          ) : (
            challenges.map(c => (
              <div className="stat-card challenge-card" key={c.id}>
                <i className={`fas ${c.icon} fa-2x`}></i>
                <h4>{c.title}</h4>
                <p>Valor: {c.points} pts</p>
                <div className="challenge-actions">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => {
                      if (!hasTeams) {
                        alert('Cadastre uma equipe primeiro!')
                        return
                      }
                      onApply(c)
                    }}
                  >
                    Atribuir
                  </button>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => onEdit(c)} title="Editar Desafio">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon" onClick={() => onRemove(c.id)} title="Remover Desafio">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}