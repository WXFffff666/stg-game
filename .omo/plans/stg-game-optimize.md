# stg-game-optimize - Work Plan

## TL;DR (For humans)
This plan fixes a critically broken STG shooting game. The game claims 37 factions, 200+ skills, and 50+ weapons — but in reality, ~67% of active skills do nothing, 6 factions are missing core systems, 10 fusion weapons can't fire, enemies are 3-5x stronger than intended, and fullscreen doesn't work on most devices. After this plan, every faction will be complete and playable, every skill will produce a visible effect, all weapons will fire correctly, difficulty will scale properly for endless play, fullscreen will work across desktop and mobile, and 30+ new enemy types will actually appear in waves.

**What you'll get**: A fully functional game where all 37 factions, 67+ active skills, 50+ weapons, and 40+ enemy types work as intended, with proper fullscreen on all devices, balanced endless difficulty, and cleaned code.

**Effort**: ~10 days (19 todos across 3 waves)

**Risk**: Low — fixes are surgical and data-driven; no architecture changes.

**Decisions to sanity-check**: iOS fullscreen uses CSS fallback (native API not available). Dead TALENTS code (~1300 lines) is removed. StorageManager save/load is removed; only leaderboard persists.

## Scope
Fix all 43 identified defects across faction/skill/weapon/fullscreen/difficulty/enemy systems. Three waves: P0 critical fixes → P1 functional polish → P2 expansion + QA.

**IN**: See draft Scope IN section.
**OUT**: See draft Scope OUT section.

## Verification strategy
Agent-executed QA: after each wave, launch the game in a browser and verify each fixed component. Wave 3 includes comprehensive "play every faction, test every skill, verify every weapon" sweep. Evidence: screenshots/snapshot of working game state.

## Execution strategy
Each todo is atomic (1-3 tool calls). Todos are grouped into 3 waves. Within each wave, todos are ordered by dependency. Wave 1 must complete before Wave 2. Wave 3 is the final polish + QA pass.

## Todos

### Wave 1: Critical Bug Fixes (P0) — Make the game actually work

- [x] 1. skills.js: `_applyEffect` - add 45+ missing action handlers**
  References: skills.js lines 1323-1429 (current switch), config.js lines 782-889 (45+ general active skills)
  Acceptance: Every active skill in config.js SKILLS with `type: 'active'` that has `action:` in its effects has a matching case handler in `_applyEffect()`. Common patterns (AOE nova, projectile burst, DOT zone, summon) are implemented as reusable generalized handlers.
  QA: Select each of the 45+ skills in-game via level-up choices → verify visual effect appears → verify cooldown works → verify damage is applied to enemies.
  Commit: `fix(skills): implement 45+ missing active skill action handlers`

- [x] 2. config.js + skills.js: add 6 missing FACTION_SYSTEM entries
  References: config.js lines 259-326 (nature/psychic/explosive/mech/tech/chaos factions), skills.js lines 13-261 (existing FACTION_SYSTEM entries), skills.js lines 733-754 (nature/psychic skills exist in SKILLS)
  Acceptance: Each of the 6 factions has a complete FACTION_SYSTEM entry with: corePassive (2-3 stat effects), exclusiveSkills (3 skill IDs, each already defined in config.js SKILLS), and ultimate (legendary passive with visualType and description). The `_EXCLUSIVE_TO_FACTION` mapping is updated to include these new exclusive skill IDs.
  QA: Start game with each of the 6 factions → verify core passive is applied (faction-colored burst at start) → level up and verify exclusive skills appear with 3x weight bias → reach level 15+ and verify ultimate unlocks after all 3 exclusives learned.
  Commit: `feat(factions): complete FACTION_SYSTEM entries for nature, psychic, explosive, mech, tech, chaos`

- [x] 3. bullets.js + weapons.js: implement 10 missing BulletPatterns for fusion weapons
  References: weapons.js lines 121-213 (10 registered fusion weapon configs: venomFlame, frostStorm, thunderShock, holyLight, shadowNeedle, electricWave, napalm, photonTracker, scatterSatellite, piercingExplosive), bullets.js lines 1707-2204 (existing pattern implementations as templates)
  Acceptance: Each of the 10 fusion weapons has: a BulletPatterns function in bullets.js matching its pattern name, AND a case in the weapons.js fire() switch statement. Each pattern creates visually distinct bullets (flame/spread for venomFlame, spinning ice for frostStorm, chain+wave for thunderShock, tracking+pierce for holyLight, etc.) with appropriate damage scaling.
  QA: Acquire each fusion weapon (via cheat/test or normal fusion) → equip → verify bullets fire and deal damage to enemies → verify visual effects match weapon description.
  Commit: `feat(weapons): implement 10 missing fusion weapon bullet patterns`

