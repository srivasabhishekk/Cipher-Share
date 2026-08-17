import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, isApiError } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import './AuthPages.css'

export function RegisterPage() {
  const { register } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // The backend only checks that all three fields are present — no
    // format/strength rules exist server-side (API_ANALYSIS.md §7). We only
    // enforce "not empty" here to match, rather than inventing rules the
    // backend doesn't have.
    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.')
      return
    }

    setSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password })
      push('Account created — you are now logged in.', 'success')
      navigate('/', { replace: true })
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
          <span className="eyebrow">● Free, no card required</span>
          <h1>Create an account</h1>
          <p>Unlocks one-day and one-week link expiries for the messages you send.</p>
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
              <span className="hint">Must be unique — the backend rejects duplicates.</span>
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="auth-page__foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
