# 飞机大战终极重构计划

## TL;DR

> **Quick Summary**: 在已有代码库基础上，修复核心Bug（升级暂停、流派效果、武器融合），将现有20个流派扩展到35个（新增15个），新增10+武器、30+敌人、10+Boss，优化前期生存体验（默认吸血+高血包掉率），实现手机端触摸跟随模式，所有内容从一开始全部解锁。
> 
> **Deliverables**:
> - 35个流派（现有20个 + 新增15个，每个含被动+3技能+1终极天赋）
> - 25+武器（现有15种 + 新增10种） + 20+融合配方
> - 50+敌人类型（现有20种 + 新增30种） + 15个Boss（现有5个 + 新增10个）
> - 手机端触摸跟随操作 + 响应式适配
> - 前期生存体验优化（默认吸血、高血包掉率）
> - 全内容解锁（无进度门控）
> - Bug全修复（升级暂停、流派效果、武器融合）
> 
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 7 waves
> **Critical Path**: Bug修复 → 流派系统 → 内容扩充 → 移动端 → 性能优化

---

## Context

### Original Request
用户提供了2500条具体优化措施的完整清单，要求：
1. 彻底修复所有Bug
2. 将游戏从单一玩法扩展为内容极其丰富的弹幕射击游戏
3. 多端完美适配（手机/平板/桌面）
4. 所有内容从一开始全部解锁（不搞进度门控）
5. 前期生存体验优化（吸血/血包初期可有）
6. 解压割草为主，适度难度

### Interview Summary
**Key Discussions**:
- 流派数量：全部35个流派都要实现
- 前期生存：默认带吸血被动 + 提高血包掉率（两者都要）
- 手机操作：触摸跟随模式（手指位置=飞机位置，自动射击）
- 执行方式：全量规划一次性执行

**Research Findings**:
- 代码库已有20个流派（attackSpeed, counter, crit, summon, elemental, lifesteal, shield, poison, ice, barrage, gravity, void, thunder, wind, shadow, holy, blood, magnet, mirror, time）
- 15种武器 + 10种融合武器
- 20+种敌人 + 5个Boss
- 数据驱动设计（config.js），添加内容=添加数据
- 对象池系统已实现，粒子系统完善
- 程序化音频（Web Audio API），无外部音频文件
- Service Worker + PWA已配置

### Metis Review
**Identified Gaps** (addressed):
- 代码库实际有20个流派（非10个），需要新增15个达到35个
- 已有流派（poison, ice, barrage, gravity, void等）的技能效果可能未完全实现，需要验证并修复
- 手机端触摸事件需要完整的touch handler
- 前期平衡需要调整XP曲线和难度增长
- 所有内容解锁需要移除StorageManager中的解锁检查

---

## Work Objectives

### Core Objective
将飞机大战从20流派扩展为35流派的完整弹幕射击游戏，修复所有核心Bug，优化多端体验，确保前期可玩性。

### Concrete Deliverables
- `js/config.js`: 新增15个流派配置、10+武器配置、30+敌人配置、10+Boss配置
- `js/skills.js`: 新增15个流派的FACTION_SYSTEM条目（被动+技能+终极）+ 验证/修复现有20个流派的效果
- `js/weapons.js`: 新增武器的射击逻辑 + 融合配方
- `js/enemies.js`: 新增敌人AI模式 + Boss阶段逻辑
- `js/player.js`: 触摸跟随控制 + 默认吸血被动
- `js/main.js`: 升级暂停逻辑修复 + 全内容解锁
- `js/ui.js`: 手机端UI适配
- `js/particles.js`: 新流派特效粒子
- `js/audio.js`: 新音效
- `index.html`: 响应式布局 + 手机端meta标签

### Definition of Done
- [ ] 所有35个流派的被动/技能/终极在游戏中可触发并有视觉效果（20个现有+15个新增）
- [ ] 现有20个流派的效果已验证并修复（如poison, ice等可能已有配置但效果未实现）
- [ ] 升级弹窗出现时游戏完全暂停，选择后1.5秒恢复
- [ ] 武器融合可在两把满级武器+融合核心时触发
- [ ] 手机端触摸跟随模式流畅运行，帧率≥30fps
- [ ] 前5分钟内玩家不会因缺少回复手段而死亡
- [ ] 所有内容从一开始可选，无解锁门控
- [ ] 桌面端WASD+鼠标操作正常

### Must Have
- 35个流派全部实现（20个现有验证+15个新增）
- 现有流派效果验证：确认poison, ice, barrage, gravity, void等已有流派的被动/技能/终极实际生效
- 升级暂停逻辑正确（敌人静止、弹幕冻结、音效降低）
- 前期生存保障（默认吸血+高血包掉率）
- 手机端触摸跟随模式
- 全内容解锁

### Must NOT Have (Guardrails)
- 不要进度解锁系统（不要"通关后解锁新流派"）
- 不要过度复杂的抽象层（保持数据驱动的简洁设计）
- 不要重构未损坏的核心引擎（core.js的ObjectPool、Game类保持不变）
- 不要添加外部依赖（保持纯静态网站）
- 不要过度的localStorage使用（只存排行榜分数）
- 不要web字体（使用系统字体栈）
- 不要在JS中写内联样式（使用CSS类）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NO (no test framework)
- **Framework**: none
- **Agent-Executed QA**: ALWAYS (Playwright for browser, bash for build)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Game Logic**: Use Playwright - open game, trigger scenarios, verify Canvas output
- **Mobile**: Use Playwright with mobile viewport - test touch events
- **Performance**: Use Playwright - measure frame rate, check for leaks

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Bug Fixes + Core Systems):
├── Task 1: 升级暂停逻辑修复 [deep]
├── Task 2: 流派效果事件系统 [deep]
├── Task 3: 武器融合系统修复 [deep]
├── Task 4: 前期生存平衡 + 全内容解锁 [quick]
└── Task 5: 手机端触摸跟随控制系统 [deep]

