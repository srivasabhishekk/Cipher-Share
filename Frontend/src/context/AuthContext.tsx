import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { ApiError, AuthUser } from '../types/api'

interface AuthContextValue {
  user: AuthUser | null
  /** True while the initial GET /auth/get-me session check is in flight. */
  isCheckingSession: boolean
  login: (input: { username: string; password: string }) => Promise<void>
  register: (input: { username: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  /** Locally-known username from a still-valid session but without full user details. See notes below. */
  sessionUsername: string | null
  /** True once we know (from register/login this tab, or get-me on load) that the cookie is valid. */
  isLoggedIn: boolean
  /** Best available name to show in the UI, from either full user data or the get-me greeting. */
  displayName: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'ciphershare.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })
  const [sessionUsername, setSessionUsername] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next)
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  // On load, ask the backend's only session-check endpoint whether the
  // cookie is still valid. GET /auth/get-me returns a greeting string, not a
  // structured user — see API_ANALYSIS.md §5/§9. We use it only to decide
  // "logged in vs not", and to recover a username if the tab was reloaded
  // and sessionStorage lost the fuller user object from a previous tab.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await authApi.getMe()
        if (cancelled) return
        const guest = res.message.includes('Guest')
        if (guest) {
          persist(null)
          setSessionUsername(null)
        } else {
          const match = res.message.match(/^Hello, (.+)$/)
          setSessionUsername(match ? match[1] : null)
        }
      } catch {
        if (!cancelled) {
          persist(null)
          setSessionUsername(null)
        }
      } finally {
        if (!cancelled) setIsCheckingSession(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (input: { username: string; password: string }) => {
      const res = await authApi.login(input)
      persist(res.user)
      setSessionUsername(res.user.username)
    },
    [persist],
  )

  const registerFn = useCallback(
    async (input: { username: string; email: string; password: string }) => {
      const res = await authApi.register(input)
      persist(res.user)
      setSessionUsername(res.user.username)
    },
    [persist],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Logout always returns 200 per the backend; a network failure here
      // still clears local state so the UI reflects "logged out" honestly.
    }
    persist(null)
    setSessionUsername(null)
  }, [persist])

  const isLoggedIn = user !== null || sessionUsername !== null
  const displayName = user?.username ?? sessionUsername

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isCheckingSession,
      login,
      register: registerFn,
      logout,
      sessionUsername,
      isLoggedIn,
      displayName,
    }),
    [user, isCheckingSession, login, registerFn, logout, sessionUsername, isLoggedIn, displayName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err
}
