export default function Dashboard({ teams, leaderScore, leader }) {
  const sortedAll = [...teams].sort((a, b) => b.score - a.score)
  const sortedTeams = sortedAll.slice(0, 3)

  return (
    <section id="dashboard" className="section active">
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <small>Equipes</small>
            <h2>{teams.length}</h2>
          </div>
          <i className="fas fa-users-viewfinder" style={{ color: 'var(--secondary)' }}></i>
        </div>
        <div className="stat-card">
          <div>
            <small>Líder</small>
            <h2>{leader}</h2>
          </div>
          <i className="fas fa-crown" style={{ color: 'gold' }}></i>
        </div>
        <div className="stat-card">
          <div>
            <small>Pontos do Líder</small>
            <h2>{leaderScore || 0}</h2>
          </div>
          <i className="fas fa-star" style={{ color: 'var(--accent)' }}></i>
        </div>
      </div>

      <div className="data-card" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3>Placar Geral</h3>
        </div>
        <div className="table-container">
          <table className="scoreboard-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.05)' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Pos</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Equipe</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedAll.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-muted" style={{ padding: '1rem' }}>Nenhuma equipe cadastrada.</td>
                </tr>
              ) : (
                sortedAll.map((t, index) => (
                  <tr key={t.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}><strong>{index + 1}º</strong></td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <div className="team-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.name} className="team-rank-image" style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div className="color-dot" style={{ background: t.color, width: '1rem', height: '1rem', borderRadius: '50%' }}></div>
                        )}
                        {t.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}><strong>{t.score}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}