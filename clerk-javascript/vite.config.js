import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/api/user': {
          target: 'http://localhost:5001',
          changeOrigin: true
        },
        '/api/assessment': {
          target: 'http://localhost:5002',
          changeOrigin: true
        },
        '/api/progress': {
          target: 'http://localhost:5003',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: './',
    define: {
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
    }
  }
})
