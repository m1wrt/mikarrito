// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // o tu framework

export default defineConfig({
  plugins: [react()],
  base: '/mikarrito/', // <--- AGREGA ESTO
})
