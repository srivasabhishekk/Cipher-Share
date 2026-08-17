import { apiClient } from './client'
import type { AuthResponse, GetMeResponse, MessageResponse } from '../types/api'

// POST /auth/register — 201 on success, 400 missing fields, 409 already registered.
export function register(input: { username: string; email: string; password: string }) {
  return apiClient.post<AuthResponse>('/auth/register', input)
}

// POST /auth/login — 200 on success, 400 missing fields, 404 no such user, 401 wrong password.
export function login(input: { username: string; password: string }) {
  return apiClient.post<AuthResponse>('/auth/login', input)
}

// GET /auth/logout — always 200, clears the session cookie server-side.
export function logout() {
  return apiClient.get<MessageResponse>('/auth/logout')
}

// GET /auth/get-me — 200 either way (a plain greeting string), 401 if the
// cookie is present but invalid/expired. This is the only session-check
// endpoint the backend exposes; it does not return a structured user object.
export function getMe() {
  return apiClient.get<GetMeResponse>('/auth/get-me')
}

// POST /auth/reset-password — 200 success, 400 unknown username, 401 wrong current password.
export function resetPassword(input: { username: string; password: string; newPassword: string }) {
  return apiClient.post<MessageResponse>('/auth/reset-password', input)
}
