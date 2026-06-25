import { defineConfig } from 'vite'

export default defineConfig({
  root: 'deploy',
  server: {
    port: 5173,
    host: true
  }
})
