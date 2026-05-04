import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import FlightPanel from '../FlightPanel'
import './PublicDashboard.css'

export default function PublicDashboard({ onBack }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*, profiles!teams_leader_id_fkey(name)')
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

  if (loading) {
    return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>Carregando radares...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '1rem' }}>
      <FlightPanel teams={teams} onBack={onBack} />
    </div>
  )
}
