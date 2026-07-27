import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast refresh untuk development
      fastRefresh: true
    })
  ],
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Allow koneksi dari network
    // Hot Module Replacement (HMR) yang lebih baik
    hmr: {
      overlay: true,
      // Gunakan port yang berbeda untuk HMR untuk menghindari blocking
      port: 24678,
      // Protocol handling untuk WebSocket
      protocol: 'ws',
      // Host untuk HMR connection
      host: 'localhost'
    },
    // File watcher yang lebih efisien
    watch: {
      // Ignor folder yang tidak perlu diwatch
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**'
      ],
      // Fallback ke polling jika file watcher gagal
      usePolling: true,
      interval: 1000,
      useFsEvents: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  // Optimize dependencies untuk pre-bundling yang lebih baik
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Force rebuild saat ada perubahan dependencies
    force: false
  },
  // Build configuration
  build: {
    // No source maps in production builds (don't ship source to prod)
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500
  }
})
