/**
 * 引擎启动补丁：武器限流、可见性时间戳、自动画质
 */
import { applyBalancePatch } from './balance';
import { applyContentExtension } from './content-ext';
import { applyPerfExtension } from './perf-ext';

interface GameLike {
  lastTime: number;
  effectsQuality: string;
  lowPerfMode: boolean;
  playerBullets: unknown[];
}

interface WeaponManagerLike {
  _fireWeapon?: (slot: number, x: number, y: number, stats: unknown) => void;
  _firesThisFrame?: number;
}

export function bootstrapEngine(): void {
  applyBalancePatch();
  applyContentExtension();
  applyPerfExtension();
  patchVisibilityReset();
  patchWeaponMissileCap();
  patchAutoQuality();
}

function patchVisibilityReset(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const g = (window as StgWindow).game;
    if (g) g.lastTime = performance.now();
  });
}

function patchWeaponMissileCap(): void {
  const tryPatch = (): void => {
    const wm = (window as StgWindow).weaponManager as WeaponManagerLike | undefined;
    const cfg = (window as StgWindow).GAME_CONFIG;
    if (!wm || !wm._fireWeapon || wm._firesThisFrame !== undefined) return;

    const cap = (cfg?.BALANCE?.MISSILE_FIRES_PER_FRAME as number) || 4;
    const orig = wm._fireWeapon.bind(wm);
    wm._firesThisFrame = 0;

    const gameLoop = (window as StgWindow).game;
    if (gameLoop) {
      const origUpdate = (gameLoop as { _update?: (dt: number) => void })._update;
      if (origUpdate && !(gameLoop as { _missileCapPatched?: boolean })._missileCapPatched) {
        (gameLoop as { _missileCapPatched?: boolean })._missileCapPatched = true;
        (gameLoop as { _update: (dt: number) => void })._update = function (dt: number) {
          wm._firesThisFrame = 0;
          return origUpdate.call(this, dt);
        };
      }
    }

    wm._fireWeapon = function (slot, x, y, stats) {
      if ((wm._firesThisFrame ?? 0) >= cap) return;
      wm._firesThisFrame = (wm._firesThisFrame ?? 0) + 1;
      return orig(slot, x, y, stats);
    };
  };

  let attempts = 0;
  const id = window.setInterval(() => {
    tryPatch();
    attempts++;
    if (attempts > 80) window.clearInterval(id);
  }, 100);
}

function patchAutoQuality(): void {
  const g = (window as StgWindow).game;
  if (!g || !(window as StgWindow).eventBus) return;
  (window as StgWindow).eventBus!.on('lowPerfMode', (payload: { enabled?: boolean }) => {
    if (payload?.enabled && g.effectsQuality !== 'low') {
      g.effectsQuality = 'low';
      try {
        localStorage.setItem('stg_effects_quality', 'low');
      } catch {
        /* ignore */
      }
    }
  });
}

interface StgWindow extends Window {
  game?: GameLike & { _update?: (dt: number) => void; _missileCapPatched?: boolean };
  GAME_CONFIG?: { BALANCE?: Record<string, unknown> };
  weaponManager?: WeaponManagerLike;
  eventBus?: { on: (ev: string, fn: (p: { enabled?: boolean }) => void) => void };
}

declare const window: StgWindow;
