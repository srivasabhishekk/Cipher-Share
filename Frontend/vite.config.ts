import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Backend origin the dev proxy forwards /auth and /secure to.
  // Same-origin (via this proxy) means the backend's session cookie behaves
  // normally in the browser even though the backend itself sets no
  // SameSite/Secure/CORS attributes on it. See README.md "Why a dev proxy".
  const backendTarget = env.VITE_BACKEND_ORIGIN || 'http://localhost:3001'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': { target: backendTarget, changeOrigin: true },
        '/secure': { target: backendTarget, changeOrigin: true },
      },
    },
  }
})
