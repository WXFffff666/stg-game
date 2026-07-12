/**
 * 大规模内容扩展：武器、技能、流派、敌人、Boss、波次池
 */
export const CONTENT_MANIFEST = {
  weapons: 25,
  passives: 25,
  actives: 25,
  conditionals: 25,
  factions: 20,
  regularEnemies: 20,
  midBosses: 12,
  waveBosses: 8,
  finalBosses: 3,
} as const;

const WEAPON_PATTERNS = [
  'normal', 'spread', 'homing', 'pierce', 'laser', 'arc', 'missile', 'explosive',
  'wave', 'needle', 'flame', 'iceShard', 'lightningBolt', 'shuriken', 'rocketLauncher',
  'beamRifle', 'smartSpread', 'plasmaGun', 'frostCannon', 'lightningGun',
  'mineLayer', 'energyWhip', 'sawBlade', 'venomGun', 'magnetGun',
] as const;

const WEAPON_NAMES = [
  '星尘脉冲', '裂空散射', '幽冥追踪', '穿甲钉刺', '光子切割', '电弧鞭', '猎鹰导弹', '爆裂榴弹',
  '音波涟漪', '毒针风暴', '烈焰喷射', '极寒碎晶', '雷霆链枪', '回旋手里剑', '火箭阵列',
  '聚焦光束', '智能扇弹', '等离子环', '霜冻炮', '电磁炮',
  '地雷布设', '能量长鞭', '锯齿飞轮', '剧毒喷射', '引力弹',
];

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;

const FACTION_THEMES = [
  { id: 'extFac_blaze', name: '🔥 赤焰宗', color: '#ff4422', stat: 'attack', val: 0.1 },
  { id: 'extFac_frost', name: '❄️ 寒霜殿', color: '#88ccff', stat: 'defense', val: 0.08 },
  { id: 'extFac_storm', name: '⚡ 雷暴门', color: '#ffdd44', stat: 'critRate', val: 0.06 },
  { id: 'extFac_void', name: '🕳️ 虚空教', color: '#8844cc', stat: 'attackSpeed', val: 0.08 },
  { id: 'extFac_holy', name: '✨ 圣光庭', color: '#ffeeaa', stat: 'hp', val: 0.12 },
  { id: 'extFac_shadow', name: '🌑 暗影会', color: '#444466', stat: 'critDamage', val: 0.15 },
  { id: 'extFac_nature', name: '🌿 翠林盟', color: '#44cc66', stat: 'lifesteal', val: 0.05 },
  { id: 'extFac_steel', name: '🛡️ 钢铁团', color: '#888899', stat: 'defense', val: 0.12 },
  { id: 'extFac_chaos', name: '🎭 混沌派', color: '#ff66ff', stat: 'attack', val: 0.12 },
  { id: 'extFac_crystal', name: '💎 晶石阁', color: '#aaeeff', stat: 'bulletCount', val: 1 },
  { id: 'extFac_blood', name: '🩸 血月社', color: '#cc2244', stat: 'lifesteal', val: 0.08 },
  { id: 'extFac_wind', name: '🍃 疾风营', color: '#66ffaa', stat: 'speed', val: 0.1 },
  { id: 'extFac_poison', name: '☠️ 毒瘴谷', color: '#66cc44', stat: 'attack', val: 0.08 },
  { id: 'extFac_mech', name: '🤖 机巧坊', color: '#aabbcc', stat: 'attackSpeed', val: 0.1 },
  { id: 'extFac_star', name: '⭐ 星辉殿', color: '#ffff88', stat: 'xpMultiplier', val: 0.1 },
  { id: 'extFac_time', name: '⏳ 时序塔', color: '#ffcc00', stat: 'cooldownReduction', val: 0.05 },
  { id: 'extFac_gravity', name: '🌌 引力所', color: '#6644aa', stat: 'pickupRange', val: 30 },
  { id: 'extFac_sonic', name: '🔊 音律馆', color: '#cc88ff', stat: 'attack', val: 0.09 },
  { id: 'extFac_plague', name: '🦠 疫渊', color: '#88aa44', stat: 'hp', val: 0.1 },
  { id: 'extFac_rune', name: '🔮 符纹院', color: '#cc66ff', stat: 'critRate', val: 0.08 },
];

const ENEMY_AIS = [
  'chaos', 'weaver', 'teleporter', 'kamikaze', 'charger', 'spawner', 'sniper', 'follow',
  'sniperElite', 'tank', 'shielder', 'splitter', 'healer',
] as const;

