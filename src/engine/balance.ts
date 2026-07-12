/**
 * 平衡补丁 — 在 legacy config 加载后统一调整数值
 */
export function applyBalancePatch(): void {
  const cfg = (window as StgWindow).GAME_CONFIG;
  if (!cfg?.BALANCE) return;

  const b = cfg.BALANCE;
  b.LATE_DIFFICULTY_SCALE = 0.05;
  b.BOSS_SCALING_PER_KILL = 0.08;
  b.MAX_BOSS_HP_MULTIPLIER = 4.0;
  b.MISSILE_FIRES_PER_FRAME = 4;
  b.MISSILE_SLOT_DAMAGE_FALLOFF = [1.0, 1.0, 0.9, 0.85, 0.75, 0.7];
  b.FUSION_DAMAGE_MULTIPLIER = 0.88;
  b.MAX_DIFFICULTY = 120;
  b.BOSS_FIRST_HP_SCALE = 0.75;
  b.MAX_PLAYER_BULLETS_PER_FRAME = 14;
  b.POOL_BULLETS = 280;
  b.POOL_BULLETS_MOBILE = 160;
  cfg.VERSION = '2.1.2';

  if (cfg.ENDLESS_MODE) {
    Object.assign(cfg.ENDLESS_MODE, {
      postWave30DiffScale: 1.085,
      postWave30SpawnAccel: 1.02,
      postWave50HpScale: 1.05,
    });
  }
}

interface StgWindow extends Window {
  GAME_CONFIG?: {
    VERSION?: string;
    BALANCE: Record<string, unknown>;
    ENDLESS_MODE?: Record<string, number>;
  };
}

declare const window: StgWindow;
