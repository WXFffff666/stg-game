/**
 * v2 migration verification — run before build/CI.
 * Usage: node tools/verify-migration.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const LEGACY_FILES = [
  'codex.js', 'faction-effects.js', 'faction-talents.js', 'faction-weapon-mods.js',
  'config.js', 'homing.js', 'upgrade-track.js', 'core.js', 'storage.js', 'audio.js',
  'particles.js', 'player.js', 'bullets.js', 'weapons.js', 'enemies.js', 'items.js',
  'skills.js', 'ui.js', 'main.js',
];

const REQUIRED_DOM_IDS = [
  'loading-screen', 'error-screen', 'game-container', 'game-canvas', 'hud', 'menu-screen',
  'btn-start', 'btn-season-pass', 'season-pass-screen', 'pause-overlay', 'game-over',
  'level-up', 'skill-choices', 'ui-overlay', 'version-info', 'tutorial-overlay',
  'countdown-overlay', 'in-run-shop', 'talent-screen', 'codex-screen', 'settings-screen',
];

let errors = 0;

function fail(msg) {
  console.error('FAIL:', msg);
  errors++;
}

function ok(msg) {
  console.log('OK:', msg);
}

// 1. Legacy modules present
for (const f of LEGACY_FILES) {
  const p = path.join(root, 'src/legacy', f);
  if (!fs.existsSync(p)) fail(`missing src/legacy/${f}`);
}
if (errors === 0) ok(`all ${LEGACY_FILES.length} legacy modules present`);

// 2. No duplicate js/ tree (v1 removed)
const oldJs = path.join(root, 'js');
if (fs.existsSync(oldJs)) {
  fail('obsolete js/ directory still exists — remove it (use src/legacy/ only)');
}

// 3. No root sw.js (vite-plugin-pwa generates dist/sw.js)
if (fs.existsSync(path.join(root, 'sw.js'))) {
  fail('obsolete root sw.js still exists');
}

// 4. main.ts imports all legacy modules
const mainTs = fs.readFileSync(path.join(root, 'src/main.ts'), 'utf8');
for (const f of LEGACY_FILES) {
  if (!mainTs.includes(`./legacy/${f}`)) {
    fail(`src/main.ts missing import for legacy/${f}`);
  }
}
if (!mainTs.includes('initSeasonPass')) fail('src/main.ts missing initSeasonPass');
if (!mainTs.includes('bootstrapEngine')) fail('src/main.ts missing bootstrapEngine');
ok('main.ts imports complete');

// 5. Season pass hook in legacy main
const legacyMain = fs.readFileSync(path.join(root, 'src/legacy/main.js'), 'utf8');
if (!legacyMain.includes('SeasonPassManager.onRunComplete')) {
  fail('src/legacy/main.js missing SeasonPassManager.onRunComplete hook');
} else {
  ok('season pass settlement hook present');
}

// 6. index.html DOM ids
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of REQUIRED_DOM_IDS) {
  if (!indexHtml.includes(`id="${id}"`)) {
    fail(`index.html missing #${id}`);
  }
}
if (!indexHtml.includes('src/main.ts')) fail('index.html missing Vite entry script');
ok('index.html required DOM ids present');

// 7. public assets
for (const f of ['manifest.json', 'icon.svg', '_headers']) {
  if (!fs.existsSync(path.join(root, 'public', f))) {
    fail(`missing public/${f}`);
  }
}
ok('public PWA assets present');

// 8. UIManager ui-overlay helper
const uiJs = fs.readFileSync(path.join(root, 'src/legacy/ui.js'), 'utf8');
if (!uiJs.includes('_getUiOverlay')) {
  fail('ui.js missing _getUiOverlay helper');
} else {
  ok('ui-overlay helper present');
}

console.log(errors ? `\n${errors} verification error(s)` : '\nMigration verification passed');
process.exit(errors ? 1 : 0);
