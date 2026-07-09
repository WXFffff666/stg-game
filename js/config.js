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
    PLAYER_BASE_HP: 150,
    PLAYER_BASE_SPEED: 280,
    PLAYER_INVINCIBLE_MS: 2000,
    PLAYER_HITBOX_RADIUS: 8,
    XP_PER_KILL_BASE: 10,
    XP_CURVE: [0, 40, 90, 160, 250, 375, 525, 700, 925, 1200, 3050, 3800, 4700, 5750, 7000, 8500, 10200, 12200, 14600, 17500,
      21000, 25000, 30000, 36000, 43000, 51000, 60000, 70000, 82000, 96000, 112000, 130000, 150000, 172000, 197000, 225000,
      256000, 290000, 328000, 370000, 416000, 466000, 520000, 580000, 645000, 715000, 790000, 870000, 955000, 1045000,
      // Extended levels 51-100 (formula: 40 * 1.12^(level-1))
      11560, 12947, 14501, 16241, 18190, 20373, 22818, 25556, 28622, 32057,
      35904, 40212, 45038, 50442, 56495, 63275, 70868, 79372, 88897, 99564,
      111512, 124893, 139880, 156666, 175466, 196522, 220104, 246517, 276099, 309230,
      346338, 387899, 434447, 486580, 544970, 610366, 683610, 765643, 857520, 960423,
      1075673, 1204754, 1349325, 1511244, 1692593, 1895704, 2123189, 2377971, 2663328, 2982927
    ],
    DIFFICULTY_INTERVAL: 45000,
    DIFFICULTY_MULTIPLIER: 0.05,
    MAX_DIFFICULTY: 100,
    DIFFICULTY_BULLET_SPEED: 0.02,
    DIFFICULTY_ENEMY_HP: 0.04,
    DIFFICULTY_SPAWN_RATE: 0.05,
    ENEMY_BULLET_DAMAGE: 8,
    COLLISION_DAMAGE: 12,
    ITEM_DROP_CHANCE: 0.15,
    EARLY_GAME_DURATION: 300000, // 5分钟
    EARLY_ITEM_DROP_RATE: 0.30,  // 前期掉率30%
    NORMAL_ITEM_DROP_RATE: 0.15, // 正常掉率15%
    LOW_HP_THRESHOLD: 0.3,       // 低血量阈值
    LOW_HP_DROP_BONUS: 0.20,     // 低血量掉率加成
    ITEM_LIFETIME: 10000,
    SCREEN_SHAKE_DECAY: 0.9,
    MAX_PARTICLES: 300,
    BOSS_SCORE_THRESHOLD: 5000,
    BOSS_INTERVAL_SCORE: 20000,
    MAX_BOSS_HP_MULTIPLIER: 5.0,
    COMBO_TIMEOUT: 3000,
    COMBO_MULTIPLIER: 0.1,

    // ============ D4: Boss Scaling ============
    BOSS_SCALE_PER_KILL: 0.12,
    BOSS_DMG_PER_KILL: 0.08,
    FIRST_BOSS_HP_MULTIPLIER: 0.7,
    STAR_COIN_MILESTONES: [
      { minutes: 10, bonus: 50 },
      { minutes: 20, bonus: 150 },
      { minutes: 30, bonus: 300 },
    ],

    // ============ D1: Time-based Difficulty ============
    EARLY_GAME_DURATION: 300,
    MID_GAME_DURATION: 900,
    DIFFICULTY_EARLY_RATE: 0.002,
    DIFFICULTY_MID_RATE: 0.003,
    DIFFICULTY_LATE_RATE: 0.005,

    // ============ Damage Cap (anti one-shot) ============
    // Max % of player HP that a single hit can deal (after all modifiers)
    NORMAL_ENEMY_DAMAGE_CAP: 0.30,   // Normal enemies: max 30% HP per hit
    ELITE_ENEMY_DAMAGE_CAP: 0.50,    // Elite/sniper enemies: max 50% HP per hit
    BOSS_DAMAGE_CAP: 1.0,            // Bosses can still one-shot with special attacks

    // ============ 难度曲线配置 ============
    // 前期(0-5分钟)：轻松上手
    EARLY_PHASE_END: 300000,       // 前期结束时间(ms) = 5分钟
    EARLY_HP_MULTIPLIER: 0.8,      // 前期敌人HP×0.8
    EARLY_XP_MULTIPLIER: 1.2,      // 前期经验×1.2
    EARLY_DROP_MULTIPLIER: 1.5,    // 前期掉率×1.5
    // 中期(5-15分钟)：标准难度，无额外修正
    MID_PHASE_END: 900000,         // 中期结束时间(ms) = 15分钟
    // 后期(15分钟+)：难度逐渐提升
    LATE_DIFFICULTY_SCALE: 0.08,   // 后期每分钟额外难度系数
    // Boss难度递增
    BOSS_FIRST_HP_SCALE: 0.7,      // 第一个Boss HP×0.7(简单)
    BOSS_SCALING_PER_KILL: 0.12,   // 每击败一个Boss，后续Boss难度+12%

    // ============ 性能优化配置 ============
    // 对象池扩容
  POOL_BULLETS: 400,
  POOL_ENEMIES: 80,
  POOL_PARTICLES: 250,
  // Mobile/tablet reduced pools (auto-detected in core.js init)
  POOL_BULLETS_MOBILE: 150,
  POOL_ENEMIES_MOBILE: 35,
  POOL_PARTICLES_MOBILE: 80,

    // 碰撞网格配置 (4x4空间网格)
    COLLISION_GRID_COLS: 4,
    COLLISION_GRID_ROWS: 4,

    // 低性能检测阈值
    LOW_FPS_THRESHOLD: 30,         // 帧率阈值
    LOW_FPS_DURATION: 3000,        // 持续时间(毫秒)
    LOW_FPS_CHECK_INTERVAL: 500,   // 检测间隔(毫秒)

    // 低性能模式限制
    LOW_PERF_PARTICLE_REDUCTION: 0.3,  // 粒子减少70%
    LOW_PERF_MAX_ENEMIES: 25,          // 敌人上限
    LOW_PERF_MAX_BULLETS: 120,

    // ============ 武器槽配置 ============
    MAX_WEAPON_SLOTS: 6,
    MAX_PASSIVE_SLOTS: 6,
    // Slot expansion costs (gold): slot index → cost (0 for free/foundational slots)
    WEAPON_SLOT_COST: [0, 0, 0, 0, 0, 0, 0, 300, 600],
    PASSIVE_SLOT_COST: [0, 0, 0, 0, 0, 0, 0, 250, 500],
    MAX_WEAPON_SLOT_TOTAL: 8,
    MAX_PASSIVE_SLOT_TOTAL: 8,
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

  // ============ SHOP (波次间商店) ============
  SHOP: {
    items: [
      { id: 'healthSmall', name: '小血包', cost: 30, icon: '❤️', description: '恢复30HP' },
      { id: 'healthMedium', name: '中血包', cost: 80, icon: '💗', description: '恢复80HP' },
      { id: 'healthLarge', name: '大血包', cost: 200, icon: '💖', description: '恢复全部HP' },
      { id: 'tempShield', name: '临时护盾', cost: 50, icon: '🛡️', description: '获得50点护盾' },
      { id: 'fusionCore', name: '融合核心', cost: 150, icon: '🔮', description: '用于武器融合的稀有材料' },
      { id: 'attackBoost', name: '攻击强化', cost: 100, icon: '⚔️', description: '攻击力+15%' },
      { id: 'speedBoost', name: '速度强化', cost: 80, icon: '💨', description: '移动速度+10%' },
      { id: 'weaponSlot', name: '武器槽+1', cost: 300, icon: '🔫', description: '增加1个武器槽位' },
      { id: 'passiveSlot', name: '被动槽+1', cost: 250, icon: '🛡️', description: '增加1个被动槽位' },
      { id: 'weaponCrate', name: '武器箱', cost: 120, icon: '📦', description: '随机获得1把新武器' },
    ],
    refreshCost: 50,
    waveInterval: 5,
    displayCount: 3,
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
    fury: {
      id: 'fury', name: '💢 狂怒流', color: '#ff0044',
      description: '低血加攻，绝地反击',
      baseStats: { attackSpeed: 0.8, attack: 1.3, hp: 80, speed: 310, lowHpBonus: 0.5, rageThreshold: 0.3 },
      icon: '💢'
    },
    luck: {
      id: 'luck', name: '🍀 幸运流', color: '#44ff44',
      description: '概率提升，运气爆棚',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 280, luckBonus: 0.2, critRate: 0.1, dropRateBonus: 0.15 },
      icon: '🍀'
    },
    sonic: {
      id: 'sonic', name: '🔊 音波流', color: '#ff88ff',
      description: '音波脉冲，震荡全场',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 100, speed: 285, sonicPulseInterval: 10, sonicDamage: 0.5, sonicRadius: 120 },
      icon: '🔊'
    },
    minion: {
      id: 'minion', name: '👹 魔仆流', color: '#ff4488',
      description: '鲜血收集，魔仆助战',
      baseStats: { attackSpeed: 1.0, attack: 0.8, hp: 110, speed: 275, minionCount: 0, minionDamage: 0.4, bloodOrbDrop: 0.15 },
      icon: '👹'
    },
    data: {
      id: 'data', name: '📊 数据流', color: '#00ffcc',
      description: '弱点扫描，精准打击',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 95, speed: 285, weakPointChance: 0.15, weakPointBonus: 0.5, scanRange: 200 },
      icon: '📊'
    },
    nature: {
      id: 'nature', name: '🌿 自然流', color: '#44ff88',
      description: '自然恢复，生生不息',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 130, speed: 265, regenRate: 0.003, thornDamage: 0.2, vineRoot: 0.1 },
      icon: '🌿'
    },
    psychic: {
      id: 'psychic', name: '🧠 心灵流', color: '#ff44ff',
      description: '心灵标记，预判增伤',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 90, speed: 290, markChance: 0.2, markBonus: 0.4, predictRange: 250 },
      icon: '🧠'
    },
    explosive: {
      id: 'explosive', name: '💥 爆破流', color: '#ff8800',
      description: '爆炸范围，连锁反应',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 85, speed: 285, explosionBonus: 0.3, explosionRadius: 70, chainExplosion: 0.1 },
      icon: '💥'
    },
    mech: {
      id: 'mech', name: '🤖 机械流', color: '#88aaff',
      description: '机器人军团，自动作战',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 115, speed: 270, robotCount: 0, robotDamage: 0.35, repairRate: 0.01 },
      icon: '🤖'
    },
    rune: {
      id: 'rune', name: '🔮 符文流', color: '#ffaa44',
      description: '符文印记，触发效果',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 100, speed: 280, runeDrop: 0.15, runeDuration: 5000, runeEffect: 0.3 },
      icon: '🔮'
    },
    star: {
      id: 'star', name: '⭐ 星辰流', color: '#ffffaa',
      description: '星能蓄力，满层爆发',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, starCharge: 0, maxStarCharge: 100, chargeRate: 5 },
      icon: '⭐'
    },
    darkGold: {
      id: 'darkGold', name: '💰 暗金流', color: '#ffcc00',
      description: '击杀额外金币，提升经济',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 280, goldBonus: 0.3, goldOnHit: 1, goldMagnet: 100 },
      icon: '💰'
    },
    storm: {
      id: 'storm', name: '🌪️ 风暴流', color: '#88ffcc',
      description: '风墙护体，龙卷攻击',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 290, windWallRadius: 80, windPushForce: 100, tornadoChance: 0.08 },
      icon: '🌪️'
    },
    soul: {
      id: 'soul', name: '👻 灵魂流', color: '#cc88ff',
      description: '收集灵魂，提升属性',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 280, soulCollect: 0, maxSouls: 50, soulBonus: 0.02 },
      icon: '👻'
    },
    genesis: {
      id: 'genesis', name: '🌌 创世流', color: '#ffffff',
      description: '随机增益，混沌创世',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, randomBuffInterval: 60000, buffDuration: 30000 },
      icon: '🌌'
    },
    tech: {
      id: 'tech', name: '⚙️ 科技流', color: '#44ddff',
      description: '技术强化，冷却缩减',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, skillBoost: 0.15, cooldownReduction: 0.1, nanoRepair: 0.005 },
      icon: '⚙️'
    },
    chaos: {
      id: 'chaos', name: '🎭 混沌流', color: '#ff44aa',
      description: '随机元素，混沌之力',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, randomEffectChance: 0.15, chaosMultiplier: 0.2 },
      icon: '🎭'
    },
    // ===== New Factions (43) =====
    light: {
      id: 'light', name: '☀️ 光之流', color: '#fff9c4',
      description: '光能汇聚，辐射照耀',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 95, speed: 285, lightCharge: 0, lightBurstDamage: 30 },
      icon: '☀️'
    },
    dark: {
      id: 'dark', name: '🌚 黯影流', color: '#1a1a2e',
      description: '暗影之力，吞噬光芒',
      baseStats: { attackSpeed: 1.0, attack: 1.15, hp: 90, speed: 295, shadowMeld: 0.1, darkBolt: 15 },
      icon: '🌚'
    },
    crystal: {
      id: 'crystal', name: '💎 水晶流', color: '#00e5ff',
      description: '水晶晶莹，破片飞散',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, crystalShardCount: 1, shardDamage: 0.3 },
      icon: '💎'
    },
    lava: {
      id: 'lava', name: '🌋 熔岩流', color: '#bf360c',
      description: '熔岩滚滚，灼烧大地',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 110, speed: 265, magmaPoolDamage: 8, magmaPoolRadius: 100 },
      icon: '🌋'
    },
    steam: {
      id: 'steam', name: '♨️ 蒸汽流', color: '#b0bec5',
      description: '蒸汽增压，爆发推进',
      baseStats: { attackSpeed: 1.15, attack: 0.85, hp: 100, speed: 310, steamPressure: 0.1, steamBurstRadius: 120 },
      icon: '♨️'
    },
    dust: {
      id: 'dust', name: '🌫️ 沙尘流', color: '#8d6e63',
      description: '沙尘蔽日，迷乱视野',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 105, speed: 285, dustBlindChance: 0.1, dustSlowAmount: 0.15 },
      icon: '🌫️'
    },
    metal: {
      id: 'metal', name: '⛓️ 钢铁流', color: '#455a64',
      description: '钢铁装甲，坚不可摧',
      baseStats: { attackSpeed: 0.9, attack: 0.95, hp: 140, speed: 260, armorPierce: 0.15, shrapnelCount: 0 },
      icon: '⛓️'
    },
    glass: {
      id: 'glass', name: '💠 玻璃流', color: '#80deea',
      description: '玻璃锋锐，脆弱而致命',
      baseStats: { attackSpeed: 1.1, attack: 1.2, hp: 70, speed: 295, glassShardChance: 0.2, shardDamage: 20 },
      icon: '💠'
    },
    silk: {
      id: 'silk', name: '🧣 丝线流', color: '#f06292',
      description: '丝线缠绕，以柔克刚',
      baseStats: { attackSpeed: 1.0, attack: 0.85, hp: 105, speed: 290, silkSnareChance: 0.1, silkSnareDuration: 2000 },
      icon: '🧣'
    },
    bone: {
      id: 'bone', name: '🦴 骸骨流', color: '#bcaaa4',
      description: '骸骨之力，死灵复苏',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 110, speed: 275, boneSpikeDamage: 10, boneArmor: 0.05 },
      icon: '🦴'
    },
    arrow: {
      id: 'arrow', name: '🎯 箭术流', color: '#ff6d00',
      description: '百步穿杨，精准致命',
      baseStats: { attackSpeed: 1.0, attack: 1.15, hp: 90, speed: 285, arrowPrecision: 0.2, arrowCritBonus: 0.3 },
      icon: '🎯'
    },
    spear: {
      id: 'spear', name: '🔱 长枪流', color: '#00695c',
      description: '枪出如龙，贯穿敌阵',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 105, speed: 275, spearPierceCount: 1, spearRange: 30 },
      icon: '🔱'
    },
    hammer: {
      id: 'hammer', name: '🔨 重锤流', color: '#4e342e',
      description: '重锤砸击，震荡波碎',
      baseStats: { attackSpeed: 0.85, attack: 1.3, hp: 120, speed: 255, hammerStunChance: 0.08, hammerRadius: 30 },
      icon: '🔨'
    },
    whip: {
      id: 'whip', name: '🪢 鞭笞流', color: '#ad1457',
      description: '长鞭横扫，群体打击',
      baseStats: { attackSpeed: 1.05, attack: 0.9, hp: 95, speed: 290, whipChainCount: 1, whipRange: 20 },
      icon: '🪢'
    },
    sword: {
      id: 'sword', name: '⚔️ 剑气流', color: '#78909c',
      description: '剑气纵横，连击无双',
      baseStats: { attackSpeed: 1.1, attack: 1.0, hp: 100, speed: 295, swordComboCount: 0, swordComboBonus: 0.1 },
      icon: '⚔️'
    },
    ax: {
      id: 'ax', name: '🪓 巨斧流', color: '#e64a19',
      description: '巨斧劈砍，摧枯拉朽',
      baseStats: { attackSpeed: 0.9, attack: 1.25, hp: 115, speed: 265, axCleaveRadius: 20, axCleaveDamage: 0.4 },
      icon: '🪓'
    },
    dagger: {
      id: 'dagger', name: '🗡️ 匕首流', color: '#263238',
      description: '匕首迅疾，背刺要害',
      baseStats: { attackSpeed: 1.2, attack: 1.05, hp: 85, speed: 310, daggerBackstabMult: 1.5, daggerCritChance: 0.1 },
      icon: '🗡️'
    },
    staff: {
      id: 'staff', name: '🪄 法杖流', color: '#6a1b9a',
      description: '法杖聚能，魔法洪流',
      baseStats: { attackSpeed: 0.95, attack: 1.1, hp: 95, speed: 280, magicCharge: 0, magicBurstDamage: 40 },
      icon: '🪄'
    },
    bow: {
      id: 'bow', name: '🏹 弓术流', color: '#2e7d32',
      description: '弓开如月，箭射流星',
      baseStats: { attackSpeed: 0.95, attack: 1.2, hp: 90, speed: 285, bowVolleyCount: 0, bowRangeBonus: 20 },
      icon: '🏹'
    },
    wolf: {
      id: 'wolf', name: '🐺 狼群流', color: '#5d4037',
      description: '狼群狩猎，团结协作',
      baseStats: { attackSpeed: 1.05, attack: 1.0, hp: 100, speed: 295, wolfPackAttack: 0.1, wolfPackRadius: 150 },
      icon: '🐺'
    },
    bear: {
      id: 'bear', name: '🐻 熊罴流', color: '#3e2723',
      description: '熊罴之力，厚积薄发',
      baseStats: { attackSpeed: 0.85, attack: 1.15, hp: 150, speed: 255, bearFortify: 0.1, bearRoarRadius: 150 },
      icon: '🐻'
    },
    eagle: {
      id: 'eagle', name: '🦅 鹰击流', color: '#0d47a1',
      description: '鹰击长空，俯冲猎杀',
      baseStats: { attackSpeed: 1.05, attack: 1.0, hp: 90, speed: 310, eagleSwoopDamage: 0.3, eagleSwoopRange: 50 },
      icon: '🦅'
    },
    snake: {
      id: 'snake', name: '🐍 蛇影流', color: '#1b5e20',
      description: '蛇影潜行，毒牙致命',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 95, speed: 295, snakeVenomDamage: 5, snakeVenomDuration: 2500 },
      icon: '🐍'
    },
    lion: {
      id: 'lion', name: '🦁 狮王流', color: '#f9a825',
      description: '狮王威仪，统御战场',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 120, speed: 285, lionAuraDamage: 0.15, lionAuraRadius: 180 },
      icon: '🦁'
    },
    tiger: {
      id: 'tiger', name: '🐯 虎威流', color: '#e65100',
      description: '猛虎下山，势不可挡',
      baseStats: { attackSpeed: 1.05, attack: 1.15, hp: 95, speed: 300, tigerPounceDamage: 0.4, tigerPounceRange: 40 },
      icon: '🐯'
    },
    fox: {
      id: 'fox', name: '🦊 狐魅流', color: '#880e4f',
      description: '狐魅灵巧，以智取胜',
      baseStats: { attackSpeed: 1.1, attack: 0.9, hp: 90, speed: 315, foxDodgeChance: 0.05, foxTrickDamage: 0.2 },
      icon: '🦊'
    },
    crane: {
      id: 'crane', name: '🕊️ 鹤翼流', color: '#006064',
      description: '鹤翼舒展，流水行云',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 100, speed: 300, craneDanceChance: 0.08, craneDanceDuration: 2000 },
      icon: '🕊️'
    },
    dragon: {
      id: 'dragon', name: '🐉 龙神流', color: '#283593',
      description: '龙神之力，毁天灭地',
      baseStats: { attackSpeed: 1.0, attack: 1.2, hp: 110, speed: 280, dragonBreathDamage: 15, dragonBreathRadius: 80 },
      icon: '🐉'
    },
    phoenix: {
      id: 'phoenix', name: '🌅 凤凰流', color: '#b71c1c',
      description: '凤凰涅槃，浴火重生',
      baseStats: { attackSpeed: 1.0, attack: 1.1, hp: 85, speed: 290, phoenixRebirthHp: 0.3, phoenixFireDamage: 10 },
      icon: '🌅'
    },
    dream: {
      id: 'dream', name: '💭 梦境流', color: '#7b1fa2',
      description: '梦境迷离，虚实难辨',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 100, speed: 280, dreamConfuseChance: 0.08, dreamConfuseDuration: 2000 },
      icon: '💭'
    },
    nightmare: {
      id: 'nightmare', name: '🌘 梦魇流', color: '#4a148c',
      description: '梦魇侵袭，恐惧蔓延',
      baseStats: { attackSpeed: 1.05, attack: 1.0, hp: 90, speed: 295, nightmareFearChance: 0.06, nightmareFearDuration: 1500 },
      icon: '🌘'
    },
    fate: {
      id: 'fate', name: '🎴 命运流', color: '#33691e',
      description: '命运交织，因果难逃',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, fateMarkChance: 0.15, fateMarkBonus: 0.25 },
      icon: '🎴'
    },
    destiny: {
      id: 'destiny', name: '✨ 天命流', color: '#e040fb',
      description: '天命所归，气运加身',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 105, speed: 285, destinyBuffChance: 0.12, destinyBuffAmount: 0.2 },
      icon: '✨'
    },
    karma: {
      id: 'karma', name: '☯️ 因果流', color: '#1de9b6',
      description: '因果循环，善恶有报',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 280, karmaReflect: 0.1, karmaStackBonus: 0.05 },
      icon: '☯️'
    },
    order: {
      id: 'order', name: '⚖️ 秩序流', color: '#1565c0',
      description: '秩序规约，法则掌控',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 110, speed: 275, orderRuneCount: 0, orderRuneDamage: 15 },
      icon: '⚖️'
    },
    truth: {
      id: 'truth', name: '👁️ 真实流', color: '#00acc1',
      description: '真实视野，破妄归真',
      baseStats: { attackSpeed: 1.0, attack: 1.05, hp: 95, speed: 285, trueSightChance: 0.1, trueDamageBonus: 0.2 },
      icon: '👁️'
    },
    lies: {
      id: 'lies', name: '🕸️ 谎言流', color: '#8e24aa',
      description: '编织谎言，迷惑敌人',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 95, speed: 295, liesDeceiveChance: 0.12, liesDeceiveDamage: 0.3 },
      icon: '🕸️'
    },
    forest: {
      id: 'forest', name: '🌲 森林流', color: '#004d40',
      description: '森林庇护，万物生长',
      baseStats: { attackSpeed: 1.0, attack: 0.9, hp: 125, speed: 270, forestRegen: 0.005, forestThornDamage: 0.15 },
      icon: '🌲'
    },
    mountain: {
      id: 'mountain', name: '⛰️ 山岳流', color: '#37474f',
      description: '山岳不动，稳如磐石',
      baseStats: { attackSpeed: 0.9, attack: 1.0, hp: 160, speed: 250, mountainDefense: 0.15, mountainCrush: 0.1 },
      icon: '⛰️'
    },
    river: {
      id: 'river', name: '🏞️ 川流流', color: '#0277bd',
      description: '川流不息，连绵不绝',
      baseStats: { attackSpeed: 1.1, attack: 0.9, hp: 100, speed: 295, riverFlowStack: 0, riverFlowBonus: 0.03 },
      icon: '🏞️'
    },
    ocean: {
      id: 'ocean', name: '🌏 沧海流', color: '#002171',
      description: '沧海深渊，暗流涌动',
      baseStats: { attackSpeed: 1.0, attack: 1.05, hp: 115, speed: 275, oceanDepthDamage: 5, oceanCurrentSlow: 0.1 },
      icon: '🌏'
    },
    desert: {
      id: 'desert', name: '🏜️ 沙漠流', color: '#d4a574',
      description: '炙热沙漠，干涸万物',
      baseStats: { attackSpeed: 1.0, attack: 1.0, hp: 100, speed: 285, desertScorchDamage: 4, desertThirstSlow: 0.1 },
      icon: '🏜️'
    },
    tundra: {
      id: 'tundra', name: '🧊 冻原流', color: '#eceff1',
      description: '冻原冰封，极寒主宰',
      baseStats: { attackSpeed: 1.0, attack: 0.95, hp: 110, speed: 275, tundraFrostChance: 0.1, tundraFrostDuration: 2000 },
      icon: '🧊'
    },
    phantom: {
      id: 'phantom', name: '👻 幻影流', color: '#b8d4ff',
      description: '虚化穿梭，无形杀敌',
      baseStats: { attackSpeed: 1.05, attack: 0.85, hp: 75, speed: 350, dodgeChance: 0.18, critRate: 0.10, critMult: 2.0 },
      icon: '👻'
    },
    chain: {
      id: 'chain', name: '⛓️ 连锁流', color: '#ffcc00',
      description: '闪电跳跃，链式反应',
      baseStats: { attackSpeed: 0.85, attack: 0.85, hp: 110, speed: 285, chainCount: 3, chainDamage: 0.55, critRate: 0.08, critMult: 1.7 },
      icon: '⛓️'
    },
    decay: {
      id: 'decay', name: '☢️ 衰变流', color: '#7fff00',
      description: '辐射侵蚀，缓慢消亡',
      baseStats: { attackSpeed: 0.75, attack: 0.75, hp: 130, speed: 275, decayRate: 0.04, decayDuration: 4, critRate: 0.06, critMult: 1.7 },
      icon: '☢️'
    },
    crystal: {
      id: 'crystal', name: '💎 晶能流', color: '#cc66ff',
      description: '晶碎四散，碎片风暴',
      baseStats: { attackSpeed: 0.9, attack: 1.05, hp: 100, speed: 295, crystalShards: 4, shatterDamage: 0.7, critRate: 0.07, critMult: 2.0 },
      icon: '💎'
    },
    momentum: {
      id: 'momentum', name: '⚡ 势能流', color: '#00ccff',
      description: '疾驰蓄力，动能转化',
      baseStats: { attackSpeed: 1.15, attack: 0.65, hp: 100, speed: 350, momentumRate: 0.06, maxMomentum: 100, critRate: 0.05, critMult: 1.5 },
      icon: '⚡'
    },
    pact: {
      id: 'pact', name: '📜 契约流', color: '#cc3344',
      description: '契约束缚，因果报偿',
      baseStats: { attackSpeed: 0.8, attack: 0.9, hp: 130, speed: 280, contractDuration: 5, maxContracts: 3, contractDamage: 0.25, critRate: 0.08, critMult: 1.8 },
      icon: '📜'
    },
    dream: {
      id: 'dream', name: '🌙 梦境流', color: '#7788dd',
      description: '催眠惑敌，幻境制胜',
      baseStats: { attackSpeed: 0.9, attack: 0.7, hp: 115, speed: 305, sleepChance: 0.12, confuseChance: 0.10, critRate: 0.10, critMult: 1.8 },
      icon: '🌙'
    },
    forge: {
      id: 'forge', name: '🔨 锻炉流', color: '#ff7733',
      description: '战场淬炼，越战越强',
      baseStats: { attackSpeed: 0.7, attack: 0.95, hp: 125, speed: 285, forgeStacksMax: 5, forgeDuration: 8, critRate: 0.06, critMult: 1.8 },
      icon: '🔨'
    },
    rebound: {
      id: 'rebound', name: '↩️ 弹射流', color: '#33ccaa',
      description: '弹跳连击，弹幕反弹',
      baseStats: { attackSpeed: 0.85, attack: 0.8, hp: 105, speed: 315, bounceCount: 3, bounceRetention: 0.65, critRate: 0.08, critMult: 1.6 },
      icon: '↩️'
    },
    shroud: {
      id: 'shroud', name: '🌫️ 迷雾流', color: '#6b5b8f',
      description: '烟雾笼罩，致盲匿踪',
      baseStats: { attackSpeed: 0.8, attack: 0.85, hp: 120, speed: 310, shroudRadius: 150, blindChance: 0.18, blindDuration: 3, critRate: 0.08, critMult: 1.7 },
      icon: '🌫️'
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

    // --- Fury Exclusive Skills ---
    { id: 'fr_berserk', name: '狂暴', faction: 'fury', type: 'passive', rarity: 'common',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.15 }] },
    { id: 'fr_lastStand', name: '绝地反击', faction: 'fury', type: 'conditional', rarity: 'rare',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.4, condition: 'lowHp' }, { stat: 'attackSpeed', op: 'multiply', value: -0.2, condition: 'lowHp' }] },
    { id: 'fr_rage', name: '怒火燃烧', faction: 'fury', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'lowHpBonus', op: 'add', value: 0.15 }] },

    // --- Luck Exclusive Skills ---
    { id: 'lk_fortune', name: '福星高照', faction: 'luck', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dropRateBonus', op: 'add', value: 0.1 }] },
    { id: 'lk_jackpot', name: '头奖', faction: 'luck', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'luckBonus', op: 'add', value: 0.2 }, { stat: 'critRate', op: 'add', value: 0.08 }] },
    { id: 'lk_miracle', name: '奇迹', faction: 'luck', type: 'conditional', rarity: 'epic',
      effects: [{ stat: 'reviveCount', op: 'add', value: 1 }, { stat: 'luckBonus', op: 'add', value: 0.1 }] },

    // --- Minion Exclusive Skills ---
    { id: 'mn_bloodOrb', name: '鲜血宝珠', faction: 'minion', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bloodOrbDrop', op: 'add', value: 0.1 }] },
    { id: 'mn_minionDmg', name: '魔仆强化', faction: 'minion', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'minionDamage', op: 'multiply', value: 0.3 }] },
    { id: 'mn_minionCount', name: '魔仆召唤', faction: 'minion', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'minionCount', op: 'add', value: 1 }] },

    // --- Data Exclusive Skills ---
    { id: 'dt_weakScan', name: '弱点扫描', faction: 'data', type: 'passive', rarity: 'common',
      effects: [{ stat: 'weakPointChance', op: 'add', value: 0.1 }] },
    { id: 'dt_critBonus', name: '精准打击', faction: 'data', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'weakPointBonus', op: 'multiply', value: 0.4 }] },
    { id: 'dt_scanRange', name: '全域扫描', faction: 'data', type: 'passive', rarity: 'rare',
      effects: [{ stat: 'scanRange', op: 'multiply', value: 0.5 }, { stat: 'weakPointChance', op: 'add', value: 0.05 }] },

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

    // ============ NEW: Sonic Faction Skills (5) ============
    { id: 'sn_wave', name: '音波扩散', faction: 'sonic', type: 'passive', rarity: 'common',
      effects: [{ stat: 'sonicRadius', op: 'add', value: 30 }, { stat: 'sonicDamage', op: 'add', value: 0.1 }] },
    { id: 'sn_echo', name: '回声共鸣', faction: 'sonic', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'sonicEcho', damage: 20, radius: 150, echoCount: 2 }] },
    { id: 'sn_resonance', name: '共振', faction: 'sonic', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'sonicResonance', damage: 35, duration: 4000, radius: 200, stunDuration: 1000 }] },
    { id: 'sn_amplify', name: '增幅', faction: 'sonic', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'sonicDamage', op: 'multiply', value: 0.5 }, { stat: 'attack', op: 'multiply', value: 0.1 }] },
    { id: 'sn_sonicBoom', name: '音爆', faction: 'sonic', type: 'active', rarity: 'legendary',
      cooldown: 45000, effects: [{ action: 'sonicBoom', damage: 60, duration: 5000, radius: 350, pushForce: 200, stunDuration: 2000 }] },

    // ============ NEW: Nature Faction Skills (5) ============
    { id: 'nt_regeneration', name: '自然恢复', faction: 'nature', type: 'passive', rarity: 'common',
      effects: [{ stat: 'regenRate', op: 'add', value: 0.003 }, { stat: 'hp', op: 'multiply', value: 0.1 }] },
    { id: 'nt_thorns', name: '荆棘护体', faction: 'nature', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'thornStrike', damage: 25, radius: 100 }] },
    { id: 'nt_vineRoot', name: '藤蔓缠绕', faction: 'nature', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'vineRoot', duration: 3000, radius: 180, slowAmount: 0.6 }] },
    { id: 'nt_photosynthesis', name: '光合作用', faction: 'nature', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'regenRate', op: 'multiply', value: 1.0 }, { stat: 'attack', op: 'multiply', value: 0.15 }] },
    { id: 'nt_bloom', name: '生命绽放', faction: 'nature', type: 'active', rarity: 'legendary',
      cooldown: 40000, effects: [{ action: 'bloom', healAmount: 50, duration: 6000, radius: 250, regenBoost: 0.01 }] },

    // ============ NEW: Psychic Faction Skills (5) ============
    { id: 'ps_mark', name: '心灵标记', faction: 'psychic', type: 'passive', rarity: 'common',
      effects: [{ stat: 'markChance', op: 'add', value: 0.15 }, { stat: 'markBonus', op: 'add', value: 0.1 }] },
    { id: 'ps_predict', name: '预判射击', faction: 'psychic', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'predictShot', bonusDamage: 30, predictRange: 300 }] },
    { id: 'ps_burst', name: '心灵爆破', faction: 'psychic', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'psychicBurst', damage: 55, radius: 200, markAll: true }] },
    { id: 'ps_telekinesis', name: '念力掌控', faction: 'psychic', type: 'passive', rarity: 'epic',
      effects: [{ stat: 'bulletRepelChance', op: 'add', value: 0.25 }, { stat: 'markBonus', op: 'multiply', value: 0.5 }] },
    { id: 'ps_mindControl', name: '精神控制', faction: 'psychic', type: 'active', rarity: 'legendary',
      cooldown: 50000, effects: [{ action: 'mindControl', duration: 4000, radius: 200, convertDamage: 1.5 }] },

    // ============ NEW: Explosive Faction Skills (3) ============
    { id: 'ex_explosiveAmmo', name: '爆破弹药', faction: 'explosive', type: 'passive', rarity: 'common',
      effects: [{ stat: 'explosionBonus', op: 'add', value: 0.15 }, { stat: 'explosionRadius', op: 'add', value: 20 }] },
    { id: 'ex_chainReaction', name: '连锁反应', faction: 'explosive', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'explosion', damage: 30, radius: 120 }] },
    { id: 'ex_bigBang', name: '大爆炸', faction: 'explosive', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'bigBang', damage: 120, radius: 300, chainExplosionBonus: 0.3 }] },

    // ============ NEW: Mech Faction Skills (3) ============
    { id: 'mc_repairKit', name: '维修套件', faction: 'mech', type: 'passive', rarity: 'common',
      effects: [{ stat: 'repairRate', op: 'add', value: 0.01 }, { stat: 'maxHp', op: 'add', value: 20 }] },
    { id: 'mc_robotArm', name: '机械臂强化', faction: 'mech', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'robotDamage', op: 'add', value: 0.15 }] },
    { id: 'mc_deploy', name: '紧急部署', faction: 'mech', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'deployRobot', count: 2, duration: 8000, damage: 20 }] },

    // ============ NEW: Tech Faction Skills (3) ============
    { id: 'tc_cooldown', name: '冷却优化', faction: 'tech', type: 'passive', rarity: 'common',
      effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.08 }] },
    { id: 'tc_skillBoost', name: '技能强化', faction: 'tech', type: 'passive', rarity: 'uncommon',
      effects: [{ stat: 'skillBoost', op: 'add', value: 0.1 }] },
    { id: 'tc_nanoField', name: '纳米修复场', faction: 'tech', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'nanoField', healPerSec: 8, duration: 5000, radius: 180, cooldownBoost: 0.2 }] },

    // ============ NEW: Chaos Faction Skills (3) ============
    { id: 'ch_randomShot', name: '混沌射击', faction: 'chaos', type: 'passive', rarity: 'common',
      effects: [{ stat: 'randomEffectChance', op: 'add', value: 0.1 }, { stat: 'chaosMultiplier', op: 'add', value: 0.1 }] },
    { id: 'ch_chaosOrb', name: '混沌法球', faction: 'chaos', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'chaosOrb', damage: 35, radius: 140, randomEffect: true }] },
    { id: 'ch_wildMagic', name: '狂乱魔法', faction: 'chaos', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'wildMagic', damage: 60, radius: 220, chaosMultiplierBoost: 0.5 }] },

    // ============ NEW: Rune Faction Skills (3) ============
    { id: 'rn_mark', name: '符文印记', faction: 'rune', type: 'passive', rarity: 'common',
      effects: [{ stat: 'runeDrop', op: 'add', value: 0.1 }, { stat: 'runeDuration', op: 'add', value: 1000 }] },
    { id: 'rn_chain', name: '符文连锁', faction: 'rune', type: 'conditional', rarity: 'uncommon',
      trigger: 'onRuneTrigger', effects: [{ action: 'runeChain', damage: 30, radius: 180, chainCount: 2 }] },
    { id: 'rn_explosion', name: '符文爆破', faction: 'rune', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'runeExplosion', damage: 50, radius: 250, runeEffectBoost: 0.5 }] },

    // ============ NEW: Star Faction Skills (3) ============
    { id: 'st_charge', name: '星能蓄力', faction: 'star', type: 'passive', rarity: 'common',
      effects: [{ stat: 'chargeRate', op: 'add', value: 2 }, { stat: 'maxStarCharge', op: 'add', value: 20 }] },
    { id: 'st_burst', name: '星辰爆发', faction: 'star', type: 'conditional', rarity: 'uncommon',
      trigger: 'onMaxCharge', effects: [{ action: 'starBurst', damage: 80, radius: 300, chargeReset: true }] },
    { id: 'st_shower', name: '流星雨', faction: 'star', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'starShower', damage: 40, count: 8, duration: 3000, radius: 250 }] },

    // ============ NEW: DarkGold Faction Skills (3) ============
    { id: 'dg_goldRush', name: '淘金热', faction: 'darkGold', type: 'passive', rarity: 'common',
      effects: [{ stat: 'goldBonus', op: 'add', value: 0.15 }, { stat: 'goldOnHit', op: 'add', value: 1 }] },
    { id: 'dg_midas', name: '点金术', faction: 'darkGold', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'midas', goldMultiplier: 2.0, duration: 3000 }] },
    { id: 'dg_magnet', name: '金币磁石', faction: 'darkGold', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'goldMagnet', radius: 400, duration: 5000, goldPerSecond: 5 }] },

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

    // ============ NEW: Light Faction Skills (3) ============
    { id: 'lt_radiance', name: '光能汇聚', faction: 'light', type: 'passive', rarity: 'common',
      effects: [{ stat: 'lightCharge', op: 'add', value: 10 }, { stat: 'attack', op: 'multiply', value: 0.08 }] },
    { id: 'lt_flash', name: '闪光爆', faction: 'light', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'flash', damage: 30, radius: 120, blindDuration: 1500 }] },
    { id: 'lt_solarBeam', name: '太阳光束', faction: 'light', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'solarBeam', damage: 15, duration: 3000, beamWidth: 40, tickRate: 200 }] },
    // ============ NEW: Dark Faction Skills (3) ============
    { id: 'dk_shroud', name: '暗影斗篷', faction: 'dark', type: 'passive', rarity: 'common',
      effects: [{ stat: 'shadowMeld', op: 'add', value: 0.08 }, { stat: 'dodgeChance', op: 'add', value: 0.03 }] },
    { id: 'dk_consume', name: '暗影吞噬', faction: 'dark', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ stat: 'hp', op: 'add', value: 5 }, { stat: 'shadowMeld', op: 'add', value: 0.02, duration: 5000 }] },
    { id: 'dk_voidStrike', name: '虚空打击', faction: 'dark', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'voidStrike', damage: 80, radius: 150, shadowBonus: 0.5 }] },
    // ============ NEW: Crystal Faction Skills (3) ============
    { id: 'cy_shatter', name: '水晶碎裂', faction: 'crystal', type: 'passive', rarity: 'common',
      effects: [{ stat: 'crystalShardCount', op: 'add', value: 1 }, { stat: 'shardDamage', op: 'add', value: 0.1 }] },
    { id: 'cy_refract', name: '折射', faction: 'crystal', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'shardSpray', damage: 15, count: 3, spreadAngle: 60 }] },
    { id: 'cy_prism', name: '棱镜之光', faction: 'crystal', type: 'active', rarity: 'rare',
      cooldown: 16000, effects: [{ action: 'prismBeam', damage: 40, duration: 3000, splitCount: 3 }] },
    // ============ NEW: Lava Faction Skills (3) ============
    { id: 'lv_erupt', name: '岩浆喷发', faction: 'lava', type: 'passive', rarity: 'common',
      effects: [{ stat: 'magmaPoolDamage', op: 'add', value: 5 }, { stat: 'magmaPoolRadius', op: 'add', value: 20 }] },
    { id: 'lv_magma', name: '熔岩飞溅', faction: 'lava', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'magmaSplash', damage: 25, radius: 100, burnDuration: 2000 }] },
    { id: 'lv_volcano', name: '火山爆发', faction: 'lava', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'volcano', damage: 60, radius: 280, duration: 3000, tickRate: 500 }] },
    // ============ NEW: Steam Faction Skills (3) ============
    { id: 'se_pressure', name: '蒸汽增压', faction: 'steam', type: 'passive', rarity: 'common',
      effects: [{ stat: 'steamPressure', op: 'add', value: 0.08 }, { stat: 'attackSpeed', op: 'multiply', value: -0.05 }] },
    { id: 'se_cloud', name: '蒸汽云', faction: 'steam', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', effects: [{ action: 'steamCloud', damage: 10, duration: 3000, radius: 120, slowAmount: 0.3 }] },
    { id: 'se_geyser', name: '蒸汽喷泉', faction: 'steam', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'geyser', damage: 50, radius: 150, pushForce: 150 }] },
    // ============ NEW: Dust Faction Skills (3) ============
    { id: 'du_sandBlast', name: '沙尘喷射', faction: 'dust', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dustBlindChance', op: 'add', value: 0.08 }, { stat: 'dustSlowAmount', op: 'add', value: 0.05 }] },
    { id: 'du_dustDevil', name: '沙尘恶魔', faction: 'dust', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'dustDevil', damage: 15, duration: 3000, radius: 150, slowAmount: 0.3 }] },
    { id: 'du_sirocco', name: '热风侵袭', faction: 'dust', type: 'active', rarity: 'rare',
      cooldown: 16000, effects: [{ action: 'sirocco', damage: 40, duration: 4000, radius: 250, pushForce: 100 }] },
    // ============ NEW: Metal Faction Skills (3) ============
    { id: 'mt_shrapnel', name: '弹片飞散', faction: 'metal', type: 'passive', rarity: 'common',
      effects: [{ stat: 'shrapnelCount', op: 'add', value: 2 }, { stat: 'armorPierce', op: 'add', value: 0.05 }] },
    { id: 'mt_armor', name: '钢铁装甲', faction: 'metal', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', cooldown: 8000, effects: [{ stat: 'defense', op: 'add', value: 0.15, duration: 3000 }] },
    { id: 'mt_railgun', name: '电磁炮', faction: 'metal', type: 'active', rarity: 'rare',
      cooldown: 14000, effects: [{ action: 'railgun', damage: 120, pierceCount: 5, range: 500 }] },
    // ============ NEW: Glass Faction Skills (3) ============
    { id: 'gl_fragile', name: '易碎品', faction: 'glass', type: 'passive', rarity: 'common',
      effects: [{ stat: 'glassShardChance', op: 'add', value: 0.12 }, { stat: 'critMult', op: 'add', value: 0.3 }] },
    { id: 'gl_splinter', name: '碎片飞溅', faction: 'glass', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'splinter', damage: 20, count: 4, spreadAngle: 90 }] },
    { id: 'gl_mirrorBlade', name: '镜刃风暴', faction: 'glass', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'mirrorBlade', damage: 35, duration: 3000, radius: 150, tickRate: 200 }] },
    // ============ NEW: Silk Faction Skills (3) ============
    { id: 'si_weave', name: '丝线编织', faction: 'silk', type: 'passive', rarity: 'common',
      effects: [{ stat: 'silkSnareChance', op: 'add', value: 0.08 }, { stat: 'silkSnareDuration', op: 'add', value: 500 }] },
    { id: 'si_cocoon', name: '茧缚', faction: 'silk', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'cocoon', duration: 2000, slowAmount: 0.6 }] },
    { id: 'si_webTrap', name: '蛛网陷阱', faction: 'silk', type: 'active', rarity: 'rare',
      cooldown: 14000, effects: [{ action: 'webTrap', radius: 180, duration: 5000, slowAmount: 0.5 }] },
    // ============ NEW: Bone Faction Skills (3) ============
    { id: 'bn_spike', name: '骨刺', faction: 'bone', type: 'passive', rarity: 'common',
      effects: [{ stat: 'boneSpikeDamage', op: 'add', value: 8 }, { stat: 'boneArmor', op: 'add', value: 0.03 }] },
    { id: 'bn_ossify', name: '骨化', faction: 'bone', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ stat: 'defense', op: 'add', value: 0.08, duration: 5000 }, { stat: 'maxHp', op: 'add', value: 5 }] },
    { id: 'bn_skeleton', name: '骷髅召唤', faction: 'bone', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'summonSkeleton', count: 2, duration: 8000, damage: 15 }] },
    // ============ NEW: Arrow Faction Skills (3) ============
    { id: 'ar_pierce', name: '贯穿射击', faction: 'arrow', type: 'passive', rarity: 'common',
      effects: [{ stat: 'arrowPrecision', op: 'add', value: 0.15 }, { stat: 'pierceCount', op: 'add', value: 1 }] },
    { id: 'ar_volley', name: '箭雨', faction: 'arrow', type: 'conditional', rarity: 'uncommon',
      trigger: 'onCrit', effects: [{ action: 'arrowVolley', damage: 20, count: 5, spreadAngle: 30 }] },
    { id: 'ar_trueshot', name: '百步穿杨', faction: 'arrow', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'trueshot', damage: 200, singleTarget: true, guaranteedCrit: true }] },
    // ============ NEW: Spear Faction Skills (3) ============
    { id: 'sp_thrust', name: '突刺', faction: 'spear', type: 'passive', rarity: 'common',
      effects: [{ stat: 'spearPierceCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.06 }] },
    { id: 'sp_impale', name: '穿刺', faction: 'spear', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'impale', damage: 40, stunDuration: 1000 }] },
    { id: 'sp_whirlwind', name: '回旋枪', faction: 'spear', type: 'active', rarity: 'rare',
      cooldown: 14000, effects: [{ action: 'spearWhirlwind', damage: 30, duration: 2500, radius: 160 }] },
    // ============ NEW: Hammer Faction Skills (3) ============
    { id: 'hm_smash', name: '猛击', faction: 'hammer', type: 'passive', rarity: 'common',
      effects: [{ stat: 'hammerStunChance', op: 'add', value: 0.06 }, { stat: 'attack', op: 'multiply', value: 0.1 }] },
    { id: 'hm_quake', name: '地震波', faction: 'hammer', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'shockwave', damage: 25, radius: 150, stunDuration: 800 }] },
    { id: 'hm_megaton', name: '百万吨重击', faction: 'hammer', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'megatonSlam', damage: 150, radius: 250, stunDuration: 1500, screenShake: true }] },
    // ============ NEW: Whip Faction Skills (3) ============
    { id: 'wh_lash', name: '鞭挞', faction: 'whip', type: 'passive', rarity: 'common',
      effects: [{ stat: 'whipChainCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    { id: 'wh_snare', name: '缠绕鞭', faction: 'whip', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'whipSnare', duration: 2000, slowAmount: 0.4 }] },
    { id: 'wh_cascade', name: '鞭笞连击', faction: 'whip', type: 'active', rarity: 'rare',
      cooldown: 12000, effects: [{ action: 'whipCascade', damage: 25, hits: 5, radius: 180 }] },
    // ============ NEW: Sword Faction Skills (3) ============
    { id: 'sw_slash', name: '斩击', faction: 'sword', type: 'passive', rarity: 'common',
      effects: [{ stat: 'swordComboCount', op: 'add', value: 1 }, { stat: 'attackSpeed', op: 'multiply', value: -0.05 }] },
    { id: 'sw_bladeFury', name: '剑刃风暴', faction: 'sword', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 3000, effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.2 }, { stat: 'attack', op: 'multiply', value: 0.15 }] },
    { id: 'sw_iaijutsu', name: '居合斩', faction: 'sword', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'iaijutsu', damage: 180, radius: 200, lineWidth: 50 }] },
    // ============ NEW: Ax Faction Skills (3) ============
    { id: 'ax_cleave', name: '顺劈', faction: 'ax', type: 'passive', rarity: 'common',
      effects: [{ stat: 'axCleaveRadius', op: 'add', value: 15 }, { stat: 'axCleaveDamage', op: 'add', value: 0.15 }] },
    { id: 'ax_brutal', name: '残暴打击', faction: 'ax', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'cleaveExplosion', damage: 40, radius: 120 }] },
    { id: 'ax_whirlwind', name: '旋风斧', faction: 'ax', type: 'active', rarity: 'rare',
      cooldown: 16000, effects: [{ action: 'axWhirlwind', damage: 30, duration: 3000, radius: 160 }] },
    // ============ NEW: Dagger Faction Skills (3) ============
    { id: 'da_backstab', name: '背刺', faction: 'dagger', type: 'passive', rarity: 'common',
      effects: [{ stat: 'daggerBackstabMult', op: 'add', value: 0.5 }, { stat: 'daggerCritChance', op: 'add', value: 0.05 }] },
    { id: 'da_poisonBlade', name: '淬毒刀刃', faction: 'dagger', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'poisonBlade', damage: 10, poisonDamage: 5, poisonDuration: 3000 }] },
    { id: 'da_shadowStrike', name: '暗影突袭', faction: 'dagger', type: 'active', rarity: 'rare',
      cooldown: 10000, effects: [{ action: 'shadowStrike', damage: 70, teleportRange: 250, backstabMultiplier: 2.0 }] },
    // ============ NEW: Staff Faction Skills (3) ============
    { id: 'sf_arcane', name: '奥术飞弹', faction: 'staff', type: 'passive', rarity: 'common',
      effects: [{ stat: 'magicCharge', op: 'add', value: 8 }, { stat: 'magicBurstDamage', op: 'add', value: 10 }] },
    { id: 'sf_manaSurge', name: '魔力涌动', faction: 'staff', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 4000, effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }, { stat: 'magicCharge', op: 'add', value: 20 }] },
    { id: 'sf_arcaneStorm', name: '奥术风暴', faction: 'staff', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'arcaneStorm', damage: 35, duration: 4000, radius: 220, tickRate: 300 }] },
    // ============ NEW: Bow Faction Skills (3) ============
    { id: 'bw_rapid', name: '速射', faction: 'bow', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bowVolleyCount', op: 'add', value: 1 }, { stat: 'attackSpeed', op: 'multiply', value: -0.08 }] },
    { id: 'bw_rain', name: '箭雨覆盖', faction: 'bow', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'arrowRain', damage: 15, count: 8, radius: 180 }] },
    { id: 'bw_barrage', name: '弓术 barrage', faction: 'bow', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'bowBarrage', damage: 25, count: 12, duration: 2000, spreadAngle: 45 }] },
    // ============ NEW: Wolf Faction Skills (3) ============
    { id: 'wf_howl', name: '狼嚎', faction: 'wolf', type: 'passive', rarity: 'common',
      effects: [{ stat: 'wolfPackAttack', op: 'add', value: 0.08 }, { stat: 'wolfPackRadius', op: 'add', value: 30 }] },
    { id: 'wf_pack', name: '狼群狩猎', faction: 'wolf', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 5000, effects: [{ stat: 'wolfPackAttack', op: 'add', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.15 }] },
    { id: 'wf_hunt', name: '猎杀时刻', faction: 'wolf', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'wolfHunt', damage: 40, count: 3, duration: 6000, targetLowHp: true }] },
    // ============ NEW: Bear Faction Skills (3) ============
    { id: 'br_roar', name: '熊吼', faction: 'bear', type: 'passive', rarity: 'common',
      effects: [{ stat: 'bearFortify', op: 'add', value: 0.06 }, { stat: 'attack', op: 'multiply', value: 0.08 }] },
    { id: 'br_hibernate', name: '冬眠', faction: 'bear', type: 'conditional', rarity: 'uncommon',
      trigger: 'onLowHp', cooldown: 30000, effects: [{ stat: 'hpRegen', op: 'multiply', value: 3.0, duration: 5000 }] },
    { id: 'br_maul', name: '熊掌拍击', faction: 'bear', type: 'active', rarity: 'rare',
      cooldown: 14000, effects: [{ action: 'maul', damage: 100, radius: 120, stunDuration: 1200 }] },
    // ============ NEW: Eagle Faction Skills (3) ============
    { id: 'eg_dive', name: '俯冲', faction: 'eagle', type: 'passive', rarity: 'common',
      effects: [{ stat: 'eagleSwoopDamage', op: 'add', value: 0.2 }, { stat: 'eagleSwoopRange', op: 'add', value: 20 }] },
    { id: 'eg_keen', name: '鹰眼', faction: 'eagle', type: 'conditional', rarity: 'uncommon',
      trigger: 'onCrit', effects: [{ stat: 'critRate', op: 'add', value: 0.08, duration: 3000 }] },
    { id: 'eg_storm', name: '风暴之翼', faction: 'eagle', type: 'active', rarity: 'rare',
      cooldown: 16000, effects: [{ action: 'eagleStorm', damage: 30, duration: 4000, radius: 180, pushForce: 80 }] },
    // ============ NEW: Snake Faction Skills (3) ============
    { id: 'sa_coil', name: '盘绕', faction: 'snake', type: 'passive', rarity: 'common',
      effects: [{ stat: 'snakeVenomDamage', op: 'add', value: 5 }, { stat: 'snakeVenomDuration', op: 'add', value: 500 }] },
    { id: 'sa_venomFang', name: '毒牙', faction: 'snake', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'venomBite', damage: 20, poisonDamage: 10, poisonDuration: 4000 }] },
    { id: 'sa_serpent', name: '巨蛇召唤', faction: 'snake', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'summonSerpent', damage: 25, duration: 6000, radius: 120, poisonAura: true }] },
    // ============ NEW: Lion Faction Skills (3) ============
    { id: 'li_majesty', name: '狮王威严', faction: 'lion', type: 'passive', rarity: 'common',
      effects: [{ stat: 'lionAuraDamage', op: 'add', value: 0.1 }, { stat: 'lionAuraRadius', op: 'add', value: 30 }] },
    { id: 'li_pride', name: '狮群 pride', faction: 'lion', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 5000, effects: [{ stat: 'lionAuraDamage', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.15 }] },
    { id: 'li_territory', name: '领地宣言', faction: 'lion', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'territory', damage: 20, duration: 6000, radius: 250, allyBuff: 0.2 }] },
    // ============ NEW: Tiger Faction Skills (3) ============
    { id: 'ti_pounce', name: '猛扑', faction: 'tiger', type: 'passive', rarity: 'common',
      effects: [{ stat: 'tigerPounceDamage', op: 'add', value: 0.2 }, { stat: 'tigerPounceRange', op: 'add', value: 15 }] },
    { id: 'ti_fury', name: '虎威 fury', faction: 'tiger', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 3000, effects: [{ stat: 'attack', op: 'multiply', value: 0.3 }, { stat: 'speed', op: 'multiply', value: 0.2 }] },
    { id: 'ti_stalk', name: '潜行追踪', faction: 'tiger', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'stalk', duration: 4000, stealth: true, nextAttackBonus: 2.0 }] },
    // ============ NEW: Fox Faction Skills (3) ============
    { id: 'fx_trick', name: '狐火 trick', faction: 'fox', type: 'passive', rarity: 'common',
      effects: [{ stat: 'foxDodgeChance', op: 'add', value: 0.04 }, { stat: 'foxTrickDamage', op: 'add', value: 0.15 }] },
    { id: 'fx_evade', name: '灵巧闪避', faction: 'fox', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', effects: [{ action: 'foxFire', damage: 20, count: 3, homing: true }] },
    { id: 'fx_willowisp', name: '狐火鬼火', faction: 'fox', type: 'active', rarity: 'rare',
      cooldown: 14000, effects: [{ action: 'willOWisp', damage: 15, count: 5, duration: 5000, homing: true }] },
    // ============ NEW: Crane Faction Skills (3) ============
    { id: 'cn_glide', name: '滑翔', faction: 'crane', type: 'passive', rarity: 'common',
      effects: [{ stat: 'craneDanceChance', op: 'add', value: 0.05 }, { stat: 'speed', op: 'multiply', value: 0.06 }] },
    { id: 'cn_wing', name: '鹤翼展翅', faction: 'crane', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', duration: 3000, effects: [{ stat: 'attack', op: 'multiply', value: 0.2 }, { stat: 'dodgeChance', op: 'add', value: 0.05 }] },
    { id: 'cn_tranquility', name: '宁静之境', faction: 'crane', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'tranquility', healPerSec: 10, duration: 5000, radius: 200, enemySlow: 0.3 }] },
    // ============ NEW: Dragon Faction Skills (3) ============
    { id: 'dr_breath', name: '龙息', faction: 'dragon', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dragonBreathDamage', op: 'add', value: 8 }, { stat: 'dragonBreathRadius', op: 'add', value: 20 }] },
    { id: 'dr_scales', name: '龙鳞甲', faction: 'dragon', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', cooldown: 12000, effects: [{ stat: 'defense', op: 'add', value: 0.2, duration: 4000 }] },
    { id: 'dr_ascend', name: '龙神降临', faction: 'dragon', type: 'active', rarity: 'rare',
      cooldown: 30000, effects: [{ action: 'dragonAscend', damage: 50, duration: 5000, radius: 300, burnDamage: 15 }] },
    // ============ NEW: Phoenix Faction Skills (3) ============
    { id: 'px_flame', name: '凤凰火焰', faction: 'phoenix', type: 'passive', rarity: 'common',
      effects: [{ stat: 'phoenixFireDamage', op: 'add', value: 8 }, { stat: 'burnDamage', op: 'add', value: 3 }] },
    { id: 'px_rebirth', name: '涅槃重生', faction: 'phoenix', type: 'conditional', rarity: 'uncommon',
      trigger: 'onLethalDamage', cooldown: 90000, effects: [{ action: 'rebirth', healPercent: 0.5, radius: 300, damage: 80 }] },
    { id: 'px_inferno', name: '烈焰地狱', faction: 'phoenix', type: 'active', rarity: 'rare',
      cooldown: 24000, effects: [{ action: 'inferno', damage: 30, duration: 5000, radius: 250, burnDamage: 12 }] },
    // ============ NEW: Dream Faction Skills (3) ============
    { id: 'dm_sleep', name: '催眠', faction: 'dream', type: 'passive', rarity: 'common',
      effects: [{ stat: 'dreamConfuseChance', op: 'add', value: 0.06 }, { stat: 'dreamConfuseDuration', op: 'add', value: 500 }] },
    { id: 'dm_nightmare', name: '噩梦', faction: 'dream', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'nightmare', damage: 15, confuseDuration: 2000, fearChance: 0.3 }] },
    { id: 'dm_illusion', name: '幻象领域', faction: 'dream', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'illusionField', duration: 5000, radius: 200, confuseEnemies: true, decoyCount: 2 }] },
    // ============ NEW: Nightmare Faction Skills (3) ============
    { id: 'nm_terror', name: '恐惧 terror', faction: 'nightmare', type: 'passive', rarity: 'common',
      effects: [{ stat: 'nightmareFearChance', op: 'add', value: 0.05 }, { stat: 'nightmareFearDuration', op: 'add', value: 300 }] },
    { id: 'nm_haunt', name: '萦绕 haunt', faction: 'nightmare', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'haunt', damage: 10, duration: 5000, radius: 100, fearChance: 0.2 }] },
    { id: 'nm_abyss', name: '深渊凝视', faction: 'nightmare', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'abyssGaze', damage: 40, duration: 3000, radius: 250, fearDuration: 2000 }] },
    // ============ NEW: Fate Faction Skills (3) ============
    { id: 'ft_weave', name: '命运编织', faction: 'fate', type: 'passive', rarity: 'common',
      effects: [{ stat: 'fateMarkChance', op: 'add', value: 0.12 }, { stat: 'fateMarkBonus', op: 'add', value: 0.1 }] },
    { id: 'ft_inevitable', name: '命中注定', faction: 'fate', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'fateMark', duration: 5000, bonusDamage: 0.3 }] },
    { id: 'ft_redemption', name: '命运救赎', faction: 'fate', type: 'active', rarity: 'rare',
      cooldown: 30000, effects: [{ action: 'fateRedemption', healPercent: 0.4, markedEnemyDamage: 100 }] },
    // ============ NEW: Destiny Faction Skills (3) ============
    { id: 'dy_bless', name: '天命祝福', faction: 'destiny', type: 'passive', rarity: 'common',
      effects: [{ stat: 'destinyBuffChance', op: 'add', value: 0.1 }, { stat: 'destinyBuffAmount', op: 'add', value: 0.08 }] },
    { id: 'dy_vision', name: '天命预言', faction: 'destiny', type: 'conditional', rarity: 'uncommon',
      trigger: 'onLevelUp', effects: [{ stat: 'destinyBuffChance', op: 'add', value: 0.2, duration: 30000 }] },
    { id: 'dy_manifest', name: '天命显现', faction: 'destiny', type: 'active', rarity: 'rare',
      cooldown: 28000, effects: [{ action: 'destinyManifest', duration: 5000, allStatsBonus: 0.3, radius: 200 }] },
    // ============ NEW: Karma Faction Skills (3) ============
    { id: 'km_retribution', name: '报应', faction: 'karma', type: 'passive', rarity: 'common',
      effects: [{ stat: 'karmaReflect', op: 'add', value: 0.06 }, { stat: 'karmaStackBonus', op: 'add', value: 0.03 }] },
    { id: 'km_balance', name: '因果平衡', faction: 'karma', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'karmaBalance', damage: 30, healAmount: 15 }] },
    { id: 'km_cycle', name: '轮回', faction: 'karma', type: 'active', rarity: 'rare',
      cooldown: 35000, effects: [{ action: 'karmaCycle', damage: 60, radius: 250, stackConsume: true, bonusPerStack: 0.1 }] },
    // ============ NEW: Order Faction Skills (3) ============
    { id: 'or_law', name: '秩序法则', faction: 'order', type: 'passive', rarity: 'common',
      effects: [{ stat: 'orderRuneCount', op: 'add', value: 1 }, { stat: 'orderRuneDamage', op: 'add', value: 8 }] },
    { id: 'or_discipline', name: '严明纪律', faction: 'order', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'orderStrike', damage: 30, radius: 100, slowAmount: 0.3 }] },
    { id: 'or_sanction', name: '秩序制裁', faction: 'order', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'orderSanction', damage: 80, radius: 180, enemySlow: 0.5, duration: 3000 }] },
    // ============ NEW: Truth Faction Skills (3) ============
    { id: 'tr_reveal', name: '真相揭露', faction: 'truth', type: 'passive', rarity: 'common',
      effects: [{ stat: 'trueSightChance', op: 'add', value: 0.08 }, { stat: 'trueDamageBonus', op: 'add', value: 0.1 }] },
    { id: 'tr_pierce', name: '真实穿透', faction: 'truth', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'truePierce', damage: 25, ignoreDefense: true }] },
    { id: 'tr_judgment', name: '真实裁决', faction: 'truth', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'trueJudgment', damage: 120, radius: 200, trueDamage: true }] },
    // ============ NEW: Lies Faction Skills (3) ============
    { id: 'le_mirage', name: '海市蜃楼', faction: 'lies', type: 'passive', rarity: 'common',
      effects: [{ stat: 'liesDeceiveChance', op: 'add', value: 0.1 }, { stat: 'liesDeceiveDamage', op: 'add', value: 0.1 }] },
    { id: 'le_betray', name: '背叛', faction: 'lies', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'betray', damage: 35, confuseEnemy: true, duration: 2000 }] },
    { id: 'le_puppet', name: '傀儡操控', faction: 'lies', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'puppetMaster', duration: 4000, convertChance: 0.5, radius: 200 }] },
    // ============ NEW: Forest Faction Skills (3) ============
    { id: 'fo_growth', name: '生长', faction: 'forest', type: 'passive', rarity: 'common',
      effects: [{ stat: 'forestRegen', op: 'add', value: 0.003 }, { stat: 'forestThornDamage', op: 'add', value: 0.1 }] },
    { id: 'fo_bramble', name: '荆棘陷阱', faction: 'forest', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'bramble', damage: 20, radius: 120, thornReturn: 0.2 }] },
    { id: 'fo_entangle', name: '自然缠绕', faction: 'forest', type: 'active', rarity: 'rare',
      cooldown: 15000, effects: [{ action: 'entangle', duration: 3000, radius: 200, slowAmount: 0.5, damagePerSec: 10 }] },
    // ============ NEW: Mountain Faction Skills (3) ============
    { id: 'mo_stone', name: '石肤术', faction: 'mountain', type: 'passive', rarity: 'common',
      effects: [{ stat: 'mountainDefense', op: 'add', value: 0.1 }, { stat: 'maxHp', op: 'multiply', value: 0.08 }] },
    { id: 'mo_bulwark', name: '壁垒', faction: 'mountain', type: 'conditional', rarity: 'uncommon',
      trigger: 'onLowHp', cooldown: 20000, effects: [{ stat: 'defense', op: 'add', value: 0.3, duration: 5000 }] },
    { id: 'mo_landslide', name: '山崩地裂', faction: 'mountain', type: 'active', rarity: 'rare',
      cooldown: 25000, effects: [{ action: 'landslide', damage: 80, radius: 300, stunDuration: 1000, knockback: 200 }] },
    // ============ NEW: River Faction Skills (3) ============
    { id: 'rv_current', name: '水流', faction: 'river', type: 'passive', rarity: 'common',
      effects: [{ stat: 'riverFlowStack', op: 'add', value: 1 }, { stat: 'speed', op: 'multiply', value: 0.05 }] },
    { id: 'rv_rapids', name: '急流', faction: 'river', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', duration: 3000, effects: [{ stat: 'riverFlowBonus', op: 'multiply', value: 0.5 }, { stat: 'speed', op: 'multiply', value: 0.2 }] },
    { id: 'rv_deluge', name: '洪水泛滥', faction: 'river', type: 'active', rarity: 'rare',
      cooldown: 18000, effects: [{ action: 'deluge', damage: 40, radius: 300, pushForce: 150, slowAmount: 0.3 }] },
    // ============ NEW: Ocean Faction Skills (3) ============
    { id: 'oc_tide', name: '潮汐', faction: 'ocean', type: 'passive', rarity: 'common',
      effects: [{ stat: 'oceanDepthDamage', op: 'add', value: 5 }, { stat: 'oceanCurrentSlow', op: 'add', value: 0.05 }] },
    { id: 'oc_whirlpool', name: '漩涡', faction: 'ocean', type: 'conditional', rarity: 'uncommon',
      trigger: 'onKill', effects: [{ action: 'whirlpool', damage: 15, duration: 4000, radius: 150, pullForce: 100 }] },
    { id: 'oc_tsunami', name: '海啸', faction: 'ocean', type: 'active', rarity: 'rare',
      cooldown: 28000, effects: [{ action: 'tsunami', damage: 60, radius: 400, pushForce: 300, slowAmount: 0.4 }] },
    // ============ NEW: Desert Faction Skills (3) ============
    { id: 'de_scorch', name: '炙烤', faction: 'desert', type: 'passive', rarity: 'common',
      effects: [{ stat: 'desertScorchDamage', op: 'add', value: 5 }, { stat: 'desertThirstSlow', op: 'add', value: 0.05 }] },
    { id: 'de_mirage', name: '沙漠幻影', faction: 'desert', type: 'conditional', rarity: 'uncommon',
      trigger: 'onDodge', effects: [{ action: 'createDecoy', count: 1, duration: 3000 }] },
    { id: 'de_sandstorm', name: '沙暴', faction: 'desert', type: 'active', rarity: 'rare',
      cooldown: 20000, effects: [{ action: 'sandstorm', damage: 20, duration: 5000, radius: 280, blindChance: 0.3 }] },
    // ============ NEW: Tundra Faction Skills (3) ============
    { id: 'tn_blizzard', name: '暴风雪', faction: 'tundra', type: 'passive', rarity: 'common',
      effects: [{ stat: 'tundraFrostChance', op: 'add', value: 0.08 }, { stat: 'tundraFrostDuration', op: 'add', value: 500 }] },
    { id: 'tn_permfrost', name: '永冻', faction: 'tundra', type: 'conditional', rarity: 'uncommon',
      trigger: 'onHit', effects: [{ action: 'permfrost', freezeDuration: 1500, frostDamage: 20 }] },
    { id: 'tn_glacier', name: '冰川崩裂', faction: 'tundra', type: 'active', rarity: 'rare',
      cooldown: 22000, effects: [{ action: 'glacierBreak', damage: 80, radius: 250, freezeDuration: 2000 }] },

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

    // ============ NEW: Phantom Faction Skills (3) ============
    { id:'ph_ghostWalk', name:'幽魂漫步', faction:'phantom', type:'active', rarity:'rare',
      cooldown:8, description:'短暂虚化无视弹幕', effects:[{stat:'dodgeChance',op:'add',value:0.5}] },
    { id:'ph_afterimage', name:'残影幻象', faction:'phantom', type:'passive', rarity:'uncommon',
      description:'闪避时留下残影', effects:[{stat:'dodgeChance',op:'add',value:0.05},{stat:'decoyDuration',op:'add',value:500}] },
    { id:'ph_phantomStrike', name:'幻影一击', faction:'phantom', type:'passive', rarity:'epic',
      description:'残影协同攻击', effects:[{stat:'attack',op:'multiply',value:0.15}] },

    // ============ NEW: Chain Faction Skills (3) ============
    { id:'ch_arcJump', name:'电弧跳跃', faction:'chain', type:'passive', rarity:'rare',
      description:'连锁跳跃额外目标', effects:[{stat:'chainCount',op:'add',value:2}] },
    { id:'ch_conductive', name:'导能标记', faction:'chain', type:'passive', rarity:'uncommon',
      description:'标记增加连锁伤害', effects:[{stat:'chainDamage',op:'multiply',value:0.2}] },
    { id:'ch_cascade', name:'级联增幅', faction:'chain', type:'passive', rarity:'epic',
      description:'连锁次数增加伤害递增', effects:[{stat:'chainCount',op:'add',value:2},{stat:'chainDamage',op:'multiply',value:0.25}] },

    // ============ NEW: Decay Faction Skills (3) ============
    { id:'dc_radioactive', name:'辐射尘埃', faction:'decay', type:'passive', rarity:'rare',
      description:'攻击附加衰变效果', effects:[{stat:'decayRate',op:'add',value:0.03}] },
    { id:'dc_contagious', name:'衰变传染', faction:'decay', type:'passive', rarity:'epic',
      description:'衰变死亡时传播', effects:[{stat:'decaySpread',op:'add',value:0.3}] },
    { id:'dc_criticalMass', name:'临界质量', faction:'decay', type:'passive', rarity:'rare',
      description:'衰变层数引爆', effects:[{stat:'attack',op:'multiply',value:0.2}] },

    // ============ NEW: Crystal Faction Skills (3) ============
    { id:'cr_crystalGrowth', name:'结晶生长', faction:'crystal', type:'passive', rarity:'uncommon',
      description:'攻击生长水晶碎片', effects:[{stat:'crystalShards',op:'add',value:2}] },
    { id:'cr_shatterStorm', name:'碎晶风暴', faction:'crystal', type:'passive', rarity:'rare',
      description:'击杀释放碎片弹幕', effects:[{stat:'shatterDamage',op:'multiply',value:0.2}] },
    { id:'cr_prism', name:'棱镜折射', faction:'crystal', type:'passive', rarity:'epic',
      description:'碎片命中分裂', effects:[{stat:'crystalShards',op:'add',value:2},{stat:'shatterDamage',op:'multiply',value:0.3}] },

    // ============ NEW: Momentum Faction Skills (3) ============
    { id:'mm_inertial', name:'惯性打击', faction:'momentum', type:'passive', rarity:'uncommon',
      description:'势能转化攻击力', effects:[{stat:'momentumRate',op:'add',value:0.03}] },
    { id:'mm_wake', name:'尾迹冲击', faction:'momentum', type:'passive', rarity:'rare',
      description:'高速移动留下伤害轨迹', effects:[{stat:'speed',op:'multiply',value:0.08}] },
    { id:'mm_terminal', name:'终极速度', faction:'momentum', type:'passive', rarity:'epic',
      description:'满势能获得额外增益', effects:[{stat:'speed',op:'multiply',value:0.15},{stat:'momentumRate',op:'add',value:0.04}] },

    // ============ NEW: Pact Faction Skills (3) ============
    { id:'pa_deathContract', name:'死亡契约', faction:'pact', type:'conditional', rarity:'rare',
      trigger:'onKill', description:'标记敌人死亡回复', effects:[{stat:'healOnKill',op:'add',value:8}] },
    { id:'pa_punishment', name:'惩罚条款', faction:'pact', type:'passive', rarity:'uncommon',
      description:'契约反噬自损', effects:[{stat:'contractDamage',op:'add',value:0.15}] },
    { id:'pa_network', name:'契约网络', faction:'pact', type:'passive', rarity:'epic',
      description:'契约连锁传播', effects:[{stat:'maxContracts',op:'add',value:2},{stat:'contractDamage',op:'add',value:0.2}] },

    // ============ NEW: Dream Faction Skills (3) ============
    { id:'dr_lullaby', name:'摇篮曲', faction:'dream', type:'passive', rarity:'uncommon',
      description:'攻击概率使敌人沉睡', effects:[{stat:'sleepChance',op:'add',value:0.08}] },
    { id:'dr_nightTerror', name:'梦魇侵袭', faction:'dream', type:'passive', rarity:'rare',
      description:'沉睡敌人持续伤害', effects:[{stat:'attack',op:'multiply',value:0.1}] },
    { id:'dr_confusion', name:'迷乱之雾', faction:'dream', type:'passive', rarity:'epic',
      description:'迷雾使敌人互相攻击', effects:[{stat:'confuseChance',op:'add',value:0.1},{stat:'sleepChance',op:'add',value:0.05}] },

    // ============ NEW: Forge Faction Skills (3) ============
    { id:'fg_battleTemper', name:'战斗淬炼', faction:'forge', type:'passive', rarity:'rare',
      description:'击杀积累锻炉层数', effects:[{stat:'attack',op:'multiply',value:0.1}] },
    { id:'fg_flameQuench', name:'烈焰淬火', faction:'forge', type:'passive', rarity:'rare',
      description:'满锻炉层数灼烧', effects:[{stat:'burnDamage',op:'add',value:8}] },
    { id:'fg_forgeMaster', name:'锻炉大师', faction:'forge', type:'passive', rarity:'epic',
      description:'加速锻炉积累', effects:[{stat:'forgeStacksMax',op:'add',value:2},{stat:'attack',op:'multiply',value:0.15}] },

    // ============ NEW: Rebound Faction Skills (3) ============
    { id:'rb_ricochet', name:'弹射射击', faction:'rebound', type:'passive', rarity:'uncommon',
      description:'子弹弹射至附近敌人', effects:[{stat:'bounceCount',op:'add',value:2}] },
    { id:'rb_pinball', name:'弹球增幅', faction:'rebound', type:'passive', rarity:'rare',
      description:'弹射伤害递增', effects:[{stat:'bounceRetention',op:'add',value:0.15}] },
    { id:'rb_split', name:'分裂弹射', faction:'rebound', type:'passive', rarity:'epic',
      description:'弹射时分裂', effects:[{stat:'bounceCount',op:'add',value:2},{stat:'bounceRetention',op:'add',value:0.2}] },

    // ============ NEW: Shroud Faction Skills (3) ============
    { id:'sh_smokeScreen', name:'烟雾屏障', faction:'shroud', type:'active', rarity:'rare',
      cooldown:12, description:'释放烟雾减速致盲', effects:[{stat:'blindChance',op:'add',value:0.3}] },
    { id:'sh_ambush', name:'伏击猎手', faction:'shroud', type:'conditional', rarity:'epic',
      trigger:'onBlind', description:'致盲目标额外伤害', effects:[{stat:'attack',op:'multiply',value:0.25}] },
    { id:'sh_chokingHaze', name:'窒息迷雾', faction:'shroud', type:'passive', rarity:'rare',
      description:'烟雾持续伤害', effects:[{stat:'shroudRadius',op:'add',value:50}] },
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

    // ============ NEW: 10 Special Weapons ============
    flameThrower: {
      id: 'flameThrower', name: '火焰喷射器', icon: '🔥', rarity: 'rare',
      description: '近程扇形火焰，附加燃烧',
      pattern: 'flameThrower', fireRate: 80, damage: 5, bulletSpeed: 400, bulletSize: 10,
      flameAngle: 50, flameCount: 5, burnDamage: 6, burnDuration: 2000, bulletColor: '#ff6600', trailColor: '#ff3300',
    },
    frostCannon: {
      id: 'frostCannon', name: '冰霜炮', icon: '❄️', rarity: 'rare',
      description: '单发冰弹，附加减速',
      pattern: 'frostCannon', fireRate: 600, damage: 20, bulletSpeed: 450, bulletSize: 5,
      slowAmount: 0.5, slowDuration: 3000, bulletColor: '#88ddff', trailColor: '#4499cc',
    },
    lightningGun: {
      id: 'lightningGun', name: '闪电枪', icon: '⚡', rarity: 'epic',
      description: '连锁电弧弹射多个敌人',
      pattern: 'lightningGun', fireRate: 500, damage: 15, bulletSpeed: 1000, bulletSize: 3,
      chainCount: 5, chainRange: 200, bulletColor: '#ffff44', trailColor: '#ffaa00',
    },
    rocketLauncher: {
      id: 'rocketLauncher', name: '火箭筒', icon: '🚀', rarity: 'epic',
      description: '单发重型火箭，大范围爆炸',
      pattern: 'rocketLauncher', fireRate: 800, damage: 45, bulletSpeed: 350, bulletSize: 8,
      explosionRadius: 100, bulletColor: '#ff4444', trailColor: '#cc0000',
    },
    mineLayer: {
      id: 'mineLayer', name: '地雷投放器', icon: '💣', rarity: 'rare',
      description: '移动布雷，敌人触碰爆炸',
      pattern: 'mineLayer', fireRate: 400, damage: 30, bulletSpeed: 200, bulletSize: 4,
      explosionRadius: 80, mineCount: 3, bulletColor: '#ff8844', trailColor: '#cc4400',
    },
    energyWhip: {
      id: 'energyWhip', name: '能量鞭', icon: '🌀', rarity: 'rare',
      description: '360度旋转近程能量鞭',
      pattern: 'energyWhip', fireRate: 300, damage: 12, bulletSpeed: 500, bulletSize: 3,
      whipCount: 8, bulletColor: '#44ffcc', trailColor: '#22cc88',
    },
    sawBlade: {
      id: 'sawBlade', name: '飞锯', icon: '⚙️', rarity: 'uncommon',
      description: '弹射旋转锯片穿透多次',
      pattern: 'sawBlade', fireRate: 400, damage: 15, bulletSpeed: 450, bulletSize: 6,
      spinSpeed: 12, pierceCount: 6, bulletColor: '#cccccc', trailColor: '#888888',
    },
    venomGun: {
      id: 'venomGun', name: '毒液枪', icon: '☠️', rarity: 'uncommon',
      description: '毒雾弹持续伤害区域',
      pattern: 'venomGun', fireRate: 350, damage: 6, bulletSpeed: 350, bulletSize: 8,
      pierceCount: 2, burnDamage: 4, burnDuration: 3000, bulletColor: '#88ff44', trailColor: '#44cc00',
    },
    magnetGun: {
      id: 'magnetGun', name: '磁力枪', icon: '🧲', rarity: 'rare',
      description: '磁力弹吸引附近敌人',
      pattern: 'magnetGun', fireRate: 500, damage: 8, bulletSpeed: 300, bulletSize: 6,
      wellRadius: 150, pullForce: 120, bulletColor: '#ff44ff', trailColor: '#cc22cc',
    },
    blackHoleGen: {
      id: 'blackHoleGen', name: '黑洞发生器', icon: '🕳️', rarity: 'legendary',
      description: '发射黑洞吸入并伤害敌人',
      pattern: 'blackHoleGen', fireRate: 1200, damage: 10, bulletSpeed: 200, bulletSize: 8,
      wellRadius: 200, pullForce: 150, wellDamage: 15, executeThreshold: 0.15, bulletColor: '#6600aa', trailColor: '#440066',
    },

    // ============ 25 New Weapons: Beam(5) / Projectile(5) / Area(5) / Special(5) / Hybrid(5) ============

    // --- Beam Weapons (5) ---
    beamRifle: {
      id: 'beamRifle', name: '光束步枪', icon: '🔫', rarity: 'rare',
      description: '聚焦光束穿透敌人',
      pattern: 'beamRifle', fireRate: 200, damage: 10, bulletSpeed: 800, bulletSize: 2,
      pierceCount: 3, beamWidth: 3, bulletColor: '#44ddff', trailColor: '#2288cc',
    },
    spreadBeam: {
      id: 'spreadBeam', name: '散射光束', icon: '💫', rarity: 'uncommon',
      description: '扇形光束覆盖范围',
      pattern: 'spreadBeam', fireRate: 450, damage: 6, bulletSpeed: 600, bulletSize: 2.5,
      bulletCount: 5, spreadAngle: 20, bulletColor: '#88ff44', trailColor: '#44cc00',
    },
    pulseBeam: {
      id: 'pulseBeam', name: '脉冲光束', icon: '〰️', rarity: 'rare',
      description: '脉冲式光束连射',
      pattern: 'pulseBeam', fireRate: 350, damage: 12, bulletSpeed: 550, bulletSize: 4,
      pulseCount: 3, pulseInterval: 0.15, bulletColor: '#ff88ff', trailColor: '#cc44cc',
    },
    sniperBeam: {
      id: 'sniperBeam', name: '狙击光束', icon: '🎯', rarity: 'epic',
      description: '超远程高伤害狙击',
      pattern: 'sniperBeam', fireRate: 1500, damage: 50, bulletSpeed: 2000, bulletSize: 2,
      beamWidth: 2, bulletColor: '#ffffff', trailColor: '#aaaaff',
    },
    crossBeam: {
      id: 'crossBeam', name: '十字光束', icon: '✚', rarity: 'rare',
      description: '十字形五方向光束',
      pattern: 'crossBeam', fireRate: 500, damage: 8, bulletSpeed: 500, bulletSize: 3,
      beamCount: 5, bulletColor: '#88ddff', trailColor: '#4499cc',
    },

    // --- Projectile/Melee Weapons (5) ---
    buckshot: {
      id: 'buckshot', name: '霰弹枪', icon: '💥', rarity: 'uncommon',
      description: '大范围霰弹散射',
      pattern: 'buckshot', fireRate: 700, damage: 5, bulletSpeed: 400, bulletSize: 2.5,
      pelletCount: 8, spreadAngle: 40, bulletColor: '#ff8844', trailColor: '#cc4400',
    },
    railgun: {
      id: 'railgun', name: '电磁炮', icon: '⚡', rarity: 'epic',
      description: '超高速贯穿电磁弹',
      pattern: 'railgun', fireRate: 1200, damage: 60, bulletSpeed: 2500, bulletSize: 2,
      pierceCount: 10, bulletColor: '#44ffff', trailColor: '#00aaaa',
    },
    slugRound: {
      id: 'slugRound', name: '重弹头', icon: '🔩', rarity: 'uncommon',
      description: '低速高伤害重弹',
      pattern: 'slugRound', fireRate: 900, damage: 35, bulletSpeed: 300, bulletSize: 7,
      bulletColor: '#cc8844', trailColor: '#885522',
    },
    plasmaCutter: {
      id: 'plasmaCutter', name: '等离子切割', icon: '🔪', rarity: 'rare',
      description: '近距离等离子切割刃',
      pattern: 'plasmaCutter', fireRate: 150, damage: 8, bulletSpeed: 350, bulletSize: 6,
      cutCount: 3, cutAngle: 15, bulletColor: '#cc44ff', trailColor: '#8822cc',
    },
    chainSaw: {
      id: 'chainSaw', name: '电锯', icon: '🪚', rarity: 'epic',
      description: '近距离高速旋转切割',
      pattern: 'chainSaw', fireRate: 60, damage: 3, bulletSpeed: 250, bulletSize: 8,
      sawCount: 5, sawAngle: 60, pierceCount: 3, spinSpeed: 15, bulletColor: '#cc8844', trailColor: '#885522',
    },

    // --- Area/Summon Weapons (5) ---
    teslaField: {
      id: 'teslaField', name: '特斯拉场', icon: '⚡', rarity: 'rare',
      description: '部署电场连锁伤害',
      pattern: 'teslaField', fireRate: 600, damage: 6, bulletSpeed: 150, bulletSize: 5,
      chainCount: 3, chainRange: 130, fieldDuration: 3000, bulletColor: '#88ffff', trailColor: '#44aaaa',
    },
    flamePuddle: {
      id: 'flamePuddle', name: '火焰池', icon: '🔥', rarity: 'uncommon',
      description: '留下火焰灼烧地面',
      pattern: 'flamePuddle', fireRate: 500, damage: 4, bulletSpeed: 100, bulletSize: 10,
      puddleDuration: 2000, burnDamage: 6, burnDuration: 2000, bulletColor: '#ff6600', trailColor: '#ff3300',
    },
    frostMine: {
      id: 'frostMine', name: '冰霜雷', icon: '❄️', rarity: 'rare',
      description: '冰冻地雷减速爆炸',
      pattern: 'frostMine', fireRate: 700, damage: 15, bulletSpeed: 180, bulletSize: 5,
      mineCount: 3, explosionRadius: 70, slowAmount: 0.5, slowDuration: 2500, bulletColor: '#88ddff', trailColor: '#4499cc',
    },
    acidSplash: {
      id: 'acidSplash', name: '酸液池', icon: '☠️', rarity: 'uncommon',
      description: '酸液持续腐蚀区域',
      pattern: 'acidSplash', fireRate: 550, damage: 5, bulletSpeed: 200, bulletSize: 8,
      pierceCount: 1, burnDamage: 5, burnDuration: 3000, bulletColor: '#88ff44', trailColor: '#44cc00',
    },
    droneSwarm: {
      id: 'droneSwarm', name: '无人机群', icon: '🛸', rarity: 'epic',
      description: '释放追踪无人机群攻击',
      pattern: 'droneSwarm', fireRate: 900, damage: 8, bulletSpeed: 200, bulletSize: 3,
      droneCount: 4, homingStrength: 0.06, homingRange: 350, bulletColor: '#44aa88', trailColor: '#226644',
    },

    // --- Special/Unique Weapons (5) ---
    bouncingBullet: {
      id: 'bouncingBullet', name: '弹射弹', icon: '🏓', rarity: 'uncommon',
      description: '墙壁弹射反弹攻击',
      pattern: 'bouncingBullet', fireRate: 400, damage: 10, bulletSpeed: 450, bulletSize: 3,
      bounceCount: 3, bulletColor: '#ffaa44', trailColor: '#cc7722',
    },
    sonicWave: {
      id: 'sonicWave', name: '音波炮', icon: '🔊', rarity: 'rare',
      description: '扇形音波震荡波',
      pattern: 'sonicWave', fireRate: 600, damage: 14, bulletSpeed: 350, bulletSize: 6,
      waveCount: 7, spreadAngle: 60, bulletColor: '#ff88ff', trailColor: '#cc44cc',
    },
    phaseBlade: {
      id: 'phaseBlade', name: '相位刃', icon: '🌀', rarity: 'epic',
      description: '相位穿梭穿透攻击',
      pattern: 'phaseBlade', fireRate: 500, damage: 20, bulletSpeed: 600, bulletSize: 4,
      pierceCount: 5, waveAmplitude: 2, waveFrequency: 0.08, bulletColor: '#9966ff', trailColor: '#6633cc',
    },
    lifestealBlade: {
      id: 'lifestealBlade', name: '吸血刃', icon: '🩸', rarity: 'rare',
      description: '造成伤害时回复生命',
      pattern: 'lifestealBlade', fireRate: 400, damage: 12, bulletSpeed: 500, bulletSize: 4,
      lifestealPercent: 0.15, bulletColor: '#ff4466', trailColor: '#cc2244',
    },
    delayedBomb: {
      id: 'delayedBomb', name: '延时炸弹', icon: '⏰', rarity: 'rare',
      description: '延时大范围爆炸',
      pattern: 'delayedBomb', fireRate: 1000, damage: 20, bulletSpeed: 250, bulletSize: 8,
      delayTime: 1.5, explosionRadius: 120, bulletColor: '#ff4444', trailColor: '#cc0000',
    },

    // --- Hybrid/Fusion Weapons (5) ---
    iceFlame: {
      id: 'iceFlame', name: '冰焰双袭', icon: '❄️🔥', rarity: 'legendary',
      description: '冰火交替攻击',
      pattern: 'iceFlame', fireRate: 300, damage: 14, bulletSpeed: 500, bulletSize: 4,
      burnDamage: 8, burnDuration: 2000, slowAmount: 0.4, slowDuration: 2000,
      bulletColor: '#ff8844', trailColor: '#44aaff',
    },
    plasmaStorm: {
      id: 'plasmaStorm', name: '等离子风暴', icon: '🌩️', rarity: 'legendary',
      description: '风暴等离子链式闪电',
      pattern: 'plasmaStorm', fireRate: 550, damage: 18, bulletSpeed: 400, bulletSize: 5,
      chainCount: 4, chainRange: 160, explosionRadius: 50, bulletColor: '#44ffaa', trailColor: '#22cc88',
    },
    voidBeam: {
      id: 'voidBeam', name: '虚空光束', icon: '🕳️', rarity: 'legendary',
      description: '虚空穿透光束斩杀低血量敌人',
      pattern: 'voidBeam', fireRate: 500, damage: 12, bulletSpeed: 600, bulletSize: 3,
      pierceCount: 5, executeThreshold: 0.12, bulletColor: '#6600cc', trailColor: '#440088',
    },
    gravityMissile: {
      id: 'gravityMissile', name: '重力导弹', icon: '🚀🌀', rarity: 'legendary',
      description: '追踪导弹附带引力井',
      pattern: 'gravityMissile', fireRate: 800, damage: 30, bulletSpeed: 280, bulletSize: 7,
      homingStrength: 0.05, explosionRadius: 70, wellRadius: 100, pullForce: 80,
      bulletColor: '#cc6644', trailColor: '#994422',
    },
    thunderBoomerang: {
      id: 'thunderBoomerang', name: '雷霆回旋镖', icon: '⚡🪃', rarity: 'legendary',
      description: '回旋镖链式闪电',
      pattern: 'thunderBoomerang', fireRate: 650, damage: 25, bulletSpeed: 380, bulletSize: 5,
      range: 350, chainCount: 3, chainRange: 140, bulletColor: '#ffff66', trailColor: '#ffaa22',
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

      // ---- 新增融合配方 (10种) ----
      { id: 'w_venomFlame', ingredientA: 'flame', ingredientB: 'lightningBolt', result: 'venomFlame',
        name: '雷焰喷射', icon: '🔥', description: '火焰喷射 + 雷电 = 闪电灼烧火焰',
        colorA: '#ff6600', colorB: '#ffff44' },
      { id: 'w_frostStorm', ingredientA: 'iceShard', ingredientB: 'shuriken', result: 'frostStorm',
        name: '冰霜风暴', icon: '❄️', description: '冰晶 + 手里剑 = 冰冻旋转飞刃',
        colorA: '#88ddff', colorB: '#aaaacc' },
      { id: 'w_thunderShock', ingredientA: 'arc', ingredientB: 'wave', result: 'thunderShock',
        name: '雷霆冲击', icon: '⚡', description: '电弧链 + 波动炮 = 链式电弧波动',
        colorA: '#88ffff', colorB: '#44ff88' },
      { id: 'w_holyLight', ingredientA: 'homing', ingredientB: 'pierce', result: 'holyLight',
        name: '圣光洗礼', icon: '✨', description: '追踪弹 + 穿甲弹 = 追踪穿透圣光',
        colorA: '#ff44ff', colorB: '#ffffff' },
      { id: 'w_shadowNeedle', ingredientA: 'shuriken', ingredientB: 'needle', result: 'shadowNeedle',
        name: '暗影飞针', icon: '🌑', description: '手里剑 + 针弹 = 高速暗影飞针',
        colorA: '#aaaacc', colorB: '#aaffff' },
      { id: 'w_electricWave', ingredientA: 'wave', ingredientB: 'lightningBolt', result: 'electricWave',
        name: '电磁波', icon: '🌊', description: '波动炮 + 雷电 = 电磁波动冲击',
        colorA: '#44ff88', colorB: '#ffff44' },
      { id: 'w_napalm', ingredientA: 'explosive', ingredientB: 'flame', result: 'napalm',
        name: '凝固汽油弹', icon: '💥', description: '爆破弹 + 火焰喷射 = 燃烧爆炸弹',
        colorA: '#ff4444', colorB: '#ff6600' },
      { id: 'w_photonTracker', ingredientA: 'homing', ingredientB: 'laser', result: 'photonTracker',
        name: '光子追踪', icon: '🎯', description: '追踪弹 + 激光炮 = 自动追踪激光',
        colorA: '#ff44ff', colorB: '#00ffff' },
      { id: 'w_scatterSatellite', ingredientA: 'spread', ingredientB: 'orbital', result: 'scatterSatellite',
        name: '散射卫星', icon: '🛰️', description: '散射弹 + 浮游炮 = 散射浮游炮',
        colorA: '#ff8844', colorB: '#88ddff' },
      { id: 'w_piercingExplosive', ingredientA: 'pierce', ingredientB: 'explosive', result: 'piercingExplosive',
        name: '穿甲爆弹', icon: '🗡️', description: '穿甲弹 + 爆破弹 = 穿透后爆炸',
        colorA: '#ffffff', colorB: '#ff4444' },
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

  // ============ CHALLENGES (G5 - Challenge Modes) ============
  CHALLENGES: [
    { id: 'ch_no_weapons', name: '赤手空拳', icon: '✊', desc: '游戏开始时无武器', rules: { weaponSlots: 0 }, reward: 50 },
    { id: 'ch_glass_cannon', name: '玻璃大炮', icon: '💔', desc: 'HP减半，攻击力3倍', rules: { hpMultiplier: 0.5, attackMultiplier: 3.0 }, reward: 40 },
    { id: 'ch_pacifist', name: '和平主义', icon: '☮️', desc: '攻击力-80%，移速+60%', rules: { attackMultiplier: 0.2, speedMultiplier: 1.6 }, reward: 35 },
    { id: 'ch_slow_motion', name: '慢动作', icon: '🐌', desc: '游戏速度-40%，经验+50%', rules: { timeScale: 0.6, xpMultiplier: 1.5 }, reward: 30 },
    { id: 'ch_speedrun', name: '速通', icon: '⚡', desc: '游戏速度+40%，敌人HP-30%', rules: { timeScale: 1.4, enemyHpMultiplier: 0.7 }, reward: 35 },
    { id: 'ch_magnet_only', name: '磁力大师', icon: '🧲', desc: '拾取范围+300%，攻击力-40%', rules: { pickupRangeBonus: 300, attackMultiplier: 0.6 }, reward: 25 },
    { id: 'ch_double_trouble', name: '双重麻烦', icon: '👥', desc: '敌人生成数量翻倍，掉落翻倍', rules: { enemyCountMultiplier: 2.0, dropRateMultiplier: 2.0 }, reward: 45 },
    { id: 'ch_fragile', name: '脆弱', icon: '💧', desc: '护甲归零，每3秒自动回血5%', rules: { defense: 0, regenPerSec: 0.0167 }, reward: 30 },
    // D3/G5: New challenge modes
    { id: 'one_weapon', name: '单武器大师', desc: '仅1个武器槽', icon: '🗡️', rules: { maxWeaponSlots: 1, skillEffectBonus: 0.5 } },
    { id: 'pacifist', name: '和平主义者', desc: '不能射击', icon: '☮️', rules: { noWeapons: true, passiveDamageBonus: 3.0 } },
    { id: 'glass_cannon', name: '玻璃大炮', desc: '50%HP,200%伤害', icon: '💥', rules: { hpMult: 0.5, damageMult: 2.0 } },
    { id: 'bullet_hell', name: '弹幕地狱', desc: '3倍子弹', icon: '🔥', rules: { enemyBulletMult: 3.0, playerSpeedMult: 2.0 } },
    { id: 'chaos', name: '混沌模式', desc: '每60秒随机更换', icon: '🌀', rules: { randomizeEvery: 60 } },
  ],

  // ============ ENDLESS MODE (G4) ============
  ENDLESS_MODE: {
    postWave30DiffScale: 1.1,   // 每波难度×1.1
    regenChance: 0.03,          // 敌人3%概率再生
    volatileChance: 0.03,       // 敌人3%概率易爆
    regenAmount: 0.15,          // 再生回复15%HP
  },

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
    steelColossus: {
      id: 'steelColossus', name: '钢铁巨像', icon: '🦾', color: '#666688',
      description: '重型Boss，砸地冲击波+导弹齐射',
      baseHp: 10000, baseDamage: 45, size: 70, score: 12000, xp: 900,
      phases: [
        { hpThreshold: 0.7, name: '重锤阶段', attackPattern: 'groundSlam', bulletCount: 10, spreadAngle: 180, fireRate: 900, bulletSpeed: 200, shockwaveRadius: 180, shockwaveDamage: 30 },
        { hpThreshold: 0.4, name: '导弹齐射', attackPattern: 'missileBarrage', bulletCount: 16, spreadAngle: 360, fireRate: 500, bulletSpeed: 260, missileTracking: true, missileCount: 6 },
        { hpThreshold: 0.15, name: '钢铁风暴', attackPattern: 'steelTempest', bulletCount: 24, spreadAngle: 360, fireRate: 300, bulletSpeed: 340, armorUp: true, damageReduction: 0.5, shockwaveRadius: 250 },
      ],
    },
    shadowAssassin: {
      id: 'shadowAssassin', name: '暗影刺客', icon: '🗡️', color: '#333355',
      description: '隐身Boss，瞬移背刺+暗影分身',
      baseHp: 6500, baseDamage: 50, size: 42, score: 11000, xp: 850,
      phases: [
        { hpThreshold: 0.7, name: '潜行阶段', attackPattern: 'stealthStrike', bulletCount: 6, spreadAngle: 45, fireRate: 600, bulletSpeed: 350, stealth: true, stealthDuration: 2000, backstabDamage: 80 },
        { hpThreshold: 0.4, name: '影分身', attackPattern: 'shadowClone', bulletCount: 10, spreadAngle: 360, fireRate: 400, bulletSpeed: 300, cloneCount: 2, cloneHp: 1000, teleportCooldown: 2000 },
        { hpThreshold: 0.15, name: '暗影乱舞', attackPattern: 'shadowFrenzy', bulletCount: 16, spreadAngle: 360, fireRate: 200, bulletSpeed: 380, multiTeleport: true, teleportCount: 3, backstabDamage: 120 },
      ],
    },
    elementLord: {
      id: 'elementLord', name: '元素领主', icon: '🌀', color: '#cc44ff',
      description: '切换元素形态(火/冰/雷)',
      baseHp: 8500, baseDamage: 35, size: 55, score: 13000, xp: 950,
      phases: [
        { hpThreshold: 0.7, name: '烈焰形态', attackPattern: 'fireElement', bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 280, element: 'fire', burnDamage: 12, burnDuration: 2500, fireRing: true },
        { hpThreshold: 0.4, name: '寒冰形态', attackPattern: 'iceElement', bulletCount: 14, spreadAngle: 360, fireRate: 450, bulletSpeed: 250, element: 'ice', freezeChance: 0.25, slowAmount: 0.6, iceShardBurst: true },
        { hpThreshold: 0.15, name: '雷霆形态', attackPattern: 'thunderElement', bulletCount: 18, spreadAngle: 360, fireRate: 300, bulletSpeed: 340, element: 'thunder', chainLightning: true, chainCount: 5, stunChance: 0.2 },
      ],
    },
    hiveMother: {
      id: 'hiveMother', name: '虫巢母体', icon: '🐛', color: '#668833',
      description: '召唤虫群+毒雾+产卵',
      baseHp: 9000, baseDamage: 20, size: 60, score: 11500, xp: 880,
      phases: [
        { hpThreshold: 0.7, name: '虫群召唤', attackPattern: 'swarmSummon', bulletCount: 8, spreadAngle: 360, fireRate: 700, bulletSpeed: 180, summonType: 'swarm', summonCount: 5, summonInterval: 3000 },
        { hpThreshold: 0.4, name: '毒雾弥漫', attackPattern: 'toxicFog', bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 200, poisonRadius: 220, poisonDamage: 15, spawnMinions: true, minionCount: 3 },
        { hpThreshold: 0.15, name: '虫巢爆发', attackPattern: 'hiveExplosion', bulletCount: 20, spreadAngle: 360, fireRate: 300, bulletSpeed: 260, eggCount: 4, eggHp: 800, eggSpawnType: 'elite', poisonRadius: 280 },
      ],
    },
    timeLord: {
      id: 'timeLord', name: '时间领主', icon: '⏳', color: '#ffcc00',
      description: '减速区域+时间倒流+瞬移',
      baseHp: 7500, baseDamage: 30, size: 50, score: 14000, xp: 1000,
      phases: [
        { hpThreshold: 0.7, name: '时间扭曲', attackPattern: 'timeWarp', bulletCount: 10, spreadAngle: 360, fireRate: 600, bulletSpeed: 240, slowField: true, slowRadius: 200, slowAmount: 0.5, slowDuration: 3000 },
        { hpThreshold: 0.4, name: '时间倒流', attackPattern: 'timeRewind', bulletCount: 14, spreadAngle: 360, fireRate: 400, bulletSpeed: 300, rewindHp: 0.15, rewindCooldown: 15000, teleportCooldown: 2500 },
        { hpThreshold: 0.15, name: '时间终结', attackPattern: 'timeEnd', bulletCount: 22, spreadAngle: 360, fireRate: 200, bulletSpeed: 360, timeStop: true, timeStopDuration: 1500, timeStopCooldown: 8000, bulletTime: true },
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

    // --- NEW: 恢复系 (4) ---
    { id: 'small_health', name: '小回复药', type: 'buff', effect: 'healPercent', value: 0.12, duration: 0,
      color: '#44ff44', shape: 'cross', size: 12, weight: 30, dropText: '+12% HP' },
    { id: 'medium_health', name: '中回复药', type: 'buff', effect: 'healPercent', value: 0.28, duration: 0,
      color: '#22dd22', shape: 'cross', size: 14, weight: 20, dropText: '+28% HP' },
    { id: 'large_health', name: '大回复药', type: 'buff', effect: 'healPercent', value: 0.55, duration: 0,
      color: '#00cc00', shape: 'cross', size: 16, weight: 12, dropText: '+55% HP' },
    { id: 'full_health', name: '满血药剂', type: 'buff', effect: 'healPercent', value: 1.0, duration: 0,
      color: '#00ff88', shape: 'star', size: 18, weight: 5, dropText: 'FULL HP!' },

    // --- NEW: 增益系 (4) ---
    { id: 'attack_boost', name: '攻击强化', type: 'buff', effect: 'damageUp', value: 1.2, duration: 30000,
      color: '#ff6600', shape: 'star', size: 14, weight: 16, dropText: 'ATK +20%!' },
    { id: 'swift_boost', name: '疾风之靴', type: 'buff', effect: 'speedUp', value: 1.25, duration: 30000,
      color: '#00ccff', shape: 'diamond', size: 14, weight: 16, dropText: 'SPD +25%!' },
    { id: 'shield_boost', name: '能量护盾', type: 'buff', effect: 'shield', value: 1, duration: 0,
      color: '#4488ff', shape: 'circle', size: 16, weight: 14, dropText: 'SHIELD +1!' },
    { id: 'invincibility', name: '神圣庇护', type: 'buff', effect: 'invincible', value: 1, duration: 3000,
      color: '#ffff88', shape: 'star', size: 18, weight: 5, dropText: 'INVINCIBLE!' },

    // --- NEW: 元素系 (4) ---
    { id: 'fire_enchant', name: '火焰附魔', type: 'buff', effect: 'fireEnchant', value: 1.0, duration: 15000,
      color: '#ff4400', shape: 'star', size: 14, weight: 12, dropText: 'FIRE ENCHANT!' },
    { id: 'ice_enchant', name: '冰霜附魔', type: 'buff', effect: 'iceEnchant', value: 1.0, duration: 15000,
      color: '#88ddff', shape: 'diamond', size: 14, weight: 12, dropText: 'ICE ENCHANT!' },
    { id: 'thunder_enchant', name: '雷电附魔', type: 'buff', effect: 'thunderEnchant', value: 1.0, duration: 15000,
      color: '#ffff00', shape: 'star', size: 14, weight: 12, dropText: 'THUNDER ENCHANT!' },
    { id: 'poison_enchant', name: '毒素附魔', type: 'buff', effect: 'poisonEnchant', value: 1.0, duration: 15000,
      color: '#88ff44', shape: 'diamond', size: 14, weight: 12, dropText: 'POISON ENCHANT!' },

    // --- NEW: 特殊系 (5) ---
    { id: 'fusion_core', name: '融合核心', type: 'buff', effect: 'fusionCore', value: 1.0, duration: 0,
      color: '#ff88ff', shape: 'star', size: 18, weight: 5, dropText: 'FUSION CORE!' },
    { id: 'overload_core', name: '超载核心', type: 'buff', effect: 'overloadCore', value: 1.0, duration: 0,
      color: '#ff2222', shape: 'star', size: 18, weight: 4, dropText: 'OVERLOAD!' },
    { id: 'exp_boost', name: '经验加速', type: 'buff', effect: 'xpBoost', value: 2.0, duration: 60000,
      color: '#aa66ff', shape: 'diamond', size: 16, weight: 10, dropText: 'XP x2!' },
    { id: 'gold_magnet', name: '金币磁铁', type: 'buff', effect: 'goldMagnet', value: 200, duration: 30000,
      color: '#ffcc00', shape: 'circle', size: 16, weight: 12, dropText: 'GOLD MAGNET!' },
    { id: 'revive_coin', name: '复活币', type: 'buff', effect: 'revive', value: 1, duration: 0,
      color: '#ffdd88', shape: 'diamond', size: 18, weight: 3, dropText: 'REVIVE!' },

    // --- NEW: 减益系 (3) ---
    { id: 'slow_trap', name: '减速陷阱', type: 'debuff', effect: 'speedDown', value: 0.4, duration: 6000,
      color: '#6666aa', shape: 'circle', size: 14, weight: 14, dropText: 'SLOW TRAP!' },
    { id: 'confuse_trap', name: '混乱陷阱', type: 'debuff', effect: 'confusion', value: 1, duration: 5000,
      color: '#ff66ff', shape: 'circle', size: 14, weight: 12, dropText: 'CONFUSED!' },
    { id: 'weaken_trap', name: '虚弱陷阱', type: 'debuff', effect: 'damageDown', value: 0.5, duration: 6000,
      color: '#884488', shape: 'diamond', size: 14, weight: 14, dropText: 'WEAKENED!' },
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
    timeBomb: {
      type: 'timeBomb', name: '定时炸弹',
      hp: 35, speed: 80, damage: 10, score: 120, xp: 20,
      size: 12, color: '#ff6600',
      ai: 'follow', fireRate: 3000, bulletSpeed: 200, bulletDamage: 8, bulletColor: '#ff8844',
      dropRate: 0.15,
      // On death: delayed explosion that creates a dangerous area
      timeBombDelay: 2000,     // 2 second warning before explosion
      timeBombDamage: 25,      // damage per tick in the zone
      timeBombRadius: 100,     // explosion radius
      timeBombDuration: 5000,  // zone lingers for 5 seconds
    },
    // ============ 30种新敌人 ============
    // --- 元素系 ---
    fireElement: {
      type: 'fireElement', name: '火元素',
      hp: 55, speed: 85, damage: 15, score: 180, xp: 30,
      size: 14, color: '#ff4400',
      ai: 'follow', fireRate: 2200, bulletSpeed: 260, bulletDamage: 12, bulletColor: '#ff6600',
      bulletCount: 3, spreadAngle: 20,
      dropRate: 0.2,
      burnOnHit: true, burnDamage: 5, burnDuration: 2000,
    },
    iceElement: {
      type: 'iceElement', name: '冰元素',
      hp: 60, speed: 70, damage: 12, score: 180, xp: 30,
      size: 14, color: '#44ccff',
      ai: 'follow', fireRate: 2500, bulletSpeed: 240, bulletDamage: 10, bulletColor: '#66ddff',
      bulletCount: 2, spreadAngle: 15,
      dropRate: 0.2,
      slowOnHit: true, slowAmount: 0.4, slowDuration: 2000,
    },
    thunderElement: {
      type: 'thunderElement', name: '雷元素',
      hp: 45, speed: 110, damage: 18, score: 200, xp: 35,
      size: 12, color: '#ffee00',
      ai: 'follow', fireRate: 1800, bulletSpeed: 350, bulletDamage: 14, bulletColor: '#ffff44',
      bulletCount: 1, spreadAngle: 0,
      dropRate: 0.22,
      chainLightning: true, chainCount: 3, chainRange: 120,
    },
    poisonElement: {
      type: 'poisonElement', name: '毒元素',
      hp: 50, speed: 75, damage: 10, score: 180, xp: 30,
      size: 13, color: '#44ff44',
      ai: 'follow', fireRate: 2800, bulletSpeed: 200, bulletDamage: 8, bulletColor: '#66ff66',
      bulletCount: 4, spreadAngle: 30,
      dropRate: 0.2,
      poisonOnHit: true, poisonDamage: 6, poisonDuration: 3000,
    },
    // --- 精英系 ---
    berserker: {
      type: 'berserker', name: '狂战士',
      hp: 150, speed: 90, damage: 28, score: 400, xp: 65,
      size: 18, color: '#ff2200',
      ai: 'follow', fireRate: 1000, bulletSpeed: 300, bulletDamage: 14, bulletColor: '#ff4422',
      bulletCount: 3, spreadAngle: 25,
      dropRate: 0.35,
      aiBehavior: 'aggressive', berserkThreshold: 0.3, berserkSpeedBoost: 1.8, berserkFireRateBoost: 0.5,
    },
    guardian: {
      type: 'guardian', name: '守卫者',
      hp: 180, speed: 50, damage: 15, score: 350, xp: 55,
      size: 20, color: '#4488ff',
      ai: 'follow', fireRate: 2200, bulletSpeed: 220, bulletDamage: 10, bulletColor: '#6699ff',
      bulletCount: 3, spreadAngle: 20,
      dropRate: 0.3,
      shieldHp: 100, shieldRegenDelay: 4000, shieldRegenRate: 25, shieldColor: '#88bbff',
    },
    healer: {
      type: 'healer', name: '治愈者',
      hp: 80, speed: 60, damage: 8, score: 300, xp: 50,
      size: 13, color: '#44ff88',
      ai: 'healer', fireRate: 3000, bulletSpeed: 180, bulletDamage: 6, bulletColor: '#88ffaa',
      bulletCount: 2, spreadAngle: 15,
      dropRate: 0.3,
      healAmount: 5, healInterval: 2000, healRange: 200,
    },
    summoner: {
      type: 'summoner', name: '召唤师',
      hp: 120, speed: 40, damage: 12, score: 400, xp: 70,
      size: 18, color: '#aa44ff',
      ai: 'spawner', fireRate: 2500, bulletSpeed: 200, bulletDamage: 8, bulletColor: '#cc66ff',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.35,
      spawnInterval: 5000, spawnType: 'small', maxMinions: 3,
    },
    // --- 特殊系 ---
    invisible: {
      type: 'invisible', name: '隐身者',
      hp: 70, speed: 95, damage: 20, score: 350, xp: 55,
      size: 12, color: '#aaaacc',
      ai: 'invisible', fireRate: 2000, bulletSpeed: 280, bulletDamage: 12, bulletColor: '#ccccff',
      bulletCount: 2, spreadAngle: 15,
      dropRate: 0.3,
      invisibleInterval: 3000, invisibleDuration: 2000,
    },
    splitMaster: {
      type: 'splitMaster', name: '多级分裂者',
      hp: 80, speed: 75, damage: 15, score: 250, xp: 45,
      size: 16, color: '#ff66aa',
      ai: 'splitMaster', fireRate: 3000, bulletSpeed: 220, bulletDamage: 8, bulletColor: '#ff88bb',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.25,
      splitCount: 3, splitType: 'splitter', splitLevels: 2,
    },
    parasite: {
      type: 'parasite', name: '寄生者',
      hp: 60, speed: 120, damage: 15, score: 280, xp: 45,
      size: 10, color: '#cc44cc',
      ai: 'parasite', fireRate: 0, bulletSpeed: 0, bulletDamage: 0, bulletColor: '#cc44cc',
      dropRate: 0.25,
      latchDamage: 8, latchInterval: 1000, latchRange: 50,
    },
    devourer: {
      type: 'devourer', name: '吞噬者',
      hp: 100, speed: 65, damage: 20, score: 350, xp: 60,
      size: 18, color: '#884400',
      ai: 'devourer', fireRate: 2500, bulletSpeed: 200, bulletDamage: 10, bulletColor: '#aa6622',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.3,
      growPerKill: 2, maxSize: 40, damagePerGrow: 3,
    },
    // --- 远程系 ---
    marksman: {
      type: 'marksman', name: '神射手',
      hp: 70, speed: 45, damage: 12, score: 320, xp: 55,
      size: 13, color: '#ffaa00',
      ai: 'sniperElite', fireRate: 2500, bulletSpeed: 500, bulletDamage: 22, bulletColor: '#ffcc44',
      bulletCount: 1, spreadAngle: 0,
      dropRate: 0.3,
      targetY: 60,
    },
    turret: {
      type: 'turret', name: '炮塔',
      hp: 200, speed: 0, damage: 18, score: 280, xp: 50,
      size: 18, color: '#888888',
      ai: 'sniperElite', fireRate: 1500, bulletSpeed: 350, bulletDamage: 12, bulletColor: '#aaaaaa',
      bulletCount: 2, spreadAngle: 10,
      dropRate: 0.25,
      targetY: 40,
    },
    missileCar: {
      type: 'missileCar', name: '导弹车',
      hp: 90, speed: 55, damage: 15, score: 300, xp: 50,
      size: 16, color: '#ff8844',
      ai: 'follow', fireRate: 3000, bulletSpeed: 200, bulletDamage: 18, bulletColor: '#ffaa66',
      bulletCount: 2, spreadAngle: 30,
      dropRate: 0.28,
      homing: true, homingStrength: 0.03,
    },
    laserTower: {
      type: 'laserTower', name: '激光塔',
      hp: 160, speed: 0, damage: 20, score: 350, xp: 60,
      size: 16, color: '#ff0088',
      ai: 'laserTower', fireRate: 4000, bulletSpeed: 600, bulletDamage: 25, bulletColor: '#ff44aa',
      bulletCount: 1, spreadAngle: 0,
      dropRate: 0.3,
      targetY: 50, laserWidth: 4, laserDuration: 800,
    },
    // --- 飞行系 ---
    flyingSwarm: {
      type: 'flyingSwarm', name: '飞行蜂群',
      hp: 15, speed: 130, damage: 6, score: 40, xp: 6,
      size: 6, color: '#aaff44',
      ai: 'swarmer', fireRate: 5000, bulletSpeed: 130, bulletDamage: 5, bulletColor: '#ccff66',
      dropRate: 0.04,
      groupSize: 8, movementPattern: 'sineWave', patternAmplitude: 120,
    },
    bat: {
      type: 'bat', name: '蝙蝠',
      hp: 25, speed: 150, damage: 10, score: 80, xp: 12,
      size: 8, color: '#664488',
      ai: 'cross', fireRate: 3500, bulletSpeed: 200, bulletDamage: 7, bulletColor: '#8866aa',
      dropRate: 0.1,
      movementPattern: 'zigzag', patternAmplitude: 100,
    },
    ghost: {
      type: 'ghost', name: '幽灵',
      hp: 40, speed: 80, damage: 12, score: 200, xp: 35,
      size: 14, color: '#88ffcc',
      ai: 'ghost', fireRate: 2500, bulletSpeed: 220, bulletDamage: 10, bulletColor: '#aaffdd',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.22,
      phaseThrough: true, phaseChance: 0.3,
    },
    dragon: {
      type: 'dragon', name: '飞龙',
      hp: 250, speed: 60, damage: 25, score: 500, xp: 90,
      size: 24, color: '#ff8800',
      ai: 'follow', fireRate: 2000, bulletSpeed: 280, bulletDamage: 15, bulletColor: '#ffaa44',
      bulletCount: 4, spreadAngle: 30,
      dropRate: 0.4,
      movementPattern: 'sineWave', patternAmplitude: 150, fireBreathOnPhase: true,
    },
    // --- 重型系 ---
    titan: {
      type: 'titan', name: '泰坦',
      hp: 800, speed: 20, damage: 40, score: 600, xp: 120,
      size: 35, color: '#664422',
      ai: 'tank', fireRate: 3000, bulletSpeed: 150, bulletDamage: 18, bulletColor: '#886644',
      bulletCount: 5, spreadAngle: 35,
      dropRate: 0.45,
    },
    colossus: {
      type: 'colossus', name: '巨像',
      hp: 1000, speed: 15, damage: 45, score: 700, xp: 140,
      size: 40, color: '#555566',
      ai: 'tank', fireRate: 3500, bulletSpeed: 140, bulletDamage: 20, bulletColor: '#7777aa',
      bulletCount: 4, spreadAngle: 30,
      dropRate: 0.5,
      shieldHp: 200, shieldRegenDelay: 6000, shieldRegenRate: 15, shieldColor: '#8888cc',
    },
    fortress: {
      type: 'fortress', name: '堡垒',
      hp: 600, speed: 0, damage: 30, score: 500, xp: 100,
      size: 30, color: '#777777',
      ai: 'sniperElite', fireRate: 1200, bulletSpeed: 300, bulletDamage: 14, bulletColor: '#999999',
      bulletCount: 4, spreadAngle: 15,
      dropRate: 0.4,
      targetY: 35,
    },
    hive: {
      type: 'hive', name: '蜂巢',
      hp: 400, speed: 25, damage: 10, score: 450, xp: 85,
      size: 26, color: '#aa8844',
      ai: 'spawner', fireRate: 4000, bulletSpeed: 150, bulletDamage: 8, bulletColor: '#ccaa66',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.4,
      spawnInterval: 3500, spawnType: 'flyingSwarm', maxMinions: 6,
    },
    // --- 其他特殊系 ---
    phantom: {
      type: 'phantom', name: '幻影',
      hp: 55, speed: 100, damage: 14, score: 250, xp: 40,
      size: 12, color: '#ccccff',
      ai: 'phantom', fireRate: 2200, bulletSpeed: 260, bulletDamage: 10, bulletColor: '#ddddff',
      bulletCount: 2, spreadAngle: 15,
      dropRate: 0.25,
      afterimageInterval: 2500, afterimageDuration: 1500, afterimageDamage: 8,
    },
    mirror: {
      type: 'mirror', name: '镜像',
      hp: 90, speed: 65, damage: 12, score: 280, xp: 45,
      size: 14, color: '#dddddd',
      ai: 'mirror', fireRate: 2500, bulletSpeed: 240, bulletDamage: 10, bulletColor: '#eeeeee',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.25,
      reflectChance: 0.25, reflectDamage: 0.5,
    },
    magnet: {
      type: 'magnet', name: '磁铁',
      hp: 85, speed: 55, damage: 12, score: 260, xp: 42,
      size: 15, color: '#ff4488',
      ai: 'magnet', fireRate: 2800, bulletSpeed: 220, bulletDamage: 10, bulletColor: '#ff66aa',
      bulletCount: 2, spreadAngle: 20,
      dropRate: 0.25,
      pullStrength: 80, pullRange: 250,
    },
    time: {
      type: 'time', name: '时间者',
      hp: 75, speed: 70, damage: 10, score: 300, xp: 50,
      size: 14, color: '#8888ff',
      ai: 'time', fireRate: 2500, bulletSpeed: 200, bulletDamage: 10, bulletColor: '#aaaaff',
      bulletCount: 3, spreadAngle: 25,
      dropRate: 0.28,
      slowFieldRange: 180, slowFieldAmount: 0.35,
    },
    voidEnemy: {
      type: 'voidEnemy', name: '虚空者',
      hp: 65, speed: 90, damage: 16, score: 320, xp: 52,
      size: 13, color: '#220044',
      ai: 'voidEnemy', fireRate: 2000, bulletSpeed: 280, bulletDamage: 12, bulletColor: '#4422aa',
      bulletCount: 3, spreadAngle: 30,
      dropRate: 0.28,
      teleportInterval: 3500, warpRadius: 100,
    },
    chaos: {
      type: 'chaos', name: '混沌者',
      hp: 70, speed: 85, damage: 14, score: 300, xp: 48,
      size: 14, color: '#ff44ff',
      ai: 'chaos', fireRate: 2200, bulletSpeed: 250, bulletDamage: 11, bulletColor: '#ff88ff',
      bulletCount: 3, spreadAngle: 25,
      dropRate: 0.26,
      chaosInterval: 3000,
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
      maxEnemiesOnScreenMobile: 8,
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
      // Support enemies (wave 10+)
      healer:     { weight: 6, minWave: 10 },
      // Hazard enemies (wave 18+)
      timeBomb:   { weight: 7, minWave: 18 },
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
    boss_steelColossus: { id: 'boss_steelColossus', name: '钢铁巨像', icon: '🦾', color: '#666688', size: 70, baseHp: 10000, baseDamage: 45, baseSpeed: 15, score: 12000, xp: 900,
      phases: [
        { name: '重锤阶段', hpThreshold: 1.0, bulletPattern: 'cone', bulletCount: 10, spreadAngle: 180, fireRate: 900, bulletSpeed: 200, bulletDamage: 20, specialAttack: 'groundSlam', shockwaveRadius: 180, shockwaveDamage: 30 },
        { name: '导弹齐射', hpThreshold: 0.6, bulletPattern: 'circle', bulletCount: 16, spreadAngle: 360, fireRate: 500, bulletSpeed: 260, bulletDamage: 22, specialAttack: 'missileBarrage', missileTracking: true, missileCount: 6 },
        { name: '钢铁风暴', hpThreshold: 0.3, bulletPattern: 'circle', bulletCount: 24, spreadAngle: 360, fireRate: 300, bulletSpeed: 340, bulletDamage: 28, enrage: true, enrageSpeedMult: 1.3, armorUp: true, damageReduction: 0.5 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore'] },
    boss_shadowAssassin: { id: 'boss_shadowAssassin', name: '暗影刺客', icon: '🗡️', color: '#333355', size: 42, baseHp: 6500, baseDamage: 50, baseSpeed: 55, score: 11000, xp: 850,
      phases: [
        { name: '潜行阶段', hpThreshold: 1.0, bulletPattern: 'cone', bulletCount: 6, spreadAngle: 45, fireRate: 600, bulletSpeed: 350, bulletDamage: 25, specialAttack: 'stealth', stealthDuration: 2000, backstabDamage: 80 },
        { name: '影分身', hpThreshold: 0.5, bulletPattern: 'circle', bulletCount: 10, spreadAngle: 360, fireRate: 400, bulletSpeed: 300, bulletDamage: 22, specialAttack: 'shadowClone', cloneCount: 2, cloneHp: 1000, teleportCooldown: 2000 },
        { name: '暗影乱舞', hpThreshold: 0.25, bulletPattern: 'circle', bulletCount: 16, spreadAngle: 360, fireRate: 200, bulletSpeed: 380, bulletDamage: 28, specialAttack: 'shadowFrenzy', multiTeleport: true, teleportCount: 3 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore'] },
    boss_elementLord: { id: 'boss_elementLord', name: '元素领主', icon: '🌀', color: '#cc44ff', size: 55, baseHp: 8500, baseDamage: 35, baseSpeed: 30, score: 13000, xp: 950,
      phases: [
        { name: '烈焰形态', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 280, bulletDamage: 18, specialAttack: 'fireElement', element: 'fire', burnDamage: 12, burnDuration: 2500 },
        { name: '寒冰形态', hpThreshold: 0.5, bulletPattern: 'circle', bulletCount: 14, spreadAngle: 360, fireRate: 450, bulletSpeed: 250, bulletDamage: 20, specialAttack: 'iceElement', element: 'ice', freezeChance: 0.25, slowAmount: 0.6 },
        { name: '雷霆形态', hpThreshold: 0.25, bulletPattern: 'circle', bulletCount: 18, spreadAngle: 360, fireRate: 300, bulletSpeed: 340, bulletDamage: 25, specialAttack: 'thunderElement', element: 'thunder', chainLightning: true, chainCount: 5 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore'] },
    boss_hiveMother: { id: 'boss_hiveMother', name: '虫巢母体', icon: '🐛', color: '#668833', size: 60, baseHp: 9000, baseDamage: 20, baseSpeed: 18, score: 11500, xp: 880,
      phases: [
        { name: '虫群召唤', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 8, spreadAngle: 360, fireRate: 700, bulletSpeed: 180, bulletDamage: 12, specialAttack: 'swarmSummon', summonType: 'swarm', summonCount: 5, summonInterval: 3000 },
        { name: '毒雾弥漫', hpThreshold: 0.5, bulletPattern: 'circle', bulletCount: 12, spreadAngle: 360, fireRate: 500, bulletSpeed: 200, bulletDamage: 15, specialAttack: 'toxicFog', poisonRadius: 220, poisonDamage: 15, spawnMinions: true },
        { name: '虫巢爆发', hpThreshold: 0.25, bulletPattern: 'circle', bulletCount: 20, spreadAngle: 360, fireRate: 300, bulletSpeed: 260, bulletDamage: 20, specialAttack: 'hiveExplosion', eggCount: 4, eggHp: 800, eggSpawnType: 'elite' },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore'] },
    boss_timeLord: { id: 'boss_timeLord', name: '时间领主', icon: '⏳', color: '#ffcc00', size: 50, baseHp: 7500, baseDamage: 30, baseSpeed: 35, score: 14000, xp: 1000,
      phases: [
        { name: '时间扭曲', hpThreshold: 1.0, bulletPattern: 'circle', bulletCount: 10, spreadAngle: 360, fireRate: 600, bulletSpeed: 240, bulletDamage: 15, specialAttack: 'timeWarp', slowField: true, slowRadius: 200, slowAmount: 0.5, slowDuration: 3000 },
        { name: '时间倒流', hpThreshold: 0.5, bulletPattern: 'circle', bulletCount: 14, spreadAngle: 360, fireRate: 400, bulletSpeed: 300, bulletDamage: 20, specialAttack: 'timeRewind', rewindHp: 0.15, rewindCooldown: 15000, teleportCooldown: 2500 },
        { name: '时间终结', hpThreshold: 0.25, bulletPattern: 'circle', bulletCount: 22, spreadAngle: 360, fireRate: 200, bulletSpeed: 360, bulletDamage: 28, specialAttack: 'timeEnd', timeStop: true, timeStopDuration: 1500, timeStopCooldown: 8000 },
      ], dropGuaranteed: ['weaponCrate', 'fusionCore', 'overloadCore', 'timeCrystal'] },
  },

  // ============ WAVE_SHOP_CONFIG ============
  // In-run (wave) shop settings — NOT the meta shop items (see SHOP_ITEMS above)
  WAVE_SHOP_CONFIG: {
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
  // Star coins = minutes * 10 + kills * 2 + bossKills * 100 + milestones + daily bonus
  PERMANENT_UPGRADES: {
    directions: ['attack', 'hp', 'speed', 'xp', 'dropRate'],
    starCoinFormula: function(minutes, kills, bossKills) { return Math.floor(minutes * 10 + kills * 2 + bossKills * 100); },
    // Milestone bonuses for survival time (minutes)
    starCoinMilestones: [
      { minutes: 10, bonus: 50,  label: '生存10分钟' },
      { minutes: 20, bonus: 150, label: '生存20分钟' },
      { minutes: 30, bonus: 300, label: '生存30分钟' },
    ],
    // Daily first-clear bonus: 1.5x coins for first game each calendar day
    dailyFirstClearMultiplier: 1.5,
    resetRefundRate: 0.8,
    attack: { id: 'attack', name: '攻击强化', icon: '⚔️', description: '每级+3%攻击力', maxLevel: 20, effectPerLevel: { stat: 'attack', op: 'multiply', value: 0.03 }, costFormula: function(level) { return Math.floor(50 * Math.pow(1.5, level)); } },
    hp: { id: 'hp', name: '生命强化', icon: '❤️', description: '每级+4%最大生命', maxLevel: 15, effectPerLevel: { stat: 'hp', op: 'multiply', value: 0.04 }, costFormula: function(level) { return Math.floor(60 * Math.pow(1.5, level)); } },
    speed: { id: 'speed', name: '移速强化', icon: '💨', description: '每级+2%移动速度', maxLevel: 10, effectPerLevel: { stat: 'speed', op: 'multiply', value: 0.02 }, costFormula: function(level) { return Math.floor(80 * Math.pow(1.5, level)); } },
    xp: { id: 'xp', name: '经验强化', icon: '📈', description: '每级+5%经验获取', maxLevel: 15, effectPerLevel: { stat: 'xpMultiplier', op: 'multiply', value: 0.05 }, costFormula: function(level) { return Math.floor(70 * Math.pow(1.5, level)); } },
    dropRate: { id: 'dropRate', name: '掉落强化', icon: '💎', description: '每级+3%掉落率', maxLevel: 10, effectPerLevel: { stat: 'dropRate', op: 'multiply', value: 0.03 }, costFormula: function(level) { return Math.floor(100 * Math.pow(1.5, level)); } },
  },

  // ============ META_SHOP (Between-Run Star Coin Shop) ============
  // Weapons and upgrades purchasable with star coins between runs
  META_SHOP: {
    // Weapon purchases: buy to unlock for loadout selection
    weapons: {
      normal:   { id: 'normal',   weaponId: 'normal',   name: '标准弹', icon: '🔫', price: 0,   description: '标准直射弹幕（默认武器）' },
      homing:   { id: 'homing',   weaponId: 'homing',   name: '追踪弹', icon: '🎯', price: 80,  description: '自动追踪最近敌人' },
      laser:    { id: 'laser',    weaponId: 'laser',    name: '激光炮', icon: '⚡', price: 100, description: '超高射速直线光束' },
      spread:   { id: 'spread',   weaponId: 'spread',   name: '散射弹', icon: '💫', price: 60,  description: '扇形散射多发弹幕' },
      orbital:  { id: 'orbital',  weaponId: 'orbital',  name: '浮游炮', icon: '🛰️', price: 150, description: '环绕浮游炮自动射击' },
      arc:      { id: 'arc',      weaponId: 'arc',      name: '电弧链', icon: '⚡', price: 140, description: '雷电链式传导伤害' },
      boomerang:{ id: 'boomerang',weaponId: 'boomerang', name: '回旋镖', icon: '🪃', price: 90,  description: '飞出后回旋造成双段伤害' },
      pierce:   { id: 'pierce',   weaponId: 'pierce',   name: '穿甲弹', icon: '🗡️', price: 100, description: '穿透多个敌人' },
      explosive:{ id: 'explosive',weaponId: 'explosive', name: '爆破弹', icon: '💣', price: 160, description: '命中爆炸范围伤害' },
      wave:     { id: 'wave',     weaponId: 'wave',     name: '波动炮', icon: '〰️', price: 90,  description: '波浪形弹道覆盖更广' },
      missile:  { id: 'missile',  weaponId: 'missile',  name: '导弹群', icon: '🚀', price: 200, description: '多发追踪导弹爆炸范围伤害' },
      needle:   { id: 'needle',   weaponId: 'needle',   name: '针弹',   icon: '📌', price: 80,  description: '极速连射穿透针弹' },
      gravityWell:{ id: 'gravityWell', weaponId: 'gravityWell', name: '重力井', icon: '🌀', price: 150, description: '发射引力井吸引并伤害敌人' },
      flame:    { id: 'flame',    weaponId: 'flame',    name: '火焰喷射', icon: '🔥', price: 110, description: '近距离火焰持续灼烧' },
      shuriken: { id: 'shuriken', weaponId: 'shuriken', name: '手里剑', icon: '🪃', price: 150, description: '旋转飞镖穿透多次' },
      voidRift: { id: 'voidRift', weaponId: 'voidRift', name: '虚空裂隙', icon: '🕳️', price: 180, description: '召唤虚空裂隙持续伤害并斩杀' },
      lightningBolt:{ id: 'lightningBolt', weaponId: 'lightningBolt', name: '雷电', icon: '⚡', price: 180, description: '闪电链式弹射多个敌人' },
      iceCrystal:{ id: 'iceCrystal', weaponId: 'iceCrystal', name: '冰晶', icon: '❄️', price: 130, description: '冰冻减速弹幕' },
      rocketBarrage:{ id: 'rocketBarrage', weaponId: 'rocketBarrage', name: '火箭弹幕', icon: '🚀', price: 170, description: '密集火箭弹幕覆盖' },
      photonBeam:{ id: 'photonBeam', weaponId: 'photonBeam', name: '光子束', icon: '✨', price: 200, description: '强力光子直线攻击' },
    },
    // Permanent upgrades purchasable with star coins
    upgrades: {
      attackBoost:  { id: 'attackBoost',  name: '攻击强化', icon: '⚔️', price: 120, maxLevel: 5, description: '每级攻击力+5%', effect: { stat: 'attack', op: 'multiply', value: 0.05 } },
      hpBoost:      { id: 'hpBoost',      name: '生命强化', icon: '❤️', price: 100, maxLevel: 5, description: '每级最大生命+10%', effect: { stat: 'hp', op: 'multiply', value: 0.10 } },
      speedBoost:   { id: 'speedBoost',   name: '移速强化', icon: '💨', price: 100, maxLevel: 3, description: '每级移动速度+3%', effect: { stat: 'speed', op: 'multiply', value: 0.03 } },
      critBoost:    { id: 'critBoost',    name: '暴击强化', icon: '💥', price: 150, maxLevel: 3, description: '每级暴击率+2%', effect: { stat: 'critRate', op: 'add', value: 0.02 } },
      xpBoost:      { id: 'xpBoost',      name: '经验强化', icon: '📈', price: 80,  maxLevel: 5, description: '每级经验获取+8%', effect: { stat: 'xpMultiplier', op: 'multiply', value: 0.08 } },
      pickupBoost:  { id: 'pickupBoost',  name: '拾取强化', icon: '🧲', price: 60,  maxLevel: 3, description: '每级拾取范围+25', effect: { stat: 'pickupRange', op: 'add', value: 25 } },
      talentPoint:  { id: 'talentPoint',  name: '天赋点', icon: '🧠', price: 2000, maxLevel: 10, description: '永久+1天赋点(每局生效)', effect: { stat: 'talentPoints', op: 'add', value: 1 } },
    },
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

// ============ D3: Seeded RNG (mulberry32) ============
function mulberry32(seed) { return function() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