- [x] 4. enemies.js: fix double HP/damage scaling**
  References: enemies.js lines 4502-4509 (_spawnGroup wave-based pre-scaling), enemies.js lines 4433-4444 (_spawnWaveBoss wave-based pre-scaling), enemies.js lines 29-36 (Enemy constructor difficulty-based scaling)
  Acceptance: Remove wave-based pre-scaling from `_spawnGroup` and `_spawnWaveBoss`. Enemy HP and damage scale ONLY through Enemy constructor's difficulty-based formulas. Test: at wave 20 with difficulty ~15, normal enemy HP should be approximately `template.hp * (1+15*0.06)^2` (not double that).
  QA: Play game to wave 20 → compare enemy HP to expected values → verify enemies are killable at normal pace → verify boss HP is reasonable (not 3-5x overtuned).
  Commit: `fix(enemies): remove double HP/damage scaling (wave-based pre-scale conflicts with difficulty-based scale)`

- [x] 5. enemies.js: fix WaveSpawner difficulty override
  References: enemies.js lines 4060-4061 (current base recalculation), main.js lines 1130-1154 (phase-modified difficulty from game loop)
  Acceptance: Change WaveSpawner.update() line 4060 to `const difficulty = game.difficulty;` and remove line 4061 (`game.difficulty = difficulty;`). This reads the phase-modified difficulty from main.js instead of recalculating base difficulty. Phase modifiers (early -1, late +lateBonus) are preserved.
  QA: Play early game (< 5 minutes) → verify game.difficulty reflects early phase (-1). Play late game (> 15 minutes) → verify game.difficulty includes lateBonus.
  Commit: `fix(enemies): use game.difficulty instead of recalculating in WaveSpawner`

- [x] 6. — config.js + skills.js: implement 5 missing conditional triggers**
  References: skills.js lines 1187-1228 (existing trigger handlers: onKill, onHit, onDodge, onCrit, onPickup, onKillFrozen), config.js skills with triggers: sd_ambush:653 (onStealthEnd), rn_chain:761 (onRuneTrigger), mr_shatter:705 (onDecoyDestroy), tm_rewind:713 (onLethalDamage), st_burst:768-769 (onMaxCharge)
  Acceptance: Each trigger has a handler method in skills.js (`onStealthEnd()`, `onRuneTrigger()`, `onDecoyDestroy()`, `onLethalDamage()`, `onMaxCharge()`). These handlers scan learned conditional skills and apply effects. Wiring: `onStealthEnd` fires when player exits shadow stealth; `onRuneTrigger` fires when rune effect procs; `onDecoyDestroy` fires when mirror decoy is destroyed; `onLethalDamage` fires before player would die (triggers tm_rewind); `onMaxCharge` fires when star faction charge reaches max.
  QA: Play as shadow faction → trigger stealth → verify sd_ambush applies damage boost on exit. Play as mirror → decoys destroyed → verify mr_shatter explosion. Play as time → take lethal damage → verify tm_rewind heals instead of death.
  Commit: `feat(skills): implement 5 missing conditional trigger handlers`

- [x] 7. — player.js: add 4 missing ship designs**
  References: player.js ShipDesigns lines 17-1282 (33 existing designs), config.js factions missing designs: explosive:272, mech:278, tech:320, chaos:326
  Acceptance: Four new drawShip functions: `explosive` (bomb-shaped hull with fuse spark), `mech` (robotic angular shape with gear details), `tech` (circuit-board pattern with data streams), `chaos` (shifting geometric shape with random color flashes). Each follows existing ShipDesigns patterns (~30-60 lines, faction-colored, animated).
  QA: Select each faction → start game → verify custom ship shape renders (not fallback triangle).
  Commit: `feat(ships): add ship designs for explosive, mech, tech, chaos factions`

### Wave 2: Functional Polish (P1) — Make the game play well

