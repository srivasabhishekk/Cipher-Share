import { apiClient } from './client'
import type { DecryptResponse, EncryptRequest, EncryptResponse } from '../types/api'

// POST /secure/encrypt — optional auth (login only unlocks "one day"/"one week").
// See API_ANALYSIS.md §7 for the full response matrix.
export function encryptText(input: EncryptRequest) {
  return apiClient.post<EncryptResponse>('/secure/encrypt', input)
}

// GET /secure/decrypt/:id — no auth. Deletes the document server-side if it was view-once.
export function decryptText(id: string) {
  return apiClient.get<DecryptResponse>(`/secure/decrypt/${encodeURIComponent(id)}`)
}

/**
 * The backend's `link` field points at its own origin
 * (`${BASE_URL}/secure/decrypt/<id>`), which is a raw JSON API URL, not
 * something meant to be opened in a browser. This pulls the id back out so
 * the frontend can build a proper viewer route on its own origin
 * (see ViewPage) — a frontend-only adaptation documented in API_ANALYSIS.md §9.
 */
export function extractIdFromBackendLink(link: string): string | null {
  const match = link.match(/\/secure\/decrypt\/([a-fA-F0-9]{24})/)
  return match ? match[1] : null
}