Wave 2 (Factions Batch 1 - 验证+新增):
├── Task 6: 验证毒/冰 + 实现火/电 [deep]
├── Task 7: 验证吸血/弹幕 + 实现狂怒/幸运 [deep]
└── Task 8: 验证重力/虚空 + 实现音波 [deep]

Wave 3 (Factions Batch 2 - 新增):
├── Task 9: 魔仆+数据 [deep]
├── Task 10: 自然+心灵 [deep]
├── Task 11: 爆破+机械 [deep]
└── Task 12: 符文+星辰+暗金 [deep]

Wave 4 (Factions Batch 3 + Weapons):
├── Task 13: 风暴+灵魂+创世 [deep]
├── Task 14: 科技+混沌 [deep]
├── Task 15: 新增武器10种 [deep]
├── Task 16: 新增融合配方10种 [deep]
├── Task 17: 新增敌人15种 [deep]
└── Task 18: 新增敌人15种+精英词缀 [deep]

Wave 5 (Bosses + Items + Fix):
├── Task 19: 新增Boss 5个 [deep]
├── Task 20: 新增Boss 5个+隐藏Boss [deep]
├── Task 21: 道具系统扩充 [unspecified-high]
├── Task 22: 商店系统 [unspecified-high]
└── Task 23: 验证现有流派效果 [deep]

Wave 6 (Mobile + Performance + UI):
├── Task 24: 手机端UI适配 [visual-engineering]
├── Task 25: 平板端适配 [visual-engineering]
├── Task 26: 桌面端优化 [quick]
├── Task 27: 性能优化 [deep]
└── Task 28: 音效+粒子 [unspecified-high]

Wave 7 (Polish + Final):
├── Task 29: UI界面完善 [visual-engineering]
├── Task 30: 难度调优 [deep]
├── Task 31: PWA完善 [quick]
└── Task 32: 最终集成测试 [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 6 → Task 9 → Task 15 → Task 24 → Task 30 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Wave 4)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | - | 6-8 |
| 2 | - | 6-8 |
| 3 | - | 15-16 |
| 4 | - | 6-8 |
| 5 | - | 24-26 |
| 6-8 | 1,2,4 | 9-12 |
| 9-12 | 1,2,4,6-8 | 13-14 |
| 13-14 | 9-12 | 15-18 |
| 15-16 | 3,13-14 | 30 |
| 17-18 | 13-14 | 19-22 |
| 19-20 | 17-18 | 30 |
| 21-22 | 4,17-18 | 30 |
| 23 | 6-8 | 30 |
| 24-26 | 5 | 29 |
| 27 | - | 29 |
| 28 | 2 | 29 |
| 29 | 24-28 | 30 |
| 30 | 29 | 31 |
| 31 | 30 | 32 |
| 32 | 31 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks → T1 `deep`, T2 `deep`, T3 `deep`, T4 `quick`, T5 `deep`
- **Wave 2**: 3 tasks → all `deep`
- **Wave 3**: 4 tasks → all `deep`
- **Wave 4**: 6 tasks → all `deep`
- **Wave 5**: 5 tasks → T19-20 `deep`, T21-22 `unspecified-high`, T23 `deep`
- **Wave 6**: 5 tasks → T24-25 `visual-engineering`, T26 `quick`, T27 `deep`, T28 `unspecified-high`
- **Wave 7**: 4 tasks → T29 `visual-engineering`, T30 `deep`, T31 `quick`, T32 `deep`
- **FINAL**: 4 tasks → F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

### Wave 1 — Foundation (Bug Fixes + Core Systems)

