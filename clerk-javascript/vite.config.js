import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext',
    },
    resolve: {
      alias: {
        '@': '/src', // Alias for the 'src' folder
      },
    },
    root: './clerk-javascript',
    base: '/',
    define: {
      // Stringify environment variables
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
      // Add any other environment variables you need here
    }
  }
}) 