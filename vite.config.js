import { defineConfig } from 'vite'
import dns from 'dns'
import { resolve } from 'path'
import yamPlugin from '@modyfi/vite-plugin-yaml';
import { plugin as mdPlugin } from 'vite-plugin-markdown';
import { manifestPlugin } from './vite-plugin-manifest.js';
import { pugPagesPlugin } from './vite-plugin-pug-pages.js';

const __dirname = new URL('.', import.meta.url).pathname;
dns.setDefaultResultOrder('verbatim')

export default defineConfig(({ command, mode, ssrBuild }) => {
  const basedir = resolve(__dirname, 'src');
  console.debug('vite.config.js', { command, mode, ssrBuild })
  // Relative base: one build works for both GitHub project URL (.../das-frittierwerk/) and custom domain (root)
  const base = process.env.VITE_BASE_PATH ?? './';
  return {
    mode,
    base,
    root: basedir,
    assetsInclude: ['**/*.svg'],
    build: {
      outDir: '../_site',
      emptyOutDir: true,
      // rollupOptions.input is auto-populated by pugPagesPlugin
    },
    plugins: [
      pugPagesPlugin({
        pagesDir: resolve(basedir, 'views/pages'),
        basedir: resolve(basedir, 'views'),
        contentDir: resolve(basedir, 'content'),
      }),
      yamPlugin(),
      mdPlugin({ mode: 'html' }),
      manifestPlugin(),
    ],
  }
})