- [ ] 1. 升级暂停逻辑修复

  **What to do**:
  - 在 `main.js` 中的 `gameLoop` 函数开头添加 `LEVEL_UP_SELECT` 状态判断
  - 当进入升级选择时：暂停所有敌人移动（`enemy.speed = 0`）、暂停弹幕生成（`enemy.fireTimer` 冻结）、暂停粒子更新、暂停背景滚动、背景音乐音量降至30%
  - 创建 `enterLevelUpSelection()` 函数：设置状态、暂停游戏、显示升级弹窗
  - 创建 `exitLevelUpSelection()` 函数：隐藏弹窗、设置 `resumeTimer = 1.5`、恢复音量、播放升级音效
  - 主循环中 `resumeTimer > 0` 时递减计时，期间敌人不移动不攻击
  - 支持 `pendingLevelUps` 计数器，连续升级时依次弹出
  - 升级弹窗键盘快捷键：1/2/3 选择卡片，ESC 不关闭弹窗
  - 防连点逻辑：点击后0.5秒内 `pointer-events: none`

  **Must NOT do**:
  - 不要修改 core.js 的 Game 类
  - 不要改变现有的升级弹窗DOM结构（只修改逻辑）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 涉及游戏状态机、多模块协调、时序控制
  - **Skills**: []
    - 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 6-17 (所有流派任务依赖正确的升级暂停)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `js/main.js:1-50` - 游戏初始化和状态管理结构
  - `js/core.js:57-100` - Game 类的 scene 管理和 isPaused 逻辑

  **API/Type References**:
  - `js/config.js:43-51` - SCENES 定义（需要添加 LEVEL_UP_SELECT）
  - `js/ui.js:70-72` - elLevelUp 和 elSkillChoices DOM 引用

  **WHY Each Reference Matters**:
  - main.js 是升级逻辑的入口，需要在 gameLoop 中插入暂停判断
  - core.js 的 Game 类控制 isPaused 状态，需要理解其工作方式
  - config.js 的 SCENES 需要添加新状态枚举
  - ui.js 的 DOM 引用用于显示/隐藏升级弹窗

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 升级弹窗出现时游戏暂停
    Tool: Playwright
    Preconditions: 游戏运行中，玩家获得足够经验升级
    Steps:
      1. 打开游戏页面 http://localhost:3000
      2. 选择任意流派开始游戏
      3. 击杀敌人获得经验直到触发升级
      4. 观察：所有敌人应静止不动
      5. 观察：已有弹幕应冻结在空中
      6. 观察：背景音乐音量降低
    Expected Result: 升级弹窗显示，游戏世界完全静止
    Evidence: .sisyphus/evidence/task-1-level-up-pause.png

  Scenario: 选择技能后游戏恢复
    Tool: Playwright
    Preconditions: 升级弹窗已显示
    Steps:
      1. 点击第一个技能卡片
      2. 等待1.5秒
      3. 观察：敌人开始移动
      4. 观察：弹幕恢复飞行
      5. 观察：背景音乐音量恢复
    Expected Result: 游戏正常继续，技能已应用
    Evidence: .sisyphus/evidence/task-1-level-up-resume.png

  Scenario: 连续升级时依次弹出
    Tool: Playwright
    Preconditions: 玩家一次获得大量经验
    Steps:
      1. 通过控制台设置 player.xp = 999999
      2. 触发第一次升级
      3. 选择技能后，立即触发第二次升级弹窗
      4. 重复直到所有升级完成
    Expected Result: 每次选择后1.5秒弹出下一个升级弹窗
    Evidence: .sisyphus/evidence/task-1-consecutive-levelup.png
  ```

  **Commit**: YES
  - Message: `fix(core): level-up pause logic with pending support`
  - Files: `js/main.js`, `js/config.js`, `js/ui.js`

- [ ] 2. 流派效果事件系统

  **What to do**:
  - 创建 `EventEmitter` 类（在 core.js 或新文件 event.js 中）
  - 实例化全局 `window.eventBus = new EventEmitter()`
  - 定义事件类型：`bulletHit`, `enemyKilled`, `playerHit`, `itemPickup`, `levelUp`
  - 在子弹碰撞检测处触发 `bulletHit` 事件：`{enemy, bullet, damage, isCrit}`
  - 在敌人血量归零处触发 `enemyKilled` 事件：`{enemy, killer, damageType}`
  - 在玩家受伤处触发 `playerHit` 事件：`{damage, source}`
  - 为现有10个流派的被动/技能注册事件监听器
  - 验证：剧毒流的"毒液渗透"被动在 `bulletHit` 时概率触发中毒
  - 验证：冰冻流的"寒气侵袭"被动在 `bulletHit` 时概率触发减速

  **Must NOT do**:
  - 不要修改子弹碰撞检测的核心逻辑（只在现有位置添加事件触发）
  - 不要创建过度复杂的事件中间件

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 事件系统设计需要理解整个游戏的数据流
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6-17 (所有流派依赖事件系统)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `js/bullets.js:30-65` - Bullet 类的 setup 方法，理解子弹属性
  - `js/enemies.js:12-80` - Enemy 类构造函数，理解敌人属性
  - `js/skills.js:12-44` - FACTION_SYSTEM 结构，理解流派被动定义方式

  **API/Type References**:
  - `js/config.js:53-176` - FACTIONS 配置，理解20个流派的 baseStats
  - `js/items.js:1-30` - 道具系统的事件触发点

  **WHY Each Reference Matters**:
  - bullets.js 的碰撞检测是 `bulletHit` 事件的触发点
  - enemies.js 的死亡判断是 `enemyKilled` 事件的触发点
  - skills.js 的 FACTION_SYSTEM 是流派效果的注册入口
  - config.js 的 FACTIONS 定义了流派的基础属性

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 事件系统基本功能
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 在控制台注册测试监听器：eventBus.on('bulletHit', (data) => console.log('HIT', data))
      2. 开始游戏，射击敌人
      3. 检查控制台输出 "HIT {enemy, bullet, damage, isCrit}"
    Expected Result: 事件正确触发并传递完整数据
    Evidence: .sisyphus/evidence/task-2-event-bus.png

  Scenario: 毒流派被动触发
    Tool: Playwright
    Preconditions: 选择毒流派开始游戏
    Steps:
      1. 射击敌人多次
      2. 观察：敌人身体变为绿色（中毒状态）
      3. 观察：敌人头顶显示绿色伤害飘字
      4. 观察：中毒敌人身上有绿色气泡粒子
    Expected Result: 毒流派被动"毒液渗透"30%概率触发中毒
    Evidence: .sisyphus/evidence/task-2-poison-effect.png

  Scenario: 冰流派减速触发
    Tool: Playwright
    Preconditions: 选择冰流派开始游戏
    Steps:
      1. 射击敌人多次
      2. 观察：敌人身体变为冰蓝色（减速状态）
      3. 观察：敌人移动速度明显降低
      4. 观察：3层减速后敌人冻结1.5秒
    Expected Result: 冰流派被动"寒气侵袭"25%概率触发减速
    Evidence: .sisyphus/evidence/task-2-freeze-effect.png
  ```

  **Commit**: YES
  - Message: `feat(core): event system for faction effects`
  - Files: `js/core.js` 或 `js/events.js`, `js/skills.js`, `js/bullets.js`, `js/enemies.js`

