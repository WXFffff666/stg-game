# stg-massive-expansion - Work Plan

## TL;DR (For humans)
This plan massively expands the game: 80 factions, 80 weapons, 500 skills, multi-weapon slot system (like Vampire Survivors), 360° enemy spawning, auto-fullscreen on all devices, and a complete Codex. Bugs are fixed (level-up no longer stuck on pause, iOS fullscreen works). The game becomes a full-featured survivor-like with depth and scale.

What you'll get: A polished, content-rich survivor-like STG game with 6-slot multi-weapon system, 80 unique factions, 80 weapons, 500+ skills, 360° enemy spawning, universal fullscreen, and complete Codex.

Effort: ~30-40 days (32 todos across 6 waves)

Risk: Medium. Content expansion is data-driven (config.js), safe. Architecture changes (multi-weapon) need careful implementation.

## Scope
All 6 components from draft. Content expansion targets: 80 factions, 80 weapons, 500 skills.

## Verification strategy
Agent-executed QA: after each wave, launch game in browser, verify each component. Wave 6 includes comprehensive sweep.

## Todos

### Wave 0: Critical Bug Fixes (P0)
- [ ] 1. Fix level-up pause overlay conflict
  References: skills.js:700 (game.pause()), main.js:852-894 (onLevelUp), index.html CSS (z-index 30/50), main.js game loop (pause overlay check)
  Fix: Remove `game.pause()` from skills.js _showLevelUpChoices() and main.js onLevelUp callback. Remove pause overlay visibility trigger during level-up. Add 8-second auto-select timer in skills.js: if no choice in 8 seconds, randomly pick first option.
  Files: js/skills.js, js/main.js, index.html CSS
  QA: Level up → verify no pause overlay → verify skill choices are clickable → wait 8 seconds → verify auto-select fires.

- [ ] 2. Add iOS fullscreen CSS fallback
  References: core.js:943 (toggleFullscreen), index.html:712 (.fs-ios-fallback CSS), gist/lemon-web research
  Fix: In toggleFullscreen(), after rfs fails or on iOS, apply `document.body.classList.add('fs-ios-fallback')`. Add close button. Use visualViewport workaround (Playgama pattern).
  Files: js/core.js, index.html CSS
  QA: Test on iOS simulator → verify CSS overlay covers viewport → verify close button hides it.

- [ ] 3. Fix keyboard fullscreen vendor prefixes
  References: core.js:906-914 (keyboard handler)
  Fix: Replace inline fullscreen code with `window.toggleFullscreen()` call.
  Files: js/core.js
  QA: Press F → verify fullscreen enters → press F11 → verify exits correctly.

- [ ] 4. Add Cache-Control for CF deployment
  References: CF Pages static deployment
  Fix: Add `.headers` file for Cloudflare Pages: `/js/* Cache-Control: no-cache`. Or add version hash to all JS URLs.
  Files: D:\Works\stg-game\_headers or Cloudflare Pages config
  QA: Deploy to CF → verify JS files have correct cache headers.

### Wave 1: Multi-Weapon Slot System (P1)
- [ ] 5. Redesign WeaponManager for 6-slot system
  References: weapons.js class WeaponManager
  Fix: Change `currentWeapon` (single) to `weaponSlots: Array(6)`. Add `passiveSlots: Array(6)`. Each slot has: weaponId, level, cooldown timer. All active weapons auto-fire simultaneously with independent cooldowns. Extra/free slots unlockable via level-ups or shop.
  Files: js/weapons.js, js/config.js (add MAX_WEAPON_SLOTS: 6, MAX_PASSIVE_SLOTS: 6)
  QA: Level up 6 times and pick different weapons → verify all 6 fire simultaneously in game.

- [ ] 6. Update SkillManager for weapon slots
  References: skills.js selectWeapon() and getSkillChoices()
  Fix: selectWeapon picks a SLOT instead of replacing current weapon. If a slot is empty, assigns weapon to it. If all slots full, can choose to replace an existing weapon. Weapon upgrade levels are per-weapon (shared across all slots).
  Files: js/skills.js
  QA: Select weapons → verify each occupies a slot → verify upgrades apply to correct weapon.

- [ ] 7. Update HUD for multi-weapon display
  References: ui.js updateWeaponBar(), index.html .hud-weapon-bar CSS
  Fix: Show all 6 weapon slots in a grid at bottom. Active weapons show cooldown overlay. Passive slots shown in a separate row. Selected/active slot highlighted.
  Files: js/ui.js, index.html CSS
  QA: Start game → equip weapons → verify HUD shows all 6 slots with cooldown bars.

- [ ] 8. Add level-up choice for slot expansion
  References: skills.js getSkillChoices(), config.js SKILLS
  Fix: Add special level-up choices: "New Weapon Slot" (if slots available), "New Passive Slot". These appear until all 12 slots are filled.
  Files: js/config.js (add special skill entries), js/skills.js (choice generation)
  QA: Level up → see "New Weapon Slot" option → pick it → verify new empty slot appears in HUD.

