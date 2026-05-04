import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Teams from './components/Teams'
import Challenges from './components/Challenges'
import Scoreboard from './components/Scoreboard'
import TeamModal from './components/TeamModal'
import PointsModal from './components/PointsModal'
import ChallengeModal from './components/ChallengeModal'
import Toast from './components/Toast'
import LoginModal from './components/Auth/LoginModal'
import RegisterModal from './components/Auth/RegisterModal'
import LandingPage from './components/Landing/LandingPage'
import PublicDashboard from './components/PublicDashboard/PublicDashboard'
import Users from './components/Users/Users'
import Settings from './components/Settings/Settings'
import Approvals from './components/Approvals/Approvals'
import ProfileModal from './components/ProfileModal'
import FlightPanel from './components/FlightPanel'
import './App.css'

const sections = {
  dashboard: { title: 'Dashboard', desc: 'Bem-vindo ao gerenciador da gincana.' },
  flightPanel: { title: 'Painel de Voo', desc: 'Acompanhe as equipes em tempo real.' },
  teams: { title: 'Gerenciar Equipes', desc: 'Cadastre e visualize as equipes participantes.' },
  challenges: { title: 'Desafios', desc: 'Gerencie os desafios da gincana.' },
  scoreboard: { title: 'Placar Geral', desc: 'Acompanhe a classificação em tempo real.' },
  users: { title: 'Gerenciar Usuários', desc: 'Gerencie os usuários do sistema.' },
  approvals: { title: 'Aprovações', desc: 'Aprove equipes pendentes.' },
  settings: { title: 'Configurações', desc: 'Configure o evento.' }
}

