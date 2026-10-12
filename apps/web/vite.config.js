// Configuration Vite — responsable : HIRWA Jean Baptiste (socle frontend).
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react()],
    // `npm run dev:web:mocks` (mode « mocks ») : données fictives, aucun backend requis.
    define:
      mode === 'mocks' ? { 'import.meta.env.VITE_USE_MOCKS': JSON.stringify('true') } : {},
    server: {
      // En développement, /api est relayé vers le backend : le frontend et l'API
      // partagent la même origine (pas de CORS, visionneuse PDF autorisée par helmet).
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