### Wave 2: Content Expansion — Factions to 80 (P1)
- [ ] 9. Add 43 new factions to config.js FACTIONS
  References: config.js:108-331 (37 existing factions)
  Fix: Add 43 new factions following existing pattern: id, name, icon, color, description, baseStats. Each faction must be unique with distinct theme. Use existing themes as templates. Ensure no overlapping stat patterns.
  Files: js/config.js
  QA: Load game → verify all 80 factions appear in faction select screen → each has unique icon and color.

- [ ] 10. Add FACTION_SYSTEM entries for 43 new factions
  References: skills.js:12-308 (37 existing entries)
  Fix: Each new faction gets: corePassive, exclusiveSkills (3 IDs), ultimate (legendary passive with visualColor + visualType). Create 3 new skills per faction in config.js SKILLS.
  Files: js/skills.js, js/config.js
  QA: Start game with each new faction → verify core passive applies → verify exclusives appear with 3x weight.

- [ ] 11. Add 43 ship designs for new factions
  References: player.js ShipDesigns (35 existing)
  Fix: Add 43 new drawShip functions following existing Canvas 2D patterns. Each function 25-60 lines, faction-colored, animated.
  Files: js/player.js
  QA: Select each new faction → verify custom ship renders (not fallback triangle).

### Wave 2b: Content Expansion — Weapons to 80 (P1)
- [ ] 12. Add 25 new weapon configs
  References: config.js WEAPONS:936-1154 (55 existing)
  Fix: 25 new weapons with distinct patterns, damage, bullet visuals. Categories: 5 beam, 5 projectile, 5 melee/area, 5 summon, 5 special. Each with unique pattern name, bulletColor, trailColor.
  Files: js/config.js
  QA: Level up and equip each new weapon → verify bullets fire → verify damage applies.

- [ ] 13. Add 25 new BulletPatterns
  References: bullets.js BulletPatterns functions
  Fix: Each new weapon's pattern gets a dedicated function in BulletPatterns. Follow existing patterns as templates. Ensure visual variety.
  Files: js/bullets.js
  QA: Fire each weapon → verify unique bullet visual and behavior.

- [ ] 14. Add 25 weapon switch cases
  References: weapons.js fire() switch
  Fix: Add case statements for all 25 new weapon patterns in weapons.js fire() dispatch.
  Files: js/weapons.js
  QA: Select each new weapon → verify pattern dispatches correctly.

### Wave 2c: Content Expansion — Skills to 500 (P2)
- [ ] 15. Create parameterized skill generation system
  References: config.js SKILLS:338-932 (current ~220 skills)
  Fix: Create a skill template system. Each skill type (damage boost, DOT, shield, etc.) has a template with parameters (value, duration, rarity, cooldown). Generate 280+ skill variants by combining templates with different parameter values. Add as new SKILLS array entries. Use script to generate them rather than manual.
  Files: A script (node generate_skills.js) that outputs config.js SKILLS data, then append to existing array.
  QA: Load game → verify 500+ skills are in the skill pool → verify they appear in level-up choices.

- [ ] 16. Add skill action handlers for new skill types
  References: skills.js _applyEffect switch
  Fix: If any new skill types need action handlers, add them. Most new skills will reuse existing handler patterns (stat boosts, DOT zones, AOEs).
  Files: js/skills.js
  QA: Learn each new skill type in game → verify effects apply.

### Wave 3: Enemy/Boss System Improvements (P1)
- [ ] 17. Implement 360° enemy spawning
  References: enemies.js WaveSpawner getSpawnPositions(), Enemy constructor y:-30
  Fix: Replace fixed top-spawn with circle-spawn: random angle (0-2PI), radius = just outside screen. For bosses, use fixed positions. Add weighted directional bias for more dynamic gameplay.
  Files: js/enemies.js
  QA: Play game → verify enemies come from all sides → verify no side is empty.

- [ ] 18. Improve Boss HP bar
  References: ui.js updateBossHP(), index.html .hud-boss-bar CSS, main.js drawBossHealthBar (canvas fallback)
  Fix: Add multi-segment boss HP bar (phases visible). Add "second health bar" effect for final phase. Add boss name + phase indicator. Ensure bar visible and styled correctly on all device sizes.
  Files: index.html CSS, js/ui.js
  QA: Fight a boss → verify HP bar shows correct segments → verify color changes on phase transition.

- [ ] 19. Add directional weight system for spawn
  References: enemies.js WaveSpawner
  Fix: Weighted spawning based on player velocity direction. If player moves right → more enemies from left. If player stays still → equal 360° distribution.
  Files: js/enemies.js
  QA: Move in one direction → verify more enemies spawn from opposite direction.