- [x] 8. — core.js + index.html + ui.js: unify fullscreen implementation**
  References: index.html:1276 (inline onclick), core.js:905-913 (F/F11 key handler), ui.js:350-367 (settings toggle), EXT-1 research (Fullscreen API best practices)
  Acceptance: Single function `toggleFullscreen()` in core.js with: vendor prefix fallbacks (webkitRequestFullscreen, mozRequestFullScreen, msRequestFullscreen), Promise catch, navigationUI:'hide' option. All 3 entry points call this single function. Settings checkbox syncs via fullscreenchange event. On iOS, show CSS overlay with close button instead of failing silently. `document.fullscreenEnabled` check before requesting.
  QA: Desktop: click fs-toggle → verify fullscreen enters → press F to exit → verify settings checkbox updates. Mobile PWA: verify CSS fullscreen fallback works (overlay covers screen, close button visible). iPad: verify fullscreen works via native API.
  Commit: `fix(fullscreen): unify three fullscreen implementations with vendor prefixes and iOS fallback`

- [x] 9. — core.js + config.js: simplify canvas coordinate chain**
  References: core.js _onResize lines 793-848 (current double letterbox), config.js BALANCE lines 15-16 (600x900 design resolution), core.js lines 798-804 (1280x720 or 720x1280 canvas resolution)
  Acceptance: Unify game coordinate space with canvas coordinate space. Option (a) recommended: change `CANVAS_WIDTH: 1280, CANVAS_HEIGHT: 720` in config.js BALANCE, remove gameScale/gameOffsetX/Y from core.js. Update entity bounds/positions in player.js, enemies.js (AI patterns using CANVAS_WIDTH/HEIGHT), bullets.js (lifetime bounds), items.js (spawn bounds), and particles.js to use new resolution. Option (b) fallback if scope too large: change canvas resolution to 800x1200 (matching game 2:3 aspect) instead. Player/enemy start positions adjusted proportionally. NOTE: This is a multi-file refactor; estimate 6+ files touched.
  QA: Resize browser window → verify canvas fills viewport with proper letterbox → verify game area is centered → verify mouse/touch coordinates map correctly to game entities → verify no black bars within black bars.
  Commit: `refactor(canvas): unify game and canvas coordinate spaces, remove double letterbox`

- [x] 10. — manifest.json + index.html: fix orientation and display settings**
  References: manifest.json:6-7 (standalone + portrait), EXT-1 research (PWA fullscreen best practices), index.html meta viewport line 5
  Acceptance: manifest.json: `"display": "fullscreen"`, `"display_override": ["fullscreen", "standalone"]`, `"orientation": "any"`. Add runtime orientation lock via Screen Orientation API in core.js (attempt landscape lock, fall back silently). CSS: add `@media (display-mode: fullscreen) { ... }` for fullscreen-specific styling.
  QA: Install as PWA on Android → verify app launches in fullscreen without browser chrome. On iOS → verify standalone mode with status bar. On desktop → verify no forced portrait rotation.
  Commit: `fix(manifest): update PWA display/orientation settings for cross-device fullscreen`

- [x] 11. — index.html + core.js: fix CSS/JS mobile detection consistency**
  References: index.html:538 (media query: max-width:480px or max-height:900px+portrait), core.js:145 (isMobile: window.innerWidth < 768)
  Acceptance: Unify mobile detection to use feature-based detection: `navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches`. Replace `window.innerWidth < 768` in core.js. CSS: Rely on canvas sizing logic (already handles portrait/landscape correctly via letterbox) instead of separate mobile breakpoint for layout. Remove the `max-height:900px` portrait condition to prevent false desktop triggers.
  QA: iPhone SE landscape (667x375) → verify touch HUD layout applies → verify canvas fills correctly. iPad portrait (768x1024) → verify touch controls work → verify canvas aspect is correct. Desktop → verify mouse controls.
  Commit: `fix(responsive): unify mobile detection to feature-based, fix landscape phone mismatch`

- [x] 12. — enemies.js: fix enemy spread pattern fire direction**
  References: enemies.js _fire():1751 (spread pattern call), bullets.js spread:1000 (signature: x,y,count,spreadAngle,speed,damage,color,trailColor - no direction param)
  Acceptance: Either add a direction-aware `spreadAimed` function to BulletPatterns that accepts a base angle and spreads around it, or switch enemy spread pattern to use `aimed` with spreadAngle. The spreadAimed approach is cleaner: create function `spreadAimed(x, y, count, spreadAngle, speed, damage, baseAngle, color, trailColor)` that fires count bullets spread around baseAngle.
  QA: Play game, encounter enemies firing spread pattern → verify bullets fan toward player position → verify not firing horizontally.
  Commit: `fix(enemies): fix spread pattern to fire toward player instead of horizontally`

