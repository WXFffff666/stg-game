---
slug: stg-game-optimize
status: approved
intent: clear
review_required: true
pending-action: none
approach: 3-wave plan fixing critical bugs (45+ dead skills, 6 broken factions, 10 fusion weapons, double scaling) then polishing fullscreen/canvas/difficulty, then expanding content and QA validation.
---

# Draft: stg-game-optimize

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| C1-skill-exec | All 67+ active skills produce visible effects | active | skills.js _applyEffect + config.js SKILLS |
| C2-faction-system | All 37 factions have FACTION_SYSTEM entries | active | skills.js FACTION_SYSTEM + config.js FACTIONS |
| C3-weapon-patterns | All fusion weapons fire correctly | active | weapons.js fire() switch + bullets.js BulletPatterns |
| C4-double-scaling | Enemy/Boss HP scales once, not twice | active | enemies.js _spawnGroup + Enemy constructor |
| C5-difficulty-override | WaveSpawner uses game.difficulty, not recalcs | active | enemies.js update() line 4060-4061 |
| C6-conditional-triggers | 5 missing triggers wired to game events | active | skills.js trigger handlers + main.js event wiring |
| C7-ship-designs | 4 missing ship designs added | active | player.js ShipDesigns |
| C8-fullscreen | Unified fullscreen with iOS fallback | active | index.html + core.js + ui.js + manifest.json |
| C9-canvas-scaling | Simplified coordinate chain, single letterbox | active | core.js _onResize + config.js BALANCE |
| C10-enemy-pool | 30+ new enemies added to spawning pool | active | config.js enemyPool + WaveSpawner |
| C11-difficulty-cap | Difficulty bounded with reasonable max | active | main.js _update + config.js BALANCE |
| C12-data-flow | Remove save/load, keep only leaderboard | active | storage.js + main.js startNewGame |
| C13-dead-code | Remove ~1300 lines dead TALENTS + drawBossHealthBar | active | config.js TALENTS + main.js |
| C14-global-qa | Every faction, skill, weapon verified functional | deferred | manual agent-executed QA |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| iOS fullscreen | CSS letterbox fallback + PWA standalone | iOS Safari doesn't support requestFullscreen for non-video | yes |
| Dead TALENTS code | Remove first block, keep second | Second block is what TalentManager actually uses | yes |
| Data caching | Remove StorageManager.saveGame/loadGame, keep LeaderboardManager | User explicitly said "不要采用缓存" | yes |
| Test strategy | Agent-executed QA (in-game verification) | No test framework exists; visual/functional verification via gameplay | yes |

## Findings (cited - path:lines)

### CRITICAL
- C1: 45+ active skills in config.js:782-889 have NO handler in skills.js _applyEffect():1323-1429
- C2: 6 factions (nature/psychic/explosive/mech/tech/chaos) missing from FACTION_SYSTEM skills.js:13-261
- C3: 10 fusion weapons (venomFlame etc.) registered in weapons.js:121-213 have NO BulletPatterns function and NO case in fire() switch
- C4: Double scaling: enemies.js _spawnGroup:4502-4509 (wave scale) + Enemy constructor:29 (diff scale)
- C5: WaveSpawner.update():4060-4061 overrides game.difficulty with base calc, losing phase modifiers from main.js:1130-1154
- C6: 5 triggers (onStealthEnd/onRuneTrigger/onDecoyDestroy/onLethalDamage/onMaxCharge) have NO handler method in skills.js

### HIGH
- 4 ship designs missing: tech/chaos/explosive/mech (player.js ShipDesigns)
- 3 conflicting fullscreen implementations: index.html:1276 vs core.js:905-913 vs ui.js:350-367
- No vendor prefix fallbacks in inline onclick and keyboard fullscreen handler
- manifest.json:7 "orientation":"portrait" conflicts with desktop 16:9 layout
- CSS/JS mobile detection mismatch: index.html:538 media query vs core.js:145 isMobile
- Boss Dragon tail swipe: enemies.js:851-857 never fires (cooldown stuck at 0)
- Enemy spread pattern fires horizontally (enemies.js:1751 passes angle as trailColor to bullets.js:1000)
- 30+ enemy types defined but not in enemyPool (config.js:2425-2447)

