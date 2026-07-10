/**
 * STG Game - Skill Manager
 * XP tracking, level-up, random skill selection, passive/active/conditional effects.
 *
 * Global: window.SkillManager
 * Dependencies: window.GAME_CONFIG, window.game, window.Player, window.Bullet
 */

// ====================================================================
//  FACTION SYSTEM — Core passives, exclusive skills, ultimate talents
// ====================================================================
var FACTION_SYSTEM = {
  attackSpeed: {
    corePassive: { effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.15 }, { stat: 'attack', op: 'multiply', value: 0.1 }] },
    exclusiveSkills: ['as_dual_wield', 'as_frenzy', 'as_machine_gun'],
    ultimate: { id: 'ut_attackSpeed', name: '⚡ 弹幕终结', faction: 'attackSpeed', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '极致攻速的终极形态',
      effects: [{ stat: 'attackSpeed', op: 'multiply', value: -0.5 }, { stat: 'ricochet', op: 'add', value: 3 }],
      visualColor: '#ffdd00', visualType: 'lightning' }
  },
  counter: {
    corePassive: { effects: [{ stat: 'defense', op: 'add', value: 0.1 }, { stat: 'reflectDamage', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['ct_thorns', 'ct_fortify', 'ct_retaliate'],
    ultimate: { id: 'ut_counter', name: '🛡️ 不灭壁垒', faction: 'counter', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '铜墙铁壁，无坚不摧',
      effects: [{ stat: 'defense', op: 'multiply', value: 0.5 }, { stat: 'reflectDamage', op: 'multiply', value: 1.0 }],
      visualColor: '#ff6644', visualType: 'fire' }
  },
  crit: {
    corePassive: { effects: [{ stat: 'critRate', op: 'add', value: 0.1 }, { stat: 'critMult', op: 'add', value: 0.5 }] },
    exclusiveSkills: ['cr_deadly', 'cr_execute', 'cr_chain_crit'],
    ultimate: { id: 'ut_crit', name: '💥 致命审判', faction: 'crit', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '每一击都是致命一击',
      effects: [{ stat: 'critRate', op: 'add', value: 0.3 }, { stat: 'critAoeDamage', op: 'set', value: 50 }, { stat: 'critAoeRadius', op: 'set', value: 150 }],
      visualColor: '#ff0000', visualType: 'fire' }
  },
  summon: {
    corePassive: { effects: [{ stat: 'drones', op: 'add', value: 1 }, { stat: 'droneDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['sm_drone_plus', 'sm_drone_dmg', 'sm_drone_speed'],
    ultimate: { id: 'ut_summon', name: '🛸 蜂群意识', faction: 'summon', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '浮游炮进化为蜂群',
      effects: [{ stat: 'drones', op: 'add', value: 3 }, { stat: 'droneDamage', op: 'multiply', value: 1.0 }, { stat: 'droneBlock', op: 'set', value: true }],
      visualColor: '#aa66ff', visualType: 'holy' }
  },
  elemental: {
    corePassive: { effects: [{ stat: 'burnDamage', op: 'add', value: 3 }, { stat: 'burnDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['el_burn', 'el_fire_trail', 'el_explosion'],
    ultimate: { id: 'ut_elemental', name: '🔥 凤凰涅槃', faction: 'elemental', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '浴火重生，烈焰吞噬一切',
      effects: [{ stat: 'burnDamage', op: 'multiply', value: 2.0 }, { stat: 'burnSpread', op: 'set', value: true }, { stat: 'fireTrail', op: 'set', value: true }],
      visualColor: '#ff8800', visualType: 'fire' }
  },
  lifesteal: {
    corePassive: { effects: [{ stat: 'lifesteal', op: 'add', value: 0.05 }, { stat: 'maxHpBonus', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['ls_vampire', 'ls_blood_rage', 'ls_overheal'],
    ultimate: { id: 'ut_lifesteal', name: '🩸 血族之王', faction: 'lifesteal', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '鲜血之力觉醒，不死不灭',
      effects: [{ stat: 'lifesteal', op: 'add', value: 0.3 }, { stat: 'overheal', op: 'set', value: 0.5 }, { stat: 'healOnKill', op: 'add', value: 10 }],
      visualColor: '#ff3366', visualType: 'poison' }
  },
  shield: {
    corePassive: { effects: [{ stat: 'shieldAmount', op: 'add', value: 15 }, { stat: 'shieldRegen', op: 'add', value: 0.5 }] },
    exclusiveSkills: ['sh_bigger', 'sh_regen', 'sh_reflect'],
    ultimate: { id: 'ut_shield', name: '🔮 绝对防御', faction: 'shield', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '护盾进化为绝对防御',
      effects: [{ stat: 'shieldAmount', op: 'multiply', value: 1.0 }, { stat: 'shieldRegen', op: 'multiply', value: 2.0 }, { stat: 'shieldReflect', op: 'multiply', value: 1.0 }],
      visualColor: '#44aaff', visualType: 'ice' }
  },
  poison: {
    corePassive: { effects: [{ stat: 'poisonDamage', op: 'add', value: 3 }, { stat: 'poisonSpread', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['ps_venom', 'ps_contagion', 'ps_weakness'],
    ultimate: { id: 'ut_poison', name: '☠️ 瘟疫领主', faction: 'poison', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '瘟疫蔓延，万物凋零',
      effects: [{ stat: 'poisonDamage', op: 'multiply', value: 2.0 }, { stat: 'poisonVulnerability', op: 'set', value: 0.5 }],
      visualColor: '#55cc44', visualType: 'poison' }
  },
  ice: {
    corePassive: { effects: [{ stat: 'slowChance', op: 'add', value: 0.1 }, { stat: 'freezeChance', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['ic_frost', 'ic_freeze', 'ic_shatter'],
    ultimate: { id: 'ut_ice', name: '❄️ 冰封王座', faction: 'ice', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '绝对零度，万物冻结',
      effects: [{ stat: 'freezeChance', op: 'add', value: 0.3 }, { stat: 'frozenExplode', op: 'set', value: true }, { stat: 'slowAura', op: 'set', value: 0.3 }],
      visualColor: '#66ddff', visualType: 'ice' }
  },
  barrage: {
    corePassive: { effects: [{ stat: 'extraBullets', op: 'add', value: 1 }, { stat: 'bulletSize', op: 'multiply', value: 0.1 }] },
    exclusiveSkills: ['bg_spread', 'bg_wide', 'bg_piercing'],
    ultimate: { id: 'ut_barrage', name: '🌊 弹幕地狱', faction: 'barrage', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '弹幕覆盖天地，无处可逃',
      effects: [{ stat: 'bulletCount', op: 'multiply', value: 2.0 }, { stat: 'bulletSize', op: 'multiply', value: 1.0 }, { stat: 'bulletExplosion', op: 'set', value: { damage: 20, radius: 60 } }],
      visualColor: '#ff66aa', visualType: 'fire' }
  },
  gravity: {
    corePassive: { effects: [{ stat: 'gravityRadius', op: 'add', value: 30 }, { stat: 'gravitySlow', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['gv_weight', 'gv_crush', 'gv_singularity'],
    ultimate: { id: 'ut_gravity', name: '🌌 奇点坍缩', faction: 'gravity', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '引力场坍缩为奇点',
      effects: [{ stat: 'gravityRadius', op: 'multiply', value: 1.0 }, { stat: 'gravityDamage', op: 'multiply', value: 2.0 }, { stat: 'gravityPull', op: 'set', value: 150 }],
      visualColor: '#8866cc', visualType: 'holy' }
  },
  void: {
    corePassive: { effects: [{ stat: 'voidExecuteThreshold', op: 'add', value: 0.03 }, { stat: 'voidDamage', op: 'add', value: 3 }] },
    exclusiveSkills: ['vd_voidTouch', 'vd_consume', 'vd_annihilate'],
    ultimate: { id: 'ut_void', name: '🕳️ 深渊之门', faction: 'void', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '虚空之力觉醒，万物归于虚无',
      effects: [{ stat: 'voidExecuteThreshold', op: 'add', value: 0.2 }, { stat: 'voidExecuteHeal', op: 'set', value: true }, { stat: 'voidDamage', op: 'multiply', value: 2.0 }],
      visualColor: '#220044', visualType: 'holy' }
  },
  thunder: {
    corePassive: { effects: [{ stat: 'chainLightningChance', op: 'add', value: 0.1 }, { stat: 'chainDamage', op: 'multiply', value: 0.15 }] },
    exclusiveSkills: ['th_charged', 'th_arc', 'th_overcharge'],
    ultimate: { id: 'ut_thunder', name: '🌩️ 雷神降临', faction: 'thunder', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '雷神之力觉醒，电击万物',
      effects: [{ stat: 'chainCount', op: 'multiply', value: 2.0 }, { stat: 'chainDamage', op: 'multiply', value: 1.0 }, { stat: 'chainRange', op: 'multiply', value: 1.0 }],
      visualColor: '#ffff00', visualType: 'lightning' }
  },
  wind: {
    corePassive: { effects: [{ stat: 'speed', op: 'multiply', value: 0.08 }, { stat: 'dodgeChance', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['wd_tailwind', 'wd_gust', 'wd_cyclone'],
    ultimate: { id: 'ut_wind', name: '🍃 暴风之眼', faction: 'wind', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '风之极致，无形无相',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.5 }, { stat: 'dodgeChance', op: 'add', value: 0.2 }, { stat: 'dodgeShockwave', op: 'set', value: { damage: 40, radius: 200 } }],
      visualColor: '#88ff88', visualType: 'poison' }
  },
  shadow: {
    corePassive: { effects: [{ stat: 'dodgeChance', op: 'add', value: 0.03 }, { stat: 'stealthDamageBonus', op: 'add', value: 0.3 }] },
    exclusiveSkills: ['sd_darkCloak', 'sd_ambush', 'sd_shadowStep'],
    ultimate: { id: 'ut_shadow', name: '🌑 暗影之主', faction: 'shadow', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '暗影之力完全觉醒',
      effects: [{ stat: 'stealthDuration', op: 'multiply', value: 2.0 }, { stat: 'stealthDamageBonus', op: 'multiply', value: 2.0 }, { stat: 'dodgeChance', op: 'add', value: 0.15 }],
      visualColor: '#111166', visualType: 'holy' }
  },
  holy: {
    corePassive: { effects: [{ stat: 'healAuraAmount', op: 'add', value: 0.5 }, { stat: 'bossDamageBonus', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['hy_blessing', 'hy_smite', 'hy_holyNova'],
    ultimate: { id: 'ut_holy', name: '✨ 神圣审判', faction: 'holy', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '圣光净化一切邪恶',
      effects: [{ stat: 'healAuraAmount', op: 'multiply', value: 2.0 }, { stat: 'bossDamageBonus', op: 'multiply', value: 2.0 }, { stat: 'healOnHit', op: 'set', value: 3 }],
      visualColor: '#ffffcc', visualType: 'holy' }
  },
  blood: {
    corePassive: { effects: [{ stat: 'hpRegen', op: 'add', value: 0.5 }, { stat: 'bloodRageDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['bd_bloodletting', 'bd_bloodFrenzy', 'bd_crimsonPact'],
    ultimate: { id: 'ut_blood', name: '🩸 血之帝王', faction: 'blood', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '以血为代价，换取无上力量',
      effects: [{ stat: 'bloodEmperor', op: 'set', value: true }, { stat: 'lifesteal', op: 'add', value: 0.25 }],
      visualColor: '#cc0000', visualType: 'fire' }
  },
  magnet: {
    corePassive: { effects: [{ stat: 'pickupRange', op: 'add', value: 30 }, { stat: 'bulletRepelChance', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['mg_polarize', 'mg_attract', 'mg_magneticField'],
    ultimate: { id: 'ut_magnet', name: '🧲 万磁之王', faction: 'magnet', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '磁力掌控万物',
      effects: [{ stat: 'pickupRange', op: 'multiply', value: 4.0 }, { stat: 'bulletRepelChance', op: 'set', value: 1.0 }, { stat: 'itemAutoAttract', op: 'set', value: true }],
      visualColor: '#cc44cc', visualType: 'holy' }
  },
  mirror: {
    corePassive: { effects: [{ stat: 'damageRedirect', op: 'add', value: 0.1 }, { stat: 'decoyDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['mr_reflection', 'mr_mirage', 'mr_shatter'],
    ultimate: { id: 'ut_mirror', name: '🪞 镜花水月', faction: 'mirror', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '虚实难辨，真假莫测',
      effects: [{ stat: 'decoyCount', op: 'add', value: 3 }, { stat: 'decoyDamage', op: 'set', value: 1.0 }, { stat: 'damageRedirect', op: 'add', value: 0.4 }],
      visualColor: '#aaccee', visualType: 'ice' }
  },
  time: {
    corePassive: { effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.05 }, { stat: 'timeSlowAmount', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['tm_haste', 'tm_rewind', 'tm_timeFreeze'],
    ultimate: { id: 'ut_time', name: '⏳ 时间领主', faction: 'time', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '掌控时间之力，逆转乾坤',
      effects: [{ stat: 'enemySlow', op: 'set', value: 0.5 }, { stat: 'cooldownReduction', op: 'add', value: 0.75 }, { stat: 'timeSlowAmount', op: 'multiply', value: 1.0 }],
      visualColor: '#ccbb88', visualType: 'holy' }
  },
  fury: {
    corePassive: { effects: [{ stat: 'lowHpBonus', op: 'add', value: 0.1 }, { stat: 'attack', op: 'multiply', value: 0.1 }] },
    exclusiveSkills: ['fr_berserk', 'fr_lastStand', 'fr_rage'],
    ultimate: { id: 'ut_fury', name: '💢 不灭狂怒', faction: 'fury', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '怒火焚天，不死不休',
      effects: [{ stat: 'lowHpBonus', op: 'add', value: 1.0 }, { stat: 'rageThreshold', op: 'add', value: 0.3 }, { stat: 'attackSpeed', op: 'multiply', value: -0.3 }],
      visualColor: '#ff0044', visualType: 'fire' }
  },
  luck: {
    corePassive: { effects: [{ stat: 'luckBonus', op: 'add', value: 0.05 }, { stat: 'critRate', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['lk_fortune', 'lk_jackpot', 'lk_miracle'],
    ultimate: { id: 'ut_luck', name: '🍀 命运之子', faction: 'luck', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '天命所归，万事皆顺',
      effects: [{ stat: 'luckBonus', op: 'add', value: 0.5 }, { stat: 'critRate', op: 'add', value: 0.25 }, { stat: 'dropRateBonus', op: 'add', value: 0.5 }, { stat: 'luckyDodge', op: 'set', value: 0.15 }],
      visualColor: '#44ff44', visualType: 'holy' }
  },
  sonic: {
    corePassive: { effects: [{ stat: 'sonicDamage', op: 'add', value: 0.15 }, { stat: 'sonicRadius', op: 'add', value: 20 }] },
    exclusiveSkills: ['sn_wave', 'sn_echo', 'sn_resonance'],
    ultimate: { id: 'ut_sonic', name: '🔊 毁灭共鸣', faction: 'sonic', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '音波共鸣达到极致，万物共振碎裂',
      effects: [{ stat: 'sonicDamage', op: 'multiply', value: 2.0 }, { stat: 'sonicRadius', op: 'multiply', value: 1.0 }, { stat: 'sonicStun', op: 'set', value: 1000 }],
      visualColor: '#ff88ff', visualType: 'holy' }
  },
  rune: {
    corePassive: { effects: [{ stat: 'runeDrop', op: 'add', value: 0.05 }, { stat: 'runeEffect', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['rn_mark', 'rn_chain', 'rn_explosion'],
    ultimate: { id: 'ut_rune', name: '🔮 符文之主', faction: 'rune', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '符文之力觉醒，印记永驻',
      effects: [{ stat: 'runeDrop', op: 'multiply', value: 2.0 }, { stat: 'runeDuration', op: 'multiply', value: 2.0 }, { stat: 'runeNova', op: 'set', value: { damage: 60, radius: 250 } }],
      visualColor: '#ffaa44', visualType: 'holy' }
  },
  star: {
    corePassive: { effects: [{ stat: 'chargeRate', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['st_charge', 'st_burst', 'st_shower'],
    ultimate: { id: 'ut_star', name: '⭐ 超新星', faction: 'star', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '星辰之力爆发，照亮一切黑暗',
      effects: [{ stat: 'chargeRate', op: 'multiply', value: 3.0 }, { stat: 'starBurstDamage', op: 'multiply', value: 2.0 }, { stat: 'starBurstHeal', op: 'set', value: 30 }],
      visualColor: '#ffffaa', visualType: 'lightning' }
  },
  darkGold: {
    corePassive: { effects: [{ stat: 'goldBonus', op: 'add', value: 0.1 }, { stat: 'goldOnHit', op: 'add', value: 1 }] },
    exclusiveSkills: ['dg_goldRush', 'dg_midas', 'dg_magnet'],
    ultimate: { id: 'ut_darkGold', name: '💰 黄金帝王', faction: 'darkGold', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '万物皆可化金，财富即力量',
      effects: [{ stat: 'goldBonus', op: 'multiply', value: 3.0 }, { stat: 'goldDamageConvert', op: 'set', value: 0.15 }, { stat: 'goldShield', op: 'set', value: { amount: 50, regen: 2 } }],
      visualColor: '#ffcc00', visualType: 'holy' }
  },
  minion: {
    corePassive: { effects: [{ stat: 'minionCount', op: 'add', value: 1 }, { stat: 'minionDamage', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['mn_bloodOrb', 'mn_minionDmg', 'mn_minionCount'],
    ultimate: { id: 'ut_minion', name: '👹 魔仆军团', faction: 'minion', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '鲜血之力觉醒，魔仆大军降临',
      effects: [{ stat: 'minionCount', op: 'add', value: 3 }, { stat: 'minionDamage', op: 'multiply', value: 1.5 }, { stat: 'bloodOrbHeal', op: 'set', value: 15 }],
      visualColor: '#ff4488', visualType: 'fire' }
  },
  data: {
    corePassive: { effects: [{ stat: 'weakPointChance', op: 'add', value: 0.05 }, { stat: 'weakPointBonus', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['dt_weakScan', 'dt_critBonus', 'dt_scanRange'],
    ultimate: { id: 'ut_data', name: '📊 全知之眼', faction: 'data', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '数据之力完全解析，洞悉一切弱点',
      effects: [{ stat: 'weakPointChance', op: 'set', value: 0.8 }, { stat: 'weakPointBonus', op: 'multiply', value: 2.0 }, { stat: 'scanCritGuarantee', op: 'set', value: true }],
      visualColor: '#00ffcc', visualType: 'holy' }
  },
  storm: {
    corePassive: { effects: [{ stat: 'windWallRadius', op: 'add', value: 20 }, { stat: 'windPushForce', op: 'add', value: 25 }] },
    exclusiveSkills: ['sm_wall', 'sm_gust', 'sm_tornado'],
    ultimate: { id: 'ut_storm', name: '🌪️ 风暴领主', faction: 'storm', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '风暴之力觉醒，龙卷风暴席卷战场',
      effects: [{ stat: 'windWallRadius', op: 'multiply', value: 2.0 }, { stat: 'windPushForce', op: 'multiply', value: 2.0 }, { stat: 'tornadoChance', op: 'add', value: 0.5 }],
      visualColor: '#88ffcc', visualType: 'poison' }
  },
  soul: {
    corePassive: { effects: [{ stat: 'maxSouls', op: 'add', value: 10 }, { stat: 'soulBonus', op: 'add', value: 0.01 }] },
    exclusiveSkills: ['so_collect', 'so_burst', 'so_siphon'],
    ultimate: { id: 'ut_soul', name: '👻 灵魂收割者', faction: 'soul', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '灵魂之力完全觉醒，万物灵魂归于己身',
      effects: [{ stat: 'maxSouls', op: 'multiply', value: 2.0 }, { stat: 'soulBonus', op: 'multiply', value: 3.0 }, { stat: 'soulExplosion', op: 'set', value: { damage: 40, radius: 200 } }],
      visualColor: '#cc88ff', visualType: 'holy' }
  },
  genesis: {
    corePassive: { effects: [{ stat: 'buffDuration', op: 'add', value: 5000 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['ge_chaos', 'ge_creation', 'ge_entropy'],
    ultimate: { id: 'ut_genesis', name: '🌌 创世神', faction: 'genesis', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '混沌创世之力觉醒，随机增益变为三倍',
      effects: [{ stat: 'randomBuffInterval', op: 'multiply', value: -0.5 }, { stat: 'buffDuration', op: 'multiply', value: 2.0 }, { stat: 'genesisMultiBuff', op: 'set', value: 3 }],
      visualColor: '#ffffff', visualType: 'holy' }
  },
  nature: {
    corePassive: { effects: [{ stat: 'regenRate', op: 'add', value: 0.003 }, { stat: 'thornDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['nt_regeneration', 'nt_thorns', 'nt_vineRoot'],
    ultimate: { id: 'ut_nature', name: '🌿 自然之怒', faction: 'nature', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '自然之力完全觉醒，万物复苏生生不息',
      effects: [{ stat: 'regenRate', op: 'multiply', value: 2.0 }, { stat: 'thornDamage', op: 'multiply', value: 2.0 }, { stat: 'vineRootChance', op: 'set', value: 0.5 }],
      visualColor: '#44ff88', visualType: 'holy' }
  },
  psychic: {
    corePassive: { effects: [{ stat: 'markChance', op: 'add', value: 0.1 }, { stat: 'markBonus', op: 'add', value: 0.2 }] },
    exclusiveSkills: ['ps_mark', 'ps_predict', 'ps_burst'],
    ultimate: { id: 'ut_psychic', name: '🧠 心灵风暴', faction: 'psychic', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '心灵之力完全释放，标记所有敌人',
      effects: [{ stat: 'markChance', op: 'set', value: 1.0 }, { stat: 'markBonus', op: 'multiply', value: 2.0 }, { stat: 'predictCrit', op: 'set', value: true }],
      visualColor: '#ff44ff', visualType: 'holy' }
  },
  explosive: {
    corePassive: { effects: [{ stat: 'explosionBonus', op: 'add', value: 0.15 }, { stat: 'explosionRadius', op: 'add', value: 30 }] },
    exclusiveSkills: ['ex_explosiveAmmo', 'ex_chainReaction', 'ex_bigBang'],
    ultimate: { id: 'ut_explosive', name: '💥 核爆终焉', faction: 'explosive', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '终极爆破之力，核爆毁灭一切',
      effects: [{ stat: 'explosionBonus', op: 'multiply', value: 2.0 }, { stat: 'explosionRadius', op: 'multiply', value: 1.5 }, { stat: 'explosionChainCount', op: 'set', value: 3 }],
      visualColor: '#ff8800', visualType: 'fire' }
  },
  mech: {
    corePassive: { effects: [{ stat: 'repairRate', op: 'add', value: 0.01 }, { stat: 'robotDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['mc_repairKit', 'mc_robotArm', 'mc_deploy'],
    ultimate: { id: 'ut_mech', name: '🤖 机械天网', faction: 'mech', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '机械军团全面觉醒，钢铁洪流席卷战场',
      effects: [{ stat: 'robotCount', op: 'add', value: 2 }, { stat: 'robotDamage', op: 'multiply', value: 1.5 }, { stat: 'repairRate', op: 'multiply', value: 2.0 }],
      visualColor: '#88aaff', visualType: 'lightning' }
  },
  tech: {
    corePassive: { effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.05 }, { stat: 'skillBoost', op: 'add', value: 0.08 }] },
    exclusiveSkills: ['tc_cooldown', 'tc_skillBoost', 'tc_nanoField'],
    ultimate: { id: 'ut_tech', name: '⚙️ 科技巅峰', faction: 'tech', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '科技之力达到巅峰，技能无冷却',
      effects: [{ stat: 'cooldownReduction', op: 'add', value: 0.75 }, { stat: 'skillBoost', op: 'multiply', value: 2.0 }, { stat: 'nanoRepair', op: 'multiply', value: 2.0 }],
      visualColor: '#44ddff', visualType: 'ice' }
  },
  chaos: {
    corePassive: { effects: [{ stat: 'randomEffectChance', op: 'add', value: 0.1 }, { stat: 'chaosMultiplier', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['ch_randomShot', 'ch_chaosOrb', 'ch_wildMagic'],
    ultimate: { id: 'ut_chaos', name: '🎭 混沌之源', faction: 'chaos', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '混沌本源觉醒，万物归于混沌',
      effects: [{ stat: 'randomEffectChance', op: 'set', value: 1.0 }, { stat: 'chaosMultiplier', op: 'multiply', value: 3.0 }, { stat: 'chaosDoubleProc', op: 'set', value: true }],
      visualColor: '#ff44aa', visualType: 'poison' }
  },
  // ===== New Faction Systems (43) =====
  light: {
    corePassive: { effects: [{ stat: 'attack', op: 'multiply', value: 0.1 }, { stat: 'lightCharge', op: 'add', value: 10 }] },
    exclusiveSkills: ['lt_radiance', 'lt_flash', 'lt_solarBeam'],
    ultimate: { id: 'ut_light', name: '☀️ 极光领域', faction: 'light', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '光能完全释放，极光笼罩战场',
      effects: [{ stat: 'lightCharge', op: 'multiply', value: 2.0 }, { stat: 'lightBurstDamage', op: 'multiply', value: 2.0 }, { stat: 'lightAuraDamage', op: 'set', value: 20 }],
      visualColor: '#fff9c4', visualType: 'holy' }
  },
  dark: {
    corePassive: { effects: [{ stat: 'attack', op: 'multiply', value: 0.1 }, { stat: 'shadowMeld', op: 'add', value: 0.06 }] },
    exclusiveSkills: ['dk_shroud', 'dk_consume', 'dk_voidStrike'],
    ultimate: { id: 'ut_dark', name: '🌚 永暗之夜', faction: 'dark', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '黑暗吞噬一切光芒',
      effects: [{ stat: 'shadowMeld', op: 'add', value: 0.4 }, { stat: 'darkBolt', op: 'multiply', value: 3.0 }, { stat: 'darkVulnerability', op: 'set', value: 0.3 }],
      visualColor: '#1a1a2e', visualType: 'holy' }
  },
  crystal: {
    corePassive: { effects: [{ stat: 'crystalShardCount', op: 'add', value: 1 }, { stat: 'shardDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['cy_shatter', 'cy_refract', 'cy_prism'],
    ultimate: { id: 'ut_crystal', name: '💎 水晶风暴', faction: 'crystal', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '水晶碎裂，万箭齐发',
      effects: [{ stat: 'crystalShardCount', op: 'multiply', value: 2.0 }, { stat: 'shardDamage', op: 'multiply', value: 1.5 }, { stat: 'crystalExplosion', op: 'set', value: { damage: 60, radius: 200 } }],
      visualColor: '#00e5ff', visualType: 'ice' }
  },
  lava: {
    corePassive: { effects: [{ stat: 'magmaPoolDamage', op: 'add', value: 3 }, { stat: 'magmaPoolRadius', op: 'add', value: 20 }] },
    exclusiveSkills: ['lv_erupt', 'lv_magma', 'lv_volcano'],
    ultimate: { id: 'ut_lava', name: '🌋 末日火山', faction: 'lava', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '熔岩爆发，焚尽万物',
      effects: [{ stat: 'magmaPoolDamage', op: 'multiply', value: 2.0 }, { stat: 'magmaPoolRadius', op: 'multiply', value: 1.5 }, { stat: 'lavaEruption', op: 'set', value: { damage: 80, radius: 300, interval: 3000 } }],
      visualColor: '#bf360c', visualType: 'fire' }
  },
  steam: {
    corePassive: { effects: [{ stat: 'steamPressure', op: 'add', value: 0.05 }, { stat: 'speed', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['se_pressure', 'se_cloud', 'se_geyser'],
    ultimate: { id: 'ut_steam', name: '♨️ 蒸汽风暴', faction: 'steam', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '蒸汽压力达到极限，爆发毁灭之力',
      effects: [{ stat: 'steamPressure', op: 'multiply', value: 2.0 }, { stat: 'steamBurstDamage', op: 'set', value: 50 }, { stat: 'steamBurstRadius', op: 'set', value: 250 }],
      visualColor: '#b0bec5', visualType: 'poison' }
  },
  dust: {
    corePassive: { effects: [{ stat: 'dustBlindChance', op: 'add', value: 0.05 }, { stat: 'dustSlowAmount', op: 'add', value: 0.08 }] },
    exclusiveSkills: ['du_sandBlast', 'du_dustDevil', 'du_sirocco'],
    ultimate: { id: 'ut_dust', name: '🌫️ 沙暴末日', faction: 'dust', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '沙暴蔽日，万物迷失',
      effects: [{ stat: 'dustBlindChance', op: 'add', value: 0.35 }, { stat: 'dustSlowAmount', op: 'multiply', value: 1.0 }, { stat: 'dustStormRadius', op: 'set', value: 300 }],
      visualColor: '#8d6e63', visualType: 'poison' }
  },
  metal: {
    corePassive: { effects: [{ stat: 'armorPierce', op: 'add', value: 0.08 }, { stat: 'defense', op: 'add', value: 0.08 }] },
    exclusiveSkills: ['mt_shrapnel', 'mt_armor', 'mt_railgun'],
    ultimate: { id: 'ut_metal', name: '⛓️ 钢铁要塞', faction: 'metal', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '钢铁之力完全觉醒，不破壁垒',
      effects: [{ stat: 'armorPierce', op: 'add', value: 0.3 }, { stat: 'defense', op: 'multiply', value: 0.5 }, { stat: 'shrapnelCount', op: 'add', value: 5 }],
      visualColor: '#455a64', visualType: 'fire' }
  },
  glass: {
    corePassive: { effects: [{ stat: 'glassShardChance', op: 'add', value: 0.1 }, { stat: 'critRate', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['gl_fragile', 'gl_splinter', 'gl_mirrorBlade'],
    ultimate: { id: 'ut_glass', name: '💠 琉璃碎梦', faction: 'glass', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '琉璃粉碎，万物崩裂',
      effects: [{ stat: 'glassShardChance', op: 'add', value: 0.3 }, { stat: 'shardDamage', op: 'multiply', value: 2.0 }, { stat: 'glassExplosion', op: 'set', value: { damage: 100, radius: 180 } }],
      visualColor: '#80deea', visualType: 'ice' }
  },
  silk: {
    corePassive: { effects: [{ stat: 'silkSnareChance', op: 'add', value: 0.06 }, { stat: 'silkSnareDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['si_weave', 'si_cocoon', 'si_webTrap'],
    ultimate: { id: 'ut_silk', name: '🧣 天罗地网', faction: 'silk', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '丝线编织天罗地网，困住一切敌人',
      effects: [{ stat: 'silkSnareChance', op: 'add', value: 0.3 }, { stat: 'silkSnareDuration', op: 'multiply', value: 2.0 }, { stat: 'silkAuraSlow', op: 'set', value: 0.4 }],
      visualColor: '#f06292', visualType: 'poison' }
  },
  bone: {
    corePassive: { effects: [{ stat: 'boneSpikeDamage', op: 'add', value: 5 }, { stat: 'boneArmor', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['bn_spike', 'bn_ossify', 'bn_skeleton'],
    ultimate: { id: 'ut_bone', name: '🦴 骸骨王朝', faction: 'bone', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '骸骨之力觉醒，亡者大军降临',
      effects: [{ stat: 'boneSpikeDamage', op: 'multiply', value: 2.0 }, { stat: 'boneArmor', op: 'add', value: 0.2 }, { stat: 'boneMinionCount', op: 'set', value: 2 }],
      visualColor: '#bcaaa4', visualType: 'holy' }
  },
  arrow: {
    corePassive: { effects: [{ stat: 'arrowPrecision', op: 'add', value: 0.1 }, { stat: 'critRate', op: 'add', value: 0.04 }] },
    exclusiveSkills: ['ar_pierce', 'ar_volley', 'ar_trueshot'],
    ultimate: { id: 'ut_arrow', name: '🎯 穿云一箭', faction: 'arrow', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '一箭穿云，万物可破',
      effects: [{ stat: 'arrowPrecision', op: 'add', value: 0.4 }, { stat: 'arrowCritBonus', op: 'multiply', value: 1.5 }, { stat: 'arrowGuaranteedCrit', op: 'set', value: 3 }],
      visualColor: '#ff6d00', visualType: 'lightning' }
  },
  spear: {
    corePassive: { effects: [{ stat: 'spearPierceCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.08 }] },
    exclusiveSkills: ['sp_thrust', 'sp_impale', 'sp_whirlwind'],
    ultimate: { id: 'ut_spear', name: '🔱 破阵之枪', faction: 'spear', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '枪出破阵，贯穿一切',
      effects: [{ stat: 'spearPierceCount', op: 'add', value: 3 }, { stat: 'spearRange', op: 'multiply', value: 1.0 }, { stat: 'spearAoeDamage', op: 'set', value: 0.5 }],
      visualColor: '#00695c', visualType: 'lightning' }
  },
  hammer: {
    corePassive: { effects: [{ stat: 'hammerStunChance', op: 'add', value: 0.05 }, { stat: 'attack', op: 'multiply', value: 0.12 }] },
    exclusiveSkills: ['hm_smash', 'hm_quake', 'hm_megaton'],
    ultimate: { id: 'ut_hammer', name: '🔨 碎星之锤', faction: 'hammer', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '巨锤碎星，大地震颤',
      effects: [{ stat: 'hammerStunChance', op: 'add', value: 0.25 }, { stat: 'hammerRadius', op: 'multiply', value: 1.5 }, { stat: 'hammerStunDuration', op: 'set', value: 2000 }],
      visualColor: '#4e342e', visualType: 'fire' }
  },
  whip: {
    corePassive: { effects: [{ stat: 'whipChainCount', op: 'add', value: 1 }, { stat: 'whipRange', op: 'add', value: 10 }] },
    exclusiveSkills: ['wh_lash', 'wh_snare', 'wh_cascade'],
    ultimate: { id: 'ut_whip', name: '🪢 万蛇噬体', faction: 'whip', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '长鞭化万蛇，缠绕吞噬',
      effects: [{ stat: 'whipChainCount', op: 'multiply', value: 2.0 }, { stat: 'whipRange', op: 'multiply', value: 1.0 }, { stat: 'whipChainDamage', op: 'add', value: 0.3 }],
      visualColor: '#ad1457', visualType: 'poison' }
  },
  sword: {
    corePassive: { effects: [{ stat: 'swordComboCount', op: 'add', value: 1 }, { stat: 'swordComboBonus', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['sw_slash', 'sw_bladeFury', 'sw_iaijutsu'],
    ultimate: { id: 'ut_sword', name: '⚔️ 无想剑域', faction: 'sword', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '剑心通明，万剑归宗',
      effects: [{ stat: 'swordComboCount', op: 'add', value: 4 }, { stat: 'swordComboBonus', op: 'multiply', value: 2.0 }, { stat: 'swordFinalSlash', op: 'set', value: { damage: 200, radius: 300 } }],
      visualColor: '#78909c', visualType: 'lightning' }
  },
  ax: {
    corePassive: { effects: [{ stat: 'axCleaveRadius', op: 'add', value: 10 }, { stat: 'axCleaveDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['ax_cleave', 'ax_brutal', 'ax_whirlwind'],
    ultimate: { id: 'ut_ax', name: '🪓 开天辟地', faction: 'ax', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '巨斧开天，一斩破万法',
      effects: [{ stat: 'axCleaveRadius', op: 'multiply', value: 2.0 }, { stat: 'axCleaveDamage', op: 'multiply', value: 1.5 }, { stat: 'axExecuteThreshold', op: 'set', value: 0.25 }],
      visualColor: '#e64a19', visualType: 'fire' }
  },
  dagger: {
    corePassive: { effects: [{ stat: 'daggerBackstabMult', op: 'add', value: 0.3 }, { stat: 'daggerCritChance', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['da_backstab', 'da_poisonBlade', 'da_shadowStrike'],
    ultimate: { id: 'ut_dagger', name: '🗡️ 暗杀之星', faction: 'dagger', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '暗影中的致命刺杀',
      effects: [{ stat: 'daggerBackstabMult', op: 'multiply', value: 2.0 }, { stat: 'daggerCritChance', op: 'add', value: 0.2 }, { stat: 'daggerAutocritStealth', op: 'set', value: true }],
      visualColor: '#263238', visualType: 'holy' }
  },
  staff: {
    corePassive: { effects: [{ stat: 'magicCharge', op: 'add', value: 5 }, { stat: 'magicBurstDamage', op: 'add', value: 15 }] },
    exclusiveSkills: ['sf_arcane', 'sf_manaSurge', 'sf_arcaneStorm'],
    ultimate: { id: 'ut_staff', name: '🪄 奥术洪流', faction: 'staff', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '奥术能量完全释放，魔力洪流席卷一切',
      effects: [{ stat: 'magicCharge', op: 'multiply', value: 3.0 }, { stat: 'magicBurstDamage', op: 'multiply', value: 2.0 }, { stat: 'magicChain', op: 'set', value: true }],
      visualColor: '#6a1b9a', visualType: 'holy' }
  },
  bow: {
    corePassive: { effects: [{ stat: 'bowVolleyCount', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['bw_rapid', 'bw_rain', 'bw_barrage'],
    ultimate: { id: 'ut_bow', name: '🏹 流星箭雨', faction: 'bow', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '万箭齐发，如流星坠落',
      effects: [{ stat: 'bowVolleyCount', op: 'multiply', value: 3.0 }, { stat: 'bowRangeBonus', op: 'multiply', value: 1.0 }, { stat: 'bowRainDamage', op: 'set', value: 0.8 }],
      visualColor: '#2e7d32', visualType: 'lightning' }
  },
  wolf: {
    corePassive: { effects: [{ stat: 'wolfPackAttack', op: 'add', value: 0.06 }, { stat: 'speed', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['wf_howl', 'wf_pack', 'wf_hunt'],
    ultimate: { id: 'ut_wolf', name: '🐺 狼神降世', faction: 'wolf', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '狼神之力附体，族群共战',
      effects: [{ stat: 'wolfPackAttack', op: 'add', value: 0.3 }, { stat: 'wolfSummonCount', op: 'set', value: 2 }, { stat: 'wolfPackRadius', op: 'multiply', value: 1.5 }],
      visualColor: '#5d4037', visualType: 'fire' }
  },
  bear: {
    corePassive: { effects: [{ stat: 'bearFortify', op: 'add', value: 0.06 }, { stat: 'maxHp', op: 'multiply', value: 0.1 }] },
    exclusiveSkills: ['br_roar', 'br_hibernate', 'br_maul'],
    ultimate: { id: 'ut_bear', name: '🐻 熊王之力', faction: 'bear', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '熊王觉醒，不动如山',
      effects: [{ stat: 'bearFortify', op: 'add', value: 0.3 }, { stat: 'maxHp', op: 'multiply', value: 0.5 }, { stat: 'bearRegen', op: 'set', value: 0.02 }],
      visualColor: '#3e2723', visualType: 'fire' }
  },
  eagle: {
    corePassive: { effects: [{ stat: 'eagleSwoopDamage', op: 'add', value: 0.15 }, { stat: 'eagleSwoopRange', op: 'add', value: 20 }] },
    exclusiveSkills: ['eg_dive', 'eg_keen', 'eg_storm'],
    ultimate: { id: 'ut_eagle', name: '🦅 鹰击长空', faction: 'eagle', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '雄鹰展翅，俯瞰万物',
      effects: [{ stat: 'eagleSwoopDamage', op: 'multiply', value: 2.0 }, { stat: 'eagleSwoopRange', op: 'multiply', value: 1.5 }, { stat: 'eagleAerialCrit', op: 'set', value: 1.0 }],
      visualColor: '#0d47a1', visualType: 'lightning' }
  },
  snake: {
    corePassive: { effects: [{ stat: 'snakeVenomDamage', op: 'add', value: 3 }, { stat: 'snakeVenomDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['sa_coil', 'sa_venomFang', 'sa_serpent'],
    ultimate: { id: 'ut_snake', name: '🐍 蛇影缠身', faction: 'snake', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '万蛇缠绕，毒噬一切',
      effects: [{ stat: 'snakeVenomDamage', op: 'multiply', value: 2.0 }, { stat: 'snakeVenomDuration', op: 'multiply', value: 2.0 }, { stat: 'snakeVenomSpread', op: 'set', value: true }],
      visualColor: '#1b5e20', visualType: 'poison' }
  },
  lion: {
    corePassive: { effects: [{ stat: 'lionAuraDamage', op: 'add', value: 0.08 }, { stat: 'lionAuraRadius', op: 'add', value: 30 }] },
    exclusiveSkills: ['li_majesty', 'li_pride', 'li_territory'],
    ultimate: { id: 'ut_lion', name: '🦁 狮王领域', faction: 'lion', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '狮王领域展开，万兽臣服',
      effects: [{ stat: 'lionAuraDamage', op: 'multiply', value: 2.0 }, { stat: 'lionAuraRadius', op: 'multiply', value: 1.5 }, { stat: 'lionAuraFear', op: 'set', value: 0.3 }],
      visualColor: '#f9a825', visualType: 'fire' }
  },
  tiger: {
    corePassive: { effects: [{ stat: 'tigerPounceDamage', op: 'add', value: 0.2 }, { stat: 'tigerPounceRange', op: 'add', value: 15 }] },
    exclusiveSkills: ['ti_pounce', 'ti_fury', 'ti_stalk'],
    ultimate: { id: 'ut_tiger', name: '🐯 猛虎下山', faction: 'tiger', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '猛虎出山，势不可挡',
      effects: [{ stat: 'tigerPounceDamage', op: 'multiply', value: 2.0 }, { stat: 'tigerPounceRange', op: 'multiply', value: 2.0 }, { stat: 'tigerBerserk', op: 'set', value: { speed: 0.4, attackSpeed: -0.3 } }],
      visualColor: '#e65100', visualType: 'fire' }
  },
  fox: {
    corePassive: { effects: [{ stat: 'foxDodgeChance', op: 'add', value: 0.03 }, { stat: 'foxTrickDamage', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['fx_trick', 'fx_evade', 'fx_willowisp'],
    ultimate: { id: 'ut_fox', name: '🦊 狐火燎原', faction: 'fox', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '狐火漫天，灵巧致命',
      effects: [{ stat: 'foxDodgeChance', op: 'add', value: 0.15 }, { stat: 'foxTrickDamage', op: 'multiply', value: 2.0 }, { stat: 'foxAfterimage', op: 'set', value: true }],
      visualColor: '#880e4f', visualType: 'poison' }
  },
  crane: {
    corePassive: { effects: [{ stat: 'craneDanceChance', op: 'add', value: 0.04 }, { stat: 'craneDanceDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['cn_glide', 'cn_wing', 'cn_tranquility'],
    ultimate: { id: 'ut_crane', name: '🕊️ 千鹤翔天', faction: 'crane', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '千鹤齐飞，舞动苍穹',
      effects: [{ stat: 'craneDanceChance', op: 'add', value: 0.2 }, { stat: 'craneDanceDuration', op: 'multiply', value: 2.0 }, { stat: 'craneDanceHeal', op: 'set', value: 3 }],
      visualColor: '#006064', visualType: 'ice' }
  },
  dragon: {
    corePassive: { effects: [{ stat: 'dragonBreathDamage', op: 'add', value: 5 }, { stat: 'dragonBreathRadius', op: 'add', value: 20 }] },
    exclusiveSkills: ['dr_breath', 'dr_scales', 'dr_ascend'],
    ultimate: { id: 'ut_dragon', name: '🐉 龙神天降', faction: 'dragon', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '神龙降世，毁天灭地',
      effects: [{ stat: 'dragonBreathDamage', op: 'multiply', value: 2.0 }, { stat: 'dragonBreathRadius', op: 'multiply', value: 1.5 }, { stat: 'dragonMight', op: 'set', value: { damage: 1.5, defense: 0.3 } }],
      visualColor: '#283593', visualType: 'fire' }
  },
  phoenix: {
    corePassive: { effects: [{ stat: 'phoenixFireDamage', op: 'add', value: 5 }, { stat: 'phoenixRebirthHp', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['px_flame', 'px_rebirth', 'px_inferno'],
    ultimate: { id: 'ut_phoenix', name: '🌅 凤凰涅槃', faction: 'phoenix', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '凤凰浴火，九转重生',
      effects: [{ stat: 'phoenixFireDamage', op: 'multiply', value: 2.0 }, { stat: 'phoenixRebirthHp', op: 'add', value: 0.5 }, { stat: 'phoenixAura', op: 'set', value: { damage: 30, radius: 200 } }],
      visualColor: '#b71c1c', visualType: 'fire' }
  },
  dream: {
    corePassive: { effects: [{ stat: 'dreamConfuseChance', op: 'add', value: 0.05 }, { stat: 'dreamConfuseDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['dm_sleep', 'dm_nightmare', 'dm_illusion'],
    ultimate: { id: 'ut_dream', name: '💭 梦境之主', faction: 'dream', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '梦境与现实交织，万物沉睡',
      effects: [{ stat: 'dreamConfuseChance', op: 'add', value: 0.3 }, { stat: 'dreamConfuseDuration', op: 'multiply', value: 2.0 }, { stat: 'dreamMassSleep', op: 'set', value: { radius: 300, duration: 3000 } }],
      visualColor: '#7b1fa2', visualType: 'holy' }
  },
  nightmare: {
    corePassive: { effects: [{ stat: 'nightmareFearChance', op: 'add', value: 0.04 }, { stat: 'nightmareFearDuration', op: 'add', value: 300 }] },
    exclusiveSkills: ['nm_terror', 'nm_haunt', 'nm_abyss'],
    ultimate: { id: 'ut_nightmare', name: '🌘 永夜梦魇', faction: 'nightmare', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '永夜降临，恐惧吞噬灵魂',
      effects: [{ stat: 'nightmareFearChance', op: 'add', value: 0.25 }, { stat: 'nightmareFearDuration', op: 'multiply', value: 2.0 }, { stat: 'nightmareAura', op: 'set', value: { fear: 0.2, radius: 250 } }],
      visualColor: '#4a148c', visualType: 'poison' }
  },
  fate: {
    corePassive: { effects: [{ stat: 'fateMarkChance', op: 'add', value: 0.1 }, { stat: 'fateMarkBonus', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['ft_weave', 'ft_inevitable', 'ft_redemption'],
    ultimate: { id: 'ut_fate', name: '🎴 命运之轮', faction: 'fate', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '命运之轮转动，万物皆定',
      effects: [{ stat: 'fateMarkChance', op: 'set', value: 1.0 }, { stat: 'fateMarkBonus', op: 'multiply', value: 2.0 }, { stat: 'fateReversal', op: 'set', value: true }],
      visualColor: '#33691e', visualType: 'holy' }
  },
  destiny: {
    corePassive: { effects: [{ stat: 'destinyBuffChance', op: 'add', value: 0.08 }, { stat: 'destinyBuffAmount', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['dy_bless', 'dy_vision', 'dy_manifest'],
    ultimate: { id: 'ut_destiny', name: '✨ 天命所归', faction: 'destiny', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '天命之子的终极觉醒',
      effects: [{ stat: 'destinyBuffChance', op: 'add', value: 0.4 }, { stat: 'destinyBuffAmount', op: 'multiply', value: 2.0 }, { stat: 'destinyAllBuff', op: 'set', value: true }],
      visualColor: '#e040fb', visualType: 'holy' }
  },
  karma: {
    corePassive: { effects: [{ stat: 'karmaReflect', op: 'add', value: 0.05 }, { stat: 'karmaStackBonus', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['km_retribution', 'km_balance', 'km_cycle'],
    ultimate: { id: 'ut_karma', name: '☯️ 因果报应', faction: 'karma', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '善恶终有报，天道好轮回',
      effects: [{ stat: 'karmaReflect', op: 'multiply', value: 2.0 }, { stat: 'karmaStackBonus', op: 'multiply', value: 2.0 }, { stat: 'karmaFinalJudgment', op: 'set', value: { damage: 200, radius: 300 } }],
      visualColor: '#1de9b6', visualType: 'holy' }
  },
  order: {
    corePassive: { effects: [{ stat: 'orderRuneCount', op: 'add', value: 1 }, { stat: 'orderRuneDamage', op: 'add', value: 5 }] },
    exclusiveSkills: ['or_law', 'or_discipline', 'or_sanction'],
    ultimate: { id: 'ut_order', name: '⚖️ 绝对秩序', faction: 'order', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '秩序法则绝对化，掌控战场规律',
      effects: [{ stat: 'orderRuneCount', op: 'multiply', value: 2.0 }, { stat: 'orderRuneDamage', op: 'multiply', value: 2.0 }, { stat: 'orderEnemySlow', op: 'set', value: 0.5 }],
      visualColor: '#1565c0', visualType: 'holy' }
  },
  truth: {
    corePassive: { effects: [{ stat: 'trueSightChance', op: 'add', value: 0.06 }, { stat: 'trueDamageBonus', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['tr_reveal', 'tr_pierce', 'tr_judgment'],
    ultimate: { id: 'ut_truth', name: '👁️ 真实之眼', faction: 'truth', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '洞悉一切真实，无视所有虚妄',
      effects: [{ stat: 'trueSightChance', op: 'add', value: 0.4 }, { stat: 'trueDamageBonus', op: 'multiply', value: 2.0 }, { stat: 'trueSightAll', op: 'set', value: true }],
      visualColor: '#00acc1', visualType: 'holy' }
  },
  lies: {
    corePassive: { effects: [{ stat: 'liesDeceiveChance', op: 'add', value: 0.08 }, { stat: 'liesDeceiveDamage', op: 'add', value: 0.15 }] },
    exclusiveSkills: ['le_mirage', 'le_betray', 'le_puppet'],
    ultimate: { id: 'ut_lies', name: '🕸️ 谎言之网', faction: 'lies', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '谎言编织成网，迷惑众生',
      effects: [{ stat: 'liesDeceiveChance', op: 'add', value: 0.3 }, { stat: 'liesDeceiveDamage', op: 'multiply', value: 2.0 }, { stat: 'liesDuplicate', op: 'set', value: 0.5 }],
      visualColor: '#8e24aa', visualType: 'poison' }
  },
  forest: {
    corePassive: { effects: [{ stat: 'forestRegen', op: 'add', value: 0.003 }, { stat: 'forestThornDamage', op: 'add', value: 0.08 }] },
    exclusiveSkills: ['fo_growth', 'fo_bramble', 'fo_entangle'],
    ultimate: { id: 'ut_forest', name: '🌲 森罗万象', faction: 'forest', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '森林之力觉醒，万物生长不息',
      effects: [{ stat: 'forestRegen', op: 'multiply', value: 2.0 }, { stat: 'forestThornDamage', op: 'multiply', value: 2.0 }, { stat: 'forestAura', op: 'set', value: { heal: 5, damage: 10, radius: 200 } }],
      visualColor: '#004d40', visualType: 'poison' }
  },
  mountain: {
    corePassive: { effects: [{ stat: 'mountainDefense', op: 'add', value: 0.08 }, { stat: 'mountainCrush', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['mo_stone', 'mo_bulwark', 'mo_landslide'],
    ultimate: { id: 'ut_mountain', name: '⛰️ 不动明王', faction: 'mountain', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '如山岳般巍峨，不可撼动',
      effects: [{ stat: 'mountainDefense', op: 'multiply', value: 2.0 }, { stat: 'maxHp', op: 'multiply', value: 0.5 }, { stat: 'mountainAvalanche', op: 'set', value: { damage: 150, radius: 350 } }],
      visualColor: '#37474f', visualType: 'fire' }
  },
  river: {
    corePassive: { effects: [{ stat: 'riverFlowStack', op: 'add', value: 1 }, { stat: 'riverFlowBonus', op: 'add', value: 0.02 }] },
    exclusiveSkills: ['rv_current', 'rv_rapids', 'rv_deluge'],
    ultimate: { id: 'ut_river', name: '🏞️ 川流不息', faction: 'river', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '川流长存，连绵不绝',
      effects: [{ stat: 'riverFlowStack', op: 'multiply', value: 2.0 }, { stat: 'riverFlowBonus', op: 'multiply', value: 2.0 }, { stat: 'riverMaxStacks', op: 'set', value: 20 }],
      visualColor: '#0277bd', visualType: 'ice' }
  },
  ocean: {
    corePassive: { effects: [{ stat: 'oceanDepthDamage', op: 'add', value: 3 }, { stat: 'oceanCurrentSlow', op: 'add', value: 0.06 }] },
    exclusiveSkills: ['oc_tide', 'oc_whirlpool', 'oc_tsunami'],
    ultimate: { id: 'ut_ocean', name: '🌏 深海渊啸', faction: 'ocean', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '深海之力爆发，暗流吞噬一切',
      effects: [{ stat: 'oceanDepthDamage', op: 'multiply', value: 2.0 }, { stat: 'oceanCurrentSlow', op: 'add', value: 0.3 }, { stat: 'oceanTidalWave', op: 'set', value: { damage: 100, radius: 400, pushForce: 200 } }],
      visualColor: '#002171', visualType: 'ice' }
  },
  desert: {
    corePassive: { effects: [{ stat: 'desertScorchDamage', op: 'add', value: 3 }, { stat: 'desertThirstSlow', op: 'add', value: 0.06 }] },
    exclusiveSkills: ['de_scorch', 'de_mirage', 'de_sandstorm'],
    ultimate: { id: 'ut_desert', name: '🏜️ 炙热地狱', faction: 'desert', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '沙漠变得如同地狱般炙热',
      effects: [{ stat: 'desertScorchDamage', op: 'multiply', value: 2.0 }, { stat: 'desertThirstSlow', op: 'add', value: 0.25 }, { stat: 'desertBurnAura', op: 'set', value: { damage: 25, radius: 200 } }],
      visualColor: '#d4a574', visualType: 'fire' }
  },
  tundra: {
    corePassive: { effects: [{ stat: 'tundraFrostChance', op: 'add', value: 0.06 }, { stat: 'tundraFrostDuration', op: 'add', value: 500 }] },
    exclusiveSkills: ['tn_blizzard', 'tn_permfrost', 'tn_glacier'],
    ultimate: { id: 'ut_tundra', name: '🧊 永冻冰原', faction: 'tundra', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '极寒之力爆发，万物冰封',
      effects: [{ stat: 'tundraFrostChance', op: 'add', value: 0.3 }, { stat: 'tundraFrostDuration', op: 'multiply', value: 2.0 }, { stat: 'tundraGlacierCrush', op: 'set', value: { damage: 100, radius: 250 } }],
      visualColor: '#eceff1', visualType: 'ice' }
  },
  phantom: {
    corePassive: { effects: [{ stat: 'dodgeChance', op: 'add', value: 0.08 }, { stat: 'speed', op: 'multiply', value: 0.1 }] },
    exclusiveSkills: ['ph_ghostWalk', 'ph_afterimage', 'ph_phantomStrike'],
    ultimate: { id: 'ut_phantom', name: '👻 幻影领域', faction: 'phantom', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '完全虚化，召唤幻影大军',
      effects: [{ stat: 'dodgeChance', op: 'add', value: 0.3 }, { stat: 'phantomClones', op: 'set', value: 5 }, { stat: 'invincibleDuration', op: 'set', value: 4000 }],
      visualColor: '#88ccff', visualType: 'holy' }
  },
  chain: {
    corePassive: { effects: [{ stat: 'chainCount', op: 'add', value: 1 }, { stat: 'chainDamage', op: 'multiply', value: 0.15 }] },
    exclusiveSkills: ['ch_arcJump', 'ch_conductive', 'ch_cascade'],
    ultimate: { id: 'ut_chain', name: '⛓️ 无限连锁', faction: 'chain', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '连锁跳跃无限次',
      effects: [{ stat: 'chainCount', op: 'set', value: 99 }, { stat: 'chainDamage', op: 'multiply', value: 0.5 }, { stat: 'chainRange', op: 'multiply', value: 2.0 }],
      visualColor: '#ffdd44', visualType: 'lightning' }
  },
  decay: {
    corePassive: { effects: [{ stat: 'decayRate', op: 'add', value: 0.02 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['dc_radioactive', 'dc_contagious', 'dc_criticalMass'],
    ultimate: { id: 'ut_decay', name: '☢️ 核子寒冬', faction: 'decay', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '全场辐射降临',
      effects: [{ stat: 'decayRate', op: 'multiply', value: 2.0 }, { stat: 'decaySpread', op: 'set', value: true }, { stat: 'enemySlow', op: 'set', value: 0.4 }],
      visualColor: '#88ff44', visualType: 'poison' }
  },
  crystal: {
    corePassive: { effects: [{ stat: 'crystalShards', op: 'add', value: 1 }, { stat: 'critRate', op: 'add', value: 0.03 }] },
    exclusiveSkills: ['cr_crystalGrowth', 'cr_shatterStorm', 'cr_prism'],
    ultimate: { id: 'ut_crystal', name: '💎 钻石风暴', faction: 'crystal', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '全场结晶引爆',
      effects: [{ stat: 'crystalShards', op: 'add', value: 5 }, { stat: 'shatterDamage', op: 'multiply', value: 2.0 }, { stat: 'critRate', op: 'add', value: 0.15 }],
      visualColor: '#dd88ff', visualType: 'holy' }
  },
  momentum: {
    corePassive: { effects: [{ stat: 'speed', op: 'multiply', value: 0.12 }, { stat: 'momentumRate', op: 'add', value: 0.02 }] },
    exclusiveSkills: ['mm_inertial', 'mm_wake', 'mm_terminal'],
    ultimate: { id: 'ut_momentum', name: '⚡ 相对论冲击', faction: 'momentum', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '突破速度极限',
      effects: [{ stat: 'speed', op: 'multiply', value: 0.5 }, { stat: 'pierceCount', op: 'set', value: 99 }, { stat: 'momentumRate', op: 'multiply', value: 3.0 }],
      visualColor: '#44eeff', visualType: 'lightning' }
  },
  pact: {
    corePassive: { effects: [{ stat: 'maxContracts', op: 'add', value: 1 }, { stat: 'contractDamage', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['pa_deathContract', 'pa_punishment', 'pa_network'],
    ultimate: { id: 'ut_pact', name: '📜 灵魂收割', faction: 'pact', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '全场契约收割',
      effects: [{ stat: 'maxContracts', op: 'set', value: 99 }, { stat: 'contractDamage', op: 'multiply', value: 2.0 }, { stat: 'healOnKill', op: 'add', value: 20 }],
      visualColor: '#ff4466', visualType: 'fire' }
  },
  dream: {
    corePassive: { effects: [{ stat: 'sleepChance', op: 'add', value: 0.05 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['dr_lullaby', 'dr_nightTerror', 'dr_confusion'],
    ultimate: { id: 'ut_dream', name: '🌙 永恒沉睡', faction: 'dream', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '全场坠入梦境',
      effects: [{ stat: 'sleepChance', op: 'set', value: 1.0 }, { stat: 'damageBonus', op: 'add', value: 1.0 }, { stat: 'sleepDuration', op: 'multiply', value: 2.0 }],
      visualColor: '#9988ee', visualType: 'holy' }
  },
  forge: {
    corePassive: { effects: [{ stat: 'forgeStacksMax', op: 'add', value: 1 }, { stat: 'attack', op: 'multiply', value: 0.05 }] },
    exclusiveSkills: ['fg_battleTemper', 'fg_flameQuench', 'fg_forgeMaster'],
    ultimate: { id: 'ut_forge', name: '🔨 神匠武库', faction: 'forge', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '瞬间满炉全属性提升',
      effects: [{ stat: 'attack', op: 'multiply', value: 0.3 }, { stat: 'attackSpeed', op: 'multiply', value: -0.3 }, { stat: 'critRate', op: 'add', value: 0.15 }],
      visualColor: '#ff9944', visualType: 'fire' }
  },
  rebound: {
    corePassive: { effects: [{ stat: 'bounceCount', op: 'add', value: 1 }, { stat: 'bounceRetention', op: 'add', value: 0.1 }] },
    exclusiveSkills: ['rb_ricochet', 'rb_pinball', 'rb_split'],
    ultimate: { id: 'ut_rebound', name: '↩️ 弹射地狱', faction: 'rebound', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '无限弹射越弹越强',
      effects: [{ stat: 'bounceCount', op: 'set', value: 99 }, { stat: 'bounceRetention', op: 'set', value: 1.5 }, { stat: 'splitBounce', op: 'set', value: 3 }],
      visualColor: '#55eebb', visualType: 'holy' }
  },
  shroud: {
    corePassive: { effects: [{ stat: 'shroudRadius', op: 'add', value: 30 }, { stat: 'blindChance', op: 'add', value: 0.05 }] },
    exclusiveSkills: ['sh_smokeScreen', 'sh_ambush', 'sh_chokingHaze'],
    ultimate: { id: 'ut_shroud', name: '🌫️ 全蚀之幕', faction: 'shroud', type: 'passive', rarity: 'legendary', ultimate: true,
      description: '全场浓雾致盲',
      effects: [{ stat: 'shroudRadius', op: 'set', value: 999 }, { stat: 'blindChance', op: 'set', value: 1.0 }, { stat: 'damageBonus', op: 'add', value: 0.6 }],
      visualColor: '#8877aa', visualType: 'poison' }
  }
};

// Build exclusive→faction lookup and inject ultimates into SKILLS pool
var _EXCLUSIVE_TO_FACTION = {};
(function() {
  for (var fid in FACTION_SYSTEM) {
    if (!FACTION_SYSTEM.hasOwnProperty(fid)) continue;
    var exc = FACTION_SYSTEM[fid].exclusiveSkills;
    for (var i = 0; i < exc.length; i++) {
      _EXCLUSIVE_TO_FACTION[exc[i]] = fid;
    }
    if (FACTION_SYSTEM[fid].ultimate) {
      GAME_CONFIG.SKILLS.push(FACTION_SYSTEM[fid].ultimate);
    }
  }
})();

class SkillManager {
  constructor(player) {
    this.player = player;

    // XP & level
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 0;

    // Learned skills: Map of skillId → stack count (1 = base, 2+ = stacked)
    this.learnedSkills = new Map();

    // Weapon levels: Map of weaponId → level (0 = not owned, 1-5 = owned)
    this.weaponLevels = new Map();

    // Reference to WeaponManager (set externally by main.js)
    this.weaponManager = null;

    // Active skill cooldowns: Map of skillId → remaining ms
    this.activeCooldowns = new Map();

    // Conditional skill cooldowns: Map of skillId → remaining ms
    this.conditionalCooldowns = new Map();

    // Active timed effects: array of { skillId, remaining, mods: [...], buffRecords: [...] }
    this._activeTimers = [];

    // Temporary stat buff records: array of { stat, modIndex, _tempId }
    // Used to remove temporary modifiers when they expire
    this._tempBuffs = [];

    // Level-up UI state
    this._pendingLevelUps = 0;
    this._isChoosing = false;
    this._nextTempId = 1;

    // Slot expansion system
    this.MAX_WEAPON_SLOTS = 6;
    this.MAX_PASSIVE_SLOTS = 6;
    this.weaponSlotsUnlocked = 2;   // Start with 2 weapon slots
    this.passiveSlotsUnlocked = 2;  // Start with 2 passive skill slots
    this._slotUnlockLevel = 5;      // Minimum level for passive slot expansion

    // Fusion system state
    this.fusedWeapons = new Set();   // Set of fused weapon IDs already created
    this.fusedSkills = new Set();    // Set of fused skill IDs already created
    this._pendingFusions = [];       // Array of available fusion recipes
    this.onFusionAvailable = null;   // Callback: (fusions) => {} — called when new fusion becomes available
    this.fusionCoreCount = 0;        // Number of fusion cores in inventory

    // Faction system state
    this._factionPassiveApplied = false;
    this._exclusiveSkillsLearned = {};  // factionId → [skillId, ...]
    this._ultimateUnlocked = {};        // factionId → boolean

    // Auto-apply faction passive on creation if faction already set
    if (this.player.factionId && FACTION_SYSTEM[this.player.factionId]) {
      this.applyFactionPassive();
    }

    // Link SkillManager to player for bidirectional access
    if (typeof this.player.linkSkillManager === 'function') {
      this.player.linkSkillManager(this);
    }
  }

  // ====================================================================
  //  FACTION PASSIVE
  // ====================================================================

  /**
   * Apply faction core passive (permanent stat modifiers).
   * Called once on game start when faction is set.
   */
  applyFactionPassive() {
    if (this._factionPassiveApplied) return;
    var fid = this.player.factionId;
    if (!fid) return;
    var fData = FACTION_SYSTEM[fid];
    if (!fData || !fData.corePassive) return;

    this._factionPassiveApplied = true;
    this.player.applyStatModifiers(fData.corePassive.effects);
    this._exclusiveSkillsLearned[fid] = [];
    this._ultimateUnlocked[fid] = false;

    // Visual feedback: faction-colored burst
    this._spawnFactionVisual(this.player.x, this.player.y, 'burst');
  }

  /**
   * Check if all exclusive skills for a faction are learned.
   * If so, inject the ultimate into the next skill choice.
   */
  _checkUltimateUnlock(factionId) {
    var fData = FACTION_SYSTEM[factionId];
    if (!fData || !fData.ultimate) return false;
    if (this._ultimateUnlocked[factionId]) return false;

    var excList = fData.exclusiveSkills;
    for (var i = 0; i < excList.length; i++) {
      if (!this.learnedSkills.has(excList[i])) return false;
    }
    return true;
  }

  /**
   * Spawn faction-colored visual effect.
   * @param {number} x - Origin X
   * @param {number} y - Origin Y
   * @param {string} type - 'burst' | 'aura' | 'unlock'
   */
  _spawnFactionVisual(x, y, type) {
    var fid = this.player.factionId;
    if (!fid) return;
    var faction = GAME_CONFIG.FACTIONS[fid];
    if (!faction) return;
    var color = faction.color;

    // Parse hex color
    var r = parseInt(color.slice(1, 3), 16);
    var g = parseInt(color.slice(3, 5), 16);
    var b = parseInt(color.slice(5, 7), 16);

    if (type === 'burst') {
      // Expanding ring burst
      window.game.addEntity({
        x: x, y: y, radius: 10, maxRadius: 120,
        active: true, category: 'particle', drawLayer: 4,
        _age: 0, _r: r, _g: g, _b: b,
        update: function(dt) {
          this._age += dt;
          this.radius += 300 * dt;
          if (this.radius >= this.maxRadius) { this.active = false; window.game.removeEntity(this); }
        },
        draw: function(ctx) {
          if (this.radius <= 0 || this.radius >= this.maxRadius || !isFinite(this.radius)) return;
          var alpha = 1 - (this.radius / this.maxRadius);
          ctx.save();
          ctx.strokeStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (alpha * 0.8) + ')';
          ctx.lineWidth = 3 * alpha;
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(1, Math.min(this.radius, this.maxRadius)), 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (alpha * 0.15) + ')';
          ctx.fill();
          ctx.restore();
        }
      });
      // Particle sparks
      for (var i = 0; i < 12; i++) {
        var angle = (i / 12) * Math.PI * 2;
        var spd = 100 + Math.random() * 150;
        window.game.addEntity({
          x: x, y: y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          active: true, category: 'particle', drawLayer: 4,
          _age: 0, _life: 0.6, _r: r, _g: g, _b: b,
          update: function(dt) {
            this._age += dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vx *= 0.96;
            this.vy *= 0.96;
            if (this._age >= this._life) window.game.removeEntity(this);
          },
          draw: function(ctx) {
            var alpha = 1 - (this._age / this._life);
            ctx.fillStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2 + alpha * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    } else if (type === 'unlock') {
      // Dramatic screen flash + expanding rings
      if (window.ParticleSystem) {
        ParticleSystem.screenFlash('rgba(' + r + ',' + g + ',' + b + ',0.3)', 500);
      }
      window.game.addShake(6);
      for (var ring = 0; ring < 3; ring++) {
        (function(ringIdx) {
          setTimeout(function() {
            window.game.addEntity({
              x: x, y: y, radius: 10, maxRadius: 200 + ringIdx * 80,
              active: true, category: 'particle', drawLayer: 4,
              _age: 0, _r: r, _g: g, _b: b,
              update: function(dt) {
                this._age += dt;
                this.radius += 400 * dt;
                if (this.radius >= this.maxRadius) window.game.removeEntity(this);
              },
              draw: function(ctx) {
                if (this.radius >= this.maxRadius) return;
                var alpha = 1 - (this.radius / this.maxRadius);
                ctx.save();
                ctx.strokeStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (alpha * 0.9) + ')';
                ctx.lineWidth = 4 * alpha;
                ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(1, Math.min(this.radius, this.maxRadius)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }
            });
          }, ringIdx * 150);
        })(ring);
      }
    }
  }

  /**
   * Spawn persistent ultimate aura that follows the player.
   * Visual style depends on faction's visualType.
   */
  _spawnUltimateAura() {
    var self = this;
    var fid = this.player.factionId;
    if (!fid) return;
    var faction = GAME_CONFIG.FACTIONS[fid];
    if (!faction) return;
    var color = faction.color;
    var r = parseInt(color.slice(1, 3), 16);
    var g = parseInt(color.slice(3, 5), 16);
    var b = parseInt(color.slice(5, 7), 16);
    var vType = (FACTION_SYSTEM[fid].ultimate && FACTION_SYSTEM[fid].ultimate.visualType) || 'holy';

    window.game.addEntity({
      active: true, category: 'particle', drawLayer: 4,
      _age: 0, _r: r, _g: g, _b: b, _vType: vType, _sm: self,
      update: function(dt) {
        this._age += dt;
        var p = window.game.player;
        if (!p || !p.active) { window.game.removeEntity(this); return; }
        this.x = p.x;
        this.y = p.y;
      },
      draw: function(ctx) {
        var p = window.game.player;
        if (!p) return;
        var t = this._age;
        var baseR = 28 + Math.sin(t * 3) * 6;
        ctx.save();

        if (this._vType === 'fire') {
          // Fire aura: flickering orange glow
          var flicker = 0.6 + Math.sin(t * 12) * 0.2 + Math.sin(t * 19) * 0.1;
          var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR + 10);
          grad.addColorStop(0, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (0.25 * flicker) + ')');
          grad.addColorStop(0.6, 'rgba(255,150,30,' + (0.12 * flicker) + ')');
          grad.addColorStop(1, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseR + 10, 0, Math.PI * 2);
          ctx.fill();
        } else if (this._vType === 'ice') {
          // Ice aura: crystalline blue ring
          ctx.strokeStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (0.4 + Math.sin(t * 2) * 0.15) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseR, 0, Math.PI * 2);
          ctx.stroke();
          // Frost particles
          for (var i = 0; i < 6; i++) {
            var ang = t * 1.5 + (i / 6) * Math.PI * 2;
            var px = p.x + Math.cos(ang) * (baseR + 4);
            var py = p.y + Math.sin(ang) * (baseR + 4);
            ctx.fillStyle = 'rgba(200,230,255,' + (0.5 + Math.sin(t * 4 + i) * 0.3) + ')';
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (this._vType === 'lightning') {
          // Lightning aura: yellow sparks
          ctx.strokeStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (0.3 + Math.sin(t * 8) * 0.2) + ')';
          ctx.lineWidth = 1.5;
          for (var j = 0; j < 4; j++) {
            if (Math.sin(t * 10 + j * 2.5) > 0.3) {
              var sa = (j / 4) * Math.PI * 2 + t * 2;
              ctx.beginPath();
              ctx.moveTo(p.x + Math.cos(sa) * baseR * 0.6, p.y + Math.sin(sa) * baseR * 0.6);
              ctx.lineTo(p.x + Math.cos(sa) * (baseR + 8), p.y + Math.sin(sa) * (baseR + 8));
              ctx.stroke();
            }
          }
        } else if (this._vType === 'poison') {
          // Poison aura: green bubbles
          var pAlpha = 0.3 + Math.sin(t * 2) * 0.1;
          var grad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR + 8);
          grad2.addColorStop(0, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (pAlpha * 0.5) + ')');
          grad2.addColorStop(1, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',0)');
          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseR + 8, 0, Math.PI * 2);
          ctx.fill();
          for (var k = 0; k < 4; k++) {
            var ba = t * 1.2 + k * 1.8;
            var br = baseR * 0.5 + Math.sin(t * 3 + k) * baseR * 0.3;
            var bx = p.x + Math.cos(ba) * br;
            var by = p.y + Math.sin(ba) * br;
            ctx.fillStyle = 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',0.35)';
            ctx.beginPath();
            ctx.arc(bx, by, 2 + Math.sin(t * 5 + k) * 1, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Holy/default aura: radiant glow
          var hAlpha = 0.2 + Math.sin(t * 2.5) * 0.1;
          var grad3 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR + 12);
          grad3.addColorStop(0, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',' + (hAlpha * 0.6) + ')');
          grad3.addColorStop(0.5, 'rgba(255,255,255,' + (hAlpha * 0.2) + ')');
          grad3.addColorStop(1, 'rgba(' + this._r + ',' + this._g + ',' + this._b + ',0)');
          ctx.fillStyle = grad3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseR + 12, 0, Math.PI * 2);
          ctx.fill();
          // Rotating rays
          for (var m = 0; m < 6; m++) {
            var ra = t * 1.0 + (m / 6) * Math.PI * 2;
            ctx.fillStyle = 'rgba(255,255,255,' + (0.08 + Math.sin(t * 3 + m) * 0.05) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(ra) * (baseR + 15), p.y + Math.sin(ra) * (baseR + 15));
            ctx.lineTo(p.x + Math.cos(ra + 0.15) * (baseR * 0.4), p.y + Math.sin(ra + 0.15) * (baseR * 0.4));
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      }
    });
  }

  // ====================================================================
  //  XP SYSTEM
  // ====================================================================

  /**
   * Add XP, apply multiplier, check for level-ups.
   */
  addXp(amount) {
    var mult = 1;
    if (this.player.stats && this.player.stats.xpMultiplier !== undefined) {
      mult = 1 + this.player.stats.xpMultiplier;
    }
    this.xp += amount * mult;

    // Process all level-ups
    while (this.xp >= this.xpNeeded) {
      this.levelUp();
    }
    // Show level-up choices once (all pending are accumulated)
    if (this._pendingLevelUps > 0 && !this._isChoosing) {
      this._showLevelUpChoices();
    }
  }

  /**
   * XP needed for current level → next level.
   * Reads from GAME_CONFIG.BALANCE.XP_CURVE[level], capped at last entry.
   */
  get xpNeeded() {
    var curve = GAME_CONFIG.BALANCE.XP_CURVE;
    var idx = this.level;
    if (idx < curve.length) return curve[idx];
    return curve[curve.length - 1];
  }

  /**
   * Gain a level. Deducts XP, increments level, queues UI callback.
   */
  levelUp() {
    this.xp -= this.xpNeeded;
    this.level++;
    this.skillPoints++;
    this._pendingLevelUps++;
  }

  /**
   * Show level-up skill selection (pauses game, fires callback).
   */
  _showLevelUpChoices() {
    if (this._isChoosing) return; // Prevent re-entry during choice
    this._isChoosing = true;
    window._isLevelingUp = true;
    if (this.onLevelUp) {
      this.onLevelUp(this.getSkillChoices(3));
    }
  }

  // ====================================================================
  //  SKILL SELECTION (weighted random)
  // ====================================================================

  /**
   * Get `count` random skill/weapon choices from the combined pool.
   * Weighted by rarity and faction bias (3x weight for matching faction).
   * Includes both skills (unlearned) and weapons (owned=upgrade, new=acquire).
   * @param {number} count - Number of choices (default 3)
   * @returns {Array} Array of skill/weapon config objects with _choiceType field
   */
  getSkillChoices(count) {
    count = count || 3;

    // B4/B5: Auto-upgrade duplicate weapons and skills before building choices
    // Auto-upgrade one random owned weapon (if any below max level)
    this._autoUpgradeRandomWeapon();
    // Auto-stack one random learned skill (if any)
    this._autoUpgradeRandomSkill();

    // Build pool of ALL skills (learned ones can be re-selected for stacking)
    var pool = [];
    var playerFaction = this.player.factionId;

    for (var i = 0; i < GAME_CONFIG.SKILLS.length; i++) {
      var skill = GAME_CONFIG.SKILLS[i];
      if (skill.fused) continue; // Fused skills don't appear in normal choices
      if (skill.ultimate) continue; // Ultimates handled separately below
      // Exclusive skills: only appear for matching faction
      var ownerFaction = _EXCLUSIVE_TO_FACTION[skill.id];
      if (ownerFaction && ownerFaction !== playerFaction) continue;
      var curStack = this.learnedSkills.get(skill.id) || 0;
      // Skip new passive skills when passive slots are full
      if (skill.type === 'passive' && curStack === 0 &&
          this._countEquippedPassiveSkills() >= this.passiveSlotsUnlocked) {
        continue;
      }
      pool.push({ _choiceType: 'skill', _data: skill, _stackCount: curStack });
    }

    // Check if ultimate talent should be offered
    if (playerFaction && this._checkUltimateUnlock(playerFaction)) {
      var ultSkill = FACTION_SYSTEM[playerFaction].ultimate;
      if (ultSkill) {
        var ultStack = this.learnedSkills.get(ultSkill.id) || 0;
        pool.push({ _choiceType: 'skill', _data: ultSkill, _stackCount: ultStack });
      }
    }

    // Build pool of weapons (exclude fused weapons — they're created via fusion)
    var weapons = GAME_CONFIG.WEAPONS;
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    var maxLvl = upgradeCfg ? upgradeCfg.maxLevel : 5;
    var wm = this.weaponManager;
    var hasEmptySlot = wm && wm.weaponSlots ? wm.weaponSlots.some(function(s) { return !s; }) : true;
    for (var wid in weapons) {
      if (!weapons.hasOwnProperty(wid)) continue;
      var w = weapons[wid];
      if (w.fused) continue; // Fused weapons don't appear in normal choices
      var curLvl = this.weaponLevels.get(wid) || 0;
      if (curLvl >= maxLvl) continue; // Already max level, skip
      // If weapon is not yet owned, only offer it when a slot is available
      if (curLvl === 0 && !hasEmptySlot) continue;
      // Create a weapon choice entry
      var wChoice = {
        _choiceType: 'weapon',
        _data: w,
        _weaponId: wid,
        _currentLevel: curLvl,
        _nextLevel: curLvl + 1,
        _hasEmptySlot: hasEmptySlot,
      };
      pool.push(wChoice);
    }

    // --- Slot expansion choices ---
    // Count empty weapon slots
    var emptyWeaponSlots = this.MAX_WEAPON_SLOTS - this.weaponSlotsUnlocked;
    // Count empty passive slots (only if level >= _slotUnlockLevel)
    var emptyPassiveSlots = (this.level >= this._slotUnlockLevel)
      ? this.MAX_PASSIVE_SLOTS - this.passiveSlotsUnlocked
      : 0;

    if (emptyWeaponSlots > 0) {
      pool.push({
        _choiceType: 'slot',
        _slotType: 'weapon',
        _data: {
          icon: '🔫',
          name: '新武器槽',
          rarity: 'rare',
          description: '增加一个武器槽位 (' + this.weaponSlotsUnlocked + '/' + this.MAX_WEAPON_SLOTS + ')'
        }
      });
    }
    if (emptyPassiveSlots > 0) {
      pool.push({
        _choiceType: 'slot',
        _slotType: 'passive',
        _data: {
          icon: '🛡️',
          name: '新被动槽',
          rarity: 'rare',
          description: '增加一个被动槽位 (' + this.passiveSlotsUnlocked + '/' + this.MAX_PASSIVE_SLOTS + ')'
        }
      });
    }

    // Nothing left to choose
    if (pool.length === 0) return [];
    // Clamp count to pool size
    if (count > pool.length) count = pool.length;

    var factionId = this.player.factionId;
    var choices = [];

    for (var c = 0; c < count; c++) {
      // Calculate weights
      var totalWeight = 0;
      var weightedList = [];
      for (var j = 0; j < pool.length; j++) {
        var item = pool[j];
        var d = item._data;
        var weight = GAME_CONFIG.RARITY_WEIGHTS[d.rarity] || 1;
        // Faction bias: 3x weight for matching faction skills (only for skills)
        if (item._choiceType === 'skill' && d.faction === factionId) {
          weight *= 3;
        }
        // Faction signature weapons: 2.5x weight for thematic weapons
        if (item._choiceType === 'weapon' && factionId && GAME_CONFIG.FACTION_SIGNATURE_WEAPONS) {
          var sigList = GAME_CONFIG.FACTION_SIGNATURE_WEAPONS[factionId];
          if (sigList && sigList.indexOf(item._weaponId) >= 0) {
            weight *= 2.5;
          }
        }
        // Weapon upgrade: slight weight boost for already-owned weapons (encourage upgrading)
        if (item._choiceType === 'weapon' && item._currentLevel > 0) {
          weight *= 1.5;
        }
        // Slot choices: high priority when slots are empty (weight = emptySlots * 20)
        if (item._choiceType === 'slot') {
          var emptyCount = (item._slotType === 'weapon')
            ? (this.MAX_WEAPON_SLOTS - this.weaponSlotsUnlocked)
            : (this.MAX_PASSIVE_SLOTS - this.passiveSlotsUnlocked);
          weight = Math.max(10, emptyCount * 20);
        }
        totalWeight += weight;
        weightedList.push({ item: item, weight: weight, cumulative: totalWeight });
      }

      // Weighted random pick
      var roll = Math.random() * totalWeight;
      var picked = null;
      var pickedIdx = -1;
      for (var k = 0; k < weightedList.length; k++) {
        if (roll < weightedList[k].cumulative) {
          picked = weightedList[k].item;
          pickedIdx = k;
          break;
        }
      }
      // Fallback (shouldn't happen)
      if (!picked) {
        picked = pool[pool.length - 1];
        pickedIdx = pool.length - 1;
      }

      choices.push(picked);
      // Remove from pool to avoid duplicate choices
      pool.splice(pickedIdx, 1);
      if (pool.length === 0) break;
    }

    return choices;
  }

  _countEquippedPassiveSkills() {
    var count = 0;
    var self = this;
    this.learnedSkills.forEach(function(stack, skillId) {
      var sk = self._findSkill(skillId);
      if (sk && sk.type === 'passive' && stack > 0) count++;
    });
    return count;
  }

  // ====================================================================
  //  LEARN SKILL
  // ====================================================================

  /**
   * Learn a skill by ID. Apply passive effects, register active cooldowns,
   * or set up conditional triggers.
   */
  learnSkill(skillId) {
    var skill = this._findSkill(skillId);
    if (!skill) return;

    // Track stack count: increment if already learned, start at 1 if new
    var prevCount = this.learnedSkills.get(skillId) || 0;

    // Enforce passive skill slot limit for new passives
    if (skill.type === 'passive' && prevCount === 0) {
      var passiveCount = this._countEquippedPassiveSkills();
      if (passiveCount >= this.passiveSlotsUnlocked) {
        if (window.ui) {
          window.ui.showToast('🛡️ 被动槽已满 (' + passiveCount + '/' + this.passiveSlotsUnlocked + ')', 2000, '#ffaa00');
        }
        return;
      }
    }

    this.learnedSkills.set(skillId, prevCount + 1);
    if (window.UpgradeTrack) UpgradeTrack.increment('skills', skillId);

    switch (skill.type) {
      case 'passive':
        // Apply stat modifiers from effects array (re-apply for each stack)
        this.player.applyStatModifiers(skill.effects);
        break;
      case 'active':
        // Register cooldown tracking; fires automatically when ready
        if (prevCount === 0) {
          this.activeCooldowns.set(skillId, 0);
        }
        break;
      case 'conditional':
        // Conditional skills are handled by trigger methods (onKill, onHit, etc.)
        // Register cooldown if skill has one (only on first learn)
        if (skill.cooldown && prevCount === 0) {
          this.conditionalCooldowns.set(skillId, 0);
        }
        break;
    }

    // Check for available fusions after learning a skill
    var availableFusions = this.checkFusions();
    if (availableFusions.length > 0 && this.onFusionAvailable) {
      this.onFusionAvailable(availableFusions);
    }

    // Track exclusive skill learning and check ultimate unlock
    var fid = this.player.factionId;
    if (fid && FACTION_SYSTEM[fid]) {
      var ownerFaction = _EXCLUSIVE_TO_FACTION[skillId];
      if (ownerFaction === fid) {
        if (!this._exclusiveSkillsLearned[fid]) this._exclusiveSkillsLearned[fid] = [];
        if (this._exclusiveSkillsLearned[fid].indexOf(skillId) === -1) {
          this._exclusiveSkillsLearned[fid].push(skillId);
          // Visual feedback for exclusive skill acquisition
          this._spawnFactionVisual(this.player.x, this.player.y, 'burst');
        }
        // Check if all 3 exclusives learned → unlock ultimate
        if (this._checkUltimateUnlock(fid) && !this._ultimateUnlocked[fid]) {
          this._ultimateUnlocked[fid] = true;
          // Dramatic unlock visual
          this._spawnFactionVisual(this.player.x, this.player.y, 'unlock');
          if (window.ui) {
            var ult = FACTION_SYSTEM[fid].ultimate;
            window.ui.showToast('🌟 终极天赋解锁: ' + ult.name, 3000, ult.visualColor || '#ffaa00');
          }
        }
      }
      // If ultimate itself was learned, apply aura visual
      var ultData = FACTION_SYSTEM[fid].ultimate;
      if (ultData && skillId === ultData.id) {
        this._spawnUltimateAura();
      }
    }

    this._pendingLevelUps--;
    if (this._pendingLevelUps > 0) {
      // More level-ups pending: show next set of choices
      this._isChoosing = false; // Reset before recursive call
      this._showLevelUpChoices();
    } else {
      this._isChoosing = false;
      window._isLevelingUp = false;
      if (window.game) window.game.resume();
    }
  }

  // ====================================================================
  //  WEAPON SELECTION & UPGRADE
  // ====================================================================

  /**
   * Select or upgrade a weapon by ID.
   * If weapon is new: find first empty slot in weaponManager.weaponSlots, assign it there.
   *   If all slots full, auto-replace slot 0 with a warning.
   * If weapon is already owned: upgrade its level (up to max) in its current slot.
   * @param {string} weaponId - key in GAME_CONFIG.WEAPONS
   */
  selectWeapon(weaponId) {
    var wCfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!wCfg) return;

    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    var maxLvl = upgradeCfg ? upgradeCfg.maxLevel : 5;
    var curLvl = this.weaponLevels.get(weaponId) || 0;
    var isNew = curLvl === 0;

    // Level or acquire
    if (curLvl < maxLvl) {
      curLvl++;
      this.weaponLevels.set(weaponId, curLvl);
      if (window.UpgradeTrack) UpgradeTrack.increment('weapons', weaponId);
    }

    // Slot management via WeaponManager
    if (this.weaponManager) {
      var wmSlots = this.weaponManager.weaponSlots;

      if (isNew) {
        // New weapon: find first empty slot or replace slot 0
        var slotIdx = -1;
        for (var i = 0; i < wmSlots.length; i++) {
          if (!wmSlots[i]) { slotIdx = i; break; }
        }
        if (slotIdx === -1) {
          // All slots full — auto-replace slot 0
          slotIdx = 0;
          var replacedId = wmSlots[slotIdx] ? wmSlots[slotIdx].weaponId : null;
          this.weaponManager.removeWeaponFromSlot(0);
          this.weaponManager.addWeaponToSlot(weaponId, 0);
          if (window.ui && replacedId) {
            window.ui.showToast('⚠️ 武器槽已满! ' + (GAME_CONFIG.WEAPONS[replacedId]?.name || replacedId) + ' 已被替换', 2500, '#ff6644');
          }
        } else {
          this.weaponManager.addWeaponToSlot(weaponId, slotIdx);
        }
      }

      // Sync the slot's level to match weaponLevels (source of truth for damage/fire-rate calcs)
      for (var i = 0; i < wmSlots.length; i++) {
        if (wmSlots[i] && wmSlots[i].weaponId === weaponId) {
          wmSlots[i].level = curLvl;
          break;
        }
      }

      this._applyWeaponUpgrades(weaponId);
    }

    // Show toast notification
    if (window.ui) {
      var label = upgradeCfg && upgradeCfg.descriptions ? upgradeCfg.descriptions[curLvl] : ('Lv' + curLvl);
      if (isNew) {
        window.ui.showToast(wCfg.icon + ' 获得武器: ' + wCfg.name, 2000, wCfg.bulletColor || '#ffdd00');
      } else {
        window.ui.showToast(wCfg.icon + ' ' + wCfg.name + ' 升级至 ' + label, 2000, wCfg.bulletColor || '#ffdd00');
      }
    }

    // Check for available fusions after weapon upgrade
    var availableFusions = this.checkFusions();
    if (availableFusions.length > 0 && this.onFusionAvailable) {
      this.onFusionAvailable(availableFusions);
    }

    // Handle pending level-ups (same logic as learnSkill)
    this._pendingLevelUps--;
    if (this._pendingLevelUps > 0) {
      this._isChoosing = false;
      this._showLevelUpChoices();
    } else {
      this._isChoosing = false;
      window._isLevelingUp = false;
      if (window.game) window.game.resume();
    }
  }

  // ====================================================================
  //  B4/B5: AUTO-UPGRADE DUPLICATE WEAPONS &amp; SKILLS
  // ====================================================================
  //  B4/B5: AUTO-UPGRADE DUPLICATE WEAPONS & SKILLS
  // ====================================================================

  /**
   * Auto-upgrade one random owned weapon that is below max level.
   * Called during getSkillChoices(). B4 requirement.
   * Uses lightweight upgrade (does NOT trigger level-up UI flow).
   */
  _autoUpgradeRandomWeapon() {
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    var maxLvl = upgradeCfg ? upgradeCfg.maxLevel : 5;

    // Collect all owned weapons below max level that are NOT fused and currently equipped
    var candidates = [];
    var weapons = GAME_CONFIG.WEAPONS;
    var wmSlots = this.weaponManager ? this.weaponManager.weaponSlots : null;
    for (var wid in weapons) {
      if (!weapons.hasOwnProperty(wid)) continue;
      var w = weapons[wid];
      if (w.fused) continue;
      var curLvl = this.weaponLevels.get(wid) || 0;
      if (curLvl > 0 && curLvl < maxLvl) {
        // Only auto-upgrade weapons that are currently in a slot
        if (wmSlots) {
          var inSlot = false;
          for (var i = 0; i < wmSlots.length; i++) {
            if (wmSlots[i] && wmSlots[i].weaponId === wid) { inSlot = true; break; }
          }
          if (!inSlot) continue;
        }
        candidates.push(wid);
      }
    }

    if (candidates.length === 0) return;

    // Pick one random candidate and upgrade it (no UI flow triggers)
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    var wCfg = GAME_CONFIG.WEAPONS[pick];
    var curLvl = this.weaponLevels.get(pick) || 0;
    var newLvl = curLvl + 1;

    this.weaponLevels.set(pick, newLvl);

    // Sync slot level
    if (wmSlots) {
      for (var i = 0; i < wmSlots.length; i++) {
        if (wmSlots[i] && wmSlots[i].weaponId === pick) {
          wmSlots[i].level = newLvl;
          break;
        }
      }
    }

    // B4: Toast
    var label = upgradeCfg && upgradeCfg.descriptions ? upgradeCfg.descriptions[newLvl] : ('Lv' + newLvl);
    if (window.ui) {
      window.ui.showToast('⚔️ ' + (wCfg ? wCfg.name : pick) + ' 自动升级至 ' + label, 2000, (wCfg ? wCfg.bulletColor : '#ffdd00'));
    }
  }

  /**
   * Auto-stack one random learned skill (if any).
   * Called during getSkillChoices(). B5 requirement.
   * Uses lightweight stack (does NOT trigger level-up UI flow).
   */
  _autoUpgradeRandomSkill() {
    var candidates = [];
    var learnedEntries = Array.from(this.learnedSkills.entries());
    for (var i = 0; i < learnedEntries.length; i++) {
      var skillId = learnedEntries[i][0];
      var skill = this._findSkill(skillId);
      if (!skill || skill.fused || skill.ultimate) continue;
      candidates.push(skillId);
    }

    if (candidates.length === 0) return;

    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    var stackCount = (this.learnedSkills.get(pick) || 0) + 1;
    this.learnedSkills.set(pick, stackCount);

    // Re-apply passive effects
    var skill = this._findSkill(pick);
    if (skill && skill.type === 'passive') {
      this.player.applyStatModifiers(skill.effects);
    }

    // B5: Toast
    if (window.ui) {
      var skillName = skill ? skill.name : pick;
      window.ui.showToast('✨ ' + skillName + ' 自动堆叠至 Lv' + stackCount, 2000, '#ffaa44');
    }
  }

  // ====================================================================
  //  SLOT EXPANSION
  // ====================================================================

  /**
   * Assign a new weapon or passive slot.
   * Called when player selects a slot expansion card in the level-up choices.
   * @param {string} slotType - 'weapon' or 'passive'
   */
  _assignSlot(slotType) {
    if (slotType === 'weapon') {
      if (this.weaponSlotsUnlocked >= this.MAX_WEAPON_SLOTS) return;
      this.weaponSlotsUnlocked++;
      if (this.weaponManager) {
        this.weaponManager.maxWeaponSlots = this.weaponSlotsUnlocked;
      }
      if (window.ui) {
        window.ui.showToast('🔫 新武器槽已解锁 (' + this.weaponSlotsUnlocked + '/' + this.MAX_WEAPON_SLOTS + ')', 2000, '#ffdd44');
      }
    } else if (slotType === 'passive') {
      if (this.passiveSlotsUnlocked >= this.MAX_PASSIVE_SLOTS) return;
      this.passiveSlotsUnlocked++;
      if (this.weaponManager) this.weaponManager.maxPassiveSlots = this.passiveSlotsUnlocked;
      if (window.ui) {
        window.ui.showToast('🛡️ 新被动槽已解锁 (' + this.passiveSlotsUnlocked + '/' + this.MAX_PASSIVE_SLOTS + ')', 2000, '#44ddff');
      }
    }

    // Handle pending level-ups (same pattern as learnSkill / selectWeapon)
    this._pendingLevelUps--;
    if (this._pendingLevelUps > 0) {
      this._isChoosing = false;
      this._showLevelUpChoices();
    } else {
      this._isChoosing = false;
      window._isLevelingUp = false;
      if (window.game) window.game.resume();
    }
  }

  /**
   * Apply weapon upgrade stat modifiers based on weapon level.
   * Modifies the weapon's effective stats by adjusting player stat modifiers.
   * @param {string} weaponId
   */
  _applyWeaponUpgrades(weaponId) {
    // Weapon upgrades are applied dynamically during fire() in weapons.js
    // via getWeaponDamageMult() and getWeaponFireRateMult() which read from here.
    // No permanent stat modifiers needed — the WeaponManager reads these methods.
  }

  /**
   * Get damage multiplier for a weapon based on its upgrade level.
   * Called by WeaponManager.fire().
   * @param {string} weaponId
   * @returns {number} damage multiplier (1.0 at base)
   */
  getWeaponDamageMult(weaponId) {
    var lvl = this.weaponLevels.get(weaponId) || 0;
    if (lvl <= 0) return 1.0;
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    if (!upgradeCfg || !upgradeCfg.damageMult) return 1.0;
    var idx = Math.min(lvl, upgradeCfg.damageMult.length - 1);
    return upgradeCfg.damageMult[idx];
  }

  /**
   * Get fire rate multiplier for a weapon based on its upgrade level.
   * Called by WeaponManager.fire(). Lower = faster.
   * @param {string} weaponId
   * @returns {number} fire rate multiplier (1.0 at base)
   */
  getWeaponFireRateMult(weaponId) {
    var lvl = this.weaponLevels.get(weaponId) || 0;
    if (lvl <= 0) return 1.0;
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    if (!upgradeCfg || !upgradeCfg.fireRateMult) return 1.0;
    var idx = Math.min(lvl, upgradeCfg.fireRateMult.length - 1);
    return upgradeCfg.fireRateMult[idx];
  }

  /**
   * Get special stat multiplier for a weapon based on its upgrade level.
   * Used for weapon-specific stats (explosion radius, chain count, etc.).
   * @param {string} weaponId
   * @returns {number} special multiplier (1.0 at base)
   */
  getWeaponSpecialMult(weaponId) {
    var lvl = this.weaponLevels.get(weaponId) || 0;
    if (lvl <= 0) return 1.0;
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    if (!upgradeCfg || !upgradeCfg.specialMult) return 1.0;
    var idx = Math.min(lvl, upgradeCfg.specialMult.length - 1);
    return upgradeCfg.specialMult[idx];
  }

  // ====================================================================
  //  FUSION SYSTEM
  // ====================================================================

  /**
   * Check all fusion recipes and return those that are now available.
   * A fusion is available when both ingredients are at the required level
   * and the fusion hasn't been completed yet.
   * Weapon fusions also require at least one fusion core.
   * @returns {Array} Array of available fusion recipe objects
   */
  checkFusions() {
    var recipes = GAME_CONFIG.FUSION_RECIPES;
    if (!recipes) return [];
    var requiredLevel = recipes.requiredLevel || 5;
    var available = [];

    // Check weapon fusions (require fusion core)
    var hasFusionCore = this.fusionCoreCount > 0;
    for (var i = 0; i < recipes.weapons.length; i++) {
      var recipe = recipes.weapons[i];
      if (this.fusedWeapons.has(recipe.id)) continue;
      var lvlA = this.weaponLevels.get(recipe.ingredientA) || 0;
      var lvlB = this.weaponLevels.get(recipe.ingredientB) || 0;
      if (lvlA >= requiredLevel && lvlB >= requiredLevel && hasFusionCore) {
        available.push({ type: 'weapon', recipe: recipe });
      }
    }

    // Check skill fusions (also require fusion core for consistency)
    for (var j = 0; j < recipes.skills.length; j++) {
      var sRecipe = recipes.skills[j];
      if (this.fusedSkills.has(sRecipe.id)) continue;
      var hasA = this.learnedSkills.has(sRecipe.ingredientA);
      var hasB = this.learnedSkills.has(sRecipe.ingredientB);
      // For skills, both must be learned and a fusion core is required
      if (hasA && hasB && hasFusionCore) {
        available.push({ type: 'skill', recipe: sRecipe });
      }
    }

    return available;
  }

  /**
   * Execute a weapon fusion: consume both ingredient weapons and a fusion core, create the fused weapon.
   * @param {object} recipe - Fusion recipe from FUSION_RECIPES.weapons
   */
  executeWeaponFusion(recipe) {
    if (this.fusedWeapons.has(recipe.id)) return false;

    // Check fusion core
    if (this.fusionCoreCount <= 0) return false;

    // Mark as fused
    this.fusedWeapons.add(recipe.id);

    // Consume one fusion core
    this.fusionCoreCount--;

    // Remove ingredient weapons from weaponLevels (they're consumed)
    this.weaponLevels.delete(recipe.ingredientA);
    this.weaponLevels.delete(recipe.ingredientB);

    // Add the fused weapon at max level
    var fusedWeaponId = recipe.result;
    this.weaponLevels.set(fusedWeaponId, GAME_CONFIG.WEAPON_UPGRADE.maxLevel || 5);

    // Remove ingredient weapons from their slots and place the fused weapon
    if (this.weaponManager) {
      var wmSlots = this.weaponManager.weaponSlots;

      // Clear ingredient weapons from their slots
      for (var i = 0; i < wmSlots.length; i++) {
        if (wmSlots[i] && (wmSlots[i].weaponId === recipe.ingredientA || wmSlots[i].weaponId === recipe.ingredientB)) {
          this.weaponManager.removeWeaponFromSlot(i);
        }
      }

      // Place fused weapon in first empty slot (or slot 0)
      var slotIdx = -1;
      for (var i = 0; i < wmSlots.length; i++) {
        if (!wmSlots[i]) { slotIdx = i; break; }
      }
      if (slotIdx === -1) slotIdx = 0;
      this.weaponManager.addWeaponToSlot(fusedWeaponId, slotIdx);

      // Sync level on the slot
      var maxLevel = GAME_CONFIG.WEAPON_UPGRADE.maxLevel || 5;
      for (var i = 0; i < wmSlots.length; i++) {
        if (wmSlots[i] && wmSlots[i].weaponId === fusedWeaponId) {
          wmSlots[i].level = maxLevel;
          break;
        }
      }
    }

    // Show toast
    if (window.ui) {
      window.ui.showToast('🔮 融合成功: ' + recipe.name + '!', 3000, '#ff44ff');
    }

    return true;
  }

  /**
   * Execute a skill fusion: mark both ingredients as fused, learn the fused skill.
   * @param {object} recipe - Fusion recipe from FUSION_RECIPES.skills
   */
  executeSkillFusion(recipe) {
    if (this.fusedSkills.has(recipe.id)) return false;

    // Check fusion core
    if (this.fusionCoreCount <= 0) return false;

    // Mark as fused
    this.fusedSkills.add(recipe.id);

    // Consume one fusion core
    this.fusionCoreCount--;

    // Check that the result skill exists in SKILLS config
    var fusedSkill = this._findSkill(recipe.result);
    if (!fusedSkill) {
      if (window.ui) {
        window.ui.showToast('⚠️ 融合技能配置缺失: ' + recipe.result, 3000, '#ff4444');
      }
      return false;
    }

    // Remove ingredient skills from learnedSkills (they're consumed)
    this.learnedSkills.delete(recipe.ingredientA);
    this.learnedSkills.delete(recipe.ingredientB);

    // Add the fused skill
    this.learnedSkills.set(recipe.result, 1);

    // Apply the fused skill's effects
    if (fusedSkill.type === 'active' && fusedSkill.cooldown) {
      this.activeCooldowns.set(recipe.result, 0);
    }

    // Show toast
    if (window.ui) {
      window.ui.showToast('✨ 融合成功: ' + recipe.name + '!', 3000, '#44ffff');
    }

    return true;
  }

  /**
   * Get all fusion recipes (for UI display / codex).
   * @returns {object} { weapons: [...], skills: [...] }
   */
  getAllFusionRecipes() {
    return GAME_CONFIG.FUSION_RECIPES || { weapons: [], skills: [] };
  }

  /**
   * Check if a specific fusion has been completed.
   * @param {string} fusionId
   * @returns {boolean}
   */
  isFusionComplete(fusionId) {
    return this.fusedWeapons.has(fusionId) || this.fusedSkills.has(fusionId);
  }

  /**
   * Add fusion cores to inventory.
   * @param {number} count - number of cores to add (default 1)
   */
  addFusionCore(count) {
    this.fusionCoreCount += (count || 1);
    // Notify player
    if (window.ui) {
      window.ui.showToast('🔮 获得融合核心! (拥有: ' + this.fusionCoreCount + ')', 2000, '#cc44ff');
    }
    // Check if any new fusions are now available
    var availableFusions = this.checkFusions();
    if (availableFusions.length > 0 && this.onFusionAvailable) {
      this.onFusionAvailable(availableFusions);
    }
  }

  /**
   * Check if player has at least one fusion core.
   * @returns {boolean}
   */
  hasFusionCore() {
    return this.fusionCoreCount > 0;
  }

  /**
   * Open a weapon crate: gives the player a random unowned weapon.
   */
  _openWeaponCrate() {
    if (!this.weaponManager) return;
    var allWeapons = GAME_CONFIG.WEAPONS;
    if (!allWeapons) return;
    var owned = [];
    this.weaponLevels.forEach(function(lvl, wid) { owned.push(wid); });
    var unowned = [];
    for (var wid in allWeapons) {
      if (allWeapons.hasOwnProperty(wid) && owned.indexOf(wid) === -1 && !allWeapons[wid].fused) {
        unowned.push(wid);
      }
    }
    if (unowned.length === 0) {
      if (window.ui) window.ui.showToast('📦 已拥有所有武器!', 2000, '#ffaa00');
      return;
    }
    var pick = unowned[Math.floor(Math.random() * unowned.length)];
    this.weaponLevels.set(pick, 1);
    // Try to equip to an empty slot
    var emptySlot = -1;
    if (this.weaponManager) {
      for (var si = 0; si < this.weaponManager.weaponSlots.length; si++) {
        if (!this.weaponManager.weaponSlots[si]) { emptySlot = si; break; }
      }
      if (emptySlot >= 0) {
        this.weaponManager.addWeaponToSlot(pick, emptySlot);
      }
    }
    if (window.ui) {
      var wCfg = allWeapons[pick];
      window.ui.showToast('📦 获得新武器: ' + (wCfg ? wCfg.name : pick) + '!', 2500, '#44ddff');
    }
    // Codex discovery
    if (window.CodexProgressManager) {
      window.CodexProgressManager.discoverWeapon(pick);
    }
  }

  // ====================================================================
  //  PASSIVE EFFECTS
  // ====================================================================

  /**
   * Recalculate all passive stat modifiers from learned passive skills.
   * Calls player._recalculateStats() to rebuild computed stats.
   */
  applyPassiveEffects() {
    this.player._recalculateStats();
  }

  // ====================================================================
  //  UPDATE (per-frame)
  // ====================================================================

  /**
   * Update cooldowns, active timers, and auto-fire active skills.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    var dtMs = dt * 1000;

    // --- Decrement active skill cooldowns & auto-fire ---
    this.activeCooldowns.forEach(function(remaining, skillId, map) {
      var newRemaining = remaining - dtMs;
      if (newRemaining <= 0) {
        // Cooldown ready: fire the active skill and reset cooldown
        map.set(skillId, 0);
        this._dispatchActive(skillId);
      } else {
        map.set(skillId, newRemaining);
      }
    }.bind(this));

    // --- Decrement conditional skill cooldowns ---
    this.conditionalCooldowns.forEach(function(remaining, skillId, map) {
      if (remaining > 0) {
        var newRemaining = remaining - dtMs;
        map.set(skillId, Math.max(0, newRemaining));
      }
    }.bind(this));

    // --- Decrement active timed effects (temporary buffs) ---
    for (var i = this._activeTimers.length - 1; i >= 0; i--) {
      var timer = this._activeTimers[i];
      timer.remaining -= dtMs;
      if (timer.remaining <= 0) {
        this._removeTempBuffs(timer);
        this._activeTimers.splice(i, 1);
      }
    }

    // --- Star charge accumulation ---
    var player = this.player;
    if (player && player.stats) {
      var chargeRate = player.stats.chargeRate || 0;
      var maxCharge = player.stats.maxStarCharge || 0;
      if (chargeRate > 0 && maxCharge > 0) {
        // Accumulate charge over time
        player.stats.starCharge = (player.stats.starCharge || 0) + chargeRate * dtMs / 1000;
        if (player.stats.starCharge >= maxCharge) {
          player.stats.starCharge = maxCharge;
          this.onMaxCharge(player.x, player.y);
        }
      }
    }

    // --- Rune effect proc timer ---
    if (player && player.stats && player.stats.runeDrop > 0) {
      this._runeProcTimer = (this._runeProcTimer || 0) + dtMs;
      // Proc rune effect every 3 seconds when rune stats are present
      if (this._runeProcTimer >= 3000) {
        this._runeProcTimer = 0;
        if (player.stats.runeEffect && Math.random() < player.stats.runeEffect) {
          this.onRuneTrigger(player.x, player.y);
        }
      }
    }
  }

  // ====================================================================
  //  TRIGGER HANDLERS
  // ====================================================================

  /**
   * Fire onKill trigger. Called when an enemy is killed.
   * @param {number} x - Kill position X
   * @param {number} y - Kill position Y
   */
  onKill(x, y) {
    this._fireConditional('onKill', x, y);
  }

  /**
   * Fire onHit trigger when player lands an attack on an enemy.
   * @param {number} x - Hit position X
   * @param {number} y - Hit position Y
   */
  onAttackHit(x, y) {
    this._fireConditional('onHit', x, y);
  }

  /**
   * @deprecated Use onAttackHit for attack conditionals; kept for player-damage hooks.
   */
  onHit() {
    this._fireConditional('onHit');
  }

  /**
   * Fire onDodge trigger. Called when the player dodges an attack.
   */
  onDodge() {
    this._fireConditional('onDodge');
  }

  /**
   * Fire onCrit trigger. Called when the player lands a critical hit.
   * @param {number} x - Hit position X
   * @param {number} y - Hit position Y
   */
  onCrit(x, y) {
    this._fireConditional('onCrit', x, y);
  }

  /**
   * Fire onPickup trigger. Called when the player picks up an item.
   */
  onPickup() {
    this._fireConditional('onPickup');
  }

  /**
   * Fire onKillFrozen trigger. Called when a frozen enemy is killed.
   * @param {number} x - Kill position X
   * @param {number} y - Kill position Y
   */
  onKillFrozen(x, y) {
    this._fireConditional('onKillFrozen', x, y);
  }

  /**
   * Fire onStealthEnd trigger. Called when shadow stealth expires.
   */
  onStealthEnd() {
    this._fireConditional('onStealthEnd');
  }

  /**
   * Fire onRuneTrigger trigger. Called when a rune effect procs.
   * @param {number} x - Event position X
   * @param {number} y - Event position Y
   */
  onRuneTrigger(x, y) {
    this._fireConditional('onRuneTrigger', x, y);
  }

  /**
   * Fire onDecoyDestroy trigger. Called when a decoy is destroyed.
   * @param {number} x - Destroy position X
   * @param {number} y - Destroy position Y
   */
  onDecoyDestroy(x, y) {
    this._fireConditional('onDecoyDestroy', x, y);
  }

  /**
   * Fire onLethalDamage trigger. Called when the player would die.
   */
  onLethalDamage() {
    this._fireConditional('onLethalDamage');
  }

  /**
   * Fire onMaxCharge trigger. Called when star charge reaches maximum.
   * @param {number} x - Player position X
   * @param {number} y - Player position Y
   */
  onMaxCharge(x, y) {
    this._fireConditional('onMaxCharge', x, y);
  }

  // ====================================================================
  //  INTERNAL: DISPATCH
  // ====================================================================

  /**
   * Find and fire all learned conditional skills matching the given trigger.
   * @param {string} trigger - Trigger type ('onKill', 'onHit', etc.)
   * @param {number} [x] - Event position X
   * @param {number} [y] - Event position Y
   */
  _fireConditional(trigger, x, y) {
    var player = this.player;
    var self = this;
    this.learnedSkills.forEach(function(count, skillId) {
      var skill = self._findSkill(skillId);
      if (!skill || skill.type !== 'conditional' || skill.trigger !== trigger) return;

      // Check conditional cooldown
      if (skill.cooldown) {
        var cd = self.conditionalCooldowns.get(skill.id) || 0;
        if (cd > 0) return;
      }

      // Check probability (chance field on individual effects)
      var effects = skill.effects || [];
      var byChance = [];
      var guaranteed = [];
      for (var j = 0; j < effects.length; j++) {
        var fx = effects[j];
        if (fx.chance !== undefined) {
          if (Math.random() < fx.chance) {
            byChance.push(fx);
          }
        } else {
          guaranteed.push(fx);
        }
      }

      var allFx = guaranteed.concat(byChance);
      if (allFx.length === 0) return;

      // Set cooldown if skill has one
      if (skill.cooldown) {
        self.conditionalCooldowns.set(skill.id, skill.cooldown);
      }

      // Position for position-dependent effects
      var posX = (x !== undefined) ? x : player.x;
      var posY = (y !== undefined) ? y : player.y;

      // Apply effects
      for (var k = 0; k < allFx.length; k++) {
        self._applyEffect(allFx[k], posX, posY, skill);
      }

      // If skill has a duration, register temp buff tracking
      if (skill.duration && allFx.length > 0) {
        self._registerTempTimer(skill, allFx);
      }
    });
  }

  /**
   * Dispatch an active skill (auto-fire when cooldown is ready).
   * @param {string} skillId
   */
  _dispatchActive(skillId) {
    var skill = this._findSkill(skillId);
    if (!skill || skill.type !== 'active') return;

    var player = this.player;
    var effects = skill.effects || [];

    for (var i = 0; i < effects.length; i++) {
      var fx = effects[i];
      if (fx.chance !== undefined) {
        if (Math.random() >= fx.chance) continue;
      }
      this._applyEffect(fx, player.x, player.y, skill);
    }

    // Reset cooldown after firing
    if (skill.cooldown) {
      this.activeCooldowns.set(skillId, skill.cooldown);
    }
  }

  /**
   * Apply a single effect object.
   * @param {object} fx - Effect config
   * @param {number} x - Origin X
   * @param {number} y - Origin Y
   * @param {object} skill - Parent skill config
   */
  _applyEffect(fx, x, y, skill) {
    // Stat modifier effects
    if (fx.stat !== undefined) {
      var mod = {
        stat: fx.stat,
        op: fx.op || 'add',
        value: fx.value,
        condition: fx.condition || null,
        duration: fx.duration || 0
      };

      if (fx.duration && fx.duration > 0) {
        // Temporary stat buff: apply and track for expiry
        this._applyTempStatMod(mod, fx.duration);
      } else {
        // Permanent or instant stat change
        if (fx.stat === 'hp') {
          if (fx.value > 0) this.player.heal(fx.value);
          else this.player.takeDamage(-fx.value);
        } else if (fx.stat === 'shieldAmount') {
          // Instant shield gain
          this.player.maxShield = (this.player.maxShield || 0) + fx.value;
          this.player.shield = Math.min(
            (this.player.shield || 0) + fx.value,
            this.player.maxShield
          );
        } else {
          this.player.applyStatModifiers([{
            stat: fx.stat,
            op: fx.op || 'add',
            value: fx.value
          }]);
        }
      }
      return;
    }

    // Action effects
    if (fx.action !== undefined) {
      switch (fx.action) {
        case 'shockwave':
          this._doShockwave(x, y, fx.damage, fx.radius);
          break;
        case 'lightning':
          this._doLightning(fx.damage, fx.count);
          break;
        case 'timeSlow':
          this._doTimeSlow(fx.amount, fx.duration);
          break;
        case 'invincible':
          this._doInvincible(fx.duration);
          break;
        case 'burstFire':
          this._doBurstFire(fx.bulletCount, fx.duration);
          break;
        case 'fireNova':
          this._doFireNova(x, y, fx.damage, fx.radius, fx.burnDuration);
          break;
        case 'blizzard':
          this._doBlizzard(x, y, fx.damage, fx.duration, fx.radius);
          break;
        case 'shieldBurst':
          this._doShieldBurst(x, y, fx.damage, fx.radius);
          break;
        case 'plague':
          this._doPlague(x, y, fx.damage, fx.duration, fx.radius);
          break;
        case 'bulletStorm':
          this._doBulletStorm(fx.bulletCount, fx.duration, fx.spreadAngle);
          break;
        case 'overdrive':
          this._doOverdrive(fx.damage, fx.duration);
          break;
        case 'orbitalStrike':
          this._doOrbitalStrike(fx.damage, fx.radius, fx.count);
          break;
        case 'clone':
          this._doClone(fx.count, fx.duration);
          break;
        case 'explosion':
          this._doExplosion(x, y, fx.damage, fx.radius);
          break;
        case 'poisonSpread':
          this._doPoisonSpread(x, y, fx.damage, fx.radius, fx.duration);
          break;
        case 'freeze':
          this._doFreeze(fx.chance, fx.duration);
          break;
        case 'chainDamage':
          this._doChainDamage(x, y, fx.damage, fx.radius);
          break;
        case 'chainLightning':
          this._doChainLightningFromHit(x, y, fx.damage, fx.chainCount, fx.chainRange);
          break;
        case 'execute':
          this._doExecute(fx.threshold, fx.damage);
          break;
        case 'counterStrike':
          this._doCounterStrike(x, y, fx.damage, fx.radius);
          break;
        case 'plagueBlizzard':
          this._doPlagueBlizzard(x, y, fx.damage, fx.duration, fx.radius, fx.poisonDamage, fx.poisonDuration, fx.slowAmount);
          break;
        case 'stormFire':
          this._doStormFire(x, y, fx.damage, fx.chainCount, fx.chainRange, fx.burnDamage, fx.burnDuration);
          break;
        case 'vampiricShield':
          this._doVampiricShield(fx.shieldAmount, fx.duration, fx.lifestealOnHit, fx.reflectDamage);
          break;
        // --- Meteor / Fire ---
        case 'meteorShower':
          this._doMeteorShower(x, y, fx.damage, fx.count, fx.duration, fx.radius, fx.fallRadius);
          break;
        case 'firePillar':
          this._doFirePillar(x, y, fx.damage, fx.duration, fx.radius, fx.count);
          break;
        case 'pyroclasm':
          this._doPyroclasm(x, y, fx.damage, fx.radius, fx.expanding, fx.duration);
          break;
        case 'inferno':
          this._doInferno(x, y, fx.damage, fx.duration, fx.radius, fx.burnDamage, fx.burnDuration);
          break;
        case 'flameWave':
          this._doFlameWave(x, y, fx.damage, fx.radius, fx.angle);
          break;
        // --- Ice / Frost ---
        case 'frostNova':
          this._doFrostNova(x, y, fx.damage, fx.radius, fx.freezeDuration);
          break;
        case 'iceWall':
          this._doIceWall(x, y, fx.duration, fx.wallWidth, fx.hp, fx.blocksBullets);
          break;
        case 'hailstorm':
          this._doHailstorm(x, y, fx.damage, fx.count, fx.duration, fx.radius, fx.slowAmount);
          break;
        case 'frostArmor':
          this._doFrostArmor(fx.duration, fx.freezeAttackers, fx.freezeDuration, fx.defense);
          break;
        // --- Lightning / Thunder ---
        case 'thunderbolt':
          this._doThunderbolt(x, y, fx.damage, fx.radius, fx.stunDuration);
          break;
        case 'lightningDash':
          this._doLightningDash(fx.damage, fx.trailDamage, fx.distance, fx.trailDuration);
          break;
        case 'staticField':
          this._doStaticField(x, y, fx.damage, fx.duration, fx.radius, fx.tickRate);
          break;
        case 'thunderclap':
          this._doThunderclap(x, y, fx.damage, fx.radius, fx.stunDuration);
          break;
        // --- Poison / Toxic ---
        case 'poisonCloud':
          this._doPoisonCloud(x, y, fx.damage, fx.duration, fx.radius, fx.poisonDamage, fx.poisonDuration);
          break;
        case 'toxicNova':
          this._doToxicNova(x, y, fx.damage, fx.radius, fx.poisonDamage, fx.poisonDuration);
          break;
        case 'acidRain':
          this._doAcidRain(x, y, fx.damage, fx.duration, fx.radius, fx.defenseShred);
          break;
        case 'venomStrike':
          this._doVenomStrike(fx.damage, fx.poisonDamage, fx.poisonDuration, fx.singleTarget);
          break;
        // --- Summon / Minions ---
        case 'summonTurret':
          this._doSummonTurret(x, y, fx.damage, fx.duration, fx.fireRate, fx.count);
          break;
        case 'summonWolves':
          this._doSummonWolves(x, y, fx.damage, fx.duration, fx.count, fx.speed);
          break;
        case 'landmine':
          this._doLandmine(x, y, fx.damage, fx.radius, fx.count, fx.duration);
          break;
        case 'arcaneMissiles':
          this._doArcaneMissiles(x, y, fx.damage, fx.count, fx.homing, fx.homingStrength);
          break;
        // --- Defense / Barrier ---
        case 'barrier':
          this._doBarrier(fx.shieldAmount, fx.duration, fx.radius);
          break;
        case 'phalanx':
          this._doPhalanx(fx.shieldOrbs, fx.duration, fx.orbDamage, fx.blockBullets);
          break;
        case 'runicShield':
          this._doRunicShield(fx.shieldAmount, fx.duration, fx.reflectDamage, fx.healOnBlock);
          break;
        case 'reverseBullets':
          this._doReverseBullets(fx.duration, fx.radius, fx.reflectedDamage);
          break;
        // --- Mobility / Teleport ---
        case 'teleport':
          this._doTeleport(fx.range, fx.damage, fx.radius);
          break;
        case 'warpStrike':
          this._doWarpStrike(fx.damage, fx.stunDuration, fx.teleportToEnemy);
          break;
        case 'smokeBomb':
          this._doSmokeBomb(fx.duration, fx.radius, fx.stealth, fx.enemySlow);
          break;
        case 'phantomStrike':
          this._doPhantomStrike(fx.damage, fx.count, fx.dashDistance, fx.slashRadius);
          break;
        // --- AOE / Explosion ---
        case 'chainExplosion':
          this._doChainExplosion(x, y, fx.damage, fx.radius, fx.chainCount, fx.chainRange);
          break;
        case 'doom':
          this._doDoom(x, y, fx.damage, fx.radius, fx.delay, fx.screenShake);
          break;
        case 'earthquake':
          this._doEarthquake(x, y, fx.damage, fx.duration, fx.radius, fx.tickRate, fx.stunChance);
          break;
        case 'plasmaBall':
          this._doPlasmaBall(x, y, fx.damage, fx.speed, fx.radius, fx.duration, fx.pierce);
          break;
        // --- Special / Unique ---
        case 'laserSweep':
          this._doLaserSweep(x, y, fx.damage, fx.duration, fx.sweepAngle, fx.beamLength, fx.tickRate);
          break;
        case 'deathMark':
          this._doDeathMark(fx.damageMultiplier, fx.duration, fx.targetCount);
          break;
        case 'bladeStorm':
          this._doBladeStorm(x, y, fx.damage, fx.duration, fx.radius, fx.tickRate, fx.pierce);
          break;
        case 'sunburst':
          this._doSunburst(x, y, fx.damage, fx.radius, fx.blindDuration, fx.healAmount);
          break;
        case 'avalanche':
          this._doAvalanche(x, y, fx.damage, fx.duration, fx.radius, fx.pushForce, fx.slowAmount);
          break;
        case 'soulDrain':
          this._doSoulDrain(x, y, fx.damage, fx.lifesteal, fx.duration, fx.radius);
          break;
        case 'voidSphere':
          this._doVoidSphere(x, y, fx.damage, fx.speed, fx.radius, fx.duration, fx.pullForce);
          break;
        case 'enrage':
          this._doEnrage(fx.attackBoost, fx.speedBoost, fx.duration, fx.takeMoreDamage);
          break;
        case 'healingWard':
          this._doHealingWard(x, y, fx.healPerSec, fx.duration, fx.radius);
          break;
        case 'lightningRod':
          this._doLightningRod(x, y, fx.damage, fx.duration, fx.radius, fx.strikeInterval, fx.targetRandomEnemy);
          break;
        case 'frozenComet':
          this._doFrozenComet(x, y, fx.damage, fx.radius, fx.freezeDuration, fx.impactDamage, fx.splashRadius);
          break;
        case 'whirlwind':
          this._doWhirlwind(x, y, fx.damage, fx.duration, fx.radius, fx.tickRate);
          break;
        case 'runeChain':
          this._doRuneChain(x, y, fx.damage, fx.radius, fx.chainCount);
          break;
        case 'rewind':
          this._doRewind(fx.healPercent);
          break;
        case 'starBurst':
          this._doStarBurst(x, y, fx.damage, fx.radius, fx.chargeReset);
          break;
      }
    }
  }

  // ====================================================================
  //  ACTIVE EFFECT DISPATCHERS
  // ====================================================================

  /**
   * Shockwave: expanding circle that damages enemies in radius.
   */
  _doShockwave(x, y, damage, radius) {
    damage = damage || 25;
    radius = radius || 200;
    var self = this;

    window.game.addEntity({
      x: x,
      y: y,
      radius: 10,
      maxRadius: radius,
      damage: damage,
      active: true,
      category: 'particle',
      drawLayer: 3,
      _hitEnemies: {},

      update: function(dt) {
        this.radius += 600 * dt;
        if (this.radius >= this.maxRadius) {
          window.game.removeEntity(this);
          return;
        }
        // Damage enemies within current radius
        var enemies = window.game.enemies;
        for (var i = enemies.length - 1; i >= 0; i--) {
          var e = enemies[i];
          if (!e.active || this._hitEnemies[e._id]) continue;
          var dx = e.x - this.x;
          var dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
            this._hitEnemies[e._id] = true;
            e.takeDamage(this.damage);
          }
        }
        // Kill tracking: if enemy dies from this, trigger onKill
        // (handled by enemy takeDamage if it calls back)
      },

      draw: function(ctx) {
        var alpha = 1 - (this.radius / this.maxRadius);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 200, 50, ' + (alpha * 0.8) + ')';
        ctx.lineWidth = 3 * alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });

    window.game.addShake(4);
  }

  /**
   * Lightning: strike random enemies with visual bolts.
   */
  _doLightning(damage, count) {
    damage = damage || 60;
    count = count || 3;
    var player = this.player;
    var enemies = window.game.enemies;

    // Collect active enemies
    var targets = [];
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].active) targets.push(enemies[i]);
    }
    if (targets.length === 0) return;

    // Pick random targets (up to count)
    var picked = [];
    var remaining = targets.slice();
    for (var j = 0; j < count && remaining.length > 0; j++) {
      var idx = Math.floor(Math.random() * remaining.length);
      picked.push(remaining[idx]);
      remaining.splice(idx, 1);
    }

    // Strike each target
    for (var k = 0; k < picked.length; k++) {
      var target = picked[k];
      target.takeDamage(damage);
      this._spawnLightningBolt(player.x, player.y, target.x, target.y);
    }

    window.game.addShake(2);
  }

  /**
   * Spawn a visual lightning bolt entity between two points.
   */
  _spawnLightningBolt(x1, y1, x2, y2) {
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);

    window.game.addEntity({
      x1: x1, y1: y1, x2: x2, y2: y2,
      active: true,
      category: 'particle',
      drawLayer: 5,
      lifetime: 0.3,
      _age: 0,

      update: function(dt) {
        this._age += dt;
        if (this._age >= this.lifetime) {
          window.game.removeEntity(this);
        }
      },

      draw: function(ctx) {
        var alpha = 1 - (this._age / this.lifetime);
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, ' + (alpha * 0.9) + ')';
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        // Jagged line segments
        var segments = 5 + Math.floor(Math.random() * 3);
        var sx = this.x1, sy = this.y1;
        var stepX = (this.x2 - this.x1) / segments;
        var stepY = (this.y2 - this.y1) / segments;
        for (var s = 1; s <= segments; s++) {
          var jx = this.x1 + stepX * s + (Math.random() - 0.5) * 40;
          var jy = this.y1 + stepY * s + (Math.random() - 0.5) * 40;
          ctx.lineTo(jx, jy);
        }
        ctx.stroke();
        // Bright core
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (alpha * 0.6) + ')';
        ctx.lineWidth = 1 * alpha;
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Time Slow: reduce game time scale temporarily.
   */
  _doTimeSlow(amount, duration) {
    amount = amount || 0.4;
    duration = duration || 4000;
    var game = window.game;
    game.timeScale = amount;
    var self = this;
    setTimeout(function() {
      game.timeScale = 1.0;
    }, duration);
  }

  /**
   * Invincible: make player invincible for a duration.
   */
  _doInvincible(duration) {
    this.player.invincibleTimer = Math.max(this.player.invincibleTimer, duration);
  }

  /**
   * Burst Fire: rapid-fire many bullets from player.
   */
  _doBurstFire(bulletCount, duration) {
    bulletCount = bulletCount || 36;
    duration = duration || 500;
    var self = this;
    var player = this.player;
    var interval = duration / bulletCount;
    var fired = 0;

    function fireOne() {
      if (fired >= bulletCount) return;
      fired++;
      // Fire toward mouse/enemy direction
      var game = window.game;
      var angle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
      angle += (Math.random() - 0.5) * 0.3; // slight spread
      self._spawnPlayerBullet(player.x, player.y, angle);
      setTimeout(fireOne, interval);
    }
    fireOne();
  }

  /**
   * Fire Nova: expanding fire ring that damages and burns enemies.
   */
  _doFireNova(x, y, damage, radius, burnDuration) {
    damage = damage || 50;
    radius = radius || 250;
    burnDuration = burnDuration || 4000;

    window.game.addEntity({
      x: x, y: y,
      radius: 20,
      maxRadius: radius,
      damage: damage,
      burnDuration: burnDuration,
      active: true,
      category: 'particle',
      drawLayer: 3,
      _hitEnemies: {},

      update: function(dt) {
        this.radius += 400 * dt;
        if (this.radius >= this.maxRadius) {
          window.game.removeEntity(this);
          return;
        }
        var enemies = window.game.enemies;
        for (var i = enemies.length - 1; i >= 0; i--) {
          var e = enemies[i];
          if (!e.active || this._hitEnemies[e._id]) continue;
          var dx = e.x - this.x;
          var dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
            this._hitEnemies[e._id] = true;
            e.takeDamage(this.damage);
            // Apply burn
            if (e.burnTimer === undefined) e.burnTimer = 0;
            e.burnTimer = this.burnDuration;
            e.burnDamage = 5;
          }
        }
      },

      draw: function(ctx) {
        var alpha = 1 - (this.radius / this.maxRadius);
        ctx.save();
        // Outer fire ring
        ctx.strokeStyle = 'rgba(255, 100, 20, ' + (alpha * 0.7) + ')';
        ctx.lineWidth = 6 * alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        // Inner glow
        ctx.strokeStyle = 'rgba(255, 220, 50, ' + (alpha * 0.5) + ')';
        ctx.lineWidth = 2 * alpha;
        ctx.stroke();
        ctx.restore();
      }
    });

    window.game.addShake(5);
  }

  /**
   * Blizzard: slow all enemies in a large radius for a duration.
   */
  _doBlizzard(x, y, damage, duration, radius) {
    damage = damage || 5;
    duration = duration || 5000;
    radius = radius || 350;
    var game = window.game;

    // Slow enemies and do periodic damage
    var elapsed = 0;
    var tickInterval = 500; // ms between damage ticks

    var blizzardEntity = {
      x: x, y: y,
      radius: radius,
      damage: damage,
      active: true,
      category: 'particle',
      drawLayer: 3,
      duration: duration,
      _elapsed: 0,
      _tickTimer: 0,
      _slowedEnemies: [],

      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= this.duration) {
          // Remove slow from all tracked enemies
          for (var si = 0; si < this._slowedEnemies.length; si++) {
            var entry = this._slowedEnemies[si];
            if (entry.enemy && entry.enemy.active) {
              entry.enemy.speed = entry.origSpeed;
            }
          }
          this._slowedEnemies = [];
          window.game.removeEntity(this);
          return;
        }

        // Apply slow to enemies in radius
        var enemies = window.game.enemies;
        for (var i = 0; i < enemies.length; i++) {
          var e = enemies[i];
          if (!e.active) continue;
          var dx = e.x - this.x;
          var dy = e.y - this.y;
          var inside = Math.sqrt(dx * dx + dy * dy) < this.radius;
          if (inside) {
            // Check if already tracked
            var alreadyTracked = false;
            for (var si = 0; si < this._slowedEnemies.length; si++) {
              if (this._slowedEnemies[si].enemy === e) { alreadyTracked = true; break; }
            }
            if (!alreadyTracked) {
              this._slowedEnemies.push({ enemy: e, origSpeed: e.speed });
              e.speed *= 0.35;
              // Apply freeze effect to enemies in blizzard radius
              e.frozenTimer = Math.max(e.frozenTimer || 0, 1000);
            }
          }
        }

        // Periodic damage tick
        this._tickTimer += dt * 1000;
        while (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x;
            var dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(this.damage);
            }
          }
        }
      },

      draw: function(ctx) {
        var alpha = Math.max(0, 1 - (this._elapsed / this.duration));
        ctx.save();
        // Snow particles
        for (var i = 0; i < 12; i++) {
          var angle = (i / 12) * Math.PI * 2 + this._elapsed * 0.003;
          var r = this.radius * 0.3 + (i % 3) * this.radius * 0.2;
          var sx = this.x + Math.cos(angle) * r;
          var sy = this.y + Math.sin(angle) * r;
          ctx.fillStyle = 'rgba(180, 220, 255, ' + (alpha * 0.6) + ')';
          ctx.beginPath();
          ctx.arc(sx, sy, 3 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Outer ring
        ctx.strokeStyle = 'rgba(150, 200, 255, ' + (alpha * 0.3) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    window.game.addEntity(blizzardEntity);
  }

  /**
   * Shield Burst: damage enemies based on current shield amount.
   */
  _doShieldBurst(x, y, damage, radius) {
    var player = this.player;
    var shieldAmount = player.shield || 0;
    var totalDamage = damage + shieldAmount;
    this._doShockwave(x, y, totalDamage, radius || 200);
  }

  /**
   * Plague: apply poison DoT to all enemies in radius.
   */
  _doPlague(x, y, damage, duration, radius) {
    damage = damage || 20;
    duration = duration || 8000;
    radius = radius || 300;
    var enemies = window.game.enemies;

    // Apply poison to each enemy in radius
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x;
      var dy = e.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        e.poisonTimer = Math.max(e.poisonTimer || 0, duration);
        e.poisonDamage = Math.max(e.poisonDamage || 0, damage);
      }
    }

    // Visual effect: green expanding circle
    window.game.addEntity({
      x: x, y: y,
      radius: 20,
      maxRadius: radius,
      active: true,
      category: 'particle',
      drawLayer: 3,
      lifetime: 1.0,
      _age: 0,

      update: function(dt) {
        this._age += dt;
        this.radius += 500 * dt;
        if (this._age >= this.lifetime) {
          window.game.removeEntity(this);
        }
      },

      draw: function(ctx) {
        var alpha = 1 - (this._age / this.lifetime);
        ctx.save();
        ctx.strokeStyle = 'rgba(80, 200, 60, ' + (alpha * 0.6) + ')';
        ctx.lineWidth = 3 * alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.min(this.radius, this.maxRadius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Bullet Storm: fire bullets in all directions.
   */
  _doBulletStorm(bulletCount, duration, spreadAngle) {
    bulletCount = bulletCount || 60;
    duration = duration || 2000;
    spreadAngle = spreadAngle || 360;
    var player = this.player;
    var interval = duration / bulletCount;
    var fired = 0;
    var baseAngle = Math.atan2(
      window.game.mouseY - player.y,
      window.game.mouseX - player.x
    );
    var halfSpread = (spreadAngle * Math.PI / 180) / 2;

    function fireOne() {
      if (fired >= bulletCount) return;
      fired++;
      var angle = baseAngle - halfSpread + (fired / bulletCount) * spreadAngle * Math.PI / 180;
      window._smBulletStorm = window._smBulletStorm || {};
      window._smBulletStorm.spawnBullet(player.x, player.y, angle);
      setTimeout(fireOne, interval);
    }
    fireOne();
  }

  /**
   * Overdrive: massive damage boost + visual effect.
   */
  _doOverdrive(damage, duration) {
    duration = duration || 6000;
    var player = this.player;

    // Apply temp attack buff
    this._applyTempStatMod({
      stat: 'attack',
      op: 'multiply',
      value: 1.5
    }, duration);

    // Visual aura
    var elapsed = 0;
    var aura = {
      active: true,
      category: 'particle',
      drawLayer: 4,
      lifetime: duration,
      _age: 0,

      update: function(dt) {
        this._age += dt * 1000;
        if (this._age >= this.lifetime) {
          window.game.removeEntity(this);
        }
      },

      draw: function(ctx) {
        var alpha = Math.max(0, 1 - (this._age / this.lifetime));
        var p = window.game.player;
        if (!p || !p.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 50, 50, ' + (alpha * 0.15) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 30 + alpha * 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 200, 50, ' + (alpha * 0.6) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    };
    window.game.addEntity(aura);
  }

  /**
   * Orbital Strike: drop damage zones from top of screen.
   */
  _doOrbitalStrike(damage, radius, count) {
    damage = damage || 300;
    radius = radius || 400;
    count = count || 5;
    var game = window.game;
    var screenWidth = game.width;

    for (var i = 0; i < count; i++) {
      var strikeX = screenWidth * 0.1 + Math.random() * screenWidth * 0.8;
      var delay = i * 300;
      var strikeDamage = damage;
      var strikeRadius = radius;

      setTimeout(function(sx, sr, sd) {
        // Warning indicator
        var indicator = {
          x: sx,
          y: -20,
          active: true,
          category: 'particle',
          drawLayer: 2,
          lifetime: 0.4,
          _age: 0,
          radius: sr * 0.2,

          update: function(dt) {
            this._age += dt;
            this.radius += 200 * dt;
            if (this._age >= this.lifetime) {
              window.game.removeEntity(this);
            }
          },

          draw: function(ctx) {
            var alpha = 1 - (this._age / this.lifetime);
            ctx.save();
            ctx.fillStyle = 'rgba(255, 100, 30, ' + (alpha * 0.4) + ')';
            ctx.beginPath();
            ctx.arc(this.x, window.game.height / 2, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        };
        window.game.addEntity(indicator);

        // Damage all enemies in radius
        window.game.addShake(8);
        var enemies = window.game.enemies;
        for (var j = 0; j < enemies.length; j++) {
          var e = enemies[j];
          if (!e.active) continue;
          var dx = e.x - sx;
          var dy = e.y - window.game.height / 2;
          if (Math.sqrt(dx * dx + dy * dy) < sr) {
            e.takeDamage(sd);
          }
        }

        // Strike flash
        window.game.addEntity({
          x: sx,
          y: window.game.height / 2,
          active: true,
          category: 'particle',
          drawLayer: 6,
          lifetime: 0.3,
          _age: 0,
          radius: sr,

          update: function(dt) {
            this._age += dt;
            if (this._age >= this.lifetime) {
              window.game.removeEntity(this);
            }
          },

          draw: function(ctx) {
            var alpha = Math.max(0, 1 - (this._age / this.lifetime));
            ctx.save();
            var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, 'rgba(255, 255, 200, ' + (alpha * 0.8) + ')');
            grad.addColorStop(0.5, 'rgba(255, 150, 50, ' + (alpha * 0.4) + ')');
            grad.addColorStop(1, 'rgba(255, 50, 20, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }, delay, strikeX, strikeRadius, strikeDamage);
    }
  }

  /**
   * Clone: create temporary duplicate player entities that fire.
   */
  _doClone(count, duration) {
    count = count || 2;
    duration = duration || 8000;
    var player = this.player;
    var skillManager = this; // Capture SkillManager for decoy destroy trigger

    for (var i = 0; i < count; i++) {
      var offsetX = (Math.random() - 0.5) * 80;
      var offsetY = (Math.random() - 0.5) * 60;
      var clone = {
        x: player.x + offsetX,
        y: player.y + offsetY,
        active: true,
        category: 'particle',
        drawLayer: 5,
        lifetime: duration,
        _age: 0,
        _fireTimer: 0,
        _fireRate: 450,
        _isDecoy: true,

        update: function(dt) {
          this._age += dt * 1000;
          if (this._age >= this.lifetime) {
            // Fire onDecoyDestroy trigger before removing
            if (skillManager && typeof skillManager.onDecoyDestroy === 'function') {
              skillManager.onDecoyDestroy(this.x, this.y);
            }
            window.game.removeEntity(this);
            return;
          }
          // Follow player loosely
          this.x += (player.x + offsetX - this.x) * 0.1;
          this.y += (player.y + offsetY - this.y) * 0.1;

          // Auto-fire toward enemies
          this._fireTimer += dt * 1000;
          if (this._fireTimer >= this._fireRate) {
            this._fireTimer = 0;
            var enemies = window.game.enemies;
            var nearest = null;
            var nearestDist = Infinity;
            for (var j = 0; j < enemies.length; j++) {
              if (!enemies[j].active) continue;
              var dx = enemies[j].x - this.x;
              var dy = enemies[j].y - this.y;
              var d = dx * dx + dy * dy;
              if (d < nearestDist) {
                nearestDist = d;
                nearest = enemies[j];
              }
            }
            if (nearest) {
              var angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
              window._smCloneSpawnBullet(this.x, this.y, angle);
            }
          }
        },

        draw: function(ctx) {
          var alpha = Math.min(1, Math.max(0.2, 1 - (this._age / this.lifetime)));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(this.x, this.y);
          ctx.fillStyle = player.factionColor;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(-7, 7);
          ctx.lineTo(7, 7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      };
      window.game.addEntity(clone);
    }
  }

  /**
   * Explosion: damage enemies in radius (from onKill conditional).
   */
  _doExplosion(x, y, damage, radius) {
    damage = damage || 25;
    radius = radius || 100;
    this._doShockwave(x, y, damage, radius);
  }

  /**
   * Poison Spread: apply poison to enemies near a killed enemy.
   */
  _doPoisonSpread(x, y, damage, radius, duration) {
    damage = damage || 15;
    radius = radius || 120;
    duration = duration || 4000;
    this._doPlague(x, y, damage, duration, radius);
  }

  /**
   * Rune Chain: chain lightning from rune source to nearby enemies.
   */
  _doRuneChain(x, y, damage, radius, chainCount) {
    damage = damage || 30;
    radius = radius || 180;
    chainCount = chainCount || 2;
    var enemies = window.game.enemies;
    var hit = [];
    var currentX = x;
    var currentY = y;

    for (var c = 0; c < chainCount; c++) {
      var nearest = null;
      var nearestDist = radius * radius;
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active || hit.indexOf(e) !== -1) continue;
        var dx = e.x - currentX;
        var dy = e.y - currentY;
        var d = dx * dx + dy * dy;
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (!nearest) break;
      nearest.takeDamage(damage);
      hit.push(nearest);
      // Lightning visual
      if (window.ParticleSystem && window.ParticleSystem.lightning) {
        window.ParticleSystem.lightning(currentX, currentY, nearest.x, nearest.y);
      }
      currentX = nearest.x;
      currentY = nearest.y;
    }
  }

  /**
   * Rewind: heal the player by a percentage of max HP instead of dying.
   */
  _doRewind(healPercent) {
    healPercent = healPercent || 0.3;
    var player = this.player;
    if (!player || player.hp <= 0) return;
    var healAmount = Math.floor(player.maxHp * healPercent);
    player.hp = Math.min(player.hp + healAmount, player.maxHp);
    // Brief invincibility to prevent immediate re-death
    player.invincibleTimer = Math.max(player.invincibleTimer || 0, 1500);
    if (window.ui) {
      window.ui.showToast('⏳ 时间倒流! 恢复 ' + healAmount + ' HP', 2000, '#44ddff');
    }
    if (window.ParticleSystem) {
      window.ParticleSystem.burst(player.x, player.y, '#44ddff', 20);
    }
  }

  /**
   * Star Burst: large AOE damage around the player and reset charge.
   */
  _doStarBurst(x, y, damage, radius, chargeReset) {
    damage = damage || 80;
    radius = radius || 300;
    this._doShockwave(x, y, damage, radius);
    // Reset star charge
    if (chargeReset && this.player && this.player.stats) {
      this.player.stats.starCharge = 0;
    }
    // Visual burst
    if (window.ParticleSystem && window.ParticleSystem.burst) {
      window.ParticleSystem.burst(x, y, '#ffff88', 30);
    }
  }

  /**
   * Freeze: freeze enemies within a radius.
   */
  _doFreeze(chance, duration) {
    chance = chance || 0.08;
    duration = duration || 1500;
    var enemies = window.game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      if (Math.random() < chance) {
        e.frozenTimer = Math.max(e.frozenTimer || 0, duration);
      }
    }
  }

  /**
   * Chain Damage: damage nearby enemies around the crit target.
   */
  _doChainDamage(x, y, damage, radius) {
    damage = damage || 0.5; // multiplier on original damage
    radius = radius || 150;
    var enemies = window.game.enemies;
    var player = this.player;
    var baseDamage = player.stats.attack ? player.stats.attack * 5 : 20;

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x;
      var dy = e.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        e.takeDamage(baseDamage * damage);
      }
    }
  }

  /**
   * Chain lightning from attack hit position (th_arc etc.).
   */
  _doChainLightningFromHit(x, y, damage, chainCount, chainRange) {
    var game = window.game;
    if (!game || !game.enemies) return;
    chainCount = chainCount || 3;
    chainRange = chainRange || 200;
    damage = damage || 25;

    var origin = null, bestD = 60 * 60;
    for (var i = 0; i < game.enemies.length; i++) {
      var e = game.enemies[i];
      if (!e.active) continue;
      var dx = e.x - x, dy = e.y - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; origin = e; }
    }
    if (!origin) return;

    var chainFn = game._chainDamage;
    if (typeof chainFn === 'function') {
      chainFn(origin, damage, 0);
      return;
    }

    // Fallback: radial zap
    this._doChainDamage(x, y, damage / 20, chainRange);
  }

  /**
   * Execute: instantly kill enemies below a HP threshold.
   */
  _doExecute(threshold, damage) {
    threshold = threshold || 0.2;
    var enemies = window.game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var hpPct = e.hp / e.maxHp;
      if (hpPct <= threshold) {
        e.takeDamage(damage || 9999);
      }
    }
  }

  /**
   * Counter Strike: damage enemies around the player when hit.
   */
  _doCounterStrike(x, y, damage, radius) {
    damage = damage || 30;
    radius = radius || 120;
    this._doShockwave(x, y, damage, radius);
  }

  // ====================================================================
  //  FUSION SKILL EFFECTS
  // ====================================================================

  /**
   * Plague Blizzard: Slow + DoT area effect. Combines blizzard slow with poison damage.
   * Green-blue expanding zone that slows and poisons enemies inside.
   */
  _doPlagueBlizzard(x, y, damage, duration, radius, poisonDamage, poisonDuration, slowAmount) {
    damage = damage || 8;
    duration = duration || 6000;
    radius = radius || 380;
    poisonDamage = poisonDamage || 10;
    poisonDuration = poisonDuration || 4000;
    slowAmount = slowAmount || 0.5;

    var game = window.game;
    var self = this;
    var elapsed = 0;
    var tickInterval = 500;
    var tickTimer = 0;

    var entity = {
      x: x, y: y,
      radius: radius,
      active: true,
      category: 'particle',
      drawLayer: 3,
      duration: duration / 1000,
      _elapsed: 0,
      _tickTimer: 0,
      _trackedEnemies: [],

      update: function(dt) {
        this._elapsed += dt;
        if (this._elapsed >= this.duration) {
          this._trackedEnemies = [];
          game.removeEntity(this);
          return;
        }

        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x;
            var dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              // Apply damage via takeDamage for proper death handling
              e.takeDamage(damage);
              // Apply poison using standard enemy properties
              e.poisonTimer = Math.max(e.poisonTimer || 0, poisonDuration);
              e.poisonDamage = Math.max(e.poisonDamage || 0, poisonDamage);
              // Apply slow using standard mechanism
              e.slowTimer = Math.max(e.slowTimer || 0, tickInterval + 100);
              e.slowAmount = Math.max(e.slowAmount || 0, slowAmount);
            }
          }
        }
      },

      draw: function(ctx) {
        var alpha = 0.4 * (1 - this._elapsed / this.duration);
        ctx.save();
        // Green-blue gradient circle
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(100, 220, 180, ' + (alpha * 0.5) + ')');
        grad.addColorStop(0.5, 'rgba(80, 180, 220, ' + (alpha * 0.3) + ')');
        grad.addColorStop(1, 'rgba(60, 140, 200, ' + (alpha * 0.1) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Border ring
        ctx.strokeStyle = 'rgba(100, 255, 200, ' + (alpha * 0.8) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (0.5 + 0.5 * Math.sin(this._elapsed * 3)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    game.addEntity(entity);
  }

  /**
   * Storm Fire: Chain lightning that also applies burn. Combines chain lightning + burn.
   * Strikes enemies and chains to nearby targets, applying burn DoT to each.
   */
  _doStormFire(x, y, damage, chainCount, chainRange, burnDamage, burnDuration) {
    damage = damage || 15;
    chainCount = chainCount || 4;
    chainRange = chainRange || 160;
    burnDamage = burnDamage || 12;
    burnDuration = burnDuration || 3000;

    var game = window.game;
    var enemies = game.enemies;
    var player = this.player;
    var originX = player.x;
    var originY = player.y;

    // Find nearest enemy to start chain
    var nearest = null;
    var nearestDist = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - originX;
      var dy = e.y - originY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = e;
      }
    }

    if (!nearest) return;

    // Chain lightning with burn
    var alreadyHit = {};
    var current = nearest;
    var chainDmg = damage;
    var chainRangeSq = chainRange * chainRange;

    for (var c = 0; c < chainCount && current; c++) {
      var cid = current._uid || (current._uid = Math.random());
      if (alreadyHit[cid]) break;
      alreadyHit[cid] = true;

      // Damage and burn (use takeDamage for proper death handling)
      current.takeDamage(chainDmg);
      current.burnTimer = Math.max(current.burnTimer || 0, burnDuration);
      current.burnDamage = Math.max(current.burnDamage || 0, burnDamage);

      // Spawn lightning visual
      this._spawnStormFireVisual(originX, originY, current.x, current.y);

      // Find next chain target
      originX = current.x;
      originY = current.y;
      var next = null;
      var nextDist = Infinity;
      for (var j = 0; j < enemies.length; j++) {
        var ej = enemies[j];
        if (!ej.active) continue;
        var ejid = ej._uid || (ej._uid = Math.random());
        if (alreadyHit[ejid]) continue;
        var ddx = ej.x - originX;
        var ddy = ej.y - originY;
        var dd = ddx * ddx + ddy * ddy;
        if (dd < chainRangeSq && dd < nextDist) {
          nextDist = dd;
          next = ej;
        }
      }
      current = next;
      chainDmg *= 0.8; // Damage falloff
    }
  }

  /**
   * Spawn storm fire visual (red-yellow lightning bolt between two points).
   */
  _spawnStormFireVisual(x1, y1, x2, y2) {
    var game = window.game;
    var segments = 6;
    var points = [{ x: x1, y: y1 }];
    for (var i = 1; i < segments; i++) {
      var t = i / segments;
      var mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 30;
      var my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 30;
      points.push({ x: mx, y: my });
    }
    points.push({ x: x2, y: y2 });

    game.addEntity({
      points: points,
      active: true,
      category: 'particle',
      drawLayer: 6,
      life: 0.3,
      maxLife: 0.3,

      update: function(dt) {
        this.life -= dt;
        if (this.life <= 0) {
          this.active = false;
          game.removeEntity(this);
        }
      },

      draw: function(ctx) {
        var alpha = this.life / this.maxLife;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 180, 50, ' + alpha + ')';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Vampiric Shield: Shield that heals on hit. Combines shield + lifesteal.
   * Grants a shield and adds lifesteal + reflect for a duration.
   */
  _doVampiricShield(shieldAmount, duration, lifestealOnHit, reflectDamage) {
    shieldAmount = shieldAmount || 60;
    duration = duration || 10000;
    lifestealOnHit = lifestealOnHit || 0.15;
    reflectDamage = reflectDamage || 0.4;

    var player = this.player;

    // Grant shield
    player.maxShield = (player.maxShield || 0) + shieldAmount;
    player.shield = Math.min(
      (player.shield || 0) + shieldAmount,
      player.maxShield
    );

    // Apply temporary lifesteal and reflect
    this._applyTempStatMod({ stat: 'lifesteal', op: 'add', value: lifestealOnHit }, duration);
    this._applyTempStatMod({ stat: 'shieldReflect', op: 'add', value: reflectDamage }, duration);

    // Visual: purple-red shield aura
    var game = window.game;
    game.addEntity({
      x: player.x, y: player.y,
      active: true,
      category: 'particle',
      drawLayer: 5,
      life: duration / 1000,
      maxLife: duration / 1000,

      update: function(dt) {
        this.life -= dt;
        if (this.life <= 0) {
          this.active = false;
          game.removeEntity(this);
          return;
        }
        // Follow player
        if (game.player && game.player.active) {
          this.x = game.player.x;
          this.y = game.player.y;
        }
      },

      draw: function(ctx) {
        var alpha = 0.3 + 0.2 * Math.sin(this.life * 6);
        var r = 25 + 5 * Math.sin(this.life * 4);
        ctx.save();
        // Purple-red glow
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
        grad.addColorStop(0, 'rgba(200, 50, 100, ' + (alpha * 0.4) + ')');
        grad.addColorStop(0.7, 'rgba(150, 30, 80, ' + (alpha * 0.2) + ')');
        grad.addColorStop(1, 'rgba(100, 20, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // ====================================================================
  //  NEW ACTIVE SKILL HANDLERS (45+)
  // ====================================================================

  // ----------------------------------------------------------------
  //  METEOR / FIRE
  // ----------------------------------------------------------------

  /**
   * Meteor Shower: rain meteors from the sky over a duration.
   */
  _doMeteorShower(x, y, damage, count, duration, radius, fallRadius) {
    damage = damage || 80;
    count = count || 12;
    duration = duration || 4000;
    radius = radius || 60;
    fallRadius = fallRadius || 350;
    var game = window.game;
    var interval = duration / count;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          var mx = x - fallRadius / 2 + Math.random() * fallRadius;
          var my = y - fallRadius / 2 + Math.random() * fallRadius;
          // Warning indicator
          game.addEntity({
            x: mx, y: my - 30, active: true, category: 'particle', drawLayer: 2,
            lifetime: 0.3, _age: 0,
            update: function(dt) { this._age += dt; if (this._age >= this.lifetime) game.removeEntity(this); },
            draw: function(ctx) {
              var a = 1 - this._age / this.lifetime;
              ctx.fillStyle = 'rgba(255,100,30,' + (a * 0.5) + ')';
              ctx.beginPath(); ctx.arc(this.x, this.y, 20 + a * 20, 0, Math.PI * 2); ctx.fill();
            }
          });
          // Impact
          if (window.ParticleSystem) window.ParticleSystem.explosion(mx, my, 'small');
          game.addShake(3);
          var enemies = game.enemies;
          for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (!e.active) continue;
            var dx = e.x - mx, dy = e.y - my;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
              e.takeDamage(damage);
              // Apply burn
              e.burnTimer = Math.max(e.burnTimer || 0, 2000);
              e.burnDamage = Math.max(e.burnDamage || 0, 5);
            }
          }
        }, idx * interval);
      })(i);
    }
  }

  /**
   * Fire Pillar: pillars of flame erupt from the ground.
   */
  _doFirePillar(x, y, damage, duration, radius, count) {
    damage = damage || 50;
    duration = duration || 2000;
    radius = radius || 60;
    count = count || 3;
    var game = window.game;
    var interval = duration / count;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          var px = x - 60 + Math.random() * 120;
          var py = y - 40 + Math.random() * 80;
          // Visual pillar
          game.addEntity({
            x: px, y: py, active: true, category: 'particle', drawLayer: 3,
            lifetime: 0.6, _age: 0, maxRadius: radius,
            update: function(dt) {
              this._age += dt;
              if (this._age >= this.lifetime) game.removeEntity(this);
              var enemies = game.enemies;
              for (var j = 0; j < enemies.length; j++) {
                var e = enemies[j];
                if (!e.active) continue;
                var dx = e.x - this.x, dy = e.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) < radius) {
                  e.takeDamage(damage);
                }
              }
            },
            draw: function(ctx) {
              var a = Math.max(0, 1 - this._age / this.lifetime);
              ctx.save();
              var grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
              grad.addColorStop(0, 'rgba(255,255,200,' + (a * 0.8) + ')');
              grad.addColorStop(0.5, 'rgba(255,150,50,' + (a * 0.5) + ')');
              grad.addColorStop(1, 'rgba(255,50,20,' + (a * 0.2) + ')');
              ctx.fillStyle = grad;
              ctx.beginPath(); ctx.arc(px, py, radius * (0.5 + 0.5 * (1 - this._age / this.lifetime)), 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
          game.addShake(3);
        }, idx * interval);
      })(i);
    }
  }

  /**
   * Pyroclasm: expanding ring of fire that damages enemies.
   */
  _doPyroclasm(x, y, damage, radius, expanding, duration) {
    damage = damage || 70;
    radius = radius || 300;
    expanding = expanding !== false;
    duration = duration || 2000;
    if (expanding) {
      // Use fireNova pattern but with pyroclasm visuals
      this._doShockwave(x, y, damage, radius);
    }
    // Visual: additional fire particles
    if (window.ParticleSystem) {
      window.ParticleSystem.spawn(x, y, {
        count: 16, speed: 200, life: 600,
        colors: ['#ff4400', '#ff8800', '#ffcc00', '#ffffff'],
        size: 4, gravity: -20
      });
      window.ParticleSystem.screenFlash('#ff4400', 200);
    }
    game.addShake(6);
  }

  /**
   * Inferno: persistent fire damage zone.
   */
  _doInferno(x, y, damage, duration, radius, burnDamage, burnDuration) {
    damage = damage || 25;
    duration = duration || 5000;
    radius = radius || 280;
    burnDamage = burnDamage || 10;
    burnDuration = burnDuration || 3000;
    // Reuse blizzard-like DOT zone pattern
    var game = window.game;
    var tickInterval = 300;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              e.burnTimer = Math.max(e.burnTimer || 0, burnDuration);
              e.burnDamage = Math.max(e.burnDamage || 0, burnDamage);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.4 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(255,200,50,' + (a * 0.6) + ')');
        grad.addColorStop(0.5, 'rgba(255,100,20,' + (a * 0.3) + ')');
        grad.addColorStop(1, 'rgba(200,40,10,' + (a * 0.1) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        // Ring
        ctx.strokeStyle = 'rgba(255,150,50,' + (a * 0.6) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (0.4 + 0.6 * Math.sin(this._elapsed * 0.005)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Flame Wave: cone of flame projectiles.
   */
  _doFlameWave(x, y, damage, radius, angle) {
    damage = damage || 45;
    radius = radius || 350;
    angle = angle !== undefined ? angle : 180;
    var player = this.player;
    var game = window.game;
    var targetAngle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
    var halfAngle = (angle * Math.PI / 180) / 2;
    var count = 8;
    if (window.BulletPatterns) {
      for (var i = 0; i < count; i++) {
        var a = targetAngle - halfAngle + (i / (count - 1)) * halfAngle * 2;
        window.BulletPatterns.flame(x, y, a, 350, damage, radius, '#ff6600', '#ff4400');
      }
    }
    if (window.ParticleSystem) window.ParticleSystem.screenFlash('#ff6600', 100);
  }

  // ----------------------------------------------------------------
  //  ICE / FROST
  // ----------------------------------------------------------------

  /**
   * Frost Nova: expanding ice ring that freezes enemies.
   */
  _doFrostNova(x, y, damage, radius, freezeDuration) {
    damage = damage || 55;
    radius = radius || 220;
    freezeDuration = freezeDuration || 2000;
    var game = window.game;
    game.addEntity({
      x: x, y: y, radius: 20, maxRadius: radius, damage: damage, freezeDuration: freezeDuration,
      active: true, category: 'particle', drawLayer: 3, _hitEnemies: {},
      update: function(dt) {
        this.radius += 400 * dt;
        if (this.radius >= this.maxRadius) { game.removeEntity(this); return; }
        var enemies = game.enemies;
        for (var i = enemies.length - 1; i >= 0; i--) {
          var e = enemies[i];
          if (!e.active || this._hitEnemies[e._id]) continue;
          var dx = e.x - this.x, dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
            this._hitEnemies[e._id] = true;
            e.takeDamage(this.damage);
            e.frozenTimer = Math.max(e.frozenTimer || 0, this.freezeDuration);
          }
        }
      },
      draw: function(ctx) {
        var alpha = 1 - (this.radius / this.maxRadius);
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, ' + (alpha * 0.8) + ')';
        ctx.lineWidth = 4 * alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(200, 240, 255, ' + (alpha * 0.5) + ')';
        ctx.lineWidth = 2 * alpha;
        ctx.stroke();
        ctx.restore();
      }
    });
    if (window.ParticleSystem) {
      window.ParticleSystem.nova(x, y, '#88ddff');
    }
    game.addShake(4);
  }

  /**
   * Ice Wall: create a temporary wall that blocks enemies and bullets.
   */
  _doIceWall(x, y, duration, wallWidth, hp, blocksBullets) {
    duration = duration || 4000;
    wallWidth = wallWidth || 300;
    hp = hp || 200;
    blocksBullets = blocksBullets !== false;
    var game = window.game;
    var player = this.player;
    var wallX = player.x + 60;
    var wallY = player.y;
    var wall = {
      x: wallX, y: wallY, w: wallWidth, h: 20, hp: hp, maxHp: hp,
      active: true, category: 'particle', drawLayer: 4,
      duration: duration / 1000, _elapsed: 0,
      update: function(dt) {
        this._elapsed += dt;
        // Follow player with offset
        this.x = player.x + 60; this.y = player.y;
        if (this._elapsed >= this.duration || this.hp <= 0) { game.removeEntity(this); return; }
      },
      draw: function(ctx) {
        var a = Math.max(0.3, 1 - this._elapsed / this.duration);
        var hpPct = this.hp / this.maxHp;
        ctx.save();
        ctx.fillStyle = 'rgba(100, 200, 255, ' + (a * 0.4 * hpPct) + ')';
        var x = this.x - this.w / 2;
        ctx.fillRect(x, this.y - this.h / 2, this.w, this.h);
        ctx.strokeStyle = 'rgba(150, 220, 255, ' + (a * 0.8) + ')';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, this.y - this.h / 2, this.w, this.h);
        ctx.restore();
      }
    };
    game.addEntity(wall);
  }

  /**
   * Hailstorm: rain ice shards over an area.
   */
  _doHailstorm(x, y, damage, count, duration, radius, slowAmount) {
    damage = damage || 35;
    count = count || 20;
    duration = duration || 3000;
    radius = radius || 300;
    slowAmount = slowAmount || 0.3;
    var game = window.game;
    var interval = duration / count;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          var hx = x - radius / 2 + Math.random() * radius;
          var hy = y - radius / 2 + Math.random() * radius - 50;
          // Ice shard projectile
          if (window.BulletPatterns && window.Bullet) {
            var b = new window.Bullet({
              x: hx, y: hy, vx: 0, vy: 200 + Math.random() * 100,
              damage: damage, speed: 250, size: 3, color: '#88ddff',
              trailColor: '#aaddff', category: 'playerBullet',
              lifetime: 1.5, slowAmount: slowAmount, slowDuration: 2000
            });
            game.addEntity(b);
          }
        }, idx * interval);
      })(i);
    }
  }

  /**
   * Frost Armor: temporary defense buff that freezes attackers.
   */
  _doFrostArmor(duration, freezeAttackers, freezeDuration, defense) {
    duration = duration || 6000;
    freezeAttackers = freezeAttackers !== false;
    freezeDuration = freezeDuration || 1500;
    defense = defense || 0.2;
    var player = this.player;
    // Apply defensive buff
    this._applyTempStatMod({ stat: 'defense', op: 'add', value: defense }, duration);
    // Track freeze-on-hit
    player._frostArmorTimer = Math.max(player._frostArmorTimer || 0, duration);
    player._frostArmorFreezeDuration = freezeDuration;
    // Visual: blue aura
    var game = window.game;
    game.addEntity({
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 4,
      _age: 0, lifetime: duration / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this.lifetime) { game.removeEntity(this); return; }
        if (game.player && game.player.active) { this.x = game.player.x; this.y = game.player.y; }
      },
      draw: function(ctx) {
        var a = 0.3 + 0.2 * Math.sin(this._age * 4);
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, ' + a + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20 + 5 * Math.sin(this._age * 3), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // ----------------------------------------------------------------
  //  LIGHTNING / THUNDER
  // ----------------------------------------------------------------

  /**
   * Thunderbolt: powerful single-target lightning strike.
   */
  _doThunderbolt(x, y, damage, radius, stunDuration) {
    damage = damage || 120;
    radius = radius || 100;
    stunDuration = stunDuration || 1000;
    var game = window.game;
    var enemies = game.enemies;
    // Find nearest enemy
    var nearest = null, nearestDist = Infinity;
    var player = this.player;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - player.x, dy = e.y - player.y;
      var d = dx * dx + dy * dy;
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    }
    if (!nearest) return;
    // Strike
    nearest.takeDamage(damage);
    if (window.ParticleSystem) {
      window.ParticleSystem.lightning(player.x, player.y, nearest.x, nearest.y, '#ffff88');
      window.ParticleSystem.screenFlash('#ffff88', 100);
    }
    game.addShake(5);
    // AOE damage around target
    var px = nearest.x, py = nearest.y;
    for (var j = 0; j < enemies.length; j++) {
      var e2 = enemies[j];
      if (!e2.active || e2 === nearest) continue;
      var ddx = e2.x - px, ddy = e2.y - py;
      if (Math.sqrt(ddx * ddx + ddy * ddy) < radius) {
        e2.takeDamage(Math.floor(damage * 0.5));
        if (stunDuration) {
          e2._paralyzeTimer = Math.max(e2._paralyzeTimer || 0, stunDuration);
        }
      }
    }
  }

  /**
   * Lightning Dash: dash forward leaving a trail of lightning damage.
   */
  _doLightningDash(damage, trailDamage, distance, trailDuration) {
    damage = damage || 60;
    trailDamage = trailDamage || 20;
    distance = distance || 350;
    trailDuration = trailDuration || 1500;
    var player = this.player;
    var game = window.game;
    var startX = player.x, startY = player.y;
    var targetX = game.mouseX, targetY = game.mouseY;
    var dx = targetX - startX, dy = targetY - startY;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var normX = dx / dist, normY = dy / dist;
    var endX = startX + normX * distance, endY = startY + normY * distance;
    // Teleport player
    player.x = endX; player.y = endY;
    // Lightning trail
    if (window.ParticleSystem) {
      window.ParticleSystem.lightning(startX, startY, endX, endY, '#88ffff');
    }
    // Damage enemies along the path
    var enemies = game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var ex = e.x, ey = e.y;
      // Check distance to line segment
      var t = Math.max(0, Math.min(1, ((ex - startX) * normX + (ey - startY) * normY) / distance));
      var cx = startX + normX * t * distance, cy = startY + normY * t * distance;
      var ddx = ex - cx, ddy = ey - cy;
      if (Math.sqrt(ddx * ddx + ddy * ddy) < 60) {
        e.takeDamage(damage);
      }
    }
    game.addShake(4);
  }

  /**
   * Static Field: persistent electric damage zone.
   */
  _doStaticField(x, y, damage, duration, radius, tickRate) {
    damage = damage || 10;
    duration = duration || 5000;
    radius = radius || 180;
    tickRate = tickRate || 300;
    var game = window.game;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickRate) {
          this._tickTimer -= tickRate;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              // Apply shock
              e._shockedTimer = Math.max(e._shockedTimer || 0, 500);
            }
          }
          // Visual spark
          if (window.ParticleSystem) {
            var enemies2 = game.enemies;
            for (var k = 0; k < enemies2.length; k++) {
              var ek = enemies2[k];
              if (!ek.active) continue;
              var ddx = ek.x - this.x, ddy = ek.y - this.y;
              if (Math.sqrt(ddx * ddx + ddy * ddy) < this.radius) {
                window.ParticleSystem.lightning(this.x, this.y, ek.x, ek.y, '#ffff44');
                break;
              }
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,100,' + a + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (0.6 + 0.4 * Math.sin(this._elapsed * 0.01)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Thunderclap: thunder AOE burst around player.
   */
  _doThunderclap(x, y, damage, radius, stunDuration) {
    damage = damage || 65;
    radius = radius || 250;
    stunDuration = stunDuration || 800;
    var game = window.game;
    var player = this.player;
    this._doShockwave(player.x, player.y, damage, radius);
    // Lightning visuals outward
    if (window.ParticleSystem) {
      var enemies = game.enemies;
      for (var i = 0; i < enemies.length && i < 6; i++) {
        var e = enemies[i];
        if (!e.active) continue;
        window.ParticleSystem.lightning(player.x, player.y, e.x, e.y, '#ffff44');
      }
      window.ParticleSystem.screenFlash('#ffff44', 150);
    }
    game.addShake(6);
  }

  // ----------------------------------------------------------------
  //  POISON / TOXIC
  // ----------------------------------------------------------------

  /**
   * Poison Cloud: persistent poison damage zone.
   */
  _doPoisonCloud(x, y, damage, duration, radius, poisonDamage, poisonDuration) {
    damage = damage || 12;
    duration = duration || 5000;
    radius = radius || 160;
    poisonDamage = poisonDamage || 8;
    poisonDuration = poisonDuration || 3000;
    var game = window.game;
    var tickInterval = 500;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              e.poisonTimer = Math.max(e.poisonTimer || 0, poisonDuration);
              e.poisonDamage = Math.max(e.poisonDamage || 0, poisonDamage);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(80,220,60,' + (a * 0.5) + ')');
        grad.addColorStop(0.5, 'rgba(60,180,40,' + (a * 0.3) + ')');
        grad.addColorStop(1, 'rgba(40,120,30,' + (a * 0.1) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(80,200,60,' + (a * 0.5) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (0.5 + 0.5 * Math.sin(this._elapsed * 0.004)), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Toxic Nova: poison nova that damages and poisons enemies.
   */
  _doToxicNova(x, y, damage, radius, poisonDamage, poisonDuration) {
    damage = damage || 40;
    radius = radius || 280;
    poisonDamage = poisonDamage || 15;
    poisonDuration = poisonDuration || 4000;
    var game = window.game;
    this._doShockwave(x, y, damage, radius);
    // Apply poison to all enemies in radius
    var enemies = game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x, dy = e.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        e.poisonTimer = Math.max(e.poisonTimer || 0, poisonDuration);
        e.poisonDamage = Math.max(e.poisonDamage || 0, poisonDamage);
      }
    }
    if (window.ParticleSystem) {
      window.ParticleSystem.spawn(x, y, {
        count: 20, speed: 200, life: 500,
        colors: ['#55cc44', '#88ff44', '#aaff00'], size: 3.5, gravity: 10
      });
    }
    game.addShake(4);
  }

  /**
   * Acid Rain: acid zone that damages and shreds defense.
   */
  _doAcidRain(x, y, damage, duration, radius, defenseShred) {
    damage = damage || 18;
    duration = duration || 5000;
    radius = radius || 350;
    defenseShred = defenseShred || 0.3;
    var game = window.game;
    var tickInterval = 400;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0, _shredEnemies: {},
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              // Defense shred via vulnerability
              if (defenseShred) {
                e._vulnerableTimer = Math.max(e._vulnerableTimer || 0, 1000);
                e._vulnerableMult = Math.max(e._vulnerableMult || 0, defenseShred);
              }
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(100,200,80,' + (a * 0.4) + ')');
        grad.addColorStop(0.5, 'rgba(60,160,40,' + (a * 0.2) + ')');
        grad.addColorStop(1, 'rgba(40,100,30,' + (a * 0.05) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        // Rain lines
        ctx.strokeStyle = 'rgba(80,200,60,' + (a * 0.3) + ')';
        ctx.lineWidth = 1;
        for (var i = 0; i < 10; i++) {
          var rx = this.x - this.radius + (this.radius * 2 * ((i + this._elapsed * 0.001) % 1));
          ctx.beginPath();
          ctx.moveTo(rx, this.y - this.radius);
          ctx.lineTo(rx + 5, this.y - this.radius + 20);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Venom Strike: single-target high poison damage strike.
   */
  _doVenomStrike(damage, poisonDamage, poisonDuration, singleTarget) {
    damage = damage || 80;
    poisonDamage = poisonDamage || 20;
    poisonDuration = poisonDuration || 4000;
    var game = window.game;
    var player = this.player;
    var enemies = game.enemies;
    // Find nearest enemy
    var nearest = null, nearestDist = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - player.x, dy = e.y - player.y;
      var d = dx * dx + dy * dy;
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    }
    if (!nearest) return;
    nearest.takeDamage(damage);
    nearest.poisonTimer = Math.max(nearest.poisonTimer || 0, poisonDuration);
    nearest.poisonDamage = Math.max(nearest.poisonDamage || 0, poisonDamage);
    // Visual
    if (window.ParticleSystem) {
      window.ParticleSystem.spawn(nearest.x, nearest.y, {
        count: 12, speed: 100, life: 400,
        colors: ['#55cc44', '#88ff44', '#aaff00'], size: 3, gravity: -20
      });
      window.ParticleSystem.damageNumber(nearest.x, nearest.y - 20, damage, '#55ff44');
    }
  }

  // ----------------------------------------------------------------
  //  SUMMON / MINIONS
  // ----------------------------------------------------------------

  /**
   * Summon Turret: deploy a temporary auto-firing turret.
   */
  _doSummonTurret(x, y, damage, duration, fireRate, count) {
    damage = damage || 10;
    duration = duration || 8000;
    fireRate = fireRate || 400;
    count = count || 1;
    var game = window.game;
    var player = this.player;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        var offsetX = (idx - (count - 1) / 2) * 50;
        var turret = {
          x: player.x + offsetX, y: player.y - 30,
          active: true, category: 'particle', drawLayer: 4,
          _elapsed: 0, _fireTimer: 0, _fireRate: fireRate,
          _damage: damage, _lifetime: duration / 1000,
          update: function(dt) {
            this._elapsed += dt;
            if (this._elapsed >= this._lifetime) { game.removeEntity(this); return; }
            // Follow player
            this.x = player.x + offsetX; this.y = player.y - 30;
            // Auto-fire
            this._fireTimer += dt * 1000;
            if (this._fireTimer >= this._fireRate) {
              this._fireTimer -= this._fireRate;
              var enemies = game.enemies;
              var nearest = null, nd = Infinity;
              for (var j = 0; j < enemies.length; j++) {
                if (!enemies[j].active) continue;
                var dx = enemies[j].x - this.x, dy = enemies[j].y - this.y;
                var d = dx * dx + dy * dy;
                if (d < nd) { nd = d; nearest = enemies[j]; }
              }
              if (nearest) {
                var angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                if (window.Bullet) {
                  var b = new window.Bullet({
                    x: this.x, y: this.y,
                    vx: Math.cos(angle) * 400, vy: Math.sin(angle) * 400,
                    damage: this._damage, speed: 400, size: 3,
                    color: '#ffaa44', trailColor: '#ff8800',
                    category: 'playerBullet', lifetime: 2
                  });
                  game.addEntity(b);
                }
              }
            }
          },
          draw: function(ctx) {
            var a = Math.max(0.3, 1 - this._elapsed / this._lifetime);
            ctx.save(); ctx.globalAlpha = a;
            ctx.fillStyle = '#ffaa44';
            ctx.fillRect(this.x - 8, this.y - 4, 16, 8);
            ctx.fillStyle = '#ffcc66';
            ctx.fillRect(this.x - 4, this.y - 10, 8, 6);
            ctx.restore();
          }
        };
        game.addEntity(turret);
      })(i);
    }
  }

  /**
   * Summon Wolves: deploy temporary wolf minions that chase enemies.
   */
  _doSummonWolves(x, y, damage, duration, count, speed) {
    damage = damage || 25;
    duration = duration || 10000;
    count = count || 2;
    speed = speed || 200;
    var game = window.game;
    var player = this.player;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        var wolf = {
          x: player.x + (idx - (count - 1) / 2) * 40, y: player.y + 20,
          active: true, category: 'particle', drawLayer: 4,
          _elapsed: 0, _lifetime: duration / 1000, _speed: speed,
          _damage: damage, _target: null, _attackTimer: 0, _attackRate: 600,
          update: function(dt) {
            this._elapsed += dt;
            if (this._elapsed >= this._lifetime) { game.removeEntity(this); return; }
            // Find nearest enemy
            var enemies = game.enemies;
            var nearest = null, nd = Infinity;
            for (var j = 0; j < enemies.length; j++) {
              if (!enemies[j].active) continue;
              var dx = enemies[j].x - this.x, dy = enemies[j].y - this.y;
              var d = dx * dx + dy * dy;
              if (d < nd && d < 350 * 350) { nd = d; nearest = enemies[j]; }
            }
            if (nearest) {
              var dx = nearest.x - this.x, dy = nearest.y - this.y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 20) {
                this.x += (dx / dist) * this._speed * dt;
                this.y += (dy / dist) * this._speed * dt;
              }
              // Attack
              this._attackTimer += dt * 1000;
              if (this._attackTimer >= this._attackRate && dist < 40) {
                this._attackTimer -= this._attackRate;
                nearest.takeDamage(this._damage);
              }
            } else {
              // Follow player
              var dx = player.x - this.x, dy = player.y - this.y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 30) {
                this.x += (dx / dist) * this._speed * 0.5 * dt;
                this.y += (dy / dist) * this._speed * 0.5 * dt;
              }
            }
          },
          draw: function(ctx) {
            var a = Math.max(0.3, 1 - this._elapsed / this._lifetime);
            ctx.save(); ctx.globalAlpha = a;
            ctx.fillStyle = '#88aaff';
            ctx.beginPath();
            // Wolf shape (triangle + ears)
            ctx.moveTo(this.x + 10, this.y);
            ctx.lineTo(this.x - 6, this.y - 6);
            ctx.lineTo(this.x - 6, this.y + 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#aaccff';
            ctx.beginPath();
            ctx.arc(this.x - 2, this.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        };
        game.addEntity(wolf);
      })(i);
    }
  }

  /**
   * Landmine: deploy proximity mines that explode when enemies approach.
   */
  _doLandmine(x, y, damage, radius, count, duration) {
    damage = damage || 100;
    radius = radius || 120;
    count = count || 3;
    duration = duration || 15000;
    var game = window.game;
    var player = this.player;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        var offsetX = (Math.random() - 0.5) * 120;
        var offsetY = (Math.random() - 0.5) * 80;
        var mine = {
          x: player.x + offsetX, y: player.y + offsetY,
          active: true, category: 'particle', drawLayer: 3,
          _elapsed: 0, _lifetime: duration / 1000, _exploded: false,
          _damage: damage, _radius: radius,
          update: function(dt) {
            this._elapsed += dt;
            if (this._elapsed >= this._lifetime || this._exploded) {
              if (this._exploded && !this._removed) {
                this._removed = true;
                game.removeEntity(this);
              } else if (!this._exploded) {
                game.removeEntity(this);
              }
              return;
            }
            // Check for nearby enemies
            var enemies = game.enemies;
            for (var j = 0; j < enemies.length; j++) {
              var e = enemies[j];
              if (!e.active) continue;
              var dx = e.x - this.x, dy = e.y - this.y;
              if (Math.sqrt(dx * dx + dy * dy) < 30) {
                // Explode!
                this._exploded = true;
                this._removed = false;
                if (window.ParticleSystem) window.ParticleSystem.explosion(this.x, this.y, 'normal');
                game.addShake(4);
                for (var k = 0; k < enemies.length; k++) {
                  var e2 = enemies[k];
                  if (!e2.active) continue;
                  var ddx = e2.x - this.x, ddy = e2.y - this.y;
                  if (Math.sqrt(ddx * ddx + ddy * ddy) < this._radius) {
                    e2.takeDamage(this._damage);
                  }
                }
                this._age = this._lifetime; // force removal next frame
              }
            }
          },
          draw: function(ctx) {
            var a = Math.max(0.3, 1 - this._elapsed / this._lifetime);
            ctx.save(); ctx.globalAlpha = a;
            // Mine visual
            ctx.fillStyle = '#ff4444';
            ctx.beginPath(); ctx.arc(this.x, this.y, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffff00';
            ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        };
        game.addEntity(mine);
      })(i);
    }
  }

  /**
   * Arcane Missiles: homing projectiles that seek enemies.
   */
  _doArcaneMissiles(x, y, damage, count, homing, homingStrength) {
    damage = damage || 30;
    count = count || 8;
    homing = homing !== false;
    homingStrength = homingStrength || 0.08;
    var game = window.game;
    var player = this.player;
    if (window.BulletPatterns) {
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        window.BulletPatterns.homing(
          player.x + Math.cos(angle) * 20,
          player.y + Math.sin(angle) * 20,
          300, damage, '#aa88ff', '#8866cc',
          null, homingStrength
        );
      }
    }
  }

  // ----------------------------------------------------------------
  //  DEFENSE / BARRIER
  // ----------------------------------------------------------------

  /**
   * Barrier: temporary shield that absorbs damage.
   */
  _doBarrier(shieldAmount, duration, radius) {
    shieldAmount = shieldAmount || 60;
    duration = duration || 5000;
    radius = radius || 100;
    var player = this.player;
    player.maxShield = (player.maxShield || 0) + shieldAmount;
    player.shield = Math.min((player.shield || 0) + shieldAmount, player.maxShield);
    // Visual: barrier ring
    var game = window.game;
    game.addEntity({
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 5,
      _age: 0, lifetime: duration / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this.lifetime) { game.removeEntity(this); return; }
        if (game.player && game.player.active) { this.x = game.player.x; this.y = game.player.y; }
      },
      draw: function(ctx) {
        var a = 0.3 + 0.2 * Math.sin(this._age * 5);
        ctx.save();
        ctx.strokeStyle = 'rgba(68, 170, 255, ' + a + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Phalanx: rotating shield orbs that damage enemies and block bullets.
   */
  _doPhalanx(shieldOrbs, duration, orbDamage, blockBullets) {
    shieldOrbs = shieldOrbs || 4;
    duration = duration || 8000;
    orbDamage = orbDamage || 20;
    blockBullets = blockBullets !== false;
    var game = window.game;
    var player = this.player;
    for (var i = 0; i < shieldOrbs; i++) {
      (function(idx) {
        var orb = {
          x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 5,
          _age: 0, _lifetime: duration / 1000, _angle: (idx / shieldOrbs) * Math.PI * 2,
          _orbitRadius: 30, _damage: orbDamage,
          update: function(dt) {
            this._age += dt;
            if (this._age >= this._lifetime) { game.removeEntity(this); return; }
            this._angle += dt * 3; // rotate
            if (game.player && game.player.active) {
              this.x = game.player.x + Math.cos(this._angle) * this._orbitRadius;
              this.y = game.player.y + Math.sin(this._angle) * this._orbitRadius;
            }
            // Damage enemies on contact
            var enemies = game.enemies;
            for (var j = 0; j < enemies.length; j++) {
              var e = enemies[j];
              if (!e.active) continue;
              var dx = e.x - this.x, dy = e.y - this.y;
              if (Math.sqrt(dx * dx + dy * dy) < 20) {
                e.takeDamage(this._damage);
              }
            }
          },
          draw: function(ctx) {
            var a = Math.max(0.3, 1 - this._age / this._lifetime);
            ctx.save(); ctx.globalAlpha = a;
            ctx.fillStyle = '#66bbff';
            ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        };
        game.addEntity(orb);
      })(i);
    }
  }

  /**
   * Runic Shield: powerful shield that reflects and heals.
   */
  _doRunicShield(shieldAmount, duration, reflectDamage, healOnBlock) {
    shieldAmount = shieldAmount || 100;
    duration = duration || 8000;
    reflectDamage = reflectDamage || 0.3;
    healOnBlock = healOnBlock || 5;
    var player = this.player;
    player.maxShield = (player.maxShield || 0) + shieldAmount;
    player.shield = Math.min((player.shield || 0) + shieldAmount, player.maxShield);
    // Apply reflect + heal-on-block
    this._applyTempStatMod({ stat: 'shieldReflect', op: 'add', value: reflectDamage }, duration);
    // Track heal-on-block
    player._runicHealOnBlock = Math.max(player._runicHealOnBlock || 0, healOnBlock);
    // Visual: glowing runic aura
    var game = window.game;
    game.addEntity({
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 5,
      _age: 0, _lifetime: duration / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this._lifetime) { game.removeEntity(this); player._runicHealOnBlock = 0; return; }
        if (game.player && game.player.active) { this.x = game.player.x; this.y = game.player.y; }
      },
      draw: function(ctx) {
        var a = 0.4 + 0.2 * Math.sin(this._age * 4);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 30);
        grad.addColorStop(0, 'rgba(200,150,255,' + (a * 0.5) + ')');
        grad.addColorStop(0.5, 'rgba(150,100,200,' + (a * 0.3) + ')');
        grad.addColorStop(1, 'rgba(100,50,150,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, 30, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(200,150,255,' + a + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.x, this.y, 25, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Reverse Bullets: reverse enemy bullets in a radius.
   */
  _doReverseBullets(duration, radius, reflectedDamage) {
    duration = duration || 3000;
    radius = radius || 350;
    reflectedDamage = reflectedDamage || 1.5;
    var game = window.game;
    var player = this.player;
    // Apply bullet reflection buff
    player._reverseBulletsTimer = Math.max(player._reverseBulletsTimer || 0, duration);
    player._reverseBulletsRadius = radius;
    player._reverseBulletsMult = reflectedDamage;
    // Visual: glowing field
    game.addEntity({
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 5,
      _age: 0, _lifetime: duration / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this._lifetime) {
          if (game.player) { game.player._reverseBulletsTimer = 0; }
          game.removeEntity(this); return;
        }
        if (game.player && game.player.active) { this.x = game.player.x; this.y = game.player.y; }
      },
      draw: function(ctx) {
        var a = 0.3 + 0.2 * Math.sin(this._age * 4);
        ctx.save();
        ctx.strokeStyle = 'rgba(200,200,255,' + a + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * (0.3 + 0.1 * Math.sin(this._age * 2)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // ----------------------------------------------------------------
  //  MOBILITY / TELEPORT
  // ----------------------------------------------------------------

  /**
   * Teleport: instantly move to cursor position with AOE damage.
   */
  _doTeleport(range, damage, radius) {
    range = range || 350;
    damage = damage || 40;
    radius = radius || 120;
    var player = this.player;
    var game = window.game;
    var startX = player.x, startY = player.y;
    // Teleport toward cursor
    var dx = game.mouseX - player.x, dy = game.mouseY - player.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      var t = Math.min(dist, range) / dist;
      player.x += dx * t;
      player.y += dy * t;
    }
    // Damage at origin and destination
    if (window.ParticleSystem) window.ParticleSystem.explosion(startX, startY, 'small');
    if (window.ParticleSystem) window.ParticleSystem.explosion(player.x, player.y, 'small');
    // Damage enemies at both locations
    this._doShockwave(startX, startY, damage, radius);
    this._doShockwave(player.x, player.y, damage, radius);
    game.addShake(3);
  }

  /**
   * Warp Strike: teleport to nearest enemy and strike.
   */
  _doWarpStrike(damage, stunDuration, teleportToEnemy) {
    damage = damage || 150;
    stunDuration = stunDuration || 1000;
    var game = window.game;
    var player = this.player;
    var enemies = game.enemies;
    var nearest = null, nd = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - player.x, dy = e.y - player.y;
      var d = dx * dx + dy * dy;
      if (d < nd) { nd = d; nearest = e; }
    }
    if (!nearest) return;
    // Teleport to enemy
    var startX = player.x, startY = player.y;
    player.x = nearest.x + 20;
    player.y = nearest.y;
    // Damage and stun
    nearest.takeDamage(damage);
    if (stunDuration) {
      nearest._paralyzeTimer = Math.max(nearest._paralyzeTimer || 0, stunDuration);
    }
    // Visual
    if (window.ParticleSystem) {
      window.ParticleSystem.lightning(startX, startY, player.x, player.y, '#aa88ff');
      window.ParticleSystem.explosion(nearest.x, nearest.y, 'small');
      window.ParticleSystem.screenFlash('#aa88ff', 100);
    }
    game.addShake(5);
  }

  /**
   * Smoke Bomb: deploy smoke screen that slows enemies and grants stealth.
   */
  _doSmokeBomb(duration, radius, stealth, enemySlow) {
    duration = duration || 3000;
    radius = radius || 180;
    enemySlow = enemySlow || 0.3;
    var game = window.game;
    var player = this.player;
    // Grant stealth (enemies can't target)
    player._stealthTimer = Math.max(player._stealthTimer || 0, duration);
    // Slow enemies in radius
    var tickInterval = 300;
    var entity = {
      x: player.x, y: player.y, radius: radius, active: true, category: 'particle', drawLayer: 6,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this.x = player.x; this.y = player.y;
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickInterval) {
          this._tickTimer -= tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.slowTimer = Math.max(e.slowTimer || 0, 500);
              e.slowAmount = Math.max(e.slowAmount || 0, enemySlow);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(150,150,150,' + (a * 0.4) + ')');
        grad.addColorStop(0.5, 'rgba(100,100,100,' + (a * 0.2) + ')');
        grad.addColorStop(1, 'rgba(50,50,50,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Phantom Strike: rapid dash-slash combo hitting multiple enemies.
   */
  _doPhantomStrike(damage, count, dashDistance, slashRadius) {
    damage = damage || 50;
    count = count || 5;
    dashDistance = dashDistance || 100;
    slashRadius = slashRadius || 80;
    var game = window.game;
    var player = this.player;
    var enemies = game.enemies;
    var hitEnemies = {};
    var currentX = player.x, currentY = player.y;
    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          // Find nearest enemy not yet hit
          var target = null, nd = Infinity;
          for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (!e.active || hitEnemies[e._id]) continue;
            var dx = e.x - currentX, dy = e.y - currentY;
            var d = dx * dx + dy * dy;
            if (d < nd) { nd = d; target = e; }
          }
          if (!target) return;
          // Dash toward target
          var dx = target.x - currentX, dy = target.y - currentY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var t = Math.min(dist, dashDistance) / dist;
          currentX += dx * t; currentY += dy * t;
          // Slash damage in radius
          hitEnemies[target._id] = true;
          for (var k = 0; k < enemies.length; k++) {
            var ek = enemies[k];
            if (!ek.active) continue;
            var ddx = ek.x - currentX, ddy = ek.y - currentY;
            if (Math.sqrt(ddx * ddx + ddy * ddy) < slashRadius) {
              ek.takeDamage(damage);
              hitEnemies[ek._id] = true;
            }
          }
          // Visual
          if (window.ParticleSystem) {
            window.ParticleSystem.spawn(currentX, currentY, {
              count: 6, speed: 80, life: 300,
              colors: ['#aaccff', '#ffffff', '#88aaff'], size: 2.5, gravity: -15
            });
          }
        }, idx * 200);
      })(i);
    }
  }

  // ----------------------------------------------------------------
  //  AOE / EXPLOSION
  // ----------------------------------------------------------------

  /**
   * Chain Explosion: explosions chain from enemy to enemy.
   */
  _doChainExplosion(x, y, damage, radius, chainCount, chainRange) {
    damage = damage || 100;
    radius = radius || 150;
    chainCount = chainCount || 8;
    chainRange = chainRange || 180;
    var game = window.game;
    var enemies = game.enemies;
    var hit = {};
    // Find nearest enemy from x,y to start
    var current = null, nd = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x, dy = e.y - y;
      var d = dx * dx + dy * dy;
      if (d < nd) { nd = d; current = e; }
    }
    if (!current) return;
    var chainDmg = damage;
    var rangeSq = chainRange * chainRange;
    for (var c = 0; c < chainCount && current; c++) {
      var cid = current._uid || (current._uid = Math.random());
      if (hit[cid]) break;
      hit[cid] = true;
      // Explosion!
      current.takeDamage(chainDmg);
      if (window.ParticleSystem) window.ParticleSystem.explosion(current.x, current.y, 'small');
      game.addShake(3);
      // Find next target
      var next = null, nextDist = Infinity;
      for (var j = 0; j < enemies.length; j++) {
        var e2 = enemies[j];
        if (!e2.active) continue;
        var e2id = e2._uid || (e2._uid = Math.random());
        if (hit[e2id]) continue;
        var ddx = e2.x - current.x, ddy = e2.y - current.y;
        var dd = ddx * ddx + ddy * ddy;
        if (dd < rangeSq && dd < nextDist) { nextDist = dd; next = e2; }
      }
      current = next;
      chainDmg *= 0.8;
    }
  }

  /**
   * Doom: delayed massive area explosion.
   */
  _doDoom(x, y, damage, radius, delay, screenShake) {
    damage = damage || 500;
    radius = radius || 400;
    delay = delay || 3000;
    screenShake = screenShake !== false;
    var game = window.game;
    // Warning zone
    var warning = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 2,
      _age: 0, _lifetime: delay / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this._lifetime) {
          // EXPLOSION!
          game.removeEntity(this);
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
            }
          }
          if (window.ParticleSystem) {
            window.ParticleSystem.layeredExplosion(this.x, this.y, 'big');
            window.ParticleSystem.screenFlash('#ffffff', 300);
          }
          if (screenShake) game.addShake(15);
        }
      },
      draw: function(ctx) {
        var a = Math.min(1, this._age / this._lifetime);
        var pulse = 1 + Math.sin(this._age * 8) * 0.05;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,0,0,' + (0.3 + a * 0.4) + ')';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,0,0,' + (a * 0.1) + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    game.addEntity(warning);
  }

  /**
   * Earthquake: persistent tremor zone that damages and stuns.
   */
  _doEarthquake(x, y, damage, duration, radius, tickRate, stunChance) {
    damage = damage || 35;
    duration = duration || 3000;
    radius = radius || 400;
    tickRate = tickRate || 400;
    stunChance = stunChance || 0.3;
    var game = window.game;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickRate) {
          this._tickTimer -= tickRate;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              if (Math.random() < stunChance) {
                e._paralyzeTimer = Math.max(e._paralyzeTimer || 0, 500);
              }
            }
          }
          game.addShake(3);
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        ctx.strokeStyle = 'rgba(180,140,80,' + a + ')';
        ctx.lineWidth = 2;
        // Shaking ring
        var offset = (this._elapsed * 0.1) % 20 - 10;
        ctx.beginPath();
        ctx.arc(this.x + offset * Math.sin(this._elapsed * 0.05), this.y + offset * Math.cos(this._elapsed * 0.05),
          this.radius * (0.5 + 0.5 * Math.sin(this._elapsed * 0.003)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Plasma Ball: slow-moving orb of plasma that pierces enemies.
   */
  _doPlasmaBall(x, y, damage, speed, radius, duration, pierce) {
    damage = damage || 60;
    speed = speed || 150;
    radius = radius || 80;
    duration = duration || 6000;
    pierce = pierce !== false;
    var game = window.game;
    var player = this.player;
    var angle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
    if (window.Bullet) {
      var b = new window.Bullet({
        x: player.x, y: player.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        damage: damage, speed: speed, size: radius / 8,
        color: '#ff88ff', trailColor: '#cc44ff',
        category: 'playerBullet', lifetime: duration / 1000,
        explosionRadius: radius, pierceCount: pierce ? 10 : 0
      });
      game.addEntity(b);
    }
  }

  // ----------------------------------------------------------------
  //  SPECIAL / UNIQUE
  // ----------------------------------------------------------------

  /**
   * Laser Sweep: sweeping beam of laser damage.
   */
  _doLaserSweep(x, y, damage, duration, sweepAngle, beamLength, tickRate) {
    damage = damage || 15;
    duration = duration || 3000;
    sweepAngle = sweepAngle || 180;
    beamLength = beamLength || 500;
    tickRate = tickRate || 100;
    var game = window.game;
    var player = this.player;
    var halfSweep = sweepAngle * Math.PI / 180 / 2;
    var startAngle = -halfSweep;
    var endAngle = halfSweep;
    var beam = {
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 4,
      _elapsed: 0, _lifetime: duration / 1000, _tickTimer: 0,
      _currentAngle: startAngle,
      update: function(dt) {
        this._elapsed += dt;
        if (this._elapsed >= this._lifetime) { game.removeEntity(this); return; }
        this.x = player.x; this.y = player.y;
        // Sweep angle
        var t = this._elapsed / this._lifetime;
        this._currentAngle = startAngle + (endAngle - startAngle) * Math.sin(t * Math.PI);
        // Damage along beam
        var baseAngle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
        var beamAngle = baseAngle + this._currentAngle;
        var endX = this.x + Math.cos(beamAngle) * beamLength;
        var endY = this.y + Math.sin(beamAngle) * beamLength;
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickRate) {
          this._tickTimer -= tickRate;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            // Distance to line segment
            var dx = e.x - this.x, dy = e.y - this.y;
            var proj = (dx * Math.cos(beamAngle) + dy * Math.sin(beamAngle));
            proj = Math.max(0, Math.min(beamLength, proj));
            var cx = this.x + Math.cos(beamAngle) * proj;
            var cy = this.y + Math.sin(beamAngle) * proj;
            var ddx = e.x - cx, ddy = e.y - cy;
            if (Math.sqrt(ddx * ddx + ddy * ddy) < 20) {
              e.takeDamage(damage);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = Math.max(0.3, 1 - this._elapsed / this._lifetime);
        var baseAngle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
        var beamAngle = baseAngle + this._currentAngle;
        var endX = this.x + Math.cos(beamAngle) * beamLength;
        var endY = this.y + Math.sin(beamAngle) * beamLength;
        ctx.save();
        ctx.globalAlpha = a * 0.6;
        var grad = ctx.createLinearGradient(this.x, this.y, endX, endY);
        grad.addColorStop(0, 'rgba(255,100,100,0.8)');
        grad.addColorStop(0.3, 'rgba(255,200,100,0.5)');
        grad.addColorStop(1, 'rgba(255,50,50,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,200,' + (a * 0.8) + ')';
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(beam);
  }

  /**
   * Death Mark: mark enemies to take extra damage.
   */
  _doDeathMark(damageMultiplier, duration, targetCount) {
    damageMultiplier = damageMultiplier || 2.0;
    duration = duration || 5000;
    targetCount = targetCount || 3;
    var game = window.game;
    var player = this.player;
    var enemies = game.enemies;
    // Mark nearest enemies
    var marks = [];
    var allEnemies = [];
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].active) allEnemies.push(enemies[i]);
    }
    // Sort by distance to player
    allEnemies.sort(function(a, b) {
      var da = (a.x - player.x) * (a.x - player.x) + (a.y - player.y) * (a.y - player.y);
      var db = (b.x - player.x) * (b.x - player.x) + (b.y - player.y) * (b.y - player.y);
      return da - db;
    });
    for (var i = 0; i < Math.min(targetCount, allEnemies.length); i++) {
      var e = allEnemies[i];
      e._vulnerableTimer = Math.max(e._vulnerableTimer || 0, duration);
      e._vulnerableMult = Math.max(e._vulnerableMult || 0, damageMultiplier);
      if (window.ParticleSystem) {
        window.ParticleSystem.spawn(e.x, e.y, {
          count: 4, speed: 30, life: 400,
          colors: ['#ff0000', '#ff4444'], size: 3, gravity: -20
        });
      }
    }
  }

  /**
   * Blade Storm: spinning blades around player.
   */
  _doBladeStorm(x, y, damage, duration, radius, tickRate, pierce) {
    damage = damage || 15;
    duration = duration || 4000;
    radius = radius || 160;
    tickRate = tickRate || 150;
    pierce = pierce !== false;
    var game = window.game;
    var player = this.player;
    var entity = {
      x: player.x, y: player.y, radius: radius, active: true, category: 'particle', drawLayer: 4,
      _elapsed: 0, _tickTimer: 0, _angle: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this.x = player.x; this.y = player.y;
        this._angle += dt * 5;
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickRate) {
          this._tickTimer -= tickRate;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = Math.max(0.2, 1 - this._elapsed / duration);
        ctx.save(); ctx.globalAlpha = a;
        // Draw spinning blades
        var bladeCount = 4;
        for (var i = 0; i < bladeCount; i++) {
          var ba = this._angle + (i / bladeCount) * Math.PI * 2;
          var bx = this.x + Math.cos(ba) * this.radius * 0.6;
          var by = this.y + Math.sin(ba) * this.radius * 0.6;
          ctx.fillStyle = '#aaccff';
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(ba);
          ctx.beginPath();
          ctx.moveTo(10, 0); ctx.lineTo(-3, -4); ctx.lineTo(-3, 4); ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        // Outer circle
        ctx.strokeStyle = 'rgba(170,204,255,' + (a * 0.5) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Sunburst: holy burst of light that damages and heals.
   */
  _doSunburst(x, y, damage, radius, blindDuration, healAmount) {
    damage = damage || 120;
    radius = radius || 300;
    blindDuration = blindDuration || 2000;
    healAmount = healAmount || 40;
    var game = window.game;
    var player = this.player;
    // Heal player
    if (healAmount > 0) player.heal(healAmount);
    // Holy nova damage
    this._doShockwave(x, y, damage, radius);
    // Blind enemies (reduce accuracy)
    var enemies = game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x, dy = e.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        e._blindTimer = Math.max(e._blindTimer || 0, blindDuration);
        e._blindAmount = 0.5;
      }
    }
    // Visual
    if (window.ParticleSystem) {
      window.ParticleSystem.spawn(x, y, {
        count: 30, speed: 200, life: 600,
        colors: ['#ffffcc', '#ffffff', '#ffff88', '#ffdd66'], size: 4, gravity: -30
      });
      window.ParticleSystem.screenFlash('#ffffcc', 300);
      window.ParticleSystem.damageNumber(x, y - 30, '+' + healAmount, '#44ff44');
    }
    game.addShake(6);
  }

  /**
   * Avalanche: crush enemies with a wave of ice and force.
   */
  _doAvalanche(x, y, damage, duration, radius, pushForce, slowAmount) {
    damage = damage || 70;
    duration = duration || 3000;
    radius = radius || 250;
    pushForce = pushForce || 100;
    slowAmount = slowAmount || 0.5;
    var game = window.game;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0, _tickInterval: 500,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= this._tickInterval) {
          this._tickTimer -= this._tickInterval;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.radius) {
              e.takeDamage(damage);
              // Push enemies away from center
              if (pushForce && dist > 1) {
                e.x += (dx / dist) * pushForce;
                e.y += (dy / dist) * pushForce;
              }
              // Slow
              e.slowTimer = Math.max(e.slowTimer || 0, 1500);
              e.slowAmount = Math.max(e.slowAmount || 0, slowAmount);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(150,200,255,' + (a * 0.4) + ')');
        grad.addColorStop(0.5, 'rgba(120,180,220,' + (a * 0.2) + ')');
        grad.addColorStop(1, 'rgba(100,150,200,' + (a * 0.05) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(150,200,255,' + (a * 0.6) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (0.3 + 0.7 * ((this._elapsed % 1000) / 1000)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Soul Drain: draining zone that damages and heals.
   */
  _doSoulDrain(x, y, damage, lifesteal, duration, radius) {
    damage = damage || 30;
    lifesteal = lifesteal || 0.5;
    duration = duration || 3000;
    radius = radius || 200;
    var game = window.game;
    var player = this.player;
    var entity = {
      x: x, y: y, radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0, _tickInterval: 500,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= this._tickInterval) {
          this._tickTimer -= this._tickInterval;
          var enemies = game.enemies;
          var totalDmg = 0;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              totalDmg += damage;
            }
          }
          // Heal player based on damage dealt
          if (totalDmg > 0 && lifesteal > 0) {
            player.heal(Math.floor(totalDmg * lifesteal));
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(180,80,220,' + (a * 0.5) + ')');
        grad.addColorStop(0.5, 'rgba(130,50,180,' + (a * 0.3) + ')');
        grad.addColorStop(1, 'rgba(80,30,120,' + (a * 0.1) + ')');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        // Soul particles streaming to player
        ctx.strokeStyle = 'rgba(200,100,255,' + (a * 0.4) + ')';
        ctx.lineWidth = 1;
        for (var i = 0; i < 4; i++) {
          var px = this.x + Math.cos(i * 1.57 + this._elapsed * 0.005) * this.radius * 0.3;
          var py = this.y + Math.sin(i * 1.57 + this._elapsed * 0.005) * this.radius * 0.3;
          ctx.beginPath(); ctx.moveTo(px, py);
          ctx.lineTo(player.x, player.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Void Sphere: slow-moving orb that pulls enemies toward its center.
   */
  _doVoidSphere(x, y, damage, speed, radius, duration, pullForce) {
    damage = damage || 25;
    speed = speed || 100;
    radius = radius || 60;
    duration = duration || 5000;
    pullForce = pullForce || 60;
    var game = window.game;
    var player = this.player;
    var angle = Math.atan2(game.mouseY - player.y, game.mouseX - player.x);
    if (window.Bullet) {
      var b = new window.Bullet({
        x: player.x, y: player.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        damage: damage, speed: speed, size: 6,
        color: '#8844cc', trailColor: '#6622aa',
        category: 'playerBullet', lifetime: duration / 1000,
        wellRadius: radius * 2, pullForce: pullForce,
        pierceCount: 5
      });
      game.addEntity(b);
    }
  }

  /**
   * Enrage: self-buff that increases attack and speed but increases damage taken.
   */
  _doEnrage(attackBoost, speedBoost, duration, takeMoreDamage) {
    attackBoost = attackBoost || 1.4;
    speedBoost = speedBoost || 1.3;
    duration = duration || 5000;
    takeMoreDamage = takeMoreDamage || 0.2;
    var player = this.player;
    this._applyTempStatMod({ stat: 'attack', op: 'multiply', value: attackBoost }, duration);
    this._applyTempStatMod({ stat: 'attackSpeed', op: 'multiply', value: speedBoost - 1 }, duration);
    // Track vulnerability
    player._enrageVulnerability = Math.max(
      (player._enrageVulnerability || 0) + takeMoreDamage,
      takeMoreDamage
    );
    setTimeout(function() {
      if (player) player._enrageVulnerability = 0;
    }, duration);
    // Visual: rage aura
    var game = window.game;
    game.addEntity({
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 4,
      _age: 0, _lifetime: duration / 1000,
      update: function(dt) {
        this._age += dt;
        if (this._age >= this._lifetime) { game.removeEntity(this); return; }
        if (game.player && game.player.active) { this.x = game.player.x; this.y = game.player.y; }
      },
      draw: function(ctx) {
        var a = 0.3 + 0.3 * Math.sin(this._age * 6);
        ctx.save();
        ctx.fillStyle = 'rgba(255,50,50,' + (a * 0.2) + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20 + 10 * Math.sin(this._age * 4), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,100,50,' + a + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 25 + 5 * Math.sin(this._age * 5), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  /**
   * Healing Ward: stationary ward that heals the player.
   */
  _doHealingWard(x, y, healPerSec, duration, radius) {
    healPerSec = healPerSec || 4;
    duration = duration || 8000;
    radius = radius || 200;
    var game = window.game;
    var player = this.player;
    var entity = {
      x: y !== undefined ? x : player.x,
      y: y !== undefined ? y : player.y,
      radius: radius, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0, _tickInterval: 500,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= this._tickInterval) {
          this._tickTimer -= this._tickInterval;
          // Heal player if within radius
          var dx = player.x - this.x, dy = player.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
            var healAmt = healPerSec * (this._tickInterval / 1000);
            player.heal(Math.max(1, Math.floor(healAmt)));
            if (window.ParticleSystem) {
              window.ParticleSystem.healEffect(player.x, player.y);
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.3 * (1 - this._elapsed / duration);
        ctx.save();
        // Golden healing circle
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(100,255,100,' + (a * 0.3) + ')');
        grad.addColorStop(0.5, 'rgba(80,200,80,' + (a * 0.15) + ')');
        grad.addColorStop(1, 'rgba(50,150,50,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        // Cross symbol
        ctx.strokeStyle = 'rgba(100,255,100,' + (a * 0.7) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y); ctx.lineTo(this.x + 8, this.y);
        ctx.moveTo(this.x, this.y - 8); ctx.lineTo(this.x, this.y + 8);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Lightning Rod: repeatedly strikes a random enemy with lightning.
   */
  _doLightningRod(x, y, damage, duration, radius, strikeInterval, targetRandomEnemy) {
    damage = damage || 50;
    duration = duration || 5000;
    radius = radius || 100;
    strikeInterval = strikeInterval || 800;
    targetRandomEnemy = targetRandomEnemy !== false;
    var game = window.game;
    var player = this.player;
    var entity = {
      x: player.x, y: player.y, active: true, category: 'particle', drawLayer: 3,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this.x = player.x; this.y = player.y;
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= strikeInterval) {
          this._tickTimer -= strikeInterval;
          var enemies = game.enemies;
          var validTargets = [];
          for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].active) validTargets.push(enemies[i]);
          }
          if (validTargets.length === 0) return;
          var target = targetRandomEnemy
            ? validTargets[Math.floor(Math.random() * validTargets.length)]
            : validTargets[0];
          // Strike
          target.takeDamage(damage);
          if (window.ParticleSystem) {
            window.ParticleSystem.lightning(this.x, this.y, target.x, target.y, '#ffff44');
          }
          // AOE around target
          for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (!e.active || e === target) continue;
            var dx = e.x - target.x, dy = e.y - target.y;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
              e.takeDamage(Math.floor(damage * 0.5));
              e._shockedTimer = Math.max(e._shockedTimer || 0, 500);
            }
          }
          game.addShake(2);
        }
      },
      draw: function(ctx) {
        var a = 0.3 + 0.2 * Math.sin(this._elapsed * 0.01);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,100,' + a + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12 + 3 * Math.sin(this._elapsed * 0.005), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  /**
   * Frozen Comet: powerful ice comet that impacts with splash.
   */
  _doFrozenComet(x, y, damage, radius, freezeDuration, impactDamage, splashRadius) {
    damage = damage || 130;
    radius = radius || 120;
    freezeDuration = freezeDuration || 2500;
    impactDamage = impactDamage || 60;
    splashRadius = splashRadius || 80;
    var game = window.game;
    var player = this.player;
    // Find nearest enemy as target
    var enemies = game.enemies;
    var target = null, nd = Infinity;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - player.x, dy = e.y - player.y;
      var d = dx * dx + dy * dy;
      if (d < nd) { nd = d; target = e; }
    }
    if (!target) return;
    // Impact visual
    if (window.ParticleSystem) {
      window.ParticleSystem.nova(target.x, target.y, '#88ddff');
      window.ParticleSystem.screenFlash('#88ddff', 200);
    }
    game.addShake(6);
    // Primary target damage + freeze
    target.takeDamage(damage);
    target.frozenTimer = Math.max(target.frozenTimer || 0, freezeDuration);
    // Splash damage
    if (impactDamage > 0) {
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active || e === target) continue;
        var dx = e.x - target.x, dy = e.y - target.y;
        if (Math.sqrt(dx * dx + dy * dy) < (splashRadius + radius)) {
          e.takeDamage(impactDamage);
          e.frozenTimer = Math.max(e.frozenTimer || 0, freezeDuration * 0.5);
        }
      }
    }
  }

  /**
   * Whirlwind: spinning blades of wind around player.
   */
  _doWhirlwind(x, y, damage, duration, radius, tickRate) {
    damage = damage || 20;
    duration = duration || 2000;
    radius = radius || 120;
    tickRate = tickRate || 200;
    var game = window.game;
    var player = this.player;
    var entity = {
      x: player.x, y: player.y, radius: radius, active: true, category: 'particle', drawLayer: 4,
      _elapsed: 0, _tickTimer: 0,
      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= duration) { game.removeEntity(this); return; }
        this.x = player.x; this.y = player.y;
        this._tickTimer += dt * 1000;
        if (this._tickTimer >= tickRate) {
          this._tickTimer -= tickRate;
          var enemies = game.enemies;
          for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (!e.active) continue;
            var dx = e.x - this.x, dy = e.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
              e.takeDamage(damage);
              // Push
              if (Math.sqrt(dx * dx + dy * dy) > 5) {
                var dist = Math.sqrt(dx * dx + dy * dy);
                e.x += (dx / dist) * 20;
                e.y += (dy / dist) * 20;
              }
            }
          }
        }
      },
      draw: function(ctx) {
        var a = 0.4 * (1 - this._elapsed / duration);
        ctx.save(); ctx.globalAlpha = a;
        // Spinning wind lines
        for (var i = 0; i < 6; i++) {
          var ba = this._elapsed * 0.005 + (i / 6) * Math.PI * 2;
          var bx = this.x + Math.cos(ba) * this.radius;
          var by = this.y + Math.sin(ba) * this.radius;
          ctx.strokeStyle = '#88ffaa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    game.addEntity(entity);
  }

  // ====================================================================
  //  TEMPORARY STAT BUFFS
  // ====================================================================

  /**
   * Apply a temporary stat modifier, track it for later removal.
   * @param {object} mod - { stat, op, value }
   * @param {number} duration - Duration in ms
   */
  _applyTempStatMod(mod, duration) {
    var player = this.player;
    var tempId = this._nextTempId++;
    var taggedMod = {
      stat: mod.stat,
      op: mod.op || 'add',
      value: mod.value,
      _tempId: tempId
    };

    // Track this modifier
    this._tempBuffs.push({
      stat: mod.stat,
      _tempId: tempId,
      modRef: taggedMod
    });

    // Apply immediately
    if (!player._modifiers[mod.stat]) {
      player._modifiers[mod.stat] = [];
    }
    player._modifiers[mod.stat].push(taggedMod);
    player._recalculateStats();
  }

  /**
   * Register a timer for temporary buffs applied by a skill.
   * @param {object} skill - Skill config
   * @param {Array} effects - Applied effects
   */
  _registerTempTimer(skill, effects) {
    if (skill.duration && skill.duration > 0) {
      // Collect temp stat mods applied during _fireConditional
      var appliedMods = [];
      for (var i = 0; i < effects.length; i++) {
        var fx = effects[i];
        if (fx.stat !== undefined && fx.duration === undefined) {
          // These were applied as permanent (no duration on individual effects)
          // Need to remove them manually.
          // For conditional skills with duration, the stat effects should be temporary
          // We tag the most recently added modifiers as temp
          var addedMods = this.player._modifiers[fx.stat] || [];
          if (addedMods.length > 0) {
            var lastMod = addedMods[addedMods.length - 1];
            if (lastMod._tempId === undefined) {
              var tempId = this._nextTempId++;
              lastMod._tempId = tempId;
              this._tempBuffs.push({
                stat: fx.stat,
                _tempId: tempId,
                modRef: lastMod
              });
              appliedMods.push(lastMod);
            }
          }
        }
      }

      if (appliedMods.length > 0) {
        this._activeTimers.push({
          skillId: skill.id,
          remaining: skill.duration,
          mods: appliedMods
        });
      }
    }
  }

  /**
   * Remove temporary buffs when their timer expires.
   * @param {object} timer - Timer record from _activeTimers
   */
  _removeTempBuffs(timer) {
    var player = this.player;
    var modsRemoved = false;

    for (var i = 0; i < timer.mods.length; i++) {
      var mod = timer.mods[i];
      var stat = mod.stat;
      var mods = player._modifiers[stat];
      if (mods) {
        for (var j = mods.length - 1; j >= 0; j--) {
          if (mods[j]._tempId === mod._tempId) {
            mods.splice(j, 1);
            modsRemoved = true;
          }
        }
      }
      // Clean up _tempBuffs
      for (var k = this._tempBuffs.length - 1; k >= 0; k--) {
        if (this._tempBuffs[k]._tempId === mod._tempId) {
          this._tempBuffs.splice(k, 1);
        }
      }
    }

    if (modsRemoved) {
      player._recalculateStats();
    }
  }

  // ====================================================================
  //  UTILITY
  // ====================================================================

  /**
   * Find a skill config by ID.
   * @param {string} skillId
   * @returns {object|null}
   */
  _findSkill(skillId) {
    for (var i = 0; i < GAME_CONFIG.SKILLS.length; i++) {
      if (GAME_CONFIG.SKILLS[i].id === skillId) return GAME_CONFIG.SKILLS[i];
    }
    return null;
  }

  /**
   * Spawn a player bullet entity.
   * @param {number} x - Origin X
   * @param {number} y - Origin Y
   * @param {number} angle - Direction in radians
   */
  _spawnPlayerBullet(x, y, angle) {
    var player = this.player;
    var speed = 550;
    var damage = 8;
    var size = 3;
    var color = '#ffff00';
    var trailColor = '#ffaa00';

    // Use player stats if available
    if (player.stats) {
      if (player.stats.bulletSpeed) speed = player.stats.bulletSpeed;
      if (player.stats.attack) damage = player.stats.attack * 1.5;
      if (player.stats.bulletSize) size = Math.max(2, player.stats.bulletSize);
    }

    if (window.Bullet) {
      var bullet = new window.Bullet({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: damage,
        speed: speed,
        size: size,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        lifetime: 3,
        pierceCount: (player.stats && player.stats.pierceCount) || 0
      });
      window.game.addEntity(bullet);
    }
  }

  /**
   * Collect random active enemies.
   * @param {number} count - Max enemies to collect
   * @returns {Array} Array of enemy objects
   */
  _getRandomEnemies(count) {
    var enemies = window.game.enemies;
    var active = [];
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].active) active.push(enemies[i]);
    }
    var result = [];
    var remaining = active.slice();
    for (var j = 0; j < count && remaining.length > 0; j++) {
      var idx = Math.floor(Math.random() * remaining.length);
      result.push(remaining[idx]);
      remaining.splice(idx, 1);
    }
    return result;
  }
}

// ====================================================================
//  GLOBAL BULLET SPAWNER HELPERS (for async bullet spawning)
// ====================================================================

// Used by _doBulletStorm's setTimeout closures
window._smBulletStorm = {
  spawnBullet: function(x, y, angle) {
    var player = window.game.player;
    if (!player || !player.active) return;
    var speed = 500;
    var damage = 6;
    var size = 2.5;
    if (player.stats) {
      if (player.stats.bulletSpeed) speed = player.stats.bulletSpeed;
      if (player.stats.attack) damage = player.stats.attack * 1.2;
      if (player.stats.bulletSize) size = Math.max(2, player.stats.bulletSize);
    }
    if (window.Bullet) {
      window.game.addEntity(new window.Bullet({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: damage,
        speed: speed,
        size: size,
        color: '#ff66aa',
        trailColor: '#ff3388',
        category: 'playerBullet',
        lifetime: 2.5
      }));
    }
  }
};

// Used by _doClone's fire callback
window._smCloneSpawnBullet = function(x, y, angle) {
  var player = window.game.player;
  if (!player || !player.active) return;
  var speed = 450;
  var damage = 5;
  var size = 2;
  if (player.stats) {
    if (player.stats.bulletSpeed) speed = player.stats.bulletSpeed * 0.8;
    if (player.stats.attack) damage = player.stats.attack * 0.8;
    if (player.stats.bulletSize) size = Math.max(2, player.stats.bulletSize * 0.7);
  }
  if (window.Bullet) {
    window.game.addEntity(new window.Bullet({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: damage,
      speed: speed,
      size: size,
      color: '#aa88ff',
      trailColor: '#8866cc',
      category: 'playerBullet',
      lifetime: 2.5
    }));
  }
};

// ====================================================================
//  TALENT MANAGER (per-run talent tree)
// ====================================================================

class TalentManager {
  constructor() {
    this.cfg = GAME_CONFIG.TALENTS;
    this.branches = this.cfg.branches;
    this.pointsPerRun = this.cfg.pointsPerRun || 5;
    this.bonusPerBoss = this.cfg.bonusPointsPerBoss || 1;
    this._factionId = null;

    this.remaining = 0;
    this.selected = {};
    this._player = null;

    this.reset();
  }

  /**
   * Bind selected faction — customizes faction_attack / faction_ultimate branch colors.
   */
  setFaction(factionId) {
    this._factionId = factionId;
    var f = GAME_CONFIG.FACTIONS && GAME_CONFIG.FACTIONS[factionId];
    if (!f) return;

    // Load handcrafted per-faction talent branches
    if (window.FactionTalents) {
      var fb = window.FactionTalents.getBranches(factionId);
      if (fb) {
        if (fb.attack) this.cfg.faction_attack = fb.attack;
        if (fb.ultimate) this.cfg.faction_ultimate = fb.ultimate;
      }
    } else if (f.color) {
      if (this.cfg.faction_attack) this.cfg.faction_attack.color = f.color;
      if (this.cfg.faction_ultimate) this.cfg.faction_ultimate.color = f.color;
    }
  }

  getLayerTotalPoints(branchId, layerIndex) {
    var branch = this.selected[branchId];
    if (!branch) return 0;
    var layer = branch[layerIndex];
    if (!layer || typeof layer !== 'object') return 0;
    var sum = 0;
    for (var id in layer) {
      if (layer.hasOwnProperty(id)) sum += layer[id];
    }
    return sum;
  }

  getTalentStack(branchId, layerIndex, talentId) {
    var branch = this.selected[branchId];
    if (!branch || !branch[layerIndex]) return 0;
    return branch[layerIndex][talentId] || 0;
  }

  isLayerUnlocked(branchId, layerIndex) {
    if (layerIndex <= 0) return true;
    return this.getLayerTotalPoints(branchId, layerIndex - 1) > 0;
  }

  /**
   * Reset for a new run.
   */
  reset() {
    this.remaining = this.pointsPerRun;
    this.selected = {};
    for (var i = 0; i < this.branches.length; i++) {
      this.selected[this.branches[i]] = {};
    }
    // Reset boss kill counter
    this._bossKillsThisRun = 0;
  }

  /**
   * Set player reference (called after player is created).
   */
  setPlayer(player) {
    this._player = player;
  }

  /**
   * Called when a boss is killed. Grants +1 talent point.
   */
  onBossKill() {
    this.remaining += this.bonusPerBoss;
  }

  /**
   * Check if a talent can be selected.
   * Rules: must have points; same talent/layer can be picked repeatedly;
   * layer N requires at least 1 point spent in layer N-1.
   */
  canSelect(branchId, layerIndex, talentId) {
    if (this.remaining <= 0) return false;
    if (!this.isLayerUnlocked(branchId, layerIndex)) return false;
    var branchCfg = this.cfg[branchId];
    if (!branchCfg || !branchCfg.layers || !branchCfg.layers[layerIndex]) return false;
    var layerCfg = branchCfg.layers[layerIndex];
    for (var i = 0; i < layerCfg.length; i++) {
      if (layerCfg[i].id === talentId) return true;
    }
    return false;
  }

  /**
   * Select a talent (stackable). Returns true if successful.
   */
  select(branchId, layerIndex, talentId) {
    if (!this.canSelect(branchId, layerIndex, talentId)) return false;

    if (!this.selected[branchId]) this.selected[branchId] = {};
    if (!this.selected[branchId][layerIndex]) this.selected[branchId][layerIndex] = {};
    var layer = this.selected[branchId][layerIndex];
    layer[talentId] = (layer[talentId] || 0) + 1;
    this.remaining--;

    if (this._player) {
      this._applyTalentEffects(branchId, layerIndex, talentId);
    }

    return true;
  }

  /**
   * Reset all talent selections (refund points).
   */
  resetSelections() {
    this.remaining = this.pointsPerRun + (this._bossKillsThisRun || 0) * this.bonusPerBoss;
    this.selected = {};
    for (var i = 0; i < this.branches.length; i++) {
      this.selected[this.branches[i]] = {};
    }
    // Note: player stat modifiers from talents are NOT removed
    // (they accumulate in _modifiers). A full reset would need modifier tracking.
    // For simplicity, we just reset the selection state.
  }

  /**
   * Apply all selected talent effects to player.
   * Called once when talents are confirmed (before game starts).
   */
  applyAllTalents(player) {
    this._player = player;
    for (var b = 0; b < this.branches.length; b++) {
      var branchId = this.branches[b];
      var branchSelections = this.selected[branchId];
      for (var layerIdx in branchSelections) {
        if (!branchSelections.hasOwnProperty(layerIdx)) continue;
        var layerMap = branchSelections[layerIdx];
        if (!layerMap || typeof layerMap !== 'object') continue;
        for (var talentId in layerMap) {
          if (!layerMap.hasOwnProperty(talentId)) continue;
          var stacks = layerMap[talentId] || 0;
          for (var s = 0; s < stacks; s++) {
            this._applyTalentEffects(branchId, parseInt(layerIdx, 10), talentId);
          }
        }
      }
    }
  }

  /**
   * Apply a single talent's effects to the player.
   */
  _applyTalentEffects(branchId, layerIndex, talentId) {
    var player = this._player;
    if (!player) return;

    // Find the talent config
    var branchCfg = this.cfg[branchId];
    if (!branchCfg || !branchCfg.layers) return;

    var layerCfg = branchCfg.layers[layerIndex];
    if (!layerCfg) return;

    var talent = null;
    for (var i = 0; i < layerCfg.length; i++) {
      if (layerCfg[i].id === talentId) { talent = layerCfg[i]; break; }
    }
    if (!talent) return;

    // Collect modifiers from effect
    var mods = [];
    var effect = talent.effect;
    if (!effect) return;

    if (effect.multi) {
      // Multi-effect: array of { stat, op, value }
      for (var m = 0; m < effect.multi.length; m++) {
        mods.push({
          stat: effect.multi[m].stat,
          op: effect.multi[m].op || 'add',
          value: effect.multi[m].value
        });
      }
    } else if (effect.stat) {
      var statName = effect.stat;
      if (statName === 'armorPen') statName = 'armorPenetration';
      mods.push({
        stat: statName,
        op: effect.op || 'add',
        value: effect.value
      });
    }

    if (mods.length > 0) {
      player.applyStatModifiers(mods);
    }
  }

  /**
   * Get all selected talent IDs (for UI display).
   */
  getSelectedIds() {
    var ids = [];
    for (var b = 0; b < this.branches.length; b++) {
      var branchId = this.branches[b];
      var branchSelections = this.selected[branchId];
      for (var layerIdx in branchSelections) {
        if (branchSelections.hasOwnProperty(layerIdx)) {
          ids.push(branchSelections[layerIdx]);
        }
      }
    }
    return ids;
  }

  /**
   * Get the selected talent ID for a specific branch and layer.
   * Returns talent ID string, or null if none selected.
   */
  getSelectedInLayer(branchId, layerIndex) {
    var branch = this.selected[branchId];
    if (!branch) return null;
    return branch[layerIndex] || null;
  }

  getSelectedCountInLayer(branchId, layerIndex) {
    return this.getLayerTotalPoints(branchId, layerIndex);
  }

  isTalentSelected(branchId, talentId) {
    var branch = this.selected[branchId];
    if (!branch) return false;
    for (var lk in branch) {
      if (!branch.hasOwnProperty(lk)) continue;
      var layerMap = branch[lk];
      if (layerMap && layerMap[talentId]) return true;
    }
    return false;
  }
}

// ====================================================================
//  ELEMENTAL REACTION SYSTEM
// ====================================================================

/**
 * Element Reaction System
 * Tracks active elements on enemies and triggers reactions when two combine.
 *
 * Elements: fire (burn), ice (freeze/slow), poison (DoT), lightning (chain)
 * Reactions:
 *   fire + ice       = steam      → blind (enemy accuracy reduced)
 *   fire + poison    = explosion  → AoE burst damage
 *   ice + lightning   = shatter    → enemy takes +50% damage
 *   poison + lightning = paralyze  → enemy frozen in place
 *
 * Integration: called from handleBulletHitEnemy in main.js.
 * Visual effects: ParticleSystem.reactionEffect()
 *
 * Global: window.ElementalReactionSystem
 */
var ElementalReactionSystem = {

  // --- Element type constants ---
  FIRE:      'fire',
  ICE:       'ice',
  POISON:    'poison',
  LIGHTNING: 'lightning',

  // --- Faction → primary element mapping ---
  FACTION_ELEMENTS: {
    elemental: 'fire',
    ice:       'ice',
    poison:    'poison',
    thunder:   'lightning'
  },

  // --- Reaction definitions (key is sorted pair) ---
  REACTIONS: {
    'fire+ice':        { name: 'melt',     effect: 'melt',     duration: 0,    damageMult: 2.0,  color: '#ffaaaa' },
    'fire+poison':     { name: 'explosion', effect: 'aoe',       duration: 0,    damageMult: 3.0,  radius: 120, color: '#ff6600' },
    'ice+lightning':   { name: 'shatter',   effect: 'shatter', duration: 0,    damageMult: 1.5,  color: '#88ffff', enhanceShock: true },
    'poison+lightning': { name: 'paralyze', effect: 'stun',      duration: 2000, damageMult: 0.8,  color: '#aaff00' }
  },

  // --- Per-enemy reaction cooldown (WeakMap) ---
  _reactionCooldowns: (typeof WeakMap !== 'undefined') ? new WeakMap() : null,
  _cooldownTimers: {},  // fallback for environments without WeakMap
  COOLDOWN_MS: 600,

  // ---------------------------------------------------------------
  //  HELPERS
  // ---------------------------------------------------------------

  /** Build sorted reaction key from two elements. */
  _key: function(a, b) {
    return a < b ? a + '+' + b : b + '+' + a;
  },

  /** Get/set cooldown for an enemy (supports WeakMap or uid fallback). */
  _getCooldown: function(enemy) {
    if (this._reactionCooldowns) return this._reactionCooldowns.get(enemy) || 0;
    var uid = enemy._elemUid || (enemy._elemUid = Math.random());
    return this._cooldownTimers[uid] || 0;
  },
  _setCooldown: function(enemy, ts) {
    if (this._reactionCooldowns) { this._reactionCooldowns.set(enemy, ts); return; }
    var uid = enemy._elemUid || (enemy._elemUid = Math.random());
    this._cooldownTimers[uid] = ts;
  },

  // ---------------------------------------------------------------
  //  ELEMENT QUERY
  // ---------------------------------------------------------------

  /**
   * Return array of active element type strings on the enemy.
   * Reads existing status-effect timers.
   */
  getActiveElements: function(enemy) {
    var list = [];
    if (enemy.burnTimer > 0)   list.push(this.FIRE);
    if (enemy.frozenTimer > 0 || enemy.slowTimer > 0) list.push(this.ICE);
    if (enemy.poisonTimer > 0) list.push(this.POISON);
    if (enemy._shockedTimer > 0) list.push(this.LIGHTNING);
    return list;
  },

  /**
   * Does the enemy currently have the given element active?
   */
  hasElement: function(enemy, element) {
    switch (element) {
      case this.FIRE:      return enemy.burnTimer > 0;
      case this.ICE:       return enemy.frozenTimer > 0 || enemy.slowTimer > 0;
      case this.POISON:    return enemy.poisonTimer > 0;
      case this.LIGHTNING: return enemy._shockedTimer > 0;
    }
    return false;
  },

  // ---------------------------------------------------------------
  //  REACTION TRIGGER
  // ---------------------------------------------------------------

  /**
   * Call after applying an element status effect to an enemy.
   * Checks whether another element is already present → triggers reaction.
   *
   * @param {object} enemy      - Enemy entity
   * @param {string} newElement - Element just applied (fire/ice/poison/lightning)
   * @param {number} baseDamage - Bullet damage (used for reaction damage scaling)
   * @param {object} player     - Player entity (for faction bonus)
   * @returns {object|null}     - Reaction data if triggered, null otherwise
   */
  checkAndTrigger: function(enemy, newElement, baseDamage, player) {
    if (!enemy || !enemy.active) return null;

    // Cooldown guard
    var now = Date.now ? Date.now() : +new Date();
    if (now - this._getCooldown(enemy) < this.COOLDOWN_MS) return null;

    // Find a complementary element already on the enemy
    var active = this.getActiveElements(enemy);
    for (var i = 0; i < active.length; i++) {
      var existing = active[i];
      if (existing === newElement) continue;

      var key = this._key(newElement, existing);
      var reaction = this.REACTIONS[key];
      if (!reaction) continue;

      // --- Reaction found ---
      this._setCooldown(enemy, now);

      // Calculate reaction damage
      var dmg = baseDamage * reaction.damageMult;

      // Faction element bonus
      if (player && player.factionId) {
        var bonus = this.getFactionBonus(player.factionId, newElement);
        if (bonus > 0) dmg = Math.floor(dmg * (1 + bonus));
      }

      // Apply reaction effect
      this._applyReaction(enemy, reaction, dmg);

      // Consume both elements
      this._clearElement(enemy, newElement);
      this._clearElement(enemy, existing);

      return reaction;
    }
    return null;
  },

  // ---------------------------------------------------------------
  //  REACTION EFFECTS
  // ---------------------------------------------------------------

  _applyReaction: function(enemy, reaction, damage) {
    var game = window.game;

    switch (reaction.effect) {
      case 'blind':
        // Steam: enemy accuracy reduced
        enemy._blindTimer = reaction.duration;
        enemy._blindAmount = 0.7; // 70% miss chance
        enemy.takeDamage(damage);
        break;

      case 'melt':
        // C4: Melt (fire+ice): double damage, clear both effects
        enemy.takeDamage(damage);
        break;

      case 'aoe':
        // Explosion: AoE burst around enemy
        enemy.takeDamage(damage);
        this._aoeExplosion(enemy.x, enemy.y, reaction.radius || 120, Math.floor(damage * 0.5));
        if (game) game.addShake(8);
        break;

      case 'shatter':
        // Shatter: instant damage + enhanced shock on nearby enemies
        enemy.takeDamage(damage);
        // C4: Enhanced Shock - chain to more targets with +50% range
        if (reaction.enhanceShock) {
          var enhancedRange = 180;
          var enhancedCount = 6;
          var chainTargets = [];
          for (var i = 0; i < game.enemies.length; i++) {
            var e = game.enemies[i];
            if (!e.active || e === enemy) continue;
            var dx = e.x - enemy.x, dy = e.y - enemy.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < enhancedRange) chainTargets.push({ enemy: e, dist: dist });
          }
          chainTargets.sort(function(a, b) { return a.dist - b.dist; });
          for (var j = 0; j < Math.min(chainTargets.length, enhancedCount); j++) {
            var target = chainTargets[j].enemy;
            var chainDmg = Math.floor(damage * 0.4);
            target.takeDamage(chainDmg);
            if (window.ParticleSystem) {
              window.ParticleSystem.lightning(enemy.x, enemy.y, target.x, target.y, '#88ffff');
            }
          }
        }
        break;

      case 'vulnerable':
        // Shatter: enemy takes increased damage
        enemy._vulnerableTimer = reaction.duration;
        enemy._vulnerableMult = 1.5;
        enemy.takeDamage(damage);
        break;

      case 'stun':
        // Paralyze: enemy completely stopped
        enemy._paralyzeTimer = reaction.duration;
        enemy.takeDamage(damage);
        break;
    }

    // Visual effects
    if (window.ParticleSystem) {
      window.ParticleSystem.reactionEffect(enemy.x, enemy.y, reaction.name);
      window.ParticleSystem.damageNumber(
        enemy.x, enemy.y - 20,
        reaction.name.toUpperCase() + '!',
        reaction.color || '#ffffff',
        false, true
      );
    }
  },

  /** AoE damage to nearby enemies. */
  _aoeExplosion: function(x, y, radius, damage) {
    var game = window.game;
    if (!game) return;
    var rSq = radius * radius;
    var enemies = game.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < rSq) {
        e.takeDamage(damage);
      }
    }
  },

  /** Remove a specific element from an enemy (clear its timer). */
  _clearElement: function(enemy, element) {
    switch (element) {
      case this.FIRE:      enemy.burnTimer = 0; break;
      case this.ICE:       enemy.frozenTimer = 0; enemy.slowTimer = 0; break;
      case this.POISON:    enemy.poisonTimer = 0; break;
      case this.LIGHTNING: enemy._shockedTimer = 0; break;
    }
  },

  // ---------------------------------------------------------------
  //  FACTION ELEMENT BONUS
  // ---------------------------------------------------------------

  /**
   * Returns bonus multiplier (0.25 = +25%) if player faction matches element.
   */
  getFactionBonus: function(factionId, element) {
    if (!factionId || !element) return 0;
    return this.FACTION_ELEMENTS[factionId] === element ? 0.25 : 0;
  },

  /**
   * Apply element damage bonus to a raw damage number.
   * Call from handleBulletHitEnemy when dealing element-sourced damage.
   */
  applyBonus: function(damage, player, element) {
    if (!player || !player.factionId) return damage;
    var bonus = this.getFactionBonus(player.factionId, element);
    return bonus > 0 ? Math.floor(damage * (1 + bonus)) : damage;
  },

  // ---------------------------------------------------------------
  //  PER-FRAME UPDATE (call from enemy update loop)
  // ---------------------------------------------------------------

  /**
   * Tick reaction-related timers on an enemy.
   * Call from enemies.js update() or from main.js game loop.
   */
  updateTimers: function(enemy, dt) {
    // Shocked timer
    if (enemy._shockedTimer > 0) {
      enemy._shockedTimer -= dt * 1000;
      if (enemy._shockedTimer <= 0) enemy._shockedTimer = 0;
    }
    // Blind timer
    if (enemy._blindTimer > 0) {
      enemy._blindTimer -= dt * 1000;
      if (enemy._blindTimer <= 0) enemy._blindTimer = 0;
    }
    // Vulnerable timer
    if (enemy._vulnerableTimer > 0) {
      enemy._vulnerableTimer -= dt * 1000;
      if (enemy._vulnerableTimer <= 0) enemy._vulnerableTimer = 0;
    }
    // Paralyze timer
    if (enemy._paralyzeTimer > 0) {
      enemy._paralyzeTimer -= dt * 1000;
      if (enemy._paralyzeTimer <= 0) {
        enemy._paralyzeTimer = 0;
        enemy.speed = enemy.baseSpeed;
      }
    }
  }
};

// ====================================================================
//  AUTO-COMPLETE FACTION_SYSTEM — disabled (hand-crafted factions only)
// ====================================================================
if (false) (function _completeMissingFactions() {
  var factions = GAME_CONFIG.FACTIONS || {};
  var visualTypes = ['lightning', 'fire', 'ice', 'poison', 'holy', 'shadow', 'void', 'arc'];
  var vi = 0;
  for (var fid in factions) {
    if (!factions.hasOwnProperty(fid)) continue;
    if (FACTION_SYSTEM[fid]) continue;
    var f = factions[fid];
    var vt = visualTypes[vi % visualTypes.length];
    vi++;
    var skA = fid + '_ex1';
    var skB = fid + '_ex2';
    var skC = fid + '_ex3';
    var stats = f.baseStats || {};
    var effects = [];
    for (var sk in stats) {
      if (!stats.hasOwnProperty(sk)) continue;
      effects.push({ stat: sk, op: 'multiply', value: stats[sk] });
    }
    if (effects.length === 0) {
      effects.push({ stat: 'attack', op: 'multiply', value: 0.08 });
    }
    FACTION_SYSTEM[fid] = {
      corePassive: { effects: effects },
      exclusiveSkills: [skA, skB, skC],
      ultimate: {
        id: 'ut_' + fid, name: (f.icon || '✨') + ' ' + (f.name || fid) + '终极',
        faction: fid, type: 'passive', rarity: 'legendary', ultimate: true,
        description: (f.description || '') + ' — 终极形态',
        effects: effects.length ? effects : [{ stat: 'attack', op: 'multiply', value: 0.25 }],
        visualColor: f.color || '#ffffff', visualType: vt
      }
    };
    var skillDefs = [
      { id: skA, name: f.name + '·本能', type: 'passive', effects: effects.slice(0, 1) },
      { id: skB, name: f.name + '·战技', type: 'active', cooldown: 12000, effects: [{ action: 'nova', damage: 40, radius: 120 }] },
      { id: skC, name: f.name + '·秘术', type: 'conditional', trigger: 'onKill', effects: [{ action: 'heal', amount: 5 }] }
    ];
    for (var si = 0; si < skillDefs.length; si++) {
      var sd = skillDefs[si];
      var exists = false;
      for (var ki = 0; ki < GAME_CONFIG.SKILLS.length; ki++) {
        if (GAME_CONFIG.SKILLS[ki].id === sd.id) { exists = true; break; }
      }
      if (!exists) {
        GAME_CONFIG.SKILLS.push({
          id: sd.id, name: sd.name, faction: fid, type: sd.type,
          rarity: si === 0 ? 'uncommon' : (si === 1 ? 'rare' : 'epic'),
          cooldown: sd.cooldown, trigger: sd.trigger, effects: sd.effects
        });
      }
    }
    if (typeof _EXCLUSIVE_TO_FACTION !== 'undefined') {
      _EXCLUSIVE_TO_FACTION[skA] = fid;
      _EXCLUSIVE_TO_FACTION[skB] = fid;
      _EXCLUSIVE_TO_FACTION[skC] = fid;
    }
  }
})();

// ====================================================================
//  EXPORT
// ====================================================================
window.SkillManager = SkillManager;
window.TalentManager = TalentManager;
window.ElementalReactionSystem = ElementalReactionSystem;