- [ ] 3. 武器融合系统修复

  **What to do**:
  - 在 `weapons.js` 中修复融合条件检查：两把指定武器均满级（5级）+ 持有融合核心
  - 实现融合核心掉落：精英怪15%、Boss 100%、商店150能量币
  - 实现融合动画：两把武器图标碰撞 → 闪光 → 生成超武图标（游戏暂停，动画播放）
  - 融合后释放一个武器槽，玩家可再拾取新武器
  - 超武不可再次融合，但可被"超载核心"提升伤害50%
  - 武器选择升级时，若武器槽已满，弹出替换确认框
  - 主武器和副武器支持切换（按键Q或点击图标）

  **Must NOT do**:
  - 不要修改现有的10种融合配方数据（只修复逻辑）
  - 不要改变武器的射击模式（只修复融合流程）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 融合系统涉及多模块协调（武器、UI、动画、状态）
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 18-19 (新武器和融合配方)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `js/weapons.js:1-50` - WeaponManager 和融合武器注册逻辑
  - `js/config.js:832-900` - FUSION_RECIPES 配置

  **API/Type References**:
  - `js/config.js:656-830` - WEAPONS 配置，理解武器属性结构
  - `js/ui.js:44-46` - elWeaponBar DOM 引用

  **WHY Each Reference Matters**:
  - weapons.js 是融合逻辑的核心实现位置
  - config.js 的 FUSION_RECIPES 定义了融合配方
  - WEAPONS 定义了武器属性，融合后的超武需要遵循相同结构
  - ui.js 的武器栏用于显示融合动画

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 武器融合触发
    Tool: Playwright
    Preconditions: 玩家持有两把满级武器+融合核心
    Steps:
      1. 通过控制台设置：player.weapons = [{id:'normal', level:5}, {id:'laser', level:5}]
      2. 通过控制台设置：player.fusionCore = 1
      3. 触发融合条件
      4. 观察：融合动画播放（两图标碰撞→闪光→超武图标）
      5. 观察：游戏在动画期间暂停
      6. 验证：融合后武器数据正确更新
    Expected Result: 融合成功，超武替换原武器
    Evidence: .sisyphus/evidence/task-3-fusion.png

  Scenario: 武器槽满时替换确认
    Tool: Playwright
    Preconditions: 玩家已有3把武器（满槽）
    Steps:
      1. 拾取新武器
      2. 观察：弹出替换确认框，显示新旧武器对比
      3. 选择替换
      4. 验证：旧武器被移除，新武器已添加
    Expected Result: 替换确认框正确显示和工作
    Evidence: .sisyphus/evidence/task-3-weapon-replace.png
  ```

  **Commit**: YES
  - Message: `fix(weapons): fusion system with core drops and animation`
  - Files: `js/weapons.js`, `js/main.js`, `js/ui.js`

- [ ] 4. 前期生存平衡 + 全内容解锁

  **What to do**:
  - 在 `player.js` 中为所有流派添加默认吸血被动：击杀回复最大生命2%
  - 在 `config.js` 中提高前期血包掉率：前5分钟掉率30%，之后逐渐降至15%
  - 在 `config.js` 中添加低血量怜悯机制：HP<30%时血包掉率+20%
  - 移除 `storage.js` 中的所有解锁检查逻辑
  - 在 `ui.js` 中确保所有流派在角色选择界面默认可选
  - 在 `config.js` 中调整 XP 曲线，前期升级更快（前10级经验需求减半）
  - 添加击杀回血飘字显示（绿色+数字）

  **Must NOT do**:
  - 不要移除 StorageManager 的排行榜功能（只移除解锁检查）
  - 不要改变后期难度曲线（只优化前5分钟）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 主要是配置值调整和简单的逻辑修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks 6-17 (流派需要正确的平衡基础)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `js/player.js:1-30` - Player 类结构，理解 HP 和 heal 方法
  - `js/storage.js:46-80` - StorageManager，理解解锁检查逻辑
  - `js/config.js:14-41` - BALANCE 配置，理解 XP_CURVE 和掉率

  **API/Type References**:
  - `js/config.js:53-120` - FACTIONS 配置，理解流派选择逻辑
  - `js/ui.js:67-70` - 角色选择界面 DOM 引用

  **WHY Each Reference Matters**:
  - player.js 的 heal 方法是吸血效果的实现位置
  - storage.js 的解锁检查需要被移除
  - config.js 的 BALANCE 是平衡调整的核心
  - ui.js 的角色选择界面需要确保所有流派可选

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 默认吸血被动工作
    Tool: Playwright
    Preconditions: 新游戏开始
    Steps:
      1. 选择任意流派开始游戏
      2. 观察：玩家受伤后HP降低
      3. 击杀一个敌人
      4. 观察：HP回复2%（绿色飘字显示）
    Expected Result: 击杀回血2%生效
    Evidence: .sisyphus/evidence/task-4-lifesteal.png

  Scenario: 所有流派默认可选
    Tool: Playwright
    Preconditions: 全新浏览器（无localStorage数据）
    Steps:
      1. 打开游戏
      2. 进入角色选择界面
      3. 验证：所有35个流派都显示为可选状态
      4. 验证：没有"锁定"或"未解锁"标记
    Expected Result: 所有流派从一开始可选
    Evidence: .sisyphus/evidence/task-4-all-unlocked.png

  Scenario: 前期血包掉率提高
    Tool: Playwright
    Preconditions: 游戏开始前5分钟内
    Steps:
      1. 开始游戏
      2. 击杀10个敌人
      3. 统计血包掉落数量
      4. 验证：掉率约为30%（至少掉落3个）
    Expected Result: 前期血包掉率明显高于默认值
    Evidence: .sisyphus/evidence/task-4-health-drops.png
  ```

  **Commit**: YES
  - Message: `balance(early): default lifesteal, high health drops, unlock all`
  - Files: `js/config.js`, `js/player.js`, `js/storage.js`, `js/ui.js`

