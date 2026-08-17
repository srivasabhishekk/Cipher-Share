import type { ReactNode } from 'react'

export function Alert({ kind, children }: { kind: 'error' | 'success' | 'info'; children: ReactNode }) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{kind === 'error' ? '✕' : kind === 'success' ? '✓' : 'ⓘ'}</span>
      <span>{children}</span>
    </div>
  )
}
