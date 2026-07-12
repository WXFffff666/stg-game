/**
 * generate-skills.js
 *
 * Generates parameterized skill variants for GAME_CONFIG.SKILLS.
 * Output: valid JS array entries, one per line, prefixed with a header comment.
 *
 * Usage: node tools/generate-skills.js
 * Output is written to stdout. Pipe to append:
 *   node tools/generate-skills.js >> src/legacy/config.js
 *   (manually insert before the closing ] of SKILLS array)
 */

// ============================================================
//  HELPERS
// ============================================================

const LEVEL_NAMES = ['I', 'II', 'III', 'IV', 'V'];

/**
 * Maps level index (0–4) to a rarity string.
 */
function rarityForLevel(level) {
  const map = ['common', 'common', 'uncommon', 'uncommon', 'rare'];
  return map[level] ?? 'common';
}

/**
 * Format a skill entry as a JS object literal string.
 */
function entry(id, name, rarity, effects) {
  const effStr = effects
    .map((e) => {
      const parts = [];
      for (const [k, v] of Object.entries(e)) {
        if (typeof v === 'string') {
          parts.push(`${k}: '${v}'`);
        } else {
          parts.push(`${k}: ${v}`);
        }
      }
      return `{ ${parts.join(', ')} }`;
    })
    .join(', ');
  return `{ id: '${id}', name: '${name}', faction: 'any', type: 'passive', rarity: '${rarity}', effects: [${effStr}] },`;
}

// ============================================================
//  TEMPLATE DEFINITIONS
// ============================================================

const TEMPLATES = [];

// ----- Template 1: StatBoost (attack) -----
// 5 levels × rarities = 5 skills
TEMPLATES.push({
  prefix: 'gen_atk',
  nameBase: '攻击强化',
  stat: 'attack',
  op: 'multiply',
  values: [0.08, 0.15, 0.25, 0.38, 0.55],
});

// ----- Template 2: SpeedBoost -----
TEMPLATES.push({
  prefix: 'gen_spd',
  nameBase: '速度提升',
  stat: 'speed',
  op: 'multiply',
  values: [0.06, 0.12, 0.20, 0.30, 0.45],
});

// ----- Template 3: HPBoost -----
TEMPLATES.push({
  prefix: 'gen_hp',
  nameBase: '生命提升',
  stat: 'maxHp',
  op: 'add',
  values: [15, 30, 50, 75, 100],
});

// ----- Template 4: CritRateBoost -----
TEMPLATES.push({
  prefix: 'gen_cri',
  nameBase: '暴击率提升',
  stat: 'critRate',
  op: 'add',
  values: [0.04, 0.08, 0.12, 0.18, 0.25],
});

// ----- Template 5: CritDamageBoost -----
TEMPLATES.push({
  prefix: 'gen_cdmg',
  nameBase: '暴击伤害提升',
  stat: 'critMult',
  op: 'add',
  values: [0.3, 0.5, 0.8, 1.2, 1.8],
});

// ----- Template 6: ElementDamage (burn / poison / freeze) -----
// 3 elements × 5 levels = 15 skills
const ELEMENT_VARIANTS = [
  { suffix: 'burn', nameSuffix: '灼烧', stat: 'burnDamage', op: 'add', values: [3, 6, 10, 15, 22] },
  { suffix: 'pois', nameSuffix: '毒素', stat: 'poisonDamage', op: 'add', values: [3, 6, 10, 15, 22] },
  { suffix: 'freeze', nameSuffix: '冰冻', stat: 'slowChance', op: 'add', values: [0.05, 0.10, 0.16, 0.24, 0.35] },
];
for (const v of ELEMENT_VARIANTS) {
  TEMPLATES.push({
    prefix: `gen_${v.suffix}`,
    nameBase: `${v.nameSuffix}强化`,
    stat: v.stat,
    op: v.op,
    values: v.values,
  });
}

