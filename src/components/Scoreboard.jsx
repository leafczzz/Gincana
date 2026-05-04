export default function Scoreboard({ teams }) {
  return (
    <section id="scoreboard" className="section">
      <div className="data-card">
        <h3>Placar Geral</h3>
        <div className="table-container">
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Equipe</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-muted">Nenhuma equipe cadastrada.</td>
                </tr>
              ) : (
                teams.map((t, index) => (
                  <tr key={t.id}>
                    <td><strong>{index + 1}º</strong></td>
                    <td>
                      <div className="team-info">
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.name} className="team-rank-image" />
                        ) : (
                          <div className="color-dot" style={{ background: t.color }}></div>
                        )}
                        {t.name}
                      </div>
                    </td>
                    <td><strong>{t.score}</strong></td>
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