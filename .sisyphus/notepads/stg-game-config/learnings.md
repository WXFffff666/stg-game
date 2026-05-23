
## config.js Data Structures (2026-05-23)
- File grew from 1376 to 1840 lines after adding 8 new data structures
- Edit tool works best with smaller chunks - large single edits can fail silently
- TALENTS structure: nested branches > layers > options, 87 entries total (5 branches x 5 layers x 3-4 options)
- All descriptions use specific numbers, no vague words
- Pattern: id, name, icon, description, effects array with stat/op/value
- node --check is the standard syntax validator for JS files
- Committed as 7228e0e, pushed to master

## Weapon System Enhancement (2026-05-23)
- All 20 base weapons + 5 fusion weapons already defined in config.js WEAPONS
- weapons.js fire() switch dispatches to BulletPatterns for all 25 weapon types
- bullets.js BulletPatterns has 24 pattern functions (20 base + 4 fusion) + 3 enemy patterns
- Enhancement: Bullet.draw() now renders unique visuals per weapon type:
  - Shuriken: spinning star shape (4-pointed)
  - Flame: flickering 3-layer fireball (orange/yellow/white)
  - Ice shard: diamond crystal shape with inner shine
  - Lightning bolt: electric glow with random spark particles
  - Photon beam: wide glowing rectangle
  - Void rift: dark pulsing vortex with concentric rings
  - Gravity well: animated gravitational rings
  - Explosive: pulsing bomb with fuse spark
  - Missile: elongated body with nose cone and exhaust
  - Homing: glowing tracker with outer halo
  - Boomerang: spinning V-shape
  - Laser: thin elongated beam
  - Needle: tiny dart shape
  - Pierce: elongated bolt shape
  - Wave: oscillating glow pulse
- Enhancement: onHit() now applies status effects:
  - Ice shard: applies _slowMult and _slowTimer to target
  - Flame: applies _burnDamage, _burnTimer, _burnTick to target
  - Lightning bolt: chains to nearby enemies via _doChainLightning()
- Note: Enemy-side debuff processing (_slowTimer, _burnTimer) not yet in enemies.js
