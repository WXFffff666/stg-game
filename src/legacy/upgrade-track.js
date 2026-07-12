/**
 * Unified upgrade track for weapons, skills, and faction passives.
 * Repeat selections increment level; milestones at 3/5/8 unlock bonuses.
 */
var UPGRADE_MILESTONES = [3, 5, 8];

var UpgradeTrack = {
  _tracks: null,

  reset() {
    this._tracks = {
      weapons: new Map(),
      skills: new Map(),
      factions: new Map(),
    };
  },

  getLevel(type, id) {
    if (!this._tracks) this.reset();
    var map = this._tracks[type];
    return map ? (map.get(id) || 0) : 0;
  },

  increment(type, id) {
    if (!this._tracks) this.reset();
    var map = this._tracks[type];
    if (!map) return 0;
    var lvl = (map.get(id) || 0) + 1;
    map.set(id, lvl);
    this._checkMilestone(type, id, lvl);
    return lvl;
  },

  _checkMilestone(type, id, level) {
    if (UPGRADE_MILESTONES.indexOf(level) < 0) return;
    var ui = window.ui;
    var label = type === 'weapon' ? '武器' : (type === 'skill' ? '技能' : '流派');
    var name = id;
    if (type === 'weapon' && GAME_CONFIG.WEAPONS[id]) name = GAME_CONFIG.WEAPONS[id].name;
    if (ui && ui.showToast) {
      ui.showToast('⭐ ' + label + ' [' + name + '] 达到 Lv.' + level + ' 里程碑！', 2500, '#ffdd00');
    }
    if (window.eventBus) {
      window.eventBus.emit('upgradeMilestone', { type: type, id: id, level: level });
    }
  },

  isFusionReady(weaponId) {
    var req = GAME_CONFIG.FUSION_RECIPES ? GAME_CONFIG.FUSION_RECIPES.requiredLevel : 5;
    return this.getLevel('weapons', weaponId) >= req;
  },

  getFusionReadyPairs() {
    if (!this._tracks) return [];
    var recipes = (GAME_CONFIG.FUSION_RECIPES && GAME_CONFIG.FUSION_RECIPES.weapons) || [];
    var cores = window._fusionCores || 0;
    if (cores < 1) return [];
    var ready = [];
    var req = GAME_CONFIG.FUSION_RECIPES.requiredLevel || 5;
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i];
      var la = this.getLevel('weapons', r.ingredientA);
      var lb = this.getLevel('weapons', r.ingredientB);
      if (la >= req && lb >= req) ready.push(r);
    }
    return ready;
  },
};

window.UpgradeTrack = UpgradeTrack;
UpgradeTrack.reset();
