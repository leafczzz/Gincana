export default function Dashboard({ teams, leaderScore, leader }) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score).slice(0, 3)

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

      <div className="data-card">
        <div className="table-header">
          <h3>Top 3 Equipes</h3>
        </div>
        <div id="top-teams-list">
          {sortedTeams.length === 0 ? (
            <p className="text-muted">Nenhuma equipe cadastrada.</p>
          ) : (
            sortedTeams.map((t, index) => (
              <div className="team-rank-item" key={t.id}>
                <span className="rank-pos">#{index + 1}</span>
                <div className="team-info">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="team-rank-image" />
                  ) : (
                    <div className="color-dot" style={{ background: t.color }}></div>
                  )}
                  <strong>{t.name}</strong>
                </div>
                <span className="rank-score">{t.score} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}