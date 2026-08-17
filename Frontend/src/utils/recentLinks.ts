// Frontend-only convenience feature. The backend's Data model has no owner
// field and no listing endpoint (API_ANALYSIS.md §6), so there is no real
// "your shares" account feature possible. This keeps a small, local-only
// record of links *this browser* created — never the plaintext or
// ciphertext — purely so a person doesn't lose a link they just generated.

export interface RecentLink {
  id: string
  url: string
  viewOnce: boolean
  expiryLabel: string
  createdAt: number
}

const KEY = 'ciphershare.recentLinks'
const MAX_ITEMS = 8

export function getRecentLinks(): RecentLink[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as RecentLink[]) : []
  } catch {
    return []
  }
}

export function addRecentLink(entry: RecentLink) {
  try {
    const current = getRecentLinks()
    const next = [entry, ...current].slice(0, MAX_ITEMS)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — silently skip.
  }
}

export function clearRecentLinks() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
