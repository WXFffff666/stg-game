// ============================================================
// STG Game Configuration - All game data
// ============================================================

export interface Faction {
  id: string;
  name: string;
  color: string;
  description: string;
  baseStats: Record<string, number>;
}

export interface Skill {
  id: string;
  name: string;
  faction: string;
  type: 'passive' | 'conditional';
  rarity: 'common' | 'uncommon' | 'rare';
  trigger?: string;
  effects: { stat: string; op: string; value: number }[];
}

export interface EnemyType {
  type: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  xp: number;
  size: number;
  color: string;
  fireRate: number;
  isBoss?: boolean;
  splits?: number;
  shieldHp?: number;
}

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 900;

// ============================================================================
// FACTIONS (20)
// ============================================================================

export const FACTIONS: Faction[] = [
  { id: 'attackSpeed', name: '⚡ 攻速流', color: '#ffdd00', description: '极致射速，弹幕如雨',
    baseStats: { attackSpeed: 0.4, attack: 0.85, hp: 100, speed: 280, critRate: 0.05, critMult: 1.5, bulletCount: 1 } },
  { id: 'counter', name: '🛡️ 反伤流', color: '#ff6644', description: '挨打反弹，以守为攻',
    baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 150, speed: 260, reflectDamage: 0.3, defense: 0.2, bulletCount: 1 } },
  { id: 'crit', name: '💥 暴击流', color: '#ff0000', description: '一击必杀，刀刀暴击',
    baseStats: { attackSpeed: 1.0, attack: 1.3, hp: 90, speed: 290, critRate: 0.25, critMult: 3.0, bulletCount: 1 } },
  { id: 'summon', name: '🛸 召唤流', color: '#aa66ff', description: '浮游炮环绕，火力压制',
    baseStats: { attackSpeed: 1.0, attack: 0.7, hp: 100, speed: 280, drones: 2, bulletCount: 1 } },
  { id: 'elemental', name: '🔥 元素流', color: '#ff8800', description: '火焰灼烧，持续伤害',
    baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 105, speed: 285, burnDamage: 5, burnDuration: 2, bulletCount: 1 } },
  { id: 'lifesteal', name: '🩸 吸血流转', color: '#ff3366', description: '越战越勇，吸血续航',
    baseStats: { attackSpeed: 1.1, attack: 0.85, hp: 110, speed: 295, lifesteal: 0.12, bulletCount: 1 } },
  { id: 'shield', name: '🔮 盾反流', color: '#44aaff', description: '护盾抵挡，反弹伤害',
    baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 130, speed: 270, shieldMax: 40, shieldReflect: 0.5, bulletCount: 1 } },
  { id: 'poison', name: '☠️ 毒伤流', color: '#55cc44', description: '剧毒蔓延，缓慢死亡',
    baseStats: { attackSpeed: 1.0, attack: 0.75, hp: 105, speed: 285, poisonDamage: 8, poisonDuration: 3, bulletCount: 1 } },
  { id: 'ice', name: '❄️ 冰控流', color: '#66ddff', description: '冰冻减速，掌控战场',
    baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 100, speed: 290, slowChance: 0.35, slowAmount: 0.4, freezeChance: 0.05, bulletCount: 1 } },
  { id: 'barrage', name: '🌊 弹幕流', color: '#ff66aa', description: '弹幕覆盖，范围压制',
    baseStats: { attackSpeed: 0.8, attack: 0.5, hp: 95, speed: 275, bulletCount: 3, spreadAngle: 20 } },
  { id: 'gravity', name: '🌌 重力流', color: '#8866cc', description: '重力场减速敌人',
    baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 110, speed: 275, pullRadius: 150, pullForce: 80, bulletCount: 1 } },
  { id: 'void', name: '🕳️ 虚空流', color: '#220044', description: '低血量敌人直接斩杀',
    baseStats: { attackSpeed: 1.1, attack: 1.0, hp: 95, speed: 290, executeThreshold: 0.15, bulletCount: 1 } },
  { id: 'thunder', name: '🌩️ 雷电流', color: '#ffff00', description: '雷电连锁，传遍敌群',
    baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 300, chainChance: 0.3, chainCount: 3, chainDamage: 0.5, bulletCount: 1 } },
  { id: 'wind', name: '🍃 风之流', color: '#88ff88', description: '疾风之力，击退敌人',
    baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 100, speed: 330, pushForce: 80, dodgeChance: 0.08, bulletCount: 1 } },
  { id: 'shadow', name: '🌑 暗影流', color: '#111166', description: '暗影闪避致命攻击',
    baseStats: { attackSpeed: 1.05, attack: 1.1, hp: 85, speed: 310, dodgeChance: 0.15, bulletCount: 1 } },
  { id: 'holy', name: '✨ 圣光流', color: '#ffffcc', description: '治愈光环净化黑暗',
    baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 120, speed: 280, healAura: 1.5, bulletCount: 1 } },
  { id: 'blood', name: '🩸 血祭流', color: '#cc0000', description: '献祭生命，换取毁灭之力',
    baseStats: { attackSpeed: 1.05, attack: 1.4, hp: 70, speed: 295, hpRegen: 1.0, bulletCount: 1 } },
  { id: 'magnet', name: '🧲 磁力流', color: '#cc44cc', description: '磁力掌控，吸物品弹子弹',
    baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 105, speed: 285, pickupRange: 120, bulletCount: 1 } },
  { id: 'mirror', name: '🪞 镜之流', color: '#aaccee', description: '镜像分身，迷惑敌人',
    baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 100, speed: 290, decoyCount: 1, bulletCount: 1 } },
  { id: 'time', name: '⏳ 时之流', color: '#ccbb88', description: '减速世界加速自身',
    baseStats: { attackSpeed: 0.7, attack: 0.85, hp: 100, speed: 285, timeSlow: 0.3, bulletCount: 1 } },
];

