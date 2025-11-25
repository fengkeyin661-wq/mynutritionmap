import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 代理配置：将 /qwen-api 开头的请求转发到阿里云 DashScope OpenAI 兼容接口
      '/qwen-api': {
        target: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qwen-api/, '')
      }
    }
  }
})