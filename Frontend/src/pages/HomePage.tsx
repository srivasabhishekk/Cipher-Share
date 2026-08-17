import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isApiError } from '../context/AuthContext'
import { encryptText, extractIdFromBackendLink } from '../api/secure'
import type { ExpiryChoice } from '../types/api'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import { CopyButton } from '../components/CopyButton'
import { addRecentLink, getRecentLinks, clearRecentLinks, type RecentLink } from '../utils/recentLinks'
import { CipherPreview } from '../components/CipherPreview'
import './HomePage.css'

const EXPIRY_OPTIONS: { value: ExpiryChoice; label: string; needsLogin: boolean }[] = [
  { value: 'one hour', label: 'One hour', needsLogin: false },
  { value: 'one day', label: 'One day', needsLogin: true },
  { value: 'one week', label: 'One week', needsLogin: true },
]

export function HomePage() {
  const { isLoggedIn } = useAuth()
  const { push } = useToast()

  const [text, setText] = useState('')
  const [viewOnce, setViewOnce] = useState(true)
  const [expiry, setExpiry] = useState<ExpiryChoice>('one hour')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; viewOnce: boolean; expiryLabel: string } | null>(null)
  const [recent, setRecent] = useState<RecentLink[]>(() => getRecentLinks())

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (result && textareaRef.current) {
      // Nothing to focus back to — result panel takes over. Keeping this
      // effect as the natural place to scroll the result into view on mobile.
      document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!text.trim()) {
      setError('Write something to encrypt first.')
      return
    }

    setSubmitting(true)
    try {
      const res = await encryptText({
        text,
        viewOnce,
        time: viewOnce ? undefined : expiry,
      })

      const id = extractIdFromBackendLink(res.link)
      const url = id ? `${window.location.origin}/view/${id}` : res.link
      const expiryLabel = viewOnce ? 'View once' : EXPIRY_OPTIONS.find((o) => o.value === expiry)?.label ?? expiry

      setResult({ url, viewOnce, expiryLabel })
      setText('')

      if (id) {
        addRecentLink({ id, url, viewOnce, expiryLabel, createdAt: Date.now() })
        setRecent(getRecentLinks())
      }

      push(res.message, 'success')
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <span className="eyebrow">● Zero-knowledge, one link</span>
          <h1>Say it once. Then it's gone.</h1>
          <p className="hero__sub">
            Paste text, encrypt it with AES-256-GCM, and get a link that either self-destructs on first
            read or expires on a timer you choose. No account required.
          </p>
        </section>

        <div className="home-grid">
          <div className="card">
            {!result ? (
              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="text">Message</label>
                  <textarea
                    id="text"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type the text you want to share securely…"
                    aria-invalid={!!error}
                    disabled={submitting}
                  />
                  <CipherPreview source={text} />
                </div>

                <div className="field">
                  <label>When should it disappear?</label>
                  <div className="mode-toggle">
                    <button
                      type="button"
                      className={`mode-toggle__opt ${viewOnce ? 'is-active' : ''}`}
                      onClick={() => setViewOnce(true)}
                      disabled={submitting}
                    >
                      View once
                    </button>
                    <button
                      type="button"
                      className={`mode-toggle__opt ${!viewOnce ? 'is-active' : ''}`}
                      onClick={() => setViewOnce(false)}
                      disabled={submitting}
                    >
                      Timed
                    </button>
                  </div>
                  <p className="hint">
                    {viewOnce
                      ? 'The link stops working the instant it is opened — even by you.'
                      : 'The link keeps working until the timer runs out.'}
                  </p>
                </div>

                {!viewOnce && (
                  <div className="field">
                    <label htmlFor="expiry">Expires after</label>
                    <select id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value as ExpiryChoice)} disabled={submitting}>
                      {EXPIRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.needsLogin && !isLoggedIn}>
                          {opt.label}
                          {opt.needsLogin && !isLoggedIn ? ' — log in to unlock' : ''}
                        </option>
                      ))}
                    </select>
                    {!isLoggedIn && (
                      <p className="hint">
                        Without an account you're limited to a one-hour link. <a href="/register">Create a free account</a> to
                        unlock one-day and one-week links.
                      </p>
                    )}
                  </div>
                )}

                {error && <Alert kind="error">{error}</Alert>}

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? <Spinner /> : null}
                  {submitting ? 'Encrypting…' : 'Encrypt & get link'}
                </button>
              </form>
            ) : (
              <ResultPanel result={result} onReset={() => setResult(null)} />
            )}
          </div>

          <aside className="side-note">
            <h3>How this works</h3>
            <ul>
              <li>Your text is encrypted with AES-256-GCM before it ever touches the database.</li>
              <li>View-once links are deleted from the database the moment they're opened.</li>
              <li>Timed links disappear automatically once the timer runs out — no cleanup needed.</li>
              <li>Nobody, including CipherShare, can read a link's contents without visiting it while it's still live.</li>
            </ul>
          </aside>
        </div>

        {recent.length > 0 && (
          <RecentLinksList
            links={recent}
            onClear={() => {
              clearRecentLinks()
              setRecent([])
            }}
          />
        )}
      </div>
    </div>
  )
}

function ResultPanel({
  result,
  onReset,
}: {
  result: { url: string; viewOnce: boolean; expiryLabel: string }
  onReset: () => void
}) {
  return (
    <div id="result-panel" className="result-panel">
      <span className="badge badge-brass">Encrypted</span>
      <h3 className="result-panel__title">Your link is ready</h3>
      <p>Share it however you like. {result.viewOnce ? 'It will vanish the moment someone opens it.' : `It expires in: ${result.expiryLabel}.`}</p>
      <div className="result-panel__link">
        <input type="text" readOnly value={result.url} onFocus={(e) => e.currentTarget.select()} />
        <CopyButton value={result.url} />
      </div>
      <button className="btn btn-ghost" onClick={onReset}>
        ← Encrypt another message
      </button>
    </div>
  )
}

function RecentLinksList({ links, onClear }: { links: RecentLink[]; onClear: () => void }) {
  return (
    <section className="recent-links">
      <div className="recent-links__head">
        <h3>Recent links on this device</h3>
        <button className="btn btn-ghost" onClick={onClear}>
          Clear
        </button>
      </div>
      <p className="hint">
        Stored only in this browser's local storage — not linked to your account and not visible to anyone else.
      </p>
      <ul>
        {links.map((l) => (
          <li key={l.id + l.createdAt}>
            <span className="badge">{l.viewOnce ? 'View once' : l.expiryLabel}</span>
            <a href={l.url}>{l.url}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}