- [x] 13. — enemies.js: fix Boss Dragon tail swipe never firing**
  References: enemies.js line 142 (tailSwipeCooldown: 0), enemies.js lines 851-857 (tailswipe check requires cooldown > 0), enemies.js _tailSwipe:1681-1692 (actual tailswipe implementation)
  Acceptance: Set `tailSwipeCooldown = 3000` in `_applyBossPhase()` when bossPhase >= 1 for the boss_dragon type (NOT in the general Enemy constructor line 142 which applies to all enemies). Enable `_tailSwipe()` to fire correctly during Phase 2+ of boss_dragon fights.
  QA: Play to wave 20 (boss_dragon) → damage boss below 50% HP (phase 2) → verify tail swipe attack fires (circular bullet burst) → verify cooldown between swipes is ~3 seconds.
  Commit: `fix(enemies): enable Boss Dragon tail swipe by setting positive cooldown`

### Wave 3: Expansion + QA (P2) — Polish and verify everything

- [x] 14. — config.js: expand enemyPool with 30+ new enemy types**
  References: config.js lines 2425-2447 (current enemyPool with 14 entries), config.js lines 1895-2358 (30+ enemy template definitions NOT in pool)
  Acceptance: Add all existing enemy types to enemyPool with appropriate minWave values: swarmer(minWave:8), fireElement(6), iceElement(6), thunderElement(8), poisonElement(6), berserker(12), guardian(10), healer(8), summoner(10), invisible(12), splitMaster(14), parasite(10), devourer(15), marksman(12), turret(10), missileCar(14), laserTower(12), flyingSwarm(8), bat(6), ghost(14), dragon(20), titan(18), colossus(16), fortress(15), hive(13), phantom(16), mirror(14), magnet(12), time(16), voidEnemy(18), chaos(17). Each with weight based on danger level (weaker enemies higher weight, stronger enemies lower weight).
  QA: Play game to wave 15+ → verify new enemy types are appearing in waves → verify each enemy type uses correct AI and visual → verify spawn rates are reasonable.
  Commit: `feat(enemies): expand enemyPool to include 30+ new enemy types with wave-gated spawns`

