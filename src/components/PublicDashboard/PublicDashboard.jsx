import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './PublicDashboard.css'

export default function PublicDashboard({ onBack }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('status', 'approved')
          .order('score', { ascending: false })
        
        if (error) throw error
        setTeams(data || [])
      } catch (error) {
        console.error('Erro ao buscar equipes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  return (
    <div className="public-dashboard aviation-theme">
      <header className="aviation-header">
        <button onClick={onBack} className="btn-back"><i className="fas fa-arrow-left"></i> Voltar</button>
        <h1><i className="fas fa-plane"></i> Gincana MT - Painel de Voo</h1>
      </header>

      <div className="aviation-content">
        {loading ? (
          <div className="loading">Carregando radares...</div>
        ) : (
          <div className="radar-grid">
            {teams.map((team, index) => (
              <div key={team.id} className={`radar-card position-${index + 1}`} style={{'--team-color': team.color}}>
                <div className="radar-rank">#{index + 1}</div>
                <div className="radar-info">
                  <h2>{team.name}</h2>
                  <div className="radar-score">{team.score} PTS</div>
                </div>
                {team.image_url && <img src={team.image_url} alt={team.name} className="radar-avatar" />}
              </div>
            ))}
            {teams.length === 0 && <div className="no-data">Nenhuma equipe no radar ainda.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
