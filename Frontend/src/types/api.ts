// Every shape here mirrors a real, captured backend response documented in
// API_ANALYSIS.md — nothing here is speculative.

export interface AuthUser {
  id: string
  username: string
  email: string
}

export interface AuthResponse {
  message: string
  user: AuthUser
}

export interface MessageResponse {
  message: string
}

export interface GetMeResponse {
  message: string // "Hello, <username>" | "Hello, Guest!"
}

export type ExpiryChoice = 'one hour' | 'one day' | 'one week'

export interface EncryptRequest {
  text: string
  viewOnce: boolean
  time?: ExpiryChoice
}

export interface EncryptResponse {
  message: string
  link: string
}

export interface DecryptResponse {
  message: string
  text: string
}

/** Normalized error shape used throughout the app for any non-2xx or network failure. */
export interface ApiError {
  status: number // 0 for network/parse failures that never reached the server
  message: string
}