### Wave 4: Fullscreen + UI Polish (P1)
- [ ] 20. Force fullscreen on game start
  References: core.js init() or main.js init()
  Fix: On first game load, register a one-time user gesture handler: on first click/touch, call window.toggleFullscreen(). If fails (iOS), apply CSS fallback.
  Files: js/core.js, js/main.js
  QA: Load game → click "开始游戏" → verify fullscreen activates (or iOS CSS overlay shows).

- [ ] 21. Universal canvas sizing (all devices fill screen)
  References: core.js _onResize lines 793-849
  Fix: Ensure canvas fills the FULL viewport on all devices. Use `dvh` units, `viewport-fit=cover`, safe-area-inset padding. For fullscreen mode, canvas covers entire screen. Remove letterbox black bars when in fullscreen mode.
  Files: js/core.js, index.html CSS
  QA: Resize browser to various sizes → verify canvas fills correctly with no black bars.

- [ ] 22. Add level-up auto-select timer
  References: skills.js _showLevelUpChoices(), ui.js showLevelUp()
  Fix: Add 8-second countdown timer displayed on level-up overlay. After 8 seconds, auto-select the first choice. Timer pauses if player hovers over a choice. Visual countdown indicator.
  Files: js/skills.js, js/ui.js, index.html CSS
  QA: Level up → see countdown → wait 8 seconds → verify auto-select fires.

- [ ] 23. UI layout optimization for all screen sizes
  References: index.html CSS (all media queries), ui.js
  Fix: Responsive HUD for mobile/tablet/desktop. Touch-friendly button sizes (min 44px). HP bar, weapon slots, skill bar repositioned for each device type. Safe area handling for notched devices.
  Files: index.html CSS, js/ui.js
  QA: Test on mobile viewport (375x667) → verify HUD readable. Test on tablet (768x1024) → verify layout correct.

### Wave 5: Codex & Collections (P2)
- [ ] 24. Complete Codex with all new content
  References: ui.js showCodex()
  Fix: Update Codex to include all 80 factions, 80 weapons, 500 skills, all enemy types, all bosses. Each entry shows: name, icon, description, stats. Add search/filter functionality.
  Files: js/ui.js
  QA: Open Codex → browse each tab → verify all new content appears with correct data.

- [ ] 25. Add unlock tracking and progress
  References: storage.js, ui.js
  Fix: Track: weapons discovered, factions played, enemies encountered, bosses defeated. Show completion % in Codex. New entries show "???" until discovered.
  Files: js/storage.js (add CodexProgressManager), js/ui.js, js/main.js (event wiring for discovery)
  QA: Play game, encounter new things → verify Codex updates with progress.

- [ ] 26. Add Codex discovery notifications
  References: ui.js showToast()
  Fix: When player first encounters a new enemy, uses a new weapon, or discovers a new boss, show toast notification: "📖 New Codex Entry: XXXX"
  Files: js/main.js (event wiring), js/ui.js
  QA: Kill a new enemy type → verify toast notification shows → verify entry in Codex.

### Wave 6: Balance + QA (P2)
- [ ] 27. Global rebalance pass
  Fix: Review all 80 factions' baseStats for balance. Ensure no faction is OP or UP. Review all 80 weapon damage/fire rates. Review all 500 skill effects. Focus on: VS-like scaling where builds feel powerful.
  Files: js/config.js
  QA: Play 10+ factions → verify each feels viable → verify difficulty is fair.

- [ ] 28. Performance optimization
  Fix: Profile particle system, enemy count limits, bullet limits. Optimize object pool sizes. Reduce draw calls.
  Files: js/config.js (BALANCE limits), js/particles.js, js/core.js
  QA: Play long game (20+ minutes) → verify stable 60fps.

- [ ] 29. Full QA pass
  Fix: Systematically test every faction (80), every weapon (80), every skill type (20+ categories). Test fullscreen on desktop/mobile/iOS. Test 360° spawning. Test multi-weapon slots.
  Files: ALL
  QA: See individual tests above.

## Final verification wave
- [ ] F1. Plan compliance audit: All 29 todos completed per spec
- [ ] F2. Code quality review: No dead code, global leaks, console errors
- [ ] F3. Real manual QA: Full game playthrough with 5+ different builds
- [ ] F4. Scope fidelity: No out-of-scope changes

## Commit strategy
Conventional commits: fix(): for bug fixes, feat(): for new features, refactor(): for restructuring, chore(): for cleanup. One commit per todo.

## Success criteria
1. All 80 factions playable with complete passives/exclusives/ultimates
2. 6 active weapon slots + 6 passive slots all auto-fire simultaneously
3. 500+ skills available through level-up choices
4. 360° enemy spawning works correctly
5. Fullscreen works on desktop, Android PWA, iOS CSS fallback
6. Level-up shows overlay without pause, auto-selects after 8s
7. Codex tracks all content with discovery notifications
8. Game runs at 60fps with 20+ minute sessions
9. No console errors during normal gameplay
