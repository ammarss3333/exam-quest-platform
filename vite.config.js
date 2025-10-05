import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  base: '/exam-quest-platform/',
    define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': `''${process.env.VITE_FIREBASE_API_KEY}'`,
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': `''${process.env.VITE_FIREBASE_AUTH_DOMAIN}'`,
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': `''${process.env.VITE_FIREBASE_PROJECT_ID}'`,
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': `''${process.env.VITE_FIREBASE_STORAGE_BUCKET}'`,
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': `''${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}'`,
    'import.meta.env.VITE_FIREBASE_APP_ID': `''${process.env.VITE_FIREBASE_APP_ID}'`,
  },
})
