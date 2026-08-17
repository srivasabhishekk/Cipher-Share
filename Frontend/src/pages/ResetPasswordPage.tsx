import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isApiError } from '../context/AuthContext'
import { resetPassword } from '../api/auth'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import './AuthPages.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!username.trim() || !currentPassword || !newPassword) {
      setError('All fields are required.')
      return
    }

    setSubmitting(true)
    try {
      // POST /auth/reset-password authenticates with the current password in
      // the body — it does not use the session cookie at all, and does not
      // log the user in afterwards (API_ANALYSIS.md §7).
      const res = await resetPassword({ username: username.trim(), password: currentPassword, newPassword })
      setSuccess(res.message)
      window.setTimeout(() => navigate('/login', { replace: true }), 1600)
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container auth-page">
        <div className="auth-page__head">
          <span className="eyebrow">● Account recovery</span>
          <h1>Reset your password</h1>
          <p>You'll need your current password to confirm it's really you.</p>
        </div>

        <div className="card">
          {error && <Alert kind="error">{error}</Alert>}
          {success && <Alert kind="success">{success}</Alert>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={submitting} />
            </div>
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <p className="auth-page__foot">
          Remembered it after all? <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
