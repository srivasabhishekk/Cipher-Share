import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="card">
          <span className="eyebrow">● 404</span>
          <h1 style={{ fontSize: 24, margin: '10px 0' }}>Nothing here</h1>
          <p style={{ marginBottom: 18 }}>That page doesn't exist.</p>
          <Link className="btn btn-primary" to="/">
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
