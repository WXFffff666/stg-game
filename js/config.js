/**
 * STG Game Configuration
 * Data-driven design: ALL game content defined here.
 * Engine code reads this config - adding content = adding data, ZERO engine changes.
 * 
 * Global namespace: window.GAME_CONFIG
 */

const GAME_CONFIG = {
  // ============ META ============
  VERSION: '1.0.0',

  // ============ BALANCE ============
  BALANCE: {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 900,
    PLAYER_BASE_HP: 100,
    PLAYER_BASE_SPEED: 280,
    PLAYER_INVINCIBLE_MS: 2000,
    PLAYER_HITBOX_RADIUS: 8,
    XP_PER_KILL_BASE: 10,
    XP_CURVE: [0, 80, 180, 320, 500, 750, 1050, 1400, 1850, 2400, 3050, 3800, 4700, 5750, 7000, 8500, 10200, 12200, 14600, 17500,
      21000, 25000, 30000, 36000, 43000, 51000, 60000, 70000, 82000, 96000, 112000, 130000, 150000, 172000, 197000, 225000,
      256000, 290000, 328000, 370000, 416000, 466000, 520000, 580000, 645000, 715000, 790000, 870000, 955000, 1045000
    ],
    DIFFICULTY_INTERVAL: 45000,
    DIFFICULTY_MULTIPLIER: 0.05,
    DIFFICULTY_BULLET_SPEED: 0.02,
    DIFFICULTY_ENEMY_HP: 0.04,
    DIFFICULTY_SPAWN_RATE: 0.05,
    ENEMY_BULLET_DAMAGE: 10,
    COLLISION_DAMAGE: 15,
    ITEM_DROP_CHANCE: 0.15,
    ITEM_LIFETIME: 10000,
    SCREEN_SHAKE_DECAY: 0.9,
    MAX_PARTICLES: 300,
    BOSS_SCORE_THRESHOLD: 5000,
    BOSS_INTERVAL_SCORE: 20000,
    COMBO_TIMEOUT: 3000,
    COMBO_MULTIPLIER: 0.1,
  },

  // ============ SCENES ============
  SCENES: {
    MENU: 'menu',
    CHARACTER_SELECT: 'characterSelect',
    GAMEPLAY: 'gameplay',
    LEVEL_UP: 'levelUp',
    GAME_OVER: 'gameOver',
    LEADERBOARD: 'leaderboard',
  },

  // ============ FACTIONS (10) ============
  FACTIONS: {
    attackSpeed: {
      id: 'attackSpeed', name: '⚡ 攻速流', color: '#ffdd00',
      description: '极致射速，弹幕如雨',
      baseStats: { attackSpeed: 0.4, attack: 0.85, hp: 100, speed: 300, critRate: 0.05, critMult: 1.5, bulletCount: 0 },
      icon: '⚡'
    },
    counter: {
      id: 'counter', name: '🛡️ 反伤流', color: '#ff6644',
      description: '挨打反弹，以守为攻',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 150, speed: 260, reflectDamage: 0.3, defense: 0.2, critRate: 0.05, critMult: 1.5 },
      icon: '🛡️'
    },
    crit: {
      id: 'crit', name: '💥 暴击流', color: '#ff0000',
      description: '一击必杀，刀刀暴击',
      baseStats: { attackSpeed: 1.0, attack: 1.2, hp: 90, speed: 290, critRate: 0.25, critMult: 3.0, critDamage: 0 },
      icon: '💥'
    },
    summon: {
      id: 'summon', name: '🛸 召唤流', color: '#aa66ff',
      description: '浮游炮环绕，火力压制',
      baseStats: { attackSpeed: 1.0, attack: 0.7, hp: 100, speed: 280, drones: 2, droneDamage: 0.6 },
      icon: '🛸'
    },
    elemental: {
      id: 'elemental', name: '🔥 元素流', color: '#ff8800',
      description: '火焰灼烧，持续伤害',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 105, speed: 285, burnDamage: 5, burnDuration: 2000, elementalBonus: 0.2 },
      icon: '🔥'
    },
    lifesteal: {
      id: 'lifesteal', name: '🩸 吸血流转', color: '#ff3366',
      description: '越战越勇，吸血续航',
      baseStats: { attackSpeed: 1.1, attack: 0.85, hp: 110, speed: 295, lifesteal: 0.12, maxHpBonus: 0.1 },
      icon: '🩸'
    },
    shield: {
      id: 'shield', name: '🔮 盾反流', color: '#44aaff',
      description: '护盾抵挡，反弹伤害',
      baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 130, speed: 270, shieldAmount: 40, shieldRegen: 1, shieldReflect: 0.5 },
      icon: '🔮'
    },
    poison: {
      id: 'poison', name: '☠️ 毒伤流', color: '#55cc44',
      description: '剧毒蔓延，缓慢死亡',
      baseStats: { attackSpeed: 1.0, attack: 0.75, hp: 105, speed: 285, poisonDamage: 8, poisonDuration: 3000, poisonSpread: 0.2 },
      icon: '☠️'
    },
    ice: {
      id: 'ice', name: '❄️ 冰控流', color: '#66ddff',
      description: '冰冻减速，掌控战场',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 100, speed: 290, slowChance: 0.35, slowAmount: 0.4, slowDuration: 2000, freezeChance: 0.05 },
      icon: '❄️'
    },
    barrage: {
      id: 'barrage', name: '🌊 弹幕流', color: '#ff66aa',
      description: '弹幕覆盖，范围压制',
      baseStats: { attackSpeed: 1.15, attack: 0.75, hp: 95, speed: 275, extraBullets: 2, bulletSize: 1.2, spreadMult: 1.3 },
      icon: '🌊'
    },
    gravity: {
      id: 'gravity', name: '🌌 重力流', color: '#8866cc',
      description: '重力场减速敌人，掌控战场节奏',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 110, speed: 275, gravityRadius: 200, gravitySlow: 0.35, gravityDamage: 5 },
      icon: '🌌'
    },
    void: {
      id: 'void', name: '🕳️ 虚空流', color: '#220044',
      description: '虚空吞噬，低血量敌人直接斩杀',
      baseStats: { attackSpeed: 1.1, attack: 1.0, hp: 95, speed: 290, voidExecuteThreshold: 0.15, voidExecuteChance: 0.2, voidDamage: 8 },
      icon: '🕳️'
    },
    thunder: {
      id: 'thunder', name: '🌩️ 雷电流', color: '#ffff00',
      description: '雷电连锁，电击传遍敌群',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 300, chainLightningChance: 0.3, chainCount: 3, chainDamage: 0.5 },
      icon: '🌩️'
    },
    wind: {
      id: 'wind', name: '🍃 风之流', color: '#88ff88',
      description: '疾风之力，击退敌人移速飙升',
      baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 100, speed: 330, windPushForce: 80, windPushRadius: 180, dodgeChance: 0.08 },
      icon: '🍃'
    },
    shadow: {
      id: 'shadow', name: '🌑 暗影流', color: '#111166',
      description: '暗影潜行，隐身闪避致命攻击',
      baseStats: { attackSpeed: 1.05, attack: 1.1, hp: 85, speed: 310, stealthDuration: 2000, stealthCooldown: 15000, stealthDamageBonus: 1.5, dodgeChance: 0.05 },
      icon: '🌑'
    },
    holy: {
      id: 'holy', name: '✨ 圣光流', color: '#ffffcc',
      description: '圣光照耀，治愈光环净化黑暗',
      baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 120, speed: 280, healAuraAmount: 1.5, healAuraRadius: 150, bossDamageBonus: 0.3 },
      icon: '✨'
    },
    blood: {
      id: 'blood', name: '🩸 血祭流', color: '#cc0000',
      description: '献祭生命，换取毁灭之力',
      baseStats: { attackSpeed: 1.05, attack: 1.4, hp: 70, speed: 295, bloodRageThreshold: 0.5, bloodRageDamage: 0.7, hpRegen: 1.0 },
      icon: '🩸'
    },
    magnet: {
      id: 'magnet', name: '🧲 磁力流', color: '#cc44cc',
      description: '磁力掌控，吸物品弹子弹',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 105, speed: 285, pickupRange: 120, bulletRepelRadius: 120, bulletRepelChance: 0.3 },
      icon: '🧲'
    },
    mirror: {
      id: 'mirror', name: '🪞 镜之流', color: '#aaccee',
      description: '镜像分身，转移伤害迷惑敌人',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 100, speed: 290, decoyCount: 1, decoyDuration: 4000, damageRedirect: 0.4 },
      icon: '🪞'
    },
    time: {
      id: 'time', name: '⏳ 时之流', color: '#ccbb88',
      description: '操纵时间，减速世界加速自身',
      baseStats: { attackSpeed: 0.9, attack: 0.85, hp: 100, speed: 285, timeSlowAmount: 0.3, timeSlowDuration: 3000, cooldownReduction: 0.2 },
      icon: '⏳'
    },
  },

  // ============ SKILLS (100) ============
  // type: 'passive' | 'active' | 'conditional'
  // faction: 'any' | specific faction id
  // rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  // rarity affects how often it appears in level-up choices
  SKILLS: [
    // --- Common Skills (Any faction) ---
    { id: 'atk_up_1', name: '攻击强化 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.12 }] },
    { id: 'atk_up_2', name: '攻击强化 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.25 }] },
    { id: 'atk_up_3', name: '攻击强化 III', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.45 }] },
    { id: 'atk_spd_1', name: '射速提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.12 }] },
    { id: 'atk_spd_2', name: '射速提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.22 }] },
    { id: 'atk_spd_3', name: '射速提升 III', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.35 }] },
    { id: 'hp_up_1', name: '生命提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'maxHp', op: 'add', value: 25 }] },
    { id: 'hp_up_2', name: '生命提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'maxHp', op: 'add', value: 50 }] },
    { id: 'hp_up_3', name: '生命提升 III', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'maxHp', op: 'add', value: 90 }] },
    { id: 'spd_up_1', name: '速度提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.1 }] },
    { id: 'spd_up_2', name: '速度提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.2 }] },
    { id: 'bullet_plus_1', name: '弹道+1', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'bulletCount', op: 'add', value: 1 }] },
    { id: 'bullet_plus_2', name: '弹道+2', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'bulletCount', op: 'add', value: 2 }] },
    { id: 'bullet_size_1', name: '弹幕增大 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bulletSize', op: 'multiply', value: 0.2 }] },
    { id: 'bullet_size_2', name: '弹幕增大 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'bulletSize', op: 'multiply', value: 0.4 }] },
    { id: 'bullet_spd_1', name: '弹速提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bulletSpeed', op: 'multiply', value: 0.15 }] },
    { id: 'bullet_spd_2', name: '弹速提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'bulletSpeed', op: 'multiply', value: 0.3 }] },
    { id: 'crit_up_1', name: '暴击率提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'critRate', op: 'add', value: 0.08 }] },
    { id: 'crit_up_2', name: '暴击率提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'critRate', op: 'add', value: 0.15 }] },
    { id: 'crit_dmg_1', name: '暴击伤害提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'critMult', op: 'add', value: 0.5 }] },
    { id: 'crit_dmg_2', name: '暴击伤害提升 II', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'critMult', op: 'add', value: 1.0 }] },
    { id: 'xp_boost', name: '经验加成', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.25 }] },
    { id: 'xp_boost_2', name: '经验加成+', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.5 }] },
    { id: 'magnet', name: '拾取范围+', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'pickupRange', op: 'add', value: 50 }] },
    { id: 'magnet_2', name: '拾取范围++', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'pickupRange', op: 'add', value: 100 }] },
    { id: 'heal_on_kill', name: '击杀回血', faction: 'any', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 3 }] },
    { id: 'heal_on_kill_2', name: '击杀回血+', faction: 'any', type: 'conditional', rarity: 'rare',
      trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 7 }] },
    { id: 'dmg_on_dodge', name: '闪避反击', faction: 'any', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', effects: [{ action: 'shockwave', damage: 25, radius: 150 }] },
    { id: 'shield_on_hit', name: '受击护盾', faction: 'any', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', cooldown: 15000, effects: [{ stat: 'shieldAmount', op: 'add', value: 20, duration: 5000 }] },
    { id: 'shockwave', name: '冲击波', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 8000, effects: [{ action: 'shockwave', damage: 40, radius: 200 }] },
    { id: 'shockwave_2', name: '冲击波+', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 6000, effects: [{ action: 'shockwave', damage: 80, radius: 280 }] },
    { id: 'lightning_strike', name: '天雷', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 10000, effects: [{ action: 'lightning', damage: 60, count: 3 }] },
    { id: 'lightning_strike_2', name: '天雷+', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 8000, effects: [{ action: 'lightning', damage: 120, count: 5 }] },
    { id: 'time_slow', name: '时间减速', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 30000, effects: [{ action: 'timeSlow', amount: 0.4, duration: 4000 }] },
    { id: 'invincible_burst', name: '无敌爆发', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 45000, effects: [{ action: 'invincible', duration: 3000 }, { stat: 'attack', op: 'multiply', value: 0.5, duration: 3000 }] },

    // --- Attack Speed Faction Skills ---
    { id: 'as_dual_wield', name: '双持射击', faction: 'attackSpeed', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'bulletCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: -0.1 }] },
    { id: 'as_frenzy', name: '狂暴', faction: 'attackSpeed', type: 'conditional', rarity: 'rare',
      trigger: 'onKill', duration: 3000, effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.3 }] },
    { id: 'as_machine_gun', name: '机枪模式', faction: 'attackSpeed', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.4 }, { stat: 'attack', op: 'multiply', value: -0.15 }] },
    { id: 'as_ricochet', name: '弹射弹', faction: 'attackSpeed', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'ricochet', op: 'set', value: 2 }] },
    { id: 'as_unload', name: '全弹发射', faction: 'attackSpeed', type: 'active', rarity: 'epic',
      cooldown: 20000, effects: [{ action: 'burstFire', bulletCount: 36, duration: 500 }] },

    // --- Counter Faction Skills ---
    { id: 'ct_thorns', name: '荆棘甲', faction: 'counter', type: 'passive', rarity: 'common',
      effects: [{ stat: 'reflectDamage', op: 'add', value: 0.15 }] },
    { id: 'ct_thorns_2', name: '荆棘甲+', faction: 'counter', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'reflectDamage', op: 'add', value: 0.3 }] },
    { id: 'ct_fortify', name: '防御强化', faction: 'counter', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'defense', op: 'add', value: 0.15 }] },
    { id: 'ct_retaliate', name: '反击风暴', faction: 'counter', type: 'conditional', rarity: 'rare',
      trigger: 'onHit', effects: [{ action: 'counterStrike', damage: 30, radius: 120 }] },
    { id: 'ct_last_stand', name: '背水一战', faction: 'counter', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.5, condition: 'lowHp' }, { stat: 'defense', op: 'add', value: 0.3, condition: 'lowHp' }] },

    // --- Crit Faction Skills ---
    { id: 'cr_deadly', name: '致命一击', faction: 'crit', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'critMult', op: 'add', value: 1.0 }] },
    { id: 'cr_execute', name: '斩杀', faction: 'crit', type: 'conditional', rarity: 'rare',
      trigger: 'onHit', effects: [{ action: 'execute', threshold: 0.2, damage: 9999 }] },
    { id: 'cr_chain_crit', name: '连锁暴击', faction: 'crit', type: 'conditional', rarity: 'rare',
      trigger: 'onCrit', effects: [{ action: 'chainDamage', damage: 0.5, radius: 150 }] },
    { id: 'cr_guaranteed', name: '必杀', faction: 'crit', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'critRate', op: 'add', value: 0.2 }, { stat: 'guaranteedCrit', op: 'set', value: 5 }] },

    // --- Summon Faction Skills ---
    { id: 'sm_drone_plus', name: '浮游炮+1', faction: 'summon', type: 'passive', rarity: 'common',
      effects: [{ stat: 'drones', op: 'add', value: 1 }] },
    { id: 'sm_drone_plus_2', name: '浮游炮+2', faction: 'summon', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'drones', op: 'add', value: 2 }] },
    { id: 'sm_drone_dmg', name: '浮游炮强化', faction: 'summon', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'droneDamage', op: 'add', value: 0.25 }] },
    { id: 'sm_drone_speed', name: '浮游炮加速', faction: 'summon', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'droneFireRate', op: 'multiply', value: -0.2 }] },
    { id: 'sm_drone_barrier', name: '浮游炮屏障', faction: 'summon', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'droneBlock', op: 'set', value: true }] },

    // --- Elemental Faction Skills ---
    { id: 'el_burn', name: '灼烧', faction: 'elemental', type: 'passive', rarity: 'common',
      effects: [{ stat: 'burnDamage', op: 'add', value: 5 }, { stat: 'burnDuration', op: 'add', value: 1000 }] },
    { id: 'el_inferno', name: '烈焰风暴', faction: 'elemental', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'fireNova', damage: 50, radius: 250, burnDuration: 4000 }] },
    { id: 'el_fire_trail', name: '火焰路径', faction: 'elemental', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'fireTrail', op: 'set', value: true }] },
    { id: 'el_explosion', name: '击杀爆炸', faction: 'elemental', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'explosion', damage: 25, radius: 100 }] },

    // --- Lifesteal Faction Skills ---
    { id: 'ls_vampire', name: '吸血鬼', faction: 'lifesteal', type: 'passive', rarity: 'common',
      effects: [{ stat: 'lifesteal', op: 'add', value: 0.08 }] },
    { id: 'ls_vampire_2', name: '吸血鬼+', faction: 'lifesteal', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'lifesteal', op: 'add', value: 0.15 }] },
    { id: 'ls_blood_rage', name: '血怒', faction: 'lifesteal', type: 'conditional', rarity: 'rare',
      trigger: 'onKill', duration: 4000, effects: [{ stat: 'attack', op: 'multiply', value: 0.3 }, { stat: 'speed', op: 'multiply', value: 0.2 }] },
    { id: 'ls_overheal', name: '过量治疗', faction: 'lifesteal', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'overheal', op: 'set', value: 0.3 }] },

    // --- Shield Faction Skills ---
    { id: 'sh_bigger', name: '护盾强化', faction: 'shield', type: 'passive', rarity: 'common',
      effects: [{ stat: 'shieldAmount', op: 'add', value: 25 }] },
    { id: 'sh_regen', name: '护盾再生', faction: 'shield', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'shieldRegen', op: 'add', value: 1.5 }] },
    { id: 'sh_reflect', name: '护盾反射', faction: 'shield', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'shieldReflect', op: 'add', value: 0.5 }] },
    { id: 'sh_burst', name: '护盾爆破', faction: 'shield', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'shieldBurst', damage: 60, radius: 200 }] },

    // --- Poison Faction Skills ---
    { id: 'ps_venom', name: '剧毒', faction: 'poison', type: 'passive', rarity: 'common',
      effects: [{ stat: 'poisonDamage', op: 'add', value: 5 }, { stat: 'poisonDuration', op: 'add', value: 1000 }] },
    { id: 'ps_contagion', name: '传染', faction: 'poison', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'poisonSpread', damage: 15, radius: 120, duration: 4000 }] },
    { id: 'ps_weakness', name: '虚弱毒素', faction: 'poison', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'poisonWeaken', op: 'set', value: 0.2 }] },
    { id: 'ps_plague', name: '瘟疫', faction: 'poison', type: 'active', rarity: 'epic',
      cooldown: 25000, effects: [{ action: 'plague', damage: 20, duration: 8000, radius: 300 }] },

    // --- Ice Faction Skills ---
    { id: 'ic_frost', name: '冰霜附魔', faction: 'ice', type: 'passive', rarity: 'common',
      effects: [{ stat: 'slowChance', op: 'add', value: 0.15 }, { stat: 'slowAmount', op: 'add', value: 0.1 }] },
    { id: 'ic_freeze', name: '冰冻', faction: 'ice', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'freeze', chance: 0.08, duration: 1500 }] },
    { id: 'ic_blizzard', name: '暴风雪', faction: 'ice', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'blizzard', damage: 5, duration: 5000, radius: 350 }] },
    { id: 'ic_shatter', name: '碎冰', faction: 'ice', type: 'conditional', rarity: 'rare',
      trigger: 'onKillFrozen', effects: [{ action: 'explosion', damage: 40, radius: 150 }] },

    // --- Barrage Faction Skills ---
    { id: 'bg_spread', name: '弹幕扩散', faction: 'barrage', type: 'passive', rarity: 'common',
      effects: [{ stat: 'spreadMult', op: 'multiply', value: 0.2 }] },
    { id: 'bg_wide', name: '范围扩大', faction: 'barrage', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'bulletSize', op: 'multiply', value: 0.3 }] },
    { id: 'bg_barrage', name: '弹幕风暴', faction: 'barrage', type: 'active', rarity: 'epic',
      cooldown: 25000, effects: [{ action: 'bulletStorm', bulletCount: 60, duration: 2000, spreadAngle: 360 }] },
    { id: 'bg_piercing', name: '穿透弹幕', faction: 'barrage', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'pierceCount', op: 'add', value: 2 }] },

    // --- More Generic Skills ---
    { id: 'dodge_1', name: '闪避提升 I', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dodgeChance', op: 'add', value: 0.06 }] },
    { id: 'dodge_2', name: '闪避提升 II', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'dodgeChance', op: 'add', value: 0.12 }] },
    { id: 'dodge_3', name: '闪避提升 III', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'dodgeChance', op: 'add', value: 0.2 }] },
    { id: 'lucky', name: '幸运', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'dropRate', op: 'multiply', value: 0.3 }] },
    { id: 'treasure', name: '寻宝', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'dropRate', op: 'multiply', value: 0.6 }] },
    { id: 'combo_master', name: '连击大师', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'comboMultiplier', op: 'add', value: 0.15 }] },
    { id: 'resilience', name: '韧性', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'invincibleTime', op: 'add', value: 500 }] },
    { id: 'second_wind', name: '重生', faction: 'any', type: 'passive', rarity: 'legendary',
      effects: [{ stat: 'reviveCount', op: 'add', value: 1 }] },
    { id: 'glass_cannon', name: '玻璃大炮', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.5 }, { stat: 'maxHp', op: 'multiply', value: -0.3 }] },
    { id: 'tank', name: '钢铁之躯', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'maxHp', op: 'add', value: 80 }, { stat: 'defense', op: 'add', value: 0.1 }] },
    { id: 'regen', name: '生命回复', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'hpRegen', op: 'add', value: 0.5 }] },
    { id: 'regen_2', name: '生命回复+', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'hpRegen', op: 'add', value: 1.2 }] },
    { id: 'bulwark', name: '壁垒', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'defense', op: 'add', value: 0.1 }] },
    { id: 'vamp_aura', name: '吸血光环', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'lifesteal', op: 'add', value: 0.06 }] },
    { id: 'speed_demon', name: '速度狂魔', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.08 }] },
    { id: 'precise', name: '精准', faction: 'any', type: 'passive', rarity: 'common',
      effects: [{ stat: 'critRate', op: 'add', value: 0.04 }, { stat: 'critMult', op: 'add', value: 0.2 }] },
    { id: 'rampage', name: '暴走', faction: 'any', type: 'conditional', rarity: 'rare',
      trigger: 'onKill', duration: 4000, effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }, { stat: 'speed', op: 'multiply', value: 0.15 }] },
    { id: 'avenger', name: '复仇', faction: 'any', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', duration: 5000, effects: [{ stat: 'attack', op: 'multiply', value: 0.25 }] },
    { id: 'scavenger', name: '拾荒者', faction: 'any', type: 'conditional', rarity: 'common',
      trigger: 'onPickup', effects: [{ stat: 'hp', op: 'add', value: 5 }] },
    { id: 'berserk', name: '狂战士', faction: 'any', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.3, condition: 'lowHp' }, { stat: 'attackSpeed', op: 'multiply', value: -0.2, condition: 'lowHp' }] },
    { id: 'greed', name: '贪婪', faction: 'any', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'scoreMultiplier', op: 'multiply', value: 0.2 }] },
    { id: 'greed_2', name: '贪婪+', faction: 'any', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'scoreMultiplier', op: 'multiply', value: 0.4 }] },
    { id: 'overdrive', name: '超载', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 40000, effects: [{ action: 'overdrive', damage: 150, duration: 6000 }] },
    { id: 'orbital_strike', name: '轨道打击', faction: 'any', type: 'active', rarity: 'legendary',
      cooldown: 60000, effects: [{ action: 'orbitalStrike', damage: 300, radius: 400, count: 5 }] },
    { id: 'clone', name: '分身', faction: 'any', type: 'active', rarity: 'legendary',
      cooldown: 50000, effects: [{ action: 'clone', count: 2, duration: 8000 }] },

    // ============ NEW: Gravity Faction Skills (5) ============
    { id: 'gv_weight', name: '重力增幅', faction: 'gravity', type: 'passive', rarity: 'common',
      effects: [{ stat: 'gravityRadius', op: 'add', value: 50 }, { stat: 'gravitySlow', op: 'add', value: 0.1 }] },
    { id: 'gv_crush', name: '重力碾压', faction: 'gravity', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'gravityCrush', damage: 30, radius: 180, threshold: 0.3 }] },
    { id: 'gv_singularity', name: '奇点', faction: 'gravity', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'singularity', damage: 8, duration: 4000, radius: 200, pullForce: 120 }] },
    { id: 'gv_orbit', name: '轨道捕获', faction: 'gravity', type: 'passive', rarity: 'epic',
      effects: [{ action: 'orbitCapture', damage: 12, orbitRadius: 160, orbitSpeed: 1.5, maxOrbits: 4 }] },
    { id: 'gv_blackHole', name: '黑洞', faction: 'gravity', type: 'active', rarity: 'legendary',
      cooldown: 45000, effects: [{ action: 'blackHole', damage: 20, duration: 5000, radius: 300, pullForce: 200, finalExplosion: 150 }] },

    // ============ NEW: Void Faction Skills (5) ============
    { id: 'vd_voidTouch', name: '虚空触碰', faction: 'void', type: 'passive', rarity: 'common',
      effects: [{ stat: 'voidExecuteThreshold', op: 'add', value: 0.05 }, { stat: 'voidExecuteChance', op: 'add', value: 0.08 }] },
    { id: 'vd_consume', name: '虚空吞噬', faction: 'void', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 6, condition: 'voidExecuted' }] },
    { id: 'vd_voidRift', name: '虚空裂隙', faction: 'void', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'voidRift', damage: 15, duration: 4000, radius: 180, executeChance: 0.3 }] },
    { id: 'vd_annihilate', name: '湮灭', faction: 'void', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'voidExecuteThreshold', op: 'add', value: 0.1 }, { stat: 'attack', op: 'multiply', value: 0.15 }] },
    { id: 'vd_abyss', name: '深渊之门', faction: 'void', type: 'active', rarity: 'legendary',
      cooldown: 50000, effects: [{ action: 'abyssGate', damage: 40, duration: 6000, radius: 350, executeThreshold: 0.3, pullForce: 150 }] },

    // ============ NEW: Thunder Faction Skills (5) ============
    { id: 'th_charged', name: '充能', faction: 'thunder', type: 'passive', rarity: 'common',
      effects: [{ stat: 'chainCount', op: 'add', value: 1 }, { stat: 'chainLightningChance', op: 'add', value: 0.1 }] },
    { id: 'th_arc', name: '电弧跳跃', faction: 'thunder', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'chainLightning', damage: 25, chainCount: 3, chainRange: 200 }] },
    { id: 'th_thunderStorm', name: '雷暴', faction: 'thunder', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'thunderStorm', damage: 50, count: 8, duration: 4000, radius: 350 }] },
    { id: 'th_overcharge', name: '过载', faction: 'thunder', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'chainDamage', op: 'multiply', value: 0.25 }, { stat: 'chainCount', op: 'add', value: 2 }] },
    { id: 'th_thorWrath', name: '雷神之怒', faction: 'thunder', type: 'active', rarity: 'legendary',
      cooldown: 40000, effects: [{ action: 'thorWrath', damage: 80, duration: 6000, chainCount: 10, radius: 400, interval: 300 }] },

    // ============ NEW: Wind Faction Skills (5) ============
    { id: 'wd_tailwind', name: '顺风', faction: 'wind', type: 'passive', rarity: 'common',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.12 }, { stat: 'dodgeChance', op: 'add', value: 0.04 }] },
    { id: 'wd_gust', name: '阵风', faction: 'wind', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', effects: [{ action: 'gust', damage: 20, pushForce: 150, radius: 200 }] },
    { id: 'wd_tornado', name: '龙卷风', faction: 'wind', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'tornado', damage: 15, duration: 5000, radius: 80, travelSpeed: 120, pullForce: 100 }] },
    { id: 'wd_cyclone', name: '气旋护体', faction: 'wind', type: 'active', rarity: 'epic',
      cooldown: 25000, effects: [{ action: 'cyclone', damage: 10, duration: 6000, radius: 150, pushForce: 80, bulletReflect: true }] },
    { id: 'wd_tempest', name: '暴风眼', faction: 'wind', type: 'active', rarity: 'legendary',
      cooldown: 40000, effects: [{ action: 'tempest', damage: 25, duration: 5000, radius: 400, pushForce: 200, vacuum: true }] },

    // ============ NEW: Shadow Faction Skills (5) ============
    { id: 'sd_darkCloak', name: '暗影斗篷', faction: 'shadow', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dodgeChance', op: 'add', value: 0.08 }, { stat: 'stealthDuration', op: 'add', value: 500 }] },
    { id: 'sd_ambush', name: '暗影伏击', faction: 'shadow', type: 'conditional', rarity: 'uncommon',
      trigger: 'onStealthEnd', effects: [{ stat: 'attack', op: 'multiply', value: 0.5, duration: 3000 }] },
    { id: 'sd_shadowStep', name: '暗影步', faction: 'shadow', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'shadowStep', damage: 60, radius: 150, teleportRange: 300 }] },
    { id: 'sd_nightfall', name: '夜幕降临', faction: 'shadow', type: 'active', rarity: 'epic',
      cooldown: 35000, effects: [{ action: 'nightfall', duration: 5000, enemySlow: 0.4, playerAttackBoost: 1.3, radius: 500 }] },
    { id: 'sd_assassinate', name: '暗杀', faction: 'shadow', type: 'active', rarity: 'legendary',
      cooldown: 30000, effects: [{ action: 'assassinate', damage: 500, teleportRange: 400, executeThreshold: 0.4 }] },

    // ============ NEW: Holy Faction Skills (5) ============
    { id: 'hy_blessing', name: '祝福光环', faction: 'holy', type: 'passive', rarity: 'common',
      effects: [{ stat: 'healAuraAmount', op: 'add', value: 0.8 }, { stat: 'healAuraRadius', op: 'add', value: 40 }] },
    { id: 'hy_smite', name: '惩戒', faction: 'holy', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'smite', damage: 50, bossMultiplier: 2.5 }] },
    { id: 'hy_holyNova', name: '圣光新星', faction: 'holy', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'holyNova', damage: 60, healAmount: 30, radius: 250 }] },
    { id: 'hy_consecration', name: '奉献', faction: 'holy', type: 'active', rarity: 'epic',
      cooldown: 25000, effects: [{ action: 'consecration', damage: 12, duration: 6000, radius: 200, healPerSec: 3 }] },
    { id: 'hy_judgment', name: '审判', faction: 'holy', type: 'active', rarity: 'legendary',
      cooldown: 50000, effects: [{ action: 'judgment', damage: 300, radius: 300, bossDamage: 600, stunDuration: 2000 }] },

    // ============ NEW: Blood Faction Skills (5) ============
    { id: 'bd_bloodletting', name: '放血', faction: 'blood', type: 'passive', rarity: 'common',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.1, condition: 'lowHp' }, { stat: 'attackSpeed', op: 'multiply', value: -0.15, condition: 'lowHp' }] },
    { id: 'bd_bloodFrenzy', name: '血怒', faction: 'blood', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', duration: 4000, effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }, { stat: 'attackSpeed', op: 'multiply', value: -0.15 }] },
    { id: 'bd_bloodRitual', name: '血祭仪式', faction: 'blood', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'bloodRitual', hpCost: 20, damageBoost: 1.5, duration: 5000, radius: 250 }] },
    { id: 'bd_crimsonPact', name: '血之契约', faction: 'blood', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.4, condition: 'lowHp' }, { stat: 'lifesteal', op: 'add', value: 0.15, condition: 'lowHp' }] },
    { id: 'bd_bloodNova', name: '血爆', faction: 'blood', type: 'active', rarity: 'legendary',
      cooldown: 35000, effects: [{ action: 'bloodNova', hpCostRatio: 0.3, damagePerHp: 2, radius: 350 }] },

    // ============ NEW: Magnet Faction Skills (5) ============
    { id: 'mg_polarize', name: '极化', faction: 'magnet', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bulletRepelChance', op: 'add', value: 0.1 }, { stat: 'bulletRepelRadius', op: 'add', value: 30 }] },
    { id: 'mg_attract', name: '物品吸引', faction: 'magnet', type: 'conditional', rarity: 'uncommon',
      trigger: 'onPickup', effects: [{ action: 'attract', pullRadius: 250, pullForce: 200 }] },
    { id: 'mg_emp', name: '电磁脉冲', faction: 'magnet', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'emp', radius: 300, destroyBullets: true, damage: 40 }] },
    { id: 'mg_magneticField', name: '磁场', faction: 'magnet', type: 'active', rarity: 'epic',
      cooldown: 30000, effects: [{ action: 'magneticField', duration: 6000, radius: 220, bulletDeflect: true, itemPull: true }] },
    { id: 'mg_repulsion', name: '斥力场', faction: 'magnet', type: 'active', rarity: 'legendary',
      cooldown: 40000, effects: [{ action: 'repulsionField', damage: 100, radius: 350, pushForce: 300, bulletReflect: true }] },

    // ============ NEW: Mirror Faction Skills (5) ============
    { id: 'mr_reflection', name: '反射', faction: 'mirror', type: 'passive', rarity: 'common',
      effects: [{ stat: 'damageRedirect', op: 'add', value: 0.1 }, { stat: 'decoyDuration', op: 'add', value: 1000 }] },
    { id: 'mr_mirage', name: '幻象', faction: 'mirror', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', cooldown: 10000, effects: [{ action: 'createDecoy', count: 1, duration: 3000 }] },
    { id: 'mr_hallOfMirrors', name: '镜厅', faction: 'mirror', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'hallOfMirrors', decoyCount: 3, duration: 5000, decoyDamage: 0.5 }] },
    { id: 'mr_shatter', name: '镜碎', faction: 'mirror', type: 'conditional', rarity: 'epic',
      trigger: 'onDecoyDestroy', effects: [{ action: 'explosion', damage: 80, radius: 180 }] },
    { id: 'mr_kaleidoscope', name: '万花筒', faction: 'mirror', type: 'active', rarity: 'legendary',
      cooldown: 45000, effects: [{ action: 'kaleidoscope', decoyCount: 5, duration: 6000, reflectDamage: 0.5, decoyDamage: 0.6 }] },

    // ============ NEW: Time Faction Skills (5) ============
    { id: 'tm_haste', name: '加速', faction: 'time', type: 'passive', rarity: 'common',
      effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.1 }, { stat: 'speed', op: 'multiply', value: 0.08 }] },
    { id: 'tm_rewind', name: '时间倒流', faction: 'time', type: 'conditional', rarity: 'uncommon',
      trigger: 'onLethalDamage', cooldown: 60000, effects: [{ action: 'rewind', healPercent: 0.3 }] },
    { id: 'tm_timeFreeze', name: '时间冻结', faction: 'time', type: 'active', rarity: 'rare',
      cooldown: 30000, effects: [{ action: 'timeFreeze', duration: 2500, radius: 450 }] },
    { id: 'tm_paradox', name: '时空悖论', faction: 'time', type: 'passive', rarity: 'epic',
      effects: [{ action: 'paradox', doubleCastChance: 0.3 }] },
    { id: 'tm_chronosphere', name: '时空领域', faction: 'time', type: 'active', rarity: 'legendary',
      cooldown: 50000, effects: [{ action: 'chronosphere', timeSlow: 0.3, duration: 5000, speedBoost: 1.5, cooldownReset: true }] },

    // ============ NEW: General Active/Visual Skills (50) ============
    // --- Meteor / Fire ---
    { id: 'meteorShower', name: '流星雨', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 30000, effects: [{ action: 'meteorShower', damage: 80, count: 12, duration: 4000, radius: 60, fallRadius: 350 }] },
    { id: 'firePillar', name: '火柱', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 10000, effects: [{ action: 'firePillar', damage: 50, duration: 2000, radius: 60, count: 3 }] },
    { id: 'pyroclasm', name: '烈焰波', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'pyroclasm', damage: 70, radius: 300, expanding: true, duration: 2000 }] },
    { id: 'inferno', name: '炼狱', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 35000, effects: [{ action: 'inferno', damage: 25, duration: 5000, radius: 280, burnDamage: 10, burnDuration: 3000 }] },
    { id: 'flameWave', name: '火焰波', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 12000, effects: [{ action: 'flameWave', damage: 45, radius: 350, angle: 180 }] },

    // --- Ice / Frost ---
    { id: 'frostNova', name: '冰霜新星', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'frostNova', damage: 55, freezeDuration: 2000, radius: 220 }] },
    { id: 'iceWall', name: '冰墙', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 14000, effects: [{ action: 'iceWall', duration: 4000, wallWidth: 300, hp: 200, blocksBullets: true }] },
    { id: 'hailstorm', name: '冰雹风暴', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'hailstorm', damage: 35, count: 20, duration: 3000, radius: 300, slowAmount: 0.3 }] },
    { id: 'frostArmor', name: '冰霜护甲', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'frostArmor', duration: 6000, freezeAttackers: true, freezeDuration: 1500, defense: 0.2 }] },

    // --- Lightning / Thunder ---
    { id: 'thunderbolt', name: '雷霆一击', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 9000, effects: [{ action: 'thunderbolt', damage: 120, radius: 100, stunDuration: 1000 }] },
    { id: 'lightningDash', name: '闪电突进', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 10000, effects: [{ action: 'lightningDash', damage: 60, trailDamage: 20, distance: 350, trailDuration: 1500 }] },
    { id: 'staticField', name: '静电力场', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'staticField', damage: 10, duration: 5000, radius: 180, tickRate: 300 }] },
    { id: 'thunderclap', name: '雷震', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 11000, effects: [{ action: 'thunderclap', damage: 65, radius: 250, stunDuration: 800 }] },

    // --- Poison / Toxic ---
    { id: 'poisonCloud', name: '毒云', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 13000, effects: [{ action: 'poisonCloud', damage: 12, duration: 5000, radius: 160, poisonDamage: 8, poisonDuration: 3000 }] },
    { id: 'toxicNova', name: '剧毒新星', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'toxicNova', damage: 40, radius: 280, poisonDamage: 15, poisonDuration: 4000 }] },
    { id: 'acidRain', name: '酸雨', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 30000, effects: [{ action: 'acidRain', damage: 18, duration: 5000, radius: 350, defenseShred: 0.3 }] },
    { id: 'venomStrike', name: '剧毒打击', faction: 'any', type: 'active', rarity: 'common',
      cooldown: 8000, effects: [{ action: 'venomStrike', damage: 80, poisonDamage: 20, poisonDuration: 4000, singleTarget: true }] },

    // --- Summon / Minions ---
    { id: 'summonTurret', name: '召唤炮台', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 20000, effects: [{ action: 'summonTurret', damage: 10, duration: 8000, fireRate: 400, count: 1 }] },
    { id: 'spiritWolves', name: '召唤狼魂', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'summonWolves', damage: 25, duration: 10000, count: 2, speed: 200 }] },
    { id: 'landmine', name: '地雷', faction: 'any', type: 'active', rarity: 'common',
      cooldown: 6000, effects: [{ action: 'landmine', damage: 100, radius: 120, count: 3, duration: 15000 }] },
    { id: 'arcaneMissiles', name: '奥术飞弹', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 10000, effects: [{ action: 'arcaneMissiles', damage: 30, count: 8, homing: true, homingStrength: 0.08 }] },

    // --- Defense / Barrier ---
    { id: 'barrier', name: '防护屏障', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 20000, effects: [{ action: 'barrier', shieldAmount: 60, duration: 5000, radius: 100 }] },
    { id: 'phalanx', name: '旋转护盾', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'phalanx', shieldOrbs: 4, duration: 8000, orbDamage: 20, blockBullets: true }] },
    { id: 'runicShield', name: '符文护盾', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 30000, effects: [{ action: 'runicShield', shieldAmount: 100, duration: 8000, reflectDamage: 0.3, healOnBlock: 5 }] },
    { id: 'reverseBullets', name: '子弹反转', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'reverseBullets', duration: 3000, radius: 350, reflectedDamage: 1.5 }] },

    // --- Mobility / Teleport ---
    { id: 'teleport', name: '瞬移', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 8000, effects: [{ action: 'teleport', range: 350, damage: 40, radius: 120 }] },
    { id: 'warpStrike', name: '折跃打击', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'warpStrike', damage: 150, stunDuration: 1000, teleportToEnemy: true }] },
    { id: 'smokeBomb', name: '烟雾弹', faction: 'any', type: 'active', rarity: 'common',
      cooldown: 10000, effects: [{ action: 'smokeBomb', duration: 3000, radius: 180, stealth: true, enemySlow: 0.3 }] },
    { id: 'phantomStrike', name: '幻影打击', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'phantomStrike', damage: 50, count: 5, dashDistance: 100, slashRadius: 80 }] },

    // --- AOE / Explosion ---
    { id: 'chainExplosion', name: '连锁爆破', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 28000, effects: [{ action: 'chainExplosion', damage: 100, radius: 150, chainCount: 8, chainRange: 180 }] },
    { id: 'doom', name: '毁灭', faction: 'any', type: 'active', rarity: 'legendary',
      cooldown: 60000, effects: [{ action: 'doom', damage: 500, radius: 400, delay: 3000, screenShake: true }] },
    { id: 'earthquake', name: '地震', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'earthquake', damage: 35, duration: 3000, radius: 400, tickRate: 400, stunChance: 0.3 }] },
    { id: 'plasmaBall', name: '等离子球', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 12000, effects: [{ action: 'plasmaBall', damage: 60, speed: 150, radius: 80, duration: 6000, pierce: true }] },

    // --- Special / Unique ---
    { id: 'laserSweep', name: '激光扫射', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'laserSweep', damage: 15, duration: 3000, sweepAngle: 180, beamLength: 500, tickRate: 100 }] },
    { id: 'deathMark', name: '死亡标记', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 12000, effects: [{ action: 'deathMark', damageMultiplier: 2.0, duration: 5000, targetCount: 3 }] },
    { id: 'bladeStorm', name: '剑刃风暴', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 30000, effects: [{ action: 'bladeStorm', damage: 15, duration: 4000, radius: 160, tickRate: 150, pierce: true }] },
    { id: 'sunburst', name: '烈日光爆', faction: 'any', type: 'active', rarity: 'epic',
      cooldown: 35000, effects: [{ action: 'sunburst', damage: 120, radius: 300, blindDuration: 2000, healAmount: 40 }] },
    { id: 'avalanche', name: '雪崩', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'avalanche', damage: 70, duration: 3000, radius: 250, pushForce: 100, slowAmount: 0.5 }] },
    { id: 'soulDrain', name: '灵魂吸取', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 15000, effects: [{ action: 'soulDrain', damage: 30, lifesteal: 0.5, duration: 3000, radius: 200 }] },
    { id: 'voidSphere', name: '虚空球', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 10000, effects: [{ action: 'voidSphere', damage: 25, speed: 100, radius: 60, duration: 5000, pullForce: 60 }] },
    { id: 'enrage', name: '狂怒', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'enrage', attackBoost: 1.4, speedBoost: 1.3, duration: 5000, takeMoreDamage: 0.2 }] },
    { id: 'healingWard', name: '治疗守卫', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 20000, effects: [{ action: 'healingWard', healPerSec: 4, duration: 8000, radius: 200 }] },
    { id: 'lightningRod', name: '避雷针', faction: 'any', type: 'active', rarity: 'uncommon',
      cooldown: 10000, effects: [{ action: 'lightningRod', damage: 50, duration: 5000, radius: 100, strikeInterval: 800, targetRandomEnemy: true }] },
    { id: 'frozenComet', name: '冰彗星', faction: 'any', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'frozenComet', damage: 130, radius: 120, freezeDuration: 2500, impactDamage: 60, splashRadius: 80 }] },
    { id: 'whirlwind', name: '旋风斩', faction: 'any', type: 'active', rarity: 'common',
      cooldown: 9000, effects: [{ action: 'whirlwind', damage: 20, duration: 2000, radius: 120, tickRate: 200 }] },

    // ---- Fused Skills (created via fusion system) ----
    { id: 'fusion_plagueBlizzard', name: '瘟疫冰暴', faction: 'any', type: 'active', rarity: 'legendary',
      fused: true, cooldown: 20000,
      effects: [{ action: 'plagueBlizzard', damage: 8, duration: 6000, radius: 380, poisonDamage: 10, poisonDuration: 4000, slowAmount: 0.5 }] },
    { id: 'fusion_stormFire', name: '风暴烈焰', faction: 'any', type: 'active', rarity: 'legendary',
      fused: true, cooldown: 18000,
      effects: [{ action: 'stormFire', damage: 15, chainCount: 4, chainRange: 160, burnDamage: 12, burnDuration: 3000 }] },
    { id: 'fusion_vampiricShield', name: '吸血护盾', faction: 'any', type: 'active', rarity: 'legendary',
      fused: true, cooldown: 25000,
      effects: [{ action: 'vampiricShield', shieldAmount: 60, duration: 10000, lifestealOnHit: 0.15, reflectDamage: 0.4 }] },
  ],

  // ============ WEAPONS (20) ============
  // rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  WEAPONS: {
    normal: {
      id: 'normal', name: '标准弹', icon: '🔫', rarity: 'common',
      description: '标准直射弹幕',
      pattern: 'normal', fireRate: 350, damage: 8, bulletSpeed: 550, bulletSize: 3,
      bulletColor: '#ffff00', trailColor: '#ffaa00',
    },
    homing: {
      id: 'homing', name: '追踪弹', icon: '🎯', rarity: 'uncommon',
      description: '自动追踪最近敌人',
      pattern: 'homing', fireRate: 550, damage: 14, bulletSpeed: 380, bulletSize: 4,
      homingStrength: 0.05, homingRange: 300, bulletColor: '#ff44ff', trailColor: '#cc22cc',
    },
    laser: {
      id: 'laser', name: '激光炮', icon: '⚡', rarity: 'uncommon',
      description: '超高射速直线光束',
      pattern: 'laser', fireRate: 80, damage: 3, bulletSpeed: 1200, bulletSize: 2,
      beamWidth: 3, beamLength: 600, bulletColor: '#00ffff', trailColor: '#0088ff',
    },
    spread: {
      id: 'spread', name: '散射弹', icon: '💫', rarity: 'common',
      description: '扇形散射多发弹幕',
      pattern: 'spread', fireRate: 600, damage: 7, bulletSpeed: 450, bulletSize: 3,
      bulletCount: 5, spreadAngle: 25, bulletColor: '#ff8844', trailColor: '#ff4400',
    },
    orbital: {
      id: 'orbital', name: '浮游炮', icon: '🛰️', rarity: 'rare',
      description: '环绕浮游炮自动射击',
      pattern: 'orbital', fireRate: 450, damage: 5, bulletSpeed: 500, bulletSize: 2,
      orbitRadius: 70, orbitSpeed: 2.5, orbitCount: 4, bulletColor: '#88ddff', trailColor: '#4488cc',
    },
    arc: {
      id: 'arc', name: '电弧链', icon: '⚡', rarity: 'rare',
      description: '雷电链式传导伤害',
      pattern: 'arc', fireRate: 700, damage: 18, chainCount: 3, chainRange: 180,
      chainDamageFalloff: 0.3, bulletColor: '#88ffff', trailColor: '#44aaff',
    },
    boomerang: {
      id: 'boomerang', name: '回旋镖', icon: '🪃', rarity: 'uncommon',
      description: '飞出后回旋造成双段伤害',
      pattern: 'boomerang', fireRate: 650, damage: 22, bulletSpeed: 350, bulletSize: 5,
      returnSpeed: 500, range: 350, bulletColor: '#ff9944', trailColor: '#ff6600',
    },
    pierce: {
      id: 'pierce', name: '穿甲弹', icon: '🗡️', rarity: 'uncommon',
      description: '穿透多个敌人',
      pattern: 'pierce', fireRate: 550, damage: 28, bulletSpeed: 650, bulletSize: 4,
      pierceCount: 3, bulletColor: '#ffffff', trailColor: '#cccccc',
    },
    explosive: {
      id: 'explosive', name: '爆破弹', icon: '💣', rarity: 'rare',
      description: '命中爆炸范围伤害',
      pattern: 'explosive', fireRate: 900, damage: 35, bulletSpeed: 400, bulletSize: 6,
      explosionRadius: 70, bulletColor: '#ff4444', trailColor: '#ff0000',
    },
    wave: {
      id: 'wave', name: '波动炮', icon: '〰️', rarity: 'uncommon',
      description: '波浪形弹道覆盖更广',
      pattern: 'wave', fireRate: 500, damage: 10, bulletSpeed: 450, bulletSize: 3,
      waveAmplitude: 3, waveFrequency: 0.06, bulletsPerWave: 3, bulletColor: '#44ff88', trailColor: '#22aa44',
    },
    missile: {
      id: 'missile', name: '导弹群', icon: '🚀', rarity: 'epic',
      description: '多发追踪导弹爆炸范围伤害',
      pattern: 'missile', fireRate: 750, damage: 40, bulletSpeed: 300, bulletSize: 7,
      homingStrength: 0.04, homingRange: 350, explosionRadius: 80, missileCount: 3, bulletColor: '#ff6622', trailColor: '#ff4400',
    },
    needle: {
      id: 'needle', name: '针弹', icon: '📌', rarity: 'uncommon',
      description: '极速连射穿透针弹',
      pattern: 'needle', fireRate: 120, damage: 4, bulletSpeed: 900, bulletSize: 1.5,
      bulletCount: 2, pierceCount: 2, bulletColor: '#aaffff', trailColor: '#66cccc',
    },
    gravityWell: {
      id: 'gravityWell', name: '重力井', icon: '🌀', rarity: 'rare',
      description: '发射引力井吸引并伤害敌人',
      pattern: 'gravityWell', fireRate: 600, damage: 12, bulletSpeed: 350, bulletSize: 5,
      wellRadius: 100, wellDuration: 3000, pullForce: 80, wellDamage: 8, bulletColor: '#9966cc', trailColor: '#6633aa',
    },
    flame: {
      id: 'flame', name: '火焰喷射', icon: '🔥', rarity: 'uncommon',
      description: '近距离火焰持续灼烧',
      pattern: 'flame', fireRate: 50, damage: 4, bulletSpeed: 350, bulletSize: 8,
      flameLength: 180, flameAngle: 40, burnDamage: 6, burnDuration: 2000, bulletColor: '#ff6600', trailColor: '#ff3300',
    },
    shuriken: {
      id: 'shuriken', name: '手里剑', icon: '🪃', rarity: 'rare',
      description: '旋转飞镖穿透多次',
      pattern: 'shuriken', fireRate: 500, damage: 18, bulletSpeed: 400, bulletSize: 5,
      spinSpeed: 8, pierceCount: 5, orbitRadius: 60, bulletColor: '#aaaacc', trailColor: '#8888aa',
    },
    voidRift: {
      id: 'voidRift', name: '虚空裂隙', icon: '🕳️', rarity: 'epic',
      description: '召唤虚空裂隙持续伤害并斩杀低血量敌人',
      pattern: 'voidRift', fireRate: 800, damage: 8, bulletSpeed: 250, bulletSize: 6,
      riftDuration: 4000, riftDamage: 12, riftRadius: 70, executeThreshold: 0.1, bulletColor: '#440088', trailColor: '#220044',
    },
    lightningBolt: {
      id: 'lightningBolt', name: '雷电', icon: '⚡', rarity: 'epic',
      description: '闪电链式弹射多个敌人',
      pattern: 'lightningBolt', fireRate: 600, damage: 22, bulletSpeed: 1200, bulletSize: 2,
      chainCount: 4, chainRange: 150, chainDamageFalloff: 0.25, boltWidth: 2, bulletColor: '#ffff44', trailColor: '#ffaa00',
    },
    iceShard: {
      id: 'iceShard', name: '冰晶', icon: '❄️', rarity: 'rare',
      description: '冰冻减速敌人，击杀碎裂范围伤害',
      pattern: 'iceShard', fireRate: 450, damage: 10, bulletSpeed: 500, bulletSize: 3,
      slowAmount: 0.4, slowDuration: 2000, shatterDamage: 30, shatterRadius: 80, bulletColor: '#88ddff', trailColor: '#4499cc',
    },
    rocketBarrage: {
      id: 'rocketBarrage', name: '火箭弹幕', icon: '💥', rarity: 'legendary',
      description: '扇形火箭弹幕覆盖大范围',
      pattern: 'rocketBarrage', fireRate: 1000, damage: 50, bulletSpeed: 220, bulletSize: 9,
      rocketCount: 5, explosionRadius: 90, spreadAngle: 30, bulletColor: '#ff4444', trailColor: '#cc0000',
    },
    photonBeam: {
      id: 'photonBeam', name: '光子束', icon: '💡', rarity: 'legendary',
      description: '持续光子光束扫射',
      pattern: 'photonBeam', fireRate: 40, damage: 5, bulletSpeed: 1500, bulletSize: 3,
      beamWidth: 8, beamLength: 600, tickRate: 50, bulletColor: '#ffffff', trailColor: '#aaaaff',
    },

    // ---- Fused Weapons (created via fusion system) ----
    plasmaGun: {
      id: 'plasmaGun', name: '等离子机枪', icon: '🔮', rarity: 'legendary', fused: true,
      description: '高射速穿透等离子弹',
      pattern: 'plasmaGun', fireRate: 100, damage: 6, bulletSpeed: 900, bulletSize: 3,
      pierceCount: 2, bulletColor: '#cc44ff', trailColor: '#8844ff',
    },
    smartSpread: {
      id: 'smartSpread', name: '智能散射', icon: '🌟', rarity: 'legendary', fused: true,
      description: '自动追踪扇形弹幕',
      pattern: 'smartSpread', fireRate: 500, damage: 9, bulletSpeed: 420, bulletSize: 3.5,
      bulletCount: 5, spreadAngle: 30, homingStrength: 0.04, homingRange: 350,
      bulletColor: '#ff88ff', trailColor: '#cc44cc',
    },
    teslaOrbital: {
      id: 'teslaOrbital', name: '特斯拉浮游炮', icon: '⚡', rarity: 'legendary', fused: true,
      description: '链式闪电环绕浮游炮',
      pattern: 'teslaOrbital', fireRate: 400, damage: 8, bulletSpeed: 600, bulletSize: 2.5,
      orbitRadius: 75, orbitSpeed: 2.8, orbitCount: 4, chainCount: 2, chainRange: 120,
      bulletColor: '#88ffff', trailColor: '#44ddff',
    },
    phantomBlade: {
      id: 'phantomBlade', name: '幻影之刃', icon: '👻', rarity: 'legendary', fused: true,
      description: '穿透回旋幻影飞刃',
      pattern: 'phantomBlade', fireRate: 550, damage: 30, bulletSpeed: 400, bulletSize: 5,
      pierceCount: 4, returnSpeed: 550, range: 380, bulletColor: '#aaccff', trailColor: '#6688cc',
    },
    shockwave: {
      id: 'shockwave', name: '震荡波', icon: '🌊', rarity: 'legendary', fused: true,
      description: '范围爆炸波动冲击',
      pattern: 'shockwaveWep', fireRate: 700, damage: 25, bulletSpeed: 380, bulletSize: 5,
      waveAmplitude: 4, waveFrequency: 0.05, bulletsPerWave: 4, explosionRadius: 55,
      bulletColor: '#44ffaa', trailColor: '#22cc66',
    },
  },

  // ============ WEAPON UPGRADES ============
  // Per-level multipliers for weapon stats (level 1 = base, level 2-5 = upgrades)
  // damageMult: multiplier applied to base damage per level
  // fireRateMult: multiplier applied to base fire rate (lower = faster)
  // specialMult: multiplier for weapon-specific stats (explosion radius, chain count, etc.)
  WEAPON_UPGRADE: {
    maxLevel: 5,
    damageMult:  [1.0, 1.25, 1.55, 1.9, 2.3],
    fireRateMult:[1.0, 0.92, 0.85, 0.78, 0.72],
    specialMult: [1.0, 1.15, 1.3, 1.5, 1.7],
    descriptions: [
      '', '基础', '改良', '精良', '卓越', '传说'
    ],
  },

  // ============ FUSION RECIPES ============
  // Weapon fusions: two max-level weapons → one fused weapon
  // Skill fusions: two max-level skills → one fused skill
  FUSION_RECIPES: {
    weapons: [
      { id: 'w_plasma', ingredientA: 'laser', ingredientB: 'normal', result: 'plasmaGun',
        name: '等离子机枪', icon: '🔮', description: '攻速流 + 激光炮 = 高射速穿透等离子弹',
        colorA: '#00ffff', colorB: '#ffff00' },
      { id: 'w_smart', ingredientA: 'spread', ingredientB: 'homing', result: 'smartSpread',
        name: '智能散射', icon: '🌟', description: '散射弹 + 追踪弹 = 自动追踪扇形弹幕',
        colorA: '#ff8844', colorB: '#ff44ff' },
      { id: 'w_tesla', ingredientA: 'orbital', ingredientB: 'arc', result: 'teslaOrbital',
        name: '特斯拉浮游炮', icon: '⚡', description: '浮游炮 + 电弧链 = 链式闪电环绕浮游炮',
        colorA: '#88ddff', colorB: '#88ffff' },
      { id: 'w_phantom', ingredientA: 'boomerang', ingredientB: 'pierce', result: 'phantomBlade',
        name: '幻影之刃', icon: '👻', description: '回旋镖 + 穿甲弹 = 穿透回旋幻影飞刃',
        colorA: '#ff9944', colorB: '#ffffff' },
      { id: 'w_shockwave', ingredientA: 'explosive', ingredientB: 'wave', result: 'shockwave',
        name: '震荡波', icon: '🌊', description: '爆破弹 + 波动炮 = 范围爆炸波动冲击',
        colorA: '#ff4444', colorB: '#44ff88' },
      { id: 'w_plagueFlame', ingredientA: 'flame', ingredientB: 'needle', result: 'plagueFlame',
        name: '瘟疫火焰', icon: '☣️', description: '火焰喷射 + 针弹 = 持续灼烧穿透火焰',
        colorA: '#ff6600', colorB: '#aaffff' },
      { id: 'w_thunderIce', ingredientA: 'iceShard', ingredientB: 'lightningBolt', result: 'thunderIce',
        name: '雷暴冰暴', icon: '🌨️', description: '冰晶 + 雷电 = 冰冻连锁闪电',
        colorA: '#88ddff', colorB: '#ffff44' },
      { id: 'w_deathStorm', ingredientA: 'shuriken', ingredientB: 'missile', result: 'deathStorm',
        name: '死亡风暴', icon: '💀', description: '手里剑 + 导弹群 = 旋转追踪飞刃群',
        colorA: '#aaaacc', colorB: '#ff6622' },
      { id: 'w_singularityBeam', ingredientA: 'voidRift', ingredientB: 'photonBeam', result: 'singularityBeam',
        name: '奇点投射', icon: '🕳️', description: '虚空裂隙 + 光子束 = 黑洞光束',
        colorA: '#440088', colorB: '#ffffff' },
      { id: 'w_clusterBomb', ingredientA: 'gravityWell', ingredientB: 'rocketBarrage', result: 'clusterBomb',
        name: '集束炸弹', icon: '💣', description: '重力井 + 火箭弹幕 = 引力聚爆火箭',
        colorA: '#9966cc', colorB: '#ff4444' },
      { id: 'w_elementCannon', ingredientA: 'flame', ingredientB: 'iceShard', result: 'elementCannon',
        name: '元素炮', icon: '🌈', description: '火焰喷射 + 冰晶 = 冰火交替元素弹',
        colorA: '#ff6600', colorB: '#88ddff' },
      { id: 'w_thunderMissile', ingredientA: 'lightningBolt', ingredientB: 'missile', result: 'thunderMissile',
        name: '雷鸣导弹', icon: '⚡', description: '雷电 + 导弹群 = 闪电连锁追踪导弹',
        colorA: '#ffff44', colorB: '#ff6622' },
      { id: 'w_gravityBlade', ingredientA: 'shuriken', ingredientB: 'gravityWell', result: 'gravityBlade',
        name: '重力飞刃', icon: '🌀', description: '手里剑 + 重力井 = 引力回旋飞刃',
        colorA: '#aaaacc', colorB: '#9966cc' },
      { id: 'w_voidRocket', ingredientA: 'voidRift', ingredientB: 'rocketBarrage', result: 'voidRocket',
        name: '虚空火箭', icon: '🚀', description: '虚空裂隙 + 火箭弹幕 = 虚空爆炸火箭',
        colorA: '#440088', colorB: '#ff4444' },
      { id: 'w_photonNeedle', ingredientA: 'photonBeam', ingredientB: 'needle', result: 'photonNeedle',
        name: '光子针', icon: '💡', description: '光子束 + 针弹 = 超高速光子穿透针',
        colorA: '#ffffff', colorB: '#aaffff' },
    ],
    skills: [
      { id: 's_plagueBlizzard', ingredientA: 'ps_venom', ingredientB: 'ic_blizzard', result: 'fusion_plagueBlizzard',
        name: '瘟疫冰暴', icon: '🧊', description: '剧毒 + 暴风雪 = 减速+持续伤害区域',
        colorA: '#55cc44', colorB: '#66ddff' },
      { id: 's_stormFire', ingredientA: 'el_burn', ingredientB: 'th_thunderStorm', result: 'fusion_stormFire',
        name: '风暴烈焰', icon: '🌋', description: '灼烧 + 雷暴 = 连锁灼烧闪电',
        colorA: '#ff6600', colorB: '#ffff00' },
      { id: 's_vampiricShield', ingredientA: 'sh_bigger', ingredientB: 'ls_vampire', result: 'fusion_vampiricShield',
        name: '吸血护盾', icon: '🛡️', description: '护盾强化 + 吸血鬼 = 命中回血护盾',
        colorA: '#4488ff', colorB: '#ff3366' },
      { id: 's_voidGravity', ingredientA: 'gv_singularity', ingredientB: 'vd_voidRift', result: 'fusion_voidGravity',
        name: '虚空引力', icon: '🕳️', description: '奇点 + 虚空裂隙 = 引力吞噬黑洞',
        colorA: '#9966cc', colorB: '#440088' },
    ],
    // Both ingredients must reach this level to fuse
    requiredLevel: 5,
  },

  // ============ TALENTS ============
  // 5 branches: attack/defense/utility/element/ultimate
  // Each branch has 5 layers, 2-3 options per layer
  TALENTS: {
    branches: {
      attack: {
        id: 'attack', name: '攻击', icon: '⚔️', color: '#ff4444',
        layers: [
          { layer: 1, options: [
            { id: 't_atk_1a', name: '锋利 I', icon: '🗡️', description: '攻击力 +5%', effects: [{ stat: 'attack', op: 'multiply', value: 0.05 }] },
            { id: 't_atk_1b', name: '精准 I', icon: '🎯', description: '暴击率 +3%', effects: [{ stat: 'critRate', op: 'add', value: 0.03 }] },
            { id: 't_atk_1c', name: '连击 I', icon: '⚡', description: '射速 +4%', effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.04 }] },
            { id: 't_atk_1d', name: '弹药扩充 I', icon: '🔫', description: '子弹大小 +10%', effects: [{ stat: 'bulletSize', op: 'multiply', value: 0.10 }] },
          ]},
          { layer: 2, options: [
            { id: 't_atk_2a', name: '锋利 II', icon: '🗡️', description: '攻击力 +10%', effects: [{ stat: 'attack', op: 'multiply', value: 0.10 }] },
            { id: 't_atk_2b', name: '致命打击', icon: '💀', description: '暴击伤害 +25%', effects: [{ stat: 'critMult', op: 'add', value: 0.25 }] },
            { id: 't_atk_2c', name: '连射', icon: '🏹', description: '射速 +8%', effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.08 }] },
            { id: 't_atk_2d', name: '弹道加速', icon: '🚀', description: '子弹速度 +15%，攻击力 +3%', effects: [{ stat: 'bulletSpeed', op: 'multiply', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.03 }] },
          ]},
          { layer: 3, options: [
            { id: 't_atk_3a', name: '狂战之力', icon: '🔴', description: '攻击力 +15%，最大生命 -10%', effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: -0.10 }] },
            { id: 't_atk_3b', name: '弹幕强化', icon: '🌊', description: '额外子弹 +1', effects: [{ stat: 'bulletCount', op: 'add', value: 1 }] },
            { id: 't_atk_3c', name: '精准 II', icon: '🎯', description: '暴击率 +6%', effects: [{ stat: 'critRate', op: 'add', value: 0.06 }] },
            { id: 't_atk_3d', name: '破甲弹', icon: '🔩', description: '穿透 +1，攻击力 +5%', effects: [{ stat: 'pierceCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
          ]},
          { layer: 4, options: [
            { id: 't_atk_4a', name: '毁灭打击', icon: '💥', description: '攻击力 +20%', effects: [{ stat: 'attack', op: 'multiply', value: 0.20 }] },
            { id: 't_atk_4b', name: '穿透弹', icon: '🔩', description: '穿透 +2', effects: [{ stat: 'pierceCount', op: 'add', value: 2 }] },
            { id: 't_atk_4c', name: '爆裂弹', icon: '💣', description: '暴击率 +8%，暴击伤害 +30%', effects: [{ stat: 'critRate', op: 'add', value: 0.08 }, { stat: 'critMult', op: 'add', value: 0.30 }] },
          ]},
          { layer: 5, options: [
            { id: 't_atk_5a', name: '战争主宰', icon: '👑', description: '攻击力 +25%，暴击率 +8%，暴击伤害 +40%', effects: [{ stat: 'attack', op: 'multiply', value: 0.25 }, { stat: 'critRate', op: 'add', value: 0.08 }, { stat: 'critMult', op: 'add', value: 0.40 }] },
            { id: 't_atk_5b', name: '弹幕风暴', icon: '🌪️', description: '额外子弹 +2，射速 +15%', effects: [{ stat: 'bulletCount', op: 'add', value: 2 }, { stat: 'attackSpeed', op: 'multiply', value: -0.15 }] },
            { id: 't_atk_5c', name: '杀戮本能', icon: '🩸', description: '攻击力 +18%，穿透 +2，吸血 +5%', effects: [{ stat: 'attack', op: 'multiply', value: 0.18 }, { stat: 'pierceCount', op: 'add', value: 2 }, { stat: 'lifesteal', op: 'add', value: 0.05 }] },
          ]},
        ],
      },
      defense: {
        id: 'defense', name: '防御', icon: '🛡️', color: '#4488ff',
        layers: [
          { layer: 1, options: [
            { id: 't_def_1a', name: '铁壁 I', icon: '🛡️', description: '最大生命 +15', effects: [{ stat: 'hp', op: 'add', value: 15 }] },
            { id: 't_def_1b', name: '韧性 I', icon: '💪', description: '减伤 5%', effects: [{ stat: 'defense', op: 'add', value: 0.05 }] },
            { id: 't_def_1c', name: '疾步 I', icon: '👟', description: '移速 +5%', effects: [{ stat: 'speed', op: 'multiply', value: 0.05 }] },
            { id: 't_def_1d', name: '回复 I', icon: '💚', description: '每秒回复 1 HP', effects: [{ stat: 'hpRegen', op: 'add', value: 1 }] },
          ]},
          { layer: 2, options: [
            { id: 't_def_2a', name: '铁壁 II', icon: '🛡️', description: '最大生命 +30', effects: [{ stat: 'hp', op: 'add', value: 30 }] },
            { id: 't_def_2b', name: '护盾生成', icon: '🔮', description: '护盾 +20', effects: [{ stat: 'shieldAmount', op: 'add', value: 20 }] },
            { id: 't_def_2c', name: '格挡', icon: '🤚', description: '减伤 6%', effects: [{ stat: 'defense', op: 'add', value: 0.06 }] },
            { id: 't_def_2d', name: '回复 II', icon: '💚', description: '每秒回复 2 HP，最大生命 +15', effects: [{ stat: 'hpRegen', op: 'add', value: 2 }, { stat: 'hp', op: 'add', value: 15 }] },
          ]},
          { layer: 3, options: [
            { id: 't_def_3a', name: '生命汲取', icon: '❤️', description: '吸血 +5%', effects: [{ stat: 'lifesteal', op: 'add', value: 0.05 }] },
            { id: 't_def_3b', name: '反射之盾', icon: '🪞', description: '反伤 +15%', effects: [{ stat: 'reflectDamage', op: 'add', value: 0.15 }] },
            { id: 't_def_3c', name: '韧性 II', icon: '💪', description: '减伤 8%', effects: [{ stat: 'defense', op: 'add', value: 0.08 }] },
            { id: 't_def_3d', name: '铁甲', icon: '🔰', description: '最大生命 +25，减伤 4%', effects: [{ stat: 'hp', op: 'add', value: 25 }, { stat: 'defense', op: 'add', value: 0.04 }] },
          ]},
          { layer: 4, options: [
            { id: 't_def_4a', name: '钢铁意志', icon: '🏔️', description: '最大生命 +50，减伤 10%', effects: [{ stat: 'hp', op: 'add', value: 50 }, { stat: 'defense', op: 'add', value: 0.10 }] },
            { id: 't_def_4b', name: '护盾强化', icon: '🔵', description: '护盾 +40，护盾回复 +2/s', effects: [{ stat: 'shieldAmount', op: 'add', value: 40 }, { stat: 'shieldRegen', op: 'add', value: 2 }] },
            { id: 't_def_4c', name: '闪避步伐', icon: '👟', description: '闪避 +8%，移速 +6%', effects: [{ stat: 'dodgeChance', op: 'add', value: 0.08 }, { stat: 'speed', op: 'multiply', value: 0.06 }] },
          ]},
          { layer: 5, options: [
            { id: 't_def_5a', name: '不朽之躯', icon: '🏛️', description: '最大生命 +80，减伤 15%，每秒回复 3 HP', effects: [{ stat: 'hp', op: 'add', value: 80 }, { stat: 'defense', op: 'add', value: 0.15 }, { stat: 'hpRegen', op: 'add', value: 3 }] },
            { id: 't_def_5b', name: '绝对防御', icon: '🔰', description: '护盾 +60，反伤 +30%，闪避 +10%', effects: [{ stat: 'shieldAmount', op: 'add', value: 60 }, { stat: 'reflectDamage', op: 'add', value: 0.30 }, { stat: 'dodgeChance', op: 'add', value: 0.10 }] },
            { id: 't_def_5c', name: '生命之泉', icon: '💚', description: '最大生命 +60，吸血 +8%，每秒回复 4 HP', effects: [{ stat: 'hp', op: 'add', value: 60 }, { stat: 'lifesteal', op: 'add', value: 0.08 }, { stat: 'hpRegen', op: 'add', value: 4 }] },
          ]},
        ],
      },
      utility: {
        id: 'utility', name: '辅助', icon: '🔧', color: '#44ff88',
        layers: [
          { layer: 1, options: [
            { id: 't_uti_1a', name: '拾取范围 I', icon: '🧲', description: '拾取范围 +30', effects: [{ stat: 'pickupRange', op: 'add', value: 30 }] },
            { id: 't_uti_1b', name: '经验加成 I', icon: '📈', description: '经验获取 +10%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.10 }] },
            { id: 't_uti_1c', name: '幸运 I', icon: '🍀', description: '掉落率 +5%', effects: [{ stat: 'dropRate', op: 'add', value: 0.05 }] },
            { id: 't_uti_1d', name: '分数加成 I', icon: '📊', description: '分数获取 +8%', effects: [{ stat: 'scoreMultiplier', op: 'multiply', value: 0.08 }] },
          ]},
          { layer: 2, options: [
            { id: 't_uti_2a', name: '磁力场', icon: '🧲', description: '拾取范围 +60', effects: [{ stat: 'pickupRange', op: 'add', value: 60 }] },
            { id: 't_uti_2b', name: '冷却缩减 I', icon: '⏱️', description: '技能冷却 -10%', effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.10 }] },
            { id: 't_uti_2c', name: '金币磁铁', icon: '💰', description: '拾取范围 +40，经验 +8%', effects: [{ stat: 'pickupRange', op: 'add', value: 40 }, { stat: 'xpMultiplier', op: 'multiply', value: 0.08 }] },
            { id: 't_uti_2d', name: '分数猎手', icon: '📊', description: '分数 +12%，掉落率 +4%', effects: [{ stat: 'scoreMultiplier', op: 'multiply', value: 0.12 }, { stat: 'dropRate', op: 'add', value: 0.04 }] },
          ]},
          { layer: 3, options: [
            { id: 't_uti_3a', name: '经验加成 II', icon: '📈', description: '经验获取 +20%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.20 }] },
            { id: 't_uti_3b', name: '幸运 II', icon: '🍀', description: '掉落率 +10%', effects: [{ stat: 'dropRate', op: 'add', value: 0.10 }] },
            { id: 't_uti_3c', name: '冷却缩减 II', icon: '⏱️', description: '技能冷却 -15%', effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.15 }] },
            { id: 't_uti_3d', name: '双重收获', icon: '🎁', description: '经验 +12%，掉落率 +6%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.12 }, { stat: 'dropRate', op: 'add', value: 0.06 }] },
          ]},
          { layer: 4, options: [
            { id: 't_uti_4a', name: '寻宝猎人', icon: '💰', description: '掉落率 +15%，分数 +20%', effects: [{ stat: 'dropRate', op: 'add', value: 0.15 }, { stat: 'scoreMultiplier', op: 'multiply', value: 0.20 }] },
            { id: 't_uti_4b', name: '时间扭曲', icon: '⏳', description: '冷却缩减 +20%，射速 +10%', effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.20 }, { stat: 'attackSpeed', op: 'multiply', value: -0.10 }] },
            { id: 't_uti_4c', name: '效率大师', icon: '📊', description: '经验 +15%，掉落率 +8%，冷却 -10%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.15 }, { stat: 'dropRate', op: 'add', value: 0.08 }, { stat: 'cooldownReduction', op: 'add', value: 0.10 }] },
          ]},
          { layer: 5, options: [
            { id: 't_uti_5a', name: '财富之神', icon: '👑', description: '经验 +30%，掉落率 +20%，分数 +30%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.30 }, { stat: 'dropRate', op: 'add', value: 0.20 }, { stat: 'scoreMultiplier', op: 'multiply', value: 0.30 }] },
            { id: 't_uti_5b', name: '时空掌控', icon: '🌀', description: '冷却缩减 +25%，拾取范围 +120，移速 +15%', effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.25 }, { stat: 'pickupRange', op: 'add', value: 120 }, { stat: 'speed', op: 'multiply', value: 0.15 }] },
            { id: 't_uti_5c', name: '全能收割', icon: '🌾', description: '经验 +25%，掉落率 +15%，拾取范围 +80，冷却 -15%', effects: [{ stat: 'xpMultiplier', op: 'multiply', value: 0.25 }, { stat: 'dropRate', op: 'add', value: 0.15 }, { stat: 'pickupRange', op: 'add', value: 80 }, { stat: 'cooldownReduction', op: 'add', value: 0.15 }] },
          ]},
        ],
      },
      element: {
        id: 'element', name: '元素', icon: '🔥', color: '#ff8800',
        layers: [
          { layer: 1, options: [
            { id: 't_ele_1a', name: '灼烧 I', icon: '🔥', description: '灼烧伤害 +3', effects: [{ stat: 'burnDamage', op: 'add', value: 3 }] },
            { id: 't_ele_1b', name: '冰冻 I', icon: '❄️', description: '减速概率 +8%', effects: [{ stat: 'slowChance', op: 'add', value: 0.08 }] },
            { id: 't_ele_1c', name: '毒素 I', icon: '☠️', description: '毒素伤害 +4', effects: [{ stat: 'poisonDamage', op: 'add', value: 4 }] },
            { id: 't_ele_1d', name: '元素亲和 I', icon: '🌈', description: '元素伤害加成 +5%', effects: [{ stat: 'elementalBonus', op: 'add', value: 0.05 }] },
          ]},
          { layer: 2, options: [
            { id: 't_ele_2a', name: '灼烧 II', icon: '🔥', description: '灼烧伤害 +6，灼烧时间 +500ms', effects: [{ stat: 'burnDamage', op: 'add', value: 6 }, { stat: 'burnDuration', op: 'add', value: 500 }] },
            { id: 't_ele_2b', name: '雷电链', icon: '⚡', description: '连锁闪电概率 +10%', effects: [{ stat: 'chainLightningChance', op: 'add', value: 0.10 }] },
            { id: 't_ele_2c', name: '冰霜之触', icon: '❄️', description: '减速量 +10%，减速时间 +300ms', effects: [{ stat: 'slowAmount', op: 'add', value: 0.10 }, { stat: 'slowDuration', op: 'add', value: 300 }] },
            { id: 't_ele_2d', name: '毒雾弥漫', icon: '☣️', description: '毒素持续时间 +600ms，扩散率 +6%', effects: [{ stat: 'poisonDuration', op: 'add', value: 600 }, { stat: 'poisonSpread', op: 'add', value: 0.06 }] },
          ]},
          { layer: 3, options: [
            { id: 't_ele_3a', name: '元素增幅', icon: '🌈', description: '元素伤害加成 +15%', effects: [{ stat: 'elementalBonus', op: 'add', value: 0.15 }] },
            { id: 't_ele_3b', name: '冰冻 II', icon: '❄️', description: '减速概率 +12%，冰冻概率 +5%', effects: [{ stat: 'slowChance', op: 'add', value: 0.12 }, { stat: 'freezeChance', op: 'add', value: 0.05 }] },
            { id: 't_ele_3c', name: '毒素 II', icon: '☠️', description: '毒素伤害 +8，扩散率 +10%', effects: [{ stat: 'poisonDamage', op: 'add', value: 8 }, { stat: 'poisonSpread', op: 'add', value: 0.10 }] },
            { id: 't_ele_3d', name: '雷电强化', icon: '⚡', description: '连锁数量 +1，连锁伤害 +15%', effects: [{ stat: 'chainCount', op: 'add', value: 1 }, { stat: 'chainDamage', op: 'multiply', value: 0.15 }] },
          ]},
          { layer: 4, options: [
            { id: 't_ele_4a', name: '烈焰风暴', icon: '🌋', description: '灼烧伤害 +12，灼烧时间 +1000ms，元素加成 +20%', effects: [{ stat: 'burnDamage', op: 'add', value: 12 }, { stat: 'burnDuration', op: 'add', value: 1000 }, { stat: 'elementalBonus', op: 'add', value: 0.20 }] },
            { id: 't_ele_4b', name: '雷电之主', icon: '🌩️', description: '连锁概率 +20%，连锁数量 +2，连锁伤害 +25%', effects: [{ stat: 'chainLightningChance', op: 'add', value: 0.20 }, { stat: 'chainCount', op: 'add', value: 2 }, { stat: 'chainDamage', op: 'multiply', value: 0.25 }] },
            { id: 't_ele_4c', name: '瘟疫传播', icon: '☣️', description: '毒素伤害 +12，扩散率 +15%，持续时间 +800ms', effects: [{ stat: 'poisonDamage', op: 'add', value: 12 }, { stat: 'poisonSpread', op: 'add', value: 0.15 }, { stat: 'poisonDuration', op: 'add', value: 800 }] },
          ]},
          { layer: 5, options: [
            { id: 't_ele_5a', name: '元素君王', icon: '👑', description: '所有元素伤害 +25%，元素加成 +30%，减速概率 +20%', effects: [{ stat: 'elementalBonus', op: 'add', value: 0.30 }, { stat: 'slowChance', op: 'add', value: 0.20 }, { stat: 'burnDamage', op: 'add', value: 15 }, { stat: 'poisonDamage', op: 'add', value: 15 }] },
            { id: 't_ele_5b', name: '冰封领域', icon: '🏔️', description: '冰冻概率 +15%，减速量 +20%，减速时间 +1000ms', effects: [{ stat: 'freezeChance', op: 'add', value: 0.15 }, { stat: 'slowAmount', op: 'add', value: 0.20 }, { stat: 'slowDuration', op: 'add', value: 1000 }] },
            { id: 't_ele_5c', name: '天罚雷霆', icon: '⚡', description: '连锁概率 +25%，连锁数量 +3，连锁伤害 +40%', effects: [{ stat: 'chainLightningChance', op: 'add', value: 0.25 }, { stat: 'chainCount', op: 'add', value: 3 }, { stat: 'chainDamage', op: 'multiply', value: 0.40 }] },
          ]},
        ],
      },
      ultimate: {
        id: 'ultimate', name: '终极', icon: '✨', color: '#ffaa00',
        layers: [
          { layer: 1, options: [
            { id: 't_ult_1a', name: '觉醒 I', icon: '✨', description: '全属性 +3%', effects: [{ stat: 'attack', op: 'multiply', value: 0.03 }, { stat: 'hp', op: 'multiply', value: 0.03 }, { stat: 'speed', op: 'multiply', value: 0.03 }] },
            { id: 't_ult_1b', name: '潜能 I', icon: '💎', description: '攻击力 +4%，移速 +4%', effects: [{ stat: 'attack', op: 'multiply', value: 0.04 }, { stat: 'speed', op: 'multiply', value: 0.04 }] },
            { id: 't_ult_1c', name: '韧性觉醒', icon: '💪', description: '最大生命 +5%，减伤 3%', effects: [{ stat: 'hp', op: 'multiply', value: 0.05 }, { stat: 'defense', op: 'add', value: 0.03 }] },
          ]},
          { layer: 2, options: [
            { id: 't_ult_2a', name: '觉醒 II', icon: '✨', description: '全属性 +6%', effects: [{ stat: 'attack', op: 'multiply', value: 0.06 }, { stat: 'hp', op: 'multiply', value: 0.06 }, { stat: 'speed', op: 'multiply', value: 0.06 }] },
            { id: 't_ult_2b', name: '战意', icon: '🔥', description: '攻击力 +8%，暴击率 +4%', effects: [{ stat: 'attack', op: 'multiply', value: 0.08 }, { stat: 'critRate', op: 'add', value: 0.04 }] },
            { id: 't_ult_2c', name: '生存本能', icon: '💚', description: '最大生命 +10%，吸血 +3%', effects: [{ stat: 'hp', op: 'multiply', value: 0.10 }, { stat: 'lifesteal', op: 'add', value: 0.03 }] },
          ]},
          { layer: 3, options: [
            { id: 't_ult_3a', name: '超载', icon: '⚡', description: '攻击力 +12%，射速 +10%，暴击伤害 +20%', effects: [{ stat: 'attack', op: 'multiply', value: 0.12 }, { stat: 'attackSpeed', op: 'multiply', value: -0.10 }, { stat: 'critMult', op: 'add', value: 0.20 }] },
            { id: 't_ult_3b', name: '不死之身', icon: '💀', description: '最大生命 +15%，减伤 10%，回复 +2/s', effects: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'defense', op: 'add', value: 0.10 }, { stat: 'hpRegen', op: 'add', value: 2 }] },
            { id: 't_ult_3c', name: '风行者', icon: '🍃', description: '移速 +12%，闪避 +6%，暴击率 +3%', effects: [{ stat: 'speed', op: 'multiply', value: 0.12 }, { stat: 'dodgeChance', op: 'add', value: 0.06 }, { stat: 'critRate', op: 'add', value: 0.03 }] },
          ]},
          { layer: 4, options: [
            { id: 't_ult_4a', name: '毁灭者', icon: '☄️', description: '攻击力 +18%，暴击率 +8%，穿透 +1', effects: [{ stat: 'attack', op: 'multiply', value: 0.18 }, { stat: 'critRate', op: 'add', value: 0.08 }, { stat: 'pierceCount', op: 'add', value: 1 }] },
            { id: 't_ult_4b', name: '全能战士', icon: '🌟', description: '全属性 +10%，额外子弹 +1', effects: [{ stat: 'attack', op: 'multiply', value: 0.10 }, { stat: 'hp', op: 'multiply', value: 0.10 }, { stat: 'speed', op: 'multiply', value: 0.10 }, { stat: 'bulletCount', op: 'add', value: 1 }] },
            { id: 't_ult_4c', name: '暗影步', icon: '🌑', description: '闪避 +12%，移速 +15%，暴击率 +5%', effects: [{ stat: 'dodgeChance', op: 'add', value: 0.12 }, { stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.05 }] },
          ]},
          { layer: 5, options: [
            { id: 't_ult_5a', name: '天神下凡', icon: '👼', description: '攻击力 +30%，暴击率 +12%，暴击伤害 +50%，额外子弹 +2', effects: [{ stat: 'attack', op: 'multiply', value: 0.30 }, { stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'critMult', op: 'add', value: 0.50 }, { stat: 'bulletCount', op: 'add', value: 2 }] },
            { id: 't_ult_5b', name: '永恒守护', icon: '🛡️', description: '最大生命 +25%，减伤 20%，吸血 +10%，每秒回复 5 HP', effects: [{ stat: 'hp', op: 'multiply', value: 0.25 }, { stat: 'defense', op: 'add', value: 0.20 }, { stat: 'lifesteal', op: 'add', value: 0.10 }, { stat: 'hpRegen', op: 'add', value: 5 }] },
            { id: 't_ult_5c', name: '混沌之主', icon: '🌀', description: '全属性 +15%，暴击率 +8%，暴击伤害 +30%，吸血 +5%', effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.08 }, { stat: 'critMult', op: 'add', value: 0.30 }, { stat: 'lifesteal', op: 'add', value: 0.05 }] },
          ]},
        ],
      },
    },
  },

  // ============ ACHIEVEMENTS (20) ============
  ACHIEVEMENTS: [
    { id: 'ach_first_blood', name: '初见血', icon: '🩸', description: '击杀第1个敌人', condition: { type: 'killCount', value: 1 } },
    { id: 'ach_100_kills', name: '百人斩', icon: '⚔️', description: '累计击杀100个敌人', condition: { type: 'killCount', value: 100 } },
    { id: 'ach_1000_kills', name: '千人斩', icon: '💀', description: '累计击杀1000个敌人', condition: { type: 'killCount', value: 1000 } },
    { id: 'ach_first_boss', name: '弑王者', icon: '👑', description: '击败第1个Boss', condition: { type: 'bossKill', value: 1 } },
    { id: 'ach_5_bosses', name: 'Boss猎手', icon: '🎯', description: '累计击败5个Boss', condition: { type: 'bossKill', value: 5 } },
    { id: 'ach_survive_5min', name: '生存者', icon: '⏱️', description: '单局存活5分钟', condition: { type: 'surviveTime', value: 300000 } },
    { id: 'ach_survive_15min', name: '老兵', icon: '🎖️', description: '单局存活15分钟', condition: { type: 'surviveTime', value: 900000 } },
    { id: 'ach_score_10k', name: '万分选手', icon: '📊', description: '单局得分达到10000', condition: { type: 'score', value: 10000 } },
    { id: 'ach_score_50k', name: '得分王', icon: '🏆', description: '单局得分达到50000', condition: { type: 'score', value: 50000 } },
    { id: 'ach_level_10', name: '十级达人', icon: '📈', description: '单局达到10级', condition: { type: 'level', value: 10 } },
    { id: 'ach_level_25', name: '资深战士', icon: '⭐', description: '单局达到25级', condition: { type: 'level', value: 25 } },
    { id: 'ach_combo_20', name: '连击大师', icon: '🔥', description: '达成20连击', condition: { type: 'combo', value: 20 } },
    { id: 'ach_combo_50', name: '连击之神', icon: '🌟', description: '达成50连击', condition: { type: 'combo', value: 50 } },
    { id: 'ach_no_hit_60s', name: '无伤一分钟', icon: '🛡️', description: '连续60秒不受伤', condition: { type: 'noHitTime', value: 60000 } },
    { id: 'ach_kill_elite', name: '精英猎人', icon: '🎯', description: '击杀10个精英敌人', condition: { type: 'eliteKill', value: 10 } },
    { id: 'ach_all_factions', name: '全流派大师', icon: '🌈', description: '使用所有10个流派各通关1次', condition: { type: 'factionWin', value: 10 } },
    { id: 'ach_fusion_first', name: '初次融合', icon: '🔮', description: '第1次触发武器融合', condition: { type: 'fusion', value: 1 } },
    { id: 'ach_fusion_5', name: '融合大师', icon: '💎', description: '累计触发5次武器融合', condition: { type: 'fusion', value: 5 } },
    { id: 'ach_max_weapon', name: '武器巅峰', icon: '🔫', description: '将任意武器升到满级', condition: { type: 'weaponMaxLevel', value: 1 } },
    { id: 'ach_speed_run', name: '速通达人', icon: '⚡', description: '在3分钟内击败3个Boss', condition: { type: 'speedRun', value: 180000 } },
  ],

  // ============ CHARACTERS (3) ============
  // Each character has different base stat modifiers
  CHARACTERS: {
    vanguard: {
      id: 'vanguard', name: '先锋', icon: '⚔️', color: '#ff4444',
      description: '进攻型角色，攻击力 +15%',
      statModifiers: { attack: 1.15, hp: 1.0, speed: 1.0, critRate: 0.0, defense: 0.0 },
    },
    ironWall: {
      id: 'ironWall', name: '铁壁', icon: '🛡️', color: '#4488ff',
      description: '防御型角色，最大生命 +30%',
      statModifiers: { attack: 1.0, hp: 1.3, speed: 1.0, critRate: 0.0, defense: 0.1 },
    },
    agile: {
      id: 'agile', name: '灵动', icon: '💨', color: '#44ff88',
      description: '速度型角色，移速 +20%，闪避 +5%',
      statModifiers: { attack: 1.0, hp: 0.9, speed: 1.2, critRate: 0.05, dodgeChance: 0.05 },
    },
  },

  // ============ DIFFICULTY MODES (3) ============
  DIFFICULTY_MODES: {
    normal: {
      id: 'normal', name: '普通', icon: '🟢', color: '#44ff44',
      description: '标准难度，适合新手',
      multipliers: { enemyHp: 1.0, enemyDamage: 1.0, dropRate: 1.0, xpGain: 1.0, spawnRate: 1.0, bossHp: 1.0 },
    },
    hard: {
      id: 'hard', name: '困难', icon: '🟡', color: '#ffaa00',
      description: '敌人强化50%，掉落提升20%',
      multipliers: { enemyHp: 1.5, enemyDamage: 1.5, dropRate: 1.2, xpGain: 1.3, spawnRate: 1.3, bossHp: 1.8 },
    },
    hell: {
      id: 'hell', name: '地狱', icon: '🔴', color: '#ff0000',
      description: '敌人强化150%，Boss强化200%，掉落翻倍',
      multipliers: { enemyHp: 2.5, enemyDamage: 2.5, dropRate: 2.0, xpGain: 2.0, spawnRate: 1.8, bossHp: 3.0 },
    },
  },

  // ============ ELITE_AFFIXES (15) ============
  // Elite enemies randomly gain 1-3 affixes
  ELITE_AFFIXES: {
    berserk: {
      id: 'berserk', name: '狂暴', icon: '😡', color: '#ff0000',
      description: '攻速 +50%，移速 +30%，攻击力 +20%',
      effects: { attackSpeed: 0.5, speed: 0.3, attack: 0.2 },
    },
    splitter: {
      id: 'splitter', name: '分裂', icon: '✂️', color: '#ff88aa',
      description: '死亡时分裂为2个小型敌人',
      effects: { splitOnDeath: true, splitCount: 2 },
    },
    shield: {
      id: 'shield', name: '护盾', icon: '🔵', color: '#4488ff',
      description: '获得80点护盾，护盾每5秒回复30点',
      effects: { shieldHp: 80, shieldRegen: 30, shieldRegenDelay: 5000 },
    },
    teleport: {
      id: 'teleport', name: '瞬移', icon: '💫', color: '#cc44ff',
      description: '每3秒瞬移一次，瞬移距离200',
      effects: { teleportInterval: 3000, teleportDistance: 200 },
    },
    lifesteal: {
      id: 'lifesteal', name: '吸血', icon: '🧛', color: '#ff3366',
      description: '攻击回复15%伤害为生命',
      effects: { lifesteal: 0.15 },
    },
    plague: {
      id: 'plague', name: '瘟疫', icon: '☠️', color: '#55cc44',
      description: '周围200范围造成每秒8点毒素伤害',
      effects: { plagueRadius: 200, plagueDamage: 8 },
    },
    reflect: {
      id: 'reflect', name: '反伤', icon: '🪞', color: '#ff6644',
      description: '反弹25%受到的伤害给玩家',
      effects: { reflectDamage: 0.25 },
    },
    giant: {
      id: 'giant', name: '巨大化', icon: '🏔️', color: '#884422',
      description: '体型增大80%，生命 +100%，伤害 +30%',
      effects: { sizeMultiplier: 1.8, hpMultiplier: 2.0, attackMultiplier: 1.3 },
    },
    haste: {
      id: 'haste', name: '急速', icon: '💨', color: '#44ddff',
      description: '移速 +60%，射速 +40%',
      effects: { speed: 0.6, attackSpeed: 0.4 },
    },
    lava: {
      id: 'lava', name: '熔岩', icon: '🌋', color: '#ff6600',
      description: '死亡时产生半径120的爆炸，造成50伤害',
      effects: { deathExplosion: true, explosionRadius: 120, explosionDamage: 50 },
    },
    frostAura: {
      id: 'frostAura', name: '冰冻光环', icon: '❄️', color: '#66ddff',
      description: '周围180范围减速玩家40%',
      effects: { auraRadius: 180, auraSlowAmount: 0.4 },
    },
    thunderBody: {
      id: 'thunderBody', name: '雷电护体', icon: '⚡', color: '#ffff00',
      description: '受击时释放闪电链，连锁3个目标，每个造成15伤害',
      effects: { thunderOnHit: true, chainCount: 3, chainDamage: 15 },
    },
    multiShot: {
      id: 'multiShot', name: '多重射击', icon: '🔱', color: '#ffcc00',
      description: '同时发射3倍子弹',
      effects: { bulletCountMultiplier: 3 },
    },
    hardened: {
      id: 'hardened', name: '硬化', icon: '🪨', color: '#888888',
      description: '受到伤害减少40%，但移速降低20%',
      effects: { damageReduction: 0.4, speed: -0.2 },
    },
    regen: {
      id: 'regen', name: '再生', icon: '💚', color: '#44ff44',
      description: '每秒回复最大生命2%',
      effects: { hpRegenPercent: 0.02 },
    },
  },

  // ============ BOSSES (5) ============
  // Named bosses with unique phases and attack patterns
  BOSSES: {
    ironSentinel: {
      id: 'ironSentinel', name: '铁壁哨兵', icon: '🤖', color: '#888888',
      description: '装甲型Boss，拥有能量护盾',
      baseHp: 6000, baseDamage: 30, size: 55, score: 8000, xp: 700,
      phases: [
        { hpThreshold: 0.7, name: '护盾阶段', attackPattern: 'shieldBarrage', bulletCount: 12, spreadAngle: 360, fireRate: 800, bulletSpeed: 220, shieldHp: 300 },
        { hpThreshold: 0.4, name: '狂暴阶段', attackPattern: 'spiralBurst', bulletCount: 18, spreadAngle: 360, fireRate: 500, bulletSpeed: 280, moveSpeed: 60 },
        { hpThreshold: 0.15, name: '自毁阶段', attackPattern: 'kamikazeMode', bulletCount: 24, spreadAngle: 360, fireRate: 300, bulletSpeed: 350, explodeOnDeath: true, explodeRadius: 200 },
      ],
    },
    plagueDoctor: {
      id: 'plagueDoctor', name: '瘟疫医生', icon: '☠️', color: '#55cc44',
      description: '毒素型Boss，释放瘟疫区域',
      baseHp: 5000, baseDamage: 25, size: 48, score: 7500, xp: 650,
      phases: [
        { hpThreshold: 0.7, name: '毒雾阶段', attackPattern: 'poisonCloud', bulletCount: 8, spreadAngle: 360, fireRate: 600, bulletSpeed: 180, poisonRadius: 150, poisonDamage: 12 },
        { hpThreshold: 0.4, name: '瘟疫扩散', attackPattern: 'plagueSpread', bulletCount: 12, spreadAngle: 360, fireRate: 400, bulletSpeed: 220, poisonRadius: 200, poisonDamage: 18, spawnMinions: true },
        { hpThreshold: 0.1, name: '剧毒爆发', attackPattern: 'toxicBurst', bulletCount: 20, spreadAngle: 360, fireRate: 250, bulletSpeed: 300, poisonRadius: 250, poisonDamage: 25 },
      ],
    },
    crimsonQueen: {
      id: 'crimsonQueen', name: '绯红女王', icon: '🧛', color: '#ff3366',
      description: '吸血型Boss，越战越强',
      baseHp: 7000, baseDamage: 35, size: 50, score: 9000, xp: 750,
      phases: [
        { hpThreshold: 0.7, name: '吸血阶段', attackPattern: 'bloodDrain', bulletCount: 6, spreadAngle: 60, fireRate: 500, bulletSpeed: 300, lifesteal: 0.3 },
        { hpThreshold: 0.4, name: '血怒阶段', attackPattern: 'bloodRage', bulletCount: 10, spreadAngle: 90, fireRate: 350, bulletSpeed: 350, lifesteal: 0.5, attackBoost: 0.5 },
        { hpThreshold: 0.15, name: '鲜血风暴', attackPattern: 'bloodStorm', bulletCount: 16, spreadAngle: 360, fireRate: 200, bulletSpeed: 400, lifesteal: 0.8, attackBoost: 1.0 },
      ],
    },
    voidWeaver: {
      id: 'voidWeaver', name: '虚空编织者', icon: '🕳️', color: '#220044',
      description: '空间型Boss，扭曲战场',
      baseHp: 8000, baseDamage: 28, size: 52, score: 10000, xp: 800,
      phases: [
        { hpThreshold: 0.65, name: '虚空裂隙', attackPattern: 'voidRifts', bulletCount: 8, spreadAngle: 360, fireRate: 700, bulletSpeed: 200, createRifts: true, riftCount: 2 },
        { hpThreshold: 0.35, name: '空间折叠', attackPattern: 'spaceFold', bulletCount: 14, spreadAngle: 360, fireRate: 400, bulletSpeed: 280, teleport: true, teleportInterval: 2500 },
        { hpThreshold: 0.1, name: '虚空吞噬', attackPattern: 'voidDevour', bulletCount: 20, spreadAngle: 360, fireRate: 250, bulletSpeed: 340, gravityPull: true, gravityRadius: 300 },
      ],
    },
    dragonEmperor: {
      id: 'dragonEmperor', name: '龙皇帝', icon: '🐲', color: '#ff6600',
      description: '终极Boss，多重元素攻击',
      baseHp: 12000, baseDamage: 40, size: 65, score: 15000, xp: 1000,
      phases: [
        { hpThreshold: 0.75, name: '火焰吐息', attackPattern: 'fireBreath', bulletCount: 10, spreadAngle: 45, fireRate: 400, bulletSpeed: 300, burnDamage: 10, burnDuration: 2000 },
        { hpThreshold: 0.5, name: '雷电风暴', attackPattern: 'thunderStorm', bulletCount: 15, spreadAngle: 360, fireRate: 350, bulletSpeed: 280, chainLightning: true, chainCount: 4 },
        { hpThreshold: 0.25, name: '冰霜领域', attackPattern: 'frostDomain', bulletCount: 18, spreadAngle: 360, fireRate: 300, bulletSpeed: 260, freezeChance: 0.3, slowAmount: 0.5 },
        { hpThreshold: 0.1, name: '末日审判', attackPattern: 'doomsday', bulletCount: 30, spreadAngle: 360, fireRate: 150, bulletSpeed: 400, allElements: true },
      ],
    },
  },

  // ============ PERMANENT_UPGRADES (5) ============
  // Upgrades persist across runs, cost increases per level
  PERMANENT_UPGRADES: {
    damageBoost: {
      id: 'damageBoost', name: '永久攻击强化', icon: '⚔️',
      description: '每级提升攻击力',
      effectPerLevel: { stat: 'attack', op: 'multiply', value: 0.05 },
      maxLevel: 20,
      costs: [100, 200, 400, 700, 1100, 1600, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12000, 14200, 16600, 19200, 22000, 25000, 28200],
    },
    hpBoost: {
      id: 'hpBoost', name: '永久生命强化', icon: '❤️',
      description: '每级提升最大生命值',
      effectPerLevel: { stat: 'hp', op: 'add', value: 10 },
      maxLevel: 20,
      costs: [100, 200, 400, 700, 1100, 1600, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12000, 14200, 16600, 19200, 22000, 25000, 28200],
    },
    speedBoost: {
      id: 'speedBoost', name: '永久移速强化', icon: '💨',
      description: '每级提升移动速度',
      effectPerLevel: { stat: 'speed', op: 'multiply', value: 0.03 },
      maxLevel: 15,
      costs: [150, 350, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12000, 14200, 16600],
    },
    luckBoost: {
      id: 'luckBoost', name: '永久幸运强化', icon: '🍀',
      description: '每级提升掉落率和暴击率',
      effectPerLevel: { stats: [{ stat: 'dropRate', op: 'add', value: 0.02 }, { stat: 'critRate', op: 'add', value: 0.01 }] },
      maxLevel: 15,
      costs: [200, 450, 800, 1300, 2000, 2900, 4000, 5300, 6800, 8500, 10400, 12500, 14800, 17300, 20000],
    },
    xpBoost: {
      id: 'xpBoost', name: '永久经验强化', icon: '📈',
      description: '每级提升经验获取量',
      effectPerLevel: { stat: 'xpMultiplier', op: 'multiply', value: 0.08 },
      maxLevel: 15,
      costs: [120, 280, 500, 800, 1200, 1700, 2400, 3200, 4200, 5400, 6800, 8400, 10200, 12200, 14400],
    },
  },

  // ============ SHOP_ITEMS ============
  // Items available in the between-run shop
  SHOP_ITEMS: {
    reviveToken: {
      id: 'reviveToken', name: '复活币', icon: '💎',
      description: '游戏结束时可原地复活1次，保留50%生命',
      price: 500, consumable: true, category: 'consumable',
    },
    luckyCharm: {
      id: 'luckyCharm', name: '幸运符', icon: '🍀',
      description: '下一局掉落率 +25%，持续整局',
      price: 300, consumable: true, category: 'consumable',
    },
    xpPotion: {
      id: 'xpPotion', name: '经验药水', icon: '🧪',
      description: '下一局经验获取 +50%，持续整局',
      price: 400, consumable: true, category: 'consumable',
    },
    damageScroll: {
      id: 'damageScroll', name: '力量卷轴', icon: '📜',
      description: '下一局攻击力 +20%，持续整局',
      price: 350, consumable: true, category: 'consumable',
    },
    shieldCrystal: {
      id: 'shieldCrystal', name: '护盾水晶', icon: '🔮',
      description: '开局获得100点护盾',
      price: 250, consumable: true, category: 'consumable',
    },
    factionTicket: {
      id: 'factionTicket', name: '流派选择券', icon: '🎫',
      description: '下次游戏可自由选择流派，无视随机',
      price: 600, consumable: true, category: 'consumable',
    },
    goldMagnet: {
      id: 'goldMagnet', name: '黄金磁铁', icon: '🧲',
      description: '永久解锁：拾取范围 +20',
      price: 1000, consumable: false, category: 'permanent',
    },
    critRing: {
      id: 'critRing', name: '暴击戒指', icon: '💍',
      description: '永久解锁：暴击率 +3%',
      price: 1500, consumable: false, category: 'permanent',
    },
    speedBoots: {
      id: 'speedBoots', name: '疾风之靴', icon: '👟',
      description: '永久解锁：移速 +8%',
      price: 1200, consumable: false, category: 'permanent',
    },
    armorPlate: {
      id: 'armorPlate', name: '强化装甲', icon: '🛡️',
      description: '永久解锁：减伤 5%',
      price: 1800, consumable: false, category: 'permanent',
    },
  },

  // ============ ITEMS (20) ============
  ITEMS: [
    // --- Buffs (positive) ---
    { id: 'health_small', name: '小血包', type: 'buff', effect: 'heal', value: 20, duration: 0,
      color: '#44ff44', shape: 'cross', size: 12, weight: 30, dropText: '+20 HP' },
    { id: 'health_large', name: '大血包', type: 'buff', effect: 'heal', value: 50, duration: 0,
      color: '#00ff00', shape: 'cross', size: 16, weight: 15, dropText: '+50 HP' },
    { id: 'power_up', name: '火力升级', type: 'buff', effect: 'damageUp', value: 1.5, duration: 10000,
      color: '#ff8800', shape: 'star', size: 14, weight: 20, dropText: 'ATK UP!' },
    { id: 'power_up_big', name: '超级火力', type: 'buff', effect: 'damageUp', value: 2.5, duration: 6000,
      color: '#ff4400', shape: 'star', size: 18, weight: 8, dropText: 'SUPER ATK!' },
    { id: 'speed_boost', name: '速度提升', type: 'buff', effect: 'speedUp', value: 1.4, duration: 8000,
      color: '#44ddff', shape: 'diamond', size: 12, weight: 20, dropText: 'SPD UP!' },
    { id: 'fire_rate', name: '射速提升', type: 'buff', effect: 'fireRateUp', value: 1.6, duration: 8000,
      color: '#ffdd00', shape: 'diamond', size: 12, weight: 20, dropText: 'RATE UP!' },
    { id: 'shield_item', name: '护盾', type: 'buff', effect: 'shield', value: 30, duration: 12000,
      color: '#4488ff', shape: 'circle', size: 14, weight: 18, dropText: 'SHIELD' },
    { id: 'magnet_item', name: '磁铁', type: 'buff', effect: 'magnet', value: 150, duration: 10000,
      color: '#ff44ff', shape: 'circle', size: 14, weight: 15, dropText: 'MAGNET' },
    { id: 'invincible', name: '无敌', type: 'buff', effect: 'invincible', value: 1, duration: 5000,
      color: '#ffff00', shape: 'star', size: 16, weight: 6, dropText: 'INVINCIBLE!' },
    { id: 'xp_boost_item', name: '经验翻倍', type: 'buff', effect: 'xpBoost', value: 2.0, duration: 15000,
      color: '#aa66ff', shape: 'diamond', size: 14, weight: 12, dropText: 'XP x2!' },
    { id: 'slow_field', name: '减速力场', type: 'buff', effect: 'slowField', value: 0.5, duration: 8000,
      color: '#66ccff', shape: 'circle', size: 16, weight: 14, dropText: 'SLOW FIELD' },
    { id: 'crit_boost', name: '暴击提升', type: 'buff', effect: 'critBoost', value: 0.3, duration: 10000,
      color: '#ff0000', shape: 'star', size: 14, weight: 16, dropText: 'CRIT UP!' },
    { id: 'score_boost', name: '分数翻倍', type: 'buff', effect: 'scoreBoost', value: 2.0, duration: 15000,
      color: '#ffaa00', shape: 'star', size: 16, weight: 10, dropText: 'SCORE x2!' },

    // --- Debuffs (negative, avoid) ---
    { id: 'poison_item', name: '毒药', type: 'debuff', effect: 'poison', value: 15, duration: 5000,
      color: '#44aa22', shape: 'cross', size: 12, weight: 15, dropText: 'POISON!' },
    { id: 'slow_debuff', name: '减速', type: 'debuff', effect: 'speedDown', value: 0.5, duration: 5000,
      color: '#6666aa', shape: 'diamond', size: 12, weight: 15, dropText: 'SLOW!' },
    { id: 'weaken', name: '虚弱', type: 'debuff', effect: 'damageDown', value: 0.5, duration: 6000,
      color: '#884488', shape: 'diamond', size: 12, weight: 15, dropText: 'WEAK!' },
    { id: 'blind', name: '致盲', type: 'debuff', effect: 'blind', value: 1, duration: 4000,
      color: '#444444', shape: 'circle', size: 14, weight: 12, dropText: 'BLIND!' },
    { id: 'curse', name: '诅咒', type: 'debuff', effect: 'curse', value: 1.5, duration: 8000,
      color: '#882244', shape: 'star', size: 14, weight: 10, dropText: 'CURSED!' },
    { id: 'reverse', name: '反转', type: 'debuff', effect: 'reverseControl', value: 1, duration: 5000,
      color: '#ff00ff', shape: 'circle', size: 14, weight: 8, dropText: 'REVERSE!' },
    { id: 'explosive_item', name: '炸弹', type: 'debuff', effect: 'explode', value: 25, duration: 0,
      color: '#ff2222', shape: 'circle', size: 16, weight: 20, dropText: 'BOOM!' },
    // --- NEW: Buffs (15) ---
    { id: 'damage_reflect', name: '伤害反射', type: 'buff', effect: 'damageReflect', value: 0.3, duration: 10000,
      color: '#ff6644', shape: 'star', size: 14, weight: 14, dropText: 'REFLECT!' },
    { id: 'cooldown_reset', name: '冷却重置', type: 'buff', effect: 'cooldownReset', value: 1, duration: 0,
      color: '#ccbb88', shape: 'diamond', size: 16, weight: 8, dropText: 'RESET!' },
    { id: 'bullet_size_buff', name: '弹幕增大', type: 'buff', effect: 'bulletSizeUp', value: 1.8, duration: 10000,
      color: '#ff88ff', shape: 'circle', size: 14, weight: 16, dropText: 'BIG BULLETS!' },
    { id: 'pierce_buff', name: '穿透增强', type: 'buff', effect: 'pierceBuff', value: 3, duration: 12000,
      color: '#ffffff', shape: 'diamond', size: 14, weight: 14, dropText: 'PIERCE!' },
    { id: 'regen_boost', name: '回复增强', type: 'buff', effect: 'regenBoost', value: 3, duration: 8000,
      color: '#44ff44', shape: 'cross', size: 14, weight: 16, dropText: 'REGEN!' },
    { id: 'armor_buff', name: '护甲增强', type: 'buff', effect: 'armor', value: 0.3, duration: 12000,
      color: '#8888cc', shape: 'circle', size: 14, weight: 16, dropText: 'ARMOR UP!' },
    { id: 'speed_aura', name: '速度光环', type: 'buff', effect: 'speedAura', value: 1.3, duration: 8000,
      color: '#44ddff', shape: 'circle', size: 16, weight: 14, dropText: 'SPEED AURA!' },
    { id: 'attack_aura', name: '攻击光环', type: 'buff', effect: 'attackAura', value: 1.4, duration: 8000,
      color: '#ff4400', shape: 'star', size: 16, weight: 14, dropText: 'ATK AURA!' },
    { id: 'dodge_buff', name: '闪避提升', type: 'buff', effect: 'dodgeUp', value: 0.25, duration: 10000,
      color: '#aa88ff', shape: 'diamond', size: 14, weight: 14, dropText: 'DODGE UP!' },
    { id: 'lifesteal_boost', name: '吸血增强', type: 'buff', effect: 'lifestealUp', value: 0.15, duration: 10000,
      color: '#ff3366', shape: 'cross', size: 14, weight: 14, dropText: 'LIFESTEAL!' },
    { id: 'crit_damage_buff', name: '暴伤提升', type: 'buff', effect: 'critDamageUp', value: 1.0, duration: 10000,
      color: '#ff0000', shape: 'star', size: 14, weight: 14, dropText: 'CRIT DMG!' },
    { id: 'bullet_count_buff', name: '多重射击', type: 'buff', effect: 'bulletCountUp', value: 2, duration: 10000,
      color: '#ffcc00', shape: 'star', size: 16, weight: 12, dropText: 'MULTI SHOT!' },
    { id: 'magnet_range_buff', name: '磁铁范围', type: 'buff', effect: 'magnetRange', value: 200, duration: 10000,
      color: '#ff44ff', shape: 'circle', size: 14, weight: 16, dropText: 'MAGNET+' },
    { id: 'xp_explosion', name: '经验爆发', type: 'buff', effect: 'xpExplosion', value: 100, duration: 0,
      color: '#ffdd00', shape: 'star', size: 16, weight: 10, dropText: '+100 XP!' },
    { id: 'invincible_short', name: '短暂无敌', type: 'buff', effect: 'invincible', value: 1, duration: 3000,
      color: '#ffdd00', shape: 'star', size: 14, weight: 8, dropText: 'BRIEF INVINCIBLE!' },

    // --- NEW: Debuffs (5) ---
    { id: 'confusion', name: '混乱', type: 'debuff', effect: 'confusion', value: 1, duration: 5000,
      color: '#ff66ff', shape: 'circle', size: 14, weight: 12, dropText: 'CONFUSED!' },
    { id: 'shrink', name: '缩小', type: 'debuff', effect: 'shrink', value: 0.5, duration: 6000,
      color: '#88cc44', shape: 'diamond', size: 12, weight: 10, dropText: 'SHRINK!' },
    { id: 'silence', name: '沉默', type: 'debuff', effect: 'silence', value: 1, duration: 5000,
      color: '#666688', shape: 'circle', size: 14, weight: 12, dropText: 'SILENCED!' },
    { id: 'vulnerability', name: '易伤', type: 'debuff', effect: 'vulnerability', value: 1.5, duration: 6000,
      color: '#882222', shape: 'cross', size: 14, weight: 14, dropText: 'VULNERABLE!' },
    { id: 'gravity_trap', name: '重力陷阱', type: 'debuff', effect: 'gravityTrap', value: 0.4, duration: 5000,
      color: '#6644aa', shape: 'circle', size: 16, weight: 12, dropText: 'TRAPPED!' },
  ],

  // ============ ENEMY TYPES ============
  ENEMIES: {
    small: {
      type: 'small', name: '小兵',
      hp: 10, speed: 100, damage: 8, score: 50, xp: 8,
      size: 10, color: '#ff6666',
      ai: 'cross', // cross, follow, spiral, straight
      fireRate: 2500, bulletSpeed: 200, bulletDamage: 8, bulletColor: '#ff8888',
      dropRate: 0.08,
    },
    fastSmall: {
      type: 'fastSmall', name: '快速兵',
      hp: 10, speed: 220, damage: 12, score: 60, xp: 10,
      size: 8, color: '#ffaa44',
      ai: 'straight', fireRate: 3000, bulletSpeed: 250, bulletDamage: 8, bulletColor: '#ffaa44',
      dropRate: 0.1,
    },
    medium: {
      type: 'medium', name: '中型机',
      hp: 50, speed: 80, damage: 18, score: 150, xp: 25,
      size: 16, color: '#ff4444',
      ai: 'follow', fireRate: 1800, bulletSpeed: 280, bulletDamage: 10, bulletColor: '#ff4444',
      bulletCount: 3, spreadAngle: 15,
      dropRate: 0.2,
    },
    obstacle: {
      type: 'obstacle', name: '障碍物',
      hp: 200, speed: 40, damage: 30, score: 200, xp: 40,
      size: 30, color: '#888888',
      ai: 'straight', fireRate: 0,
      dropRate: 0,
    },
    elite: {
      type: 'elite', name: '精英机',
      hp: 200, speed: 70, damage: 25, score: 500, xp: 80,
      size: 22, color: '#ff00ff',
      ai: 'follow', fireRate: 1200, bulletSpeed: 320, bulletDamage: 12, bulletColor: '#ff44ff',
      bulletCount: 5, spreadAngle: 20,
      dropRate: 0.4,
    },
    sniper: {
      type: 'sniper', name: '狙击机',
      hp: 80, speed: 60, damage: 15, score: 300, xp: 50,
      size: 14, color: '#ffcc00',
      ai: 'aimed', fireRate: 2000, bulletSpeed: 450, bulletDamage: 15, bulletColor: '#ffcc00',
      dropRate: 0.25,
    },
    // --- New Enemy Types ---
    splitter: {
      type: 'splitter', name: '分裂者',
      hp: 40, speed: 90, damage: 12, score: 120, xp: 20,
      size: 13, color: '#ff88aa',
      ai: 'splitter', fireRate: 3500, bulletSpeed: 220, bulletDamage: 8, bulletColor: '#ff88aa',
      dropRate: 0.15,
      splitCount: 2, splitType: 'small',
    },
    shielder: {
      type: 'shielder', name: '护盾兵',
      hp: 30, speed: 70, damage: 15, score: 200, xp: 35,
      size: 15, color: '#44aaff',
      ai: 'shielder', fireRate: 2000, bulletSpeed: 240, bulletDamage: 10, bulletColor: '#44aaff',
      dropRate: 0.25,
      shieldHp: 80, shieldRegenDelay: 5000, shieldRegenRate: 20, shieldColor: '#88ccff',
    },
    charger: {
      type: 'charger', name: '冲锋兵',
      hp: 60, speed: 50, damage: 20, score: 180, xp: 30,
      size: 12, color: '#ffff44',
      ai: 'charger', fireRate: 0, bulletSpeed: 0, bulletDamage: 0, bulletColor: '#ffff44',
      dropRate: 0.2,
      chargeSpeed: 500, chargeInterval: 4000,
    },
    weaver: {
      type: 'weaver', name: '蜿蜒者',
      hp: 35, speed: 80, damage: 12, score: 140, xp: 22,
      size: 11, color: '#44ff88',
      ai: 'weaver', fireRate: 2500, bulletSpeed: 200, bulletDamage: 8, bulletColor: '#44ff88',
      dropRate: 0.18,
    },
    teleporter: {
      type: 'teleporter', name: '瞬移者',
      hp: 45, speed: 0, damage: 18, score: 220, xp: 38,
      size: 14, color: '#cc44ff',
      ai: 'teleporter', fireRate: 1500, bulletSpeed: 280, bulletDamage: 10, bulletColor: '#cc44ff',
      bulletCount: 3, spreadAngle: 30,
      dropRate: 0.22,
      teleportInterval: 3000,
    },
    spawner: {
      type: 'spawner', name: '召唤者',
      hp: 100, speed: 30, damage: 15, score: 350, xp: 60,
      size: 20, color: '#ff8844',
      ai: 'spawner', fireRate: 3000, bulletSpeed: 180, bulletDamage: 8, bulletColor: '#ff8844',
      dropRate: 0.35,
      spawnInterval: 4000, spawnType: 'small', maxMinions: 4,
    },
    tank: {
      type: 'tank', name: '重装机',
      hp: 500, speed: 30, damage: 35, score: 400, xp: 80,
      size: 28, color: '#884422',
      ai: 'tank', fireRate: 2500, bulletSpeed: 160, bulletDamage: 12, bulletColor: '#884422',
      bulletCount: 3, spreadAngle: 25,
      dropRate: 0.3,
    },
    sniperElite: {
      type: 'sniperElite', name: '精英狙击',
      hp: 120, speed: 0, damage: 25, score: 300, xp: 55,
      size: 16, color: '#ff4444',
      ai: 'sniperElite', fireRate: 1800, bulletSpeed: 550, bulletDamage: 20, bulletColor: '#ff4444',
      bulletCount: 3, spreadAngle: 8,
      dropRate: 0.3,
    },
    swarmer: {
      type: 'swarmer', name: '蜂群',
      hp: 20, speed: 100, damage: 8, score: 50, xp: 8,
      size: 7, color: '#88ff44',
      ai: 'swarmer', fireRate: 4000, bulletSpeed: 150, bulletDamage: 6, bulletColor: '#88ff44',
      dropRate: 0.05,
      groupSize: 5,
    },
    kamikaze: {
      type: 'kamikaze', name: '自爆兵',
      hp: 25, speed: 250, damage: 40, score: 100, xp: 15,
      size: 11, color: '#ff2222',
      ai: 'kamikaze', fireRate: 0, bulletSpeed: 0, bulletDamage: 0, bulletColor: '#ff2222',
      dropRate: 0.05,
      explodeDamage: 40, explodeRadius: 80,
    },
    // --- Boss Types ---
    boss: {
      type: 'boss', name: 'BOSS',
      hp: 5000, speed: 40, damage: 50, score: 5000, xp: 500,
      size: 50, color: '#ff0000',
      ai: 'boss', fireRate: 500, bulletSpeed: 250, bulletDamage: 15, bulletColor: '#ff0000',
      bulletCount: 12, spreadAngle: 360,
      dropRate: 1.0,
      phases: [
        { hpThreshold: 0.7, bulletCount: 16, spreadAngle: 360, fireRate: 400 },
        { hpThreshold: 0.4, bulletCount: 24, spreadAngle: 360, fireRate: 300, bulletSpeed: 300 },
        { hpThreshold: 0.15, bulletCount: 36, spreadAngle: 360, fireRate: 200, bulletSpeed: 350 },
      ]
    },
    boss_guardian: {
      type: 'boss_guardian', name: '守护者',
      hp: 8000, speed: 30, damage: 40, score: 8000, xp: 700,
      size: 55, color: '#4488ff',
      ai: 'boss_guardian', fireRate: 600, bulletSpeed: 220, bulletDamage: 15, bulletColor: '#4488ff',
      bulletCount: 8, spreadAngle: 360,
      dropRate: 1.0,
      shieldCount: 3, shieldHpEach: 200,
      phases: [
        { hpThreshold: 0.66, bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 250 },
        { hpThreshold: 0.33, bulletCount: 16, spreadAngle: 360, fireRate: 400, bulletSpeed: 280 },
      ],
    },
    boss_summoner: {
      type: 'boss_summoner', name: '召唤之主',
      hp: 6000, speed: 25, damage: 35, score: 7500, xp: 650,
      size: 50, color: '#aa44ff',
      ai: 'boss_summoner', fireRate: 800, bulletSpeed: 200, bulletDamage: 12, bulletColor: '#aa44ff',
      bulletCount: 6, spreadAngle: 360,
      dropRate: 1.0,
      spawnInterval: 3000,
      phases: [
        { hpThreshold: 0.5, bulletCount: 10, spreadAngle: 360, fireRate: 600, bulletSpeed: 240 },
      ],
    },
    boss_dragon: {
      type: 'boss_dragon', name: '龙王',
      hp: 10000, speed: 35, damage: 45, score: 10000, xp: 800,
      size: 60, color: '#ff6600',
      ai: 'boss_dragon', fireRate: 500, bulletSpeed: 240, bulletDamage: 18, bulletColor: '#ff6600',
      bulletCount: 10, spreadAngle: 45,
      dropRate: 1.0,
      phases: [
        { hpThreshold: 0.6, bulletCount: 15, spreadAngle: 60, fireRate: 400, bulletSpeed: 280 },
        { hpThreshold: 0.3, bulletCount: 20, spreadAngle: 90, fireRate: 300, bulletSpeed: 320 },
      ],
    },
    boss_phantom: {
      type: 'boss_phantom', name: '幽灵领主',
      hp: 8000, speed: 50, damage: 35, score: 12000, xp: 900,
      size: 45, color: '#88ffff',
      ai: 'boss_phantom', fireRate: 400, bulletSpeed: 280, bulletDamage: 20, bulletColor: '#88ffff',
      bulletCount: 8, spreadAngle: 360,
      dropRate: 1.0,
      phases: [
        { hpThreshold: 0.7, bulletCount: 12, fireRate: 300, bulletSpeed: 320 },
        { hpThreshold: 0.4, bulletCount: 16, fireRate: 200, bulletSpeed: 360, teleportCooldown: 1500 },
      ],
    },
  },

  // ============ WAVE DEFINITIONS ============
  WAVES: {
    // Waves are procedural based on score + time
    // This defines the templates and scaling rules
    spawnRules: {
      baseInterval: 4500,
      minInterval: 800,
      maxEnemiesOnScreen: 15,
      groups: [
        // Difficulty 0 (start): just small enemies
        { minDifficulty: 0, templates: [
          { enemy: 'small', count: 2, spacing: 80, pattern: 'line' },
        ]},
        // Difficulty 1: small + fast + obstacle chance
        { minDifficulty: 1, templates: [
          { enemy: 'small', count: 3, spacing: 70, pattern: 'v' },
          { enemy: 'fastSmall', count: 2, spacing: 80, pattern: 'random' },
          { enemy: 'obstacle', count: 1, spacing: 60, pattern: 'random' },
        ]},
        // Difficulty 2: mediums + new types + obstacles
        { minDifficulty: 2, templates: [
          { enemy: 'small', count: 4, spacing: 60, pattern: 'circle' },
          { enemy: 'fastSmall', count: 3, spacing: 60, pattern: 'random' },
          { enemy: 'medium', count: 1, spacing: 80, pattern: 'line' },
          { enemy: 'weaver', count: 1, spacing: 70, pattern: 'wave' },
          { enemy: 'obstacle', count: 2, spacing: 70, pattern: 'random' },
        ]},
        // Difficulty 3: elites + more variety + obstacles
        { minDifficulty: 3, templates: [
          { enemy: 'small', count: 5, spacing: 50, pattern: 'wave' },
          { enemy: 'medium', count: 2, spacing: 70, pattern: 'v' },
          { enemy: 'elite', count: 1, spacing: 0, pattern: 'single' },
          { enemy: 'sniper', count: 1, spacing: 100, pattern: 'line' },
          { enemy: 'charger', count: 1, spacing: 90, pattern: 'random' },
          { enemy: 'obstacle', count: 2, spacing: 80, pattern: 'random' },
        ]},
        // Difficulty 4+: heavy + all types
        { minDifficulty: 4, templates: [
          { enemy: 'small', count: 10, spacing: 35, pattern: 'random' },
          { enemy: 'medium', count: 5, spacing: 60, pattern: 'circle' },
          { enemy: 'elite', count: 2, spacing: 120, pattern: 'line' },
          { enemy: 'sniper', count: 3, spacing: 80, pattern: 'random' },
          { enemy: 'obstacle', count: 2, spacing: 100, pattern: 'random' },
          { enemy: 'sniperElite', count: 2, spacing: 120, pattern: 'line' },
          { enemy: 'spawner', count: 2, spacing: 130, pattern: 'random' },
          { enemy: 'tank', count: 1, spacing: 0, pattern: 'single' },
          { enemy: 'shielder', count: 3, spacing: 70, pattern: 'v' },
        ]},
        // Difficulty 5+: extreme
        { minDifficulty: 5, templates: [
          { enemy: 'elite', count: 4, spacing: 120, pattern: 'circle' },
          { enemy: 'sniperElite', count: 3, spacing: 100, pattern: 'line' },
          { enemy: 'tank', count: 2, spacing: 150, pattern: 'line' },
          { enemy: 'spawner', count: 3, spacing: 120, pattern: 'random' },
          { enemy: 'charger', count: 4, spacing: 80, pattern: 'random' },
          { enemy: 'kamikaze', count: 6, spacing: 50, pattern: 'random' },
        ]},
      ],
    },
    bossTriggers: [5000, 25000, 50000, 80000, 120000, 170000, 230000, 300000],

    // ============ ENEMY POOL (Random Spawn System) ============
    // Each enemy has: weight (higher = more likely), minWave (earliest wave it can appear)
    // The system randomly selects enemies from the pool based on weights
    enemyPool: {
      // Basic enemies (available from wave 1)
      small:      { weight: 40, minWave: 1 },
      fastSmall:  { weight: 25, minWave: 1 },
      // Medium enemies (wave 3+)
      medium:     { weight: 20, minWave: 3 },
      obstacle:   { weight: 10, minWave: 2 },
      // Advanced enemies (wave 5+)
      splitter:   { weight: 15, minWave: 5 },
      shielder:   { weight: 12, minWave: 5 },
      charger:    { weight: 12, minWave: 5 },
      weaver:     { weight: 10, minWave: 6 },
      teleporter: { weight: 8, minWave: 7 },
      // Elite enemies (wave 8+)
      elite:      { weight: 10, minWave: 8 },
      sniper:     { weight: 10, minWave: 8 },
      // Heavy enemies (wave 12+)
      tank:       { weight: 8, minWave: 12 },
      sniperElite:{ weight: 6, minWave: 12 },
      spawner:    { weight: 5, minWave: 12 },
      // Extreme enemies (wave 15+)
      kamikaze:   { weight: 8, minWave: 15 },
    },

    // Spawn count per wave: base + wave * multiplier, with random variance
    spawnCountBase: 5,
    spawnCountPerWave: 1.5,
    spawnCountVariance: 0.3, // ±30% random variance
  },

  // ============ PARTICLES ============
  PARTICLE_PRESETS: {
    explosion: { count: 15, speed: 200, life: 500, colors: ['#ff4400', '#ff8800', '#ffcc00', '#ff0000'], size: 3 },
    smallExplosion: { count: 6, speed: 120, life: 300, colors: ['#ff6600', '#ffaa00'], size: 2 },
    spark: { count: 3, speed: 80, life: 200, colors: ['#ffff00', '#ffffff'], size: 1.5 },
    bossExplosion: { count: 40, speed: 300, life: 800, colors: ['#ff0000', '#ff4400', '#ff8800', '#ffff00', '#ffffff'], size: 5 },
    heal: { count: 8, speed: 60, life: 400, colors: ['#44ff44', '#88ff88', '#ffffff'], size: 2 },
    levelUp: { count: 25, speed: 150, life: 600, colors: ['#ffdd00', '#ffaa00', '#ffffff', '#ff66ff'], size: 3 },
    hit: { count: 4, speed: 50, life: 250, colors: ['#ffffff', '#ffcc00'], size: 2 },
  },

  // ============ COLORS / THEME ============
  COLORS: {
    background: '#0a0a1a',
    backgroundStars: ['#ffffff', '#aaaaee', '#8888cc', '#6666aa'],
    player: '#44ddff',
    playerGlow: '#22aacc',
    playerTrail: '#116688',
    hud: '#ffffff',
    hudWarning: '#ff4444',
    menuText: '#ffffff',
    menuHighlight: '#ffdd00',
    overlay: 'rgba(0,0,0,0.7)',
    rarityCommon: '#aaaaaa',
    rarityUncommon: '#44dd44',
    rarityRare: '#4488ff',
    rarityEpic: '#aa44ff',
    rarityLegendary: '#ffaa00',
  },

  // ============ UPGRADES (Permanent Progression) ============
  UPGRADES: {
    attackPower: {
      id: 'attackPower',
      name: '攻击强化',
      icon: '⚔️',
      description: '永久提升攻击力',
      effectDesc: function(level) { return '攻击力 +' + (level * 10) + '%'; },
      maxLevel: 10,
      statMod: function(level) { return { stat: 'attack', op: 'multiply', value: level * 0.10 }; }
    },
    maxHp: {
      id: 'maxHp',
      name: '生命强化',
      icon: '❤️',
      description: '永久提升最大生命值',
      effectDesc: function(level) { return '最大HP +' + (level * 15); },
      maxLevel: 10,
      statMod: function(level) { return { stat: 'hp', op: 'add', value: level * 15 }; }
    },
    moveSpeed: {
      id: 'moveSpeed',
      name: '移速强化',
      icon: '💨',
      description: '永久提升移动速度',
      effectDesc: function(level) { return '移速 +' + (level * 5) + '%'; },
      maxLevel: 10,
      statMod: function(level) { return { stat: 'speed', op: 'multiply', value: level * 0.05 }; }
    },
    initialWeapon: {
      id: 'initialWeapon',
      name: '初始武器等级',
      icon: '🔫',
      description: '提升游戏开始时的武器等级',
      effectDesc: function(level) { return '初始武器 Lv.' + level; },
      maxLevel: 3
    },
    xpMultiplier: {
      id: 'xpMultiplier',
      name: '经验加成',
      icon: '📈',
      description: '永久提升获得的经验值',
      effectDesc: function(level) { return '经验获取 +' + (level * 10) + '%'; },
      maxLevel: 10
    },
    dropRate: {
      id: 'dropRate',
      name: '掉落加成',
      icon: '💎',
      description: '永久提升道具掉落率',
      effectDesc: function(level) { return '掉落率 +' + (level * 5) + '%'; },
      maxLevel: 10
    },
    costFormula: function(level) {
      return 100 * Math.pow(2, level);
    },
  },

  // ============ CHARACTERS (3) ============
  CHARACTERS: {
    vanguard: {
      id: 'vanguard', name: '先锋战机', icon: '🚀',
      description: '均衡型战机，攻击+15%',
      unlockCondition: 'default',
      baseStats: { attack: 1.15, hp: 1.0, speed: 1.0, critRate: 0.05, critMult: 1.5 },
      color: '#44ddff', trailColor: '#22aacc',
    },
    fortress: {
      id: 'fortress', name: '铁壁战机', icon: '🛡️',
      description: '防御型战机，生命+30%',
      unlockCondition: 'kill_500',
      baseStats: { attack: 1.0, hp: 1.3, speed: 0.95, critRate: 0.05, critMult: 1.5 },
      color: '#ff8844', trailColor: '#cc6622',
    },
    agile: {
      id: 'agile', name: '灵动战机', icon: '💨',
      description: '速度型战机，移速+20%',
      unlockCondition: 'defeat_boss',
      baseStats: { attack: 0.95, hp: 0.9, speed: 1.2, critRate: 0.08, critMult: 1.5 },
      color: '#88ff88', trailColor: '#44cc44',
    },
  },

  // ============ DIFFICULTY (3 levels) ============
  DIFFICULTY: {
    normal: {
      id: 'normal', name: '普通', icon: '⭐',
      description: '标准难度，适合新手',
      enemyHpMult: 1.0, enemyDamageMult: 1.0, spawnRateMult: 1.0,
      xpMult: 1.0, dropRateMult: 1.0, scoreMult: 1.0,
      bossHpMult: 1.0, eliteChance: 0.05,
    },
    hard: {
      id: 'hard', name: '困难', icon: '⭐⭐',
      description: '敌人血量×1.5，伤害×1.3，刷新率×1.2',
      enemyHpMult: 1.5, enemyDamageMult: 1.3, spawnRateMult: 1.2,
      xpMult: 1.3, dropRateMult: 1.1, scoreMult: 1.5,
      bossHpMult: 1.5, eliteChance: 0.10,
    },
    hell: {
      id: 'hell', name: '地狱', icon: '⭐⭐⭐',
      description: '敌人血量×2.5，伤害×2.0，刷新率×1.5',
      enemyHpMult: 2.5, enemyDamageMult: 2.0, spawnRateMult: 1.5,
      xpMult: 1.8, dropRateMult: 1.3, scoreMult: 2.5,
      bossHpMult: 2.5, eliteChance: 0.20,
    },
  },

  // ============ TALENTS (5 branches x 5 layers, 90 nodes) ============
  TALENTS: {
    branches: ['attack', 'defense', 'utility', 'elemental', 'ultimate'],
    pointsPerRun: 5,
    bonusPointsPerBoss: 1,
    attack: {
      id: 'attack', name: '攻击', icon: '⚔️', color: '#ff4444',
      layers: [
        [
          { id: 'atk_1a', name: '锋刃', description: '攻击力+10%', effect: { stat: 'attack', op: 'multiply', value: 0.10 } },
          { id: 'atk_1b', name: '穿甲', description: '暴击伤害+15%', effect: { stat: 'critMult', op: 'add', value: 0.15 } },
          { id: 'atk_1c', name: '连射', description: '攻击速度+8%', effect: { stat: 'attackSpeed', op: 'multiply', value: -0.08 } },
        ],
        [
          { id: 'atk_2a', name: '暴风', description: '攻击力+20%', effect: { stat: 'attack', op: 'multiply', value: 0.20 } },
          { id: 'atk_2b', name: '致命', description: '暴击率+5%', effect: { stat: 'critRate', op: 'add', value: 0.05 } },
          { id: 'atk_2c', name: '狂怒', description: 'HP低于50%时攻击力+30%', effect: { stat: 'attack', op: 'conditional', value: 0.30, condition: 'hpBelow50' } },
          { id: 'atk_2d', name: '破甲', description: '无视敌人10%防御', effect: { stat: 'armorPen', op: 'add', value: 0.10 } },
        ],
        [
          { id: 'atk_3a', name: '碎甲', description: '无视敌人20%防御', effect: { stat: 'armorPen', op: 'add', value: 0.20 } },
          { id: 'atk_3b', name: '暴走', description: '攻击速度+15%，攻击力+10%', effect: { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.15 }, { stat: 'attack', op: 'multiply', value: 0.10 }] } },
          { id: 'atk_3c', name: '精准', description: '暴击率+10%', effect: { stat: 'critRate', op: 'add', value: 0.10 } },
          { id: 'atk_3d', name: '穿透', description: '子弹穿透2个敌人', effect: { stat: 'pierceCount', op: 'add', value: 2 } },
        ],
        [
          { id: 'atk_4a', name: '毁灭', description: '攻击力+35%', effect: { stat: 'attack', op: 'multiply', value: 0.35 } },
          { id: 'atk_4b', name: '处决', description: 'HP低于30%的敌人受到50%额外伤害', effect: { stat: 'executeDmg', op: 'add', value: 0.50 } },
          { id: 'atk_4c', name: '连锁攻击', description: '攻击额外弹射2个敌人', effect: { stat: 'chainCount', op: 'add', value: 2 } },
          { id: 'atk_4d', name: '致命一击', description: '暴击率+15%，暴击伤害+30%', effect: { multi: [{ stat: 'critRate', op: 'add', value: 0.15 }, { stat: 'critMult', op: 'add', value: 0.30 }] } },
        ],
        [
          { id: 'atk_5a', name: '弑神', description: '攻击力+50%，暴击率+20%', effect: { multi: [{ stat: 'attack', op: 'multiply', value: 0.50 }, { stat: 'critRate', op: 'add', value: 0.20 }] } },
          { id: 'atk_5b', name: '天诛', description: '对Boss伤害+80%', effect: { stat: 'bossDamageBonus', op: 'add', value: 0.80 } },
          { id: 'atk_5c', name: '灭世', description: '暴击时有15%概率秒杀普通敌人', effect: { stat: 'critExecute', op: 'add', value: 0.15 } },
        ],
      ],
    },
    defense: {
      id: 'defense', name: '防御', icon: '🛡️', color: '#4488ff',
      layers: [
        [
          { id: 'def_1a', name: '铁壁', description: '最大HP+15%', effect: { stat: 'hp', op: 'multiply', value: 0.15 } },
          { id: 'def_1b', name: '护甲', description: '受到伤害-10%', effect: { stat: 'defense', op: 'add', value: 0.10 } },
          { id: 'def_1c', name: '闪避', description: '闪避率+5%', effect: { stat: 'dodgeChance', op: 'add', value: 0.05 } },
        ],
        [
          { id: 'def_2a', name: '坚韧', description: '最大HP+25%', effect: { stat: 'hp', op: 'multiply', value: 0.25 } },
          { id: 'def_2b', name: '再生', description: '每秒恢复1HP', effect: { stat: 'hpRegen', op: 'add', value: 1.0 } },
          { id: 'def_2c', name: '反伤', description: '反弹10%受到的伤害', effect: { stat: 'reflectDamage', op: 'add', value: 0.10 } },
          { id: 'def_2d', name: '格挡', description: '10%概率完全格挡攻击', effect: { stat: 'blockChance', op: 'add', value: 0.10 } },
        ],
        [
          { id: 'def_3a', name: '不屈', description: 'HP低于25%时防御+50%', effect: { stat: 'defense', op: 'conditional', value: 0.50, condition: 'hpBelow25' } },
          { id: 'def_3b', name: '生命涌泉', description: '每秒恢复3HP', effect: { stat: 'hpRegen', op: 'add', value: 3.0 } },
          { id: 'def_3c', name: '护盾', description: '获得30点护盾', effect: { stat: 'shieldAmount', op: 'add', value: 30 } },
          { id: 'def_3d', name: '韧性', description: '控制效果持续时间-30%', effect: { stat: 'ccReduction', op: 'add', value: 0.30 } },
        ],
        [
          { id: 'def_4a', name: '圣盾', description: '每60秒抵挡1次致命伤害', effect: { stat: 'lethalBlock', op: 'add', value: 1, cooldown: 60000 } },
          { id: 'def_4b', name: '钢铁', description: '最大HP+40%', effect: { stat: 'hp', op: 'multiply', value: 0.40 } },
          { id: 'def_4c', name: '吸血光环', description: '造成伤害的1%转化为HP', effect: { stat: 'lifesteal', op: 'add', value: 0.01 } },
          { id: 'def_4d', name: '荆棘之甲', description: '反弹25%受到的伤害', effect: { stat: 'reflectDamage', op: 'add', value: 0.25 } },
        ],
        [
          { id: 'def_5a', name: '不灭', description: '最大HP+60%，死亡时复活1次并恢复全部HP', effect: { multi: [{ stat: 'hp', op: 'multiply', value: 0.60 }, { stat: 'revive', op: 'add', value: 1 }] } },
          { id: 'def_5b', name: '金刚不坏', description: '受到致命伤害时，10%概率完全抵消', effect: { stat: 'lethalDodge', op: 'add', value: 0.10 } },
          { id: 'def_5c', name: '生命洪流', description: '每秒恢复5HP，最大HP+30%', effect: { multi: [{ stat: 'hpRegen', op: 'add', value: 5.0 }, { stat: 'hp', op: 'multiply', value: 0.30 }] } },
        ],
      ],
    },
    utility: {
      id: 'utility', name: '功能', icon: '🔧', color: '#ffdd00',
      layers: [
        [
          { id: 'utl_1a', name: '疾走', description: '移动速度+10%', effect: { stat: 'speed', op: 'multiply', value: 0.10 } },
          { id: 'utl_1b', name: '贪婪', description: '经验获取+15%', effect: { stat: 'xpMultiplier', op: 'multiply', value: 0.15 } },
          { id: 'utl_1c', name: '幸运', description: '掉落率+10%', effect: { stat: 'dropRate', op: 'multiply', value: 0.10 } },
        ],
        [
          { id: 'utl_2a', name: '疾风', description: '移动速度+20%', effect: { stat: 'speed', op: 'multiply', value: 0.20 } },
          { id: 'utl_2b', name: '磁铁', description: '拾取范围+50px', effect: { stat: 'pickupRange', op: 'add', value: 50 } },
          { id: 'utl_2c', name: '猎手', description: '得分+20%', effect: { stat: 'scoreMultiplier', op: 'multiply', value: 0.20 } },
          { id: 'utl_2d', name: '侦察', description: '视野范围+25%', effect: { stat: 'viewRange', op: 'multiply', value: 0.25 } },
        ],
        [
          { id: 'utl_3a', name: '瞬移', description: '获得闪现技能(30秒冷却)', effect: { stat: 'dashAbility', op: 'add', value: 1, cooldown: 30000 } },
          { id: 'utl_3b', name: '经验涌泉', description: '经验获取+30%', effect: { stat: 'xpMultiplier', op: 'multiply', value: 0.30 } },
          { id: 'utl_3c', name: '寻宝', description: '掉落率+20%', effect: { stat: 'dropRate', op: 'multiply', value: 0.20 } },
          { id: 'utl_3d', name: '连击大师', description: '连击超时时间+2秒', effect: { stat: 'comboTimeout', op: 'add', value: 2000 } },
        ],
        [
          { id: 'utl_4a', name: '时空扭曲', description: '技能冷却-20%', effect: { stat: 'cooldownReduction', op: 'add', value: 0.20 } },
          { id: 'utl_4b', name: '赏金猎人', description: '得分+40%', effect: { stat: 'scoreMultiplier', op: 'multiply', value: 0.40 } },
          { id: 'utl_4c', name: '超级磁铁', description: '拾取范围+100px', effect: { stat: 'pickupRange', op: 'add', value: 100 } },
          { id: 'utl_4d', name: '幸运星', description: '稀有掉落率+30%', effect: { stat: 'rareDropRate', op: 'multiply', value: 0.30 } },
        ],
        [
          { id: 'utl_5a', name: '超速', description: '移动速度+40%，经验获取+50%', effect: { multi: [{ stat: 'speed', op: 'multiply', value: 0.40 }, { stat: 'xpMultiplier', op: 'multiply', value: 0.50 }] } },
          { id: 'utl_5b', name: '聚宝盆', description: '掉落率+50%，得分+60%', effect: { multi: [{ stat: 'dropRate', op: 'multiply', value: 0.50 }, { stat: 'scoreMultiplier', op: 'multiply', value: 0.60 }] } },
          { id: 'utl_5c', name: '时空旅者', description: '技能冷却-35%，拾取范围+150px', effect: { multi: [{ stat: 'cooldownReduction', op: 'add', value: 0.35 }, { stat: 'pickupRange', op: 'add', value: 150 }] } },
        ],
      ],
    },
    elemental: {
      id: 'elemental', name: '元素', icon: '🌀', color: '#ff8800',
      layers: [
        [
          { id: 'ele_1a', name: '火焰附魔', description: '攻击附带灼烧(5伤害/2秒)', effect: { stat: 'burnDamage', op: 'add', value: 5 } },
          { id: 'ele_1b', name: '冰霜附魔', description: '攻击附带减速(30%/2秒)', effect: { stat: 'slowAmount', op: 'add', value: 0.30 } },
          { id: 'ele_1c', name: '雷电附魔', description: '攻击附带闪电链(弹射2次)', effect: { stat: 'chainLightningChance', op: 'add', value: 0.15 } },
        ],
        [
          { id: 'ele_2a', name: '烈焰', description: '灼烧伤害+50%', effect: { stat: 'burnDamage', op: 'multiply', value: 0.50 } },
          { id: 'ele_2b', name: '寒冰', description: '减速效果+50%', effect: { stat: 'slowAmount', op: 'multiply', value: 0.50 } },
          { id: 'ele_2c', name: '雷霆', description: '闪电链+2次弹射', effect: { stat: 'chainCount', op: 'add', value: 2 } },
          { id: 'ele_2d', name: '元素亲和', description: '元素伤害+25%', effect: { stat: 'elementalBonus', op: 'multiply', value: 0.25 } },
        ],
        [
          { id: 'ele_3a', name: '陨石', description: '每20秒召唤陨石(80伤害/范围)', effect: { stat: 'meteorAbility', op: 'add', value: 80, cooldown: 20000 } },
          { id: 'ele_3b', name: '暴风雪', description: '每25秒召唤暴风雪(持续3秒/减速40%)', effect: { stat: 'blizzardAbility', op: 'add', value: 1, cooldown: 25000 } },
          { id: 'ele_3c', name: '闪电链', description: '闪电链弹射5次', effect: { stat: 'chainCount', op: 'set', value: 5 } },
          { id: 'ele_3d', name: '元素爆发', description: '元素效果触发时，15%概率造成双倍伤害', effect: { stat: 'elementalCrit', op: 'add', value: 0.15 } },
        ],
        [
          { id: 'ele_4a', name: '炼狱', description: '灼烧伤害+100%，可传播给周围敌人', effect: { multi: [{ stat: 'burnDamage', op: 'multiply', value: 1.00 }, { stat: 'burnSpread', op: 'add', value: 0.30 }] } },
          { id: 'ele_4b', name: '绝对零度', description: '20%概率冰冻敌人2秒', effect: { stat: 'freezeChance', op: 'add', value: 0.20 } },
          { id: 'ele_4c', name: '等离子', description: '闪电链+3次弹射，伤害+50%', effect: { multi: [{ stat: 'chainCount', op: 'add', value: 3 }, { stat: 'chainDamage', op: 'multiply', value: 0.50 }] } },
          { id: 'ele_4d', name: '元素穿透', description: '元素效果无视敌人30%抗性', effect: { stat: 'elementalPen', op: 'add', value: 0.30 } },
        ],
        [
          { id: 'ele_5a', name: '元素风暴', description: '所有元素效果+80%', effect: { multi: [{ stat: 'burnDamage', op: 'multiply', value: 0.80 }, { stat: 'slowAmount', op: 'multiply', value: 0.80 }, { stat: 'chainDamage', op: 'multiply', value: 0.80 }] } },
          { id: 'ele_5b', name: '元素共鸣', description: '同时触发所有元素效果(灼烧+冰冻+闪电)', effect: { stat: 'allElements', op: 'add', value: 1 } },
          { id: 'ele_5c', name: '元素超载', description: '元素伤害+120%，范围+50%', effect: { multi: [{ stat: 'elementalBonus', op: 'multiply', value: 1.20 }, { stat: 'elementalRadius', op: 'multiply', value: 0.50 }] } },
        ],
      ],
    },
    ultimate: {
      id: 'ultimate', name: '终极', icon: '👑', color: '#aa44ff',
      layers: [
        [
          { id: 'ult_1a', name: '超载', description: '攻击力+100%，持续5秒(30秒冷却)', effect: { stat: 'overdrive', op: 'add', value: 1.00, duration: 5000, cooldown: 30000 } },
          { id: 'ult_1b', name: '时间停止', description: '冻结全场敌人3秒(45秒冷却)', effect: { stat: 'timeStop', op: 'add', value: 1, duration: 3000, cooldown: 45000 } },
        ],
        [
          { id: 'ult_2a', name: '黑洞', description: '召唤黑洞吸引并爆炸(200伤害)', effect: { stat: 'blackHole', op: 'add', value: 200, cooldown: 40000 } },
          { id: 'ult_2b', name: '无限弹幕', description: '攻击速度+200%，持续8秒', effect: { stat: 'infiniteBarrage', op: 'add', value: 2.00, duration: 8000, cooldown: 50000 } },
          { id: 'ult_2c', name: '虚空之眼', description: '全屏透视，显示所有敌人位置(15秒)', effect: { stat: 'voidEye', op: 'add', value: 1, duration: 15000, cooldown: 60000 } },
        ],
        [
          { id: 'ult_3a', name: '神之制裁', description: '全屏伤害500点(60秒冷却)', effect: { stat: 'divineJudgment', op: 'add', value: 500, cooldown: 60000 } },
          { id: 'ult_3b', name: '轮回', description: '死亡时复活(满HP+5秒无敌)', effect: { stat: 'reincarnation', op: 'add', value: 1, healPercent: 1.0, invincibleDuration: 5000 } },
          { id: 'ult_3c', name: '命运逆转', description: 'HP降至0时，50%概率恢复至50%HP', effect: { stat: 'fateReverse', op: 'add', value: 0.50 } },
        ],
        [
          { id: 'ult_4a', name: '湮灭', description: 'HP低于25%的敌人直接斩杀', effect: { stat: 'voidExecute', op: 'add', value: 0.25 } },
          { id: 'ult_4b', name: '永恒之光', description: '圣光光环(每秒200伤害/范围200px)', effect: { stat: 'eternalLight', op: 'add', value: 200, radius: 200 } },
          { id: 'ult_4c', name: '时空裂隙', description: '攻击有10%概率打开时空裂隙(500伤害)', effect: { stat: 'riftChance', op: 'add', value: 0.10, riftDamage: 500 } },
        ],
        [
          { id: 'ult_5a', name: '创世', description: '全属性+100%，持续10秒(60秒冷却)', effect: { stat: 'genesis', op: 'add', value: 1.00, duration: 10000, cooldown: 60000 } },
          { id: 'ult_5b', name: '命运之轮', description: '随机获得3个其他分支的终极天赋效果', effect: { stat: 'fateWheel', op: 'add', value: 3 } },
        ],
      ],
    },
  },

  // ============ ACHIEVEMENTS (20) ============
  ACHIEVEMENTS: [
    { id: 'firstKill', name: '初次战斗', description: '击杀第1个敌人', icon: '⚔️', condition: { type: 'kills', value: 1 }, reward: { starCoins: 10 } },
    { id: 'kill100', name: '百人斩', description: '单局击杀100个敌人', icon: '💯', condition: { type: 'kills', value: 100 }, reward: { starCoins: 50 } },
    { id: 'kill500', name: '修罗场', description: '单局击杀500个敌人', icon: '🔥', condition: { type: 'kills', value: 500 }, reward: { starCoins: 150 } },
    { id: 'kill1000', name: '千人斩', description: '单局击杀1000个敌人', icon: '💀', condition: { type: 'kills', value: 1000 }, reward: { starCoins: 300 } },
    { id: 'survive5', name: '生存新手', description: '存活5分钟', icon: '⏱️', condition: { type: 'survive', value: 300 }, reward: { starCoins: 20 } },
    { id: 'survive10', name: '老兵', description: '存活10分钟', icon: '🕐', condition: { type: 'survive', value: 600 }, reward: { starCoins: 80 } },
    { id: 'survive20', name: '不死传说', description: '存活20分钟', icon: '🕑', condition: { type: 'survive', value: 1200 }, reward: { starCoins: 200 } },
    { id: 'firstBoss', name: 'Boss猎手', description: '首次击败Boss', icon: '👹', condition: { type: 'bossKills', value: 1 }, reward: { starCoins: 100 } },
    { id: 'bossSlayer', name: 'Boss屠杀者', description: '击败所有5种Boss', icon: '👑', condition: { type: 'uniqueBossKills', value: 5 }, reward: { starCoins: 500 } },
    { id: 'firstElite', name: '精英猎人', description: '首次击杀精英怪', icon: '⭐', condition: { type: 'eliteKills', value: 1 }, reward: { starCoins: 30 } },
    { id: 'eliteHunter', name: '精英屠杀者', description: '累计击杀50个精英怪', icon: '🌟', condition: { type: 'eliteKills', value: 50 }, reward: { starCoins: 200 } },
    { id: 'firstFusion', name: '初次融合', description: '首次触发武器融合', icon: '🔮', condition: { type: 'fusions', value: 1 }, reward: { starCoins: 50 } },
    { id: 'fusionMaster', name: '融合大师', description: '触发5次武器融合', icon: '✨', condition: { type: 'fusions', value: 5 }, reward: { starCoins: 200 } },
    { id: 'maxWeapon', name: '武器精通', description: '持有1把满级(5级)武器', icon: '🔫', condition: { type: 'maxLevelWeapons', value: 1 }, reward: { starCoins: 40 } },
    { id: 'weaponCollector', name: '军火库', description: '同时持有5把满级武器', icon: '🎯', condition: { type: 'maxLevelWeapons', value: 5 }, reward: { starCoins: 300 } },
    { id: 'allFactions', name: '全流派大师', description: '使用每种流派各通关1次', icon: '🏆', condition: { type: 'uniqueFactionWins', value: 20 }, reward: { starCoins: 1000 } },
    { id: 'noHit5min', name: '完美闪避', description: '连续5分钟不受伤害', icon: '🛡️', condition: { type: 'noHitStreak', value: 300 }, reward: { starCoins: 150 } },
    { id: 'combo100', name: '连击达人', description: '连击数达到100', icon: '💥', condition: { type: 'maxCombo', value: 100 }, reward: { starCoins: 80 } },
    { id: 'score100k', name: '得分王', description: '单局得分达到100000', icon: '🏅', condition: { type: 'score', value: 100000 }, reward: { starCoins: 200 } },
    { id: 'speedrunner', name: '速通达人', description: '15分钟内击败Boss', icon: '⚡', condition: { type: 'bossKillTime', value: 900 }, reward: { starCoins: 300 } },
  ],

  // ============ ELITE_AFFIXES (15) ============
  // Elite enemies: 3x HP, 2x damage, random 2-4 affixes
  ELITE_AFFIXES: {
    berserk: { id: 'berserk', name: '狂暴', icon: '🔴', description: '攻击速度+50%，伤害+30%', effects: { attackSpeedMult: 0.5, damageMult: 0.3 }, visualEffect: 'redGlow', color: '#ff0000' },
    split: { id: 'split', name: '分裂', icon: '🔸', description: '死亡时分裂为2个小型敌人', effects: { splitOnDeath: 2 }, visualEffect: 'crackPattern', color: '#ffaa00' },
    shield: { id: 'shield', name: '护盾', icon: '🔵', description: '获得等同于50%最大HP的护盾', effects: { shieldPercent: 0.50 }, visualEffect: 'shieldBubble', color: '#4488ff' },
    teleport: { id: 'teleport', name: '瞬移', icon: '💜', description: '每5秒随机瞬移一次', effects: { teleportInterval: 5000 }, visualEffect: 'afterimage', color: '#aa44ff' },
    lifesteal: { id: 'lifesteal', name: '吸血', icon: '🩸', description: '造成伤害的20%转化为HP', effects: { lifestealPercent: 0.20 }, visualEffect: 'redTrail', color: '#cc0000' },
    plague: { id: 'plague', name: '瘟疫', icon: '☠️', description: '死亡时释放毒雾(半径150px，10伤害/秒)', effects: { deathPlagueRadius: 150, deathPlagueDps: 10 }, visualEffect: 'greenCloud', color: '#55cc44' },
    reflect: { id: 'reflect', name: '反伤', icon: '🪞', description: '反弹15%受到的伤害', effects: { reflectPercent: 0.15 }, visualEffect: 'mirrorShield', color: '#aaccff' },
    giant: { id: 'giant', name: '巨大化', icon: '🔺', description: '体型x2，HP+100%，伤害+50%', effects: { sizeMult: 2.0, hpMult: 1.0, damageMult: 0.5 }, visualEffect: 'sizeIncrease', color: '#ff4444' },
    haste: { id: 'haste', name: '急速', icon: '💨', description: '移动速度+80%', effects: { speedMult: 0.80 }, visualEffect: 'speedLines', color: '#44ddff' },
    lava: { id: 'lava', name: '熔岩', icon: '🌋', description: '留下火焰路径(15伤害/秒，持续3秒)', effects: { lavaTrailDps: 15, lavaTrailDuration: 3000 }, visualEffect: 'fireTrail', color: '#ff6600' },
    frostAura: { id: 'frostAura', name: '冰冻光环', icon: '❄️', description: '周围150px内玩家减速40%', effects: { auraRadius: 150, slowAmount: 0.40 }, visualEffect: 'frostField', color: '#88ddff' },
    thunderBody: { id: 'thunderBody', name: '雷电护体', icon: '⚡', description: '被击中时释放闪电(25伤害/弹射3次)', effects: { onHitLightningDamage: 25, chainCount: 3 }, visualEffect: 'electricField', color: '#ffff00' },
    multiShot: { id: 'multiShot', name: '多重射击', icon: '🎯', description: '攻击时额外发射2发子弹', effects: { extraBullets: 2 }, visualEffect: 'bulletRain', color: '#ff8800' },
    harden: { id: 'harden', name: '硬化', icon: '🪨', description: '受到伤害-40%，但移速-20%', effects: { damageReduction: 0.40, speedPenalty: 0.20 }, visualEffect: 'rockArmor', color: '#888888' },
    regen: { id: 'regen', name: '再生', icon: '💚', description: '每秒恢复3%最大HP', effects: { hpRegenPercent: 0.03 }, visualEffect: 'greenHeal', color: '#44ff44' },
  },

  // ============ BOSSES (5) ============
  BOSSES: {
    boss_tank: { id: 'boss_tank', name: '钢铁巨兽', icon: '🤖', color: '#8888cc', size: 55, baseHp: 5000, baseDamage: 25, baseSpeed: 20, score: 5000, xp: 500,
      phases: [
        { name: '第一阶段', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 8, spreadAngle: 360, fireRate: 800, bulletSpeed: 200, bulletDamage: 12, specialAttack: 'charge', chargeInterval: 10000, chargeDamage: 40 },
        { name: '第二阶段', hpThreshold: 0.66, bulletPattern: 'circle', bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 250, bulletDamage: 15, shieldCount: 3, shieldHpEach: 200 },
        { name: '最终阶段', hpThreshold: 0.33, bulletPattern: 'circle', bulletCount: 16, spreadAngle: 360, fireRate: 400, bulletSpeed: 280, bulletDamage: 18, enrage: true, enrageSpeedMult: 1.5 },
      ], dropGuaranteed: ['weaponCrate'] },
    boss_summoner: { id: 'boss_summoner', name: '召唤之主', icon: '🧙', color: '#aa44ff', size: 50, baseHp: 6000, baseDamage: 35, baseSpeed: 25, score: 7500, xp: 650,
      phases: [
        { name: '召唤阶段', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 6, spreadAngle: 360, fireRate: 800, bulletSpeed: 200, bulletDamage: 12, summonInterval: 3000, summonType: 'small', summonCount: 3 },
        { name: '狂暴召唤', hpThreshold: 0.5, bulletPattern: 'circle', bulletCount: 10, spreadAngle: 360, fireRate: 600, bulletSpeed: 240, bulletDamage: 15, summonInterval: 2000, summonType: 'fastSmall', summonCount: 4 },
      ], dropGuaranteed: ['fusionCore'] },
    boss_dragon: { id: 'boss_dragon', name: '龙王', icon: '🐉', color: '#ff6600', size: 60, baseHp: 10000, baseDamage: 45, baseSpeed: 35, score: 10000, xp: 800,
      phases: [
        { name: '吐息阶段', hpThreshold: 1.0, bulletPattern: 'cone', bulletCount: 10, spreadAngle: 45, fireRate: 500, bulletSpeed: 240, bulletDamage: 18, specialAttack: 'fireBreath', breathDuration: 3000, breathDamage: 25 },
        { name: '俯冲阶段', hpThreshold: 0.6, bulletPattern: 'cone', bulletCount: 15, spreadAngle: 60, fireRate: 400, bulletSpeed: 280, bulletDamage: 22, specialAttack: 'diveBomb', diveInterval: 8000, diveDamage: 60 },
        { name: '狂怒阶段', hpThreshold: 0.3, bulletPattern: 'cone', bulletCount: 20, spreadAngle: 90, fireRate: 300, bulletSpeed: 320, bulletDamage: 25, specialAttack: 'meteorRain', meteorCount: 8, meteorDamage: 40 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore'] },
    boss_phantom: { id: 'boss_phantom', name: '幽灵领主', icon: '👻', color: '#88ffff', size: 45, baseHp: 8000, baseDamage: 35, baseSpeed: 50, score: 12000, xp: 900,
      phases: [
        { name: '潜行阶段', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 8, spreadAngle: 360, fireRate: 600, bulletSpeed: 280, bulletDamage: 20, specialAttack: 'stealth', stealthDuration: 2000, stealthCooldown: 8000 },
        { name: '追击阶段', hpThreshold: 0.7, bulletPattern: 'circle', bulletCount: 12, spreadAngle: 360, fireRate: 300, bulletSpeed: 320, bulletDamage: 22, specialAttack: 'teleportStrike', teleportCooldown: 3000, strikeDamage: 45 },
        { name: '虚无阶段', hpThreshold: 0.4, bulletPattern: 'circle', bulletCount: 16, spreadAngle: 360, fireRate: 200, bulletSpeed: 360, bulletDamage: 25, invulnerableInterval: 10000, invulnerableDuration: 2000 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore'] },
    boss_void: { id: 'boss_void', name: '虚空领主', icon: '🕳️', color: '#220044', size: 70, baseHp: 15000, baseDamage: 50, baseSpeed: 30, score: 20000, xp: 1200,
      phases: [
        { name: '虚空侵蚀', hpThreshold: 1.0, bulletPattern: 'spiral', bulletCount: 6, spreadAngle: 60, fireRate: 400, bulletSpeed: 250, bulletDamage: 20, specialAttack: 'voidZone', zoneRadius: 200, zoneDamage: 15, zoneDuration: 5000 },
        { name: '空间撕裂', hpThreshold: 0.66, bulletPattern: 'spiral', bulletCount: 10, spreadAngle: 60, fireRate: 300, bulletSpeed: 300, bulletDamage: 25, specialAttack: 'riftSlash', riftCount: 3, riftDamage: 40, riftDuration: 3000 },
        { name: '黑洞坍缩', hpThreshold: 0.33, bulletPattern: 'spiral', bulletCount: 14, spreadAngle: 60, fireRate: 200, bulletSpeed: 350, bulletDamage: 30, specialAttack: 'blackHoleCollapse', pullForce: 150, explosionDamage: 100, explosionRadius: 300 },
        { name: '终焉', hpThreshold: 0.1, bulletPattern: 'chaos', bulletCount: 20, spreadAngle: 360, fireRate: 150, bulletSpeed: 400, bulletDamage: 35, enrage: true, enrageSpeedMult: 1.8 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore', 'timeCrystal'] },
  },

  // ============ SHOP_ITEMS ============
  SHOP_ITEMS: {
    refreshCost: 20, maxRefreshPerRun: 5, autoRefreshWaves: 5, bossDiscountDuration: 30000,
    items: [
      { id: 'weaponUpgrade', name: '武器强化', icon: '⬆️', price: 40, description: '当前武器提升1级', category: 'upgrade' },
      { id: 'skillUpgrade', name: '技能升级', icon: '📖', price: 60, description: '随机技能提升1级', category: 'upgrade' },
      { id: 'healthSmall', name: '小血包', icon: '❤️', price: 30, description: '恢复30HP', category: 'consumable' },
      { id: 'healthLarge', name: '大血包', icon: '💖', price: 80, description: '恢复80HP', category: 'consumable' },
      { id: 'healthMega', name: '超级血包', icon: '💝', price: 200, description: '恢复全部HP', category: 'consumable' },
      { id: 'tempShield', name: '临时护盾', icon: '🛡️', price: 50, description: '获得50点护盾(持续60秒)', category: 'consumable' },
      { id: 'weaponCrate', name: '武器箱', icon: '📦', price: 100, description: '随机获得1把新武器', category: 'loot' },
      { id: 'skillDraw', name: '技能抽取', icon: '🎴', price: 80, description: '随机获得1个新技能', category: 'loot' },
      { id: 'fusionCore', name: '融合核心', icon: '🔮', price: 150, description: '用于武器融合的稀有材料', category: 'material' },
      { id: 'refreshShop', name: '刷新商店', icon: '🔄', price: 20, description: '刷新商店商品列表', category: 'service' },
      { id: 'weaponSlot', name: '武器槽+1', icon: '🔫', price: 300, description: '增加1个武器槽位', category: 'upgrade' },
    ],
    bossDiscountItems: [
      { id: 'rareWeapon', name: '稀有武器', icon: '🌟', price: 120, description: '随机获得1把稀有武器', category: 'loot' },
      { id: 'fusionCoreSale', name: '融合核心(特惠)', icon: '🔮', price: 100, description: '融合核心5折特惠', category: 'material' },
      { id: 'overloadCore', name: '超载核心', icon: '⚡', price: 200, description: '超武伤害+50%', category: 'material' },
    ],
  },

  // ============ ENEMY_SCALING ============
  // HP = base * (1 + wave * 0.06)^2
  // Damage = base * (1 + wave * 0.04)
  ENEMY_SCALING: {
    hpGrowthRate: 0.06, damageGrowthRate: 0.04, speedGrowthRate: 0.01, xpGrowthRate: 0.02, scoreGrowthRate: 0.03,
    calcHp: function(baseHp, wave) { return baseHp * Math.pow(1 + wave * 0.06, 2); },
    calcDamage: function(baseDamage, wave) { return baseDamage * (1 + wave * 0.04); },
    calcSpeed: function(baseSpeed, wave) { return baseSpeed * (1 + wave * 0.01); },
    calcXp: function(baseXp, wave) { return baseXp * (1 + wave * 0.02); },
    calcScore: function(baseScore, wave) { return baseScore * (1 + wave * 0.03); },
  },

  // ============ PERMANENT_UPGRADES (Star Coin System) ============
  // Star coins = minutes * 10 + kills * 2 + bossKills * 100
  PERMANENT_UPGRADES: {
    directions: ['attack', 'hp', 'speed', 'xp', 'dropRate'],
    starCoinFormula: function(minutes, kills, bossKills) { return Math.floor(minutes * 10 + kills * 2 + bossKills * 100); },
    resetRefundRate: 0.8,
    attack: { id: 'attack', name: '攻击强化', icon: '⚔️', description: '每级+3%攻击力', maxLevel: 20, effectPerLevel: { stat: 'attack', op: 'multiply', value: 0.03 }, costFormula: function(level) { return Math.floor(50 * Math.pow(1.5, level)); } },
    hp: { id: 'hp', name: '生命强化', icon: '❤️', description: '每级+4%最大生命', maxLevel: 15, effectPerLevel: { stat: 'hp', op: 'multiply', value: 0.04 }, costFormula: function(level) { return Math.floor(60 * Math.pow(1.5, level)); } },
    speed: { id: 'speed', name: '移速强化', icon: '💨', description: '每级+2%移动速度', maxLevel: 10, effectPerLevel: { stat: 'speed', op: 'multiply', value: 0.02 }, costFormula: function(level) { return Math.floor(80 * Math.pow(1.5, level)); } },
    xp: { id: 'xp', name: '经验强化', icon: '📈', description: '每级+5%经验获取', maxLevel: 15, effectPerLevel: { stat: 'xpMultiplier', op: 'multiply', value: 0.05 }, costFormula: function(level) { return Math.floor(70 * Math.pow(1.5, level)); } },
    dropRate: { id: 'dropRate', name: '掉落强化', icon: '💎', description: '每级+3%掉落率', maxLevel: 10, effectPerLevel: { stat: 'dropRate', op: 'multiply', value: 0.03 }, costFormula: function(level) { return Math.floor(100 * Math.pow(1.5, level)); } },
  },
};

// ============ RARITY WEIGHTS (for random selection) ============
GAME_CONFIG.RARITY_WEIGHTS = {
  common: 45,
  uncommon: 30,
  rare: 15,
  epic: 7,
  legendary: 3,
};

// Export to global
if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME_CONFIG;
}
