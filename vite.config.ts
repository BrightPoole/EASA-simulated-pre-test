import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Inject the API key into the browser-side process object
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Ensure 'process' is available as a global object if any library checks for it
    'process.env': {}
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