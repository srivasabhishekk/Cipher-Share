import { useState } from 'react'

export function CopyButton({ value, label = 'Copy link' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable — the input is still selectable/copyable by hand.
    }
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={handleCopy}>
      {copied ? 'Copied ✓' : label}
    </button>
  )
}