// ============================================================================
// SKILLS (30 common + 20 faction-specific)
// ============================================================================

export const SKILLS: Skill[] = [
  // ---- Common skills (any faction) ----
  { id: 'atk_1', name: '攻击强化 I', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.12 }] },
  { id: 'atk_2', name: '攻击强化 II', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.25 }] },
  { id: 'atk_3', name: '攻击强化 III', faction: 'any', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.45 }] },
  { id: 'spd_1', name: '速度提升 I', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'speed', op: 'multiply', value: 0.1 }] },
  { id: 'spd_2', name: '速度提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'speed', op: 'multiply', value: 0.2 }] },
  { id: 'hp_1', name: '生命提升 I', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'hp', op: 'add', value: 25 }] },
  { id: 'hp_2', name: '生命提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'hp', op: 'add', value: 50 }] },
  { id: 'crit_1', name: '暴击率提升', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'critRate', op: 'add', value: 0.08 }] },
  { id: 'crit_2', name: '暴击率提升+', faction: 'any', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'critRate', op: 'add', value: 0.15 }] },
  { id: 'crit_dmg', name: '暴击伤害提升', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'critMult', op: 'add', value: 0.5 }] },
  { id: 'heal_kill', name: '击杀回血', faction: 'any', type: 'conditional', rarity: 'uncommon',
    trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 3 }] },
  { id: 'heal_kill_2', name: '击杀回血+', faction: 'any', type: 'conditional', rarity: 'rare',
    trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 6 }] },
  { id: 'xp_boost', name: '经验加成', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'xpMult', op: 'multiply', value: 0.25 }] },
  { id: 'xp_boost_2', name: '经验加成+', faction: 'any', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'xpMult', op: 'multiply', value: 0.5 }] },
  { id: 'atk_spd_1', name: '射速提升', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.1 }] },
  { id: 'atk_spd_2', name: '射速提升+', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.18 }] },
  { id: 'lifesteal_1', name: '吸血', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'lifesteal', op: 'add', value: 0.05 }] },
  { id: 'bullet_plus', name: '弹道+1', faction: 'any', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'bulletCount', op: 'add', value: 1 }] },
  { id: 'shield_1', name: '护盾强化', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'shieldMax', op: 'add', value: 20 }] },
  { id: 'dodge_1', name: '闪避提升', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'dodgeChance', op: 'add', value: 0.05 }] },
  { id: 'hp_regen', name: '生命回复', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'hpRegen', op: 'add', value: 0.5 }] },
  { id: 'pickup_1', name: '拾取范围+', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'pickupRange', op: 'add', value: 50 }] },
  { id: 'bullet_size', name: '弹幕增大', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'bulletSize', op: 'multiply', value: 0.2 }] },
  { id: 'defense_1', name: '防御强化', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'defense', op: 'add', value: 0.08 }] },
  { id: 'reflect_1', name: '反伤强化', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'reflectDamage', op: 'add', value: 0.1 }] },
  { id: 'combo_bonus', name: '连击加分', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'comboMult', op: 'multiply', value: 0.5 }] },
  { id: 'magnet_1', name: '磁力范围+', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'pickupRange', op: 'add', value: 80 }] },
  { id: 'fire_rate_1', name: '冷却缩减', faction: 'any', type: 'passive', rarity: 'common',
    effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.08 }] },
  { id: 'crit_heal', name: '暴击回血', faction: 'any', type: 'conditional', rarity: 'rare',
    trigger: 'onCrit', effects: [{ stat: 'hp', op: 'add', value: 2 }] },
  { id: 'speed_kill', name: '速杀加分', faction: 'any', type: 'passive', rarity: 'uncommon',
    effects: [{ stat: 'scoreMult', op: 'multiply', value: 0.2 }] },

  // ---- Faction-specific skills (2 per faction) ----
  { id: 'as_rapid', name: '极速射击', faction: 'attackSpeed', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.2 }] },
  { id: 'as_rain', name: '弹雨', faction: 'attackSpeed', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'bulletCount', op: 'add', value: 1 }] },
  { id: 'ct_thorn', name: '荆棘之盾', faction: 'counter', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'reflectDamage', op: 'add', value: 0.2 }] },
  { id: 'ct_wall', name: '铁壁', faction: 'counter', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'defense', op: 'add', value: 0.15 }] },
  { id: 'cr_fatal', name: '致命一击', faction: 'crit', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'critMult', op: 'add', value: 0.5 }] },
  { id: 'cr_rate', name: '暴击强化', faction: 'crit', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'critRate', op: 'add', value: 0.1 }] },
  { id: 'sm_drone', name: '无人机强化', faction: 'summon', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'drones', op: 'add', value: 1 }] },
  { id: 'sm_auto', name: '自动瞄准', faction: 'summon', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }] },
  { id: 'el_flame', name: '烈焰', faction: 'elemental', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'burnDamage', op: 'add', value: 5 }] },
  { id: 'el_spread', name: '燃烧蔓延', faction: 'elemental', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'burnDuration', op: 'add', value: 1 }] },
  { id: 'ls_blood', name: '嗜血', faction: 'lifesteal', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'lifesteal', op: 'add', value: 0.08 }] },
  { id: 'ls_drain', name: '生命汲取', faction: 'lifesteal', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'hp', op: 'add', value: 20 }] },
  { id: 'sh_strong', name: '强化护盾', faction: 'shield', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'shieldMax', op: 'add', value: 25 }] },
  { id: 'sh_reflect', name: '反射强化', faction: 'shield', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'shieldReflect', op: 'add', value: 0.2 }] },
  { id: 'po_toxic', name: '剧毒', faction: 'poison', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'poisonDamage', op: 'add', value: 5 }] },
  { id: 'po_cloud', name: '毒雾', faction: 'poison', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'poisonDuration', op: 'add', value: 1.5 }] },
  { id: 'ic_cold', name: '极寒', faction: 'ice', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'slowChance', op: 'add', value: 0.15 }] },
  { id: 'ic_freeze', name: '冰封', faction: 'ice', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'freezeChance', op: 'add', value: 0.05 }] },
  { id: 'ba_expand', name: '弹幕扩展', faction: 'barrage', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'bulletCount', op: 'add', value: 2 }] },
  { id: 'ba_cover', name: '覆盖射击', faction: 'barrage', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }] },
  { id: 'gr_pull', name: '引力增强', faction: 'gravity', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'pullForce', op: 'add', value: 40 }] },
  { id: 'gr_radius', name: '引力范围', faction: 'gravity', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'pullRadius', op: 'add', value: 50 }] },
  { id: 'vd_power', name: '虚空之力', faction: 'void', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'executeThreshold', op: 'add', value: 0.05 }] },
  { id: 'vd_slay', name: '斩杀强化', faction: 'void', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }] },
  { id: 'th_chain', name: '连锁闪电', faction: 'thunder', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'chainCount', op: 'add', value: 2 }] },
  { id: 'th_shock', name: '雷电强化', faction: 'thunder', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'chainChance', op: 'add', value: 0.15 }] },
  { id: 'wi_push', name: '疾风', faction: 'wind', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'pushForce', op: 'add', value: 40 }] },
  { id: 'wi_dodge', name: '闪避之风', faction: 'wind', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'dodgeChance', op: 'add', value: 0.05 }] },
  { id: 'sd_step', name: '暗影步', faction: 'shadow', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'dodgeChance', op: 'add', value: 0.1 }] },
  { id: 'sd_assassin', name: '暗杀', faction: 'shadow', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'critRate', op: 'add', value: 0.1 }] },
  { id: 'ho_aura', name: '圣光普照', faction: 'holy', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'healAura', op: 'add', value: 1.0 }] },
  { id: 'ho_shield', name: '神圣之盾', faction: 'holy', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'shieldMax', op: 'add', value: 30 }] },
  { id: 'bl_pact', name: '血之契约', faction: 'blood', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.3 }] },
  { id: 'bl_regen', name: '生命涌动', faction: 'blood', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'hpRegen', op: 'add', value: 0.5 }] },
  { id: 'mg_range', name: '磁力增强', faction: 'magnet', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'pickupRange', op: 'add', value: 60 }] },
  { id: 'mg_attract', name: '吸引子弹', faction: 'magnet', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }] },
  { id: 'mi_multi', name: '多重镜像', faction: 'mirror', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'decoyCount', op: 'add', value: 1 }] },
  { id: 'mi_power', name: '镜像强化', faction: 'mirror', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }] },
  { id: 'ti_slow', name: '时间减速', faction: 'time', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'timeSlow', op: 'add', value: 0.15 }] },
  { id: 'ti_haste', name: '加速', faction: 'time', type: 'passive', rarity: 'rare',
    effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.15 }] },
];

