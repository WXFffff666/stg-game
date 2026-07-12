/**
 * Handcrafted per-faction bullet modifiers when firing any weapon.
 * Each entry matches FACTIONS[id].description / baseStats — not batch-generated.
 * Used by WeaponManager._getFactionBulletModifiers()
 */
(function() {
  'use strict';

  window.FACTION_BULLET_MODS = {
    // ===== Core 10 =====
    attackSpeed:  { pierceHint: 1, factionCritBonus: 0.04 },
    counter:      { knockbackForce: 45, thornOnHit: 0.08 },
    crit:         { factionCritBonus: 0.12, executeThreshold: 0.08 },
    summon:       { chainCount: 1, chainRange: 90 },
    elemental:    { burnDamage: 6, burnDuration: 2500 },
    lifesteal:    { lifesteal: 0.04 },
    shield:       { knockbackForce: 35, healOnHit: 1 },
    poison:       { poisonDamage: 8, poisonDuration: 3500 },
    ice:          { slowAmount: 0.35, slowDuration: 2200, freezeChance: 0.06 },
    barrage:      { pierceCount: 1, spreadBonus: 1 },

    // ===== Extended =====
    gravity:      { gravityPull: 35, slowAmount: 0.2, slowDuration: 1500 },
    void:         { executeThreshold: 0.12, voidExecuteThreshold: 0.12 },
    thunder:      { chainCount: 3, chainRange: 140, chainDamage: 0.45 },
    wind:         { knockbackForce: 90 },
    shadow:       { stealthOnHit: true, factionCritBonus: 0.05 },
    holy:         { healOnHit: 3, bossDamageMark: true },
    blood:        { lifesteal: 0.06, lowHpBonus: 0.08 },
    magnet:       { bulletRepelChance: 0.08, gravityPull: 25 },
    mirror:       { decoyMarkOnHit: true },
    time:         { slowAmount: 0.25, slowDuration: 1800, slowAura: 0.08 },
    fury:         { lowHpBonus: 0.1, factionCritBonus: 0.06 },
    luck:         { factionCritBonus: 0.05, dropRateBonus: 0.05 },
    sonic:        { sonicDamage: 0.12, knockbackForce: 50 },
    minion:       { lifesteal: 0.02, healOnHit: 1 },
    data:         { weakPointMark: true, factionCritBonus: 0.08 },
    nature:       { healOnHit: 2, thornOnHit: 0.1 },
    psychic:      { markOnHit: true, factionCritBonus: 0.06 },
    explosive:    { explosionRadiusBonus: 15, burnDamage: 4, burnDuration: 2000 },
    mech:         { pierceCount: 1, chainCount: 1, chainRange: 100 },
    rune:         { runeMarkOnHit: true, chainCount: 1, chainRange: 110 },
    star:         { chargeRate: 0.6, factionCritBonus: 0.04 },
    darkGold:     { goldOnHitMark: true },
    storm:        { tornadoChance: 0.1, knockbackForce: 70 },
    soul:         { soulTetherOnHit: true, lifesteal: 0.03 },
    genesis:      { chaosMarkOnHit: true, factionCritBonus: 0.03 },
    tech:         { nanoDisruptOnHit: true },
    chaos:        { randomElementOnHit: true },

    // ===== Elemental / nature themes =====
    light:        { burnDamage: 4, burnDuration: 2000, healOnHit: 1 },
    dark:         { stealthOnHit: true, factionCritBonus: 0.07 },
    lava:         { burnDamage: 9, burnDuration: 3000 },
    steam:        { slowAmount: 0.15, slowDuration: 1500, knockbackForce: 40 },
    dust:         { blindChance: 0.08, slowAmount: 0.12, slowDuration: 2000 },
    metal:        { pierceCount: 2, armorPierceMark: true },
    glass:        { shatterOnKill: true, factionCritBonus: 0.1 },
    silk:         { slowAmount: 0.3, slowDuration: 2200, sleepChance: 0.04 },
    bone:         { pierceCount: 1, thornOnHit: 0.06 },
    crystal:      { shatterOnKill: true, shardBurstOnHit: true },
    tundra:       { slowAmount: 0.4, slowDuration: 2500, freezeChance: 0.1 },
    desert:       { burnDamage: 5, burnDuration: 2500, slowAmount: 0.1, slowDuration: 1500 },
    forest:       { healOnHit: 1, thornOnHit: 0.12, poisonDamage: 3, poisonDuration: 2000 },
    mountain:     { knockbackForce: 60, stunChance: 0.05 },
    river:        { slowAmount: 0.18, slowDuration: 1800 },
    ocean:        { slowAmount: 0.22, slowDuration: 2000, poisonDamage: 4, poisonDuration: 2500 },
    phoenix:      { burnDamage: 8, burnDuration: 2800, healOnHit: 2 },
    dragon:       { burnDamage: 10, burnDuration: 3000, knockbackForce: 55 },

    // ===== Weapon style factions =====
    arrow:        { pierceCount: 1, factionCritBonus: 0.1 },
    spear:        { pierceCount: 2 },
    hammer:       { knockbackForce: 100, stunChance: 0.08 },
    whip:         { chainCount: 1, chainRange: 130, slowAmount: 0.2, slowDuration: 1500 },
    sword:        { factionCritBonus: 0.06, pierceCount: 1 },
    ax:           { knockbackForce: 75, cleaveMark: true },
    dagger:       { factionCritBonus: 0.12, stealthOnHit: true },
    staff:        { burnDamage: 5, burnDuration: 2000, slowAmount: 0.15, slowDuration: 1500 },
    bow:          { pierceCount: 1, factionCritBonus: 0.08 },

    // ===== Beast factions =====
    wolf:         { packMarkOnHit: true, factionCritBonus: 0.05 },
    bear:         { knockbackForce: 80, thornOnHit: 0.1 },
    eagle:        { factionCritBonus: 0.09, pierceCount: 1 },
    snake:        { poisonDamage: 7, poisonDuration: 3000 },
    lion:         { knockbackForce: 65, factionCritBonus: 0.05 },
    tiger:        { factionCritBonus: 0.08, knockbackForce: 55 },
    fox:          { stealthOnHit: true, dodgeOnHit: 0.08 },
    crane:        { dodgeOnHit: 0.06, healOnHit: 1 },

    // ===== Mystic factions =====
    dream:        { sleepChance: 0.06, confuseMark: true },
    nightmare:    { sleepChance: 0.05, blindChance: 0.08 },
    fate:         { markOnHit: true, executeThreshold: 0.06 },
    destiny:      { factionCritBonus: 0.05, healOnHit: 1 },
    karma:        { thornOnHit: 0.1, lifesteal: 0.03 },
    order:        { pierceCount: 1, factionCritBonus: 0.04 },
    truth:        { pierceCount: 2, executeThreshold: 0.05 },
    lies:         { blindChance: 0.1, confuseMark: true },

    // ===== Specialty =====
    phantom:      { dodgeOnHit: 0.12, stealthOnHit: true },
    chain:        { chainCount: 4, chainRange: 160, chainDamage: 0.5 },
    decay:        { poisonDamage: 6, poisonDuration: 4000, decayMark: true },
    momentum:     { knockbackForce: 45, factionCritBonus: 0.04 },
    pact:         { contractOnHit: 0.12, lifesteal: 0.02 },
    forge:        { forgeStackOnHit: true, burnDamage: 3, burnDuration: 2000 },
    rebound:      { bounceCount: 2, bounceRetention: 0.65 },
    shroud:       { blindChance: 0.12, stealthOnHit: true }
  };

})();