### MEDIUM
- ~1300 lines dead TALENTS code (config.js:1243-2591 overwritten by config.js:2593-2758)
- drawBossHealthBar in main.js:132 never called (dead code)
- 7 of 10 movement patterns unused
- 4 of 5 AI behaviors unused
- XP_CURVE flat at level 50+ (config.js:24)
- fusion_voidGravity skill referenced in FUSION_RECIPES but absent from SKILLS

## Decisions (with rationale)
1. **Implement 45+ missing action handlers**: Create generalized visual effect dispatcher that covers common patterns (AOE nova, projectile burst, DOT zone, summon, barrier)
2. **Complete 6 missing FACTION_SYSTEM entries**: Add corePassive + 3 exclusiveSkills + ultimate for each, mirroring existing faction design patterns
3. **Add 10 missing BulletPatterns + switch cases**: Implement each fusion weapon's bullet behavior, add to both bullets.js and weapons.js
4. **Fix double scaling**: Remove wave-based pre-scaling from _spawnGroup and _spawnWaveBoss since Enemy constructor already scales by difficulty
5. **Fix difficulty override**: Change WaveSpawner to use game.difficulty (includes phase modifiers) instead of base recalculation
6. **Unify fullscreen**: Single function in core.js with vendor prefixes, iOS CSS fallback, state sync across all entry points
7. **Simplify canvas**: Remove double letterbox (600x900 within 1280x720 within viewport) - use single game→canvas→viewport chain
8. **Expand enemy pool**: Add all 30+ enemy types with minWave values to enable random spawning
9. **Add difficulty cap**: Cap at 100, with bossHpMultiplier cap at 5x

## Scope IN
- Fix all 43 identified defects across 3 waves
- Implement 45+ active skill visual effects
- Complete 6 missing faction definitions
- Add 10 missing BulletPatterns for fusion weapons
- Unify fullscreen + fix canvas scaling
- Fix difficulty double-scaling + add caps
- Expand enemy pool for 30+ enemy types
- Remove dead code
- Global QA validation
- Extended XP curve for endless play

## Scope OUT (Must NOT have)
- New game modes (multiplayer, special modes)
- New UI framework - keep existing vanilla JS DOM
- New rendering engine - keep Canvas 2D
- Backend/server changes - keep pure static
- New boss types beyond existing 5
- Changing skill rarity weights system
- Changing weapon upgrade multiplier formulas

## Open questions
None - all forks resolved by user instruction or defensible defaults.

## Approval gate
status: approved
review_receipts:
  momus:
    session: ses_0d91e404dffeaRZ4O8yHC0BLKK
    verdict: APPROVE
    notes: "No blocking issues. One minor reference error in Todo 9 (1280x720 referenced in config.js BALANCE, should be core.js). All references verified, all todos complete. Plan is clear and executable."
  oracle:
    session: ses_0d91e2b56ffeHyXJPA0A2vg814
    verdict: CONDITIONAL APPROVE (fixed)
    notes: "3 critical issues identified and fixed: (1) Todo 5 incomplete specification for difficulty variable handling, (2) Todo 9 wrong file/line reference, (3) Todo 9 scope underestimation. 4 warnings addressed. Plan now ready for execution."
  fixes_applied:
    - "Todo 5: Changed acceptance to explicit `const difficulty = game.difficulty;` and remove line 4061"
    - "Todo 9: Fixed reference from config.js BALANCE to core.js lines 798-804, added scope disclaimer"
    - "Todo 9: Added option (b) fallback, noted 6+ files touched"
    - "Todo 3: Clarified that BOTH BulletPatterns + weapons.js switch cases needed"
    - "Todo 13: Fixed implementation location from general constructor to _applyBossPhase"