- [ ] 5. 手机端触摸跟随控制系统

  **What to do**:
  - 在 `player.js` 中添加触摸跟随模式：手指触碰位置即飞机位置（飞机在手指上方50px避免遮挡）
  - 实现自动射击：自动朝最近敌人开火（默认开启）
  - 添加触摸事件处理：`touchstart`, `touchmove`, `touchend`
  - 在 `config.js` 中添加手机端配置：`MOBILE_AUTO_SHOOT: true`, `MOBILE_OFFSET_Y: 50`
  - 在 `index.html` 中添加 viewport meta：`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
  - 添加 `touch-action: manipulation` 到游戏区域
  - 实现设备检测：宽度<768px判定为手机
  - 手机端Canvas缩放：`scale = Math.min(window.innerWidth/720, window.innerHeight/1280)`

  **Must NOT do**:
  - 不要移除桌面端的WASD/鼠标控制（两者共存）
  - 不要添加虚拟摇杆（用户选择了触摸跟随模式）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 触摸控制涉及事件处理、坐标转换、设备检测
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 26-28 (UI适配依赖控制系统)
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `js/player.js:1-50` - Player 类的 update 方法，理解移动逻辑
  - `js/core.js:89-95` - Input state（mouseX, mouseY, isPointerDown）

  **API/Type References**:
  - `js/config.js:14-41` - BALANCE 中的 PLAYER_BASE_SPEED
  - `index.html:1-25` - viewport meta 和 CSS

  **WHY Each Reference Matters**:
  - player.js 的 update 方法需要添加触摸跟随逻辑
  - core.js 的 input state 需要扩展触摸支持
  - config.js 需要添加移动端配置
  - index.html 需要更新 viewport meta

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 触摸跟随模式
    Tool: Playwright (mobile viewport)
    Preconditions: 浏览器设置为移动端视口 (390x844)
    Steps:
      1. 打开游戏
      2. 选择流派开始游戏
      3. 在屏幕底部触摸并移动手指
      4. 观察：飞机跟随手指移动（在手指上方50px）
      5. 观察：飞机自动朝最近敌人射击
    Expected Result: 触摸跟随+自动射击正常工作
    Evidence: .sisyphus/evidence/task-5-touch-follow.png

  Scenario: 桌面端控制不受影响
    Tool: Playwright (desktop viewport)
    Preconditions: 浏览器设置为桌面视口 (1920x1080)
    Steps:
      1. 打开游戏
      2. 使用WASD移动飞机
      3. 使用鼠标瞄准射击
      4. 验证：所有控制正常工作
    Expected Result: 桌面端控制完全不受影响
    Evidence: .sisyphus/evidence/task-5-desktop-controls.png
  ```

  **Commit**: YES
  - Message: `feat(mobile): touch-follow controls with auto-shoot`
  - Files: `js/player.js`, `js/core.js`, `js/config.js`, `index.html`

### Wave 2 — Factions Batch 1 (验证现有+新增：毒、冰、火、电、吸血、弹幕、狂怒、幸运、重力、音波)

> 注意：代码库已有20个流派配置，但部分可能只有配置没有实际效果实现。Wave 2 的任务是：验证现有流派效果是否生效 + 修复未生效的 + 新增缺失的流派。

