import './styles/main.css';
import './styles/season-pass.css';
import { startLoadingScreen } from './loading';
import { bootstrapEngine } from './engine/bootstrap';
import { initSeasonPass } from './features/season-pass';

startLoadingScreen();

// Legacy modules (dependency order preserved)
import './legacy/codex.js';
import './legacy/faction-effects.js';
import './legacy/faction-talents.js';
import './legacy/faction-weapon-mods.js';
import './legacy/config.js';
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
