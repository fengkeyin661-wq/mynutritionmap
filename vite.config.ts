import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the string value
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Polyfill process.env for other libraries
      'process.env': {},
      // Polyfill global process to prevent "process is not defined" crashes
      'process': { env: {} }
    }
  };
});