- [ ] 6. 验证毒/冰流派 + 实现火/电流派

  **What to do**:
  - **毒流派** (faction: `poison`): 已有config.js配置，需要验证skills.js中的被动/技能/终极是否实际生效
    - 验证：中毒状态是否在敌人更新函数中处理
    - 验证：绿色气泡粒子是否正确生成
    - 修复：如果效果未实现，补充实现
  - **冰流派** (faction: `ice`): 已有config.js配置，需要验证减速/冻结效果
    - 验证：3层减速→冻结逻辑是否工作
    - 验证：暴风雪粒子效果
    - 修复：如果效果未实现，补充实现
  - **火流派** (faction: `fire`): 检查是否与现有 `elemental` 流派重复
    - 如果 elemental 已包含火焰效果，合并而非重复创建
    - 如果需要独立火流派，在config.js中添加配置+skills.js中添加效果
  - **闪电流派** (faction: `lightning`): 检查是否与现有 `thunder` 流派重复
    - 如果 thunder 已包含闪电效果，验证并修复
    - 如果需要独立闪电流派，创建新配置

  **Must NOT do**:
  - 不要修改现有的10个流派
  - 不要创建新的粒子系统类（使用现有 ParticleSystem）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要理解完整的流派系统架构，实现复杂的元素效果
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 4

  **References**:
  **Pattern References**:
  - `js/config.js:53-120` - 现有FACTIONS配置结构
  - `js/skills.js:12-44` - 现有FACTION_SYSTEM结构
  - `js/player.js:17-46` - ShipDesigns 飞船设计模式

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: 毒流派完整功能
    Tool: Playwright
    Steps:
      1. 选择毒流派开始游戏
      2. 射击敌人，观察中毒效果（绿色身体+伤害飘字+气泡粒子）
      3. 击杀敌人，观察毒云生成
      4. 升级选择"剧毒弹头"技能，验证子弹变绿色
      5. 使用终极"瘟疫化身"，验证全屏敌人中毒
    Expected Result: 毒流派所有技能正常工作
    Evidence: .sisyphus/evidence/task-6-poison-faction.png

  Scenario: 冰流派完整功能
    Tool: Playwright
    Steps:
      1. 选择冰流派开始游戏
      2. 射击敌人，观察减速效果（冰蓝色+速度降低）
      3. 3层减速后观察冻结效果（蓝色冰块1.5秒）
      4. 升级选择"暴风雪"技能，验证雪花粒子效果
      5. 使用终极"绝对零度"，验证全屏冻结
    Expected Result: 冰流派所有技能正常工作
    Evidence: .sisyphus/evidence/task-6-ice-faction.png
  ```

  **Commit**: YES
  - Message: `feat(factions): implement poison and ice factions`
  - Files: `js/config.js`, `js/skills.js`, `js/player.js`

- [ ] 7. 验证吸血/弹幕流派 + 实现狂怒/幸运流派

  **What to do**:
  - **吸血流派** (faction: `lifesteal`): 已有config.js配置，验证生命偷取效果是否生效
    - 验证：lifesteal 属性是否在伤害计算中应用
    - 修复：如果效果未实现，补充实现
  - **弹幕流派** (faction: `barrage`): 已有config.js配置，验证子弹数增加效果
    - 验证：bulletCount 属性是否正确应用到射击逻辑
    - 修复：如果效果未实现，补充实现
  - **狂怒流派** (faction: `fury`): 新增
    - 配置：`{id:'fury', name:'💢 狂怒流', color:'#ff0044', baseStats:{attackSpeed:0.8, attack:1.3, hp:80, speed:310, lowHpBonus:0.5, rageThreshold:0.3}}`
    - 技能：低血加攻(被动HP<30%攻击+50%)、嗜血冲刺、暴怒连击、破釜沉舟
    - 终极：狂暴之心 - HP降至1，攻击+300%，持续8秒，冷却45秒
  - **幸运流派** (faction: `luck`): 新增
    - 配置：`{id:'luck', name:'🍀 幸运流', color:'#44ff44', baseStats:{attackSpeed:1.0, attack:0.9, hp:100, speed:280, luckBonus:0.2, critRate:0.1, dropRateBonus:0.15}}`
    - 技能：幸运光环(被动提高随机概率)、暴击强化、掉落幸运、随机狂暴
    - 终极：命运之轮 - 随机触发所有元素效果，持续10秒，冷却50秒

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9, 10)
  - **Blocked By**: Tasks 1, 2, 4

  **References**:
  - `js/config.js:53-120` - FACTIONS 结构
  - `js/skills.js:12-44` - FACTION_SYSTEM 结构
  - `js/particles.js:1-50` - Particle 类，理解粒子初始化

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: 火流派燃烧效果
    Tool: Playwright
    Steps:
      1. 选择火流派开始游戏
      2. 射击敌人触发燃烧（橙色身体+火焰粒子）
      3. 击杀燃烧中的敌人，观察烈焰风暴范围爆炸
      4. 使用终极"地狱火"，验证全屏燃烧效果
    Expected Result: 火流派所有技能正常工作
    Evidence: .sisyphus/evidence/task-7-fire-faction.png

  Scenario: 闪电流派连锁效果
    Tool: Playwright
    Steps:
      1. 选择闪电流派开始游戏
      2. 射击敌人触发连锁闪电（跳跃3次）
      3. 观察：被电击敌人抽搐0.3秒
      4. 使用终极"雷神之怒"，验证全屏落雷
    Expected Result: 闪电流派所有技能正常工作
    Evidence: .sisyphus/evidence/task-7-lightning-faction.png
  ```

  **Commit**: YES
  - Message: `feat(factions): implement fire and lightning factions`
  - Files: `js/config.js`, `js/skills.js`, `js/player.js`

