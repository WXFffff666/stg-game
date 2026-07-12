/**
 * 内容扩展校验 — 武器 pattern、Boss 出战、功能钩子
 * Usage: node tools/verify-content-ext.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

let errors = 0;
function fail(msg) { console.error('FAIL:', msg); errors++; }
function ok(msg) { console.log('OK:', msg); }

const weaponsJs = fs.readFileSync(path.join(root, 'src/legacy/weapons.js'), 'utf8');
const patternCases = [...weaponsJs.matchAll(/case '([^']+)':/g)].map((m) => m[1]);
const patternSet = new Set(patternCases);

const massExt = fs.readFileSync(path.join(root, 'src/engine/mass-content-ext.ts'), 'utf8');
const manifest = massExt.match(/CONTENT_MANIFEST\s*=\s*\{([^}]+)\}/s);
if (!manifest) fail('CONTENT_MANIFEST not found');
else {
  const counts = Object.fromEntries([...manifest[1].matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], +m[2]]));
  for (const [k, min] of Object.entries({
    weapons: 20, passives: 20, actives: 20, conditionals: 20, factions: 20,
    regularEnemies: 20, midBosses: 10, waveBosses: 5, finalBosses: 3,
  })) {
    if ((counts[k] || 0) < min) fail(`CONTENT_MANIFEST.${k} = ${counts[k]} < ${min}`);
  }
  if (!errors) ok('CONTENT_MANIFEST thresholds met');
}

const wpMatch = massExt.match(/const WEAPON_PATTERNS = \[([\s\S]*?)\]/);
if (wpMatch) {
  const patterns = [...wpMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const p of patterns) {
    if (!patternSet.has(p)) fail(`weapon pattern "${p}" not in weapons.js`);
  }
  if (!errors) ok(`all ${patterns.length} weapon patterns valid`);
}

if (!massExt.includes('WAVE_BOSS_ROTATION')) fail('missing WAVE_BOSS_ROTATION');
if (!massExt.includes('FINAL_BOSS_WAVES')) fail('missing FINAL_BOSS_WAVES');
if (!massExt.includes('boss_final_')) fail('missing final boss ids');
if (!massExt.includes('boss_ext_')) fail('missing extended wave boss ids');
else ok('boss rotation + final boss config present');

const enemiesJs = fs.readFileSync(path.join(root, 'src/legacy/enemies.js'), 'utf8');
for (const needle of ['_spawnMidBoss', 'FINAL_BOSS_WAVES', 'WAVE_BOSS_ROTATION', 'burstFire']) {
  if (!enemiesJs.includes(needle)) fail(`enemies.js missing ${needle}`);
}
if (!errors) ok('enemies.js boss/mid-boss hooks present');

const mainJs = fs.readFileSync(path.join(root, 'src/legacy/main.js'), 'utf8');
for (const needle of ['toggleBackpack', '_openInRunShop', 'executeWeaponFusion']) {
  if (!mainJs.includes(needle)) fail(`main.js missing ${needle}`);
}
if (!mainJs.includes('postWave50HpScale')) fail('main.js missing postWave50 endless scaling');
if (!errors) ok('backpack/shop/fusion hooks + endless scaling present');

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!indexHtml.includes('in-run-shop')) fail('index.html missing in-run-shop');
const uiJs = fs.readFileSync(path.join(root, 'src/legacy/ui.js'), 'utf8');
const uiNeedles = ['toggleBackpack', 'checkFusions', 'codex'];
for (const needle of uiNeedles) {
  if (!uiJs.includes(needle)) fail(`ui.js missing ${needle}`);
}
if (!errors) ok('UI backpack/fusion/shop/codex present');

const bootstrap = fs.readFileSync(path.join(root, 'src/engine/bootstrap.ts'), 'utf8');
if (!bootstrap.includes('applyMassContentExtension')) fail('bootstrap missing mass content');
else ok('bootstrap applies mass content');

console.log(errors ? `\n${errors} content verification error(s)` : '\nContent extension verification passed');
process.exit(errors ? 1 : 0);