const MOVEMENTS = ['sineWave', 'circular', 'diveBomb', 'zigzag', 'figure8', 'linear'] as const;

const BOSS_AIS = ['boss', 'boss_guardian', 'boss_summoner', 'boss_dragon', 'boss_phantom'] as const;

const ACTIVE_ACTIONS = [
  { action: 'shockwave', damage: 50, radius: 220 },
  { action: 'lightning', damage: 70, count: 4 },
  { action: 'timeSlow', amount: 0.35, duration: 3500 },
  { action: 'invincible', duration: 2500 },
  { action: 'nova', damage: 45, radius: 180 },
  { action: 'heal', amount: 40 },
] as const;

const CONDITIONAL_TRIGGERS = ['onKill', 'onHit', 'onCrit', 'onDodge', 'onLowHp'] as const;

function hue(i: number): string {
  const h = (i * 37) % 360;
  return `hsl(${h},70%,55%)`;
}

function rarityAt(i: number): (typeof RARITIES)[number] {
  return RARITIES[Math.min(4, Math.floor(i / 5))];
}

export function applyMassContentExtension(): void {
  const cfg = (window as StgWindow).GAME_CONFIG;
  if (!cfg || (window as StgWindow)._massContentApplied) return;
  (window as StgWindow)._massContentApplied = true;

  // ---- 武器 x25 ----
  for (let i = 0; i < CONTENT_MANIFEST.weapons; i++) {
    const id = `ext_wep_${i}`;
    const pattern = WEAPON_PATTERNS[i % WEAPON_PATTERNS.length];
    const base: Record<string, unknown> = {
      id,
      name: WEAPON_NAMES[i],
      icon: ['⚔️', '🎯', '💫', '🔫', '⚡', '🌊', '🔥', '❄️'][i % 8],
      rarity: rarityAt(i),
      description: `${WEAPON_NAMES[i]} — 扩展武器 #${i + 1}`,
      pattern,
      fireRate: 120 + (i % 8) * 45,
      damage: 8 + (i % 6) * 3,
      bulletSpeed: 500 + (i % 10) * 40,
      bulletSize: 3 + (i % 3),
      bulletColor: hue(i),
      trailColor: hue(i + 60),
    };
    if (['spread', 'smartSpread', 'wave'].includes(pattern)) {
      base.bulletCount = 3 + (i % 5);
      base.spreadAngle = 20 + (i % 6) * 8;
    }
    if (pattern === 'homing') base.homingStrength = 0.02 + (i % 5) * 0.008;
    if (pattern === 'pierce') base.pierceCount = 2 + (i % 4);
    if (pattern === 'missile' || pattern === 'rocketLauncher') {
      base.homingStrength = 0.025;
      base.explosionRadius = 60 + (i % 4) * 15;
    }
    cfg.WEAPONS[id] = base;
  }

  // ---- 流派 x20 ----
  const FACTION_SIG_ACTIVES = [
    { action: 'nova', damage: 42, radius: 170 },
    { action: 'shockwave', damage: 38, radius: 150 },
    { action: 'lightning', damage: 55, count: 4 },
    { action: 'burstFire', bulletCount: 24, duration: 400 },
    { action: 'frostNova', damage: 48, radius: 190, freezeDuration: 1500 },
    { action: 'fireNova', damage: 50, radius: 200, burnDuration: 3000 },
    { action: 'heal', amount: 35 },
    { action: 'invincible', duration: 2000 },
    { action: 'timeSlow', amount: 0.35, duration: 3000 },
    { action: 'overdrive', damage: 0, duration: 5000 },
  ] as const;

  for (let fi = 0; fi < FACTION_THEMES.length; fi++) {
    const f = FACTION_THEMES[fi];
    const sigTpl = FACTION_SIG_ACTIVES[fi % FACTION_SIG_ACTIVES.length];
    const sigId = `${f.id}_signature`;
    cfg.SKILLS.push({
      id: sigId,
      name: `${f.name}·专属战技`,
      type: 'active',
      faction: f.id,
      rarity: 'epic',
      icon: f.name.split(' ')[0] || '💥',
      cooldown: 7000 + (fi % 5) * 1200,
      description: `${f.name}专属自动战技，冷却后自动释放`,
      effects: [{ ...sigTpl }],
    });
    cfg.FACTIONS[f.id] = {
      id: f.id,
      name: f.name,
      color: f.color,
      description: `${f.name}专属战斗流派，开局获得专属自动战技`,
      signatureActive: sigId,
      baseStats: {
        attackSpeed: 1.0,
        attack: 1.0,
        hp: 110,
        speed: 285,
        critRate: 0.05,
        critMult: 1.5,
        [f.stat]: f.val,
      },
      icon: f.name.split(' ')[0],
    };
  }

  // ---- 技能 x75 (25 passive + 25 active + 25 conditional) ----
  if (!Array.isArray(cfg.SKILLS)) cfg.SKILLS = [];

  for (let i = 0; i < CONTENT_MANIFEST.passives; i++) {
    const fac = FACTION_THEMES[i % FACTION_THEMES.length];
    cfg.SKILLS.push({
      id: `ext_pass_${i}`,
      name: `强化·${fac.name.slice(2, 5)}${i + 1}`,
      type: 'passive',
      faction: fac.id,
      rarity: rarityAt(i),
      icon: '⬆️',
      description: `攻击力+${4 + (i % 5)}%，${fac.stat}+${Math.round(fac.val * 100)}%`,
      effects: [
        { stat: 'attack', op: 'multiply', value: 0.04 + (i % 5) * 0.01 },
        { stat: fac.stat, op: fac.stat === 'bulletCount' || fac.stat === 'pickupRange' ? 'add' : 'multiply', value: fac.val },
      ],
    });
  }

  for (let i = 0; i < CONTENT_MANIFEST.actives; i++) {
    const tpl = ACTIVE_ACTIONS[i % ACTIVE_ACTIONS.length];
    const fac = FACTION_THEMES[i % FACTION_THEMES.length];
    cfg.SKILLS.push({
      id: `ext_act_${i}`,
      name: `战技·${fac.name.slice(2, 5)}${i + 1}`,
      type: 'active',
      faction: i % 3 === 0 ? 'any' : fac.id,
      rarity: rarityAt(i),
      icon: '💥',
      cooldown: 6000 + (i % 8) * 1500,
      description: `释放${tpl.action}战技`,
      effects: [{ ...tpl, damage: (tpl as { damage?: number }).damage ? (tpl as { damage: number }).damage + i * 2 : undefined }],
    });
  }

  for (let i = 0; i < CONTENT_MANIFEST.conditionals; i++) {
    const trigger = CONDITIONAL_TRIGGERS[i % CONDITIONAL_TRIGGERS.length];
    const fac = FACTION_THEMES[i % FACTION_THEMES.length];
    const eff =
      trigger === 'onKill'
        ? [{ action: 'heal', amount: 3 + (i % 5) }]
        : trigger === 'onHit'
          ? [{ stat: 'shieldAmount', op: 'add', value: 10 + i, duration: 4000 }]
          : trigger === 'onCrit'
            ? [{ stat: 'attack', op: 'multiply', value: 0.05, duration: 3000 }]
            : trigger === 'onDodge'
              ? [{ action: 'shockwave', damage: 25 + i, radius: 120 }]
              : [{ stat: 'attack', op: 'multiply', value: 0.15, duration: 5000 }];
    cfg.SKILLS.push({
      id: `ext_cond_${i}`,
      name: `秘术·${fac.name.slice(2, 5)}${i + 1}`,
      type: 'conditional',
      faction: fac.id,
      rarity: rarityAt(i),
      icon: '🔮',
      trigger,
      cooldown: 8000 + (i % 6) * 2000,
      description: `${trigger}时触发`,
      effects: eff,
    });
  }

  // ---- 普通敌人 x20 ----
  const enemies = cfg.ENEMIES as Record<string, Record<string, unknown>>;
  for (let i = 0; i < CONTENT_MANIFEST.regularEnemies; i++) {
    const id = `ext_en_${i}`;
    const ai = ENEMY_AIS[i % ENEMY_AIS.length];
    const mov = MOVEMENTS[i % MOVEMENTS.length];
    enemies[id] = {
      type: id,
      name: `异种${['α', 'β', 'γ', 'δ', 'ε'][i % 5]}-${i + 1}`,
      hp: 40 + i * 12,
      speed: 45 + (i % 8) * 15,
      damage: 8 + (i % 6) * 3,
      score: 30 + i * 8,
      xp: 12 + i * 3,
      size: 12 + (i % 5) * 2,
      color: hue(i + 120),
      ai,
      fireRate: 500 + (i % 7) * 120,
      bulletSpeed: 220 + (i % 6) * 35,
      bulletDamage: 6 + (i % 5) * 2,
      bulletColor: hue(i + 180),
      bulletCount: 1 + (i % 4),
      spreadAngle: 15 + (i % 5) * 10,
      dropRate: 0.15 + (i % 5) * 0.03,
      movementPattern: mov,
      patternAmplitude: 80 + (i % 6) * 20,
      burstFire: i % 3 === 0,
    };
    cfg.WAVES.enemyPool[id] = { weight: 6 + (i % 8), minWave: 4 + Math.floor(i / 3) };
  }

  // ---- 中Boss x12 ----
  const midNames = [
    '熔岩巨兽', '冰霜督军', '雷暴执政官', '虚空先驱', '瘟疫母体', '钢铁毁灭者',
    '暗影巨像', '晶石泰坦', '风暴领主', '血月狂徒', '机巧巨兵', '时序看守者',
  ];
  for (let i = 0; i < CONTENT_MANIFEST.midBosses; i++) {
    const id = `ext_mid_${i}`;
    const ai = ['tank', 'spawner', 'chaos', 'sniperElite', 'charger', 'titan'][i % 6];
    enemies[id] = {
      type: id,
      name: midNames[i],
      hp: 2200 + i * 350,
      speed: 18 + (i % 4) * 8,
      damage: 28 + i * 4,
      score: 800 + i * 120,
      xp: 150 + i * 25,
      size: 32 + (i % 4) * 4,
      color: hue(i + 200),
      ai: ai === 'titan' ? 'tank' : ai,
      fireRate: 400 + (i % 5) * 100,
      bulletSpeed: 200 + (i % 6) * 30,
      bulletDamage: 14 + (i % 4) * 3,
      bulletColor: hue(i + 240),
      bulletCount: 4 + (i % 5),
      spreadAngle: 25 + (i % 4) * 15,
      dropRate: 0.55,
      isMidBoss: true,
      movementPattern: MOVEMENTS[i % MOVEMENTS.length],
      patternAmplitude: 100 + i * 10,
      shieldHp: i % 3 === 0 ? 150 + i * 20 : 0,
      spawnInterval: ai === 'spawner' ? 2500 : undefined,
    };
    cfg.WAVES.enemyPool[id] = { weight: 3 + (i % 3), minWave: 12 + i };
  }

  // ---- 波次Boss x8 (ENEMIES 出战) ----
  const waveBossDefs = [
    { id: 'boss_ext_titan', name: '泰坦毁灭者', ai: 'boss', hp: 7500, color: '#aa6644' },
    { id: 'boss_ext_void', name: '虚空执政官', ai: 'boss_phantom', hp: 8200, color: '#6644aa' },
    { id: 'boss_ext_flame', name: '炼狱龙王', ai: 'boss_dragon', hp: 9500, color: '#ff4400' },
    { id: 'boss_ext_crystal', name: '晶石守护神', ai: 'boss_guardian', hp: 8800, color: '#88aaff' },
    { id: 'boss_ext_plague', name: '瘟疫编织者', ai: 'boss_summoner', hp: 7000, color: '#66aa44' },
    { id: 'boss_ext_storm', name: '雷暴暴君', ai: 'boss_dragon', hp: 10200, color: '#ffcc00' },
    { id: 'boss_ext_shadow', name: '暗影大公', ai: 'boss_phantom', hp: 8600, color: '#333355' },
    { id: 'boss_ext_steel', name: '钢铁要塞', ai: 'boss_guardian', hp: 11000, color: '#888899' },
  ];
  const waveBossRotation: string[] = [
    'boss', 'boss_guardian', 'boss_summoner', 'boss_dragon', 'boss_phantom',
  ];
  for (const b of waveBossDefs) {
    enemies[b.id] = {
      type: b.id,
      name: b.name,
      hp: b.hp,
      speed: 28,
      damage: 38,
      score: 9000,
      xp: 700,
      size: 52,
      color: b.color,
      ai: b.ai,
      fireRate: 550,
      bulletSpeed: 240,
      bulletDamage: 16,
      bulletColor: b.color,
      bulletCount: 10,
      spreadAngle: 360,
      dropRate: 1.0,
      phases: [
        { hpThreshold: 0.66, bulletCount: 14, fireRate: 450, bulletSpeed: 270 },
        { hpThreshold: 0.33, bulletCount: 18, fireRate: 350, bulletSpeed: 300 },
      ],
    };
    waveBossRotation.push(b.id);
    if (!cfg.BOSSES) cfg.BOSSES = {};
    (cfg.BOSSES as Record<string, unknown>)[b.id] = {
      id: b.id,
      name: b.name,
      icon: '👹',
      color: b.color,
      size: 52,
      baseHp: b.hp,
      baseDamage: 38,
      baseSpeed: 28,
      score: 9000,
      xp: 700,
      phases: enemies[b.id].phases,
      dropGuaranteed: ['weaponCrate'],
    };
  }

  // ---- 最终Boss x3 ----
  const finalDefs = [
    { id: 'boss_final_seraph', name: '终焉炽天使', wave: 50, ai: 'boss_dragon', hp: 18000, color: '#ffee88', icon: '👼' },
    { id: 'boss_final_omega', name: '欧米伽核心', wave: 100, ai: 'boss', hp: 28000, color: '#ff2244', icon: 'Ω' },
    { id: 'boss_final_apocalypse', name: '天启审判者', wave: 150, ai: 'boss_phantom', hp: 40000, color: '#aa00ff', icon: '☄️' },
  ];
  const finalBossWaves: Record<number, string> = {};
  for (const fb of finalDefs) {
    enemies[fb.id] = {
      type: fb.id,
      name: fb.name,
      hp: fb.hp,
      speed: 32,
      damage: 55,
      score: 50000,
      xp: 3000,
      size: 68,
      color: fb.color,
      ai: fb.ai,
      fireRate: 400,
      bulletSpeed: 300,
      bulletDamage: 28,
      bulletColor: fb.color,
      bulletCount: 14,
      spreadAngle: 360,
      dropRate: 1.0,
      isFinalBoss: true,
      phases: [
        { hpThreshold: 0.75, bulletCount: 18, fireRate: 350, bulletSpeed: 320 },
        { hpThreshold: 0.5, bulletCount: 22, fireRate: 280, bulletSpeed: 360 },
        { hpThreshold: 0.25, bulletCount: 28, fireRate: 200, bulletSpeed: 400 },
      ],
    };
    finalBossWaves[fb.wave] = fb.id;
    (cfg.BOSSES as Record<string, unknown>)[fb.id] = {
      id: fb.id,
      name: fb.name,
      icon: fb.icon,
      color: fb.color,
      size: 68,
      baseHp: fb.hp,
      baseDamage: 55,
      baseSpeed: 32,
      score: 50000,
      xp: 3000,
      isFinalBoss: true,
      phases: enemies[fb.id].phases,
      dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore'],
    };
  }

  cfg.WAVE_BOSS_ROTATION = waveBossRotation;
  cfg.FINAL_BOSS_WAVES = finalBossWaves;
  cfg.MID_BOSS_WAVES = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84];

  // 精英波次模板追加中Boss
  const groups = cfg.WAVES.spawnRules.groups;
  const lateGroup = groups[groups.length - 1];
  if (lateGroup?.templates) {
    for (let i = 0; i < 6; i++) {
      lateGroup.templates.push({
        enemy: `ext_mid_${i}`,
        count: 1,
        spacing: 0,
        pattern: 'single',
      });
    }
  }

  // 无尽难度参数
  if (!cfg.ENDLESS_MODE) cfg.ENDLESS_MODE = {};
  Object.assign(cfg.ENDLESS_MODE, {
    postWave30DiffScale: 1.085,
    postWave30SpawnAccel: 1.02,
    postWave50HpScale: 1.05,
    enemyRegenStartWave: 35,
    volatileStartWave: 45,
  });
}

interface StgWindow extends Window {
  GAME_CONFIG?: {
    WEAPONS: Record<string, unknown>;
    SKILLS: unknown[];
    FACTIONS: Record<string, unknown>;
    ENEMIES: Record<string, Record<string, unknown>>;
    BOSSES?: Record<string, unknown>;
    WAVES: {
      enemyPool: Record<string, { weight: number; minWave: number }>;
      spawnRules: { groups: { templates: unknown[] }[] };
    };
    WAVE_BOSS_ROTATION?: string[];
    FINAL_BOSS_WAVES?: Record<number, string>;
    MID_BOSS_WAVES?: number[];
    ENDLESS_MODE?: Record<string, number>;
  };
  _massContentApplied?: boolean;
}

declare const window: StgWindow;
