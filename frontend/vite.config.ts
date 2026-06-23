import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'auth-config',
      configureServer(server) {
        server.middlewares.use('/api/auth-config', (_req, res) => {
          const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE } = process.env;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            domain: VITE_AUTH0_DOMAIN,
            clientId: VITE_AUTH0_CLIENT_ID,
            audience: VITE_AUTH0_AUDIENCE,
          }));
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5020',
        changeOrigin: true,
      },
    },
  },
})