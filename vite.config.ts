
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '')

  // 使用用户提供的 API KEY，如果环境变量中没有，则使用默认值
  const apiKey = env.DASHSCOPE_API_KEY || 'sk-b483f550136540de829f0ac86d6efca2';

  return {
    plugins: [react()],
    define: {
      // Inject the Alibaba Cloud API Key
      'process.env.DASHSCOPE_API_KEY': JSON.stringify(apiKey),
      // Define NODE_ENV to prevent issues with libraries that check it
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Polyfill process.env to prevent crashes in libraries accessing it
      'process.env': {}
    }
  }
})