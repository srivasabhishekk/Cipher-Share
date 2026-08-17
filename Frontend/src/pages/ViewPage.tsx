import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { decryptText } from '../api/secure'
import { isApiError } from '../context/AuthContext'
import { Spinner } from '../components/Spinner'
import './ViewPage.css'

type ViewState =
  | { status: 'loading' }
  | { status: 'success'; text: string }
  | { status: 'error'; code: 400 | 404 | 410 | 500 | 0; message: string }

export function ViewPage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<ViewState>({ status: 'loading' })
  // StrictMode/dev double-invoke guard: a view-once link must only ever be
  // requested once from this component, since a second GET is indistinguishable
  // from a stranger reopening it (the backend has already deleted the record).
  const requested = useRef(false)

  useEffect(() => {
    if (!id || requested.current) return
    requested.current = true

    decryptText(id)
      .then((res) => setState({ status: 'success', text: res.text }))
      .catch((err) => {
        if (isApiError(err)) {
          const code = err.status as 400 | 404 | 410 | 500 | 0
          setState({ status: 'error', code, message: err.message })
        } else {
          setState({ status: 'error', code: 0, message: 'Something went wrong loading this link.' })
        }
      })
  }, [id])

  return (
    <div className="page">
      <div className="container view-page">
        {state.status === 'loading' && (
          <div className="card view-card view-card--loading">
            <Spinner />
            <p>Decrypting…</p>
          </div>
        )}

        {state.status === 'success' && <DecryptedCard text={state.text} />}

        {state.status === 'error' && <ErrorCard code={state.code} message={state.message} />}
      </div>
    </div>
  )
}

function DecryptedCard({ text }: { text: string }) {
  return (
    <div className="card view-card">
      <span className="badge badge-signal">Decrypted</span>
      <h1 className="view-card__title">Here's the message</h1>
      <pre className="view-card__text mono">{text}</pre>
      <p className="hint view-card__warning">
        If this was a view-once link, it's already gone — reloading this page or opening the link again
        will show "not found," even for you.
      </p>
    </div>
  )
}

function ErrorCard({ code, message }: { code: 400 | 404 | 410 | 500 | 0; message: string }) {
  const copy = describeError(code)
  return (
    <div className="card view-card">
      <span className="badge">{copy.badge}</span>
      <h1 className="view-card__title">{copy.title}</h1>
      <p>{message}</p>
      <Link className="btn btn-secondary" to="/">
        Go encrypt a message instead
      </Link>
    </div>
  )
}

function describeError(code: 400 | 404 | 410 | 500 | 0) {
  switch (code) {
    case 400:
      return { badge: 'Invalid link', title: "That link isn't formatted correctly" }
    case 404:
      return { badge: 'Not found', title: 'This link has already been used or never existed' }
    case 410:
      return { badge: 'Expired', title: 'This link has expired' }
    case 0:
      return { badge: 'Offline', title: "Couldn't reach the server" }
    default:
      return { badge: 'Error', title: 'Something went wrong' }
  }
}
