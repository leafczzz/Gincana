import { useState } from 'react'
import './Header.css'

export default function Header({ title, desc, onMenuClick, onQuickPoints, user, profile, onLogin, onLogout, onProfile, onPasswordChange }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      professor: 'Professor',
      student: 'Aluno',
      supervisor: 'Supervisor'
    }
    return labels[role] || role
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="welcome-text">
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="header-actions">
        {user ? (
          <div className="user-menu" style={{ position: 'relative' }}>
              <div className="user-info hide-mobile">
                <span className="user-name">{profile?.name ? profile.name.split(' ')[0] : ''}</span>
                <span className="user-role">{getRoleLabel(profile?.role)}</span>
              </div>
              <button
                className="user-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {getInitials(profile?.name)}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => { setShowDropdown(false); onProfile && onProfile(); }}>
                    <i className="fas fa-user"></i>
                    Meu Perfil
                  </div>
                  <div className="dropdown-item" onClick={() => { setShowDropdown(false); onPasswordChange && onPasswordChange(); }}>
                    <i className="fas fa-key"></i>
                    Alterar Senha
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => { setShowDropdown(false); onLogout() }} style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', font: 'inherit' }}>
                    <i className="fas fa-sign-out-alt"></i>
                    Sair
                  </button>
                </div>
              )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onLogin}>
            <i className="fas fa-sign-in-alt"></i> <span className="hide-mobile">Entrar</span>
          </button>
        )}
      </div>
    </header>
  )
}