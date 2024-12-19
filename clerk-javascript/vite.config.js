import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')  // This loads .env file from 'clerk-javascript/.env'

  return {
    plugins: [vue()],
    build: {
      outDir: 'dist',  // Output folder for the build files
      rollupOptions: {
        input: 'index.html',  // Since root is 'clerk-javascript', just use 'index.html'
      },
      assetsDir: 'assets',   // Folder for static assets
      target: 'esnext',      // Ensure modern JS
    },
    server: {
      port: 3000,  // Optional: Set your dev server port
    },
    resolve: {
      alias: {
        '@': '/src',  // Alias for the 'src' folder for easier imports
      },
    },
    root: 'clerk-javascript',  // The root folder for Vite (where index.html and src are located)
    base: '/',  // Adjust if your deployment is at a subpath
    define: {
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
      // Add any other environment variables you need here
    }
  }
})
