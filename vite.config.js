import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const repo = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

// Plugin: after build, inject hashed asset paths into sw.js
function injectSWAssets() {
  return {
    name: 'inject-sw-assets',
    enforce: 'post',
    closeBundle() {
      const distDir  = resolve('dist');
      const swPath   = resolve(distDir, 'sw.js');
      let swContent;
      try { swContent = readFileSync(swPath, 'utf8'); }
      catch { return; }

      let assetFiles = [];
      try {
        assetFiles = readdirSync(resolve(distDir, 'assets'))
          .map(f => `  './assets/${f}',`);
      } catch {}

      const injection = assetFiles.join('\n');
      const updated = swContent.replace(
        '// The build step appends the generated JS/CSS chunk names.',
        `// Auto-injected by vite.config.js:\n${injection}`
      );
      writeFileSync(swPath, updated);
    }
  };
}

export default defineConfig({
  plugins: [react(), injectSWAssets()],
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
