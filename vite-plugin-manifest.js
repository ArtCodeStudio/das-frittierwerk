import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadSiteYaml(root) {
  const sitePath = resolve(root, 'content', 'site.yml');
  return yaml.load(readFileSync(sitePath, 'utf8')) || {};
}

/**
 * Generates site.webmanifest at build time from src/content/site.yml and injects
 * title/description into index.html. Uses Vite base so paths work for both
 * subpath (e.g. GitHub Pages) and root deployment.
 */
export function manifestPlugin() {
  let config;
  return {
    name: 'manifest-from-site-yml',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml(html) {
      const site = loadSiteYaml(config.root);
      const title = site.title ?? 'Das Frittierwerk';
      const description = site.description ?? '';
      return html
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
          () => `<meta name="description" content="${escapeHtml(description)}">`
        );
    },
    generateBundle(_options, _bundle, isWrite) {
      if (!isWrite) return;
      const root = config.root;
      const base = config.base.endsWith('/') ? config.base : config.base + '/';
      const site = loadSiteYaml(root);

      const iconBase = base + 'assets/favicon/';
      const icons = [
        { src: iconBase + 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: iconBase + 'favicon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
        { src: iconBase + 'apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
        { src: iconBase + 'web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: iconBase + 'web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ];

      const manifest = {
        name: site.name ?? 'App',
        short_name: site.short_name ?? site.name ?? 'App',
        description: site.description ?? '',
        theme_color: site.theme_color ?? '#ffffff',
        background_color: site.background_color ?? '#ffffff',
        display: site.display ?? 'standalone',
        start_url: base,
        icons,
      };

      this.emitFile({
        type: 'asset',
        fileName: 'assets/favicon/site.webmanifest',
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}
