import type { ApiError } from '../types/api'

/**
 * All requests go to relative paths ("/auth/...", "/secure/...").
 * In dev, vite.config.ts proxies those to the real backend so the browser
 * treats them as same-origin (see README.md — the backend sets its session
 * cookie with no SameSite/Secure attributes, so same-origin is what makes
 * login actually work in a browser). In production, deploy the built
 * frontend behind the same reverse-proxy host as the backend, routing
 * /auth and /secure through to it, for the same reason.
 */
const BASE =  import.meta.env.VITE_BACKEND_ORIGIN ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch {
    const err: ApiError = {
      status: 0,
      message: 'Could not reach the server. Check your connection and try again.',
    }
    throw err
  }

  // The backend always responds with JSON (including on errors), per every
  // route captured in API_ANALYSIS.md.
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // A route returned a non-JSON or empty body — treat message as generic.
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`
    const err: ApiError = { status: res.status, message }
    throw err
  }

  return body as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
}
