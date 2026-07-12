/**
 * 性能补丁：飘字预算、子弹回收、移动端检测
 */
export function applyPerfExtension(): void {
  patchDamageNumberBudget();
  patchMobileDetect();
  patchBulletRecycle();
}

function patchMobileDetect(): void {
  const tryPatch = (): void => {
    const g = (window as StgWindow).game;
    if (!g) return;
    if (g._mobileDetectDone) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 1024;
    if (coarse || narrow) g.isMobile = true;
    g._mobileDetectDone = true;
  };
  let n = 0;
  const id = window.setInterval(() => {
    tryPatch();
    if (++n > 40) window.clearInterval(id);
  }, 100);
}

function patchDamageNumberBudget(): void {
  const tryPatch = (): void => {
    const ps = (window as StgWindow).ParticleSystem;
    if (!ps || ps._dmgBudgetPatched) return;
    const orig = ps.damageNumber.bind(ps);
    ps.damageNumber = function (
      x: number,
      y: number,
      value: number | string,
      color?: string,
      isCrit?: boolean,
      isReact?: boolean,
    ) {
      const g = (window as StgWindow).game;
      const cfg = (window as StgWindow).GAME_CONFIG?.BALANCE;
      const maxOnScreen = g?.isMobile
        ? (cfg?.MAX_DAMAGE_NUMBERS_MOBILE as number) || 28
        : (cfg?.MAX_DAMAGE_NUMBERS as number) || 45;
      const active = ps._countActiveDamageNumbers?.() ?? 0;
      if (active >= maxOnScreen) return;

      const cellKey = `${Math.floor(x / 48)},${Math.floor(y / 48)}`;
      const now = performance.now();
      const minGap = (cfg?.DAMAGE_NUMBER_CELL_MS as number) || 70;
      ps._dmgCellTimes = ps._dmgCellTimes || {};
      if (ps._dmgCellTimes[cellKey] && now - ps._dmgCellTimes[cellKey] < minGap) return;
      ps._dmgCellTimes[cellKey] = now;

      if (typeof value === 'number' && value < 2 && !isCrit && !isReact) return;

      orig(x, y, value, color, isCrit, isReact);
    };
    ps._dmgBudgetPatched = true;
  };
  let n = 0;
  const id = window.setInterval(() => {
    tryPatch();
    if (++n > 80) window.clearInterval(id);
  }, 100);
}

function patchBulletRecycle(): void {
  const tryPatch = (): void => {
    const g = (window as StgWindow).game as GameLike | undefined;
    if (!g || !g.addEntity || g._bulletRecyclePatched) return;
    const orig = g.addEntity.bind(g);
    g.addEntity = function (entity: { category?: string; active?: boolean }) {
      if (entity.category === 'playerBullet') {
        const lim = g.ENTITY_LIMITS?.bullets ?? 400;
        while (g.playerBullets.length >= lim && g.playerBullets.length > 0) {
          const old = g.playerBullets[0];
          if (!old) break;
          old.active = false;
          g.removeEntity(old);
        }
      }
      orig(entity);
    };
    g._bulletRecyclePatched = true;
  };
  let n = 0;
  const id = window.setInterval(() => {
    tryPatch();
    if (++n > 80) window.clearInterval(id);
  }, 100);
}

interface GameLike {
  addEntity: (entity: { category?: string; active?: boolean }) => void;
  removeEntity: (entity: { active?: boolean }) => void;
  playerBullets: Array<{ active?: boolean }>;
  ENTITY_LIMITS?: { bullets?: number };
  _bulletRecyclePatched?: boolean;
}

interface StgWindow extends Window {
  game?: { isMobile?: boolean; _mobileDetectDone?: boolean };
  GAME_CONFIG?: { BALANCE?: Record<string, unknown> };
  ParticleSystem?: {
    damageNumber: (x: number, y: number, value: number | string, color?: string, isCrit?: boolean, isReact?: boolean) => void;
    _dmgBudgetPatched?: boolean;
    _dmgCellTimes?: Record<string, number>;
    _countActiveDamageNumbers?: () => number;
  };
}

declare const window: StgWindow;
