/**
 * Custom watch: rebuild on file change (no HMR).
 * Watches src/ and config, runs `vite build --mode development` after changes.
 * Uses only Node built-ins (no chokidar).
 */
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const DEBOUNCE_MS = 400;
let debounceTimer = null;
let buildProcess = null;

function runBuild() {
  if (buildProcess) {
    buildProcess.kill('SIGTERM');
    buildProcess = null;
  }
  const start = Date.now();
  console.log('[watch] Rebuilding...');
  buildProcess = spawn('npx', ['vite', 'build', '--mode', 'development'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  buildProcess.on('close', (code) => {
    buildProcess = null;
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    if (code === 0) {
      console.log(`[watch] Done in ${duration}s.`);
    } else {
      console.error(`[watch] Build exited with code ${code}.`);
    }
  });
}

function scheduleBuild() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    runBuild();
  }, DEBOUNCE_MS);
}

function watchDir(dir) {
  watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes('node_modules')) {
      console.log(`[watch] ${filename}`);
      scheduleBuild();
    }
  });
}

const srcDir = resolve(projectRoot, 'src');
const configPath = resolve(projectRoot, 'vite.config.js');

watchDir(srcDir);
watch(configPath, () => {
  console.log('[watch] vite.config.js');
  scheduleBuild();
});

console.log('[watch] Watching src/ and vite.config.js. Rebuild on change (no HMR).');
runBuild();
