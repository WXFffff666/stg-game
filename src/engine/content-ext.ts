/**
 * 运行时内容扩展：新武器、二级融合、通用技能
 */
export function applyContentExtension(): void {
  const cfg = (window as StgWindow).GAME_CONFIG;
  if (!cfg || (window as StgWindow)._contentExtApplied) return;
  (window as StgWindow)._contentExtApplied = true;

  Object.assign(cfg.WEAPONS, {
    pulseRifle: {
      id: 'pulseRifle', name: '脉冲步枪', icon: '💠', rarity: 'rare',
      description: '三连发能量脉冲，稳定输出',
      pattern: 'normal', fireRate: 180, damage: 11, bulletSpeed: 720, bulletSize: 4,
      bulletCount: 3, spreadAngle: 6, bulletColor: '#66ccff', trailColor: '#3388cc',
    },
    starBurst: {
      id: 'starBurst', name: '星爆散射', icon: '✴️', rarity: 'rare',
      description: '星形散射弹幕覆盖扇区',
      pattern: 'spread', fireRate: 420, damage: 7, bulletSpeed: 500, bulletSize: 3,
      bulletCount: 7, spreadAngle: 42, bulletColor: '#ffdd66', trailColor: '#cc9900',
    },
    coilGun: {
      id: 'coilGun', name: '线圈炮', icon: '🔗', rarity: 'epic',
      description: '电磁线圈加速穿甲弹',
      pattern: 'pierce', fireRate: 320, damage: 18, bulletSpeed: 880, bulletSize: 4,
      pierceCount: 5, bulletColor: '#aaddff', trailColor: '#6699cc',
    },
    prismLaser: {
      id: 'prismLaser', name: '棱镜激光', icon: '🔷', rarity: 'epic',
      description: '棱镜折射双束激光',
      pattern: 'laser', fireRate: 90, damage: 7, bulletSpeed: 1200, bulletSize: 3,
      bulletCount: 2, spreadAngle: 8, bulletColor: '#88ffff', trailColor: '#44cccc',
    },
    novaMine: {
      id: 'novaMine', name: '新星地雷', icon: '💫', rarity: 'rare',
      description: '新星爆炸地雷，范围灼烧',
      pattern: 'mineLayer', fireRate: 450, damage: 28, bulletSpeed: 180, bulletSize: 5,
      explosionRadius: 95, mineCount: 4, bulletColor: '#ffaa44', trailColor: '#ff6600',
    },
    // ---- 二级融合武器 (融合武器 + 融合武器) ----
    omegaPlasma: {
      id: 'omegaPlasma', name: '欧米伽等离子', icon: '🌌', rarity: 'legendary', fused: true, fusionTier: 2,
      description: '等离子机枪 + 智能散射 = 追踪等离子风暴',
      pattern: 'plasmaGun', fireRate: 70, damage: 9, bulletSpeed: 950, bulletSize: 3.5,
      pierceCount: 3, homingStrength: 0.03, homingRange: 320, bulletColor: '#ff66ff', trailColor: '#cc22cc',
    },
    hyperTesla: {
      id: 'hyperTesla', name: '超高压特斯拉', icon: '⚡', rarity: 'legendary', fused: true, fusionTier: 2,
      description: '特斯拉浮游炮 + 连锁闪电 = 环绕雷暴',
      pattern: 'teslaOrbital', fireRate: 280, damage: 12, bulletSpeed: 650, bulletSize: 3,
      orbitRadius: 90, orbitSpeed: 3.2, orbitCount: 5, chainCount: 4, chainRange: 160,
      bulletColor: '#aaffff', trailColor: '#44ddff',
    },
    glacialPhantom: {
      id: 'glacialPhantom', name: '冰川幻影', icon: '❄️', rarity: 'legendary', fused: true, fusionTier: 2,
      description: '幻影之刃 + 冰霜导弹 = 冰冻回旋刃群',
      pattern: 'phantomBlade', fireRate: 400, damage: 38, bulletSpeed: 450, bulletSize: 6,
      pierceCount: 6, returnSpeed: 600, range: 420, slowAmount: 0.35, bulletColor: '#aaeeff', trailColor: '#66bbdd',
    },
    volcanicStorm: {
      id: 'volcanicStorm', name: '火山风暴', icon: '🌋', rarity: 'legendary', fused: true, fusionTier: 2,
      description: '熔岩炮 + 震荡波 = 熔岩冲击波',
      pattern: 'shockwaveWep', fireRate: 550, damage: 35, bulletSpeed: 400, bulletSize: 6,
      explosionRadius: 85, waveAmplitude: 6, bulletsPerWave: 5, burnDamage: 12,
      bulletColor: '#ff5522', trailColor: '#cc2200',
    },
    voidNova: {
      id: 'voidNova', name: '虚空新星', icon: '🕳️', rarity: 'legendary', fused: true, fusionTier: 2,
      description: '死灵光束 + 虚空火箭 = 引力新星爆发',
      pattern: 'rocketBarrage', fireRate: 900, damage: 55, bulletSpeed: 280, bulletSize: 10,
      rocketCount: 3, explosionRadius: 120, pullForce: 80, bulletColor: '#8844cc', trailColor: '#440088',
    },
  });

  const fr = cfg.FUSION_RECIPES;
  if (fr?.weapons) {
    fr.tier2RequiredLevel = 5;
    fr.weapons.push(
      { id: 'w_omegaPlasma', ingredientA: 'plasmaGun', ingredientB: 'smartSpread', result: 'omegaPlasma', tier: 2,
        name: '欧米伽等离子', icon: '🌌', description: '等离子机枪 + 智能散射' },
      { id: 'w_hyperTesla', ingredientA: 'teslaOrbital', ingredientB: 'chainLightningGun', result: 'hyperTesla', tier: 2,
        name: '超高压特斯拉', icon: '⚡', description: '特斯拉浮游炮 + 超级连锁闪电' },
      { id: 'w_glacialPhantom', ingredientA: 'phantomBlade', ingredientB: 'frostMissile', result: 'glacialPhantom', tier: 2,
        name: '冰川幻影', icon: '❄️', description: '幻影之刃 + 冰霜导弹' },
      { id: 'w_volcanicStorm', ingredientA: 'magmaCannon', ingredientB: 'shockwave', result: 'volcanicStorm', tier: 2,
        name: '火山风暴', icon: '🌋', description: '熔岩炮 + 震荡波' },
      { id: 'w_voidNova', ingredientA: 'necroBeam', ingredientB: 'voidRocket', result: 'voidNova', tier: 2,
        name: '虚空新星', icon: '🕳️', description: '死灵光束 + 虚空火箭' },
      { id: 'w_stormPlasma', ingredientA: 'stormBlade', ingredientB: 'plasmaGun', result: 'omegaPlasma', tier: 2,
        name: '风暴等离子', icon: '🌀', description: '风暴之刃 + 等离子机枪（同归欧米伽）' },
    );
  }

  if (Array.isArray(cfg.SKILLS)) {
    cfg.SKILLS.push(
      { id: 'gx_overcharge', name: '过载充能', type: 'passive', rarity: 'rare',
        description: '攻击力+8%，射速+5%', icon: '⚡',
        effects: [{ stat: 'attack', op: 'multiply', value: 0.08 }, { stat: 'attackSpeed', op: 'multiply', value: 0.05 }] },
      { id: 'gx_bulwark2', name: '钢铁意志', type: 'passive', rarity: 'rare',
        description: '最大生命+12%，受伤减免+3%', icon: '🛡️',
        effects: [{ stat: 'hp', op: 'multiply', value: 0.12 }, { stat: 'defense', op: 'add', value: 0.03 }] },
      { id: 'gx_swift2', name: '疾风步', type: 'passive', rarity: 'uncommon',
        description: '移速+8%，拾取范围+20', icon: '💨',
        effects: [{ stat: 'speed', op: 'multiply', value: 0.08 }, { stat: 'pickupRange', op: 'add', value: 20 }] },
      { id: 'gx_crit2', name: '致命精准', type: 'passive', rarity: 'epic',
        description: '暴击率+6%，暴击伤害+15%', icon: '💥',
        effects: [{ stat: 'critRate', op: 'add', value: 0.06 }, { stat: 'critDamage', op: 'multiply', value: 0.15 }] },
      { id: 'gx_xp2', name: '博学', type: 'passive', rarity: 'uncommon',
        description: '经验获取+10%', icon: '📚',
        effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.1 }] },
      { id: 'gx_fusionMastery', name: '融合精通', type: 'passive', rarity: 'legendary',
        description: '融合武器伤害+12%', icon: '🔮',
        effects: [{ stat: 'fusionDamage', op: 'multiply', value: 0.12 }] },
    );
  }
}

interface StgWindow extends Window {
  GAME_CONFIG?: {
    WEAPONS: Record<string, unknown>;
    SKILLS: unknown[];
    FUSION_RECIPES?: { weapons: unknown[]; tier2RequiredLevel?: number };
  };
  _contentExtApplied?: boolean;
}

declare const window: StgWindow;
