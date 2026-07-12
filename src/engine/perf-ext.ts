/**
 * 性能补丁：飘字预算、多武器开火错峰、移动端检测
 */
export function applyPerfExtension(): void {
  patchDamageNumberBudget();
  patchWeaponFireStagger();
  patchMobileDetect();
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

function patchWeaponFireStagger(): void {
  const tryPatch = (): void => {
    const wm = (window as StgWindow).weaponManager as WeaponMgr | undefined;
    if (!wm || !wm.update || wm._staggerPatched) return;
    const orig = wm.update.bind(wm);
    wm.update = function (dt: number, px: number, py: number, stats: unknown) {
      const slots = wm.weaponSlots || [];
      const activeCount = slots.filter((s) => s && s.weaponId).length;
      if (activeCount <= 10) return orig(dt, px, py, stats);
      const phase = ((window as StgWindow).game?._weaponStaggerFrame ?? 0) % 2;
      (window as StgWindow).game!._weaponStaggerFrame = phase + 1;
      const saved: Array<{ weaponId: string } | null | undefined> = [];
      for (let i = 0; i < slots.length; i++) {
        if (i % 2 !== phase && slots[i]) {
          saved[i] = slots[i];
          slots[i] = null;
        }
      }
      orig(dt, px, py, stats);
      for (let j = 0; j < saved.length; j++) {
        if (saved[j]) slots[j] = saved[j]!;
      }
    };
    wm._staggerPatched = true;
  };
  let n = 0;
  const id = window.setInterval(() => {
    tryPatch();
    if (++n > 80) window.clearInterval(id);
  }, 100);
}

interface WeaponMgr {
  update?: (dt: number, px: number, py: number, stats: unknown) => void;
  weaponSlots?: Array<{ weaponId: string } | null>;
  _staggerPatched?: boolean;
}

interface StgWindow extends Window {
  game?: { isMobile?: boolean; _mobileDetectDone?: boolean; _weaponStaggerFrame?: number };
  GAME_CONFIG?: { BALANCE?: Record<string, unknown> };
  ParticleSystem?: {
    damageNumber: (x: number, y: number, value: number | string, color?: string, isCrit?: boolean, isReact?: boolean) => void;
    _dmgBudgetPatched?: boolean;
    _dmgCellTimes?: Record<string, number>;
    _countActiveDamageNumbers?: () => number;
  };
  weaponManager?: WeaponMgr;
}

declare const window: StgWindow;
