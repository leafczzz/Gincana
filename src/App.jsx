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
import FlightPlan from './components/FlightPlan/FlightPlan'
import PopupModal from './components/PopupModal'
import './App.css'

const sections = {
  dashboard: { title: 'Dashboard', desc: 'Bem-vindo ao gerenciador da gincana.' },
  flightPanel: { title: 'Painel de Voo', desc: 'Acompanhe as equipes em tempo real.' },
  flightPlan: { title: 'Plano de Voo', desc: 'Gere tickets de desafios com carimbo.' },
  teams: { title: 'Gerenciar Equipes', desc: 'Cadastre e visualize as equipes participantes.' },
  challenges: { title: 'Desafios', desc: 'Gerencie os desafios da gincana.' },
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
  
  const getInitialEventSettings = () => {
    const saved = localStorage.getItem('gincana_event_settings')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { return null }
    }
    return null
  }
  const [eventSettings, setEventSettings] = useState(getInitialEventSettings())
  
  const [allUsers, setAllUsers] = useState([])
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'alert'
  })

  const showAlert = (message, title = 'Aviso') => {
    setPopup({
      isOpen: true,
      title,
      message,
      onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false })),
      onCancel: () => setPopup(prev => ({ ...prev, isOpen: false })),
      type: 'alert'
    })
  }

  const showConfirm = (message, onConfirmAction, title = 'Confirmar') => {
    setPopup({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction()
        setPopup(prev => ({ ...prev, isOpen: false }))
      },
      onCancel: () => setPopup(prev => ({ ...prev, isOpen: false })),
      type: 'confirm'
    })
  }

  useEffect(() => {
    if (user) {
      fetchTeams()
      fetchChallenges()
      fetchAllUsers()
    }
    fetchEventSettings()

    const savedLabels = localStorage.getItem('gincana_custom_labels')
    if (savedLabels) {
      try {
        const parsed = JSON.parse(savedLabels)
        if (parsed.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', parsed.primaryColor)
          document.documentElement.style.setProperty('--primary', parsed.primaryColor)
        }
      } catch (e) {
        console.error(e)
      }
    }

    const handleTextareaInput = (e) => {
      if (e.target.tagName.toLowerCase() === 'textarea') {
        e.target.style.height = 'auto'
        e.target.style.height = e.target.scrollHeight + 'px'
      }
    }
    document.addEventListener('input', handleTextareaInput)

    const intervalId = setInterval(() => {
      if (user) fetchTeams(false)
    }, 5000)

    return () => {
      document.removeEventListener('input', handleTextareaInput)
      clearInterval(intervalId)
    }
  }, [user])

  async function fetchAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name')
      
      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  async function fetchEventSettings() {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .single()
      
      if (data) {
        setEventSettings(data)
        localStorage.setItem('gincana_event_settings', JSON.stringify(data))
        document.title = data.name || 'Gincana MT'
      }
    } catch (error) {
      console.error('Erro ao buscar configurações do evento:', error)
    }
  }

  async function fetchTeams(showLoading = true) {
    if (!supabase) {
      if (showLoading) setDataLoading(false)
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
      if (showLoading) setDataLoading(false)
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

  async function addTeam(name, color, imageFile, members = [], icon = 'fa-users') {
    if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      showAlert('Já existe uma equipe com este nome!')
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
      icon,
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

  async function updateTeam(id, name, color, imageFile, members = [], leaderId, icon) {
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
        .update({ name, color, image_url: imageUrl, members, leader_id: leaderId, icon })
        .eq('id', id)
        .select('*, profiles!teams_leader_id_fkey(name)')
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
    showConfirm('Deseja realmente excluir esta equipe? Todos os pontos serão perdidos.', async () => {
      try {
        await supabase.from('teams').delete().eq('id', id)
        const newTeams = teams.filter(t => t.id !== id)
        setTeams(newTeams)
        showToast('Equipe removida.', 'primary')
      } catch (error) {
        console.log('Erro ao remover')
      }
    })
  }

  async function updateTeamStatus(id, newStatus) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ status: newStatus })
        .eq('id', id)
        .select('*, profiles!teams_leader_id_fkey(name)')
        .single()
      
      if (error) throw error
      
      setTeams(prev => prev.map(t => t.id === id ? data : t))
      showToast(`Status da equipe atualizado para ${newStatus === 'blocked' ? 'Bloqueado' : 'Aprovado'}.`, 'success')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showToast('Erro ao atualizar status da equipe', 'error')
    }
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
    showConfirm('Deseja realmente excluir este desafio?', async () => {
      try {
        await supabase.from('challenges').delete().eq('id', id)
        setChallenges(prev => prev.filter(c => c.id !== id))
        showToast('Desafio removido.', 'primary')
      } catch (error) {
        console.log('Erro ao remover')
      }
    })
  }

  async function addPoints(payload) {
    const { winners, participants, points, desc, isConsolationMode, consolationPoints } = payload

    try {
      const updatedTeams = [...teams]

      for (const team of updatedTeams) {
        let appliedPoints = 0
        let appliedDesc = desc

        if (participants.includes(team.id)) {
          if (winners.includes(team.id)) {
            appliedPoints = points
          } else if (isConsolationMode) {
            appliedPoints = consolationPoints
            appliedDesc = `${desc} (Participação)`
          } else {
            // For custom and penalty activities, participating is enough to receive the points
            appliedPoints = points
          }
        }

        if (appliedPoints !== 0) {
          team.score += appliedPoints
          team.history = [...(team.history || []), { 
            id: Date.now() + Math.random().toString(),
            points: appliedPoints, 
            desc: appliedDesc, 
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            author: profile?.name || 'Desconhecido'
          }]
          
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
            showAlert={showAlert}
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
          {eventSettings?.logo_url ? (
            <img src={eventSettings.logo_url} alt="Logo" style={{ maxWidth: '7.5rem', marginBottom: '1rem' }} />
          ) : (
            <div className="landing-icon" style={{ color: '#fff' }}><i className={`fas ${eventSettings?.icon || 'fa-leaf'}`}></i></div>
          )}
          <h1 className="landing-title" style={{ color: '#fff' }}>Perfil ainda não criado</h1>
          <div style={{ fontSize: '3rem', color: '#ff4d4d', marginBottom: '1rem' }}>
            <i className="fas fa-user-slash"></i>
          </div>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>Seu perfil ainda não foi criado ou está em processamento. (ou outra causa)</p>
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
          {eventSettings?.logo_url ? (
            <img src={eventSettings.logo_url} alt="Logo" style={{ maxWidth: '7.5rem', marginBottom: '1rem' }} />
          ) : (
            <div className="landing-icon" style={{ color: '#fff' }}><i className={`fas ${eventSettings?.icon || 'fa-leaf'}`}></i></div>
          )}
          <h1 className="landing-title" style={{ color: '#fff' }}>Conta em Análise</h1>
          <div style={{ fontSize: '3rem', color: '#f1c40f', marginBottom: '1rem' }}>
            <i className="fas fa-clock"></i>
          </div>
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
          {eventSettings?.logo_url ? (
            <img src={eventSettings.logo_url} alt="Logo" style={{ maxWidth: '7.5rem', marginBottom: '1rem' }} />
          ) : (
            <div className="landing-icon" style={{ color: '#fff' }}><i className={`fas ${eventSettings?.icon || 'fa-leaf'}`}></i></div>
          )}
          <h1 className="landing-title" style={{ color: '#fff' }}>Acesso Bloqueado</h1>
          <div style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '1rem' }}>
            <i className="fas fa-ban"></i>
          </div>
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
        eventSettings={eventSettings}
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
              teams={approvedTeams} 
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
              onUpdateTeam={(updatedTeam) => {
                setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t))
              }}
              onBlockTeam={(teamId) => updateTeamStatus(teamId, 'blocked')}
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
              showAlert={showAlert}
            />
          )}
          {currentSection === 'users' && <Users showAlert={showAlert} showConfirm={showConfirm} />}
          {currentSection === 'settings' && <Settings showAlert={showAlert} />}
          {currentSection === 'approvals' && <Approvals showAlert={showAlert} />}
          {currentSection === 'flightPlan' && <FlightPlan teams={approvedTeams} challenges={challenges} eventSettings={eventSettings} />}
        </div>
      </main>

      {teamModalOpen && (
        <TeamModal
          team={teamEdit}
          users={allUsers}
          currentUserProfile={profile}
          eventSettings={eventSettings}
          onClose={() => {
            setTeamModalOpen(false)
            setTeamEdit(null)
          }}
          onSave={(name, color, imageFile, members, leaderId, icon) => {
            if (teamEdit) {
              updateTeam(teamEdit.id, name, color, imageFile, members, leaderId, icon)
            } else {
              addTeam(name, color, imageFile, members, icon)
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
          showAlert={showAlert}
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
          showAlert={showAlert}
        />
      )}

      {user && profile?.role !== 'student' && (
        <button className="fab-button" onClick={() => openPointsModal()} title="Atribuir Pontos">
          <i className="fas fa-plus"></i>
          <span className="fab-label">Atribuir Pontos</span>
        </button>
      )}

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>

      <PopupModal 
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        onConfirm={popup.onConfirm}
        onCancel={popup.onCancel}
        type={popup.type}
      />
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