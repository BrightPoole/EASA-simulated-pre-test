import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'lucide-react'],
          'genai': ['@google/genai']
        }
      }
    }
  }
});