// ----- Template 7: DefensiveStat (dodge / defense / shield) -----
// 3 stats × 5 levels = 15 skills
const DEFENSE_VARIANTS = [
  { suffix: 'dodge', nameSuffix: '闪避', stat: 'dodgeChance', op: 'add', values: [0.04, 0.08, 0.13, 0.19, 0.26] },
  { suffix: 'def', nameSuffix: '防御', stat: 'defense', op: 'add', values: [0.05, 0.10, 0.16, 0.24, 0.34] },
  { suffix: 'shield', nameSuffix: '护盾', stat: 'shieldAmount', op: 'add', values: [15, 30, 50, 75, 100] },
];
for (const v of DEFENSE_VARIANTS) {
  TEMPLATES.push({
    prefix: `gen_${v.suffix}`,
    nameBase: `${v.nameSuffix}强化`,
    stat: v.stat,
    op: v.op,
    values: v.values,
  });
}

// ----- Template 8: BulletModifier (count / size / speed / pierce) -----
// 4 mods × 5 levels = 20 skills
const BULLET_VARIANTS = [
  { suffix: 'bcount', nameSuffix: '弹道增加', stat: 'bulletCount', op: 'add', values: [1, 1, 2, 2, 3] },
  { suffix: 'bsize', nameSuffix: '弹幕增大', stat: 'bulletSize', op: 'multiply', values: [0.15, 0.25, 0.40, 0.55, 0.75] },
  { suffix: 'bspd', nameSuffix: '弹速提升', stat: 'bulletSpeed', op: 'multiply', values: [0.10, 0.20, 0.32, 0.45, 0.60] },
  { suffix: 'pierce', nameSuffix: '穿透提升', stat: 'pierceCount', op: 'add', values: [1, 1, 2, 2, 3] },
];
for (const v of BULLET_VARIANTS) {
  TEMPLATES.push({
    prefix: `gen_${v.suffix}`,
    nameBase: v.nameSuffix,
    stat: v.stat,
    op: v.op,
    values: v.values,
  });
}

// ----- Template 9: XPMultiplier -----
// 5 levels = 5 skills
TEMPLATES.push({
  prefix: 'gen_xp',
  nameBase: '经验加成',
  stat: 'xpMultiplier',
  op: 'multiply',
  values: [0.15, 0.25, 0.40, 0.60, 0.85],
});

// ----- Template 10: Lifesteal -----
// 5 levels = 5 skills
TEMPLATES.push({
  prefix: 'gen_ls',
  nameBase: '吸血强化',
  stat: 'lifesteal',
  op: 'add',
  values: [0.04, 0.08, 0.13, 0.19, 0.26],
});

// ============================================================
//  GENERATION
// ============================================================

let total = 0;
const lines = [];

lines.push('');
lines.push('    // ============================================================');
lines.push('    //  AUTO-GENERATED SKILL VARIANTS (generate-skills.js)');
lines.push('    //  Total: see count at end of block');
lines.push('    // ============================================================');
lines.push('');

for (const tpl of TEMPLATES) {
  for (let level = 0; level < 5; level++) {
    const levelNum = level + 1;
    const id = `${tpl.prefix}_${levelNum}`;
    const name = `${tpl.nameBase} ${LEVEL_NAMES[level]}`;
    const rarity = rarityForLevel(level);
    const value = tpl.values[level];
    const effect = { stat: tpl.stat, op: tpl.op, value };
    lines.push(entry(id, name, rarity, [effect]));
    total++;
  }
}

lines.push('');
lines.push(`    // --- End auto-generated variants (${total} skills) ---`);
lines.push('');

// ============================================================
//  OUTPUT
// ============================================================

process.stdout.write(lines.join('\n'));

// Also print a summary to stderr so it shows in terminal
process.stderr.write(`\n✓ Generated ${total} skill variants across ${TEMPLATES.length} templates.\n`);
