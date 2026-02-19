import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import pug from 'pug';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load YAML file from content dir. Returns empty object if file missing.
 */
function loadYaml(contentDir, name) {
  const path = join(contentDir, name);
  if (!existsSync(path)) return {};
  return yaml.load(readFileSync(path, 'utf8')) || {};
}

/**
 * Load Markdown file with YAML frontmatter. Returns { title, html } for Pug.
 */
function loadMarkdown(contentDir, name) {
  const path = join(contentDir, name);
  if (!existsSync(path)) return { title: '', html: '' };
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const attributes = match ? yaml.load(match[1]) || {} : {};
  const body = match ? match[2] : raw;
  const html = marked.parse(body, { async: false });
  return {
    title: attributes.title ?? '',
    html: typeof html === 'string' ? html : '',
  };
}

/**
 * Format price for menu display (e.g. 4.5 -> "4,50", 9 -> "9").
 */
function formatPrice(price) {
  if (typeof price === 'string') return price;
  if (Number.isInteger(price)) return String(price);
  return Number(price).toFixed(2).replace('.', ',');
}

/**
 * Derive a URL-safe section id from a title (e.g. "Über uns" -> "ueber-uns").
 */
function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Load all content and build Pug locals.
 */
function loadLocals(contentDir) {
  const site = loadYaml(contentDir, 'site.yml');
  const contact = loadYaml(contentDir, 'contact.yml');
  const menu = loadYaml(contentDir, 'menu.yml');
  const gallery = loadYaml(contentDir, 'gallery.yml');
  const about = loadMarkdown(contentDir, 'about.md');
  const quality = loadMarkdown(contentDir, 'quality.md');
  const impressum = loadMarkdown(contentDir, 'impressum.md');
  const datenschutz = loadMarkdown(contentDir, 'datenschutz.md');

  return {
    site,
    contact,
    menu,
    gallery,
    about,
    quality,
    impressum,
    datenschutz,
    formatPrice,
    slugify,
    // Logo assets: files live in src/public/assets/ (copied to output by Vite); paths relative to site root
    logoBase: 'assets/dasfrittierwerk_logo-animation.avif',
    logoGear: 'assets/dasfrittierwerk_logo-animation2.avif',
  };
}

/**
 * Discover all .pug files in pagesDir. Returns map: baseName -> absolute path.
 */
function discoverPages(pagesDir) {
  if (!existsSync(pagesDir)) return {};
  const entries = readdirSync(pagesDir, { withFileTypes: true });
  const out = {};
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.pug')) {
      const baseName = e.name.replace(/\.pug$/, '');
      out[baseName] = join(pagesDir, e.name);
    }
  }
  return out;
}

/**
 * Compile all page templates and write HTML to compiledDir.
 * Returns object suitable for rollupOptions.input: { 'index': path, 'ueber-uns': path, ... }
 */
function compilePages(options) {
  const { pagesDir, basedir, contentDir, compiledDir, root } = options;
  const pages = discoverPages(pagesDir);
  const locals = {
    ...loadLocals(contentDir),
    basePath: compiledDir === root ? "." : "..",
  };

  mkdirSync(compiledDir, { recursive: true });

  const input = {};
  for (const [baseName, pugPath] of Object.entries(pages)) {
    const fn = pug.compileFile(pugPath, {
      basedir,
      filename: pugPath,
      doctype: 'html',
    });
    const html = fn(locals);
    const fileName = baseName === 'index' ? 'index.html' : `${baseName}.html`;
    const outPath = join(compiledDir, fileName);
    writeFileSync(outPath, html, 'utf8');
    input[baseName] = outPath;
  }
  return input;
}

/**
 * Vite plugin: compile Pug pages to HTML and register them as multi-page entries.
 * - Auto-discovers .pug files in pagesDir
 * - Loads content from contentDir (YAML + Markdown with frontmatter)
 * - Writes compiled HTML to compiledDir (default: src/.pug-compiled)
 * - Injects rollupOptions.input so Vite builds each page
 */
export function pugPagesPlugin(pluginOptions = {}) {
  let config;
  let options;

  return {
    name: 'vite-plugin-pug-pages',
    enforce: 'pre',

    config(config) {
      const projectRoot = resolve(__dirname, '..');
      const root = config.root ?? resolve(projectRoot, 'src');
      const pagesDir = pluginOptions.pagesDir ?? resolve(root, 'views', 'pages');
      const basedir = pluginOptions.basedir ?? resolve(root, 'views');
      const contentDir = pluginOptions.contentDir ?? resolve(root, 'content');
      // Write HTML into root so Vite emits index.html etc. at site root (not under .pug-compiled)
      const compiledDir = pluginOptions.compiledDir ?? root;

      options = { pagesDir, basedir, contentDir, compiledDir, root };

      const input = compilePages(options);
      if (Object.keys(input).length === 0) {
        return {};
      }
      return {
        build: {
          rollupOptions: {
            input,
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    configureServer(server) {
      const root = config.root;
      const { pagesDir, contentDir, basedir, compiledDir } = options;
      const watchPaths = [pagesDir, contentDir, resolve(basedir, 'layouts'), resolve(basedir, 'partials')];

      const recompile = () => {
        try {
          compilePages(options);
          server.ws.send({ type: 'full-reload', path: '*' });
        } catch (err) {
          console.error('[vite-plugin-pug-pages]', err);
        }
      };

      for (const p of watchPaths) {
        if (existsSync(p)) {
          server.watcher.add(p);
        }
      }
      server.watcher.on('change', (path) => {
        if (watchPaths.some((dir) => path.startsWith(dir))) {
          recompile();
        }
      });
    },
  };
}