- [ ] 8. 验证重力/虚空流派 + 实现音波流派

  **What to do**:
  - **重力流派** (faction: `gravity`): 已有config.js配置，验证减速效果
    - 验证：gravityRadius 和 slowAmount 是否在敌人更新中应用
    - 修复：如果效果未实现，补充实现
  - **虚空流派** (faction: `void`): 已有config.js配置，验证裂隙生成效果
    - 验证：击杀时虚空裂隙是否正确生成
    - 修复：如果效果未实现，补充实现
  - **音波流派** (faction: `sonic`): 新增
    - 配置：`{id:'sonic', name:'🔊 音波流', color:'#ff88ff', baseStats:{attackSpeed:1.0, attack:0.85, hp:100, speed:285, sonicPulseInterval:10, sonicDamage:0.5, sonicRadius:120}}`
    - 技能：音波脉冲(被动每10次攻击释放)、超声波弹、共振增幅、回音壁
    - 终极：次声波 - 全屏音波震荡3秒，每秒80%伤害+眩晕，冷却48秒

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9, 10)
  - **Blocked By**: Tasks 1, 2, 4

  **References**:
  - `js/config.js:53-120` - FACTIONS 结构
  - `js/skills.js:12-44` - FACTION_SYSTEM 结构
  - `js/bullets.js:20-65` - Bullet 类，理解弹幕属性

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: 吸血流派回血效果
    Tool: Playwright
    Steps:
      1. 选择吸血流派开始游戏
      2. 受伤后HP降低
      3. 射击敌人，观察伤害的5%转为回血
      4. 击杀敌人，观察额外2%回血
      5. 满血时继续回血，观察转为护盾
    Expected Result: 吸血流派所有回血机制正常
    Evidence: .sisyphus/evidence/task-8-vampire-faction.png

  Scenario: 弹幕流派子弹扩展
    Tool: Playwright
    Steps:
      1. 选择弹幕流派开始游戏
      2. 初始1颗子弹
      3. 升级选择"弹幕扩展"，验证子弹数+1
      4. 升级选择"扇形阵列"，验证扇形射击
    Expected Result: 弹幕流派子弹数正确增加
    Evidence: .sisyphus/evidence/task-8-barrage-faction.png
  ```

  **Commit**: YES
  - Message: `feat(factions): implement vampire and barrage factions`
  - Files: `js/config.js`, `js/skills.js`, `js/player.js`

### Wave 3 — New Factions Batch 2 (魔仆、数据、自然、心灵、爆破、机械、符文、星辰、暗金)

> 注意：虚空(void)已有配置，需要验证效果是否生效。以下任务只包含真正新增的流派。

- [ ] 9. 魔仆流派 + 数据流派实现

  **What to do**:
  - **魔仆流派** (faction: `minion`): 新增
  - **数据流派** (faction: `data`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3, parallel with Tasks 10-13, blocked by Tasks 1,2,4

  **Commit**: YES - `feat(factions): implement minion and data factions`

- [ ] 10. 自然流派 + 心灵流派实现

  **What to do**:
  - **自然流派** (faction: `nature`): 新增
  - **心灵流派** (faction: `psychic`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3, parallel with Tasks 9,11-13

  **Commit**: YES - `feat(factions): implement nature and psychic factions`

- [ ] 11. 爆破流派 + 机械流派实现

  **What to do**:
  - **爆破流派** (faction: `explosive`): 新增
  - **机械流派** (faction: `mech`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3, parallel with Tasks 9,10,12,13

  **Commit**: YES - `feat(factions): implement explosive and mech factions`

- [ ] 12. 符文流派 + 星辰流派 + 暗金流派实现

  **What to do**:
  - **符文流派** (faction: `rune`): 新增
  - **星辰流派** (faction: `star`): 新增
  - **暗金流派** (faction: `darkGold`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 3, parallel with Tasks 9-12

  **Commit**: YES - `feat(factions): implement rune, star, darkGold factions`

### Wave 4 — New Factions Batch 3 + Weapons

- [ ] 13. 风暴流派 + 灵魂流派 + 创世流派实现

  **What to do**:
  - **风暴流派** (faction: `storm`): 新增
  - **灵魂流派** (faction: `soul`): 新增
  - **创世流派** (faction: `genesis`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 14-18

  **Commit**: YES - `feat(factions): implement storm, soul, genesis factions`

- [ ] 14. 科技流派 + 混沌流派实现

  **What to do**:
  - **科技流派** (faction: `tech`): 新增
  - **混沌流派** (faction: `chaos`): 新增

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 13,15-18

  **Commit**: YES - `feat(factions): implement tech and chaos factions`

- [ ] 15. 新增武器 (10种) + 射击逻辑

  **What to do**:
  - 在 `config.js` WEAPONS 中添加10种新武器
  - 在 `weapons.js` 的 `shoot()` 函数中为每种新武器添加 case

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 13,14,16-18

  **Commit**: YES - `feat(weapons): add 10 new weapon types`

- [ ] 16. 新增融合配方 (10种) + 融合动画

  **What to do**:
  - 在 `config.js` FUSION_RECIPES 中添加10种新融合配方
  - 实现融合动画

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 13-15,17,18

  **Commit**: YES - `feat(weapons): add 10 fusion recipes with animations`

- [ ] 17. 新增敌人 (15种) + AI模式

  **What to do**:
  - 在 `config.js` ENEMIES 中添加15种新敌人
  - 在 `enemies.js` 中为需要新AI的敌人添加逻辑

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 13-16,18

  **Commit**: YES - `feat(enemies): add 15 new enemy types with AI patterns`

- [ ] 18. 新增敌人 (15种) + 精英词缀

  **What to do**:
  - 继续完成15种敌人的配置和AI
  - 实现精英词缀系统

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 4, parallel with Tasks 13-17

  **Commit**: YES - `feat(enemies): elite affix system`

### Wave 5 — Enemies + Bosses + Items

- [ ] 19. 新增Boss (5个) + 多阶段攻击

  **What to do**:
  - 在 `config.js` BOSSES 中添加5个新Boss

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 5, parallel with Tasks 20-23

  **Commit**: YES - `feat(bosses): add 5 new bosses with multi-phase attacks`

- [ ] 20. 新增Boss (5个) + 隐藏Boss

  **What to do**:
  - 添加5个更多Boss + 隐藏Boss

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 5, parallel with Tasks 19,21-23

  **Commit**: YES - `feat(bosses): add 5 more bosses + hidden boss`

- [ ] 21. 道具系统扩充 (20种新道具)

  **What to do**:
  - 在 `config.js` ITEMS 中添加20种新道具

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 5, parallel with Tasks 19,20,22,23

  **Commit**: YES - `feat(items): add 20 new item types`

- [ ] 22. 商店系统 + 经济平衡

  **What to do**:
  - 实现波次间商店系统

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 5, parallel with Tasks 19-21,23

  **Commit**: YES - `feat(shop): implement between-wave shop system`

- [ ] 23. 验证现有流派效果 + 修复未生效的

  **What to do**:
  - 验证现有20个流派的被动/技能/终极是否实际生效
  - 修复未生效的效果（特别是elemental, thunder, wind, shadow, holy, blood, magnet, mirror, time）

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 5, parallel with Tasks 19-22

  **Commit**: YES - `fix(factions): verify and fix existing faction effects`

### Wave 6 — Mobile + Performance + UI

- [ ] 24. 手机端UI布局适配

  **What to do**:
  - 手机端默认竖屏布局，HUD适配

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 6, parallel with Tasks 25-28

  **Commit**: YES - `feat(mobile): responsive HUD layout for phones`

- [ ] 25. 平板端适配

  **What to do**:
  - 平板检测和布局调整

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 6, parallel with Tasks 24,26-28

  **Commit**: YES - `feat(tablet): responsive layout for tablets`

- [ ] 26. 桌面端键盘鼠标优化

  **What to do**:
  - WASD+鼠标控制优化

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 6, parallel with Tasks 24,25,27,28

  **Commit**: YES - `feat(desktop): keyboard/mouse optimization`

- [ ] 27. 性能优化 (对象池+碰撞网格+低性能模式)

  **What to do**:
  - 对象池扩容、碰撞网格优化、低性能模式

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 6, parallel with Tasks 24-26,28

  **Commit**: YES - `perf(core): object pool, collision grid, low-perf mode`

- [ ] 28. 音效扩充 + 粒子特效

  **What to do**:
  - 为新流派/武器/Boss添加音效和粒子特效

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 6, parallel with Tasks 24-27

  **Commit**: YES - `feat(audio): faction ultimates, weapon sounds, boss themes`

### Wave 7 — Polish + Final

- [ ] 29. UI界面完善 (图鉴/设置/结算)

  **What to do**:
  - 图鉴、设置、结算界面

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 7, parallel with Tasks 30-32

  **Commit**: YES - `feat(ui): encyclopedia, settings, settlement screens`

- [ ] 30. 难度曲线调优 + 平衡性测试

  **What to do**:
  - 前期简单、后期有挑战

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 7, parallel with Tasks 29,31,32

  **Commit**: YES - `balance(difficulty): early game easier, late game challenging`

- [ ] 31. PWA完善 + 离线支持

  **What to do**:
  - 更新 sw.js 缓存列表（包含所有新文件）
  - 创建 manifest.json（当前不存在，需新建）：name, short_name, icons, start_url, display: standalone
  - 首次加载提供loading画面
  - 离线运行提示

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Wave 7, parallel with Tasks 29,30,32

  **Commit**: YES - `feat(pwa): complete offline support`

- [ ] 32. 最终集成测试 + Bug修复

  **What to do**:
  - 运行所有QA场景，修复发现的Bug

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 7, parallel with Tasks 29-31

  **Commit**: YES - `fix(final): integration bug fixes`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run linter if available. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(core): level-up pause, faction events, weapon fusion, balance` - config.js, main.js, skills.js, weapons.js, player.js
