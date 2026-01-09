
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // This ensures process.env.API_KEY is available in the browser
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env': JSON.stringify(process.env || {}),
  },
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['lucide-react', '@google/genai']
        }
      }
    }
  }
});
