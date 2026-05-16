/**
 * STG Game Configuration
 * Data-driven design: ALL game content defined here.
 * Engine code reads this config - adding content = adding data, ZERO engine changes.
 * 
 * Global namespace: window.GAME_CONFIG
 */

const GAME_CONFIG = {
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
    DIFFICULTY_MULTIPLIER: 0.1,
    DIFFICULTY_BULLET_SPEED: 0.05,
    DIFFICULTY_ENEMY_HP: 0.08,
    DIFFICULTY_SPAWN_RATE: 0.08,
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
  ],

  // ============ WEAPONS (10) ============
  WEAPONS: {
    normal: {
      id: 'normal', name: '标准弹', icon: '🔫',
      pattern: 'normal', fireRate: 350, damage: 8, bulletSpeed: 550, bulletSize: 3,
      bulletColor: '#ffff00', trailColor: '#ffaa00',
    },
    homing: {
      id: 'homing', name: '追踪弹', icon: '🎯',
      pattern: 'homing', fireRate: 550, damage: 14, bulletSpeed: 380, bulletSize: 4,
      homingStrength: 0.05, homingRange: 300, bulletColor: '#ff44ff', trailColor: '#cc22cc',
    },
    laser: {
      id: 'laser', name: '激光炮', icon: '⚡',
      pattern: 'laser', fireRate: 80, damage: 3, bulletSpeed: 1200, bulletSize: 2,
      beamWidth: 3, beamLength: 600, bulletColor: '#00ffff', trailColor: '#0088ff',
    },
    spread: {
      id: 'spread', name: '散射弹', icon: '💫',
      pattern: 'spread', fireRate: 600, damage: 7, bulletSpeed: 450, bulletSize: 3,
      bulletCount: 5, spreadAngle: 25, bulletColor: '#ff8844', trailColor: '#ff4400',
    },
    orbital: {
      id: 'orbital', name: '浮游炮', icon: '🛰️',
      pattern: 'orbital', fireRate: 450, damage: 5, bulletSpeed: 500, bulletSize: 2,
      orbitRadius: 70, orbitSpeed: 2.5, orbitCount: 4, bulletColor: '#88ddff', trailColor: '#4488cc',
    },
    arc: {
      id: 'arc', name: '电弧链', icon: '⚡',
      pattern: 'arc', fireRate: 700, damage: 18, chainCount: 3, chainRange: 180,
      chainDamageFalloff: 0.3, bulletColor: '#88ffff', trailColor: '#44aaff',
    },
    boomerang: {
      id: 'boomerang', name: '回旋镖', icon: '🪃',
      pattern: 'boomerang', fireRate: 650, damage: 22, bulletSpeed: 350, bulletSize: 5,
      returnSpeed: 500, range: 350, bulletColor: '#ff9944', trailColor: '#ff6600',
    },
    pierce: {
      id: 'pierce', name: '穿甲弹', icon: '🗡️',
      pattern: 'pierce', fireRate: 550, damage: 28, bulletSpeed: 650, bulletSize: 4,
      pierceCount: 3, bulletColor: '#ffffff', trailColor: '#cccccc',
    },
    explosive: {
      id: 'explosive', name: '爆破弹', icon: '💣',
      pattern: 'explosive', fireRate: 900, damage: 35, bulletSpeed: 400, bulletSize: 6,
      explosionRadius: 70, bulletColor: '#ff4444', trailColor: '#ff0000',
    },
    wave: {
      id: 'wave', name: '波动炮', icon: '〰️',
      pattern: 'wave', fireRate: 500, damage: 10, bulletSpeed: 450, bulletSize: 3,
      waveAmplitude: 3, waveFrequency: 0.06, bulletsPerWave: 3, bulletColor: '#44ff88', trailColor: '#22aa44',
    },
    missile: {
      id: 'missile', name: '导弹群', icon: '🚀',
      pattern: 'missile', fireRate: 750, damage: 40, bulletSpeed: 300, bulletSize: 7,
      homingStrength: 0.04, homingRange: 350, explosionRadius: 80, missileCount: 3, bulletColor: '#ff6622', trailColor: '#ff4400',
    },
    needle: {
      id: 'needle', name: '针弹', icon: '📌',
      pattern: 'needle', fireRate: 120, damage: 4, bulletSpeed: 900, bulletSize: 1.5,
      bulletCount: 2, pierceCount: 2, bulletColor: '#aaffff', trailColor: '#66cccc',
    },
    gravityWell: {
      id: 'gravityWell', name: '重力井', icon: '🌀',
      pattern: 'gravityWell', fireRate: 600, damage: 12, bulletSpeed: 350, bulletSize: 5,
      wellRadius: 100, wellDuration: 3000, pullForce: 80, wellDamage: 8, bulletColor: '#9966cc', trailColor: '#6633aa',
    },
    flame: {
      id: 'flame', name: '火焰喷射', icon: '🔥',
      pattern: 'flame', fireRate: 50, damage: 4, bulletSpeed: 350, bulletSize: 8,
      flameLength: 180, flameAngle: 40, burnDamage: 6, burnDuration: 2000, bulletColor: '#ff6600', trailColor: '#ff3300',
    },
    shuriken: {
      id: 'shuriken', name: '手里剑', icon: '🪃',
      pattern: 'shuriken', fireRate: 500, damage: 18, bulletSpeed: 400, bulletSize: 5,
      spinSpeed: 8, pierceCount: 5, orbitRadius: 60, bulletColor: '#aaaacc', trailColor: '#8888aa',
    },
    voidRift: {
      id: 'voidRift', name: '虚空裂隙', icon: '🕳️',
      pattern: 'voidRift', fireRate: 800, damage: 8, bulletSpeed: 250, bulletSize: 6,
      riftDuration: 4000, riftDamage: 12, riftRadius: 70, executeThreshold: 0.1, bulletColor: '#440088', trailColor: '#220044',
    },
    lightningBolt: {
      id: 'lightningBolt', name: '雷电', icon: '⚡',
      pattern: 'lightningBolt', fireRate: 600, damage: 22, bulletSpeed: 1200, bulletSize: 2,
      chainCount: 4, chainRange: 150, chainDamageFalloff: 0.25, boltWidth: 2, bulletColor: '#ffff44', trailColor: '#ffaa00',
    },
    iceShard: {
      id: 'iceShard', name: '冰晶', icon: '❄️',
      pattern: 'iceShard', fireRate: 450, damage: 10, bulletSpeed: 500, bulletSize: 3,
      slowAmount: 0.4, slowDuration: 2000, shatterDamage: 30, shatterRadius: 80, bulletColor: '#88ddff', trailColor: '#4499cc',
    },
    rocketBarrage: {
      id: 'rocketBarrage', name: '火箭弹幕', icon: '💥',
      pattern: 'rocketBarrage', fireRate: 1000, damage: 50, bulletSpeed: 220, bulletSize: 9,
      rocketCount: 5, explosionRadius: 90, spreadAngle: 30, bulletColor: '#ff4444', trailColor: '#cc0000',
    },
    photonBeam: {
      id: 'photonBeam', name: '光子束', icon: '💡',
      pattern: 'photonBeam', fireRate: 40, damage: 5, bulletSpeed: 1500, bulletSize: 3,
      beamWidth: 8, beamLength: 600, tickRate: 50, bulletColor: '#ffffff', trailColor: '#aaaaff',
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
      hp: 1500, speed: 40, damage: 50, score: 5000, xp: 500,
      size: 40, color: '#ff0000',
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
      hp: 2000, speed: 30, damage: 40, score: 8000, xp: 700,
      size: 45, color: '#4488ff',
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
      hp: 1800, speed: 25, damage: 35, score: 7500, xp: 650,
      size: 42, color: '#aa44ff',
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
      hp: 2500, speed: 35, damage: 45, score: 10000, xp: 800,
      size: 50, color: '#ff6600',
      ai: 'boss_dragon', fireRate: 500, bulletSpeed: 240, bulletDamage: 18, bulletColor: '#ff6600',
      bulletCount: 10, spreadAngle: 45,
      dropRate: 1.0,
      phases: [
        { hpThreshold: 0.6, bulletCount: 15, spreadAngle: 60, fireRate: 400, bulletSpeed: 280 },
        { hpThreshold: 0.3, bulletCount: 20, spreadAngle: 90, fireRate: 300, bulletSpeed: 320 },
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
        // Difficulty 1: small + fast
        { minDifficulty: 1, templates: [
          { enemy: 'small', count: 3, spacing: 70, pattern: 'v' },
          { enemy: 'fastSmall', count: 2, spacing: 80, pattern: 'random' },
        ]},
        // Difficulty 2: mediums + new types
        { minDifficulty: 2, templates: [
          { enemy: 'small', count: 4, spacing: 60, pattern: 'circle' },
          { enemy: 'fastSmall', count: 3, spacing: 60, pattern: 'random' },
          { enemy: 'medium', count: 1, spacing: 80, pattern: 'line' },
          { enemy: 'weaver', count: 1, spacing: 70, pattern: 'wave' },
        ]},
        // Difficulty 3: elites + more variety
        { minDifficulty: 3, templates: [
          { enemy: 'small', count: 5, spacing: 50, pattern: 'wave' },
          { enemy: 'medium', count: 2, spacing: 70, pattern: 'v' },
          { enemy: 'elite', count: 1, spacing: 0, pattern: 'single' },
          { enemy: 'sniper', count: 1, spacing: 100, pattern: 'line' },
          { enemy: 'charger', count: 1, spacing: 90, pattern: 'random' },
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
