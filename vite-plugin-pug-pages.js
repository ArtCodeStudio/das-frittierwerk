import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import pug from 'pug';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load YAML file from content dir. Returns empty object if file missing.
 * @param {string} contentDir
 * @param {string} name
 * @returns {Record<string, unknown>}
 */
function loadYaml(contentDir, name) {
  const filePath = join(contentDir, name);
  if (!existsSync(filePath)) return {};
  return yaml.load(readFileSync(filePath, 'utf8')) || {};
}

/**
 * Load Markdown file with YAML frontmatter. Returns { title, html } for Pug.
 * @param {string} contentDir
 * @param {string} name
 * @returns {{ title: string, html: string }}
 */
function loadMarkdown(contentDir, name) {
  const filePath = join(contentDir, name);
  if (!existsSync(filePath)) return { title: '', html: '' };
  const raw = readFileSync(filePath, 'utf8');
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
 * @param {number|string} price
 * @returns {string}
 */
function formatPrice(price) {
  if (typeof price === 'string') return price;
  if (Number.isInteger(price)) return String(price);
  return Number(price).toFixed(2).replace('.', ',');
}

/**
 * Derive a URL-safe section id from a title (e.g. "Über uns" -> "ueber-uns").
 * @param {string} text
 * @returns {string}
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

/** Load all content and build Pug locals. */
function loadLocals(contentDir) {
  const contentFiles = {
    yaml: ['site', 'contact', 'menu', 'gallery'],
    markdown: ['about', 'quality', 'impressum', 'datenschutz'],
  };

  const locals = {};

  for (const name of contentFiles.yaml) {
    locals[name] = loadYaml(contentDir, `${name}.yml`);
  }

  for (const name of contentFiles.markdown) {
    locals[name] = loadMarkdown(contentDir, `${name}.md`);
  }

  return {
    ...locals,
    formatPrice,
    slugify,
    logoBase: 'assets/dasfrittierwerk_logo-animation.avif',
    logoGear: 'assets/dasfrittierwerk_logo-animation2.avif',
  };
}

/**
 * Discover all .pug files in pagesDir.
 * @param {string} pagesDir
 * @returns {Record<string, string>} baseName -> absolute path
 */
function discoverPages(pagesDir) {
  if (!existsSync(pagesDir)) return {};
  const entries = readdirSync(pagesDir, { withFileTypes: true });
  const pages = {};
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.pug')) {
      const baseName = entry.name.replace(/\.pug$/, '');
      pages[baseName] = join(pagesDir, entry.name);
    }
  }
  return pages;
}

/**
 * Compile all page templates and write HTML to compiledDir.
 * @returns {Record<string, string>} rollupOptions.input entries
 */
function compilePages(options) {
  const { pagesDir, basedir, contentDir, compiledDir, root } = options;
  const pages = discoverPages(pagesDir);
  const locals = {
    ...loadLocals(contentDir),
    basePath: compiledDir === root ? '.' : '..',
  };

  mkdirSync(compiledDir, { recursive: true });

  const input = {};
  for (const [baseName, pugPath] of Object.entries(pages)) {
    const compileFn = pug.compileFile(pugPath, {
      basedir,
      filename: pugPath,
      doctype: 'html',
    });
    const html = compileFn(locals);
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
 * - Writes compiled HTML to compiledDir (default: src root)
 * - Injects rollupOptions.input so Vite builds each page
 */
export function pugPagesPlugin(pluginOptions = {}) {
  let resolvedConfig;
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
      const compiledDir = pluginOptions.compiledDir ?? root;

      options = { pagesDir, basedir, contentDir, compiledDir, root };

      const input = compilePages(options);
      if (Object.keys(input).length === 0) {
        return {};
      }
      return {
        build: {
          rollupOptions: { input },
        },
      };
    },

    configResolved(config) {
      resolvedConfig = config;
    },

    configureServer(server) {
      const { pagesDir, contentDir, basedir } = options;
      const watchPaths = [
        pagesDir,
        contentDir,
        resolve(basedir, 'layouts'),
        resolve(basedir, 'partials'),
      ];

      const recompile = () => {
        try {
          compilePages(options);
          server.ws.send({ type: 'full-reload', path: '*' });
        } catch (err) {
          console.error('[vite-plugin-pug-pages]', err);
        }
      };

      for (const watchPath of watchPaths) {
        if (existsSync(watchPath)) {
          server.watcher.add(watchPath);
        }
      }

      server.watcher.on('change', (changedPath) => {
        if (watchPaths.some((dir) => changedPath.startsWith(dir))) {
          recompile();
        }
      });
    },
  };
}
