
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env to avoid "process is not defined" in browser
    'process.env': {
      API_KEY: process.env.API_KEY || ''
    }
  }
});