// ============================================================================
// ENEMY TYPES (8)
// ============================================================================

export const ENEMY_TYPES: EnemyType[] = [
  { type: 'small', hp: 30, speed: 80, damage: 10, score: 10, xp: 5, size: 12, color: '#ff4444', fireRate: 0 },
  { type: 'fast', hp: 20, speed: 160, damage: 8, score: 15, xp: 8, size: 10, color: '#ffaa00', fireRate: 0 },
  { type: 'tank', hp: 120, speed: 40, damage: 15, score: 30, xp: 15, size: 20, color: '#888888', fireRate: 2000 },
  { type: 'shooter', hp: 50, speed: 60, damage: 12, score: 25, xp: 12, size: 14, color: '#ff88ff', fireRate: 1500 },
  { type: 'splitter', hp: 60, speed: 70, damage: 10, score: 20, xp: 10, size: 16, color: '#44ff44', fireRate: 0, splits: 3 },
  { type: 'shielder', hp: 80, speed: 50, damage: 12, score: 35, xp: 18, size: 18, color: '#4488ff', fireRate: 2000, shieldHp: 50 },
  { type: 'kamikaze', hp: 15, speed: 250, damage: 40, score: 20, xp: 12, size: 10, color: '#ff0000', fireRate: 0 },
  { type: 'boss', hp: 500, speed: 30, damage: 20, score: 200, xp: 100, size: 40, color: '#ffaa00', fireRate: 800, isBoss: true },
];

// ============================================================================
// XP CURVE (30 levels)
// ============================================================================

export const XP_CURVE = [0, 80, 180, 320, 500, 750, 1050, 1400, 1850, 2400, 3050, 3800, 4700, 5750, 7000, 8500, 10200, 12200, 14600, 17500, 21000, 25000, 30000, 36000, 43000, 51000, 60000, 70000, 82000, 96000];

export const RARITY_WEIGHTS: Record<string, number> = { common: 50, uncommon: 35, rare: 15 };
