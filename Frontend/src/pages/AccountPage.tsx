import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export function AccountPage() {
  const { user, displayName, isLoggedIn, isCheckingSession, logout } = useAuth()
  const { push } = useToast()

  if (isCheckingSession) {
    return (
      <div className="page">
        <div className="container auth-page">
          <p>Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />
  }

  return (
    <div className="page">
      <div className="container auth-page">
        <div className="auth-page__head">
          <span className="eyebrow">● Signed in</span>
          <h1>Hey, {displayName}</h1>
        </div>

        <div className="card account-card">
          <dl className="account-details">
            <div>
              <dt>Username</dt>
              <dd className="mono">{displayName}</dd>
            </div>
            {user?.email && (
              <div>
                <dt>Email</dt>
                <dd className="mono">{user.email}</dd>
              </div>
            )}
          </dl>
          <p className="hint">
            The backend doesn't expose a "my shared links" list — links you create aren't tied to your account
            in any way once generated. Check "Recent links on this device" on the home page for links you made
            in this browser.
          </p>
          <hr className="divider" />
          <div className="account-actions">
            <Link className="btn btn-secondary" to="/reset-password">
              Change password
            </Link>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await logout()
                push('Logged out.', 'info')
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
