---
slug: stg-massive-expansion
status: drafting
intent: clear
review_required: false
pending-action: write .omo/plans/stg-massive-expansion.md
approach: 6-wave plan: Bug fixes → Multi-weapon architecture → Content expansion (80factions/80weapons/500skills) → Enemy/Boss AI → Fullscreen/UI polish → Codex + QA
---

# Draft: stg-massive-expansion

## Components (topology ledger)
| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| C0-bugs | Level-up pause fixed, fullscreen works on all devices | active | core.js, skills.js, index.html |
| C1-multi-weapon | 6 weapon slots + auto-fire + passive slots | active | weapons.js, main.js, ui.js, skills.js |
| C2-content | 80 factions/80 weapons/500 skills fully playable | active | config.js, skills.js, weapons.js, bullets.js |
| C3-enemies | 360° spawning, richer boss fights | active | enemies.js |
| C4-fullscreen | Force fullscreen on start, iOS fallback, all devices | active | core.js, manifest.json, index.html |
| C5-codex | Complete Codex with all content + unlock tracking | active | ui.js, storage.js, config.js |

## Decisions (with rationale)
1. **Level-up**: Remove game.pause(), add 8s auto-select timer — VS-like seamless experience
2. **Multi-weapon**: 6 active weapon slots + 6 passive slots, all weapons auto-fire simultaneously with individual cooldowns. Weapons assigned to slots on level-up. HUD shows all slots.
3. **Fullscreen**: On first user gesture → requestFullscreen(). On iOS (no API) → CSS visualViewport workaround with .fs-ios-fallback
4. **Content**: Manual for core 80 factions/weapons, parameterized for skill variants to reach 500
5. **Enemy spawning**: 360° circle spawn around screen edge, bosses from fixed positions
6. **Spawning**: Circle spawn around player outside screen edge, weighted by player direction
