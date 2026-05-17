/**
 * STG Game - Skill Manager
 * XP tracking, level-up, random skill selection, passive/active/conditional effects.
 *
 * Global: window.SkillManager
 * Dependencies: window.GAME_CONFIG, window.game, window.Player, window.Bullet
 */

class SkillManager {
  constructor(player) {
    this.player = player;

    // XP & level
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 0;

    // Learned skills (array of skill IDs)
    this.learnedSkills = [];

    // Weapon levels: Map of weaponId → level (0 = not owned, 1-5 = owned)
    this.weaponLevels = new Map();
    this.currentWeaponId = 'normal';

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

    // Fusion system state
    this.fusedWeapons = new Set();   // Set of fused weapon IDs already created
    this.fusedSkills = new Set();    // Set of fused skill IDs already created
    this._pendingFusions = [];       // Array of available fusion recipes
    this.onFusionAvailable = null;   // Callback: (fusions) => {} — called when new fusion becomes available
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
    window.game.pause();
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

    // Build pool of unlearned skills (exclude fused skills — they're created via fusion)
    var pool = [];
    for (var i = 0; i < GAME_CONFIG.SKILLS.length; i++) {
      var skill = GAME_CONFIG.SKILLS[i];
      if (skill.fused) continue; // Fused skills don't appear in normal choices
      if (this.learnedSkills.indexOf(skill.id) === -1) {
        pool.push({ _choiceType: 'skill', _data: skill });
      }
    }

    // Build pool of weapons (exclude fused weapons — they're created via fusion)
    var weapons = GAME_CONFIG.WEAPONS;
    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    var maxLvl = upgradeCfg ? upgradeCfg.maxLevel : 5;
    for (var wid in weapons) {
      if (!weapons.hasOwnProperty(wid)) continue;
      var w = weapons[wid];
      if (w.fused) continue; // Fused weapons don't appear in normal choices
      var curLvl = this.weaponLevels.get(wid) || 0;
      if (curLvl >= maxLvl) continue; // Already max level, skip
      // Create a weapon choice entry
      var wChoice = {
        _choiceType: 'weapon',
        _data: w,
        _weaponId: wid,
        _currentLevel: curLvl,
        _nextLevel: curLvl + 1,
      };
      pool.push(wChoice);
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
        // Weapon upgrade: slight weight boost for already-owned weapons (encourage upgrading)
        if (item._choiceType === 'weapon' && item._currentLevel > 0) {
          weight *= 1.5;
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

    this.learnedSkills.push(skillId);

    switch (skill.type) {
      case 'passive':
        // Apply stat modifiers from effects array
        this.player.applyStatModifiers(skill.effects);
        break;
      case 'active':
        // Register cooldown tracking; fires automatically when ready
        this.activeCooldowns.set(skillId, 0);
        break;
      case 'conditional':
        // Conditional skills are handled by trigger methods (onKill, onHit, etc.)
        // Register cooldown if skill has one
        if (skill.cooldown) {
          this.conditionalCooldowns.set(skillId, 0);
        }
        break;
    }

    // Check for available fusions after learning a skill
    var availableFusions = this.checkFusions();
    if (availableFusions.length > 0 && this.onFusionAvailable) {
      this.onFusionAvailable(availableFusions);
    }

    this._pendingLevelUps--;
    if (this._pendingLevelUps > 0) {
      // More level-ups pending: show next set of choices
      this._isChoosing = false; // Reset before recursive call
      this._showLevelUpChoices();
    } else {
      this._isChoosing = false;
      window.game.resume();
    }
  }

  // ====================================================================
  //  WEAPON SELECTION & UPGRADE
  // ====================================================================

  /**
   * Select or upgrade a weapon by ID.
   * If weapon is new: acquire at level 1 and switch to it.
   * If weapon is already owned: upgrade its level (up to max).
   * Applies upgrade stat modifiers to the weapon manager.
   * @param {string} weaponId - key in GAME_CONFIG.WEAPONS
   */
  selectWeapon(weaponId) {
    var wCfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!wCfg) return;

    var upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
    var maxLvl = upgradeCfg ? upgradeCfg.maxLevel : 5;
    var curLvl = this.weaponLevels.get(weaponId) || 0;

    if (curLvl < maxLvl) {
      curLvl++;
      this.weaponLevels.set(weaponId, curLvl);
    }

    // Switch to this weapon
    this.currentWeaponId = weaponId;
    if (this.weaponManager) {
      this.weaponManager.setWeapon(weaponId);
      this._applyWeaponUpgrades(weaponId);
    }

    // Show toast notification
    if (window.ui) {
      var label = upgradeCfg && upgradeCfg.descriptions ? upgradeCfg.descriptions[curLvl] : ('Lv' + curLvl);
      if (curLvl === 1) {
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
      window.game.resume();
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
   * @returns {Array} Array of available fusion recipe objects
   */
  checkFusions() {
    var recipes = GAME_CONFIG.FUSION_RECIPES;
    if (!recipes) return [];
    var requiredLevel = recipes.requiredLevel || 5;
    var available = [];

    // Check weapon fusions
    for (var i = 0; i < recipes.weapons.length; i++) {
      var recipe = recipes.weapons[i];
      if (this.fusedWeapons.has(recipe.id)) continue;
      var lvlA = this.weaponLevels.get(recipe.ingredientA) || 0;
      var lvlB = this.weaponLevels.get(recipe.ingredientB) || 0;
      if (lvlA >= requiredLevel && lvlB >= requiredLevel) {
        available.push({ type: 'weapon', recipe: recipe });
      }
    }

    // Check skill fusions
    for (var j = 0; j < recipes.skills.length; j++) {
      var sRecipe = recipes.skills[j];
      if (this.fusedSkills.has(sRecipe.id)) continue;
      var hasA = this.learnedSkills.indexOf(sRecipe.ingredientA) !== -1;
      var hasB = this.learnedSkills.indexOf(sRecipe.ingredientB) !== -1;
      // For skills, both must be learned (they don't have levels like weapons)
      // We check if the skill IDs exist in learnedSkills
      if (hasA && hasB) {
        available.push({ type: 'skill', recipe: sRecipe });
      }
    }

    return available;
  }

  /**
   * Execute a weapon fusion: consume both ingredient weapons, create the fused weapon.
   * @param {object} recipe - Fusion recipe from FUSION_RECIPES.weapons
   */
  executeWeaponFusion(recipe) {
    if (this.fusedWeapons.has(recipe.id)) return false;

    // Mark as fused
    this.fusedWeapons.add(recipe.id);

    // Remove ingredient weapons from weaponLevels (they're consumed)
    this.weaponLevels.delete(recipe.ingredientA);
    this.weaponLevels.delete(recipe.ingredientB);

    // Add the fused weapon at max level
    var fusedWeaponId = recipe.result;
    this.weaponLevels.set(fusedWeaponId, GAME_CONFIG.WEAPON_UPGRADE.maxLevel || 5);

    // Switch to the fused weapon
    this.currentWeaponId = fusedWeaponId;
    if (this.weaponManager) {
      this.weaponManager.setWeapon(fusedWeaponId);
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

    // Mark as fused
    this.fusedSkills.add(recipe.id);

    // Remove ingredient skills from learnedSkills (they're consumed)
    var idxA = this.learnedSkills.indexOf(recipe.ingredientA);
    if (idxA !== -1) this.learnedSkills.splice(idxA, 1);
    var idxB = this.learnedSkills.indexOf(recipe.ingredientB);
    if (idxB !== -1) this.learnedSkills.splice(idxB, 1);

    // Add the fused skill
    this.learnedSkills.push(recipe.result);

    // Apply the fused skill's effects
    var fusedSkill = this._findSkill(recipe.result);
    if (fusedSkill) {
      if (fusedSkill.type === 'active' && fusedSkill.cooldown) {
        this.activeCooldowns.set(recipe.result, 0);
      }
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
   * Fire onHit trigger. Called when the player takes damage.
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
    for (var i = 0; i < this.learnedSkills.length; i++) {
      var skill = this._findSkill(this.learnedSkills[i]);
      if (!skill || skill.type !== 'conditional' || skill.trigger !== trigger) continue;

      // Check conditional cooldown
      if (skill.cooldown) {
        var cd = this.conditionalCooldowns.get(skill.id) || 0;
        if (cd > 0) continue;
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
      if (allFx.length === 0) continue;

      // Set cooldown if skill has one
      if (skill.cooldown) {
        this.conditionalCooldowns.set(skill.id, skill.cooldown);
      }

      // Position for position-dependent effects
      var posX = (x !== undefined) ? x : player.x;
      var posY = (y !== undefined) ? y : player.y;

      // Apply effects
      for (var k = 0; k < allFx.length; k++) {
        this._applyEffect(allFx[k], posX, posY, skill);
      }

      // If skill has a duration, register temp buff tracking
      if (skill.duration && allFx.length > 0) {
        this._registerTempTimer(skill, allFx);
      }
    }
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
      _slowedEnemies: {},

      update: function(dt) {
        this._elapsed += dt * 1000;
        if (this._elapsed >= this.duration) {
          // Remove slow from all enemies
          for (var id in this._slowedEnemies) {
            if (this._slowedEnemies.hasOwnProperty(id)) {
              var e = this._slowedEnemies[id];
              if (e && e.active) {
                e.speed = e._origSpeed || e.speed;
              }
            }
          }
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
          if (inside && !this._slowedEnemies[e._id]) {
            this._slowedEnemies[e._id] = e;
            e._origSpeed = e.speed;
            e.speed *= 0.35;
            // Apply freeze effect to enemies in blizzard radius
            e.frozenTimer = Math.max(e.frozenTimer || 0, 1000);
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
        e._poisonTimer = duration;
        e._poisonDamage = damage;
        e._poisonTick = 1000; // 1 second per tick
        e._poisonTickTimer = 0;
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

        update: function(dt) {
          this._age += dt * 1000;
          if (this._age >= this.lifetime) {
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
        e._frozenTimer = duration;
        if (e._origSpeed === undefined) e._origSpeed = e.speed;
        e.speed = 0;
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
    var _slowedEnemies = {};

    var entity = {
      x: x, y: y,
      radius: radius,
      active: true,
      category: 'particle',
      drawLayer: 3,
      duration: duration / 1000,
      _elapsed: 0,
      _tickTimer: 0,
      _slowedEnemies: {},

      update: function(dt) {
        this._elapsed += dt;
        if (this._elapsed >= this.duration) {
          // Remove slow from all tracked enemies
          var enemies = game.enemies;
          for (var id in this._slowedEnemies) {
            if (this._slowedEnemies.hasOwnProperty(id)) {
              for (var j = 0; j < enemies.length; j++) {
                if (enemies[j].active && enemies[j]._uid == id) {
                  enemies[j]._slowMult = 1;
                }
              }
            }
          }
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
              // Apply damage
              e.hp -= damage;
              // Apply poison
              e._poisonTimer = poisonDuration;
              e._poisonDamage = poisonDamage;
              e._poisonTick = 1000;
              e._poisonTickTimer = 0;
              // Apply slow
              e._slowMult = 1 - slowAmount;
              this._slowedEnemies[e._uid || (e._uid = Math.random())] = true;
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

      // Damage and burn
      current.hp -= chainDmg;
      current._burnTimer = burnDuration;
      current._burnDamage = burnDamage;
      current._burnTick = 500;
      current._burnTickTimer = 0;

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
//  EXPORT
// ====================================================================
window.SkillManager = SkillManager;
