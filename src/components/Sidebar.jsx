import './Sidebar.css'

export default function Sidebar({ isOpen, onClose, currentSection, onNavigate, userRole, eventSettings }) {
  const allNavItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', roles: ['admin', 'professor', 'supervisor'] },
    { id: 'flightPanel', icon: 'fa-gauge-high', label: 'Painel Dashboard', roles: ['admin', 'professor', 'supervisor'] },
    { id: 'teams', icon: 'fa-users', label: 'Equipes', roles: ['admin', 'professor', 'supervisor', 'student'] },
    { id: 'approvals', icon: 'fa-check-circle', label: 'Aprovações', roles: ['admin', 'professor'] },
    { id: 'challenges', icon: 'fa-trophy', label: eventSettings?.challenge_label_plural || 'Desafios', roles: ['admin', 'professor', 'supervisor'] },
    { id: 'users', icon: 'fa-user-cog', label: 'Usuários', roles: ['admin'] },
    { id: 'settings', icon: 'fa-cog', label: 'Configurações', roles: ['admin'] },
    { id: 'flightPlan', icon: 'fa-ticket-alt', label: 'Tickets', roles: ['admin', 'professor'] }
  ]

  const navItems = allNavItems.filter(item => item.roles.includes(userRole))

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            {eventSettings?.logo_url ? (
              <img src={eventSettings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            ) : (
              <i className={`fas ${eventSettings?.icon || 'fa-leaf'}`}></i>
            )}
          </div>
          <h2>{eventSettings?.name || 'Carregando...'}</h2>
        </div>

        <nav className="nav-menu">
          {navItems.map(item => (
            <li className="nav-item" key={item.id}>
              <button 
                className={`nav-link ${currentSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
              >
                <i className={`fas ${item.icon}`}></i> {item.label}
              </button>
            </li>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ textAlign: 'center' }}>
          <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/bd/logoiff.png`} alt="Logo IFF" style={{ maxWidth: '12rem', opacity: 0.8 }} />
        </div>
      </aside>
    </>
  )
}