function AppContent() {
  const { user, profile, loading, signOut } = useAuth()
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [teams, setTeams] = useState([])
  const [challenges, setChallenges] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [teamEdit, setTeamEdit] = useState(null)
  const [pointsModalOpen, setPointsModalOpen] = useState(false)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [challengeEdit, setChallengeEdit] = useState(null)
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [toasts, setToasts] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [publicView, setPublicView] = useState('landing')
  const [fullscreenFlight, setFullscreenFlight] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTeams()
      fetchChallenges()
    }
  }, [user])

  async function fetchTeams() {
    if (!supabase) {
      console.error('Supabase não configurado!')
      setDataLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, profiles!teams_leader_id_fkey(name)')
        .order('score', { ascending: false })
      
      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Erro ao buscar equipes:', error.message)
      showToast('Erro ao conectar com o banco de dados', 'error')
    } finally {
      setDataLoading(false)
    }
  }

  async function fetchChallenges() {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('points', { ascending: false })
      
      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('Erro ao buscar desafios:', error.message)
    }
  }

  function showToast(message, type = 'primary') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  async function addTeam(name, color, imageFile, members = []) {
    if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      showToast('Já existe uma equipe com este nome!', 'error')
      return
    }

    let imageUrl = null

    if (imageFile) {
      try {
        const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.${imageFile.name.split('.').pop()}`
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('bd')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase
          .storage
          .from('bd')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      } catch (error) {
        console.error('Erro ao upload imagem:', error.message)
        showToast('Erro ao fazer upload da imagem', 'error')
      }
    }

    const newTeam = {
      name,
      color,
      score: 0,
      history: [],
      image_url: imageUrl,
      leader_id: user.id,
      status: profile?.role === 'student' ? 'pending' : 'approved',
      members
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([newTeam])
        .select('*, profiles!teams_leader_id_fkey(name)')
        .single()
      
      if (error) throw error
      setTeams(prev => [...prev, data])
      showToast(`Equipe "${name}" criada com sucesso!`, 'success')
    } catch (error) {
      console.error('Erro ao criar equipe:', error.message)
      showToast('Erro ao criar equipe no banco', 'error')
    }
    
    setTeamModalOpen(false)
  }

  async function updateTeam(id, name, color, imageFile, members = []) {
    const team = teams.find(t => t.id === id)
    if (!team) return

    let imageUrl = team.image_url

    if (imageFile) {
      try {
        const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.${imageFile.name.split('.').pop()}`
        const { error: uploadError } = await supabase
          .storage
          .from('bd')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase
          .storage
          .from('bd')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      } catch (error) {
        console.error('Erro ao upload imagem:', error.message)
        showToast('Erro ao fazer upload da imagem', 'error')
      }
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ name, color, image_url: imageUrl, members })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setTeams(prev => prev.map(t => t.id === id ? data : t))
      showToast(`Equipe "${name}" atualizada!`, 'success')
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error.message)
      showToast('Erro ao atualizar equipe', 'error')
    }
    
    setTeamEdit(null)
    setTeamModalOpen(false)
  }

  async function removeTeam(id) {
    if (!confirm('Deseja realmente excluir esta equipe? Todos os pontos serão perdidos.')) {
      return
    }

    try {
      await supabase.from('teams').delete().eq('id', id)
    } catch (error) {
      console.log('Erro ao remover')
    }

    const newTeams = teams.filter(t => t.id !== id)
    setTeams(newTeams)
    showToast('Equipe removida.', 'primary')
  }

  async function addChallenge(title, description, winPoints, consolationPoints, icon) {
    const newChallenge = {
      title,
      description,
      points: parseInt(winPoints),
      win_points: parseInt(winPoints),
      consolation_points: parseInt(consolationPoints),
      icon: icon || 'fa-star'
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([newChallenge])
        .select()
        .single()
      
      if (error) throw error
      setChallenges(prev => [...prev, data])
      showToast(`Desafio "${title}" criado com sucesso!`, 'success')
    } catch (error) {
      console.error('Erro ao criar desafio:', error.message)
      showToast('Erro ao criar desafio', 'error')
    }
    
    setChallengeModalOpen(false)
  }

  async function updateChallenge(id, title, description, winPoints, consolationPoints, icon) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({ 
          title, 
          description,
          points: parseInt(winPoints), 
          win_points: parseInt(winPoints),
          consolation_points: parseInt(consolationPoints),
          icon: icon || 'fa-star' 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setChallenges(prev => prev.map(c => c.id === id ? data : c))
      showToast(`Desafio "${title}" atualizado!`, 'success')
    } catch (error) {
      console.error('Erro ao atualizar desafio:', error.message)
      showToast('Erro ao atualizar desafio', 'error')
    }
    
    setChallengeEdit(null)
    setChallengeModalOpen(false)
  }

  async function removeChallenge(id) {
    if (!confirm('Deseja realmente excluir este desafio?')) {
      return
    }

    try {
      await supabase.from('challenges').delete().eq('id', id)
    } catch (error) {
      console.log('Erro ao remover')
    }

    setChallenges(prev => prev.filter(c => c.id !== id))
    showToast('Desafio removido.', 'primary')
  }

  async function addPoints(payload) {
    const { winners, participants, points, desc, isConsolationMode, consolationPoints } = payload

    try {
      const updatedTeams = [...teams]

      for (const team of updatedTeams) {
        let appliedPoints = 0
        let appliedDesc = desc

        // Só recebe pontos se participou
        if (participants.includes(team.id)) {
          if (winners.includes(team.id)) {
            appliedPoints = points
          } else if (isConsolationMode) {
            appliedPoints = consolationPoints
            appliedDesc = `${desc} (Participação)`
          }
        }

        if (appliedPoints !== 0) {
          team.score += appliedPoints
          team.history = [...(team.history || []), { points: appliedPoints, desc: appliedDesc, date: new Date().toLocaleDateString() }]
          
          await supabase
            .from('teams')
            .update({ score: team.score, history: team.history })
            .eq('id', team.id)
        }
      }

      setTeams(updatedTeams)
      showToast('Pontuações registradas com sucesso!', 'success')
    } catch (error) {
      console.log('Erro ao adicionar pontos')
      showToast('Erro ao salvar pontos', 'error')
    }

    setPointsModalOpen(false)
  }

  function openPointsModal(challenge = null) {
    setSelectedChallenge(challenge)
    setPointsModalOpen(true)
  }

  const userRole = profile?.role || 'student'
  const approvedTeams = teams.filter(t => t.status === 'approved')
  const sortedTeams = [...approvedTeams].sort((a, b) => b.score - a.score)
  const leader = sortedTeams.length > 0 ? sortedTeams[0].name : '---'
  const leaderScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0

  if (!user) {
    if (publicView === 'dashboard') {
      return <PublicDashboard onBack={() => setPublicView('landing')} />
    }
    return (
      <>
        <LandingPage 
          onEnterApp={() => setShowLogin(true)} 
          onViewDashboard={() => setPublicView('dashboard')} 
        />
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false)
              setShowRegister(true)
            }}
          />
        )}
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false)
              setShowLogin(true)
            }}
          />
        )}
      </>
    )
  }

  const sectionsWithRole = {
    ...sections,
    teams: { 
      title: userRole === 'student' ? 'Equipes' : 'Gerenciar Equipes', 
      desc: userRole === 'student' ? 'Visualize as equipes participantes.' : 'Cadastre e visualize as equipes participantes.' 
    }
  }

  if (user && !loading && !profile) {
    return (
      <div className="landing-page">
        <div className="landing-page-bg" style={{ backgroundImage: `url("${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/bd/foto%20iff.jpeg")` }}></div>
        <div className="landing-page-overlay"></div>
        <div className="landing-content">
          <div className="landing-icon"><i className="fas fa-user-slash"></i></div>
          <h1 className="landing-title" style={{ color: '#fff' }}>Perfil Não Encontrado</h1>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>Seu perfil foi removido do sistema. Entre em contato com a organização.</p>
          <button onClick={signOut} className="btn btn-primary btn-large">Sair</button>
        </div>
      </div>
    )
  }

  if (profile?.status === 'pending') {
    return (
      <div className="landing-page">
        <div className="landing-page-bg" style={{ backgroundImage: `url("${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/bd/foto%20iff.jpeg")` }}></div>
        <div className="landing-page-overlay"></div>
        <div className="landing-content">
          <div className="landing-icon"><i className="fas fa-clock"></i></div>
          <h1 className="landing-title" style={{ color: '#fff' }}>Conta em Análise</h1>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>Sua conta foi criada e está aguardando aprovação de um professor ou administrador.</p>
          <button onClick={signOut} className="btn btn-primary btn-large">Sair</button>
        </div>
      </div>
    )
  }

  if (profile?.status === 'blocked') {
    return (
      <div className="landing-page">
        <div className="landing-page-bg" style={{ backgroundImage: `url("${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/bd/foto%20iff.jpeg")` }}></div>
        <div className="landing-page-overlay"></div>
        <div className="landing-content">
          <div className="landing-icon"><i className="fas fa-ban"></i></div>
          <h1 className="landing-title" style={{ color: '#fff' }}>Acesso Bloqueado</h1>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>Seu acesso ao sistema foi bloqueado por um administrador.</p>
          <button onClick={signOut} className="btn btn-primary btn-large">Sair</button>
        </div>
      </div>
    )
  }

  if (fullscreenFlight) {
    return <PublicDashboard onBack={() => setFullscreenFlight(false)} />
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentSection={currentSection}
        onNavigate={(section) => {
          if (section === 'flightPanel') {
            setFullscreenFlight(true)
          } else {
            setCurrentSection(section)
          }
        }}
        userRole={userRole}
      />
      
      <main className="main-content-wrapper">
        <Header
          title={sectionsWithRole[currentSection].title}
          desc={sectionsWithRole[currentSection].desc}
          onMenuClick={() => setSidebarOpen(true)}
          onQuickPoints={() => {
            if (teams.length === 0) {
              showToast('Cadastre uma equipe primeiro!', 'error')
              return
            }
            openPointsModal()
          }}
          user={user}
          profile={profile}
          onLogin={() => setShowLogin(true)}
          onLogout={signOut}
          onProfile={() => setProfileModalOpen(true)}
        />

        <div className="main-content">
          {currentSection === 'dashboard' && (
            <Dashboard
              teams={approvedTeams}
              leaderScore={leaderScore}
              leader={leader}
            />
          )}
          {currentSection === 'teams' && (
            <Teams 
              teams={userRole === 'student' ? teams.filter(t => t.status === 'approved' || t.leader_id === user.id) : teams} 
              user={user}
              profile={profile}
              onRemove={removeTeam}
              onAddNew={() => {
                setTeamEdit(null)
                setTeamModalOpen(true)
              }}
              onEdit={(team) => {
                setTeamEdit(team)
                setTeamModalOpen(true)
              }}
            />
          )}
          {currentSection === 'challenges' && (
            <Challenges 
              challenges={challenges}
              onAddNew={() => {
                setChallengeEdit(null)
                setChallengeModalOpen(true)
              }}
              onEdit={(challenge) => {
                setChallengeEdit(challenge)
                setChallengeModalOpen(true)
              }}
              onRemove={removeChallenge}
              onApply={(c) => openPointsModal(c)}
              hasTeams={teams.length > 0}
              userRole={userRole}
            />
          )}
          {currentSection === 'scoreboard' && (
            <Scoreboard teams={sortedTeams} />
          )}
          {currentSection === 'users' && <Users />}
          {currentSection === 'settings' && <Settings />}
          {currentSection === 'approvals' && <Approvals />}
        </div>
      </main>

      {teamModalOpen && (
        <TeamModal
          team={teamEdit}
          onClose={() => {
            setTeamModalOpen(false)
            setTeamEdit(null)
          }}
          onSave={(name, color, imageFile, members) => {
            if (teamEdit) {
              updateTeam(teamEdit.id, name, color, imageFile, members)
            } else {
              addTeam(name, color, imageFile, members)
            }
          }}
        />
      )}

      {pointsModalOpen && (
        <PointsModal
          teams={teams}
          challenges={challenges}
          selectedChallenge={selectedChallenge}
          onClose={() => {
            setPointsModalOpen(false)
            setSelectedChallenge(null)
          }}
          onSave={addPoints}
        />
      )}

      {challengeModalOpen && (
        <ChallengeModal
          challenge={challengeEdit}
          onClose={() => {
            setChallengeModalOpen(false)
            setChallengeEdit(null)
          }}
          onSave={(title, description, winPoints, consolationPoints, icon) => {
            if (challengeEdit) {
              updateChallenge(challengeEdit.id, title, description, winPoints, consolationPoints, icon)
            } else {
              addChallenge(title, description, winPoints, consolationPoints, icon)
            }
          }}
        />
      )}

      {profileModalOpen && (
        <ProfileModal 
          user={user}
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onUpdate={(updatedProfile) => {
            setProfileModalOpen(false)
            showToast('Perfil atualizado!', 'success')
            window.location.reload()
          }}
        />
      )}

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App