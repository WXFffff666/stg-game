import './styles/main.css';
import './styles/season-pass.css';
import { startLoadingScreen } from './loading';
import { bootstrapEngine } from './engine/bootstrap';
import { initSeasonPass } from './features/season-pass';

// Legacy modules — config MUST be first (sets window.GAME_CONFIG)
import './legacy/config.js';
import './legacy/codex.js';
import './legacy/faction-effects.js';
import './legacy/faction-talents.js';
import './legacy/faction-weapon-mods.js';
import './legacy/homing.js';
import './legacy/upgrade-track.js';
import './legacy/core.js';
import './legacy/storage.js';
import './legacy/audio.js';
import './legacy/particles.js';
import './legacy/player.js';
import './legacy/bullets.js';
import './legacy/weapons.js';
import './legacy/enemies.js';
import './legacy/items.js';
import './legacy/skills.js';
import './legacy/ui.js';
import './legacy/main.js';

// PWA manifest (avoid Vite hashing the link in index.html)
{
  const href = './manifest.json';
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = href;
    document.head.appendChild(link);
  }
}

window.addEventListener('error', (event) => {
  console.error('[STG] Uncaught error:', event.error ?? event.message);
  const err = document.getElementById('error-screen');
  const loading = document.getElementById('loading-screen');
  if (loading) loading.style.display = 'none';
  if (err) err.style.display = 'flex';
});

startLoadingScreen();
bootstrapEngine();
initSeasonPass();

// Status panel close
document.getElementById('btn-close-status')?.addEventListener('click', () => {
  const ui = (window as StgWindow).ui;
  ui?.closeStatusPanel?.();
});

interface StgWindow extends Window {
  ui?: { closeStatusPanel?: () => void };
}

declare const window: StgWindow;
