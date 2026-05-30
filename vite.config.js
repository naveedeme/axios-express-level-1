import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GITHUB_REPOSITORY is automatically set by GitHub Actions
// e.g. "naveedeme/axios-express-level-1" → base becomes "/axios-express-level-1/"
// Locally it is undefined, so base falls back to "/"
const repo = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

export default defineConfig({
  plugins: [react()],
  base: repo,
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
