/**
 * STG Game Codex Progress Manager
 * Tracks first-time discoveries for enemies, weapons, factions, and bosses.
 * Each discovery triggers a toast notification and is persisted to localStorage.
 *
 * Global: window.CodexProgressManager
 */
class CodexProgressManager {
  static STORAGE_KEY = 'stg_codex_discoveries';

  /**
   * @returns {object} - { category: { id: { id, name, discoveredAt } } }
   */
  static getDiscoveries() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  static saveDiscoveries(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage unavailable */ }
  }

  /**
   * Check if a specific entry has been discovered.
   * @param {string} category - 'enemies' | 'weapons' | 'factions' | 'bosses'
   * @param {string} id - entry identifier
   * @returns {boolean}
   */
  static isDiscovered(category, id) {
    const discoveries = this.getDiscoveries();
    return !!(discoveries[category] && discoveries[category][id]);
  }

  /**
   * Mark an entry as discovered. Returns true if newly discovered.
   */
  static discover(category, id, name) {
    const discoveries = this.getDiscoveries();
    if (!discoveries[category]) discoveries[category] = {};
    if (discoveries[category][id]) return false; // already discovered
    discoveries[category][id] = { id, name, discoveredAt: Date.now() };
    this.saveDiscoveries(discoveries);
    return true;
  }

  /**
   * Discover an enemy type — called on first encounter.
   * @param {string} enemyType - enemy.type from config
   * @param {string} enemyName - display name from config
   */
  static discoverEnemy(enemyType, enemyName) {
    if (this.discover('enemies', enemyType, enemyName || enemyType)) {
      if (window.ui) {
        window.ui.showToast('📖 图鉴解锁: ' + (enemyName || enemyType), 3000);
      }
    }
  }

  /**
   * Discover a weapon — called on first use / acquisition.
   * @param {string} weaponId - weapon ID from GAME_CONFIG.WEAPONS
   */
  static discoverWeapon(weaponId) {
    const cfg = window.GAME_CONFIG;
    let name = weaponId;
    if (cfg && cfg.WEAPONS && cfg.WEAPONS[weaponId]) {
      name = cfg.WEAPONS[weaponId].name || weaponId;
    }
    if (this.discover('weapons', weaponId, name)) {
      if (window.ui) {
        window.ui.showToast('📖 图鉴解锁: ' + name, 3000);
      }
    }
  }

  /**
   * Discover a faction — called on game start.
   * @param {string} factionId - faction ID from GAME_CONFIG.FACTIONS
   */
  static discoverFaction(factionId) {
    const cfg = window.GAME_CONFIG;
    let name = factionId;
    if (cfg && cfg.FACTIONS && cfg.FACTIONS[factionId]) {
      name = cfg.FACTIONS[factionId].name || factionId;
    }
    if (this.discover('factions', factionId, name)) {
      if (window.ui) {
        window.ui.showToast('📖 图鉴解锁: ' + name, 3000);
      }
    }
  }

  /**
   * Discover a boss — called on boss kill.
   * @param {string} bossId - boss identifier
   * @param {string} bossName - display name
   */
  static discoverBoss(bossId, bossName) {
    if (this.discover('bosses', bossId, bossName || bossId)) {
      if (window.ui) {
        window.ui.showToast('📖 图鉴解锁: ' + (bossName || bossId), 3000);
      }
    }
  }

  static discoverSkill(skillId) {
    const cfg = window.GAME_CONFIG;
    let name = skillId;
    if (cfg && cfg.SKILLS) {
      for (var i = 0; i < cfg.SKILLS.length; i++) {
        if (cfg.SKILLS[i].id === skillId) { name = cfg.SKILLS[i].name || skillId; break; }
      }
    }
    if (this.discover('skills', skillId, name)) {
      if (window.ui) window.ui.showToast('📖 图鉴解锁: ' + name, 3000);
    }
  }
}

window.CodexProgressManager = CodexProgressManager;