- [x] 15. — config.js + main.js: remove dead code**
  References: config.js lines 1243-2591 (first TALENTS block overwritten by lines 2593-2758), main.js lines 132-166 (drawBossHealthBar - dead canvas function)
  Acceptance: Remove first TALENTS block (lines 1243-2591, ~1300 lines). Remove drawBossHealthBar function from main.js. Verify TalentManager still functions correctly with remaining TALENTS definition. Verify boss HP bar still renders via DOM (#boss-bar).
  QA: Start game → verify talent tree screen shows talent options correctly → verify talent selection works → verify boss HP bar appears during boss fights → verify no JavaScript errors in console.
  Commit: `chore: remove dead code (~1300 lines duplicated TALENTS + drawBossHealthBar)`

- [x] 16. — config.js + main.js: add difficulty cap and extend XP curve**
  References: config.js BALANCE lines 26-31 (difficulty params), main.js lines 1130-1154 (difficulty calc), main.js line 1160 (bossHpMultiplier), config.js lines 22-24 (XP_CURVE, 50 entries)
  Acceptance: Add `MAX_DIFFICULTY: 100` and `MAX_BOSS_HP_MULTIPLIER: 5.0` to config.js BALANCE. Apply caps in main.js: `game.difficulty = Math.min(difficulty, cfg.BALANCE.MAX_DIFFICULTY)` and `game.bossHpMultiplier = Math.min(bossHpMultiplier, cfg.BALANCE.MAX_BOSS_HP_MULTIPLIER)`. Extend XP_CURVE: add 50 more entries with diminishing growth (e.g., last entry = 10,000,000 at level 100). XP_CURVE getter returns last entry for any level beyond curve length.
  QA: Play very long game (~30+ minutes) → verify difficulty doesn't exceed 100 → verify boss HP doesn't exceed 5x → verify leveling continues past level 50.
  Commit: `fix(balance): add difficulty/boss caps, extend XP curve for endless play`

- [x] 17. — storage.js + main.js: remove game save/load, keep leaderboard only**
  References: storage.js StorageManager (saveGame/loadGame/clearSave/hasSave), main.js startNewGame (currently unsaved), LeaderboardManager (keep)
  Acceptance: Remove or disable StorageManager.saveGame() and loadGame() — no game state is persisted between sessions. Keep LeaderboardManager (saveScore/getLeaderboard), UpgradeManager (for permanent meta-upgrades), SettingsManager (volume/quality settings), AchievementManager, UnlockManager, StatsManager. The `checkReturnGuide()` in main.js is updated to only read lastActive timestamp, not game save.
  QA: Play game → die → restart from menu → verify no "continue" option appears → verify leaderboard scores persist → verify settings persist → verify meta upgrades persist.
  Commit: `fix(storage): remove game save/load, keep only leaderboard and settings`

- [x] 18. — config.js: add fusion_voidGravity skill definition**
  References: config.js FUSION_RECIPES skills line 1232 (references fusion_voidGravity but skill doesn't exist in SKILLS)
  Acceptance: Add `fusion_voidGravity` skill to config.js SKILLS array: `{ id: 'fusion_voidGravity', name: '虚空引力', faction: 'any', type: 'active', rarity: 'legendary', fused: true, cooldown: 25000, effects: [{ action: 'voidGravity', damage: 25, duration: 5000, radius: 250, pullForce: 150, executeThreshold: 0.2 }] }`. Add corresponding action handler in skills.js _applyEffect().
  QA: Craft fusion_voidGravity via fusion (gv_singularity + vd_voidRift) → verify skill appears in learned skills → verify skill activates on cooldown → verify visual effect (dark vortex that pulls and damages enemies).
  Commit: `fix(skills): add missing fusion_voidGravity skill definition`

- [x] 19. — Global QA: verify every faction, skill, and weapon**
  References: ALL files in js/
  Acceptance: Manual/agent QA pass. For each of the 37 factions: start a game → verify ship renders → verify core passive applies → level up multiple times → verify 3+ exclusive skills appear and work → verify ultimate unlocks after exclusives learned. For each weapon (20 base + 10 special + all fusion): equip → verify bullets fire with correct pattern/visual → verify damage. Sample test: factions (attackSpeed, elemental, time, void, blood, chaos), weapons (normal, homing, laser, arc, orbital, flame, missile), skills (meteorShower, frostNova, lightningDash, doom).
  QA: Run each test case → verify no JavaScript errors in console → verify visual effects render → verify damage numbers appear → verify HUD updates correctly.
  Commit: `test(qa): comprehensive global QA pass verifying all factions, skills, and weapons`

## Final verification wave

- [x] F1. Plan compliance audit: Verify all 19 todos are completed, each with correct file modifications matching plan specifications.
- [x] F2. Code quality review: Check all modified files for: no new dead code, no console errors, proper event listener cleanup, no variable leaks.
- [x] F3. Real manual QA: Launch game, play through all 3 game phases (menu→faction select→gameplay→level up→game over), test 5+ different factions, verify fullscreen toggle, verify boss fight, verify wave progression.
- [x] F4. Scope fidelity: Confirm no out-of-scope changes (no new game modes, no UI framework changes, no backend changes).

## Commit strategy
One commit per todo, using conventional commit format:
- `fix(<area>): <description>` for bug fixes
- `feat(<area>): <description>` for new features
- `refactor(<area>): <description>` for code restructuring
- `chore: <description>` for cleanup/dead code removal
- `test(qa): <description>` for QA verification

Branch: `stg-optimize` from `master`. Merge via PR after Wave 3 QA passes.

## Success criteria
1. All 37 factions are playable with complete passive/exclusive/ultimate systems ✓
2. All 67+ active skills produce visible effects (no silent failures) ✓
3. All 50+ weapons fire correctly with proper bullet patterns ✓
4. Fullscreen works on desktop (standard API), Android (PWA fullscreen), iOS (CSS fallback) ✓
5. Difficulty scales monotonically with caps preventing impossible gameplay ✓
6. Endless waves continue indefinitely with 40+ enemy types appearing randomly ✓
7. Boss HP bar visible with correct percentage display ✓
8. No game save data persisted between sessions (leaderboard only) ✓
9. No JavaScript errors in console during normal gameplay ✓
10. Game runs at 60 FPS with no performance regressions ✓
