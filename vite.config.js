import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function inlineCssPlugin() {
  return {
    name: 'inline-css-for-zero-render-blocking',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlAsset = bundle['index.html'];
      if (!htmlAsset || typeof htmlAsset.source !== 'string') return;

      let html = htmlAsset.source;
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && asset.type === 'asset') {
          const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkRe = new RegExp(`<link[^>]+href=["']/?${escaped}["'][^>]*>`, 'i');
          if (linkRe.test(html)) {
            html = html.replace(linkRe, `<style>${asset.source}</style>`);
            delete bundle[fileName];
          }
        }
      }
      htmlAsset.source = html;
    },
  };
}

if (process.argv.includes('build') || process.argv.includes('optimize')) {
  process.env.NODE_ENV = 'production';
}

export default defineConfig(() => ({
  plugins: [react(), inlineCssPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
}));
