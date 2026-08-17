import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export function Navbar() {
  const { isLoggedIn, displayName, logout, isCheckingSession } = useAuth()

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="CipherShare home">
          <RotorMark />
          <span>CipherShare</span>
        </NavLink>

        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            New message
          </NavLink>
          {!isCheckingSession && isLoggedIn ? (
            <>
              <NavLink to="/account" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                {displayName}
              </NavLink>
              <button className="btn btn-ghost" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : !isCheckingSession ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary navbar__cta">
                Sign up
              </NavLink>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

function RotorMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="navbar__mark" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="var(--brass)" strokeWidth="2" />
      <circle cx="16" cy="16" r="3.2" fill="var(--brass)" />
      <path d="M16 3v6M16 23v6M3 16h6M23 16h6" stroke="var(--signal-soft)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
