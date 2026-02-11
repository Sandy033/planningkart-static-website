import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed to root for custom domain planningkart.com
  server: {
    proxy: {
      '/api': {
        target: 'https://api.planningkart.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