- **Wave 2-3**: `feat(factions): verify existing + add 15 new factions` - config.js, skills.js, player.js
- **Wave 4**: `feat(content): new weapons, enemies, fusion recipes` - config.js, weapons.js, enemies.js
- **Wave 5**: `feat(bosses): 10 new bosses + items + shop` - config.js, enemies.js, items.js
- **Wave 6**: `feat(mobile): touch controls, responsive UI, performance` - player.js, ui.js, index.html, core.js
- **Wave 7**: `feat(ui): encyclopedia, settings, polish, PWA` - ui.js, index.html, sw.js

---

## Success Criteria

### Verification Commands
```bash
# Open game in browser - should load without errors
# Select any faction - should start game with correct stats
# Level up - should pause game, show skill choices
# Select skill - should resume after 1.5s delay
# Play 5 minutes - should not crash, frame rate stable
# Mobile viewport - touch should move plane, auto-shoot works
```

### Final Checklist
- [ ] All 35 factions selectable and functional
- [ ] Level-up pause works correctly
- [ ] Weapon fusion triggers with correct ingredients
- [ ] Mobile touch-follow mode works
- [ ] Early game survivable (default lifesteal + health drops)
- [ ] All content unlocked from start
- [ ] No console errors during normal gameplay
- [ ] Frame rate ≥30fps on mobile, ≥60fps on desktop
