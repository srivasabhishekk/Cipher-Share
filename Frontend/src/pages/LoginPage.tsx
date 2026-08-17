import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth, isApiError } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import './AuthPages.css'

export function LoginPage() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }

    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      push('Logged in successfully.', 'success')
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      // 404 "User not found!" and 401 "Invalid username or password" are the
      // real distinct backend responses — shown as-is, they're already clear.
      setError(isApiError(err) ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container auth-page">
        <div className="auth-page__head">
          <span className="eyebrow">● Welcome back</span>
          <h1>Log in</h1>
          <p>Unlocks one-day and one-week link expiries.</p>
        </div>

        <div className="card">
          {error && <Alert kind="error">{error}</Alert>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="auth-page__foot">
          New here? <Link to="/register">Create an account</Link> · Forgot your password?{' '}
          <Link to="/reset-password">Reset it</Link>
        </p>
      </div>
    </div>
  )
}
