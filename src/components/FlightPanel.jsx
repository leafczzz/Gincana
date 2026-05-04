import './FlightPanel.css'

export default function FlightPanel({ teams, onBack }) {
  return (
    <section id="flight-panel" className="section">
      <div className="flight-board">
        <div className="flight-board-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn-back-flight" title="Voltar">
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <h2><i className="fas fa-plane-departure"></i> PAINEL DE VOO - GINCANA</h2>
          </div>
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>AO VIVO</span>
          </div>
        </div>
        
        <div className="flight-table-container">
          <table className="flight-table">
            <thead>
              <tr>
                <th>VOO</th>
                <th>EQUIPE / DESTINO</th>
                <th>LÍDER</th>
                <th>PONTOS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">NENHUM VOO PROGRAMADO</td>
                </tr>
              ) : (
                teams.map((t, index) => {
                  const flightNumber = `GNC-${String(index + 1).padStart(3, '0')}`
                  
                  return (
                    <tr key={t.id}>
                      <td className="flight-number">{flightNumber}</td>
                      <td className="team-name">
                        {t.name.toUpperCase()}
                      </td>
                      <td className="leader-name">
                        {t.profiles?.name ? t.profiles.name.toUpperCase() : 'N/A'}
                      </td>
                      <td className="points-col">
                        {String(t.score).padStart(4, '0')}
                      </td>
                      <td className="status-col">
                        <span className="pulse-dot-small"></span>
                        ON TIME
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
