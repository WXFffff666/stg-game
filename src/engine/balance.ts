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
  cfg.VERSION = '2.0.0';
}

interface StgWindow extends Window {
  GAME_CONFIG?: {
    VERSION?: string;
    BALANCE: Record<string, unknown>;
  };
}

declare const window: StgWindow;
