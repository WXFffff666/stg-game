/**
 * Validate all factions have FACTION_SYSTEM entries and exclusive skills in SKILLS.
 * Usage: node tools/validate-factions.js
 */
const fs = require('fs');
const path = require('path');

// Minimal eval context
const configSrc = fs.readFileSync(path.join(__dirname, '../src/legacy/config.js'), 'utf8');
const skillsSrc = fs.readFileSync(path.join(__dirname, '../src/legacy/skills.js'), 'utf8');

const GAME_CONFIG = {};
eval(configSrc.replace('window.GAME_CONFIG = GAME_CONFIG;', ''));

let FACTION_SYSTEM = {};
const _EXCLUSIVE_TO_FACTION = {};
eval(skillsSrc.split('// ====================================================================')[0]);

const factionIds = Object.keys(GAME_CONFIG.FACTIONS || {});
const skillIds = new Set((GAME_CONFIG.SKILLS || []).map(s => s.id));

let missing = 0;
let missingSkills = 0;

for (const fid of factionIds) {
  const sys = FACTION_SYSTEM[fid];
  if (!sys) {
    console.log('MISSING FACTION_SYSTEM:', fid);
    missing++;
    continue;
  }
  for (const sk of (sys.exclusiveSkills || [])) {
    if (!skillIds.has(sk)) {
      console.log('MISSING SKILL', sk, 'for faction', fid);
      missingSkills++;
    }
  }
}

console.log('---');
console.log('Factions:', factionIds.length);
console.log('FACTION_SYSTEM entries:', Object.keys(FACTION_SYSTEM).length);
console.log('Missing systems:', missing);
console.log('Missing skills:', missingSkills);
process.exit(missing + missingSkills > 0 ? 1 : 0);
