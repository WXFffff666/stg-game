/**
 * STG Game - Faction Talent Trees
 * Handcrafted unique talent branches per faction.
 * Global: window.FactionTalents
 */

function t(id, name, description, icon, effect) {
  return { id: id, name: name, description: description, icon: icon, effect: effect };
}

var FACTION_TALENT_DATA = {
  attackSpeed: {
    attack: { id: 'attackSpeed_attack', name: '攻速流·攻击', icon: '⚡', color: '#ffdd00', layers: [
      [
        t('as_a1', '疾风扳机', '攻击速度+12%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('as_a2', '弹雨序曲', '额外子弹+1', '🌧️', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('as_a3', '连射节拍', '攻击力+8%', '🔫', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('as_a4', '过载射速', '攻击速度+18%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('as_a5', '弹幕扩散', '弹幕散布+20%', '🌊', { stat: 'spreadMult', op: 'multiply', value: 0.2 }),
        t('as_a6', '锋刃加速', '暴击率+4%', '💥', { stat: 'critRate', op: 'add', value: 0.04 })
      ],
      [
        t('as_a7', '暴风连射', '攻击速度+25%，攻击力+10%', '⚡', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.25 }, { stat: 'attack', op: 'multiply', value: 0.1 }] }),
        t('as_a8', '弹匣扩容', '额外子弹+2', '📦', { stat: 'extraBullets', op: 'add', value: 2 })
      ],
      [
        t('as_a9', '弹幕风暴', '攻击速度+35%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.35 }),
        t('as_a10', '终焉连射', '暴击率+8%，暴击伤害+25%', '💥', { multi: [{ stat: 'critRate', op: 'add', value: 0.08 }, { stat: 'critMult', op: 'add', value: 0.25 }] })
      ]
    ] },
    ultimate: { id: 'attackSpeed_ultimate', name: '攻速流·终极', icon: '⚡', color: '#ffdd00', layers: [
      [
        t('as_u1', '攻速觉醒', '攻击速度+10%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('as_u2', '弹幕共鸣', '攻击力+10%', '🔫', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('as_u3', '极限射速', '攻击速度+20%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.2 }),
        t('as_u4', '弹雨洗礼', '额外子弹+1', '🌧️', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('as_u5', '疾风步伐', '移速+8%', '🏃', { stat: 'speed', op: 'multiply', value: 0.08 })
      ],
      [
        t('as_u6', '弹幕终结预备', '暴击率+6%', '💥', { stat: 'critRate', op: 'add', value: 0.06 }),
        t('as_u7', '过载核心', '攻击速度+30%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.3 })
      ],
      [
        t('as_u8', '弹幕终结', '攻击速度+40%，攻击力+20%', '⚡', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.4 }, { stat: 'attack', op: 'multiply', value: 0.2 }] }),
        t('as_u8b', '弹幕终结·极', '攻击速度+46%，攻击力+23%', '⚡', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.46 }, { stat: 'attack', op: 'multiply', value: 0.23 }] })
      ]
    ] }
  },
  counter: {
    attack: { id: 'counter_attack', name: '反伤流·攻击', icon: '🛡️', color: '#ff6644', layers: [
      [
        t('ct_a1', '荆棘皮肤', '反伤+8%', '🛡️', { stat: 'reflectDamage', op: 'add', value: 0.08 }),
        t('ct_a2', '铁壁初成', '防御+8%', '🧱', { stat: 'defense', op: 'add', value: 0.08 }),
        t('ct_a3', '以守为攻', '攻击力+6%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('ct_a4', '反弹尖刺', '反伤+12%', '🔱', { stat: 'reflectDamage', op: 'add', value: 0.12 }),
        t('ct_a5', '坚盾姿态', '最大HP+12%', '❤️', { stat: 'hp', op: 'multiply', value: 0.12 }),
        t('ct_a6', '反击印记', '暴击率+3%', '💥', { stat: 'critRate', op: 'add', value: 0.03 })
      ],
      [
        t('ct_a7', '壁垒反击', '反伤+18%，防御+10%', '🛡️', { multi: [{ stat: 'reflectDamage', op: 'add', value: 0.18 }, { stat: 'defense', op: 'add', value: 0.1 }] }),
        t('ct_a8', '震地回击', '攻击力+15%', '💢', { stat: 'attack', op: 'multiply', value: 0.15 })
      ],
      [
        t('ct_a9', '不灭壁垒', '反伤+25%，最大HP+20%', '🛡️', { multi: [{ stat: 'reflectDamage', op: 'add', value: 0.25 }, { stat: 'hp', op: 'multiply', value: 0.2 }] }),
        t('ct_a10', '以牙还牙', '受到伤害时反弹伤害+30%', '↩️', { stat: 'reflectDamage', op: 'multiply', value: 0.3 })
      ]
    ] },
    ultimate: { id: 'counter_ultimate', name: '反伤流·终极', icon: '🛡️', color: '#ff6644', layers: [
      [
        t('ct_u1', '反伤觉醒', '反伤+6%', '🛡️', { stat: 'reflectDamage', op: 'add', value: 0.06 }),
        t('ct_u2', '铁壁意志', '防御+6%', '🧱', { stat: 'defense', op: 'add', value: 0.06 })
      ],
      [
        t('ct_u3', '荆棘光环', '反伤+10%', '🔱', { stat: 'reflectDamage', op: 'add', value: 0.1 }),
        t('ct_u4', '壁垒再生', '每秒恢复1HP', '💚', { stat: 'hpRegen', op: 'add', value: 1 }),
        t('ct_u5', '稳如磐石', '最大HP+10%', '❤️', { stat: 'hp', op: 'multiply', value: 0.1 })
      ],
      [
        t('ct_u6', '反击风暴', '攻击力+12%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.12 }),
        t('ct_u7', '绝对防御预备', '防御+15%', '🛡️', { stat: 'defense', op: 'add', value: 0.15 })
      ],
      [
        t('ct_u8', '绝对防御', '反伤+30%，防御+25%', '🛡️', { multi: [{ stat: 'reflectDamage', op: 'add', value: 0.3 }, { stat: 'defense', op: 'add', value: 0.25 }] }),
        t('ct_u8b', '绝对防御·极', '反伤+35%，防御+29%', '🛡️', { multi: [{ stat: 'reflectDamage', op: 'add', value: 0.345 }, { stat: 'defense', op: 'add', value: 0.288 }] })
      ]
    ] }
  },
  crit: {
    attack: { id: 'crit_attack', name: '暴击流·攻击', icon: '💥', color: '#ff0000', layers: [
      [
        t('cr_a1', '锐利直觉', '暴击率+5%', '💥', { stat: 'critRate', op: 'add', value: 0.05 }),
        t('cr_a2', '致命锋芒', '暴击伤害+20%', '🗡️', { stat: 'critMult', op: 'add', value: 0.2 }),
        t('cr_a3', '猎杀本能', '攻击力+8%', '🎯', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('cr_a4', '弱点洞悉', '暴击率+8%', '👁️', { stat: 'critRate', op: 'add', value: 0.08 }),
        t('cr_a5', '斩首之势', '暴击伤害+35%', '💀', { stat: 'critMult', op: 'add', value: 0.35 }),
        t('cr_a6', '疾速瞄准', '攻击速度+10%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.1 })
      ],
      [
        t('cr_a7', '暴击连锁', '暴击率+10%，暴击伤害+25%', '💥', { multi: [{ stat: 'critRate', op: 'add', value: 0.1 }, { stat: 'critMult', op: 'add', value: 0.25 }] }),
        t('cr_a8', '穿心一击', '攻击力+18%', '❤️‍🔥', { stat: 'attack', op: 'multiply', value: 0.18 })
      ],
      [
        t('cr_a9', '致命审判', '暴击率+15%', '⚖️', { stat: 'critRate', op: 'add', value: 0.15 }),
        t('cr_a10', '灭杀裁决', '暴击伤害+50%', '💥', { stat: 'critMult', op: 'add', value: 0.5 })
      ]
    ] },
    ultimate: { id: 'crit_ultimate', name: '暴击流·终极', icon: '💥', color: '#ff0000', layers: [
      [
        t('cr_u1', '暴击觉醒', '暴击率+4%', '💥', { stat: 'critRate', op: 'add', value: 0.04 }),
        t('cr_u2', '锋芒毕露', '攻击力+8%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('cr_u3', '猎杀之眼', '暴击伤害+20%', '👁️', { stat: 'critMult', op: 'add', value: 0.2 }),
        t('cr_u4', '血刃', '暴击率+6%', '🩸', { stat: 'critRate', op: 'add', value: 0.06 }),
        t('cr_u5', '迅捷处决', '攻击速度+8%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.08 })
      ],
      [
        t('cr_u6', '审判预备', '暴击率+8%', '⚖️', { stat: 'critRate', op: 'add', value: 0.08 }),
        t('cr_u7', '毁灭锋芒', '暴击伤害+30%', '💀', { stat: 'critMult', op: 'add', value: 0.3 })
      ],
      [
        t('cr_u8', '致命审判', '暴击率+12%，暴击伤害+40%', '💥', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'critMult', op: 'add', value: 0.4 }] }),
        t('cr_u8b', '致命审判·极', '暴击率+14%，暴击伤害+46%', '💥', { multi: [{ stat: 'critRate', op: 'add', value: 0.138 }, { stat: 'critMult', op: 'add', value: 0.46 }] })
      ]
    ] }
  },
  summon: {
    attack: { id: 'summon_attack', name: '召唤流·攻击', icon: '🛸', color: '#aa66ff', layers: [
      [
        t('sm_a1', '浮游校准', '浮游炮伤害+12%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.12 }),
        t('sm_a2', '僚机扩容', '浮游炮数量+1', '🛸', { stat: 'drones', op: 'add', value: 1 }),
        t('sm_a3', '火力协同', '攻击力+6%', '🔫', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('sm_a4', '蜂群战术', '浮游炮伤害+20%', '🐝', { stat: 'droneDamage', op: 'add', value: 0.2 }),
        t('sm_a5', '双翼编队', '浮游炮数量+1', '✈️', { stat: 'drones', op: 'add', value: 1 }),
        t('sm_a6', '同步射击', '攻击速度+8%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.08 })
      ],
      [
        t('sm_a7', '压制火力', '浮游炮伤害+30%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.3 }),
        t('sm_a8', '母舰指挥', '攻击力+12%', '🚢', { stat: 'attack', op: 'multiply', value: 0.12 })
      ],
      [
        t('sm_a9', '蜂群意识', '浮游炮数量+2', '🐝', { stat: 'drones', op: 'add', value: 2 }),
        t('sm_a10', '天网覆盖', '浮游炮伤害+40%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.4 })
      ]
    ] },
    ultimate: { id: 'summon_ultimate', name: '召唤流·终极', icon: '🛸', color: '#aa66ff', layers: [
      [
        t('sm_u1', '召唤觉醒', '浮游炮伤害+8%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.08 }),
        t('sm_u2', '僚机共鸣', '浮游炮数量+1', '✈️', { stat: 'drones', op: 'add', value: 1 })
      ],
      [
        t('sm_u3', '编队强化', '浮游炮伤害+15%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.15 }),
        t('sm_u4', '火力网', '攻击力+10%', '🔫', { stat: 'attack', op: 'multiply', value: 0.1 }),
        t('sm_u5', '机动编队', '移速+6%', '🏃', { stat: 'speed', op: 'multiply', value: 0.06 })
      ],
      [
        t('sm_u6', '蜂群预备', '浮游炮数量+1', '🐝', { stat: 'drones', op: 'add', value: 1 }),
        t('sm_u7', '压制核心', '浮游炮伤害+25%', '🛸', { stat: 'droneDamage', op: 'add', value: 0.25 })
      ],
      [
        t('sm_u8', '蜂群意识', '浮游炮数量+2，伤害+35%', '🛸', { multi: [{ stat: 'drones', op: 'add', value: 2 }, { stat: 'droneDamage', op: 'add', value: 0.35 }] }),
        t('sm_u8b', '蜂群意识·极', '浮游炮数量+2.3，浮游炮伤害+40%', '🛸', { multi: [{ stat: 'drones', op: 'add', value: 2.3 }, { stat: 'droneDamage', op: 'add', value: 0.402 }] })
      ]
    ] }
  },
  elemental: {
    attack: { id: 'elemental_attack', name: '元素流·攻击', icon: '🔥', color: '#ff8800', layers: [
      [
        t('el_a1', '烈焰附魔', '灼烧伤害+3', '🔥', { stat: 'burnDamage', op: 'add', value: 3 }),
        t('el_a2', '余烬延烧', '灼烧持续+500ms', '🔥', { stat: 'burnDuration', op: 'add', value: 500 }),
        t('el_a3', '元素亲和', '元素伤害+10%', '✨', { stat: 'elementalBonus', op: 'add', value: 0.1 })
      ],
      [
        t('el_a4', '炽焰蔓延', '灼烧伤害+5', '🌋', { stat: 'burnDamage', op: 'add', value: 5 }),
        t('el_a5', '燃烧印记', '元素伤害+15%', '🔥', { stat: 'elementalBonus', op: 'add', value: 0.15 }),
        t('el_a6', '火舌舔舐', '攻击力+10%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('el_a7', '烈焰风暴', '灼烧伤害+8', '🔥', { stat: 'burnDamage', op: 'add', value: 8 }),
        t('el_a8', '元素超载', '元素伤害+25%', '✨', { stat: 'elementalBonus', op: 'add', value: 0.25 })
      ],
      [
        t('el_a9', '凤凰之焰', '灼烧持续+1000ms', '🌅', { stat: 'burnDuration', op: 'add', value: 1000 }),
        t('el_a10', '焚世', '灼烧伤害+12，攻击力+15%', '🔥', { multi: [{ stat: 'burnDamage', op: 'add', value: 12 }, { stat: 'attack', op: 'multiply', value: 0.15 }] })
      ]
    ] },
    ultimate: { id: 'elemental_ultimate', name: '元素流·终极', icon: '🔥', color: '#ff8800', layers: [
      [
        t('el_u1', '元素觉醒', '元素伤害+8%', '🔥', { stat: 'elementalBonus', op: 'add', value: 0.08 }),
        t('el_u2', '火种', '灼烧伤害+2', '🔥', { stat: 'burnDamage', op: 'add', value: 2 })
      ],
      [
        t('el_u3', '烈焰之心', '灼烧伤害+4', '🔥', { stat: 'burnDamage', op: 'add', value: 4 }),
        t('el_u4', '元素共鸣', '元素伤害+12%', '✨', { stat: 'elementalBonus', op: 'add', value: 0.12 }),
        t('el_u5', '灼烧加速', '攻击速度+6%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.06 })
      ],
      [
        t('el_u6', '涅槃预备', '灼烧持续+800ms', '🌅', { stat: 'burnDuration', op: 'add', value: 800 }),
        t('el_u7', '焚焰核心', '灼烧伤害+6', '🔥', { stat: 'burnDamage', op: 'add', value: 6 })
      ],
      [
        t('el_u8', '凤凰涅槃', '元素伤害+30%，灼烧伤害+10', '🔥', { multi: [{ stat: 'elementalBonus', op: 'add', value: 0.3 }, { stat: 'burnDamage', op: 'add', value: 10 }] }),
        t('el_u8b', '凤凰涅槃·极', '元素伤害+35%，灼烧伤害+11.5', '🔥', { multi: [{ stat: 'elementalBonus', op: 'add', value: 0.345 }, { stat: 'burnDamage', op: 'add', value: 11.5 }] })
      ]
    ] }
  },
  lifesteal: {
    attack: { id: 'lifesteal_attack', name: '吸血流转·攻击', icon: '🩸', color: '#ff3366', layers: [
      [
        t('ls_a1', '嗜血本能', '吸血+4%', '🩸', { stat: 'lifesteal', op: 'add', value: 0.04 }),
        t('ls_a2', '血池扩容', '最大HP+8%', '❤️', { stat: 'maxHpBonus', op: 'add', value: 0.08 }),
        t('ls_a3', '血刃', '攻击力+8%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('ls_a4', '鲜血渴望', '吸血+6%', '🩸', { stat: 'lifesteal', op: 'add', value: 0.06 }),
        t('ls_a5', '续航之躯', '最大HP+12%', '💪', { stat: 'maxHpBonus', op: 'add', value: 0.12 }),
        t('ls_a6', '血战', '攻击速度+8%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.08 })
      ],
      [
        t('ls_a7', '血潮涌动', '吸血+8%', '🌊', { stat: 'lifesteal', op: 'add', value: 0.08 }),
        t('ls_a8', '愈战愈勇', '攻击力+15%', '💢', { stat: 'attack', op: 'multiply', value: 0.15 })
      ],
      [
        t('ls_a9', '血族之王', '吸血+12%', '👑', { stat: 'lifesteal', op: 'add', value: 0.12 }),
        t('ls_a10', '永生之血', '最大HP+20%，吸血+6%', '🩸', { multi: [{ stat: 'maxHpBonus', op: 'add', value: 0.2 }, { stat: 'lifesteal', op: 'add', value: 0.06 }] })
      ]
    ] },
    ultimate: { id: 'lifesteal_ultimate', name: '吸血流转·终极', icon: '🩸', color: '#ff3366', layers: [
      [
        t('ls_u1', '吸血觉醒', '吸血+3%', '🩸', { stat: 'lifesteal', op: 'add', value: 0.03 }),
        t('ls_u2', '血之契约', '最大HP+6%', '❤️', { stat: 'maxHpBonus', op: 'add', value: 0.06 })
      ],
      [
        t('ls_u3', '鲜血回流', '吸血+5%', '🩸', { stat: 'lifesteal', op: 'add', value: 0.05 }),
        t('ls_u4', '血盾', '防御+8%', '🛡️', { stat: 'defense', op: 'add', value: 0.08 }),
        t('ls_u5', '血怒', '攻击力+10%', '💢', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('ls_u6', '血王预备', '吸血+7%', '👑', { stat: 'lifesteal', op: 'add', value: 0.07 }),
        t('ls_u7', '血潮核心', '最大HP+15%', '❤️', { stat: 'maxHpBonus', op: 'add', value: 0.15 })
      ],
      [
        t('ls_u8', '血族之王', '吸血+10%，最大HP+18%', '🩸', { multi: [{ stat: 'lifesteal', op: 'add', value: 0.1 }, { stat: 'maxHpBonus', op: 'add', value: 0.18 }] }),
        t('ls_u8b', '血族之王·极', '吸血+12%，生命加成+21%', '🩸', { multi: [{ stat: 'lifesteal', op: 'add', value: 0.115 }, { stat: 'maxHpBonus', op: 'add', value: 0.207 }] })
      ]
    ] }
  },
  shield: {
    attack: { id: 'shield_attack', name: '盾反流·攻击', icon: '🔮', color: '#44aaff', layers: [
      [
        t('sh_a1', '护盾充能', '护盾值+15', '🔮', { stat: 'shieldAmount', op: 'add', value: 15 }),
        t('sh_a2', '能量回流', '护盾回复+0.5/s', '💫', { stat: 'shieldRegen', op: 'add', value: 0.5 }),
        t('sh_a3', '盾击', '攻击力+6%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('sh_a4', '镜面反弹', '护盾反弹+10%', '🪞', { stat: 'shieldReflect', op: 'add', value: 0.1 }),
        t('sh_a5', '厚盾', '护盾值+25', '🛡️', { stat: 'shieldAmount', op: 'add', value: 25 }),
        t('sh_a6', '稳盾', '最大HP+10%', '❤️', { stat: 'hp', op: 'multiply', value: 0.1 })
      ],
      [
        t('sh_a7', '盾反风暴', '护盾反弹+18%', '↩️', { stat: 'shieldReflect', op: 'add', value: 0.18 }),
        t('sh_a8', '堡垒', '护盾值+35', '🏰', { stat: 'shieldAmount', op: 'add', value: 35 })
      ],
      [
        t('sh_a9', '绝对防御', '护盾值+50', '🔮', { stat: 'shieldAmount', op: 'add', value: 50 }),
        t('sh_a10', '镜盾审判', '护盾反弹+25%，攻击力+12%', '🪞', { multi: [{ stat: 'shieldReflect', op: 'add', value: 0.25 }, { stat: 'attack', op: 'multiply', value: 0.12 }] })
      ]
    ] },
    ultimate: { id: 'shield_ultimate', name: '盾反流·终极', icon: '🔮', color: '#44aaff', layers: [
      [
        t('sh_u1', '护盾觉醒', '护盾值+10', '🔮', { stat: 'shieldAmount', op: 'add', value: 10 }),
        t('sh_u2', '盾心', '护盾回复+0.3/s', '💫', { stat: 'shieldRegen', op: 'add', value: 0.3 })
      ],
      [
        t('sh_u3', '能量壁垒', '护盾值+20', '🛡️', { stat: 'shieldAmount', op: 'add', value: 20 }),
        t('sh_u4', '反弹之盾', '护盾反弹+8%', '🪞', { stat: 'shieldReflect', op: 'add', value: 0.08 }),
        t('sh_u5', '盾卫', '防御+8%', '🧱', { stat: 'defense', op: 'add', value: 0.08 })
      ],
      [
        t('sh_u6', '绝对预备', '护盾值+30', '🔮', { stat: 'shieldAmount', op: 'add', value: 30 }),
        t('sh_u7', '镜盾核心', '护盾反弹+15%', '🪞', { stat: 'shieldReflect', op: 'add', value: 0.15 })
      ],
      [
        t('sh_u8', '绝对防御', '护盾值+60，反弹+20%', '🔮', { multi: [{ stat: 'shieldAmount', op: 'add', value: 60 }, { stat: 'shieldReflect', op: 'add', value: 0.2 }] }),
        t('sh_u8b', '绝对防御·极', '护盾值+69，shieldReflect+23%', '🔮', { multi: [{ stat: 'shieldAmount', op: 'add', value: 69 }, { stat: 'shieldReflect', op: 'add', value: 0.23 }] })
      ]
    ] }
  },
  poison: {
    attack: { id: 'poison_attack', name: '毒伤流·攻击', icon: '☠️', color: '#55cc44', layers: [
      [
        t('po_a1', '剧毒调配', '毒伤+3', '☠️', { stat: 'poisonDamage', op: 'add', value: 3 }),
        t('po_a2', '毒素滞留', '毒持续+500ms', '💚', { stat: 'poisonDuration', op: 'add', value: 500 }),
        t('po_a3', '腐蚀之触', '攻击力+6%', '🧪', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('po_a4', '瘟疫蔓延', '毒蔓延+8%', '🦠', { stat: 'poisonSpread', op: 'add', value: 0.08 }),
        t('po_a5', '猛毒', '毒伤+5', '☠️', { stat: 'poisonDamage', op: 'add', value: 5 }),
        t('po_a6', '毒云', '元素伤害+10%', '☁️', { stat: 'elementalBonus', op: 'add', value: 0.1 })
      ],
      [
        t('po_a7', '剧毒风暴', '毒伤+8', '☠️', { stat: 'poisonDamage', op: 'add', value: 8 }),
        t('po_a8', '传染加速', '毒蔓延+12%', '🦠', { stat: 'poisonSpread', op: 'add', value: 0.12 })
      ],
      [
        t('po_a9', '瘟疫领主', '毒伤+12', '👑', { stat: 'poisonDamage', op: 'add', value: 12 }),
        t('po_a10', '死亡之雾', '毒持续+1500ms，毒蔓延+15%', '☠️', { multi: [{ stat: 'poisonDuration', op: 'add', value: 1500 }, { stat: 'poisonSpread', op: 'add', value: 0.15 }] })
      ]
    ] },
    ultimate: { id: 'poison_ultimate', name: '毒伤流·终极', icon: '☠️', color: '#55cc44', layers: [
      [
        t('po_u1', '毒素觉醒', '毒伤+2', '☠️', { stat: 'poisonDamage', op: 'add', value: 2 }),
        t('po_u2', '腐蚀本能', '毒蔓延+5%', '🦠', { stat: 'poisonSpread', op: 'add', value: 0.05 })
      ],
      [
        t('po_u3', '瘟疫之心', '毒伤+4', '☠️', { stat: 'poisonDamage', op: 'add', value: 4 }),
        t('po_u4', '毒雾', '毒持续+800ms', '💚', { stat: 'poisonDuration', op: 'add', value: 800 }),
        t('po_u5', '毒刃', '攻击力+8%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('po_u6', '领主预备', '毒蔓延+10%', '🦠', { stat: 'poisonSpread', op: 'add', value: 0.1 }),
        t('po_u7', '剧毒核心', '毒伤+6', '☠️', { stat: 'poisonDamage', op: 'add', value: 6 })
      ],
      [
        t('po_u8', '瘟疫领主', '毒伤+10，蔓延+18%', '☠️', { multi: [{ stat: 'poisonDamage', op: 'add', value: 10 }, { stat: 'poisonSpread', op: 'add', value: 0.18 }] }),
        t('po_u8b', '瘟疫领主·极', '毒伤+11.5，poisonSpread+21%', '☠️', { multi: [{ stat: 'poisonDamage', op: 'add', value: 11.5 }, { stat: 'poisonSpread', op: 'add', value: 0.207 }] })
      ]
    ] }
  },
  ice: {
    attack: { id: 'ice_attack', name: '冰控流·攻击', icon: '❄️', color: '#66ddff', layers: [
      [
        t('ic_a1', '寒霜附着', '减速几率+8%', '❄️', { stat: 'slowChance', op: 'add', value: 0.08 }),
        t('ic_a2', '冰封之触', '冰冻几率+3%', '🧊', { stat: 'freezeChance', op: 'add', value: 0.03 }),
        t('ic_a3', '霜刃', '攻击力+6%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('ic_a4', '极寒加深', '减速幅度+10%', '❄️', { stat: 'slowAmount', op: 'add', value: 0.1 }),
        t('ic_a5', '碎冰', '减速持续+500ms', '💎', { stat: 'slowDuration', op: 'add', value: 500 }),
        t('ic_a6', '霜冻蔓延', '冰冻几率+5%', '🧊', { stat: 'freezeChance', op: 'add', value: 0.05 })
      ],
      [
        t('ic_a7', '寒冰风暴', '减速几率+12%', '🌨️', { stat: 'slowChance', op: 'add', value: 0.12 }),
        t('ic_a8', '碎裂打击', '攻击力+12%', '💥', { stat: 'attack', op: 'multiply', value: 0.12 })
      ],
      [
        t('ic_a9', '冰封王座', '冰冻几率+8%', '👑', { stat: 'freezeChance', op: 'add', value: 0.08 }),
        t('ic_a10', '极寒碎灭', '减速幅度+20%，减速几率+10%', '❄️', { multi: [{ stat: 'slowAmount', op: 'add', value: 0.2 }, { stat: 'slowChance', op: 'add', value: 0.1 }] })
      ]
    ] },
    ultimate: { id: 'ice_ultimate', name: '冰控流·终极', icon: '❄️', color: '#66ddff', layers: [
      [
        t('ic_u1', '冰霜觉醒', '减速几率+6%', '❄️', { stat: 'slowChance', op: 'add', value: 0.06 }),
        t('ic_u2', '寒心', '冰冻几率+2%', '🧊', { stat: 'freezeChance', op: 'add', value: 0.02 })
      ],
      [
        t('ic_u3', '极寒之心', '减速幅度+8%', '❄️', { stat: 'slowAmount', op: 'add', value: 0.08 }),
        t('ic_u4', '霜冻领域', '减速持续+800ms', '💎', { stat: 'slowDuration', op: 'add', value: 800 }),
        t('ic_u5', '冰刃', '攻击力+8%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('ic_u6', '王座预备', '冰冻几率+5%', '👑', { stat: 'freezeChance', op: 'add', value: 0.05 }),
        t('ic_u7', '碎冰核心', '减速几率+10%', '❄️', { stat: 'slowChance', op: 'add', value: 0.1 })
      ],
      [
        t('ic_u8', '冰封王座', '冰冻几率+10%，减速幅度+15%', '❄️', { multi: [{ stat: 'freezeChance', op: 'add', value: 0.1 }, { stat: 'slowAmount', op: 'add', value: 0.15 }] }),
        t('ic_u8b', '冰封王座·极', 'freezeChance+12%，slowAmount+17%', '❄️', { multi: [{ stat: 'freezeChance', op: 'add', value: 0.115 }, { stat: 'slowAmount', op: 'add', value: 0.173 }] })
      ]
    ] }
  },
  barrage: {
    attack: { id: 'barrage_attack', name: '弹幕流·攻击', icon: '🌊', color: '#ff66aa', layers: [
      [
        t('ba_a1', '弹幕铺展', '额外子弹+1', '🌊', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('ba_a2', '弹体膨胀', '子弹大小+15%', '⭕', { stat: 'bulletSize', op: 'multiply', value: 0.15 }),
        t('ba_a3', '散射增幅', '散布+15%', '🎯', { stat: 'spreadMult', op: 'multiply', value: 0.15 })
      ],
      [
        t('ba_a4', '覆盖射击', '额外子弹+1', '🌊', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('ba_a5', '弹幕洪流', '攻击速度+10%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('ba_a6', '压制火力', '攻击力+10%', '🔫', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('ba_a7', '弹幕地狱', '额外子弹+2', '🌊', { stat: 'extraBullets', op: 'add', value: 2 }),
        t('ba_a8', '弹雨风暴', '子弹大小+25%', '⭕', { stat: 'bulletSize', op: 'multiply', value: 0.25 })
      ],
      [
        t('ba_a9', '绝对覆盖', '散布+30%', '🎯', { stat: 'spreadMult', op: 'multiply', value: 0.3 }),
        t('ba_a10', '弹幕终焉', '额外子弹+2，攻击速度+15%', '🌊', { multi: [{ stat: 'extraBullets', op: 'add', value: 2 }, { stat: 'attackSpeed', op: 'multiply', value: -0.15 }] })
      ]
    ] },
    ultimate: { id: 'barrage_ultimate', name: '弹幕流·终极', icon: '🌊', color: '#ff66aa', layers: [
      [
        t('ba_u1', '弹幕觉醒', '额外子弹+1', '🌊', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('ba_u2', '弹体强化', '子弹大小+10%', '⭕', { stat: 'bulletSize', op: 'multiply', value: 0.1 })
      ],
      [
        t('ba_u3', '洪流之心', '攻击速度+8%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.08 }),
        t('ba_u4', '散射网', '散布+20%', '🎯', { stat: 'spreadMult', op: 'multiply', value: 0.2 }),
        t('ba_u5', '压制', '攻击力+8%', '🔫', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('ba_u6', '地狱预备', '额外子弹+1', '🌊', { stat: 'extraBullets', op: 'add', value: 1 }),
        t('ba_u7', '弹雨核心', '攻击速度+12%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.12 })
      ],
      [
        t('ba_u8', '弹幕地狱', '额外子弹+3，子弹大小+20%', '🌊', { multi: [{ stat: 'extraBullets', op: 'add', value: 3 }, { stat: 'bulletSize', op: 'multiply', value: 0.2 }] }),
        t('ba_u8b', '弹幕地狱·极', 'extraBullets+3.45，bulletSize+23%', '🌊', { multi: [{ stat: 'extraBullets', op: 'add', value: 3.45 }, { stat: 'bulletSize', op: 'multiply', value: 0.23 }] })
      ]
    ] }
  },
  gravity: {
    attack: { id: 'gravity_attack', name: '重力流·攻击', icon: '🌌', color: '#8866cc', layers: [
      [
        t('gr_a1', '引力牵引', '重力场半径+30', '🌌', { stat: 'gravityRadius', op: 'add', value: 30 }),
        t('gr_a2', '时空迟滞', '重力减速+5%', '🕳️', { stat: 'gravitySlow', op: 'add', value: 0.05 }),
        t('gr_a3', '引力刃', '攻击力+6%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('gr_a4', '坍缩之力', '重力伤害+3', '💫', { stat: 'gravityDamage', op: 'add', value: 3 }),
        t('gr_a5', '深空陷阱', '重力场半径+50', '🌌', { stat: 'gravityRadius', op: 'add', value: 50 }),
        t('gr_a6', '迟滞加深', '重力减速+8%', '🐌', { stat: 'gravitySlow', op: 'add', value: 0.08 })
      ],
      [
        t('gr_a7', '奇点雏形', '重力伤害+5', '⚫', { stat: 'gravityDamage', op: 'add', value: 5 }),
        t('gr_a8', '引力风暴', '重力场半径+70', '🌌', { stat: 'gravityRadius', op: 'add', value: 70 })
      ],
      [
        t('gr_a9', '奇点坍缩', '重力减速+12%', '🕳️', { stat: 'gravitySlow', op: 'add', value: 0.12 }),
        t('gr_a10', '黑洞审判', '重力伤害+8，攻击力+12%', '🌌', { multi: [{ stat: 'gravityDamage', op: 'add', value: 8 }, { stat: 'attack', op: 'multiply', value: 0.12 }] })
      ]
    ] },
    ultimate: { id: 'gravity_ultimate', name: '重力流·终极', icon: '🌌', color: '#8866cc', layers: [
      [
        t('gr_u1', '引力觉醒', '重力场半径+20', '🌌', { stat: 'gravityRadius', op: 'add', value: 20 }),
        t('gr_u2', '迟滞本能', '重力减速+4%', '🐌', { stat: 'gravitySlow', op: 'add', value: 0.04 })
      ],
      [
        t('gr_u3', '奇点之心', '重力伤害+2', '⚫', { stat: 'gravityDamage', op: 'add', value: 2 }),
        t('gr_u4', '深空领域', '重力场半径+40', '🌌', { stat: 'gravityRadius', op: 'add', value: 40 }),
        t('gr_u5', '引力刃', '攻击力+8%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('gr_u6', '坍缩预备', '重力减速+8%', '🕳️', { stat: 'gravitySlow', op: 'add', value: 0.08 }),
        t('gr_u7', '黑洞核心', '重力伤害+4', '⚫', { stat: 'gravityDamage', op: 'add', value: 4 })
      ],
      [
        t('gr_u8', '奇点坍缩', '重力场半径+100，减速+10%', '🌌', { multi: [{ stat: 'gravityRadius', op: 'add', value: 100 }, { stat: 'gravitySlow', op: 'add', value: 0.1 }] }),
        t('gr_u8b', '奇点坍缩·极', 'gravityRadius+115，gravitySlow+12%', '🌌', { multi: [{ stat: 'gravityRadius', op: 'add', value: 115 }, { stat: 'gravitySlow', op: 'add', value: 0.115 }] })
      ]
    ] }
  },
  void: {
    attack: { id: 'void_attack', name: '虚空流·攻击', icon: '🕳️', color: '#220044', layers: [
      [
        t('vo_a1', '虚空凝视', '斩杀阈值+3%', '🕳️', { stat: 'voidExecuteThreshold', op: 'add', value: 0.03 }),
        t('vo_a2', '深渊之触', '虚空伤害+3', '🌑', { stat: 'voidDamage', op: 'add', value: 3 }),
        t('vo_a3', '湮灭刃', '攻击力+8%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('vo_a4', '收割预兆', '斩杀几率+8%', '💀', { stat: 'voidExecuteChance', op: 'add', value: 0.08 }),
        t('vo_a5', '虚空裂隙', '虚空伤害+5', '🕳️', { stat: 'voidDamage', op: 'add', value: 5 }),
        t('vo_a6', '暗蚀', '暴击率+4%', '💥', { stat: 'critRate', op: 'add', value: 0.04 })
      ],
      [
        t('vo_a7', '深渊之门', '斩杀阈值+5%', '🚪', { stat: 'voidExecuteThreshold', op: 'add', value: 0.05 }),
        t('vo_a8', '虚空风暴', '虚空伤害+8', '🌑', { stat: 'voidDamage', op: 'add', value: 8 })
      ],
      [
        t('vo_a9', '终焉收割', '斩杀几率+12%', '💀', { stat: 'voidExecuteChance', op: 'add', value: 0.12 }),
        t('vo_a10', '湮灭审判', '斩杀阈值+8%，攻击力+15%', '🕳️', { multi: [{ stat: 'voidExecuteThreshold', op: 'add', value: 0.08 }, { stat: 'attack', op: 'multiply', value: 0.15 }] })
      ]
    ] },
    ultimate: { id: 'void_ultimate', name: '虚空流·终极', icon: '🕳️', color: '#220044', layers: [
      [
        t('vo_u1', '虚空觉醒', '虚空伤害+2', '🕳️', { stat: 'voidDamage', op: 'add', value: 2 }),
        t('vo_u2', '收割本能', '斩杀阈值+2%', '💀', { stat: 'voidExecuteThreshold', op: 'add', value: 0.02 })
      ],
      [
        t('vo_u3', '深渊之心', '斩杀几率+6%', '🌑', { stat: 'voidExecuteChance', op: 'add', value: 0.06 }),
        t('vo_u4', '裂隙扩张', '虚空伤害+4', '🕳️', { stat: 'voidDamage', op: 'add', value: 4 }),
        t('vo_u5', '暗刃', '攻击力+10%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('vo_u6', '门扉预备', '斩杀阈值+4%', '🚪', { stat: 'voidExecuteThreshold', op: 'add', value: 0.04 }),
        t('vo_u7', '湮灭核心', '虚空伤害+6', '🌑', { stat: 'voidDamage', op: 'add', value: 6 })
      ],
      [
        t('vo_u8', '深渊之门', '斩杀几率+15%，虚空伤害+10', '🕳️', { multi: [{ stat: 'voidExecuteChance', op: 'add', value: 0.15 }, { stat: 'voidDamage', op: 'add', value: 10 }] }),
        t('vo_u8b', '深渊之门·极', 'voidExecuteChance+17%，voidDamage+11.5', '🕳️', { multi: [{ stat: 'voidExecuteChance', op: 'add', value: 0.173 }, { stat: 'voidDamage', op: 'add', value: 11.5 }] })
      ]
    ] }
  },
  thunder: {
    attack: { id: 'thunder_attack', name: '雷电流·攻击', icon: '🌩️', color: '#ffff00', layers: [
      [
        t('th_a1', '静电积聚', '闪电链几率+8%', '🌩️', { stat: 'chainLightningChance', op: 'add', value: 0.08 }),
        t('th_a2', '电弧跳跃', '连锁次数+1', '⚡', { stat: 'chainCount', op: 'add', value: 1 }),
        t('th_a3', '雷击', '攻击力+6%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.06 })
      ],
      [
        t('th_a4', '导电体质', '连锁伤害+15%', '🔌', { stat: 'chainDamage', op: 'multiply', value: 0.15 }),
        t('th_a5', '雷暴', '闪电链几率+12%', '🌩️', { stat: 'chainLightningChance', op: 'add', value: 0.12 }),
        t('th_a6', '连锁加速', '攻击速度+8%', '⚡', { stat: 'attackSpeed', op: 'multiply', value: -0.08 })
      ],
      [
        t('th_a7', '雷霆万钧', '连锁次数+2', '⚡', { stat: 'chainCount', op: 'add', value: 2 }),
        t('th_a8', '电击风暴', '连锁伤害+25%', '🌩️', { stat: 'chainDamage', op: 'multiply', value: 0.25 })
      ],
      [
        t('th_a9', '雷神降临', '闪电链几率+18%', '👑', { stat: 'chainLightningChance', op: 'add', value: 0.18 }),
        t('th_a10', '天罚连锁', '连锁次数+2，连锁伤害+30%', '⚡', { multi: [{ stat: 'chainCount', op: 'add', value: 2 }, { stat: 'chainDamage', op: 'multiply', value: 0.3 }] })
      ]
    ] },
    ultimate: { id: 'thunder_ultimate', name: '雷电流·终极', icon: '🌩️', color: '#ffff00', layers: [
      [
        t('th_u1', '雷电觉醒', '闪电链几率+6%', '🌩️', { stat: 'chainLightningChance', op: 'add', value: 0.06 }),
        t('th_u2', '电弧本能', '连锁次数+1', '⚡', { stat: 'chainCount', op: 'add', value: 1 })
      ],
      [
        t('th_u3', '雷云之心', '连锁伤害+12%', '🔌', { stat: 'chainDamage', op: 'multiply', value: 0.12 }),
        t('th_u4', '导电网', '闪电链几率+10%', '🌩️', { stat: 'chainLightningChance', op: 'add', value: 0.1 }),
        t('th_u5', '雷刃', '攻击力+8%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('th_u6', '雷神预备', '连锁次数+1', '⚡', { stat: 'chainCount', op: 'add', value: 1 }),
        t('th_u7', '风暴核心', '连锁伤害+20%', '🌩️', { stat: 'chainDamage', op: 'multiply', value: 0.2 })
      ],
      [
        t('th_u8', '雷神降临', '连锁次数+3，闪电链几率+15%', '🌩️', { multi: [{ stat: 'chainCount', op: 'add', value: 3 }, { stat: 'chainLightningChance', op: 'add', value: 0.15 }] }),
        t('th_u8b', '雷神降临·极', '连锁次数+3.45，闪电链几率+17%', '🌩️', { multi: [{ stat: 'chainCount', op: 'add', value: 3.45 }, { stat: 'chainLightningChance', op: 'add', value: 0.173 }] })
      ]
    ] }
  },
  wind: {
    attack: { id: 'wind_attack', name: '风之流·攻击', icon: '🍃', color: '#88ff88', layers: [
      [
        t('wi_a1a', '疾风步', '疾风击退力度+24', '🍃', { stat: 'windPushForce', op: 'add', value: 24 }),
        t('wi_a1b', '风刃切割', '风压影响范围+39', '🍃', { stat: 'windPushRadius', op: 'add', value: 39 }),
        t('wi_a1c', '气流护体', '闪避攻击几率+6%', '🍃', { stat: 'dodgeChance', op: 'add', value: 0.06 })
      ],
      [
        t('wi_a2a', '暴风推击', '移动速度提升+9%', '🍃', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('wi_a2b', '风墙', '疾风击退力度+49', '🍃', { stat: 'windPushForce', op: 'add', value: 49 }),
        t('wi_a2c', '旋风斩', '风压影响范围+64', '🍃', { stat: 'windPushRadius', op: 'add', value: 64 })
      ],
      [
        t('wi_a3a', '飓风眼', '闪避攻击几率+8%', '🍃', { stat: 'dodgeChance', op: 'add', value: 0.08 }),
        t('wi_a3b', '天风裂', '移动速度提升+15%，疾风击退力度+74', '🍃', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'windPushForce', op: 'add', value: 74 }] })
      ],
      [
        t('wi_a4a', '暴风之眼', '疾风击退力度+69', '🍃', { stat: 'windPushForce', op: 'add', value: 69 }),
        t('wi_a4b', '风之极', '风压影响范围+84，闪避攻击几率+14%', '🍃', { multi: [{ stat: 'windPushRadius', op: 'add', value: 84 }, { stat: 'dodgeChance', op: 'add', value: 0.135 }] })
      ]
    ] },
    ultimate: { id: 'wind_ultimate', name: '风之流·终极', icon: '🍃', color: '#88ff88', layers: [
      [
        t('wi_u1a', '风之觉醒', '疾风击退力度+24', '🍃', { stat: 'windPushForce', op: 'add', value: 24 }),
        t('wi_u1b', '气流共鸣', '风压影响范围+39', '🍃', { stat: 'windPushRadius', op: 'add', value: 39 })
      ],
      [
        t('wi_u2a', '风暴之心', '闪避攻击几率+6%', '🍃', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('wi_u2b', '疾风领域', '移动速度提升+11%', '🍃', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('wi_u2c', '风刃', '疾风击退力度+59', '🍃', { stat: 'windPushForce', op: 'add', value: 59 })
      ],
      [
        t('wi_u3a', '暴风预备', '风压影响范围+59', '🍃', { stat: 'windPushRadius', op: 'add', value: 59 }),
        t('wi_u3b', '飓风核心', '闪避攻击几率+10%，移动速度提升+17%', '🍃', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('wi_u4a', '暴风之眼', '移动速度提升+17%', '🍃', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('wi_u4b', '暴风之眼·极', '移速+19%', '🍃', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  shadow: {
    attack: { id: 'shadow_attack', name: '暗影流·攻击', icon: '🌑', color: '#111166', layers: [
      [
        t('sh_a1a', '潜影', '隐身持续时间+300ms', '🌑', { stat: 'stealthDuration', op: 'add', value: 300 }),
        t('sh_a1b', '暗刃', '隐身破袭伤害加成+6%', '🌑', { stat: 'stealthDamageBonus', op: 'add', value: 0.06 }),
        t('sh_a1c', '影步', '闪避攻击几率+6%', '🌑', { stat: 'dodgeChance', op: 'add', value: 0.06 })
      ],
      [
        t('sh_a2a', '暗影突袭', '攻击力提升+9%', '🌑', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('sh_a2b', '匿踪', '隐身持续时间+700ms', '🌑', { stat: 'stealthDuration', op: 'add', value: 700 }),
        t('sh_a2c', '影杀', '隐身破袭伤害加成+11%', '🌑', { stat: 'stealthDamageBonus', op: 'add', value: 0.11 })
      ],
      [
        t('sh_a3a', '幽暗领域', '闪避攻击几率+8%', '🌑', { stat: 'dodgeChance', op: 'add', value: 0.08 }),
        t('sh_a3b', '暗夜主宰', '攻击力提升+15%，隐身持续时间+1100ms', '🌑', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'stealthDuration', op: 'add', value: 1100 }] })
      ],
      [
        t('sh_a4a', '暗影之主', '隐身持续时间+1050ms', '🌑', { stat: 'stealthDuration', op: 'add', value: 1050 }),
        t('sh_a4b', '无影', '隐身破袭伤害加成+15%，闪避攻击几率+14%', '🌑', { multi: [{ stat: 'stealthDamageBonus', op: 'add', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.135 }] })
      ]
    ] },
    ultimate: { id: 'shadow_ultimate', name: '暗影流·终极', icon: '🌑', color: '#111166', layers: [
      [
        t('sh_u1a', '暗影觉醒', '隐身持续时间+300ms', '🌑', { stat: 'stealthDuration', op: 'add', value: 300 }),
        t('sh_u1b', '潜行本能', '隐身破袭伤害加成+6%', '🌑', { stat: 'stealthDamageBonus', op: 'add', value: 0.06 })
      ],
      [
        t('sh_u2a', '幽影之心', '闪避攻击几率+6%', '🌑', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('sh_u2b', '暗域', '攻击力提升+11%', '🌑', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('sh_u2c', '影刃', '隐身持续时间+850ms', '🌑', { stat: 'stealthDuration', op: 'add', value: 850 })
      ],
      [
        t('sh_u3a', '主宰预备', '隐身破袭伤害加成+10%', '🌑', { stat: 'stealthDamageBonus', op: 'add', value: 0.1 }),
        t('sh_u3b', '暗夜核心', '闪避攻击几率+10%，攻击力提升+17%', '🌑', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('sh_u4a', '暗影之主', '攻击力提升+17%', '🌑', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('sh_u4b', '暗影之主·极', '攻击力+19%', '🌑', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  holy: {
    attack: { id: 'holy_attack', name: '圣光流·攻击', icon: '✨', color: '#ffffcc', layers: [
      [
        t('ho_a1a', '圣光洗礼', '治愈光环回复量+23%', '✨', { stat: 'healAuraAmount', op: 'add', value: 0.225 }),
        t('ho_a1b', '治愈光环', '治愈光环范围+38', '✨', { stat: 'healAuraRadius', op: 'add', value: 38 }),
        t('ho_a1c', '驱邪', '对Boss额外伤害+8%', '✨', { stat: 'bossDamageBonus', op: 'add', value: 0.08 })
      ],
      [
        t('ho_a2a', '圣焰', '攻击力提升+9%', '✨', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ho_a2b', '祝福', '治愈光环回复量+4.838', '✨', { stat: 'healAuraAmount', op: 'add', value: 4.838 }),
        t('ho_a2c', '净化', '治愈光环范围+63', '✨', { stat: 'healAuraRadius', op: 'add', value: 63 })
      ],
      [
        t('ho_a3a', '神圣打击', '对Boss额外伤害+10%', '✨', { stat: 'bossDamageBonus', op: 'add', value: 0.1 }),
        t('ho_a3b', '审判之光', '攻击力提升+15%，治愈光环回复量+12.45', '✨', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'healAuraAmount', op: 'add', value: 12.45 }] })
      ],
      [
        t('ho_a4a', '神圣审判', '治愈光环回复量+12.761', '✨', { stat: 'healAuraAmount', op: 'add', value: 12.761 }),
        t('ho_a4b', '圣域', '治愈光环范围+83，对Boss额外伤害+17%', '✨', { multi: [{ stat: 'healAuraRadius', op: 'add', value: 83 }, { stat: 'bossDamageBonus', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'holy_ultimate', name: '圣光流·终极', icon: '✨', color: '#ffffcc', layers: [
      [
        t('ho_u1a', '圣光觉醒', '治愈光环回复量+23%', '✨', { stat: 'healAuraAmount', op: 'add', value: 0.225 }),
        t('ho_u1b', '信仰共鸣', '治愈光环范围+38', '✨', { stat: 'healAuraRadius', op: 'add', value: 38 })
      ],
      [
        t('ho_u2a', '圣心', '对Boss额外伤害+7%', '✨', { stat: 'bossDamageBonus', op: 'add', value: 0.07 }),
        t('ho_u2b', '光环扩张', '攻击力提升+11%', '✨', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ho_u2c', '圣刃', '治愈光环回复量+6.971', '✨', { stat: 'healAuraAmount', op: 'add', value: 6.971 })
      ],
      [
        t('ho_u3a', '审判预备', '治愈光环范围+58', '✨', { stat: 'healAuraRadius', op: 'add', value: 58 }),
        t('ho_u3b', '神圣核心', '对Boss额外伤害+12%，攻击力提升+17%', '✨', { multi: [{ stat: 'bossDamageBonus', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ho_u4a', '神圣审判', '攻击力提升+17%', '✨', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ho_u4b', '神圣审判·极', '攻击力+19%', '✨', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  blood: {
    attack: { id: 'blood_attack', name: '血祭流·攻击', icon: '🩸', color: '#cc0000', layers: [
      [
        t('bl_a1a', '血祭', '血怒状态攻击加成+2', '🩸', { stat: 'bloodRageDamage', op: 'add', value: 2 }),
        t('bl_a1b', '献祭', '血怒触发血量阈值+6%', '🩸', { stat: 'bloodRageThreshold', op: 'add', value: 0.06 }),
        t('bl_a1c', '血怒', '生命自然回复+2.795', '🩸', { stat: 'hpRegen', op: 'add', value: 2.795 })
      ],
      [
        t('bl_a2a', '嗜血狂潮', '攻击力提升+9%', '🩸', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('bl_a2b', '血刃', '血怒状态攻击加成+5', '🩸', { stat: 'bloodRageDamage', op: 'add', value: 5 }),
        t('bl_a2c', '血池', '血怒触发血量阈值+11%', '🩸', { stat: 'bloodRageThreshold', op: 'add', value: 0.11 })
      ],
      [
        t('bl_a3a', '血祭仪式', '生命自然回复+7.055', '🩸', { stat: 'hpRegen', op: 'add', value: 7.055 }),
        t('bl_a3b', '血之帝王', '攻击力提升+15%，血怒状态攻击加成+8', '🩸', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'bloodRageDamage', op: 'add', value: 8 }] })
      ],
      [
        t('bl_a4a', '狂血', '血怒状态攻击加成+8', '🩸', { stat: 'bloodRageDamage', op: 'add', value: 8 }),
        t('bl_a4b', '血祭终焉', '血怒触发血量阈值+15%，生命自然回复+19.152', '🩸', { multi: [{ stat: 'bloodRageThreshold', op: 'add', value: 0.15 }, { stat: 'hpRegen', op: 'add', value: 19.152 }] })
      ]
    ] },
    ultimate: { id: 'blood_ultimate', name: '血祭流·终极', icon: '🩸', color: '#cc0000', layers: [
      [
        t('bl_u1a', '血祭觉醒', '血怒状态攻击加成+2', '🩸', { stat: 'bloodRageDamage', op: 'add', value: 2 }),
        t('bl_u1b', '献祭本能', '血怒触发血量阈值+6%', '🩸', { stat: 'bloodRageThreshold', op: 'add', value: 0.06 })
      ],
      [
        t('bl_u2a', '血怒之心', '生命自然回复+2.903', '🩸', { stat: 'hpRegen', op: 'add', value: 2.903 }),
        t('bl_u2b', '血池', '攻击力提升+11%', '🩸', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('bl_u2c', '血刃', '血怒状态攻击加成+6', '🩸', { stat: 'bloodRageDamage', op: 'add', value: 6 })
      ],
      [
        t('bl_u3a', '帝王预备', '血怒触发血量阈值+10%', '🩸', { stat: 'bloodRageThreshold', op: 'add', value: 0.1 }),
        t('bl_u3b', '血祭核心', '生命自然回复+9.528，攻击力提升+17%', '🩸', { multi: [{ stat: 'hpRegen', op: 'add', value: 9.528 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('bl_u4a', '血之帝王', '攻击力提升+17%', '🩸', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('bl_u4b', '血之帝王·极', '攻击力+19%', '🩸', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  magnet: {
    attack: { id: 'magnet_attack', name: '磁力流·攻击', icon: '🧲', color: '#cc44cc', layers: [
      [
        t('ma_a1a', '磁力吸引', '道具吸附范围+26', '🧲', { stat: 'pickupRange', op: 'add', value: 26 }),
        t('ma_a1b', '弹反磁场', '偏转敌方子弹几率+5%', '🧲', { stat: 'bulletRepelChance', op: 'add', value: 0.045 }),
        t('ma_a1c', '铁屑风暴', '磁力偏转范围+46', '🧲', { stat: 'bulletRepelRadius', op: 'add', value: 46 })
      ],
      [
        t('ma_a2a', '磁暴', '攻击力提升+9%', '🧲', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ma_a2b', '引力波', '道具吸附范围+51', '🧲', { stat: 'pickupRange', op: 'add', value: 51 }),
        t('ma_a2c', '磁能刃', '偏转敌方子弹几率+9%', '🧲', { stat: 'bulletRepelChance', op: 'add', value: 0.085 })
      ],
      [
        t('ma_a3a', '极磁', '磁力偏转范围+56', '🧲', { stat: 'bulletRepelRadius', op: 'add', value: 56 }),
        t('ma_a3b', '万磁之王', '攻击力提升+15%，道具吸附范围+76', '🧲', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'pickupRange', op: 'add', value: 76 }] })
      ],
      [
        t('ma_a4a', '磁暴领域', '道具吸附范围+71', '🧲', { stat: 'pickupRange', op: 'add', value: 71 }),
        t('ma_a4b', '磁力主宰', '偏转敌方子弹几率+12%，磁力偏转范围+91', '🧲', { multi: [{ stat: 'bulletRepelChance', op: 'add', value: 0.12 }, { stat: 'bulletRepelRadius', op: 'add', value: 91 }] })
      ]
    ] },
    ultimate: { id: 'magnet_ultimate', name: '磁力流·终极', icon: '🧲', color: '#cc44cc', layers: [
      [
        t('ma_u1a', '磁力觉醒', '道具吸附范围+26', '🧲', { stat: 'pickupRange', op: 'add', value: 26 }),
        t('ma_u1b', '磁场共鸣', '偏转敌方子弹几率+5%', '🧲', { stat: 'bulletRepelChance', op: 'add', value: 0.045 })
      ],
      [
        t('ma_u2a', '磁心', '磁力偏转范围+41', '🧲', { stat: 'bulletRepelRadius', op: 'add', value: 41 }),
        t('ma_u2b', '引力场', '攻击力提升+11%', '🧲', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ma_u2c', '磁刃', '道具吸附范围+61', '🧲', { stat: 'pickupRange', op: 'add', value: 61 })
      ],
      [
        t('ma_u3a', '万磁预备', '偏转敌方子弹几率+8%', '🧲', { stat: 'bulletRepelChance', op: 'add', value: 0.08 }),
        t('ma_u3b', '磁暴核心', '磁力偏转范围+66，攻击力提升+17%', '🧲', { multi: [{ stat: 'bulletRepelRadius', op: 'add', value: 66 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ma_u4a', '万磁之王', '攻击力提升+17%', '🧲', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ma_u4b', '万磁之王·极', '攻击力+19%', '🧲', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  mirror: {
    attack: { id: 'mirror_attack', name: '镜之流·攻击', icon: '🪞', color: '#aaccee', layers: [
      [
        t('mi_a1a', '镜像分身', '镜像分身数量+1', '🪞', { stat: 'decoyCount', op: 'add', value: 1 }),
        t('mi_a1b', '折射', '分身持续时间+450ms', '🪞', { stat: 'decoyDuration', op: 'add', value: 450 }),
        t('mi_a1c', '幻像', '伤害转移至分身比例+8%', '🪞', { stat: 'damageRedirect', op: 'add', value: 0.08 })
      ],
      [
        t('mi_a2a', '镜花水月', '攻击力提升+9%', '🪞', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('mi_a2b', '倒影', '镜像分身数量+2', '🪞', { stat: 'decoyCount', op: 'add', value: 2 }),
        t('mi_a2c', '虚实', '分身持续时间+850ms', '🪞', { stat: 'decoyDuration', op: 'add', value: 850 })
      ],
      [
        t('mi_a3a', '镜刃', '伤害转移至分身比例+10%', '🪞', { stat: 'damageRedirect', op: 'add', value: 0.1 }),
        t('mi_a3b', '镜界', '攻击力提升+15%，镜像分身数量+3', '🪞', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'decoyCount', op: 'add', value: 3 }] })
      ],
      [
        t('mi_a4a', '幻镜', '镜像分身数量+3', '🪞', { stat: 'decoyCount', op: 'add', value: 3 }),
        t('mi_a4b', '镜之终焉', '分身持续时间+1200ms，伤害转移至分身比例+17%', '🪞', { multi: [{ stat: 'decoyDuration', op: 'add', value: 1200 }, { stat: 'damageRedirect', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'mirror_ultimate', name: '镜之流·终极', icon: '🪞', color: '#aaccee', layers: [
      [
        t('mi_u1a', '镜像觉醒', '镜像分身数量+1', '🪞', { stat: 'decoyCount', op: 'add', value: 1 }),
        t('mi_u1b', '幻像本能', '分身持续时间+450ms', '🪞', { stat: 'decoyDuration', op: 'add', value: 450 })
      ],
      [
        t('mi_u2a', '镜心', '伤害转移至分身比例+7%', '🪞', { stat: 'damageRedirect', op: 'add', value: 0.07 }),
        t('mi_u2b', '折射域', '攻击力提升+11%', '🪞', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('mi_u2c', '镜刃', '镜像分身数量+2', '🪞', { stat: 'decoyCount', op: 'add', value: 2 })
      ],
      [
        t('mi_u3a', '水月预备', '分身持续时间+800ms', '🪞', { stat: 'decoyDuration', op: 'add', value: 800 }),
        t('mi_u3b', '幻镜核心', '伤害转移至分身比例+12%，攻击力提升+17%', '🪞', { multi: [{ stat: 'damageRedirect', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('mi_u4a', '镜花水月', '攻击力提升+17%', '🪞', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('mi_u4b', '镜花水月·极', '攻击力+19%', '🪞', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  time: {
    attack: { id: 'time_attack', name: '时之流·攻击', icon: '⏳', color: '#ccbb88', layers: [
      [
        t('ti_a1a', '时缓', '时缓幅度+2', '⏳', { stat: 'timeSlowAmount', op: 'add', value: 2 }),
        t('ti_a1b', '加速自身', '时缓持续时间+450ms', '⏳', { stat: 'timeSlowDuration', op: 'add', value: 450 }),
        t('ti_a1c', '时间裂隙', '技能冷却缩减+8%', '⏳', { stat: 'cooldownReduction', op: 'add', value: 0.08 })
      ],
      [
        t('ti_a2a', '因果斩', '攻击速度提升+10%', '⏳', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('ti_a2b', '时光回溯', '时缓幅度+5', '⏳', { stat: 'timeSlowAmount', op: 'add', value: 5 }),
        t('ti_a2c', '迟滞场', '时缓持续时间+850ms', '⏳', { stat: 'timeSlowDuration', op: 'add', value: 850 })
      ],
      [
        t('ti_a3a', '时之刃', '技能冷却缩减+10%', '⏳', { stat: 'cooldownReduction', op: 'add', value: 0.1 }),
        t('ti_a3b', '时间领主', '攻击速度提升+16%，时缓幅度+8', '⏳', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'timeSlowAmount', op: 'add', value: 8 }] })
      ],
      [
        t('ti_a4a', '永恒瞬间', '时缓幅度+8', '⏳', { stat: 'timeSlowAmount', op: 'add', value: 8 }),
        t('ti_a4b', '时间终焉', '时缓持续时间+1200ms，技能冷却缩减+17%', '⏳', { multi: [{ stat: 'timeSlowDuration', op: 'add', value: 1200 }, { stat: 'cooldownReduction', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'time_ultimate', name: '时之流·终极', icon: '⏳', color: '#ccbb88', layers: [
      [
        t('ti_u1a', '时间觉醒', '时缓幅度+2', '⏳', { stat: 'timeSlowAmount', op: 'add', value: 2 }),
        t('ti_u1b', '因果共鸣', '时缓持续时间+450ms', '⏳', { stat: 'timeSlowDuration', op: 'add', value: 450 })
      ],
      [
        t('ti_u2a', '时心', '技能冷却缩减+7%', '⏳', { stat: 'cooldownReduction', op: 'add', value: 0.07 }),
        t('ti_u2b', '迟滞域', '攻击速度提升+12%', '⏳', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('ti_u2c', '时刃', '时缓幅度+6', '⏳', { stat: 'timeSlowAmount', op: 'add', value: 6 })
      ],
      [
        t('ti_u3a', '领主预备', '时缓持续时间+800ms', '⏳', { stat: 'timeSlowDuration', op: 'add', value: 800 }),
        t('ti_u3b', '时间核心', '技能冷却缩减+12%，攻击速度提升+18%', '⏳', { multi: [{ stat: 'cooldownReduction', op: 'add', value: 0.12 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('ti_u4a', '时间领主', '攻击速度提升+18%', '⏳', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('ti_u4b', '时间领主·极', '攻击速度+20%', '⏳', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  fury: {
    attack: { id: 'fury_attack', name: '狂怒流·攻击', icon: '💢', color: '#ff0044', layers: [
      [
        t('fu_a1a', '狂怒', '低血量时攻击加成+4%', '💢', { stat: 'lowHpBonus', op: 'add', value: 0.04 }),
        t('fu_a1b', '绝地反击', '狂怒触发阈值+6%', '💢', { stat: 'rageThreshold', op: 'add', value: 0.06 }),
        t('fu_a1c', '血怒', '攻击力提升+9%', '💢', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('fu_a2a', '暴怒', '攻击速度提升+10%', '💢', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('fu_a2b', '怒斩', '低血量时攻击加成+9%', '💢', { stat: 'lowHpBonus', op: 'add', value: 0.09 }),
        t('fu_a2c', '狂战', '狂怒触发阈值+11%', '💢', { stat: 'rageThreshold', op: 'add', value: 0.11 })
      ],
      [
        t('fu_a3a', '怒焰', '攻击力提升+13%', '💢', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('fu_a3b', '不灭狂怒', '攻击速度提升+16%，低血量时攻击加成+14%', '💢', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'lowHpBonus', op: 'add', value: 0.14 }] })
      ],
      [
        t('fu_a4a', '狂怒之巅', '低血量时攻击加成+13%', '💢', { stat: 'lowHpBonus', op: 'add', value: 0.13 }),
        t('fu_a4b', '怒之极', '狂怒触发阈值+15%，攻击力提升+21%', '💢', { multi: [{ stat: 'rageThreshold', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'fury_ultimate', name: '狂怒流·终极', icon: '💢', color: '#ff0044', layers: [
      [
        t('fu_u1a', '狂怒觉醒', '低血量时攻击加成+4%', '💢', { stat: 'lowHpBonus', op: 'add', value: 0.04 }),
        t('fu_u1b', '怒意共鸣', '狂怒触发阈值+6%', '💢', { stat: 'rageThreshold', op: 'add', value: 0.06 })
      ],
      [
        t('fu_u2a', '狂心', '攻击力提升+9%', '💢', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('fu_u2b', '血怒域', '攻击速度提升+12%', '💢', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('fu_u2c', '怒刃', '低血量时攻击加成+11%', '💢', { stat: 'lowHpBonus', op: 'add', value: 0.11 })
      ],
      [
        t('fu_u3a', '不灭预备', '狂怒触发阈值+10%', '💢', { stat: 'rageThreshold', op: 'add', value: 0.1 }),
        t('fu_u3b', '狂怒核心', '攻击力提升+15%，攻击速度提升+18%', '💢', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('fu_u4a', '不灭狂怒', '攻击速度提升+18%', '💢', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('fu_u4b', '不灭狂怒·极', '攻击速度+20%', '💢', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  luck: {
    attack: { id: 'luck_attack', name: '幸运流·攻击', icon: '🍀', color: '#44ff44', layers: [
      [
        t('lu_a1a', '幸运星', '幸运事件概率+4%', '🍀', { stat: 'luckBonus', op: 'add', value: 0.04 }),
        t('lu_a1b', '鸿运', '暴击几率+6%', '🍀', { stat: 'critRate', op: 'add', value: 0.06 }),
        t('lu_a1c', '概率提升', '掉落率提升+8%', '🍀', { stat: 'dropRateBonus', op: 'add', value: 0.08 })
      ],
      [
        t('lu_a2a', '天降横财', '攻击力提升+9%', '🍀', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('lu_a2b', '幸运一击', '幸运事件概率+9%', '🍀', { stat: 'luckBonus', op: 'add', value: 0.09 }),
        t('lu_a2c', '命运眷顾', '暴击几率+11%', '🍀', { stat: 'critRate', op: 'add', value: 0.11 })
      ],
      [
        t('lu_a3a', '福星高照', '掉落率提升+10%', '🍀', { stat: 'dropRateBonus', op: 'add', value: 0.1 }),
        t('lu_a3b', '命运之子', '攻击力提升+15%，幸运事件概率+14%', '🍀', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'luckBonus', op: 'add', value: 0.14 }] })
      ],
      [
        t('lu_a4a', '欧皇', '幸运事件概率+13%', '🍀', { stat: 'luckBonus', op: 'add', value: 0.13 }),
        t('lu_a4b', '幸运终焉', '暴击几率+15%，掉落率提升+17%', '🍀', { multi: [{ stat: 'critRate', op: 'add', value: 0.15 }, { stat: 'dropRateBonus', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'luck_ultimate', name: '幸运流·终极', icon: '🍀', color: '#44ff44', layers: [
      [
        t('lu_u1a', '幸运觉醒', '幸运事件概率+4%', '🍀', { stat: 'luckBonus', op: 'add', value: 0.04 }),
        t('lu_u1b', '鸿运共鸣', '暴击几率+6%', '🍀', { stat: 'critRate', op: 'add', value: 0.06 })
      ],
      [
        t('lu_u2a', '运心', '掉落率提升+7%', '🍀', { stat: 'dropRateBonus', op: 'add', value: 0.07 }),
        t('lu_u2b', '福星', '攻击力提升+11%', '🍀', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('lu_u2c', '运刃', '幸运事件概率+11%', '🍀', { stat: 'luckBonus', op: 'add', value: 0.11 })
      ],
      [
        t('lu_u3a', '命运预备', '暴击几率+10%', '🍀', { stat: 'critRate', op: 'add', value: 0.1 }),
        t('lu_u3b', '幸运核心', '掉落率提升+12%，攻击力提升+17%', '🍀', { multi: [{ stat: 'dropRateBonus', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('lu_u4a', '命运之子', '攻击力提升+17%', '🍀', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('lu_u4b', '命运之子·极', '攻击力+19%', '🍀', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  sonic: {
    attack: { id: 'sonic_attack', name: '音波流·攻击', icon: '🔊', color: '#ff88ff', layers: [
      [
        t('so_a1a', '音波脉冲', '音波脉冲伤害+2', '🔊', { stat: 'sonicDamage', op: 'add', value: 2 }),
        t('so_a1b', '震荡', '音波震荡范围+36', '🔊', { stat: 'sonicRadius', op: 'add', value: 36 }),
        t('so_a1c', '共鸣', '音波脉冲间隔缩短+0.08', '🔊', { stat: 'sonicPulseInterval', op: 'add', value: 0.08 })
      ],
      [
        t('so_a2a', '毁灭音', '攻击力提升+9%', '🔊', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('so_a2b', '声波刃', '音波脉冲伤害+5', '🔊', { stat: 'sonicDamage', op: 'add', value: 5 }),
        t('so_a2c', '震爆', '音波震荡范围+61', '🔊', { stat: 'sonicRadius', op: 'add', value: 61 })
      ],
      [
        t('so_a3a', '音爆', '音波脉冲间隔缩短+0.1', '🔊', { stat: 'sonicPulseInterval', op: 'add', value: 0.1 }),
        t('so_a3b', '毁灭共鸣', '攻击力提升+15%，音波脉冲伤害+8', '🔊', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'sonicDamage', op: 'add', value: 8 }] })
      ],
      [
        t('so_a4a', '共振', '音波脉冲伤害+8', '🔊', { stat: 'sonicDamage', op: 'add', value: 8 }),
        t('so_a4b', '音之极', '音波震荡范围+81，音波脉冲间隔缩短+0.17', '🔊', { multi: [{ stat: 'sonicRadius', op: 'add', value: 81 }, { stat: 'sonicPulseInterval', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'sonic_ultimate', name: '音波流·终极', icon: '🔊', color: '#ff88ff', layers: [
      [
        t('so_u1a', '音波觉醒', '音波脉冲伤害+2', '🔊', { stat: 'sonicDamage', op: 'add', value: 2 }),
        t('so_u1b', '共鸣本能', '音波震荡范围+36', '🔊', { stat: 'sonicRadius', op: 'add', value: 36 })
      ],
      [
        t('so_u2a', '音心', '音波脉冲间隔缩短+0.07', '🔊', { stat: 'sonicPulseInterval', op: 'add', value: 0.07 }),
        t('so_u2b', '震荡域', '攻击力提升+11%', '🔊', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('so_u2c', '音刃', '音波脉冲伤害+6', '🔊', { stat: 'sonicDamage', op: 'add', value: 6 })
      ],
      [
        t('so_u3a', '毁灭预备', '音波震荡范围+56', '🔊', { stat: 'sonicRadius', op: 'add', value: 56 }),
        t('so_u3b', '共振核心', '音波脉冲间隔缩短+0.12，攻击力提升+17%', '🔊', { multi: [{ stat: 'sonicPulseInterval', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('so_u4a', '毁灭共鸣', '攻击力提升+17%', '🔊', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('so_u4b', '毁灭共鸣·极', '攻击力+19%', '🔊', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  minion: {
    attack: { id: 'minion_attack', name: '魔仆流·攻击', icon: '👹', color: '#ff4488', layers: [
      [
        t('mi_a1a', '魔仆召唤', '魔仆召唤数量+1', '👹', { stat: 'minionCount', op: 'add', value: 1 }),
        t('mi_a1b', '血球收集', '魔仆攻击伤害+3', '👹', { stat: 'minionDamage', op: 'add', value: 3 }),
        t('mi_a1c', '仆从强化', '血球掉落几率+8%', '👹', { stat: 'bloodOrbDrop', op: 'add', value: 0.08 })
      ],
      [
        t('mi_a2a', '魔军', '攻击力提升+9%', '👹', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('mi_a2b', '血祭仆从', '魔仆召唤数量+2', '👹', { stat: 'minionCount', op: 'add', value: 2 }),
        t('mi_a2c', '魔仆军团', '魔仆攻击伤害+6', '👹', { stat: 'minionDamage', op: 'add', value: 6 })
      ],
      [
        t('mi_a3a', '血之仆', '血球掉落几率+10%', '👹', { stat: 'bloodOrbDrop', op: 'add', value: 0.1 }),
        t('mi_a3b', '魔仆之王', '攻击力提升+15%，魔仆召唤数量+3', '👹', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'minionCount', op: 'add', value: 3 }] })
      ],
      [
        t('mi_a4a', '军团', '魔仆召唤数量+3', '👹', { stat: 'minionCount', op: 'add', value: 3 }),
        t('mi_a4b', '魔仆终焉', '魔仆攻击伤害+9，血球掉落几率+17%', '👹', { multi: [{ stat: 'minionDamage', op: 'add', value: 9 }, { stat: 'bloodOrbDrop', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'minion_ultimate', name: '魔仆流·终极', icon: '👹', color: '#ff4488', layers: [
      [
        t('mi_u1a', '魔仆觉醒', '魔仆召唤数量+1', '👹', { stat: 'minionCount', op: 'add', value: 1 }),
        t('mi_u1b', '血球共鸣', '魔仆攻击伤害+3', '👹', { stat: 'minionDamage', op: 'add', value: 3 })
      ],
      [
        t('mi_u2a', '仆心', '血球掉落几率+7%', '👹', { stat: 'bloodOrbDrop', op: 'add', value: 0.07 }),
        t('mi_u2b', '魔军域', '攻击力提升+11%', '👹', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('mi_u2c', '仆刃', '魔仆召唤数量+2', '👹', { stat: 'minionCount', op: 'add', value: 2 })
      ],
      [
        t('mi_u3a', '军团预备', '魔仆攻击伤害+6', '👹', { stat: 'minionDamage', op: 'add', value: 6 }),
        t('mi_u3b', '魔仆核心', '血球掉落几率+12%，攻击力提升+17%', '👹', { multi: [{ stat: 'bloodOrbDrop', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('mi_u4a', '魔仆军团', '攻击力提升+17%', '👹', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('mi_u4b', '魔仆军团·极', '攻击力+19%', '👹', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  data: {
    attack: { id: 'data_attack', name: '数据流·攻击', icon: '📊', color: '#00ffcc', layers: [
      [
        t('da_a1a', '弱点扫描', '弱点扫描命中几率+3%', '📊', { stat: 'weakPointChance', op: 'add', value: 0.03 }),
        t('da_a1b', '精准分析', '弱点额外伤害+6%', '📊', { stat: 'weakPointBonus', op: 'add', value: 0.06 }),
        t('da_a1c', '数据链', '数据扫描范围+50', '📊', { stat: 'scanRange', op: 'add', value: 50 })
      ],
      [
        t('da_a2a', '全知之眼', '攻击力提升+9%', '📊', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('da_a2b', '漏洞利用', '弱点扫描命中几率+7%', '📊', { stat: 'weakPointChance', op: 'add', value: 0.07 }),
        t('da_a2c', '算法优化', '弱点额外伤害+11%', '📊', { stat: 'weakPointBonus', op: 'add', value: 0.11 })
      ],
      [
        t('da_a3a', '数据风暴', '数据扫描范围+60', '📊', { stat: 'scanRange', op: 'add', value: 60 }),
        t('da_a3b', '弱点锁定', '攻击力提升+15%，弱点扫描命中几率+11%', '📊', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'weakPointChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('da_a4a', '数据斩', '弱点扫描命中几率+11%', '📊', { stat: 'weakPointChance', op: 'add', value: 0.105 }),
        t('da_a4b', '数据终焉', '弱点额外伤害+15%，数据扫描范围+95', '📊', { multi: [{ stat: 'weakPointBonus', op: 'add', value: 0.15 }, { stat: 'scanRange', op: 'add', value: 95 }] })
      ]
    ] },
    ultimate: { id: 'data_ultimate', name: '数据流·终极', icon: '📊', color: '#00ffcc', layers: [
      [
        t('da_u1a', '数据觉醒', '弱点扫描命中几率+3%', '📊', { stat: 'weakPointChance', op: 'add', value: 0.03 }),
        t('da_u1b', '扫描本能', '弱点额外伤害+6%', '📊', { stat: 'weakPointBonus', op: 'add', value: 0.06 })
      ],
      [
        t('da_u2a', '数据心', '数据扫描范围+45', '📊', { stat: 'scanRange', op: 'add', value: 45 }),
        t('da_u2b', '分析域', '攻击力提升+11%', '📊', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('da_u2c', '数据刃', '弱点扫描命中几率+9%', '📊', { stat: 'weakPointChance', op: 'add', value: 0.085 })
      ],
      [
        t('da_u3a', '全知预备', '弱点额外伤害+10%', '📊', { stat: 'weakPointBonus', op: 'add', value: 0.1 }),
        t('da_u3b', '算法核心', '数据扫描范围+70，攻击力提升+17%', '📊', { multi: [{ stat: 'scanRange', op: 'add', value: 70 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('da_u4a', '全知之眼', '攻击力提升+17%', '📊', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('da_u4b', '全知之眼·极', '攻击力+19%', '📊', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  nature: {
    attack: { id: 'nature_attack', name: '自然流·攻击', icon: '🌿', color: '#44ff88', layers: [
      [
        t('na_a1a', '自然恢复', '自然生命回复+2', '🌿', { stat: 'regenRate', op: 'add', value: 2 }),
        t('na_a1b', '荆棘反刺', '荆棘反伤伤害+3', '🌿', { stat: 'thornDamage', op: 'add', value: 3 }),
        t('na_a1c', '藤蔓缠绕', '藤蔓定身几率+8%', '🌿', { stat: 'vineRoot', op: 'add', value: 0.08 })
      ],
      [
        t('na_a2a', '自然之怒', '生命上限提升+9%', '🌿', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('na_a2b', '生机', '自然生命回复+5', '🌿', { stat: 'regenRate', op: 'add', value: 5 }),
        t('na_a2c', '荆棘丛林', '荆棘反伤伤害+6', '🌿', { stat: 'thornDamage', op: 'add', value: 6 })
      ],
      [
        t('na_a3a', '根须', '藤蔓定身几率+10%', '🌿', { stat: 'vineRoot', op: 'add', value: 0.1 }),
        t('na_a3b', '自然之力', '生命上限提升+15%，自然生命回复+8', '🌿', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'regenRate', op: 'add', value: 8 }] })
      ],
      [
        t('na_a4a', '森罗', '自然生命回复+8', '🌿', { stat: 'regenRate', op: 'add', value: 8 }),
        t('na_a4b', '自然终焉', '荆棘反伤伤害+9，藤蔓定身几率+17%', '🌿', { multi: [{ stat: 'thornDamage', op: 'add', value: 9 }, { stat: 'vineRoot', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'nature_ultimate', name: '自然流·终极', icon: '🌿', color: '#44ff88', layers: [
      [
        t('na_u1a', '自然觉醒', '自然生命回复+2', '🌿', { stat: 'regenRate', op: 'add', value: 2 }),
        t('na_u1b', '生机共鸣', '荆棘反伤伤害+3', '🌿', { stat: 'thornDamage', op: 'add', value: 3 })
      ],
      [
        t('na_u2a', '自然心', '藤蔓定身几率+7%', '🌿', { stat: 'vineRoot', op: 'add', value: 0.07 }),
        t('na_u2b', '荆棘域', '生命上限提升+11%', '🌿', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('na_u2c', '藤刃', '自然生命回复+6', '🌿', { stat: 'regenRate', op: 'add', value: 6 })
      ],
      [
        t('na_u3a', '之怒预备', '荆棘反伤伤害+6', '🌿', { stat: 'thornDamage', op: 'add', value: 6 }),
        t('na_u3b', '森罗核心', '藤蔓定身几率+12%，生命上限提升+17%', '🌿', { multi: [{ stat: 'vineRoot', op: 'add', value: 0.12 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('na_u4a', '自然之怒', '生命上限提升+17%', '🌿', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('na_u4b', '自然之怒·极', '生命上限+19%', '🌿', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  psychic: {
    attack: { id: 'psychic_attack', name: '心灵流·攻击', icon: '🧠', color: '#ff44ff', layers: [
      [
        t('ps_a1a', '心灵标记', '心灵标记几率+3%', '🧠', { stat: 'markChance', op: 'add', value: 0.03 }),
        t('ps_a1b', '预判', '标记目标额外伤害+6%', '🧠', { stat: 'markBonus', op: 'add', value: 0.06 }),
        t('ps_a1c', '读心', '心灵预判范围+53', '🧠', { stat: 'predictRange', op: 'add', value: 53 })
      ],
      [
        t('ps_a2a', '心灵风暴', '攻击力提升+9%', '🧠', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ps_a2b', '精神冲击', '心灵标记几率+7%', '🧠', { stat: 'markChance', op: 'add', value: 0.07 }),
        t('ps_a2c', '预知', '标记目标额外伤害+11%', '🧠', { stat: 'markBonus', op: 'add', value: 0.11 })
      ],
      [
        t('ps_a3a', '心灵链接', '心灵预判范围+63', '🧠', { stat: 'predictRange', op: 'add', value: 63 }),
        t('ps_a3b', '精神支配', '攻击力提升+15%，心灵标记几率+11%', '🧠', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'markChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ps_a4a', '心灵斩', '心灵标记几率+11%', '🧠', { stat: 'markChance', op: 'add', value: 0.105 }),
        t('ps_a4b', '心灵终焉', '标记目标额外伤害+15%，心灵预判范围+98', '🧠', { multi: [{ stat: 'markBonus', op: 'add', value: 0.15 }, { stat: 'predictRange', op: 'add', value: 98 }] })
      ]
    ] },
    ultimate: { id: 'psychic_ultimate', name: '心灵流·终极', icon: '🧠', color: '#ff44ff', layers: [
      [
        t('ps_u1a', '心灵觉醒', '心灵标记几率+3%', '🧠', { stat: 'markChance', op: 'add', value: 0.03 }),
        t('ps_u1b', '精神共鸣', '标记目标额外伤害+6%', '🧠', { stat: 'markBonus', op: 'add', value: 0.06 })
      ],
      [
        t('ps_u2a', '心灵心', '心灵预判范围+48', '🧠', { stat: 'predictRange', op: 'add', value: 48 }),
        t('ps_u2b', '预知域', '攻击力提升+11%', '🧠', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ps_u2c', '灵刃', '心灵标记几率+9%', '🧠', { stat: 'markChance', op: 'add', value: 0.085 })
      ],
      [
        t('ps_u3a', '风暴预备', '标记目标额外伤害+10%', '🧠', { stat: 'markBonus', op: 'add', value: 0.1 }),
        t('ps_u3b', '精神核心', '心灵预判范围+73，攻击力提升+17%', '🧠', { multi: [{ stat: 'predictRange', op: 'add', value: 73 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ps_u4a', '心灵风暴', '攻击力提升+17%', '🧠', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ps_u4b', '心灵风暴·极', '攻击力+19%', '🧠', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  explosive: {
    attack: { id: 'explosive_attack', name: '爆破流·攻击', icon: '💥', color: '#ff8800', layers: [
      [
        t('ex_a1a', '爆炸增幅', '爆炸伤害加成+4%', '💥', { stat: 'explosionBonus', op: 'add', value: 0.04 }),
        t('ex_a1b', '范围扩大', '爆炸范围扩大+34', '💥', { stat: 'explosionRadius', op: 'add', value: 34 }),
        t('ex_a1c', '连锁爆炸', '爆炸连锁几率+8%', '💥', { stat: 'chainExplosion', op: 'add', value: 0.08 })
      ],
      [
        t('ex_a2a', '核爆终焉', '攻击力提升+9%', '💥', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ex_a2b', '爆破专家', '爆炸伤害加成+9%', '💥', { stat: 'explosionBonus', op: 'add', value: 0.09 }),
        t('ex_a2c', '冲击波', '爆炸范围扩大+59', '💥', { stat: 'explosionRadius', op: 'add', value: 59 })
      ],
      [
        t('ex_a3a', '爆燃', '爆炸连锁几率+10%', '💥', { stat: 'chainExplosion', op: 'add', value: 0.1 }),
        t('ex_a3b', '毁灭爆炸', '攻击力提升+15%，爆炸伤害加成+14%', '💥', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'explosionBonus', op: 'add', value: 0.14 }] })
      ],
      [
        t('ex_a4a', '爆破风暴', '爆炸伤害加成+13%', '💥', { stat: 'explosionBonus', op: 'add', value: 0.13 }),
        t('ex_a4b', '爆之极', '爆炸范围扩大+79，爆炸连锁几率+17%', '💥', { multi: [{ stat: 'explosionRadius', op: 'add', value: 79 }, { stat: 'chainExplosion', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'explosive_ultimate', name: '爆破流·终极', icon: '💥', color: '#ff8800', layers: [
      [
        t('ex_u1a', '爆破觉醒', '爆炸伤害加成+4%', '💥', { stat: 'explosionBonus', op: 'add', value: 0.04 }),
        t('ex_u1b', '爆燃共鸣', '爆炸范围扩大+34', '💥', { stat: 'explosionRadius', op: 'add', value: 34 })
      ],
      [
        t('ex_u2a', '爆心', '爆炸连锁几率+7%', '💥', { stat: 'chainExplosion', op: 'add', value: 0.07 }),
        t('ex_u2b', '冲击域', '攻击力提升+11%', '💥', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ex_u2c', '爆刃', '爆炸伤害加成+11%', '💥', { stat: 'explosionBonus', op: 'add', value: 0.11 })
      ],
      [
        t('ex_u3a', '核爆预备', '爆炸范围扩大+54', '💥', { stat: 'explosionRadius', op: 'add', value: 54 }),
        t('ex_u3b', '毁灭核心', '爆炸连锁几率+12%，攻击力提升+17%', '💥', { multi: [{ stat: 'chainExplosion', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ex_u4a', '核爆终焉', '攻击力提升+17%', '💥', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ex_u4b', '核爆终焉·极', '攻击力+19%', '💥', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  mech: {
    attack: { id: 'mech_attack', name: '机械流·攻击', icon: '🤖', color: '#88aaff', layers: [
      [
        t('me_a1a', '机器人部署', '战斗机器人数量+1', '🤖', { stat: 'robotCount', op: 'add', value: 1 }),
        t('me_a1b', '自动修复', '机器人火力+3', '🤖', { stat: 'robotDamage', op: 'add', value: 3 }),
        t('me_a1c', '机械军团', '机械自我修复+4', '🤖', { stat: 'repairRate', op: 'add', value: 4 })
      ],
      [
        t('me_a2a', '机械天网', '攻击力提升+9%', '🤖', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('me_a2b', '齿轮', '战斗机器人数量+2', '🤖', { stat: 'robotCount', op: 'add', value: 2 }),
        t('me_a2c', '钢铁意志', '机器人火力+6', '🤖', { stat: 'robotDamage', op: 'add', value: 6 })
      ],
      [
        t('me_a3a', '机甲', '机械自我修复+6', '🤖', { stat: 'repairRate', op: 'add', value: 6 }),
        t('me_a3b', '天网覆盖', '攻击力提升+15%，战斗机器人数量+3', '🤖', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'robotCount', op: 'add', value: 3 }] })
      ],
      [
        t('me_a4a', '机械风暴', '战斗机器人数量+3', '🤖', { stat: 'robotCount', op: 'add', value: 3 }),
        t('me_a4b', '机械终焉', '机器人火力+9，机械自我修复+10', '🤖', { multi: [{ stat: 'robotDamage', op: 'add', value: 9 }, { stat: 'repairRate', op: 'add', value: 10 }] })
      ]
    ] },
    ultimate: { id: 'mech_ultimate', name: '机械流·终极', icon: '🤖', color: '#88aaff', layers: [
      [
        t('me_u1a', '机械觉醒', '战斗机器人数量+1', '🤖', { stat: 'robotCount', op: 'add', value: 1 }),
        t('me_u1b', '齿轮共鸣', '机器人火力+3', '🤖', { stat: 'robotDamage', op: 'add', value: 3 })
      ],
      [
        t('me_u2a', '机心', '机械自我修复+4', '🤖', { stat: 'repairRate', op: 'add', value: 4 }),
        t('me_u2b', '修复域', '攻击力提升+11%', '🤖', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('me_u2c', '机刃', '战斗机器人数量+2', '🤖', { stat: 'robotCount', op: 'add', value: 2 })
      ],
      [
        t('me_u3a', '天网预备', '机器人火力+6', '🤖', { stat: 'robotDamage', op: 'add', value: 6 }),
        t('me_u3b', '钢铁核心', '机械自我修复+7，攻击力提升+17%', '🤖', { multi: [{ stat: 'repairRate', op: 'add', value: 7 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('me_u4a', '机械天网', '攻击力提升+17%', '🤖', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('me_u4b', '机械天网·极', '攻击力+19%', '🤖', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  rune: {
    attack: { id: 'rune_attack', name: '符文流·攻击', icon: '🔮', color: '#ffaa44', layers: [
      [
        t('ru_a1a', '符文掉落', '符文掉落几率+4%', '🔮', { stat: 'runeDrop', op: 'add', value: 0.04 }),
        t('ru_a1b', '印记触发', '符文触发效果+6%', '🔮', { stat: 'runeEffect', op: 'add', value: 0.06 }),
        t('ru_a1c', '符文强化', '符文持续时间+600ms', '🔮', { stat: 'runeDuration', op: 'add', value: 600 })
      ],
      [
        t('ru_a2a', '符文之主', '攻击力提升+9%', '🔮', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ru_a2b', '刻印', '符文掉落几率+9%', '🔮', { stat: 'runeDrop', op: 'add', value: 0.09 }),
        t('ru_a2c', '符文阵列', '符文触发效果+11%', '🔮', { stat: 'runeEffect', op: 'add', value: 0.11 })
      ],
      [
        t('ru_a3a', '秘纹', '符文持续时间+800ms', '🔮', { stat: 'runeDuration', op: 'add', value: 800 }),
        t('ru_a3b', '符文风暴', '攻击力提升+15%，符文掉落几率+14%', '🔮', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'runeDrop', op: 'add', value: 0.14 }] })
      ],
      [
        t('ru_a4a', '符文斩', '符文掉落几率+13%', '🔮', { stat: 'runeDrop', op: 'add', value: 0.13 }),
        t('ru_a4b', '符文终焉', '符文触发效果+15%，符文持续时间+1350ms', '🔮', { multi: [{ stat: 'runeEffect', op: 'add', value: 0.15 }, { stat: 'runeDuration', op: 'add', value: 1350 }] })
      ]
    ] },
    ultimate: { id: 'rune_ultimate', name: '符文流·终极', icon: '🔮', color: '#ffaa44', layers: [
      [
        t('ru_u1a', '符文觉醒', '符文掉落几率+4%', '🔮', { stat: 'runeDrop', op: 'add', value: 0.04 }),
        t('ru_u1b', '刻印本能', '符文触发效果+6%', '🔮', { stat: 'runeEffect', op: 'add', value: 0.06 })
      ],
      [
        t('ru_u2a', '符心', '符文持续时间+550ms', '🔮', { stat: 'runeDuration', op: 'add', value: 550 }),
        t('ru_u2b', '秘纹域', '攻击力提升+11%', '🔮', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ru_u2c', '符刃', '符文掉落几率+11%', '🔮', { stat: 'runeDrop', op: 'add', value: 0.11 })
      ],
      [
        t('ru_u3a', '之主预备', '符文触发效果+10%', '🔮', { stat: 'runeEffect', op: 'add', value: 0.1 }),
        t('ru_u3b', '符文核心', '符文持续时间+950ms，攻击力提升+17%', '🔮', { multi: [{ stat: 'runeDuration', op: 'add', value: 950 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ru_u4a', '符文之主', '攻击力提升+17%', '🔮', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ru_u4b', '符文之主·极', '攻击力+19%', '🔮', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  star: {
    attack: { id: 'star_attack', name: '星辰流·攻击', icon: '⭐', color: '#ffffaa', layers: [
      [
        t('st_a1a', '星能蓄力', '星能充能速度+4%', '⭐', { stat: 'chargeRate', op: 'add', value: 0.04 }),
        t('st_a1b', '星光充能', '星能蓄力上限+0.06', '⭐', { stat: 'maxStarCharge', op: 'add', value: 0.06 }),
        t('st_a1c', '星爆', '攻击力提升+9%', '⭐', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('st_a2a', '超新星', '暴击几率+7%', '⭐', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('st_a2b', '星辰之力', '星能充能速度+9%', '⭐', { stat: 'chargeRate', op: 'add', value: 0.09 }),
        t('st_a2c', '星轨', '星能蓄力上限+0.11', '⭐', { stat: 'maxStarCharge', op: 'add', value: 0.11 })
      ],
      [
        t('st_a3a', '聚星', '攻击力提升+13%', '⭐', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('st_a3b', '星爆释放', '暴击几率+12%，星能充能速度+14%', '⭐', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'chargeRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('st_a4a', '星辰斩', '星能充能速度+13%', '⭐', { stat: 'chargeRate', op: 'add', value: 0.13 }),
        t('st_a4b', '星之极', '星能蓄力上限+0.15，攻击力提升+21%', '⭐', { multi: [{ stat: 'maxStarCharge', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'star_ultimate', name: '星辰流·终极', icon: '⭐', color: '#ffffaa', layers: [
      [
        t('st_u1a', '星辰觉醒', '星能充能速度+4%', '⭐', { stat: 'chargeRate', op: 'add', value: 0.04 }),
        t('st_u1b', '星光共鸣', '星能蓄力上限+0.06', '⭐', { stat: 'maxStarCharge', op: 'add', value: 0.06 })
      ],
      [
        t('st_u2a', '星心', '攻击力提升+9%', '⭐', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('st_u2b', '蓄力域', '暴击几率+9%', '⭐', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('st_u2c', '星刃', '星能充能速度+11%', '⭐', { stat: 'chargeRate', op: 'add', value: 0.11 })
      ],
      [
        t('st_u3a', '新星预备', '星能蓄力上限+0.1', '⭐', { stat: 'maxStarCharge', op: 'add', value: 0.1 }),
        t('st_u3b', '聚星核心', '攻击力提升+15%，暴击几率+14%', '⭐', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('st_u4a', '超新星', '暴击几率+13%', '⭐', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('st_u4b', '超新星·极', '暴击率+15%', '⭐', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  darkGold: {
    attack: { id: 'darkGold_attack', name: '暗金流·攻击', icon: '💰', color: '#ffcc00', layers: [
      [
        t('da_a1a', '金币加成', '金币获取加成+4%', '💰', { stat: 'goldBonus', op: 'add', value: 0.04 }),
        t('da_a1b', '击金', '每次命中额外金币+0.06', '💰', { stat: 'goldOnHit', op: 'add', value: 0.06 }),
        t('da_a1c', '黄金磁铁', '金币吸附范围+45', '💰', { stat: 'goldMagnet', op: 'add', value: 45 })
      ],
      [
        t('da_a2a', '黄金帝王', '攻击力提升+9%', '💰', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('da_a2b', '敛财', '金币获取加成+9%', '💰', { stat: 'goldBonus', op: 'add', value: 0.09 }),
        t('da_a2c', '金币风暴', '每次命中额外金币+0.11', '💰', { stat: 'goldOnHit', op: 'add', value: 0.11 })
      ],
      [
        t('da_a3a', '暗金', '金币吸附范围+55', '💰', { stat: 'goldMagnet', op: 'add', value: 55 }),
        t('da_a3b', '黄金帝国', '攻击力提升+15%，金币获取加成+14%', '💰', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'goldBonus', op: 'add', value: 0.14 }] })
      ],
      [
        t('da_a4a', '金雨', '金币获取加成+13%', '💰', { stat: 'goldBonus', op: 'add', value: 0.13 }),
        t('da_a4b', '金之极', '每次命中额外金币+0.15，金币吸附范围+90', '💰', { multi: [{ stat: 'goldOnHit', op: 'add', value: 0.15 }, { stat: 'goldMagnet', op: 'add', value: 90 }] })
      ]
    ] },
    ultimate: { id: 'darkGold_ultimate', name: '暗金流·终极', icon: '💰', color: '#ffcc00', layers: [
      [
        t('da_u1a', '暗金觉醒', '金币获取加成+4%', '💰', { stat: 'goldBonus', op: 'add', value: 0.04 }),
        t('da_u1b', '敛财共鸣', '每次命中额外金币+0.06', '💰', { stat: 'goldOnHit', op: 'add', value: 0.06 })
      ],
      [
        t('da_u2a', '金心', '金币吸附范围+40', '💰', { stat: 'goldMagnet', op: 'add', value: 40 }),
        t('da_u2b', '磁铁域', '攻击力提升+11%', '💰', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('da_u2c', '金刃', '金币获取加成+11%', '💰', { stat: 'goldBonus', op: 'add', value: 0.11 })
      ],
      [
        t('da_u3a', '帝王预备', '每次命中额外金币+0.1', '💰', { stat: 'goldOnHit', op: 'add', value: 0.1 }),
        t('da_u3b', '黄金核心', '金币吸附范围+65，攻击力提升+17%', '💰', { multi: [{ stat: 'goldMagnet', op: 'add', value: 65 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('da_u4a', '黄金帝王', '攻击力提升+17%', '💰', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('da_u4b', '黄金帝王·极', '攻击力+19%', '💰', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  storm: {
    attack: { id: 'storm_attack', name: '风暴流·攻击', icon: '🌪️', color: '#88ffcc', layers: [
      [
        t('st_a1a', '风墙', '风墙护体范围+24', '🌪️', { stat: 'windWallRadius', op: 'add', value: 24 }),
        t('st_a1b', '龙卷', '疾风击退力度+35', '🌪️', { stat: 'windPushForce', op: 'add', value: 35 }),
        t('st_a1c', '风暴推击', '龙卷触发几率+6%', '🌪️', { stat: 'tornadoChance', op: 'add', value: 0.06 })
      ],
      [
        t('st_a2a', '风暴领主', '攻击力提升+9%', '🌪️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('st_a2b', '飓风', '风墙护体范围+49', '🌪️', { stat: 'windWallRadius', op: 'add', value: 49 }),
        t('st_a2c', '风暴眼', '疾风击退力度+60', '🌪️', { stat: 'windPushForce', op: 'add', value: 60 })
      ],
      [
        t('st_a3a', '旋风', '龙卷触发几率+8%', '🌪️', { stat: 'tornadoChance', op: 'add', value: 0.08 }),
        t('st_a3b', '风暴领域', '攻击力提升+15%，风墙护体范围+74', '🌪️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'windWallRadius', op: 'add', value: 74 }] })
      ],
      [
        t('st_a4a', '风暴斩', '风墙护体范围+69', '🌪️', { stat: 'windWallRadius', op: 'add', value: 69 }),
        t('st_a4b', '风暴终焉', '疾风击退力度+80，龙卷触发几率+14%', '🌪️', { multi: [{ stat: 'windPushForce', op: 'add', value: 80 }, { stat: 'tornadoChance', op: 'add', value: 0.135 }] })
      ]
    ] },
    ultimate: { id: 'storm_ultimate', name: '风暴流·终极', icon: '🌪️', color: '#88ffcc', layers: [
      [
        t('st_u1a', '风暴觉醒', '风墙护体范围+24', '🌪️', { stat: 'windWallRadius', op: 'add', value: 24 }),
        t('st_u1b', '旋风共鸣', '疾风击退力度+35', '🌪️', { stat: 'windPushForce', op: 'add', value: 35 })
      ],
      [
        t('st_u2a', '风心', '龙卷触发几率+6%', '🌪️', { stat: 'tornadoChance', op: 'add', value: 0.055 }),
        t('st_u2b', '龙卷域', '攻击力提升+11%', '🌪️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('st_u2c', '风刃', '风墙护体范围+59', '🌪️', { stat: 'windWallRadius', op: 'add', value: 59 })
      ],
      [
        t('st_u3a', '领主预备', '疾风击退力度+55', '🌪️', { stat: 'windPushForce', op: 'add', value: 55 }),
        t('st_u3b', '飓风核心', '龙卷触发几率+10%，攻击力提升+17%', '🌪️', { multi: [{ stat: 'tornadoChance', op: 'add', value: 0.095 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('st_u4a', '风暴领主', '攻击力提升+17%', '🌪️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('st_u4b', '风暴领主·极', '攻击力+19%', '🌪️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  soul: {
    attack: { id: 'soul_attack', name: '灵魂流·攻击', icon: '👻', color: '#cc88ff', layers: [
      [
        t('sl_a1', '聚魂术', '击杀收集残魂，上限+5', '👻', { stat: 'maxSouls', op: 'add', value: 5 }),
        t('sl_a2', '魂力共鸣', '每个灵魂属性加成+1%', '💜', { stat: 'soulBonus', op: 'add', value: 0.01 }),
        t('sl_a3', '噬魂弹', '攻击力+8%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.08 })
      ],
      [
        t('sl_a4', '灵魂洪流', '灵魂容器上限+8', '🏺', { stat: 'maxSouls', op: 'add', value: 8 }),
        t('sl_a5', '亡者低语', '灵魂加成+2%', '👻', { stat: 'soulBonus', op: 'add', value: 0.02 }),
        t('sl_a6', '魂刃', '暴击率+4%', '💥', { stat: 'critRate', op: 'add', value: 0.04 })
      ],
      [
        t('sl_a7', '收割者', '灵魂上限+12，加成+2%', '👻', { multi: [{ stat: 'maxSouls', op: 'add', value: 12 }, { stat: 'soulBonus', op: 'add', value: 0.02 }] }),
        t('sl_a8', '万魂归一', '攻击力+15%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.15 })
      ],
      [
        t('sl_a9', '灵魂风暴', '灵魂上限+15', '🌪️', { stat: 'maxSouls', op: 'add', value: 15 }),
        t('sl_a10', '魂之帝王', '灵魂加成+3%，暴击率+8%', '👑', { multi: [{ stat: 'soulBonus', op: 'add', value: 0.03 }, { stat: 'critRate', op: 'add', value: 0.08 }] })
      ]
    ] },
    ultimate: { id: 'soul_ultimate', name: '灵魂流·终极', icon: '👻', color: '#cc88ff', layers: [
      [
        t('sl_u1', '灵魂觉醒', '灵魂上限+5', '👻', { stat: 'maxSouls', op: 'add', value: 5 }),
        t('sl_u2', '残魂共鸣', '灵魂加成+1%', '💜', { stat: 'soulBonus', op: 'add', value: 0.01 })
      ],
      [
        t('sl_u3', '魂瓮扩容', '灵魂上限+8', '🏺', { stat: 'maxSouls', op: 'add', value: 8 }),
        t('sl_u4', '聚魂法阵', '灵魂加成+2%', '🔮', { stat: 'soulBonus', op: 'add', value: 0.02 }),
        t('sl_u5', '魂刃', '攻击力+10%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.1 })
      ],
      [
        t('sl_u6', '收割预备', '灵魂上限+10', '👻', { stat: 'maxSouls', op: 'add', value: 10 }),
        t('sl_u7', '万魂核心', '灵魂加成+3%', '💜', { stat: 'soulBonus', op: 'add', value: 0.03 })
      ],
      [
        t('sl_u8', '灵魂收割者', '灵魂上限+20，加成+4%', '👻', { multi: [{ stat: 'maxSouls', op: 'add', value: 20 }, { stat: 'soulBonus', op: 'add', value: 0.04 }] }),
        t('sl_u8b', '灵魂收割者·极', '灵魂上限+23，灵魂加成+5%', '👻', { multi: [{ stat: 'maxSouls', op: 'add', value: 23 }, { stat: 'soulBonus', op: 'add', value: 0.046 }] })
      ]
    ] }
  },
  genesis: {
    attack: { id: 'genesis_attack', name: '创世流·攻击', icon: '🌌', color: '#ffffff', layers: [
      [
        t('ge_a1a', '随机增益', '随机增益持续+300ms', '🌌', { stat: 'buffDuration', op: 'add', value: 300 }),
        t('ge_a1b', '混沌创世', '随机增益触发间隔+0.06', '🌌', { stat: 'randomBuffInterval', op: 'add', value: 0.06 }),
        t('ge_a1c', '创世神', '攻击力提升+9%', '🌌', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ge_a2a', '增益延长', '生命上限提升+9%', '🌌', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('ge_a2b', '混沌', '随机增益持续+700ms', '🌌', { stat: 'buffDuration', op: 'add', value: 700 }),
        t('ge_a2c', '创世之力', '随机增益触发间隔+0.11', '🌌', { stat: 'randomBuffInterval', op: 'add', value: 0.11 })
      ],
      [
        t('ge_a3a', '万物生长', '攻击力提升+13%', '🌌', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ge_a3b', '创世风暴', '生命上限提升+15%，随机增益持续+1100ms', '🌌', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'buffDuration', op: 'add', value: 1100 }] })
      ],
      [
        t('ge_a4a', '混沌斩', '随机增益持续+1050ms', '🌌', { stat: 'buffDuration', op: 'add', value: 1050 }),
        t('ge_a4b', '创世终焉', '随机增益触发间隔+0.15，攻击力提升+21%', '🌌', { multi: [{ stat: 'randomBuffInterval', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'genesis_ultimate', name: '创世流·终极', icon: '🌌', color: '#ffffff', layers: [
      [
        t('ge_u1a', '创世觉醒', '随机增益持续+300ms', '🌌', { stat: 'buffDuration', op: 'add', value: 300 }),
        t('ge_u1b', '混沌共鸣', '随机增益触发间隔+0.06', '🌌', { stat: 'randomBuffInterval', op: 'add', value: 0.06 })
      ],
      [
        t('ge_u2a', '创心', '攻击力提升+9%', '🌌', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ge_u2b', '增益域', '生命上限提升+11%', '🌌', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('ge_u2c', '创刃', '随机增益持续+850ms', '🌌', { stat: 'buffDuration', op: 'add', value: 850 })
      ],
      [
        t('ge_u3a', '之神预备', '随机增益触发间隔+0.1', '🌌', { stat: 'randomBuffInterval', op: 'add', value: 0.1 }),
        t('ge_u3b', '混沌核心', '攻击力提升+15%，生命上限提升+17%', '🌌', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ge_u4a', '创世神', '生命上限提升+17%', '🌌', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('ge_u4b', '创世神·极', '生命上限+19%', '🌌', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  tech: {
    attack: { id: 'tech_attack', name: '科技流·攻击', icon: '⚙️', color: '#44ddff', layers: [
      [
        t('te_a1a', '技术强化', '技能效果强化+4%', '⚙️', { stat: 'skillBoost', op: 'add', value: 0.04 }),
        t('te_a1b', '冷却缩减', '技能冷却缩减+6%', '⚙️', { stat: 'cooldownReduction', op: 'add', value: 0.06 }),
        t('te_a1c', '纳米修复', '纳米修复速率+4', '⚙️', { stat: 'nanoRepair', op: 'add', value: 4 })
      ],
      [
        t('te_a2a', '科技巅峰', '攻击力提升+9%', '⚙️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('te_a2b', '芯片', '技能效果强化+9%', '⚙️', { stat: 'skillBoost', op: 'add', value: 0.09 }),
        t('te_a2c', '科技升级', '技能冷却缩减+11%', '⚙️', { stat: 'cooldownReduction', op: 'add', value: 0.11 })
      ],
      [
        t('te_a3a', '量子', '纳米修复速率+6', '⚙️', { stat: 'nanoRepair', op: 'add', value: 6 }),
        t('te_a3b', '科技风暴', '攻击力提升+15%，技能效果强化+14%', '⚙️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'skillBoost', op: 'add', value: 0.14 }] })
      ],
      [
        t('te_a4a', '科技斩', '技能效果强化+13%', '⚙️', { stat: 'skillBoost', op: 'add', value: 0.13 }),
        t('te_a4b', '科技终焉', '技能冷却缩减+15%，纳米修复速率+10', '⚙️', { multi: [{ stat: 'cooldownReduction', op: 'add', value: 0.15 }, { stat: 'nanoRepair', op: 'add', value: 10 }] })
      ]
    ] },
    ultimate: { id: 'tech_ultimate', name: '科技流·终极', icon: '⚙️', color: '#44ddff', layers: [
      [
        t('te_u1a', '科技觉醒', '技能效果强化+4%', '⚙️', { stat: 'skillBoost', op: 'add', value: 0.04 }),
        t('te_u1b', '芯片共鸣', '技能冷却缩减+6%', '⚙️', { stat: 'cooldownReduction', op: 'add', value: 0.06 })
      ],
      [
        t('te_u2a', '科心', '纳米修复速率+4', '⚙️', { stat: 'nanoRepair', op: 'add', value: 4 }),
        t('te_u2b', '量子域', '攻击力提升+11%', '⚙️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('te_u2c', '科刃', '技能效果强化+11%', '⚙️', { stat: 'skillBoost', op: 'add', value: 0.11 })
      ],
      [
        t('te_u3a', '巅峰预备', '技能冷却缩减+10%', '⚙️', { stat: 'cooldownReduction', op: 'add', value: 0.1 }),
        t('te_u3b', '纳米核心', '纳米修复速率+7，攻击力提升+17%', '⚙️', { multi: [{ stat: 'nanoRepair', op: 'add', value: 7 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('te_u4a', '科技巅峰', '攻击力提升+17%', '⚙️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('te_u4b', '科技巅峰·极', '攻击力+19%', '⚙️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  chaos: {
    attack: { id: 'chaos_attack', name: '混沌流·攻击', icon: '🎭', color: '#ff44aa', layers: [
      [
        t('ch_a1a', '随机元素', '混沌随机效果几率+3%', '🎭', { stat: 'randomEffectChance', op: 'add', value: 0.03 }),
        t('ch_a1b', '混沌之力', '混沌伤害倍率+6%', '🎭', { stat: 'chaosMultiplier', op: 'add', value: 0.06 }),
        t('ch_a1c', '混沌之源', '攻击力提升+9%', '🎭', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ch_a2a', '混沌增幅', '暴击几率+7%', '🎭', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('ch_a2b', '无序', '混沌随机效果几率+7%', '🎭', { stat: 'randomEffectChance', op: 'add', value: 0.07 }),
        t('ch_a2c', '混沌风暴', '混沌伤害倍率+11%', '🎭', { stat: 'chaosMultiplier', op: 'add', value: 0.11 })
      ],
      [
        t('ch_a3a', '乱流', '攻击力提升+13%', '🎭', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ch_a3b', '混沌领域', '暴击几率+12%，混沌随机效果几率+11%', '🎭', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'randomEffectChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ch_a4a', '混沌斩', '混沌随机效果几率+11%', '🎭', { stat: 'randomEffectChance', op: 'add', value: 0.105 }),
        t('ch_a4b', '混沌终焉', '混沌伤害倍率+15%，攻击力提升+21%', '🎭', { multi: [{ stat: 'chaosMultiplier', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'chaos_ultimate', name: '混沌流·终极', icon: '🎭', color: '#ff44aa', layers: [
      [
        t('ch_u1a', '混沌觉醒', '混沌随机效果几率+3%', '🎭', { stat: 'randomEffectChance', op: 'add', value: 0.03 }),
        t('ch_u1b', '无序共鸣', '混沌伤害倍率+6%', '🎭', { stat: 'chaosMultiplier', op: 'add', value: 0.06 })
      ],
      [
        t('ch_u2a', '混心', '攻击力提升+9%', '🎭', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ch_u2b', '乱流域', '暴击几率+9%', '🎭', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('ch_u2c', '混刃', '混沌随机效果几率+9%', '🎭', { stat: 'randomEffectChance', op: 'add', value: 0.085 })
      ],
      [
        t('ch_u3a', '之源预备', '混沌伤害倍率+10%', '🎭', { stat: 'chaosMultiplier', op: 'add', value: 0.1 }),
        t('ch_u3b', '混沌核心', '攻击力提升+15%，暴击几率+14%', '🎭', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('ch_u4a', '混沌之源', '暴击几率+13%', '🎭', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('ch_u4b', '混沌之源·极', '暴击率+15%', '🎭', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  light: {
    attack: { id: 'light_attack', name: '光之流·攻击', icon: '☀️', color: '#fff9c4', layers: [
      [
        t('li_a1a', '光能汇聚', '光能充能速度+0.04', '☀️', { stat: 'lightCharge', op: 'add', value: 0.04 }),
        t('li_a1b', '辐射照耀', '光爆爆发伤害+6.325', '☀️', { stat: 'lightBurstDamage', op: 'add', value: 6.325 }),
        t('li_a1c', '极光爆发', '攻击力提升+9%', '☀️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('li_a2a', '极光领域', '暴击几率+7%', '☀️', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('li_a2b', '光刃', '光能充能速度+0.09', '☀️', { stat: 'lightCharge', op: 'add', value: 0.09 }),
        t('li_a2c', '圣光', '光爆爆发伤害+14.025', '☀️', { stat: 'lightBurstDamage', op: 'add', value: 14.025 })
      ],
      [
        t('li_a3a', '光爆', '攻击力提升+13%', '☀️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('li_a3b', '光之审判', '暴击几率+12%，光能充能速度+0.14', '☀️', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'lightCharge', op: 'add', value: 0.14 }] })
      ],
      [
        t('li_a4a', '光耀', '光能充能速度+0.13', '☀️', { stat: 'lightCharge', op: 'add', value: 0.13 }),
        t('li_a4b', '光之极', '光爆爆发伤害+25.3，攻击力提升+21%', '☀️', { multi: [{ stat: 'lightBurstDamage', op: 'add', value: 25.3 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'light_ultimate', name: '光之流·终极', icon: '☀️', color: '#fff9c4', layers: [
      [
        t('li_u1a', '光能觉醒', '光能充能速度+0.04', '☀️', { stat: 'lightCharge', op: 'add', value: 0.04 }),
        t('li_u1b', '辐射共鸣', '光爆爆发伤害+6.325', '☀️', { stat: 'lightBurstDamage', op: 'add', value: 6.325 })
      ],
      [
        t('li_u2a', '光心', '攻击力提升+9%', '☀️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('li_u2b', '极光域', '暴击几率+9%', '☀️', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('li_u2c', '光刃', '光能充能速度+0.11', '☀️', { stat: 'lightCharge', op: 'add', value: 0.11 })
      ],
      [
        t('li_u3a', '领域预备', '光爆爆发伤害+14.45', '☀️', { stat: 'lightBurstDamage', op: 'add', value: 14.45 }),
        t('li_u3b', '光爆核心', '攻击力提升+15%，暴击几率+14%', '☀️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('li_u4a', '极光领域', '暴击几率+13%', '☀️', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('li_u4b', '极光领域·极', '暴击率+15%', '☀️', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  dark: {
    attack: { id: 'dark_attack', name: '黯影流·攻击', icon: '🌚', color: '#1a1a2e', layers: [
      [
        t('da_a1a', '暗影融合', '暗影融合闪避+4%', '🌚', { stat: 'shadowMeld', op: 'add', value: 0.04 }),
        t('da_a1b', '暗矢', '暗矢伤害+3.738', '🌚', { stat: 'darkBolt', op: 'add', value: 3.738 }),
        t('da_a1c', '吞噬光芒', '攻击力提升+9%', '🌚', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('da_a2a', '永暗之夜', '闪避攻击几率+6%', '🌚', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('da_a2b', '暗刃', '暗影融合闪避+9%', '🌚', { stat: 'shadowMeld', op: 'add', value: 0.09 }),
        t('da_a2c', '幽暗', '暗矢伤害+10.313', '🌚', { stat: 'darkBolt', op: 'add', value: 10.313 })
      ],
      [
        t('da_a3a', '暗影斩', '攻击力提升+13%', '🌚', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('da_a3b', '黑暗领域', '闪避攻击几率+10%，暗影融合闪避+14%', '🌚', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'shadowMeld', op: 'add', value: 0.14 }] })
      ],
      [
        t('da_a4a', '暗蚀', '暗影融合闪避+13%', '🌚', { stat: 'shadowMeld', op: 'add', value: 0.13 }),
        t('da_a4b', '暗之极', '暗矢伤害+20.35，攻击力提升+21%', '🌚', { multi: [{ stat: 'darkBolt', op: 'add', value: 20.35 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'dark_ultimate', name: '黯影流·终极', icon: '🌚', color: '#1a1a2e', layers: [
      [
        t('da_u1a', '黯影觉醒', '暗影融合闪避+4%', '🌚', { stat: 'shadowMeld', op: 'add', value: 0.04 }),
        t('da_u1b', '暗影共鸣', '暗矢伤害+3.738', '🌚', { stat: 'darkBolt', op: 'add', value: 3.738 })
      ],
      [
        t('da_u2a', '暗心', '攻击力提升+9%', '🌚', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('da_u2b', '永暗域', '闪避攻击几率+7%', '🌚', { stat: 'dodgeChance', op: 'add', value: 0.07 }),
        t('da_u2c', '暗刃', '暗影融合闪避+11%', '🌚', { stat: 'shadowMeld', op: 'add', value: 0.11 })
      ],
      [
        t('da_u3a', '之夜预备', '暗矢伤害+10.625', '🌚', { stat: 'darkBolt', op: 'add', value: 10.625 }),
        t('da_u3b', '黑暗核心', '攻击力提升+15%，闪避攻击几率+11%', '🌚', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('da_u4a', '永暗之夜', '闪避攻击几率+11%', '🌚', { stat: 'dodgeChance', op: 'add', value: 0.105 }),
        t('da_u4b', '永暗之夜·极', 'dodgeChance+12%', '🌚', { stat: 'dodgeChance', op: 'add', value: 0.118 })
      ]
    ] }
  },
  crystal: {
    attack: { id: 'crystal_attack', name: '晶能流·攻击', icon: '💎', color: '#cc66ff', layers: [
      [
        t('cr_a1a', '晶碎四散', '水晶碎片数量+1', '💎', { stat: 'crystalShards', op: 'add', value: 1 }),
        t('cr_a1b', '碎片风暴', '碎裂飞溅伤害+3', '💎', { stat: 'shatterDamage', op: 'add', value: 3 }),
        t('cr_a1c', '结晶', '暴击几率+8%', '💎', { stat: 'critRate', op: 'add', value: 0.08 })
      ],
      [
        t('cr_a2a', '钻石风暴', '攻击力提升+9%', '💎', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('cr_a2b', '折射', '水晶碎片数量+2', '💎', { stat: 'crystalShards', op: 'add', value: 2 }),
        t('cr_a2c', '晶刃', '碎裂飞溅伤害+6', '💎', { stat: 'shatterDamage', op: 'add', value: 6 })
      ],
      [
        t('cr_a3a', '碎裂', '暴击几率+10%', '💎', { stat: 'critRate', op: 'add', value: 0.1 }),
        t('cr_a3b', '水晶爆炸', '攻击力提升+15%，水晶碎片数量+3', '💎', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'crystalShards', op: 'add', value: 3 }] })
      ],
      [
        t('cr_a4a', '晶爆', '水晶碎片数量+3', '💎', { stat: 'crystalShards', op: 'add', value: 3 }),
        t('cr_a4b', '晶之极', '碎裂飞溅伤害+9，暴击几率+17%', '💎', { multi: [{ stat: 'shatterDamage', op: 'add', value: 9 }, { stat: 'critRate', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'crystal_ultimate', name: '晶能流·终极', icon: '💎', color: '#cc66ff', layers: [
      [
        t('cr_u1a', '晶能觉醒', '水晶碎片数量+1', '💎', { stat: 'crystalShards', op: 'add', value: 1 }),
        t('cr_u1b', '碎裂共鸣', '碎裂飞溅伤害+3', '💎', { stat: 'shatterDamage', op: 'add', value: 3 })
      ],
      [
        t('cr_u2a', '晶心', '暴击几率+7%', '💎', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('cr_u2b', '风暴域', '攻击力提升+11%', '💎', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('cr_u2c', '晶刃', '水晶碎片数量+2', '💎', { stat: 'crystalShards', op: 'add', value: 2 })
      ],
      [
        t('cr_u3a', '钻石预备', '碎裂飞溅伤害+6', '💎', { stat: 'shatterDamage', op: 'add', value: 6 }),
        t('cr_u3b', '结晶核心', '暴击几率+12%，攻击力提升+17%', '💎', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('cr_u4a', '钻石风暴', '攻击力提升+17%', '💎', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('cr_u4b', '钻石风暴·极', '攻击力+19%', '💎', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  lava: {
    attack: { id: 'lava_attack', name: '熔岩流·攻击', icon: '🌋', color: '#bf360c', layers: [
      [
        t('la_a1a', '熔岩池', '熔岩池灼烧伤害+1.2', '🌋', { stat: 'magmaPoolDamage', op: 'add', value: 1.2 }),
        t('la_a1b', '火山爆发', '熔岩池范围+35', '🌋', { stat: 'magmaPoolRadius', op: 'add', value: 35 }),
        t('la_a1c', '灼烧大地', '灼烧持续伤害提升+4', '🌋', { stat: 'burnDamage', op: 'add', value: 4 })
      ],
      [
        t('la_a2a', '末日火山', '攻击力提升+9%', '🌋', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('la_a2b', '岩浆', '熔岩池灼烧伤害+6.3', '🌋', { stat: 'magmaPoolDamage', op: 'add', value: 6.3 }),
        t('la_a2c', '熔岩刃', '熔岩池范围+60', '🌋', { stat: 'magmaPoolRadius', op: 'add', value: 60 })
      ],
      [
        t('la_a3a', '火山', '灼烧持续伤害提升+6', '🌋', { stat: 'burnDamage', op: 'add', value: 6 }),
        t('la_a3b', '熔岩风暴', '攻击力提升+15%，熔岩池灼烧伤害+14.4', '🌋', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'magmaPoolDamage', op: 'add', value: 14.4 }] })
      ],
      [
        t('la_a4a', '焚世', '熔岩池灼烧伤害+14.76', '🌋', { stat: 'magmaPoolDamage', op: 'add', value: 14.76 }),
        t('la_a4b', '熔之极', '熔岩池范围+80，灼烧持续伤害提升+10', '🌋', { multi: [{ stat: 'magmaPoolRadius', op: 'add', value: 80 }, { stat: 'burnDamage', op: 'add', value: 10 }] })
      ]
    ] },
    ultimate: { id: 'lava_ultimate', name: '熔岩流·终极', icon: '🌋', color: '#bf360c', layers: [
      [
        t('la_u1a', '熔岩觉醒', '熔岩池灼烧伤害+1.2', '🌋', { stat: 'magmaPoolDamage', op: 'add', value: 1.2 }),
        t('la_u1b', '岩浆共鸣', '熔岩池范围+35', '🌋', { stat: 'magmaPoolRadius', op: 'add', value: 35 })
      ],
      [
        t('la_u2a', '熔心', '灼烧持续伤害提升+4', '🌋', { stat: 'burnDamage', op: 'add', value: 4 }),
        t('la_u2b', '火山域', '攻击力提升+11%', '🌋', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('la_u2c', '熔刃', '熔岩池灼烧伤害+8.58', '🌋', { stat: 'magmaPoolDamage', op: 'add', value: 8.58 })
      ],
      [
        t('la_u3a', '末日预备', '熔岩池范围+55', '🌋', { stat: 'magmaPoolRadius', op: 'add', value: 55 }),
        t('la_u3b', '火山核心', '灼烧持续伤害提升+7，攻击力提升+17%', '🌋', { multi: [{ stat: 'burnDamage', op: 'add', value: 7 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('la_u4a', '末日火山', '攻击力提升+17%', '🌋', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('la_u4b', '末日火山·极', '攻击力+19%', '🌋', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  steam: {
    attack: { id: 'steam_attack', name: '蒸汽流·攻击', icon: '♨️', color: '#b0bec5', layers: [
      [
        t('st_a1a', '蒸汽增压', '蒸汽压力积累+4%', '♨️', { stat: 'steamPressure', op: 'add', value: 0.04 }),
        t('st_a1b', '爆发推进', '蒸汽爆发范围+36', '♨️', { stat: 'steamBurstRadius', op: 'add', value: 36 }),
        t('st_a1c', '蒸汽云', '攻击速度提升+10%', '♨️', { stat: 'attackSpeed', op: 'multiply', value: -0.1 })
      ],
      [
        t('st_a2a', '蒸汽风暴', '移动速度提升+9%', '♨️', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('st_a2b', '气压', '蒸汽压力积累+9%', '♨️', { stat: 'steamPressure', op: 'add', value: 0.09 }),
        t('st_a2c', '蒸汽刃', '蒸汽爆发范围+61', '♨️', { stat: 'steamBurstRadius', op: 'add', value: 61 })
      ],
      [
        t('st_a3a', '增压', '攻击速度提升+14%', '♨️', { stat: 'attackSpeed', op: 'multiply', value: -0.14 }),
        t('st_a3b', '蒸汽领域', '移动速度提升+15%，蒸汽压力积累+14%', '♨️', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'steamPressure', op: 'add', value: 0.14 }] })
      ],
      [
        t('st_a4a', '蒸汽爆', '蒸汽压力积累+13%', '♨️', { stat: 'steamPressure', op: 'add', value: 0.13 }),
        t('st_a4b', '汽之极', '蒸汽爆发范围+81，攻击速度提升+22%', '♨️', { multi: [{ stat: 'steamBurstRadius', op: 'add', value: 81 }, { stat: 'attackSpeed', op: 'multiply', value: -0.22 }] })
      ]
    ] },
    ultimate: { id: 'steam_ultimate', name: '蒸汽流·终极', icon: '♨️', color: '#b0bec5', layers: [
      [
        t('st_u1a', '蒸汽觉醒', '蒸汽压力积累+4%', '♨️', { stat: 'steamPressure', op: 'add', value: 0.04 }),
        t('st_u1b', '气压共鸣', '蒸汽爆发范围+36', '♨️', { stat: 'steamBurstRadius', op: 'add', value: 36 })
      ],
      [
        t('st_u2a', '汽心', '攻击速度提升+10%', '♨️', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('st_u2b', '增压域', '移动速度提升+11%', '♨️', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('st_u2c', '汽刃', '蒸汽压力积累+11%', '♨️', { stat: 'steamPressure', op: 'add', value: 0.11 })
      ],
      [
        t('st_u3a', '风暴预备', '蒸汽爆发范围+56', '♨️', { stat: 'steamBurstRadius', op: 'add', value: 56 }),
        t('st_u3b', '爆发核心', '攻击速度提升+16%，移动速度提升+17%', '♨️', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('st_u4a', '蒸汽风暴', '移动速度提升+17%', '♨️', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('st_u4b', '蒸汽风暴·极', '移速+19%', '♨️', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  dust: {
    attack: { id: 'dust_attack', name: '沙尘流·攻击', icon: '🌫️', color: '#8d6e63', layers: [
      [
        t('du_a1a', '沙尘蔽日', '沙尘致盲几率+3%', '🌫️', { stat: 'dustBlindChance', op: 'add', value: 0.03 }),
        t('du_a1b', '迷乱视野', '沙尘减速幅度+3', '🌫️', { stat: 'dustSlowAmount', op: 'add', value: 3 }),
        t('du_a1c', '沙暴', '攻击力提升+9%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('du_a2a', '沙暴末日', '移动速度提升+9%', '🌫️', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('du_a2b', '飞沙', '沙尘致盲几率+7%', '🌫️', { stat: 'dustBlindChance', op: 'add', value: 0.07 }),
        t('du_a2c', '尘刃', '沙尘减速幅度+6', '🌫️', { stat: 'dustSlowAmount', op: 'add', value: 6 })
      ],
      [
        t('du_a3a', '沙尘暴', '攻击力提升+13%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('du_a3b', '沙漠之眼', '移动速度提升+15%，沙尘致盲几率+11%', '🌫️', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'dustBlindChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('du_a4a', '尘暴', '沙尘致盲几率+11%', '🌫️', { stat: 'dustBlindChance', op: 'add', value: 0.105 }),
        t('du_a4b', '尘之极', '沙尘减速幅度+9，攻击力提升+21%', '🌫️', { multi: [{ stat: 'dustSlowAmount', op: 'add', value: 9 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'dust_ultimate', name: '沙尘流·终极', icon: '🌫️', color: '#8d6e63', layers: [
      [
        t('du_u1a', '沙尘觉醒', '沙尘致盲几率+3%', '🌫️', { stat: 'dustBlindChance', op: 'add', value: 0.03 }),
        t('du_u1b', '飞沙共鸣', '沙尘减速幅度+3', '🌫️', { stat: 'dustSlowAmount', op: 'add', value: 3 })
      ],
      [
        t('du_u2a', '尘心', '攻击力提升+9%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('du_u2b', '沙暴域', '移动速度提升+11%', '🌫️', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('du_u2c', '尘刃', '沙尘致盲几率+9%', '🌫️', { stat: 'dustBlindChance', op: 'add', value: 0.085 })
      ],
      [
        t('du_u3a', '末日预备', '沙尘减速幅度+6', '🌫️', { stat: 'dustSlowAmount', op: 'add', value: 6 }),
        t('du_u3b', '沙暴核心', '攻击力提升+15%，移动速度提升+17%', '🌫️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('du_u4a', '沙暴末日', '移动速度提升+17%', '🌫️', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('du_u4b', '沙暴末日·极', '移速+19%', '🌫️', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  metal: {
    attack: { id: 'metal_attack', name: '钢铁流·攻击', icon: '⛓️', color: '#455a64', layers: [
      [
        t('me_a1a', '钢铁装甲', '护甲穿透+1', '⛓️', { stat: 'armorPierce', op: 'add', value: 1 }),
        t('me_a1b', '穿甲', '受到伤害减免+7%', '⛓️', { stat: 'defense', op: 'multiply', value: 0.07 }),
        t('me_a1c', '弹片', '穿甲弹片数量+2', '⛓️', { stat: 'shrapnelCount', op: 'add', value: 2 })
      ],
      [
        t('me_a2a', '钢铁要塞', '攻击力提升+9%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('me_a2b', '铁壁', '护甲穿透+2', '⛓️', { stat: 'armorPierce', op: 'add', value: 2 }),
        t('me_a2c', '钢刃', '受到伤害减免+13%', '⛓️', { stat: 'defense', op: 'multiply', value: 0.13 })
      ],
      [
        t('me_a3a', '装甲', '穿甲弹片数量+2', '⛓️', { stat: 'shrapnelCount', op: 'add', value: 2 }),
        t('me_a3b', '钢铁风暴', '攻击力提升+15%，护甲穿透+3', '⛓️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'armorPierce', op: 'add', value: 3 }] })
      ],
      [
        t('me_a4a', '铁甲', '护甲穿透+3', '⛓️', { stat: 'armorPierce', op: 'add', value: 3 }),
        t('me_a4b', '钢之极', '受到伤害减免+19%，穿甲弹片数量+4', '⛓️', { multi: [{ stat: 'defense', op: 'multiply', value: 0.19 }, { stat: 'shrapnelCount', op: 'add', value: 4 }] })
      ]
    ] },
    ultimate: { id: 'metal_ultimate', name: '钢铁流·终极', icon: '⛓️', color: '#455a64', layers: [
      [
        t('me_u1a', '钢铁觉醒', '护甲穿透+1', '⛓️', { stat: 'armorPierce', op: 'add', value: 1 }),
        t('me_u1b', '铁壁共鸣', '受到伤害减免+7%', '⛓️', { stat: 'defense', op: 'multiply', value: 0.07 })
      ],
      [
        t('me_u2a', '钢心', '穿甲弹片数量+2', '⛓️', { stat: 'shrapnelCount', op: 'add', value: 2 }),
        t('me_u2b', '要塞域', '攻击力提升+11%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('me_u2c', '钢刃', '护甲穿透+2', '⛓️', { stat: 'armorPierce', op: 'add', value: 2 })
      ],
      [
        t('me_u3a', '钢铁预备', '受到伤害减免+13%', '⛓️', { stat: 'defense', op: 'multiply', value: 0.13 }),
        t('me_u3b', '装甲核心', '穿甲弹片数量+3，攻击力提升+17%', '⛓️', { multi: [{ stat: 'shrapnelCount', op: 'add', value: 3 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('me_u4a', '钢铁要塞', '攻击力提升+17%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('me_u4b', '钢铁要塞·极', '攻击力+19%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  glass: {
    attack: { id: 'glass_attack', name: '玻璃流·攻击', icon: '💠', color: '#80deea', layers: [
      [
        t('gl_a1a', '玻璃锋锐', '玻璃碎裂几率+3%', '💠', { stat: 'glassShardChance', op: 'add', value: 0.03 }),
        t('gl_a1b', '碎裂', '碎片穿刺伤害+4.6', '💠', { stat: 'shardDamage', op: 'add', value: 4.6 }),
        t('gl_a1c', '琉璃', '暴击几率+8%', '💠', { stat: 'critRate', op: 'add', value: 0.08 })
      ],
      [
        t('gl_a2a', '琉璃碎梦', '攻击力提升+9%', '💠', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('gl_a2b', '折射', '玻璃碎裂几率+7%', '💠', { stat: 'glassShardChance', op: 'add', value: 0.07 }),
        t('gl_a2c', '玻刃', '碎片穿刺伤害+11.55', '💠', { stat: 'shardDamage', op: 'add', value: 11.55 })
      ],
      [
        t('gl_a3a', '脆弱致命', '暴击几率+10%', '💠', { stat: 'critRate', op: 'add', value: 0.1 }),
        t('gl_a3b', '玻璃风暴', '攻击力提升+15%，玻璃碎裂几率+11%', '💠', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'glassShardChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('gl_a4a', '琉璃斩', '玻璃碎裂几率+11%', '💠', { stat: 'glassShardChance', op: 'add', value: 0.105 }),
        t('gl_a4b', '玻之极', '碎片穿刺伤害+22，暴击几率+17%', '💠', { multi: [{ stat: 'shardDamage', op: 'add', value: 22 }, { stat: 'critRate', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'glass_ultimate', name: '玻璃流·终极', icon: '💠', color: '#80deea', layers: [
      [
        t('gl_u1a', '玻璃觉醒', '玻璃碎裂几率+3%', '💠', { stat: 'glassShardChance', op: 'add', value: 0.03 }),
        t('gl_u1b', '碎裂共鸣', '碎片穿刺伤害+4.6', '💠', { stat: 'shardDamage', op: 'add', value: 4.6 })
      ],
      [
        t('gl_u2a', '玻心', '暴击几率+7%', '💠', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('gl_u2b', '琉璃域', '攻击力提升+11%', '💠', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('gl_u2c', '玻刃', '玻璃碎裂几率+9%', '💠', { stat: 'glassShardChance', op: 'add', value: 0.085 })
      ],
      [
        t('gl_u3a', '碎梦预备', '碎片穿刺伤害+11.9', '💠', { stat: 'shardDamage', op: 'add', value: 11.9 }),
        t('gl_u3b', '琉璃核心', '暴击几率+12%，攻击力提升+17%', '💠', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('gl_u4a', '琉璃碎梦', '攻击力提升+17%', '💠', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('gl_u4b', '琉璃碎梦·极', '攻击力+19%', '💠', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  silk: {
    attack: { id: 'silk_attack', name: '丝线流·攻击', icon: '🧣', color: '#f06292', layers: [
      [
        t('si_a1a', '丝线缠绕', '丝线缠绕几率+3%', '🧣', { stat: 'silkSnareChance', op: 'add', value: 0.03 }),
        t('si_a1b', '以柔克刚', '缠绕定身时间+450ms', '🧣', { stat: 'silkSnareDuration', op: 'add', value: 450 }),
        t('si_a1c', '蛛网', '攻击力提升+9%', '🧣', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('si_a2a', '天罗地网', '移动速度提升+9%', '🧣', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('si_a2b', '丝刃', '丝线缠绕几率+7%', '🧣', { stat: 'silkSnareChance', op: 'add', value: 0.07 }),
        t('si_a2c', '缠绕', '缠绕定身时间+850ms', '🧣', { stat: 'silkSnareDuration', op: 'add', value: 850 })
      ],
      [
        t('si_a3a', '丝线陷阱', '攻击力提升+13%', '🧣', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('si_a3b', '丝网领域', '移动速度提升+15%，丝线缠绕几率+11%', '🧣', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'silkSnareChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('si_a4a', '柔劲', '丝线缠绕几率+11%', '🧣', { stat: 'silkSnareChance', op: 'add', value: 0.105 }),
        t('si_a4b', '丝之极', '缠绕定身时间+1200ms，攻击力提升+21%', '🧣', { multi: [{ stat: 'silkSnareDuration', op: 'add', value: 1200 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'silk_ultimate', name: '丝线流·终极', icon: '🧣', color: '#f06292', layers: [
      [
        t('si_u1a', '丝线觉醒', '丝线缠绕几率+3%', '🧣', { stat: 'silkSnareChance', op: 'add', value: 0.03 }),
        t('si_u1b', '缠绕共鸣', '缠绕定身时间+450ms', '🧣', { stat: 'silkSnareDuration', op: 'add', value: 450 })
      ],
      [
        t('si_u2a', '丝心', '攻击力提升+9%', '🧣', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('si_u2b', '蛛网域', '移动速度提升+11%', '🧣', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('si_u2c', '丝刃', '丝线缠绕几率+9%', '🧣', { stat: 'silkSnareChance', op: 'add', value: 0.085 })
      ],
      [
        t('si_u3a', '地网预备', '缠绕定身时间+800ms', '🧣', { stat: 'silkSnareDuration', op: 'add', value: 800 }),
        t('si_u3b', '丝网核心', '攻击力提升+15%，移动速度提升+17%', '🧣', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('si_u4a', '天罗地网', '移动速度提升+17%', '🧣', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('si_u4b', '天罗地网·极', '移速+19%', '🧣', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  bone: {
    attack: { id: 'bone_attack', name: '骸骨流·攻击', icon: '🦴', color: '#bcaaa4', layers: [
      [
        t('bo_a1a', '骸骨尖刺', '骨刺穿刺伤害+1.5', '🦴', { stat: 'boneSpikeDamage', op: 'add', value: 1.5 }),
        t('bo_a1b', '死灵复苏', '骸骨护甲+6%', '🦴', { stat: 'boneArmor', op: 'add', value: 0.06 }),
        t('bo_a1c', '骨甲', '攻击力提升+9%', '🦴', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('bo_a2a', '骸骨王朝', '生命上限提升+9%', '🦴', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('bo_a2b', '骨刃', '骨刺穿刺伤害+6.75', '🦴', { stat: 'boneSpikeDamage', op: 'add', value: 6.75 }),
        t('bo_a2c', '亡灵', '骸骨护甲+11%', '🦴', { stat: 'boneArmor', op: 'add', value: 0.11 })
      ],
      [
        t('bo_a3a', '骨刺', '攻击力提升+13%', '🦴', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('bo_a3b', '骸骨风暴', '生命上限提升+15%，骨刺穿刺伤害+15', '🦴', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'boneSpikeDamage', op: 'add', value: 15 }] })
      ],
      [
        t('bo_a4a', '骨爆', '骨刺穿刺伤害+15.375', '🦴', { stat: 'boneSpikeDamage', op: 'add', value: 15.375 }),
        t('bo_a4b', '骨之极', '骸骨护甲+15%，攻击力提升+21%', '🦴', { multi: [{ stat: 'boneArmor', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'bone_ultimate', name: '骸骨流·终极', icon: '🦴', color: '#bcaaa4', layers: [
      [
        t('bo_u1a', '骸骨觉醒', '骨刺穿刺伤害+1.5', '🦴', { stat: 'boneSpikeDamage', op: 'add', value: 1.5 }),
        t('bo_u1b', '亡灵共鸣', '骸骨护甲+6%', '🦴', { stat: 'boneArmor', op: 'add', value: 0.06 })
      ],
      [
        t('bo_u2a', '骨心', '攻击力提升+9%', '🦴', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('bo_u2b', '王朝域', '生命上限提升+11%', '🦴', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('bo_u2c', '骨刃', '骨刺穿刺伤害+9.075', '🦴', { stat: 'boneSpikeDamage', op: 'add', value: 9.075 })
      ],
      [
        t('bo_u3a', '骸骨预备', '骸骨护甲+10%', '🦴', { stat: 'boneArmor', op: 'add', value: 0.1 }),
        t('bo_u3b', '亡灵核心', '攻击力提升+15%，生命上限提升+17%', '🦴', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('bo_u4a', '骸骨王朝', '生命上限提升+17%', '🦴', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('bo_u4b', '骸骨王朝·极', '生命上限+19%', '🦴', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  arrow: {
    attack: { id: 'arrow_attack', name: '箭术流·攻击', icon: '🎯', color: '#ff6d00', layers: [
      [
        t('ar_a1a', '百步穿杨', '箭矢精准度+4%', '🎯', { stat: 'arrowPrecision', op: 'add', value: 0.04 }),
        t('ar_a1b', '精准射击', '箭术暴击加成+6%', '🎯', { stat: 'arrowCritBonus', op: 'add', value: 0.06 }),
        t('ar_a1c', '穿云箭', '攻击力提升+9%', '🎯', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ar_a2a', '穿云一箭', '暴击几率+7%', '🎯', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('ar_a2b', '箭雨', '箭矢精准度+9%', '🎯', { stat: 'arrowPrecision', op: 'add', value: 0.09 }),
        t('ar_a2c', '弓刃', '箭术暴击加成+11%', '🎯', { stat: 'arrowCritBonus', op: 'add', value: 0.11 })
      ],
      [
        t('ar_a3a', '瞄准', '攻击力提升+13%', '🎯', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ar_a3b', '箭术风暴', '暴击几率+12%，箭矢精准度+14%', '🎯', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'arrowPrecision', op: 'add', value: 0.14 }] })
      ],
      [
        t('ar_a4a', '神射', '箭矢精准度+13%', '🎯', { stat: 'arrowPrecision', op: 'add', value: 0.13 }),
        t('ar_a4b', '箭之极', '箭术暴击加成+15%，攻击力提升+21%', '🎯', { multi: [{ stat: 'arrowCritBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'arrow_ultimate', name: '箭术流·终极', icon: '🎯', color: '#ff6d00', layers: [
      [
        t('ar_u1a', '箭术觉醒', '箭矢精准度+4%', '🎯', { stat: 'arrowPrecision', op: 'add', value: 0.04 }),
        t('ar_u1b', '精准共鸣', '箭术暴击加成+6%', '🎯', { stat: 'arrowCritBonus', op: 'add', value: 0.06 })
      ],
      [
        t('ar_u2a', '箭心', '攻击力提升+9%', '🎯', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ar_u2b', '穿云域', '暴击几率+9%', '🎯', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('ar_u2c', '箭刃', '箭矢精准度+11%', '🎯', { stat: 'arrowPrecision', op: 'add', value: 0.11 })
      ],
      [
        t('ar_u3a', '一箭预备', '箭术暴击加成+10%', '🎯', { stat: 'arrowCritBonus', op: 'add', value: 0.1 }),
        t('ar_u3b', '神射核心', '攻击力提升+15%，暴击几率+14%', '🎯', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('ar_u4a', '穿云一箭', '暴击几率+13%', '🎯', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('ar_u4b', '穿云一箭·极', '暴击率+15%', '🎯', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  spear: {
    attack: { id: 'spear_attack', name: '长枪流·攻击', icon: '🔱', color: '#00695c', layers: [
      [
        t('sp_a1a', '枪出如龙', '长枪穿透数量+1', '🔱', { stat: 'spearPierceCount', op: 'add', value: 1 }),
        t('sp_a1b', '贯穿', '长枪攻击距离+32', '🔱', { stat: 'spearRange', op: 'add', value: 32 }),
        t('sp_a1c', '破阵', '攻击力提升+9%', '🔱', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('sp_a2a', '破阵之枪', '暴击几率+7%', '🔱', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('sp_a2b', '枪刃', '长枪穿透数量+2', '🔱', { stat: 'spearPierceCount', op: 'add', value: 2 }),
        t('sp_a2c', '突刺', '长枪攻击距离+57', '🔱', { stat: 'spearRange', op: 'add', value: 57 })
      ],
      [
        t('sp_a3a', '长枪', '攻击力提升+13%', '🔱', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('sp_a3b', '枪阵风暴', '暴击几率+12%，长枪穿透数量+3', '🔱', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'spearPierceCount', op: 'add', value: 3 }] })
      ],
      [
        t('sp_a4a', '龙枪', '长枪穿透数量+3', '🔱', { stat: 'spearPierceCount', op: 'add', value: 3 }),
        t('sp_a4b', '枪之极', '长枪攻击距离+77，攻击力提升+21%', '🔱', { multi: [{ stat: 'spearRange', op: 'add', value: 77 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'spear_ultimate', name: '长枪流·终极', icon: '🔱', color: '#00695c', layers: [
      [
        t('sp_u1a', '长枪觉醒', '长枪穿透数量+1', '🔱', { stat: 'spearPierceCount', op: 'add', value: 1 }),
        t('sp_u1b', '贯穿共鸣', '长枪攻击距离+32', '🔱', { stat: 'spearRange', op: 'add', value: 32 })
      ],
      [
        t('sp_u2a', '枪心', '攻击力提升+9%', '🔱', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('sp_u2b', '破阵域', '暴击几率+9%', '🔱', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('sp_u2c', '枪刃', '长枪穿透数量+2', '🔱', { stat: 'spearPierceCount', op: 'add', value: 2 })
      ],
      [
        t('sp_u3a', '之枪预备', '长枪攻击距离+52', '🔱', { stat: 'spearRange', op: 'add', value: 52 }),
        t('sp_u3b', '龙枪核心', '攻击力提升+15%，暴击几率+14%', '🔱', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('sp_u4a', '破阵之枪', '暴击几率+13%', '🔱', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('sp_u4b', '破阵之枪·极', '暴击率+15%', '🔱', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  hammer: {
    attack: { id: 'hammer_attack', name: '重锤流·攻击', icon: '🔨', color: '#4e342e', layers: [
      [
        t('ha_a1a', '重锤砸击', '重锤眩晕几率+3%', '🔨', { stat: 'hammerStunChance', op: 'add', value: 0.03 }),
        t('ha_a1b', '震荡波', '震击范围+32', '🔨', { stat: 'hammerRadius', op: 'add', value: 32 }),
        t('ha_a1c', '碎星', '攻击力提升+9%', '🔨', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ha_a2a', '碎星之锤', '受到伤害减免+9%', '🔨', { stat: 'defense', op: 'multiply', value: 0.09 }),
        t('ha_a2b', '锤刃', '重锤眩晕几率+7%', '🔨', { stat: 'hammerStunChance', op: 'add', value: 0.07 }),
        t('ha_a2c', '震地', '震击范围+57', '🔨', { stat: 'hammerRadius', op: 'add', value: 57 })
      ],
      [
        t('ha_a3a', '重击', '攻击力提升+13%', '🔨', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ha_a3b', '锤风暴', '受到伤害减免+15%，重锤眩晕几率+11%', '🔨', { multi: [{ stat: 'defense', op: 'multiply', value: 0.15 }, { stat: 'hammerStunChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ha_a4a', '碎星斩', '重锤眩晕几率+11%', '🔨', { stat: 'hammerStunChance', op: 'add', value: 0.105 }),
        t('ha_a4b', '锤之极', '震击范围+77，攻击力提升+21%', '🔨', { multi: [{ stat: 'hammerRadius', op: 'add', value: 77 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'hammer_ultimate', name: '重锤流·终极', icon: '🔨', color: '#4e342e', layers: [
      [
        t('ha_u1a', '重锤觉醒', '重锤眩晕几率+3%', '🔨', { stat: 'hammerStunChance', op: 'add', value: 0.03 }),
        t('ha_u1b', '震荡共鸣', '震击范围+32', '🔨', { stat: 'hammerRadius', op: 'add', value: 32 })
      ],
      [
        t('ha_u2a', '锤心', '攻击力提升+9%', '🔨', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ha_u2b', '碎星域', '受到伤害减免+11%', '🔨', { stat: 'defense', op: 'multiply', value: 0.11 }),
        t('ha_u2c', '锤刃', '重锤眩晕几率+9%', '🔨', { stat: 'hammerStunChance', op: 'add', value: 0.085 })
      ],
      [
        t('ha_u3a', '之锤预备', '震击范围+52', '🔨', { stat: 'hammerRadius', op: 'add', value: 52 }),
        t('ha_u3b', '震地核心', '攻击力提升+15%，受到伤害减免+17%', '🔨', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'defense', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ha_u4a', '碎星之锤', '受到伤害减免+17%', '🔨', { stat: 'defense', op: 'multiply', value: 0.17 }),
        t('ha_u4b', '碎星之锤·极', '防御+19%', '🔨', { stat: 'defense', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  whip: {
    attack: { id: 'whip_attack', name: '鞭笞流·攻击', icon: '🪢', color: '#ad1457', layers: [
      [
        t('wh_a1a', '长鞭横扫', '鞭击连锁次数+1', '🪢', { stat: 'whipChainCount', op: 'add', value: 1 }),
        t('wh_a1b', '群体打击', '鞭击距离+31', '🪢', { stat: 'whipRange', op: 'add', value: 31 }),
        t('wh_a1c', '万蛇', '攻击力提升+9%', '🪢', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('wh_a2a', '万蛇噬体', '攻击速度提升+10%', '🪢', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('wh_a2b', '鞭刃', '鞭击连锁次数+2', '🪢', { stat: 'whipChainCount', op: 'add', value: 2 }),
        t('wh_a2c', '缠绕', '鞭击距离+56', '🪢', { stat: 'whipRange', op: 'add', value: 56 })
      ],
      [
        t('wh_a3a', '鞭影', '攻击力提升+13%', '🪢', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('wh_a3b', '鞭风暴', '攻击速度提升+16%，鞭击连锁次数+3', '🪢', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'whipChainCount', op: 'add', value: 3 }] })
      ],
      [
        t('wh_a4a', '蛇鞭', '鞭击连锁次数+3', '🪢', { stat: 'whipChainCount', op: 'add', value: 3 }),
        t('wh_a4b', '鞭之极', '鞭击距离+76，攻击力提升+21%', '🪢', { multi: [{ stat: 'whipRange', op: 'add', value: 76 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'whip_ultimate', name: '鞭笞流·终极', icon: '🪢', color: '#ad1457', layers: [
      [
        t('wh_u1a', '鞭笞觉醒', '鞭击连锁次数+1', '🪢', { stat: 'whipChainCount', op: 'add', value: 1 }),
        t('wh_u1b', '横扫共鸣', '鞭击距离+31', '🪢', { stat: 'whipRange', op: 'add', value: 31 })
      ],
      [
        t('wh_u2a', '鞭心', '攻击力提升+9%', '🪢', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('wh_u2b', '万蛇域', '攻击速度提升+12%', '🪢', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('wh_u2c', '鞭刃', '鞭击连锁次数+2', '🪢', { stat: 'whipChainCount', op: 'add', value: 2 })
      ],
      [
        t('wh_u3a', '噬体预备', '鞭击距离+51', '🪢', { stat: 'whipRange', op: 'add', value: 51 }),
        t('wh_u3b', '蛇鞭核心', '攻击力提升+15%，攻击速度提升+18%', '🪢', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('wh_u4a', '万蛇噬体', '攻击速度提升+18%', '🪢', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('wh_u4b', '万蛇噬体·极', '攻击速度+20%', '🪢', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  sword: {
    attack: { id: 'sword_attack', name: '剑气流·攻击', icon: '⚔️', color: '#78909c', layers: [
      [
        t('sw_a1a', '剑气纵横', '剑气连击层数+1', '⚔️', { stat: 'swordComboCount', op: 'add', value: 1 }),
        t('sw_a1b', '连击', '连击伤害加成+6%', '⚔️', { stat: 'swordComboBonus', op: 'add', value: 0.06 }),
        t('sw_a1c', '无想', '攻击力提升+9%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('sw_a2a', '无想剑域', '攻击速度提升+10%', '⚔️', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('sw_a2b', '剑刃', '剑气连击层数+2', '⚔️', { stat: 'swordComboCount', op: 'add', value: 2 }),
        t('sw_a2c', '斩击', '连击伤害加成+11%', '⚔️', { stat: 'swordComboBonus', op: 'add', value: 0.11 })
      ],
      [
        t('sw_a3a', '剑阵', '攻击力提升+13%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('sw_a3b', '剑气风暴', '攻击速度提升+16%，剑气连击层数+3', '⚔️', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'swordComboCount', op: 'add', value: 3 }] })
      ],
      [
        t('sw_a4a', '万剑', '剑气连击层数+3', '⚔️', { stat: 'swordComboCount', op: 'add', value: 3 }),
        t('sw_a4b', '剑之极', '连击伤害加成+15%，攻击力提升+21%', '⚔️', { multi: [{ stat: 'swordComboBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'sword_ultimate', name: '剑气流·终极', icon: '⚔️', color: '#78909c', layers: [
      [
        t('sw_u1a', '剑气觉醒', '剑气连击层数+1', '⚔️', { stat: 'swordComboCount', op: 'add', value: 1 }),
        t('sw_u1b', '连击共鸣', '连击伤害加成+6%', '⚔️', { stat: 'swordComboBonus', op: 'add', value: 0.06 })
      ],
      [
        t('sw_u2a', '剑心', '攻击力提升+9%', '⚔️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('sw_u2b', '无想域', '攻击速度提升+12%', '⚔️', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('sw_u2c', '剑刃', '剑气连击层数+2', '⚔️', { stat: 'swordComboCount', op: 'add', value: 2 })
      ],
      [
        t('sw_u3a', '剑域预备', '连击伤害加成+10%', '⚔️', { stat: 'swordComboBonus', op: 'add', value: 0.1 }),
        t('sw_u3b', '万剑核心', '攻击力提升+15%，攻击速度提升+18%', '⚔️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('sw_u4a', '无想剑域', '攻击速度提升+18%', '⚔️', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('sw_u4b', '无想剑域·极', '攻击速度+20%', '⚔️', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  ax: {
    attack: { id: 'ax_attack', name: '巨斧流·攻击', icon: '🪓', color: '#e64a19', layers: [
      [
        t('ax_a1a', '巨斧劈砍', '巨斧横扫范围+21', '🪓', { stat: 'axCleaveRadius', op: 'add', value: 21 }),
        t('ax_a1b', '摧枯拉朽', '横扫伤害比例+3', '🪓', { stat: 'axCleaveDamage', op: 'add', value: 3 }),
        t('ax_a1c', '开天', '攻击力提升+9%', '🪓', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ax_a2a', '开天辟地', '生命上限提升+9%', '🪓', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('ax_a2b', '斧刃', '巨斧横扫范围+46', '🪓', { stat: 'axCleaveRadius', op: 'add', value: 46 }),
        t('ax_a2c', '劈斩', '横扫伤害比例+6', '🪓', { stat: 'axCleaveDamage', op: 'add', value: 6 })
      ],
      [
        t('ax_a3a', '斧阵', '攻击力提升+13%', '🪓', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ax_a3b', '斧风暴', '生命上限提升+15%，巨斧横扫范围+71', '🪓', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'axCleaveRadius', op: 'add', value: 71 }] })
      ],
      [
        t('ax_a4a', '开天斩', '巨斧横扫范围+66', '🪓', { stat: 'axCleaveRadius', op: 'add', value: 66 }),
        t('ax_a4b', '斧之极', '横扫伤害比例+9，攻击力提升+21%', '🪓', { multi: [{ stat: 'axCleaveDamage', op: 'add', value: 9 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'ax_ultimate', name: '巨斧流·终极', icon: '🪓', color: '#e64a19', layers: [
      [
        t('ax_u1a', '巨斧觉醒', '巨斧横扫范围+21', '🪓', { stat: 'axCleaveRadius', op: 'add', value: 21 }),
        t('ax_u1b', '劈砍共鸣', '横扫伤害比例+3', '🪓', { stat: 'axCleaveDamage', op: 'add', value: 3 })
      ],
      [
        t('ax_u2a', '斧心', '攻击力提升+9%', '🪓', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ax_u2b', '开天域', '生命上限提升+11%', '🪓', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('ax_u2c', '斧刃', '巨斧横扫范围+56', '🪓', { stat: 'axCleaveRadius', op: 'add', value: 56 })
      ],
      [
        t('ax_u3a', '辟地预备', '横扫伤害比例+6', '🪓', { stat: 'axCleaveDamage', op: 'add', value: 6 }),
        t('ax_u3b', '开天核心', '攻击力提升+15%，生命上限提升+17%', '🪓', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ax_u4a', '开天辟地', '生命上限提升+17%', '🪓', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('ax_u4b', '开天辟地·极', '生命上限+19%', '🪓', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  dagger: {
    attack: { id: 'dagger_attack', name: '匕首流·攻击', icon: '🗡️', color: '#263238', layers: [
      [
        t('da_a1a', '匕首迅疾', '背刺伤害倍率+4%', '🗡️', { stat: 'daggerBackstabMult', op: 'add', value: 0.04 }),
        t('da_a1b', '背刺', '匕首暴击几率+5%', '🗡️', { stat: 'daggerCritChance', op: 'add', value: 0.045 }),
        t('da_a1c', '暗杀', '攻击力提升+9%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('da_a2a', '暗杀之星', '闪避攻击几率+6%', '🗡️', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('da_a2b', '匕刃', '背刺伤害倍率+9%', '🗡️', { stat: 'daggerBackstabMult', op: 'add', value: 0.09 }),
        t('da_a2c', '潜行', '匕首暴击几率+9%', '🗡️', { stat: 'daggerCritChance', op: 'add', value: 0.085 })
      ],
      [
        t('da_a3a', '刺杀', '攻击力提升+13%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('da_a3b', '匕首风暴', '闪避攻击几率+10%，背刺伤害倍率+14%', '🗡️', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'daggerBackstabMult', op: 'add', value: 0.14 }] })
      ],
      [
        t('da_a4a', '影刺', '背刺伤害倍率+13%', '🗡️', { stat: 'daggerBackstabMult', op: 'add', value: 0.13 }),
        t('da_a4b', '匕之极', '匕首暴击几率+12%，攻击力提升+21%', '🗡️', { multi: [{ stat: 'daggerCritChance', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'dagger_ultimate', name: '匕首流·终极', icon: '🗡️', color: '#263238', layers: [
      [
        t('da_u1a', '匕首觉醒', '背刺伤害倍率+4%', '🗡️', { stat: 'daggerBackstabMult', op: 'add', value: 0.04 }),
        t('da_u1b', '背刺共鸣', '匕首暴击几率+5%', '🗡️', { stat: 'daggerCritChance', op: 'add', value: 0.045 })
      ],
      [
        t('da_u2a', '匕心', '攻击力提升+9%', '🗡️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('da_u2b', '暗杀域', '闪避攻击几率+7%', '🗡️', { stat: 'dodgeChance', op: 'add', value: 0.07 }),
        t('da_u2c', '匕刃', '背刺伤害倍率+11%', '🗡️', { stat: 'daggerBackstabMult', op: 'add', value: 0.11 })
      ],
      [
        t('da_u3a', '之星预备', '匕首暴击几率+8%', '🗡️', { stat: 'daggerCritChance', op: 'add', value: 0.08 }),
        t('da_u3b', '影刺核心', '攻击力提升+15%，闪避攻击几率+11%', '🗡️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('da_u4a', '暗杀之星', '闪避攻击几率+11%', '🗡️', { stat: 'dodgeChance', op: 'add', value: 0.105 }),
        t('da_u4b', '暗杀之星·极', 'dodgeChance+12%', '🗡️', { stat: 'dodgeChance', op: 'add', value: 0.118 })
      ]
    ] }
  },
  staff: {
    attack: { id: 'staff_attack', name: '法杖流·攻击', icon: '🪄', color: '#6a1b9a', layers: [
      [
        t('st_a1a', '法杖聚能', '魔力充能速度+0.04', '🪄', { stat: 'magicCharge', op: 'add', value: 0.04 }),
        t('st_a1b', '魔法洪流', '魔法爆发伤害+8.05', '🪄', { stat: 'magicBurstDamage', op: 'add', value: 8.05 }),
        t('st_a1c', '奥术', '攻击力提升+9%', '🪄', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('st_a2a', '奥术洪流', '技能冷却缩减+7%', '🪄', { stat: 'cooldownReduction', op: 'add', value: 0.07 }),
        t('st_a2b', '杖刃', '魔力充能速度+0.09', '🪄', { stat: 'magicCharge', op: 'add', value: 0.09 }),
        t('st_a2c', '魔力', '魔法爆发伤害+16.5', '🪄', { stat: 'magicBurstDamage', op: 'add', value: 16.5 })
      ],
      [
        t('st_a3a', '法阵', '攻击力提升+13%', '🪄', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('st_a3b', '魔法风暴', '技能冷却缩减+12%，魔力充能速度+0.14', '🪄', { multi: [{ stat: 'cooldownReduction', op: 'add', value: 0.12 }, { stat: 'magicCharge', op: 'add', value: 0.14 }] })
      ],
      [
        t('st_a4a', '奥术斩', '魔力充能速度+0.13', '🪄', { stat: 'magicCharge', op: 'add', value: 0.13 }),
        t('st_a4b', '杖之极', '魔法爆发伤害+28.6，攻击力提升+21%', '🪄', { multi: [{ stat: 'magicBurstDamage', op: 'add', value: 28.6 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'staff_ultimate', name: '法杖流·终极', icon: '🪄', color: '#6a1b9a', layers: [
      [
        t('st_u1a', '法杖觉醒', '魔力充能速度+0.04', '🪄', { stat: 'magicCharge', op: 'add', value: 0.04 }),
        t('st_u1b', '魔力共鸣', '魔法爆发伤害+8.05', '🪄', { stat: 'magicBurstDamage', op: 'add', value: 8.05 })
      ],
      [
        t('st_u2a', '杖心', '攻击力提升+9%', '🪄', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('st_u2b', '奥术域', '技能冷却缩减+9%', '🪄', { stat: 'cooldownReduction', op: 'add', value: 0.09 }),
        t('st_u2c', '杖刃', '魔力充能速度+0.11', '🪄', { stat: 'magicCharge', op: 'add', value: 0.11 })
      ],
      [
        t('st_u3a', '洪流预备', '魔法爆发伤害+17', '🪄', { stat: 'magicBurstDamage', op: 'add', value: 17 }),
        t('st_u3b', '法阵核心', '攻击力提升+15%，技能冷却缩减+14%', '🪄', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'cooldownReduction', op: 'add', value: 0.14 }] })
      ],
      [
        t('st_u4a', '奥术洪流', '技能冷却缩减+13%', '🪄', { stat: 'cooldownReduction', op: 'add', value: 0.13 }),
        t('st_u4b', '奥术洪流·极', 'cooldownReduction+15%', '🪄', { stat: 'cooldownReduction', op: 'add', value: 0.146 })
      ]
    ] }
  },
  bow: {
    attack: { id: 'bow_attack', name: '弓术流·攻击', icon: '🏹', color: '#2e7d32', layers: [
      [
        t('bo_a1a', '弓开如月', '箭矢齐射数量+1', '🏹', { stat: 'bowVolleyCount', op: 'add', value: 1 }),
        t('bo_a1b', '箭射流星', '弓术射程+6%', '🏹', { stat: 'bowRangeBonus', op: 'add', value: 0.06 }),
        t('bo_a1c', '齐射', '攻击力提升+9%', '🏹', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('bo_a2a', '流星箭雨', '暴击几率+7%', '🏹', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('bo_a2b', '弓刃', '箭矢齐射数量+2', '🏹', { stat: 'bowVolleyCount', op: 'add', value: 2 }),
        t('bo_a2c', '瞄准', '弓术射程+11%', '🏹', { stat: 'bowRangeBonus', op: 'add', value: 0.11 })
      ],
      [
        t('bo_a3a', '箭阵', '攻击力提升+13%', '🏹', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('bo_a3b', '箭雨风暴', '暴击几率+12%，箭矢齐射数量+3', '🏹', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'bowVolleyCount', op: 'add', value: 3 }] })
      ],
      [
        t('bo_a4a', '流星箭', '箭矢齐射数量+3', '🏹', { stat: 'bowVolleyCount', op: 'add', value: 3 }),
        t('bo_a4b', '弓之极', '弓术射程+15%，攻击力提升+21%', '🏹', { multi: [{ stat: 'bowRangeBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'bow_ultimate', name: '弓术流·终极', icon: '🏹', color: '#2e7d32', layers: [
      [
        t('bo_u1a', '弓术觉醒', '箭矢齐射数量+1', '🏹', { stat: 'bowVolleyCount', op: 'add', value: 1 }),
        t('bo_u1b', '齐射共鸣', '弓术射程+6%', '🏹', { stat: 'bowRangeBonus', op: 'add', value: 0.06 })
      ],
      [
        t('bo_u2a', '弓心', '攻击力提升+9%', '🏹', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('bo_u2b', '流星域', '暴击几率+9%', '🏹', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('bo_u2c', '弓刃', '箭矢齐射数量+2', '🏹', { stat: 'bowVolleyCount', op: 'add', value: 2 })
      ],
      [
        t('bo_u3a', '箭雨预备', '弓术射程+10%', '🏹', { stat: 'bowRangeBonus', op: 'add', value: 0.1 }),
        t('bo_u3b', '流星核心', '攻击力提升+15%，暴击几率+14%', '🏹', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('bo_u4a', '流星箭雨', '暴击几率+13%', '🏹', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('bo_u4b', '流星箭雨·极', '暴击率+15%', '🏹', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  wolf: {
    attack: { id: 'wolf_attack', name: '狼群流·攻击', icon: '🐺', color: '#5d4037', layers: [
      [
        t('wo_a1a', '狼群狩猎', '狼群协同攻击+4%', '🐺', { stat: 'wolfPackAttack', op: 'add', value: 0.04 }),
        t('wo_a1b', '团结协作', '狼群狩猎范围+38', '🐺', { stat: 'wolfPackRadius', op: 'add', value: 38 }),
        t('wo_a1c', '狼嚎', '攻击力提升+9%', '🐺', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('wo_a2a', '狼神降世', '移动速度提升+9%', '🐺', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('wo_a2b', '狼刃', '狼群协同攻击+9%', '🐺', { stat: 'wolfPackAttack', op: 'add', value: 0.09 }),
        t('wo_a2c', '围猎', '狼群狩猎范围+63', '🐺', { stat: 'wolfPackRadius', op: 'add', value: 63 })
      ],
      [
        t('wo_a3a', '狼阵', '攻击力提升+13%', '🐺', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('wo_a3b', '狼群风暴', '移动速度提升+15%，狼群协同攻击+14%', '🐺', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'wolfPackAttack', op: 'add', value: 0.14 }] })
      ],
      [
        t('wo_a4a', '狼神', '狼群协同攻击+13%', '🐺', { stat: 'wolfPackAttack', op: 'add', value: 0.13 }),
        t('wo_a4b', '狼之极', '狼群狩猎范围+83，攻击力提升+21%', '🐺', { multi: [{ stat: 'wolfPackRadius', op: 'add', value: 83 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'wolf_ultimate', name: '狼群流·终极', icon: '🐺', color: '#5d4037', layers: [
      [
        t('wo_u1a', '狼群觉醒', '狼群协同攻击+4%', '🐺', { stat: 'wolfPackAttack', op: 'add', value: 0.04 }),
        t('wo_u1b', '围猎共鸣', '狼群狩猎范围+38', '🐺', { stat: 'wolfPackRadius', op: 'add', value: 38 })
      ],
      [
        t('wo_u2a', '狼心', '攻击力提升+9%', '🐺', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('wo_u2b', '降世域', '移动速度提升+11%', '🐺', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('wo_u2c', '狼刃', '狼群协同攻击+11%', '🐺', { stat: 'wolfPackAttack', op: 'add', value: 0.11 })
      ],
      [
        t('wo_u3a', '狼神预备', '狼群狩猎范围+58', '🐺', { stat: 'wolfPackRadius', op: 'add', value: 58 }),
        t('wo_u3b', '狼阵核心', '攻击力提升+15%，移动速度提升+17%', '🐺', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('wo_u4a', '狼神降世', '移动速度提升+17%', '🐺', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('wo_u4b', '狼神降世·极', '移速+19%', '🐺', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  bear: {
    attack: { id: 'bear_attack', name: '熊罴流·攻击', icon: '🐻', color: '#3e2723', layers: [
      [
        t('be_a1a', '熊罴之力', '熊罴防御强化+4%', '🐻', { stat: 'bearFortify', op: 'add', value: 0.04 }),
        t('be_a1b', '厚积薄发', '咆哮震慑范围+38', '🐻', { stat: 'bearRoarRadius', op: 'add', value: 38 }),
        t('be_a1c', '熊吼', '生命上限提升+9%', '🐻', { stat: 'hp', op: 'multiply', value: 0.09 })
      ],
      [
        t('be_a2a', '熊王之力', '攻击力提升+9%', '🐻', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('be_a2b', '熊刃', '熊罴防御强化+9%', '🐻', { stat: 'bearFortify', op: 'add', value: 0.09 }),
        t('be_a2c', '咆哮', '咆哮震慑范围+63', '🐻', { stat: 'bearRoarRadius', op: 'add', value: 63 })
      ],
      [
        t('be_a3a', '熊阵', '生命上限提升+13%', '🐻', { stat: 'hp', op: 'multiply', value: 0.13 }),
        t('be_a3b', '熊风暴', '攻击力提升+15%，熊罴防御强化+14%', '🐻', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'bearFortify', op: 'add', value: 0.14 }] })
      ],
      [
        t('be_a4a', '熊王', '熊罴防御强化+13%', '🐻', { stat: 'bearFortify', op: 'add', value: 0.13 }),
        t('be_a4b', '熊之极', '咆哮震慑范围+83，生命上限提升+21%', '🐻', { multi: [{ stat: 'bearRoarRadius', op: 'add', value: 83 }, { stat: 'hp', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'bear_ultimate', name: '熊罴流·终极', icon: '🐻', color: '#3e2723', layers: [
      [
        t('be_u1a', '熊罴觉醒', '熊罴防御强化+4%', '🐻', { stat: 'bearFortify', op: 'add', value: 0.04 }),
        t('be_u1b', '厚发共鸣', '咆哮震慑范围+38', '🐻', { stat: 'bearRoarRadius', op: 'add', value: 38 })
      ],
      [
        t('be_u2a', '熊心', '生命上限提升+9%', '🐻', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('be_u2b', '熊王域', '攻击力提升+11%', '🐻', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('be_u2c', '熊刃', '熊罴防御强化+11%', '🐻', { stat: 'bearFortify', op: 'add', value: 0.11 })
      ],
      [
        t('be_u3a', '之力预备', '咆哮震慑范围+58', '🐻', { stat: 'bearRoarRadius', op: 'add', value: 58 }),
        t('be_u3b', '熊王核心', '生命上限提升+15%，攻击力提升+17%', '🐻', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('be_u4a', '熊王之力', '攻击力提升+17%', '🐻', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('be_u4b', '熊王之力·极', '攻击力+19%', '🐻', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  eagle: {
    attack: { id: 'eagle_attack', name: '鹰击流·攻击', icon: '🦅', color: '#0d47a1', layers: [
      [
        t('ea_a1a', '鹰击长空', '俯冲猎杀伤害+2', '🦅', { stat: 'eagleSwoopDamage', op: 'add', value: 2 }),
        t('ea_a1b', '俯冲', '俯冲距离+33', '🦅', { stat: 'eagleSwoopRange', op: 'add', value: 33 }),
        t('ea_a1c', '猎杀', '攻击力提升+9%', '🦅', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ea_a2a', '鹰击长空', '暴击几率+7%', '🦅', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('ea_a2b', '鹰刃', '俯冲猎杀伤害+5', '🦅', { stat: 'eagleSwoopDamage', op: 'add', value: 5 }),
        t('ea_a2c', '俯冲斩', '俯冲距离+58', '🦅', { stat: 'eagleSwoopRange', op: 'add', value: 58 })
      ],
      [
        t('ea_a3a', '鹰阵', '攻击力提升+13%', '🦅', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ea_a3b', '鹰风暴', '暴击几率+12%，俯冲猎杀伤害+8', '🦅', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'eagleSwoopDamage', op: 'add', value: 8 }] })
      ],
      [
        t('ea_a4a', '天鹰', '俯冲猎杀伤害+8', '🦅', { stat: 'eagleSwoopDamage', op: 'add', value: 8 }),
        t('ea_a4b', '鹰之极', '俯冲距离+78，攻击力提升+21%', '🦅', { multi: [{ stat: 'eagleSwoopRange', op: 'add', value: 78 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'eagle_ultimate', name: '鹰击流·终极', icon: '🦅', color: '#0d47a1', layers: [
      [
        t('ea_u1a', '鹰击觉醒', '俯冲猎杀伤害+2', '🦅', { stat: 'eagleSwoopDamage', op: 'add', value: 2 }),
        t('ea_u1b', '俯冲共鸣', '俯冲距离+33', '🦅', { stat: 'eagleSwoopRange', op: 'add', value: 33 })
      ],
      [
        t('ea_u2a', '鹰心', '攻击力提升+9%', '🦅', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ea_u2b', '长空域', '暴击几率+9%', '🦅', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('ea_u2c', '鹰刃', '俯冲猎杀伤害+6', '🦅', { stat: 'eagleSwoopDamage', op: 'add', value: 6 })
      ],
      [
        t('ea_u3a', '猎杀预备', '俯冲距离+53', '🦅', { stat: 'eagleSwoopRange', op: 'add', value: 53 }),
        t('ea_u3b', '天鹰核心', '攻击力提升+15%，暴击几率+14%', '🦅', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('ea_u4a', '鹰击长空', '暴击几率+13%', '🦅', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('ea_u4b', '鹰击长空·极', '暴击率+15%', '🦅', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  snake: {
    attack: { id: 'snake_attack', name: '蛇影流·攻击', icon: '🐍', color: '#1b5e20', layers: [
      [
        t('sn_a1a', '蛇影潜行', '蛇毒伤害+0.75', '🐍', { stat: 'snakeVenomDamage', op: 'add', value: 0.75 }),
        t('sn_a1b', '毒牙', '蛇毒持续+450ms', '🐍', { stat: 'snakeVenomDuration', op: 'add', value: 450 }),
        t('sn_a1c', '蛇缠', '攻击力提升+9%', '🐍', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('sn_a2a', '蛇影缠身', '毒素更易蔓延敌群+7%', '🐍', { stat: 'poisonSpread', op: 'add', value: 0.07 }),
        t('sn_a2b', '蛇刃', '蛇毒伤害+5.625', '🐍', { stat: 'snakeVenomDamage', op: 'add', value: 5.625 }),
        t('sn_a2c', '剧毒', '蛇毒持续+850ms', '🐍', { stat: 'snakeVenomDuration', op: 'add', value: 850 })
      ],
      [
        t('sn_a3a', '蛇阵', '攻击力提升+13%', '🐍', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('sn_a3b', '毒蛇风暴', '毒素更易蔓延敌群+12%，蛇毒伤害+13.5', '🐍', { multi: [{ stat: 'poisonSpread', op: 'add', value: 0.12 }, { stat: 'snakeVenomDamage', op: 'add', value: 13.5 }] })
      ],
      [
        t('sn_a4a', '蛇神', '蛇毒伤害+13.837', '🐍', { stat: 'snakeVenomDamage', op: 'add', value: 13.837 }),
        t('sn_a4b', '蛇之极', '蛇毒持续+1200ms，攻击力提升+21%', '🐍', { multi: [{ stat: 'snakeVenomDuration', op: 'add', value: 1200 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'snake_ultimate', name: '蛇影流·终极', icon: '🐍', color: '#1b5e20', layers: [
      [
        t('sn_u1a', '蛇影觉醒', '蛇毒伤害+0.75', '🐍', { stat: 'snakeVenomDamage', op: 'add', value: 0.75 }),
        t('sn_u1b', '毒牙共鸣', '蛇毒持续+450ms', '🐍', { stat: 'snakeVenomDuration', op: 'add', value: 450 })
      ],
      [
        t('sn_u2a', '蛇心', '攻击力提升+9%', '🐍', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('sn_u2b', '缠身域', '毒素更易蔓延敌群+9%', '🐍', { stat: 'poisonSpread', op: 'add', value: 0.09 }),
        t('sn_u2c', '蛇刃', '蛇毒伤害+7.838', '🐍', { stat: 'snakeVenomDamage', op: 'add', value: 7.838 })
      ],
      [
        t('sn_u3a', '蛇神预备', '蛇毒持续+800ms', '🐍', { stat: 'snakeVenomDuration', op: 'add', value: 800 }),
        t('sn_u3b', '毒蛇核心', '攻击力提升+15%，毒素更易蔓延敌群+14%', '🐍', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'poisonSpread', op: 'add', value: 0.14 }] })
      ],
      [
        t('sn_u4a', '蛇影缠身', '毒素更易蔓延敌群+13%', '🐍', { stat: 'poisonSpread', op: 'add', value: 0.13 }),
        t('sn_u4b', '蛇影缠身·极', 'poisonSpread+15%', '🐍', { stat: 'poisonSpread', op: 'add', value: 0.146 })
      ]
    ] }
  },
  lion: {
    attack: { id: 'lion_attack', name: '狮王流·攻击', icon: '🦁', color: '#f9a825', layers: [
      [
        t('li_a1a', '狮王威仪', '狮王光环伤害+2', '🦁', { stat: 'lionAuraDamage', op: 'add', value: 2 }),
        t('li_a1b', '统御', '狮王领域范围+39', '🦁', { stat: 'lionAuraRadius', op: 'add', value: 39 }),
        t('li_a1c', '狮吼', '攻击力提升+9%', '🦁', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('li_a2a', '狮王领域', '生命上限提升+9%', '🦁', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('li_a2b', '狮刃', '狮王光环伤害+5', '🦁', { stat: 'lionAuraDamage', op: 'add', value: 5 }),
        t('li_a2c', '威严', '狮王领域范围+64', '🦁', { stat: 'lionAuraRadius', op: 'add', value: 64 })
      ],
      [
        t('li_a3a', '狮阵', '攻击力提升+13%', '🦁', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('li_a3b', '狮王风暴', '生命上限提升+15%，狮王光环伤害+8', '🦁', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'lionAuraDamage', op: 'add', value: 8 }] })
      ],
      [
        t('li_a4a', '狮神', '狮王光环伤害+8', '🦁', { stat: 'lionAuraDamage', op: 'add', value: 8 }),
        t('li_a4b', '狮之极', '狮王领域范围+84，攻击力提升+21%', '🦁', { multi: [{ stat: 'lionAuraRadius', op: 'add', value: 84 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'lion_ultimate', name: '狮王流·终极', icon: '🦁', color: '#f9a825', layers: [
      [
        t('li_u1a', '狮王觉醒', '狮王光环伤害+2', '🦁', { stat: 'lionAuraDamage', op: 'add', value: 2 }),
        t('li_u1b', '统御共鸣', '狮王领域范围+39', '🦁', { stat: 'lionAuraRadius', op: 'add', value: 39 })
      ],
      [
        t('li_u2a', '狮心', '攻击力提升+9%', '🦁', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('li_u2b', '领域域', '生命上限提升+11%', '🦁', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('li_u2c', '狮刃', '狮王光环伤害+6', '🦁', { stat: 'lionAuraDamage', op: 'add', value: 6 })
      ],
      [
        t('li_u3a', '狮王预备', '狮王领域范围+59', '🦁', { stat: 'lionAuraRadius', op: 'add', value: 59 }),
        t('li_u3b', '狮神核心', '攻击力提升+15%，生命上限提升+17%', '🦁', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('li_u4a', '狮王领域', '生命上限提升+17%', '🦁', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('li_u4b', '狮王领域·极', '生命上限+19%', '🦁', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  tiger: {
    attack: { id: 'tiger_attack', name: '虎威流·攻击', icon: '🐯', color: '#e65100', layers: [
      [
        t('ti_a1a', '猛虎下山', '猛虎扑击伤害+2', '🐯', { stat: 'tigerPounceDamage', op: 'add', value: 2 }),
        t('ti_a1b', '扑击', '扑击距离+32', '🐯', { stat: 'tigerPounceRange', op: 'add', value: 32 }),
        t('ti_a1c', '虎威', '攻击力提升+9%', '🐯', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ti_a2a', '猛虎下山', '移动速度提升+9%', '🐯', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('ti_a2b', '虎刃', '猛虎扑击伤害+5', '🐯', { stat: 'tigerPounceDamage', op: 'add', value: 5 }),
        t('ti_a2c', '猛扑', '扑击距离+57', '🐯', { stat: 'tigerPounceRange', op: 'add', value: 57 })
      ],
      [
        t('ti_a3a', '虎阵', '攻击力提升+13%', '🐯', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ti_a3b', '虎风暴', '移动速度提升+15%，猛虎扑击伤害+8', '🐯', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'tigerPounceDamage', op: 'add', value: 8 }] })
      ],
      [
        t('ti_a4a', '虎神', '猛虎扑击伤害+8', '🐯', { stat: 'tigerPounceDamage', op: 'add', value: 8 }),
        t('ti_a4b', '虎之极', '扑击距离+77，攻击力提升+21%', '🐯', { multi: [{ stat: 'tigerPounceRange', op: 'add', value: 77 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'tiger_ultimate', name: '虎威流·终极', icon: '🐯', color: '#e65100', layers: [
      [
        t('ti_u1a', '虎威觉醒', '猛虎扑击伤害+2', '🐯', { stat: 'tigerPounceDamage', op: 'add', value: 2 }),
        t('ti_u1b', '扑击共鸣', '扑击距离+32', '🐯', { stat: 'tigerPounceRange', op: 'add', value: 32 })
      ],
      [
        t('ti_u2a', '虎心', '攻击力提升+9%', '🐯', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ti_u2b', '下山域', '移动速度提升+11%', '🐯', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('ti_u2c', '虎刃', '猛虎扑击伤害+6', '🐯', { stat: 'tigerPounceDamage', op: 'add', value: 6 })
      ],
      [
        t('ti_u3a', '虎神预备', '扑击距离+52', '🐯', { stat: 'tigerPounceRange', op: 'add', value: 52 }),
        t('ti_u3b', '虎阵核心', '攻击力提升+15%，移动速度提升+17%', '🐯', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ti_u4a', '猛虎下山', '移动速度提升+17%', '🐯', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('ti_u4b', '猛虎下山·极', '移速+19%', '🐯', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  fox: {
    attack: { id: 'fox_attack', name: '狐魅流·攻击', icon: '🦊', color: '#880e4f', layers: [
      [
        t('fo_a1a', '狐魅灵巧', '狐魅闪避几率+3%', '🦊', { stat: 'foxDodgeChance', op: 'add', value: 0.03 }),
        t('fo_a1b', '以智取胜', '诡计伤害+3', '🦊', { stat: 'foxTrickDamage', op: 'add', value: 3 }),
        t('fo_a1c', '狐火', '攻击力提升+9%', '🦊', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('fo_a2a', '狐火燎原', '移动速度提升+9%', '🦊', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('fo_a2b', '狐刃', '狐魅闪避几率+7%', '🦊', { stat: 'foxDodgeChance', op: 'add', value: 0.07 }),
        t('fo_a2c', '迷惑', '诡计伤害+6', '🦊', { stat: 'foxTrickDamage', op: 'add', value: 6 })
      ],
      [
        t('fo_a3a', '狐阵', '攻击力提升+13%', '🦊', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('fo_a3b', '狐火风暴', '移动速度提升+15%，狐魅闪避几率+11%', '🦊', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'foxDodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('fo_a4a', '狐仙', '狐魅闪避几率+11%', '🦊', { stat: 'foxDodgeChance', op: 'add', value: 0.105 }),
        t('fo_a4b', '狐之极', '诡计伤害+9，攻击力提升+21%', '🦊', { multi: [{ stat: 'foxTrickDamage', op: 'add', value: 9 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'fox_ultimate', name: '狐魅流·终极', icon: '🦊', color: '#880e4f', layers: [
      [
        t('fo_u1a', '狐魅觉醒', '狐魅闪避几率+3%', '🦊', { stat: 'foxDodgeChance', op: 'add', value: 0.03 }),
        t('fo_u1b', '灵巧共鸣', '诡计伤害+3', '🦊', { stat: 'foxTrickDamage', op: 'add', value: 3 })
      ],
      [
        t('fo_u2a', '狐心', '攻击力提升+9%', '🦊', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('fo_u2b', '燎原域', '移动速度提升+11%', '🦊', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('fo_u2c', '狐刃', '狐魅闪避几率+9%', '🦊', { stat: 'foxDodgeChance', op: 'add', value: 0.085 })
      ],
      [
        t('fo_u3a', '狐火预备', '诡计伤害+6', '🦊', { stat: 'foxTrickDamage', op: 'add', value: 6 }),
        t('fo_u3b', '狐仙核心', '攻击力提升+15%，移动速度提升+17%', '🦊', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('fo_u4a', '狐火燎原', '移动速度提升+17%', '🦊', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('fo_u4b', '狐火燎原·极', '移速+19%', '🦊', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  crane: {
    attack: { id: 'crane_attack', name: '鹤翼流·攻击', icon: '🕊️', color: '#006064', layers: [
      [
        t('cr_a1a', '鹤翼舒展', '鹤舞触发几率+3%', '🕊️', { stat: 'craneDanceChance', op: 'add', value: 0.03 }),
        t('cr_a1b', '流水行云', '鹤舞持续时间+450ms', '🕊️', { stat: 'craneDanceDuration', op: 'add', value: 450 }),
        t('cr_a1c', '鹤舞', '攻击力提升+9%', '🕊️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('cr_a2a', '千鹤翔天', '移动速度提升+9%', '🕊️', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('cr_a2b', '鹤刃', '鹤舞触发几率+7%', '🕊️', { stat: 'craneDanceChance', op: 'add', value: 0.07 }),
        t('cr_a2c', '翔舞', '鹤舞持续时间+850ms', '🕊️', { stat: 'craneDanceDuration', op: 'add', value: 850 })
      ],
      [
        t('cr_a3a', '鹤阵', '攻击力提升+13%', '🕊️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('cr_a3b', '鹤舞风暴', '移动速度提升+15%，鹤舞触发几率+11%', '🕊️', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'craneDanceChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('cr_a4a', '仙鹤', '鹤舞触发几率+11%', '🕊️', { stat: 'craneDanceChance', op: 'add', value: 0.105 }),
        t('cr_a4b', '鹤之极', '鹤舞持续时间+1200ms，攻击力提升+21%', '🕊️', { multi: [{ stat: 'craneDanceDuration', op: 'add', value: 1200 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'crane_ultimate', name: '鹤翼流·终极', icon: '🕊️', color: '#006064', layers: [
      [
        t('cr_u1a', '鹤翼觉醒', '鹤舞触发几率+3%', '🕊️', { stat: 'craneDanceChance', op: 'add', value: 0.03 }),
        t('cr_u1b', '翔舞共鸣', '鹤舞持续时间+450ms', '🕊️', { stat: 'craneDanceDuration', op: 'add', value: 450 })
      ],
      [
        t('cr_u2a', '鹤心', '攻击力提升+9%', '🕊️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('cr_u2b', '翔天域', '移动速度提升+11%', '🕊️', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('cr_u2c', '鹤刃', '鹤舞触发几率+9%', '🕊️', { stat: 'craneDanceChance', op: 'add', value: 0.085 })
      ],
      [
        t('cr_u3a', '千鹤预备', '鹤舞持续时间+800ms', '🕊️', { stat: 'craneDanceDuration', op: 'add', value: 800 }),
        t('cr_u3b', '仙鹤核心', '攻击力提升+15%，移动速度提升+17%', '🕊️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('cr_u4a', '千鹤翔天', '移动速度提升+17%', '🕊️', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('cr_u4b', '千鹤翔天·极', '移速+19%', '🕊️', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  dragon: {
    attack: { id: 'dragon_attack', name: '龙神流·攻击', icon: '🐉', color: '#283593', layers: [
      [
        t('dr_a1a', '龙息', '龙息伤害+2.25', '🐉', { stat: 'dragonBreathDamage', op: 'add', value: 2.25 }),
        t('dr_a1b', '龙神之力', '龙息范围+34', '🐉', { stat: 'dragonBreathRadius', op: 'add', value: 34 }),
        t('dr_a1c', '龙威', '攻击力提升+9%', '🐉', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('dr_a2a', '龙神天降', '生命上限提升+9%', '🐉', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('dr_a2b', '龙刃', '龙息伤害+7.875', '🐉', { stat: 'dragonBreathDamage', op: 'add', value: 7.875 }),
        t('dr_a2c', '龙鳞', '龙息范围+59', '🐉', { stat: 'dragonBreathRadius', op: 'add', value: 59 })
      ],
      [
        t('dr_a3a', '龙阵', '攻击力提升+13%', '🐉', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('dr_a3b', '龙息风暴', '生命上限提升+15%，龙息伤害+16.5', '🐉', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'dragonBreathDamage', op: 'add', value: 16.5 }] })
      ],
      [
        t('dr_a4a', '神龙', '龙息伤害+16.912', '🐉', { stat: 'dragonBreathDamage', op: 'add', value: 16.912 }),
        t('dr_a4b', '龙之极', '龙息范围+79，攻击力提升+21%', '🐉', { multi: [{ stat: 'dragonBreathRadius', op: 'add', value: 79 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'dragon_ultimate', name: '龙神流·终极', icon: '🐉', color: '#283593', layers: [
      [
        t('dr_u1a', '龙神觉醒', '龙息伤害+2.25', '🐉', { stat: 'dragonBreathDamage', op: 'add', value: 2.25 }),
        t('dr_u1b', '龙息共鸣', '龙息范围+34', '🐉', { stat: 'dragonBreathRadius', op: 'add', value: 34 })
      ],
      [
        t('dr_u2a', '龙心', '攻击力提升+9%', '🐉', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('dr_u2b', '天降域', '生命上限提升+11%', '🐉', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('dr_u2c', '龙刃', '龙息伤害+10.313', '🐉', { stat: 'dragonBreathDamage', op: 'add', value: 10.313 })
      ],
      [
        t('dr_u3a', '龙神预备', '龙息范围+54', '🐉', { stat: 'dragonBreathRadius', op: 'add', value: 54 }),
        t('dr_u3b', '神龙核心', '攻击力提升+15%，生命上限提升+17%', '🐉', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('dr_u4a', '龙神天降', '生命上限提升+17%', '🐉', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('dr_u4b', '龙神天降·极', '生命上限+19%', '🐉', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  phoenix: {
    attack: { id: 'phoenix_attack', name: '凤凰流·攻击', icon: '🌅', color: '#b71c1c', layers: [
      [
        t('ph_a1a', '涅槃之火', '凤凰烈焰伤害+1.5', '🌅', { stat: 'phoenixFireDamage', op: 'add', value: 1.5 }),
        t('ph_a1b', '浴火', '涅槃恢复生命+6%', '🌅', { stat: 'phoenixRebirthHp', op: 'add', value: 0.06 }),
        t('ph_a1c', '重生', '攻击力提升+9%', '🌅', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ph_a2a', '凤凰涅槃', '灼烧持续伤害提升+4', '🌅', { stat: 'burnDamage', op: 'add', value: 4 }),
        t('ph_a2b', '凤刃', '凤凰烈焰伤害+6.75', '🌅', { stat: 'phoenixFireDamage', op: 'add', value: 6.75 }),
        t('ph_a2c', '烈焰', '涅槃恢复生命+11%', '🌅', { stat: 'phoenixRebirthHp', op: 'add', value: 0.11 })
      ],
      [
        t('ph_a3a', '凤阵', '攻击力提升+13%', '🌅', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ph_a3b', '凤凰风暴', '灼烧持续伤害提升+7，凤凰烈焰伤害+15', '🌅', { multi: [{ stat: 'burnDamage', op: 'add', value: 7 }, { stat: 'phoenixFireDamage', op: 'add', value: 15 }] })
      ],
      [
        t('ph_a4a', '神凤', '凤凰烈焰伤害+15.375', '🌅', { stat: 'phoenixFireDamage', op: 'add', value: 15.375 }),
        t('ph_a4b', '凤之极', '涅槃恢复生命+15%，攻击力提升+21%', '🌅', { multi: [{ stat: 'phoenixRebirthHp', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'phoenix_ultimate', name: '凤凰流·终极', icon: '🌅', color: '#b71c1c', layers: [
      [
        t('ph_u1a', '凤凰觉醒', '凤凰烈焰伤害+1.5', '🌅', { stat: 'phoenixFireDamage', op: 'add', value: 1.5 }),
        t('ph_u1b', '浴火共鸣', '涅槃恢复生命+6%', '🌅', { stat: 'phoenixRebirthHp', op: 'add', value: 0.06 })
      ],
      [
        t('ph_u2a', '凤心', '攻击力提升+9%', '🌅', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ph_u2b', '涅槃域', '灼烧持续伤害提升+5', '🌅', { stat: 'burnDamage', op: 'add', value: 5 }),
        t('ph_u2c', '凤刃', '凤凰烈焰伤害+9.075', '🌅', { stat: 'phoenixFireDamage', op: 'add', value: 9.075 })
      ],
      [
        t('ph_u3a', '重生预备', '涅槃恢复生命+10%', '🌅', { stat: 'phoenixRebirthHp', op: 'add', value: 0.1 }),
        t('ph_u3b', '神凤核心', '攻击力提升+15%，灼烧持续伤害提升+8', '🌅', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'burnDamage', op: 'add', value: 8 }] })
      ],
      [
        t('ph_u4a', '凤凰涅槃', '灼烧持续伤害提升+8', '🌅', { stat: 'burnDamage', op: 'add', value: 8 }),
        t('ph_u4b', '凤凰涅槃·极', '灼烧伤害+8.96', '🌅', { stat: 'burnDamage', op: 'add', value: 8.96 })
      ]
    ] }
  },
  dream: {
    attack: { id: 'dream_attack', name: '梦境流·攻击', icon: '🌙', color: '#7788dd', layers: [
      [
        t('dr_a1a', '催眠惑敌', '催眠沉睡几率+3%', '🌙', { stat: 'sleepChance', op: 'add', value: 0.03 }),
        t('dr_a1b', '幻境', '混乱迷惑几率+5%', '🌙', { stat: 'confuseChance', op: 'add', value: 0.045 }),
        t('dr_a1c', '永恒沉睡', '攻击力提升+9%', '🌙', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('dr_a2a', '梦呓', '暴击几率+7%', '🌙', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('dr_a2b', '梦刃', '催眠沉睡几率+7%', '🌙', { stat: 'sleepChance', op: 'add', value: 0.07 }),
        t('dr_a2c', '迷幻', '混乱迷惑几率+9%', '🌙', { stat: 'confuseChance', op: 'add', value: 0.085 })
      ],
      [
        t('dr_a3a', '梦境阵', '攻击力提升+13%', '🌙', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('dr_a3b', '幻境风暴', '暴击几率+12%，催眠沉睡几率+11%', '🌙', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'sleepChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('dr_a4a', '梦神', '催眠沉睡几率+11%', '🌙', { stat: 'sleepChance', op: 'add', value: 0.105 }),
        t('dr_a4b', '梦之极', '混乱迷惑几率+12%，攻击力提升+21%', '🌙', { multi: [{ stat: 'confuseChance', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'dream_ultimate', name: '梦境流·终极', icon: '🌙', color: '#7788dd', layers: [
      [
        t('dr_u1a', '梦境觉醒', '催眠沉睡几率+3%', '🌙', { stat: 'sleepChance', op: 'add', value: 0.03 }),
        t('dr_u1b', '幻境共鸣', '混乱迷惑几率+5%', '🌙', { stat: 'confuseChance', op: 'add', value: 0.045 })
      ],
      [
        t('dr_u2a', '梦心', '攻击力提升+9%', '🌙', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('dr_u2b', '沉睡域', '暴击几率+9%', '🌙', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('dr_u2c', '梦刃', '催眠沉睡几率+9%', '🌙', { stat: 'sleepChance', op: 'add', value: 0.085 })
      ],
      [
        t('dr_u3a', '永恒预备', '混乱迷惑几率+8%', '🌙', { stat: 'confuseChance', op: 'add', value: 0.08 }),
        t('dr_u3b', '梦神核心', '攻击力提升+15%，暴击几率+14%', '🌙', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('dr_u4a', '永恒沉睡', '暴击几率+13%', '🌙', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('dr_u4b', '永恒沉睡·极', '暴击率+15%', '🌙', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  nightmare: {
    attack: { id: 'nightmare_attack', name: '梦魇流·攻击', icon: '🌘', color: '#4a148c', layers: [
      [
        t('ni_a1a', '梦魇侵袭', '梦魇恐惧几率+3%', '🌘', { stat: 'nightmareFearChance', op: 'add', value: 0.03 }),
        t('ni_a1b', '恐惧', '恐惧持续时间+450ms', '🌘', { stat: 'nightmareFearDuration', op: 'add', value: 450 }),
        t('ni_a1c', '永夜', '攻击力提升+9%', '🌘', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ni_a2a', '永夜梦魇', '闪避攻击几率+6%', '🌘', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('ni_a2b', '魇刃', '梦魇恐惧几率+7%', '🌘', { stat: 'nightmareFearChance', op: 'add', value: 0.07 }),
        t('ni_a2c', '恐怖', '恐惧持续时间+850ms', '🌘', { stat: 'nightmareFearDuration', op: 'add', value: 850 })
      ],
      [
        t('ni_a3a', '梦魇阵', '攻击力提升+13%', '🌘', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ni_a3b', '恐惧风暴', '闪避攻击几率+10%，梦魇恐惧几率+11%', '🌘', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'nightmareFearChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ni_a4a', '梦魇神', '梦魇恐惧几率+11%', '🌘', { stat: 'nightmareFearChance', op: 'add', value: 0.105 }),
        t('ni_a4b', '魇之极', '恐惧持续时间+1200ms，攻击力提升+21%', '🌘', { multi: [{ stat: 'nightmareFearDuration', op: 'add', value: 1200 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'nightmare_ultimate', name: '梦魇流·终极', icon: '🌘', color: '#4a148c', layers: [
      [
        t('ni_u1a', '梦魇觉醒', '梦魇恐惧几率+3%', '🌘', { stat: 'nightmareFearChance', op: 'add', value: 0.03 }),
        t('ni_u1b', '恐惧共鸣', '恐惧持续时间+450ms', '🌘', { stat: 'nightmareFearDuration', op: 'add', value: 450 })
      ],
      [
        t('ni_u2a', '魇心', '攻击力提升+9%', '🌘', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ni_u2b', '永夜域', '闪避攻击几率+7%', '🌘', { stat: 'dodgeChance', op: 'add', value: 0.07 }),
        t('ni_u2c', '魇刃', '梦魇恐惧几率+9%', '🌘', { stat: 'nightmareFearChance', op: 'add', value: 0.085 })
      ],
      [
        t('ni_u3a', '梦魇预备', '恐惧持续时间+800ms', '🌘', { stat: 'nightmareFearDuration', op: 'add', value: 800 }),
        t('ni_u3b', '恐惧核心', '攻击力提升+15%，闪避攻击几率+11%', '🌘', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ni_u4a', '永夜梦魇', '闪避攻击几率+11%', '🌘', { stat: 'dodgeChance', op: 'add', value: 0.105 }),
        t('ni_u4b', '永夜梦魇·极', 'dodgeChance+12%', '🌘', { stat: 'dodgeChance', op: 'add', value: 0.118 })
      ]
    ] }
  },
  fate: {
    attack: { id: 'fate_attack', name: '命运流·攻击', icon: '🎴', color: '#33691e', layers: [
      [
        t('fa_a1a', '命运交织', '命运标记几率+3%', '🎴', { stat: 'fateMarkChance', op: 'add', value: 0.03 }),
        t('fa_a1b', '因果', '命运标记加成+6%', '🎴', { stat: 'fateMarkBonus', op: 'add', value: 0.06 }),
        t('fa_a1c', '命运之轮', '攻击力提升+9%', '🎴', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('fa_a2a', '宿命', '暴击几率+7%', '🎴', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('fa_a2b', '命刃', '命运标记几率+7%', '🎴', { stat: 'fateMarkChance', op: 'add', value: 0.07 }),
        t('fa_a2c', '注定', '命运标记加成+11%', '🎴', { stat: 'fateMarkBonus', op: 'add', value: 0.11 })
      ],
      [
        t('fa_a3a', '命运阵', '攻击力提升+13%', '🎴', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('fa_a3b', '因果风暴', '暴击几率+12%，命运标记几率+11%', '🎴', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'fateMarkChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('fa_a4a', '命运神', '命运标记几率+11%', '🎴', { stat: 'fateMarkChance', op: 'add', value: 0.105 }),
        t('fa_a4b', '命之极', '命运标记加成+15%，攻击力提升+21%', '🎴', { multi: [{ stat: 'fateMarkBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'fate_ultimate', name: '命运流·终极', icon: '🎴', color: '#33691e', layers: [
      [
        t('fa_u1a', '命运觉醒', '命运标记几率+3%', '🎴', { stat: 'fateMarkChance', op: 'add', value: 0.03 }),
        t('fa_u1b', '因果共鸣', '命运标记加成+6%', '🎴', { stat: 'fateMarkBonus', op: 'add', value: 0.06 })
      ],
      [
        t('fa_u2a', '命心', '攻击力提升+9%', '🎴', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('fa_u2b', '之轮域', '暴击几率+9%', '🎴', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('fa_u2c', '命刃', '命运标记几率+9%', '🎴', { stat: 'fateMarkChance', op: 'add', value: 0.085 })
      ],
      [
        t('fa_u3a', '宿命预备', '命运标记加成+10%', '🎴', { stat: 'fateMarkBonus', op: 'add', value: 0.1 }),
        t('fa_u3b', '命运核心', '攻击力提升+15%，暴击几率+14%', '🎴', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('fa_u4a', '命运之轮', '暴击几率+13%', '🎴', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('fa_u4b', '命运之轮·极', '暴击率+15%', '🎴', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  destiny: {
    attack: { id: 'destiny_attack', name: '天命流·攻击', icon: '✨', color: '#e040fb', layers: [
      [
        t('de_a1a', '天命所归', '天命增益几率+3%', '✨', { stat: 'destinyBuffChance', op: 'add', value: 0.03 }),
        t('de_a1b', '气运', '天命增益幅度+3', '✨', { stat: 'destinyBuffAmount', op: 'add', value: 3 }),
        t('de_a1c', '天命之子', '攻击力提升+9%', '✨', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('de_a2a', '天赐', '幸运事件概率+7%', '✨', { stat: 'luckBonus', op: 'add', value: 0.07 }),
        t('de_a2b', '天刃', '天命增益几率+7%', '✨', { stat: 'destinyBuffChance', op: 'add', value: 0.07 }),
        t('de_a2c', '眷顾', '天命增益幅度+6', '✨', { stat: 'destinyBuffAmount', op: 'add', value: 6 })
      ],
      [
        t('de_a3a', '天命阵', '攻击力提升+13%', '✨', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('de_a3b', '气运风暴', '幸运事件概率+12%，天命增益几率+11%', '✨', { multi: [{ stat: 'luckBonus', op: 'add', value: 0.12 }, { stat: 'destinyBuffChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('de_a4a', '天神', '天命增益几率+11%', '✨', { stat: 'destinyBuffChance', op: 'add', value: 0.105 }),
        t('de_a4b', '天之极', '天命增益幅度+9，攻击力提升+21%', '✨', { multi: [{ stat: 'destinyBuffAmount', op: 'add', value: 9 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'destiny_ultimate', name: '天命流·终极', icon: '✨', color: '#e040fb', layers: [
      [
        t('de_u1a', '天命觉醒', '天命增益几率+3%', '✨', { stat: 'destinyBuffChance', op: 'add', value: 0.03 }),
        t('de_u1b', '气运共鸣', '天命增益幅度+3', '✨', { stat: 'destinyBuffAmount', op: 'add', value: 3 })
      ],
      [
        t('de_u2a', '天心', '攻击力提升+9%', '✨', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('de_u2b', '所归域', '幸运事件概率+9%', '✨', { stat: 'luckBonus', op: 'add', value: 0.09 }),
        t('de_u2c', '天刃', '天命增益几率+9%', '✨', { stat: 'destinyBuffChance', op: 'add', value: 0.085 })
      ],
      [
        t('de_u3a', '之子预备', '天命增益幅度+6', '✨', { stat: 'destinyBuffAmount', op: 'add', value: 6 }),
        t('de_u3b', '天神核心', '攻击力提升+15%，幸运事件概率+14%', '✨', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'luckBonus', op: 'add', value: 0.14 }] })
      ],
      [
        t('de_u4a', '天命所归', '幸运事件概率+13%', '✨', { stat: 'luckBonus', op: 'add', value: 0.13 }),
        t('de_u4b', '天命所归·极', 'luckBonus+15%', '✨', { stat: 'luckBonus', op: 'add', value: 0.146 })
      ]
    ] }
  },
  karma: {
    attack: { id: 'karma_attack', name: '因果流·攻击', icon: '☯️', color: '#1de9b6', layers: [
      [
        t('ka_a1a', '因果循环', '因果反射伤害+4%', '☯️', { stat: 'karmaReflect', op: 'add', value: 0.04 }),
        t('ka_a1b', '善恶有报', '因果层数加成+6%', '☯️', { stat: 'karmaStackBonus', op: 'add', value: 0.06 }),
        t('ka_a1c', '报应', '攻击力提升+9%', '☯️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ka_a2a', '因果报应', '受到伤害减免+9%', '☯️', { stat: 'defense', op: 'multiply', value: 0.09 }),
        t('ka_a2b', '因刃', '因果反射伤害+9%', '☯️', { stat: 'karmaReflect', op: 'add', value: 0.09 }),
        t('ka_a2c', '轮回', '因果层数加成+11%', '☯️', { stat: 'karmaStackBonus', op: 'add', value: 0.11 })
      ],
      [
        t('ka_a3a', '因果阵', '攻击力提升+13%', '☯️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ka_a3b', '报应风暴', '受到伤害减免+15%，因果反射伤害+14%', '☯️', { multi: [{ stat: 'defense', op: 'multiply', value: 0.15 }, { stat: 'karmaReflect', op: 'add', value: 0.14 }] })
      ],
      [
        t('ka_a4a', '因果神', '因果反射伤害+13%', '☯️', { stat: 'karmaReflect', op: 'add', value: 0.13 }),
        t('ka_a4b', '因之极', '因果层数加成+15%，攻击力提升+21%', '☯️', { multi: [{ stat: 'karmaStackBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'karma_ultimate', name: '因果流·终极', icon: '☯️', color: '#1de9b6', layers: [
      [
        t('ka_u1a', '因果觉醒', '因果反射伤害+4%', '☯️', { stat: 'karmaReflect', op: 'add', value: 0.04 }),
        t('ka_u1b', '轮回共鸣', '因果层数加成+6%', '☯️', { stat: 'karmaStackBonus', op: 'add', value: 0.06 })
      ],
      [
        t('ka_u2a', '因心', '攻击力提升+9%', '☯️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ka_u2b', '报应域', '受到伤害减免+11%', '☯️', { stat: 'defense', op: 'multiply', value: 0.11 }),
        t('ka_u2c', '因刃', '因果反射伤害+11%', '☯️', { stat: 'karmaReflect', op: 'add', value: 0.11 })
      ],
      [
        t('ka_u3a', '因果预备', '因果层数加成+10%', '☯️', { stat: 'karmaStackBonus', op: 'add', value: 0.1 }),
        t('ka_u3b', '轮回核心', '攻击力提升+15%，受到伤害减免+17%', '☯️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'defense', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ka_u4a', '因果报应', '受到伤害减免+17%', '☯️', { stat: 'defense', op: 'multiply', value: 0.17 }),
        t('ka_u4b', '因果报应·极', '防御+19%', '☯️', { stat: 'defense', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  order: {
    attack: { id: 'order_attack', name: '秩序流·攻击', icon: '⚖️', color: '#1565c0', layers: [
      [
        t('or_a1a', '秩序规约', '秩序符文数量+1', '⚖️', { stat: 'orderRuneCount', op: 'add', value: 1 }),
        t('or_a1b', '法则', '符文伤害+3.738', '⚖️', { stat: 'orderRuneDamage', op: 'add', value: 3.738 }),
        t('or_a1c', '绝对秩序', '攻击力提升+9%', '⚖️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('or_a2a', '律令', '受到伤害减免+9%', '⚖️', { stat: 'defense', op: 'multiply', value: 0.09 }),
        t('or_a2b', '序刃', '秩序符文数量+2', '⚖️', { stat: 'orderRuneCount', op: 'add', value: 2 }),
        t('or_a2c', '规约', '符文伤害+10.313', '⚖️', { stat: 'orderRuneDamage', op: 'add', value: 10.313 })
      ],
      [
        t('or_a3a', '秩序阵', '攻击力提升+13%', '⚖️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('or_a3b', '法则风暴', '受到伤害减免+15%，秩序符文数量+3', '⚖️', { multi: [{ stat: 'defense', op: 'multiply', value: 0.15 }, { stat: 'orderRuneCount', op: 'add', value: 3 }] })
      ],
      [
        t('or_a4a', '秩序神', '秩序符文数量+3', '⚖️', { stat: 'orderRuneCount', op: 'add', value: 3 }),
        t('or_a4b', '序之极', '符文伤害+20.35，攻击力提升+21%', '⚖️', { multi: [{ stat: 'orderRuneDamage', op: 'add', value: 20.35 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'order_ultimate', name: '秩序流·终极', icon: '⚖️', color: '#1565c0', layers: [
      [
        t('or_u1a', '秩序觉醒', '秩序符文数量+1', '⚖️', { stat: 'orderRuneCount', op: 'add', value: 1 }),
        t('or_u1b', '法则共鸣', '符文伤害+3.738', '⚖️', { stat: 'orderRuneDamage', op: 'add', value: 3.738 })
      ],
      [
        t('or_u2a', '序心', '攻击力提升+9%', '⚖️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('or_u2b', '绝对域', '受到伤害减免+11%', '⚖️', { stat: 'defense', op: 'multiply', value: 0.11 }),
        t('or_u2c', '序刃', '秩序符文数量+2', '⚖️', { stat: 'orderRuneCount', op: 'add', value: 2 })
      ],
      [
        t('or_u3a', '秩序预备', '符文伤害+10.625', '⚖️', { stat: 'orderRuneDamage', op: 'add', value: 10.625 }),
        t('or_u3b', '法则核心', '攻击力提升+15%，受到伤害减免+17%', '⚖️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'defense', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('or_u4a', '绝对秩序', '受到伤害减免+17%', '⚖️', { stat: 'defense', op: 'multiply', value: 0.17 }),
        t('or_u4b', '绝对秩序·极', '防御+19%', '⚖️', { stat: 'defense', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  truth: {
    attack: { id: 'truth_attack', name: '真实流·攻击', icon: '👁️', color: '#00acc1', layers: [
      [
        t('tr_a1a', '真实视野', '真实视野几率+3%', '👁️', { stat: 'trueSightChance', op: 'add', value: 0.03 }),
        t('tr_a1b', '破妄', '真实伤害加成+6%', '👁️', { stat: 'trueDamageBonus', op: 'add', value: 0.06 }),
        t('tr_a1c', '真实之眼', '攻击力提升+9%', '👁️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('tr_a2a', '求真', '暴击几率+7%', '👁️', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('tr_a2b', '真刃', '真实视野几率+7%', '👁️', { stat: 'trueSightChance', op: 'add', value: 0.07 }),
        t('tr_a2c', '洞察', '真实伤害加成+11%', '👁️', { stat: 'trueDamageBonus', op: 'add', value: 0.11 })
      ],
      [
        t('tr_a3a', '真实阵', '攻击力提升+13%', '👁️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('tr_a3b', '破妄风暴', '暴击几率+12%，真实视野几率+11%', '👁️', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'trueSightChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('tr_a4a', '真理', '真实视野几率+11%', '👁️', { stat: 'trueSightChance', op: 'add', value: 0.105 }),
        t('tr_a4b', '真之极', '真实伤害加成+15%，攻击力提升+21%', '👁️', { multi: [{ stat: 'trueDamageBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'truth_ultimate', name: '真实流·终极', icon: '👁️', color: '#00acc1', layers: [
      [
        t('tr_u1a', '真实觉醒', '真实视野几率+3%', '👁️', { stat: 'trueSightChance', op: 'add', value: 0.03 }),
        t('tr_u1b', '洞察共鸣', '真实伤害加成+6%', '👁️', { stat: 'trueDamageBonus', op: 'add', value: 0.06 })
      ],
      [
        t('tr_u2a', '真心', '攻击力提升+9%', '👁️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('tr_u2b', '之眼域', '暴击几率+9%', '👁️', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('tr_u2c', '真刃', '真实视野几率+9%', '👁️', { stat: 'trueSightChance', op: 'add', value: 0.085 })
      ],
      [
        t('tr_u3a', '真理预备', '真实伤害加成+10%', '👁️', { stat: 'trueDamageBonus', op: 'add', value: 0.1 }),
        t('tr_u3b', '破妄核心', '攻击力提升+15%，暴击几率+14%', '👁️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('tr_u4a', '真实之眼', '暴击几率+13%', '👁️', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('tr_u4b', '真实之眼·极', '暴击率+15%', '👁️', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  lies: {
    attack: { id: 'lies_attack', name: '谎言流·攻击', icon: '🕸️', color: '#8e24aa', layers: [
      [
        t('li_a1a', '编织谎言', '谎言迷惑几率+3%', '🕸️', { stat: 'liesDeceiveChance', op: 'add', value: 0.03 }),
        t('li_a1b', '迷惑', '欺骗伤害+3', '🕸️', { stat: 'liesDeceiveDamage', op: 'add', value: 3 }),
        t('li_a1c', '谎言之网', '攻击力提升+9%', '🕸️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('li_a2a', '虚妄', '闪避攻击几率+6%', '🕸️', { stat: 'dodgeChance', op: 'add', value: 0.055 }),
        t('li_a2b', '谎刃', '谎言迷惑几率+7%', '🕸️', { stat: 'liesDeceiveChance', op: 'add', value: 0.07 }),
        t('li_a2c', '欺骗', '欺骗伤害+6', '🕸️', { stat: 'liesDeceiveDamage', op: 'add', value: 6 })
      ],
      [
        t('li_a3a', '谎言阵', '攻击力提升+13%', '🕸️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('li_a3b', '迷惑风暴', '闪避攻击几率+10%，谎言迷惑几率+11%', '🕸️', { multi: [{ stat: 'dodgeChance', op: 'add', value: 0.095 }, { stat: 'liesDeceiveChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('li_a4a', '谎神', '谎言迷惑几率+11%', '🕸️', { stat: 'liesDeceiveChance', op: 'add', value: 0.105 }),
        t('li_a4b', '谎之极', '欺骗伤害+9，攻击力提升+21%', '🕸️', { multi: [{ stat: 'liesDeceiveDamage', op: 'add', value: 9 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'lies_ultimate', name: '谎言流·终极', icon: '🕸️', color: '#8e24aa', layers: [
      [
        t('li_u1a', '谎言觉醒', '谎言迷惑几率+3%', '🕸️', { stat: 'liesDeceiveChance', op: 'add', value: 0.03 }),
        t('li_u1b', '欺骗共鸣', '欺骗伤害+3', '🕸️', { stat: 'liesDeceiveDamage', op: 'add', value: 3 })
      ],
      [
        t('li_u2a', '谎心', '攻击力提升+9%', '🕸️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('li_u2b', '之网域', '闪避攻击几率+7%', '🕸️', { stat: 'dodgeChance', op: 'add', value: 0.07 }),
        t('li_u2c', '谎刃', '谎言迷惑几率+9%', '🕸️', { stat: 'liesDeceiveChance', op: 'add', value: 0.085 })
      ],
      [
        t('li_u3a', '虚妄预备', '欺骗伤害+6', '🕸️', { stat: 'liesDeceiveDamage', op: 'add', value: 6 }),
        t('li_u3b', '迷惑核心', '攻击力提升+15%，闪避攻击几率+11%', '🕸️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('li_u4a', '谎言之网', '闪避攻击几率+11%', '🕸️', { stat: 'dodgeChance', op: 'add', value: 0.105 }),
        t('li_u4b', '谎言之网·极', 'dodgeChance+12%', '🕸️', { stat: 'dodgeChance', op: 'add', value: 0.118 })
      ]
    ] }
  },
  forest: {
    attack: { id: 'forest_attack', name: '森林流·攻击', icon: '🌲', color: '#004d40', layers: [
      [
        t('fo_a1a', '森林庇护', '森林生命回复+2', '🌲', { stat: 'forestRegen', op: 'add', value: 2 }),
        t('fo_a1b', '万物生长', '荆棘伤害+3', '🌲', { stat: 'forestThornDamage', op: 'add', value: 3 }),
        t('fo_a1c', '森罗', '生命上限提升+9%', '🌲', { stat: 'hp', op: 'multiply', value: 0.09 })
      ],
      [
        t('fo_a2a', '森罗万象', '攻击力提升+9%', '🌲', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('fo_a2b', '林刃', '森林生命回复+5', '🌲', { stat: 'forestRegen', op: 'add', value: 5 }),
        t('fo_a2c', '荆棘', '荆棘伤害+6', '🌲', { stat: 'forestThornDamage', op: 'add', value: 6 })
      ],
      [
        t('fo_a3a', '森林阵', '生命上限提升+13%', '🌲', { stat: 'hp', op: 'multiply', value: 0.13 }),
        t('fo_a3b', '生长风暴', '攻击力提升+15%，森林生命回复+8', '🌲', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'forestRegen', op: 'add', value: 8 }] })
      ],
      [
        t('fo_a4a', '森林神', '森林生命回复+8', '🌲', { stat: 'forestRegen', op: 'add', value: 8 }),
        t('fo_a4b', '林之极', '荆棘伤害+9，生命上限提升+21%', '🌲', { multi: [{ stat: 'forestThornDamage', op: 'add', value: 9 }, { stat: 'hp', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'forest_ultimate', name: '森林流·终极', icon: '🌲', color: '#004d40', layers: [
      [
        t('fo_u1a', '森林觉醒', '森林生命回复+2', '🌲', { stat: 'forestRegen', op: 'add', value: 2 }),
        t('fo_u1b', '生长共鸣', '荆棘伤害+3', '🌲', { stat: 'forestThornDamage', op: 'add', value: 3 })
      ],
      [
        t('fo_u2a', '林心', '生命上限提升+9%', '🌲', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('fo_u2b', '森罗域', '攻击力提升+11%', '🌲', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('fo_u2c', '林刃', '森林生命回复+6', '🌲', { stat: 'forestRegen', op: 'add', value: 6 })
      ],
      [
        t('fo_u3a', '万象预备', '荆棘伤害+6', '🌲', { stat: 'forestThornDamage', op: 'add', value: 6 }),
        t('fo_u3b', '森林核心', '生命上限提升+15%，攻击力提升+17%', '🌲', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('fo_u4a', '森罗万象', '攻击力提升+17%', '🌲', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('fo_u4b', '森罗万象·极', '攻击力+19%', '🌲', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  mountain: {
    attack: { id: 'mountain_attack', name: '山岳流·攻击', icon: '⛰️', color: '#37474f', layers: [
      [
        t('mo_a1a', '山岳不动', '山岳防御+4%', '⛰️', { stat: 'mountainDefense', op: 'add', value: 0.04 }),
        t('mo_a1b', '稳如磐石', '山岳碾压伤害+6%', '⛰️', { stat: 'mountainCrush', op: 'add', value: 0.06 }),
        t('mo_a1c', '不动明王', '生命上限提升+9%', '⛰️', { stat: 'hp', op: 'multiply', value: 0.09 })
      ],
      [
        t('mo_a2a', '山崩', '攻击力提升+9%', '⛰️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('mo_a2b', '山刃', '山岳防御+9%', '⛰️', { stat: 'mountainDefense', op: 'add', value: 0.09 }),
        t('mo_a2c', '碾压', '山岳碾压伤害+11%', '⛰️', { stat: 'mountainCrush', op: 'add', value: 0.11 })
      ],
      [
        t('mo_a3a', '山岳阵', '生命上限提升+13%', '⛰️', { stat: 'hp', op: 'multiply', value: 0.13 }),
        t('mo_a3b', '崩裂风暴', '攻击力提升+15%，山岳防御+14%', '⛰️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'mountainDefense', op: 'add', value: 0.14 }] })
      ],
      [
        t('mo_a4a', '山神', '山岳防御+13%', '⛰️', { stat: 'mountainDefense', op: 'add', value: 0.13 }),
        t('mo_a4b', '山之极', '山岳碾压伤害+15%，生命上限提升+21%', '⛰️', { multi: [{ stat: 'mountainCrush', op: 'add', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'mountain_ultimate', name: '山岳流·终极', icon: '⛰️', color: '#37474f', layers: [
      [
        t('mo_u1a', '山岳觉醒', '山岳防御+4%', '⛰️', { stat: 'mountainDefense', op: 'add', value: 0.04 }),
        t('mo_u1b', '磐石共鸣', '山岳碾压伤害+6%', '⛰️', { stat: 'mountainCrush', op: 'add', value: 0.06 })
      ],
      [
        t('mo_u2a', '山心', '生命上限提升+9%', '⛰️', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('mo_u2b', '明王域', '攻击力提升+11%', '⛰️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('mo_u2c', '山刃', '山岳防御+11%', '⛰️', { stat: 'mountainDefense', op: 'add', value: 0.11 })
      ],
      [
        t('mo_u3a', '不动预备', '山岳碾压伤害+10%', '⛰️', { stat: 'mountainCrush', op: 'add', value: 0.1 }),
        t('mo_u3b', '山神核心', '生命上限提升+15%，攻击力提升+17%', '⛰️', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('mo_u4a', '不动明王', '攻击力提升+17%', '⛰️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('mo_u4b', '不动明王·极', '攻击力+19%', '⛰️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  river: {
    attack: { id: 'river_attack', name: '川流流·攻击', icon: '🏞️', color: '#0277bd', layers: [
      [
        t('ri_a1a', '川流不息', '川流层数上限+4%', '🏞️', { stat: 'riverFlowStack', op: 'add', value: 0.04 }),
        t('ri_a1b', '连绵', '川流每层加成+6%', '🏞️', { stat: 'riverFlowBonus', op: 'add', value: 0.06 }),
        t('ri_a1c', '川流', '攻击力提升+9%', '🏞️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('ri_a2a', '川流不息', '攻击速度提升+10%', '🏞️', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('ri_a2b', '流刃', '川流层数上限+9%', '🏞️', { stat: 'riverFlowStack', op: 'add', value: 0.09 }),
        t('ri_a2c', '奔涌', '川流每层加成+11%', '🏞️', { stat: 'riverFlowBonus', op: 'add', value: 0.11 })
      ],
      [
        t('ri_a3a', '川流阵', '攻击力提升+13%', '🏞️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('ri_a3b', '洪流风暴', '攻击速度提升+16%，川流层数上限+14%', '🏞️', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'riverFlowStack', op: 'add', value: 0.14 }] })
      ],
      [
        t('ri_a4a', '河神', '川流层数上限+13%', '🏞️', { stat: 'riverFlowStack', op: 'add', value: 0.13 }),
        t('ri_a4b', '流之极', '川流每层加成+15%，攻击力提升+21%', '🏞️', { multi: [{ stat: 'riverFlowBonus', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'river_ultimate', name: '川流流·终极', icon: '🏞️', color: '#0277bd', layers: [
      [
        t('ri_u1a', '川流觉醒', '川流层数上限+4%', '🏞️', { stat: 'riverFlowStack', op: 'add', value: 0.04 }),
        t('ri_u1b', '奔涌共鸣', '川流每层加成+6%', '🏞️', { stat: 'riverFlowBonus', op: 'add', value: 0.06 })
      ],
      [
        t('ri_u2a', '流心', '攻击力提升+9%', '🏞️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ri_u2b', '不息域', '攻击速度提升+12%', '🏞️', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('ri_u2c', '流刃', '川流层数上限+11%', '🏞️', { stat: 'riverFlowStack', op: 'add', value: 0.11 })
      ],
      [
        t('ri_u3a', '川流预备', '川流每层加成+10%', '🏞️', { stat: 'riverFlowBonus', op: 'add', value: 0.1 }),
        t('ri_u3b', '河神核心', '攻击力提升+15%，攻击速度提升+18%', '🏞️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('ri_u4a', '川流不息', '攻击速度提升+18%', '🏞️', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('ri_u4b', '川流不息·极', '攻击速度+20%', '🏞️', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  ocean: {
    attack: { id: 'ocean_attack', name: '沧海流·攻击', icon: '🌏', color: '#002171', layers: [
      [
        t('oc_a1a', '沧海深渊', '深海压迫伤害+75%', '🌏', { stat: 'oceanDepthDamage', op: 'add', value: 0.75 }),
        t('oc_a1b', '暗流', '暗流减速+6%', '🌏', { stat: 'oceanCurrentSlow', op: 'add', value: 0.06 }),
        t('oc_a1c', '海啸', '攻击力提升+9%', '🌏', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('oc_a2a', '深海渊啸', '生命上限提升+9%', '🌏', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('oc_a2b', '海刃', '深海压迫伤害+5.625', '🌏', { stat: 'oceanDepthDamage', op: 'add', value: 5.625 }),
        t('oc_a2c', '潮汐', '暗流减速+11%', '🌏', { stat: 'oceanCurrentSlow', op: 'add', value: 0.11 })
      ],
      [
        t('oc_a3a', '沧海阵', '攻击力提升+13%', '🌏', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('oc_a3b', '暗流风暴', '生命上限提升+15%，深海压迫伤害+13.5', '🌏', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'oceanDepthDamage', op: 'add', value: 13.5 }] })
      ],
      [
        t('oc_a4a', '海神', '深海压迫伤害+13.837', '🌏', { stat: 'oceanDepthDamage', op: 'add', value: 13.837 }),
        t('oc_a4b', '海之极', '暗流减速+15%，攻击力提升+21%', '🌏', { multi: [{ stat: 'oceanCurrentSlow', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'ocean_ultimate', name: '沧海流·终极', icon: '🌏', color: '#002171', layers: [
      [
        t('oc_u1a', '沧海觉醒', '深海压迫伤害+75%', '🌏', { stat: 'oceanDepthDamage', op: 'add', value: 0.75 }),
        t('oc_u1b', '潮汐共鸣', '暗流减速+6%', '🌏', { stat: 'oceanCurrentSlow', op: 'add', value: 0.06 })
      ],
      [
        t('oc_u2a', '海心', '攻击力提升+9%', '🌏', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('oc_u2b', '渊啸域', '生命上限提升+11%', '🌏', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('oc_u2c', '海刃', '深海压迫伤害+7.838', '🌏', { stat: 'oceanDepthDamage', op: 'add', value: 7.838 })
      ],
      [
        t('oc_u3a', '深海预备', '暗流减速+10%', '🌏', { stat: 'oceanCurrentSlow', op: 'add', value: 0.1 }),
        t('oc_u3b', '海神核心', '攻击力提升+15%，生命上限提升+17%', '🌏', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('oc_u4a', '深海渊啸', '生命上限提升+17%', '🌏', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('oc_u4b', '深海渊啸·极', '生命上限+19%', '🌏', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  desert: {
    attack: { id: 'desert_attack', name: '沙漠流·攻击', icon: '🏜️', color: '#d4a574', layers: [
      [
        t('de_a1a', '炙热沙漠', '炙烤伤害+60%', '🏜️', { stat: 'desertScorchDamage', op: 'add', value: 0.6 }),
        t('de_a1b', '干涸', '干涸减速+6%', '🏜️', { stat: 'desertThirstSlow', op: 'add', value: 0.06 }),
        t('de_a1c', '沙暴', '攻击力提升+9%', '🏜️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('de_a2a', '炙热地狱', '移动速度提升+9%', '🏜️', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('de_a2b', '沙刃', '炙烤伤害+5.4', '🏜️', { stat: 'desertScorchDamage', op: 'add', value: 5.4 }),
        t('de_a2c', '灼烧', '干涸减速+11%', '🏜️', { stat: 'desertThirstSlow', op: 'add', value: 0.11 })
      ],
      [
        t('de_a3a', '沙漠阵', '攻击力提升+13%', '🏜️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('de_a3b', '干涸风暴', '移动速度提升+15%，炙烤伤害+13.2', '🏜️', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'desertScorchDamage', op: 'add', value: 13.2 }] })
      ],
      [
        t('de_a4a', '沙神', '炙烤伤害+13.53', '🏜️', { stat: 'desertScorchDamage', op: 'add', value: 13.53 }),
        t('de_a4b', '沙之极', '干涸减速+15%，攻击力提升+21%', '🏜️', { multi: [{ stat: 'desertThirstSlow', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'desert_ultimate', name: '沙漠流·终极', icon: '🏜️', color: '#d4a574', layers: [
      [
        t('de_u1a', '沙漠觉醒', '炙烤伤害+60%', '🏜️', { stat: 'desertScorchDamage', op: 'add', value: 0.6 }),
        t('de_u1b', '干涸共鸣', '干涸减速+6%', '🏜️', { stat: 'desertThirstSlow', op: 'add', value: 0.06 })
      ],
      [
        t('de_u2a', '沙心', '攻击力提升+9%', '🏜️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('de_u2b', '地狱域', '移动速度提升+11%', '🏜️', { stat: 'speed', op: 'multiply', value: 0.11 }),
        t('de_u2c', '沙刃', '炙烤伤害+7.59', '🏜️', { stat: 'desertScorchDamage', op: 'add', value: 7.59 })
      ],
      [
        t('de_u3a', '炙热预备', '干涸减速+10%', '🏜️', { stat: 'desertThirstSlow', op: 'add', value: 0.1 }),
        t('de_u3b', '沙神核心', '攻击力提升+15%，移动速度提升+17%', '🏜️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('de_u4a', '炙热地狱', '移动速度提升+17%', '🏜️', { stat: 'speed', op: 'multiply', value: 0.17 }),
        t('de_u4b', '炙热地狱·极', '移速+19%', '🏜️', { stat: 'speed', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  tundra: {
    attack: { id: 'tundra_attack', name: '冻原流·攻击', icon: '🧊', color: '#eceff1', layers: [
      [
        t('tu_a1a', '冻原冰封', '冻原冰封几率+3%', '🧊', { stat: 'tundraFrostChance', op: 'add', value: 0.03 }),
        t('tu_a1b', '极寒', '冰封持续+450ms', '🧊', { stat: 'tundraFrostDuration', op: 'add', value: 450 }),
        t('tu_a1c', '永冻', '弹幕命中时附加寒霜减速+6%', '🧊', { stat: 'slowChance', op: 'add', value: 0.06 })
      ],
      [
        t('tu_a2a', '永冻冰原', '攻击力提升+9%', '🧊', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('tu_a2b', '冻刃', '冻原冰封几率+7%', '🧊', { stat: 'tundraFrostChance', op: 'add', value: 0.07 }),
        t('tu_a2c', '霜冻', '冰封持续+850ms', '🧊', { stat: 'tundraFrostDuration', op: 'add', value: 850 })
      ],
      [
        t('tu_a3a', '冻原阵', '弹幕命中时附加寒霜减速+8%', '🧊', { stat: 'slowChance', op: 'add', value: 0.08 }),
        t('tu_a3b', '极寒风暴', '攻击力提升+15%，冻原冰封几率+11%', '🧊', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'tundraFrostChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('tu_a4a', '冰神', '冻原冰封几率+11%', '🧊', { stat: 'tundraFrostChance', op: 'add', value: 0.105 }),
        t('tu_a4b', '冻之极', '冰封持续+1200ms，弹幕命中时附加寒霜减速+14%', '🧊', { multi: [{ stat: 'tundraFrostDuration', op: 'add', value: 1200 }, { stat: 'slowChance', op: 'add', value: 0.135 }] })
      ]
    ] },
    ultimate: { id: 'tundra_ultimate', name: '冻原流·终极', icon: '🧊', color: '#eceff1', layers: [
      [
        t('tu_u1a', '冻原觉醒', '冻原冰封几率+3%', '🧊', { stat: 'tundraFrostChance', op: 'add', value: 0.03 }),
        t('tu_u1b', '极寒共鸣', '冰封持续+450ms', '🧊', { stat: 'tundraFrostDuration', op: 'add', value: 450 })
      ],
      [
        t('tu_u2a', '冻心', '弹幕命中时附加寒霜减速+6%', '🧊', { stat: 'slowChance', op: 'add', value: 0.055 }),
        t('tu_u2b', '冰原域', '攻击力提升+11%', '🧊', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('tu_u2c', '冻刃', '冻原冰封几率+9%', '🧊', { stat: 'tundraFrostChance', op: 'add', value: 0.085 })
      ],
      [
        t('tu_u3a', '永冻预备', '冰封持续+800ms', '🧊', { stat: 'tundraFrostDuration', op: 'add', value: 800 }),
        t('tu_u3b', '冰神核心', '弹幕命中时附加寒霜减速+10%，攻击力提升+17%', '🧊', { multi: [{ stat: 'slowChance', op: 'add', value: 0.095 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('tu_u4a', '永冻冰原', '攻击力提升+17%', '🧊', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('tu_u4b', '永冻冰原·极', '攻击力+19%', '🧊', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  phantom: {
    attack: { id: 'phantom_attack', name: '幻影流·攻击', icon: '👻', color: '#b8d4ff', layers: [
      [
        t('ph_a1a', '虚化穿梭', '闪避攻击几率+3%', '👻', { stat: 'dodgeChance', op: 'add', value: 0.03 }),
        t('ph_a1b', '无形', '移动速度提升+7%', '👻', { stat: 'speed', op: 'multiply', value: 0.07 }),
        t('ph_a1c', '幻影领域', '暴击几率+8%', '👻', { stat: 'critRate', op: 'add', value: 0.08 })
      ],
      [
        t('ph_a2a', '幽灵步', '攻击力提升+9%', '👻', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ph_a2b', '影刃', '闪避攻击几率+7%', '👻', { stat: 'dodgeChance', op: 'add', value: 0.07 }),
        t('ph_a2c', '闪避', '移动速度提升+13%', '👻', { stat: 'speed', op: 'multiply', value: 0.13 })
      ],
      [
        t('ph_a3a', '幻影阵', '暴击几率+10%', '👻', { stat: 'critRate', op: 'add', value: 0.1 }),
        t('ph_a3b', '幽灵风暴', '攻击力提升+15%，闪避攻击几率+11%', '👻', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'dodgeChance', op: 'add', value: 0.11 }] })
      ],
      [
        t('ph_a4a', '幻神', '闪避攻击几率+11%', '👻', { stat: 'dodgeChance', op: 'add', value: 0.105 }),
        t('ph_a4b', '幻之极', '移动速度提升+19%，暴击几率+17%', '👻', { multi: [{ stat: 'speed', op: 'multiply', value: 0.19 }, { stat: 'critRate', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'phantom_ultimate', name: '幻影流·终极', icon: '👻', color: '#b8d4ff', layers: [
      [
        t('ph_u1a', '幻影觉醒', '闪避攻击几率+3%', '👻', { stat: 'dodgeChance', op: 'add', value: 0.03 }),
        t('ph_u1b', '虚化共鸣', '移动速度提升+7%', '👻', { stat: 'speed', op: 'multiply', value: 0.07 })
      ],
      [
        t('ph_u2a', '幻心', '暴击几率+7%', '👻', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('ph_u2b', '领域域', '攻击力提升+11%', '👻', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ph_u2c', '幻刃', '闪避攻击几率+9%', '👻', { stat: 'dodgeChance', op: 'add', value: 0.085 })
      ],
      [
        t('ph_u3a', '幽灵预备', '移动速度提升+13%', '👻', { stat: 'speed', op: 'multiply', value: 0.13 }),
        t('ph_u3b', '幻神核心', '暴击几率+12%，攻击力提升+17%', '👻', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ph_u4a', '幻影领域', '攻击力提升+17%', '👻', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ph_u4b', '幻影领域·极', '攻击力+19%', '👻', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  chain: {
    attack: { id: 'chain_attack', name: '连锁流·攻击', icon: '⛓️', color: '#ffcc00', layers: [
      [
        t('ch_a1a', '闪电跳跃', '闪电链额外弹跳次数+1', '⛓️', { stat: 'chainCount', op: 'add', value: 1 }),
        t('ch_a1b', '链式反应', '连锁闪电伤害提升+3', '⛓️', { stat: 'chainDamage', op: 'add', value: 3 }),
        t('ch_a1c', '无限连锁', '攻击触发雷电连锁+6%', '⛓️', { stat: 'chainLightningChance', op: 'add', value: 0.06 })
      ],
      [
        t('ch_a2a', '电弧', '攻击力提升+9%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('ch_a2b', '链刃', '闪电链额外弹跳次数+2', '⛓️', { stat: 'chainCount', op: 'add', value: 2 }),
        t('ch_a2c', '传导', '连锁闪电伤害提升+6', '⛓️', { stat: 'chainDamage', op: 'add', value: 6 })
      ],
      [
        t('ch_a3a', '连锁阵', '攻击触发雷电连锁+8%', '⛓️', { stat: 'chainLightningChance', op: 'add', value: 0.08 }),
        t('ch_a3b', '电弧风暴', '攻击力提升+15%，闪电链额外弹跳次数+3', '⛓️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'chainCount', op: 'add', value: 3 }] })
      ],
      [
        t('ch_a4a', '链神', '闪电链额外弹跳次数+3', '⛓️', { stat: 'chainCount', op: 'add', value: 3 }),
        t('ch_a4b', '链之极', '连锁闪电伤害提升+9，攻击触发雷电连锁+14%', '⛓️', { multi: [{ stat: 'chainDamage', op: 'add', value: 9 }, { stat: 'chainLightningChance', op: 'add', value: 0.135 }] })
      ]
    ] },
    ultimate: { id: 'chain_ultimate', name: '连锁流·终极', icon: '⛓️', color: '#ffcc00', layers: [
      [
        t('ch_u1a', '连锁觉醒', '闪电链额外弹跳次数+1', '⛓️', { stat: 'chainCount', op: 'add', value: 1 }),
        t('ch_u1b', '传导共鸣', '连锁闪电伤害提升+3', '⛓️', { stat: 'chainDamage', op: 'add', value: 3 })
      ],
      [
        t('ch_u2a', '链心', '攻击触发雷电连锁+6%', '⛓️', { stat: 'chainLightningChance', op: 'add', value: 0.055 }),
        t('ch_u2b', '无限域', '攻击力提升+11%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('ch_u2c', '链刃', '闪电链额外弹跳次数+2', '⛓️', { stat: 'chainCount', op: 'add', value: 2 })
      ],
      [
        t('ch_u3a', '连锁预备', '连锁闪电伤害提升+6', '⛓️', { stat: 'chainDamage', op: 'add', value: 6 }),
        t('ch_u3b', '链神核心', '攻击触发雷电连锁+10%，攻击力提升+17%', '⛓️', { multi: [{ stat: 'chainLightningChance', op: 'add', value: 0.095 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('ch_u4a', '无限连锁', '攻击力提升+17%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('ch_u4b', '无限连锁·极', '攻击力+19%', '⛓️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  decay: {
    attack: { id: 'decay_attack', name: '衰变流·攻击', icon: '☢️', color: '#7fff00', layers: [
      [
        t('de_a1a', '辐射侵蚀', 'decayRate+4%', '☢️', { stat: 'decayRate', op: 'add', value: 0.04 }),
        t('de_a1b', '缓慢消亡', 'decayDuration+450ms', '☢️', { stat: 'decayDuration', op: 'add', value: 450 }),
        t('de_a1c', '核子', '攻击力提升+9%', '☢️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('de_a2a', '核子寒冬', '生命上限提升+9%', '☢️', { stat: 'hp', op: 'multiply', value: 0.09 }),
        t('de_a2b', '衰刃', 'decayRate+9%', '☢️', { stat: 'decayRate', op: 'add', value: 0.09 }),
        t('de_a2c', '辐射', 'decayDuration+850ms', '☢️', { stat: 'decayDuration', op: 'add', value: 850 })
      ],
      [
        t('de_a3a', '衰变阵', '攻击力提升+13%', '☢️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('de_a3b', '辐射风暴', '生命上限提升+15%，decayRate+14%', '☢️', { multi: [{ stat: 'hp', op: 'multiply', value: 0.15 }, { stat: 'decayRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('de_a4a', '衰神', 'decayRate+13%', '☢️', { stat: 'decayRate', op: 'add', value: 0.13 }),
        t('de_a4b', '衰之极', 'decayDuration+1200ms，攻击力提升+21%', '☢️', { multi: [{ stat: 'decayDuration', op: 'add', value: 1200 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'decay_ultimate', name: '衰变流·终极', icon: '☢️', color: '#7fff00', layers: [
      [
        t('de_u1a', '衰变觉醒', 'decayRate+4%', '☢️', { stat: 'decayRate', op: 'add', value: 0.04 }),
        t('de_u1b', '辐射共鸣', 'decayDuration+450ms', '☢️', { stat: 'decayDuration', op: 'add', value: 450 })
      ],
      [
        t('de_u2a', '衰心', '攻击力提升+9%', '☢️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('de_u2b', '寒冬域', '生命上限提升+11%', '☢️', { stat: 'hp', op: 'multiply', value: 0.11 }),
        t('de_u2c', '衰刃', 'decayRate+11%', '☢️', { stat: 'decayRate', op: 'add', value: 0.11 })
      ],
      [
        t('de_u3a', '核子预备', 'decayDuration+800ms', '☢️', { stat: 'decayDuration', op: 'add', value: 800 }),
        t('de_u3b', '衰神核心', '攻击力提升+15%，生命上限提升+17%', '☢️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'hp', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('de_u4a', '核子寒冬', '生命上限提升+17%', '☢️', { stat: 'hp', op: 'multiply', value: 0.17 }),
        t('de_u4b', '核子寒冬·极', '生命上限+19%', '☢️', { stat: 'hp', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  momentum: {
    attack: { id: 'momentum_attack', name: '势能流·攻击', icon: '⚡', color: '#00ccff', layers: [
      [
        t('mo_a1a', '疾驰蓄力', '势能积累速度+4%', '⚡', { stat: 'momentumRate', op: 'add', value: 0.04 }),
        t('mo_a1b', '动能转化', '势能上限+6%', '⚡', { stat: 'maxMomentum', op: 'add', value: 0.06 }),
        t('mo_a1c', '相对论', '移动速度提升+9%', '⚡', { stat: 'speed', op: 'multiply', value: 0.09 })
      ],
      [
        t('mo_a2a', '相对论冲击', '攻击力提升+9%', '⚡', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('mo_a2b', '势刃', '势能积累速度+9%', '⚡', { stat: 'momentumRate', op: 'add', value: 0.09 }),
        t('mo_a2c', '冲刺', '势能上限+11%', '⚡', { stat: 'maxMomentum', op: 'add', value: 0.11 })
      ],
      [
        t('mo_a3a', '势能阵', '移动速度提升+13%', '⚡', { stat: 'speed', op: 'multiply', value: 0.13 }),
        t('mo_a3b', '动能风暴', '攻击力提升+15%，势能积累速度+14%', '⚡', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'momentumRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('mo_a4a', '势神', '势能积累速度+13%', '⚡', { stat: 'momentumRate', op: 'add', value: 0.13 }),
        t('mo_a4b', '势之极', '势能上限+15%，移动速度提升+21%', '⚡', { multi: [{ stat: 'maxMomentum', op: 'add', value: 0.15 }, { stat: 'speed', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'momentum_ultimate', name: '势能流·终极', icon: '⚡', color: '#00ccff', layers: [
      [
        t('mo_u1a', '势能觉醒', '势能积累速度+4%', '⚡', { stat: 'momentumRate', op: 'add', value: 0.04 }),
        t('mo_u1b', '动能共鸣', '势能上限+6%', '⚡', { stat: 'maxMomentum', op: 'add', value: 0.06 })
      ],
      [
        t('mo_u2a', '势心', '移动速度提升+9%', '⚡', { stat: 'speed', op: 'multiply', value: 0.09 }),
        t('mo_u2b', '冲击域', '攻击力提升+11%', '⚡', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('mo_u2c', '势刃', '势能积累速度+11%', '⚡', { stat: 'momentumRate', op: 'add', value: 0.11 })
      ],
      [
        t('mo_u3a', '相对论预备', '势能上限+10%', '⚡', { stat: 'maxMomentum', op: 'add', value: 0.1 }),
        t('mo_u3b', '势神核心', '移动速度提升+15%，攻击力提升+17%', '⚡', { multi: [{ stat: 'speed', op: 'multiply', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('mo_u4a', '相对论冲击', '攻击力提升+17%', '⚡', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('mo_u4b', '相对论冲击·极', '攻击力+19%', '⚡', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  pact: {
    attack: { id: 'pact_attack', name: '契约流·攻击', icon: '📜', color: '#cc3344', layers: [
      [
        t('pa_a1a', '契约束缚', '契约数量上限+1', '📜', { stat: 'maxContracts', op: 'add', value: 1 }),
        t('pa_a1b', '因果报偿', '契约引爆伤害+3', '📜', { stat: 'contractDamage', op: 'add', value: 3 }),
        t('pa_a1c', '灵魂收割', '契约持续时间+0.08', '📜', { stat: 'contractDuration', op: 'add', value: 0.08 })
      ],
      [
        t('pa_a2a', '契约', '攻击力提升+9%', '📜', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('pa_a2b', '约刃', '契约数量上限+2', '📜', { stat: 'maxContracts', op: 'add', value: 2 }),
        t('pa_a2c', '束缚', '契约引爆伤害+6', '📜', { stat: 'contractDamage', op: 'add', value: 6 })
      ],
      [
        t('pa_a3a', '契约阵', '契约持续时间+0.1', '📜', { stat: 'contractDuration', op: 'add', value: 0.1 }),
        t('pa_a3b', '报偿风暴', '攻击力提升+15%，契约数量上限+3', '📜', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'maxContracts', op: 'add', value: 3 }] })
      ],
      [
        t('pa_a4a', '约神', '契约数量上限+3', '📜', { stat: 'maxContracts', op: 'add', value: 3 }),
        t('pa_a4b', '约之极', '契约引爆伤害+9，契约持续时间+0.17', '📜', { multi: [{ stat: 'contractDamage', op: 'add', value: 9 }, { stat: 'contractDuration', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'pact_ultimate', name: '契约流·终极', icon: '📜', color: '#cc3344', layers: [
      [
        t('pa_u1a', '契约觉醒', '契约数量上限+1', '📜', { stat: 'maxContracts', op: 'add', value: 1 }),
        t('pa_u1b', '束缚共鸣', '契约引爆伤害+3', '📜', { stat: 'contractDamage', op: 'add', value: 3 })
      ],
      [
        t('pa_u2a', '约心', '契约持续时间+0.07', '📜', { stat: 'contractDuration', op: 'add', value: 0.07 }),
        t('pa_u2b', '收割域', '攻击力提升+11%', '📜', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('pa_u2c', '约刃', '契约数量上限+2', '📜', { stat: 'maxContracts', op: 'add', value: 2 })
      ],
      [
        t('pa_u3a', '灵魂预备', '契约引爆伤害+6', '📜', { stat: 'contractDamage', op: 'add', value: 6 }),
        t('pa_u3b', '约神核心', '契约持续时间+0.12，攻击力提升+17%', '📜', { multi: [{ stat: 'contractDuration', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('pa_u4a', '灵魂收割', '攻击力提升+17%', '📜', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('pa_u4b', '灵魂收割·极', '攻击力+19%', '📜', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  },
  forge: {
    attack: { id: 'forge_attack', name: '锻炉流·攻击', icon: '🔨', color: '#ff7733', layers: [
      [
        t('fo_a1a', '战场淬炼', '锻炉淬炼层数+0.04', '🔨', { stat: 'forgeStacksMax', op: 'add', value: 0.04 }),
        t('fo_a1b', '越战越强', '淬炼持续+0.06', '🔨', { stat: 'forgeDuration', op: 'add', value: 0.06 }),
        t('fo_a1c', '神匠', '攻击力提升+9%', '🔨', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('fo_a2a', '神匠武库', '暴击几率+7%', '🔨', { stat: 'critRate', op: 'add', value: 0.07 }),
        t('fo_a2b', '锻刃', '锻炉淬炼层数+0.09', '🔨', { stat: 'forgeStacksMax', op: 'add', value: 0.09 }),
        t('fo_a2c', '淬火', '淬炼持续+0.11', '🔨', { stat: 'forgeDuration', op: 'add', value: 0.11 })
      ],
      [
        t('fo_a3a', '锻炉阵', '攻击力提升+13%', '🔨', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('fo_a3b', '淬炼风暴', '暴击几率+12%，锻炉淬炼层数+0.14', '🔨', { multi: [{ stat: 'critRate', op: 'add', value: 0.12 }, { stat: 'forgeStacksMax', op: 'add', value: 0.14 }] })
      ],
      [
        t('fo_a4a', '匠神', '锻炉淬炼层数+0.13', '🔨', { stat: 'forgeStacksMax', op: 'add', value: 0.13 }),
        t('fo_a4b', '锻之极', '淬炼持续+0.15，攻击力提升+21%', '🔨', { multi: [{ stat: 'forgeDuration', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'forge_ultimate', name: '锻炉流·终极', icon: '🔨', color: '#ff7733', layers: [
      [
        t('fo_u1a', '锻炉觉醒', '锻炉淬炼层数+0.04', '🔨', { stat: 'forgeStacksMax', op: 'add', value: 0.04 }),
        t('fo_u1b', '淬火共鸣', '淬炼持续+0.06', '🔨', { stat: 'forgeDuration', op: 'add', value: 0.06 })
      ],
      [
        t('fo_u2a', '锻心', '攻击力提升+9%', '🔨', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('fo_u2b', '武库域', '暴击几率+9%', '🔨', { stat: 'critRate', op: 'add', value: 0.09 }),
        t('fo_u2c', '锻刃', '锻炉淬炼层数+0.11', '🔨', { stat: 'forgeStacksMax', op: 'add', value: 0.11 })
      ],
      [
        t('fo_u3a', '神匠预备', '淬炼持续+0.1', '🔨', { stat: 'forgeDuration', op: 'add', value: 0.1 }),
        t('fo_u3b', '匠神核心', '攻击力提升+15%，暴击几率+14%', '🔨', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'critRate', op: 'add', value: 0.14 }] })
      ],
      [
        t('fo_u4a', '神匠武库', '暴击几率+13%', '🔨', { stat: 'critRate', op: 'add', value: 0.13 }),
        t('fo_u4b', '神匠武库·极', '暴击率+15%', '🔨', { stat: 'critRate', op: 'add', value: 0.146 })
      ]
    ] }
  },
  rebound: {
    attack: { id: 'rebound_attack', name: '弹射流·攻击', icon: '↩️', color: '#33ccaa', layers: [
      [
        t('re_a1a', '弹跳连击', '子弹弹跳次数+1', '↩️', { stat: 'bounceCount', op: 'add', value: 1 }),
        t('re_a1b', '弹幕反弹', '弹跳伤害保留+6%', '↩️', { stat: 'bounceRetention', op: 'add', value: 0.06 }),
        t('re_a1c', '弹射地狱', '攻击力提升+9%', '↩️', { stat: 'attack', op: 'multiply', value: 0.09 })
      ],
      [
        t('re_a2a', '弹刃', '攻击速度提升+10%', '↩️', { stat: 'attackSpeed', op: 'multiply', value: -0.1 }),
        t('re_a2b', '折射', '子弹弹跳次数+2', '↩️', { stat: 'bounceCount', op: 'add', value: 2 }),
        t('re_a2c', '反弹', '弹跳伤害保留+11%', '↩️', { stat: 'bounceRetention', op: 'add', value: 0.11 })
      ],
      [
        t('re_a3a', '弹射阵', '攻击力提升+13%', '↩️', { stat: 'attack', op: 'multiply', value: 0.13 }),
        t('re_a3b', '弹雨风暴', '攻击速度提升+16%，子弹弹跳次数+3', '↩️', { multi: [{ stat: 'attackSpeed', op: 'multiply', value: -0.16 }, { stat: 'bounceCount', op: 'add', value: 3 }] })
      ],
      [
        t('re_a4a', '弹神', '子弹弹跳次数+3', '↩️', { stat: 'bounceCount', op: 'add', value: 3 }),
        t('re_a4b', '弹之极', '弹跳伤害保留+15%，攻击力提升+21%', '↩️', { multi: [{ stat: 'bounceRetention', op: 'add', value: 0.15 }, { stat: 'attack', op: 'multiply', value: 0.21 }] })
      ]
    ] },
    ultimate: { id: 'rebound_ultimate', name: '弹射流·终极', icon: '↩️', color: '#33ccaa', layers: [
      [
        t('re_u1a', '弹射觉醒', '子弹弹跳次数+1', '↩️', { stat: 'bounceCount', op: 'add', value: 1 }),
        t('re_u1b', '反弹共鸣', '弹跳伤害保留+6%', '↩️', { stat: 'bounceRetention', op: 'add', value: 0.06 })
      ],
      [
        t('re_u2a', '弹心', '攻击力提升+9%', '↩️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('re_u2b', '地狱域', '攻击速度提升+12%', '↩️', { stat: 'attackSpeed', op: 'multiply', value: -0.12 }),
        t('re_u2c', '弹刃', '子弹弹跳次数+2', '↩️', { stat: 'bounceCount', op: 'add', value: 2 })
      ],
      [
        t('re_u3a', '弹射预备', '弹跳伤害保留+10%', '↩️', { stat: 'bounceRetention', op: 'add', value: 0.1 }),
        t('re_u3b', '弹神核心', '攻击力提升+15%，攻击速度提升+18%', '↩️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'attackSpeed', op: 'multiply', value: -0.18 }] })
      ],
      [
        t('re_u4a', '弹射地狱', '攻击速度提升+18%', '↩️', { stat: 'attackSpeed', op: 'multiply', value: -0.18 }),
        t('re_u4b', '弹射地狱·极', '攻击速度+20%', '↩️', { stat: 'attackSpeed', op: 'multiply', value: -0.202 })
      ]
    ] }
  },
  shroud: {
    attack: { id: 'shroud_attack', name: '迷雾流·攻击', icon: '🌫️', color: '#6b5b8f', layers: [
      [
        t('sh_a1a', '烟雾笼罩', '迷雾笼罩范围+28', '🌫️', { stat: 'shroudRadius', op: 'add', value: 28 }),
        t('sh_a1b', '致盲', '致盲几率+5%', '🌫️', { stat: 'blindChance', op: 'add', value: 0.045 }),
        t('sh_a1c', '全蚀', '致盲持续+0.08', '🌫️', { stat: 'blindDuration', op: 'add', value: 0.08 })
      ],
      [
        t('sh_a2a', '全蚀之幕', '攻击力提升+9%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.09 }),
        t('sh_a2b', '雾刃', '迷雾笼罩范围+53', '🌫️', { stat: 'shroudRadius', op: 'add', value: 53 }),
        t('sh_a2c', '迷障', '致盲几率+9%', '🌫️', { stat: 'blindChance', op: 'add', value: 0.085 })
      ],
      [
        t('sh_a3a', '迷雾阵', '致盲持续+0.1', '🌫️', { stat: 'blindDuration', op: 'add', value: 0.1 }),
        t('sh_a3b', '致盲风暴', '攻击力提升+15%，迷雾笼罩范围+78', '🌫️', { multi: [{ stat: 'attack', op: 'multiply', value: 0.15 }, { stat: 'shroudRadius', op: 'add', value: 78 }] })
      ],
      [
        t('sh_a4a', '雾神', '迷雾笼罩范围+73', '🌫️', { stat: 'shroudRadius', op: 'add', value: 73 }),
        t('sh_a4b', '雾之极', '致盲几率+12%，致盲持续+0.17', '🌫️', { multi: [{ stat: 'blindChance', op: 'add', value: 0.12 }, { stat: 'blindDuration', op: 'add', value: 0.17 }] })
      ]
    ] },
    ultimate: { id: 'shroud_ultimate', name: '迷雾流·终极', icon: '🌫️', color: '#6b5b8f', layers: [
      [
        t('sh_u1a', '迷雾觉醒', '迷雾笼罩范围+28', '🌫️', { stat: 'shroudRadius', op: 'add', value: 28 }),
        t('sh_u1b', '致盲共鸣', '致盲几率+5%', '🌫️', { stat: 'blindChance', op: 'add', value: 0.045 })
      ],
      [
        t('sh_u2a', '雾心', '致盲持续+0.07', '🌫️', { stat: 'blindDuration', op: 'add', value: 0.07 }),
        t('sh_u2b', '全蚀域', '攻击力提升+11%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.11 }),
        t('sh_u2c', '雾刃', '迷雾笼罩范围+63', '🌫️', { stat: 'shroudRadius', op: 'add', value: 63 })
      ],
      [
        t('sh_u3a', '之幕预备', '致盲几率+8%', '🌫️', { stat: 'blindChance', op: 'add', value: 0.08 }),
        t('sh_u3b', '雾神核心', '致盲持续+0.12，攻击力提升+17%', '🌫️', { multi: [{ stat: 'blindDuration', op: 'add', value: 0.12 }, { stat: 'attack', op: 'multiply', value: 0.17 }] })
      ],
      [
        t('sh_u4a', '全蚀之幕', '攻击力提升+17%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.17 }),
        t('sh_u4b', '全蚀之幕·极', '攻击力+19%', '🌫️', { stat: 'attack', op: 'multiply', value: 0.19 })
      ]
    ] }
  }
};

window.FactionTalents = {
  getBranches: function(factionId) {
    return FACTION_TALENT_DATA[factionId] || null;
  }
};
