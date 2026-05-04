import './Sidebar.css'

export default function Sidebar({ isOpen, onClose, currentSection, onNavigate, userRole }) {
  const allNavItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', roles: ['admin', 'professor', 'supervisor', 'student'] },
    { id: 'teams', icon: 'fa-users', label: 'Equipes', roles: ['admin', 'professor', 'supervisor', 'student'] },
    { id: 'approvals', icon: 'fa-check-circle', label: 'Aprovações', roles: ['admin', 'professor'] },
    { id: 'challenges', icon: 'fa-trophy', label: 'Desafios', roles: ['admin', 'professor', 'supervisor', 'student'] },
    { id: 'scoreboard', icon: 'fa-list-ol', label: 'Placar Geral', roles: ['admin', 'professor', 'supervisor', 'student'] },
    { id: 'users', icon: 'fa-user-cog', label: 'Usuários', roles: ['admin'] },
    { id: 'settings', icon: 'fa-cog', label: 'Configurações', roles: ['admin'] }
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
            <i className="fas fa-leaf"></i>
          </div>
          <h2>Gincana MT</h2>
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

        <div className="sidebar-footer">
          <p><small>Tema: Menos Telas, Mais Vida</small></p>
        </div>
      </aside>
    </>
  )
}