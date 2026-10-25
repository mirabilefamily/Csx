import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrClientPort = env.HMR_CLIENT_PORT ? Number(env.HMR_CLIENT_PORT) : undefined

  return {
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
      hmr: hmrClientPort ? { clientPort: hmrClientPort } : undefined,
    },
    preview: { host: '0.0.0.0', port: 3000, allowedHosts: true },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-alert-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@dnd-kit/core', '@dnd-kit/sortable', 'react-day-picker', 'date-fns'],
          },
        },
      },
    },
  }
})
