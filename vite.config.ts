
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Properly inject the API key from environment variables into the code
      // This is required for @google/genai to work in the browser environment
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define NODE_ENV to prevent issues with libraries that check it
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Polyfill process.env to prevent crashes in libraries accessing it
      'process.env': {}
    }
  }
})
