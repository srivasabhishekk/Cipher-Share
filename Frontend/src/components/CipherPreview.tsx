import { useEffect, useState } from 'react'
import './CipherPreview.css'

const GLYPHS = '0123456789abcdef'

function scramble(source: string): string {
  if (!source) return ''
  // Purely cosmetic — a hex-ish scramble that echoes the AES-GCM hex output
  // format the backend actually produces ("iv:ciphertext:authTag" in hex).
  // This is NOT the real ciphertext; it never leaves the browser.
  let out = ''
  for (let i = 0; i < Math.min(source.length * 2, 64); i++) {
    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    if (i % 8 === 7) out += ' '
  }
  return out.trim()
}

export function CipherPreview({ source }: { source: string }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (!source) {
      setDisplay('')
      return
    }
    setDisplay(scramble(source))
    const interval = window.setInterval(() => setDisplay(scramble(source)), 450)
    return () => window.clearInterval(interval)
  }, [source])

  if (!source) return null

  return (
    <div className="cipher-preview" aria-hidden="true">
      <span className="cipher-preview__dot" />
      <span className="cipher-preview__text mono">{display}</span>
    </div>
  )
}
