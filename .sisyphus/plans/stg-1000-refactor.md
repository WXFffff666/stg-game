# 星域战机终极全盘重构 (1000点硬核优化)

## TL;DR

> **Quick Summary**: 对星域战机STG游戏进行1000点硬核优化，基于《吸血鬼幸存者》《弹壳特攻队》《NIMRODS》《球比伦战纪》《东方Project》等标杆产品设计理念。覆盖游戏流程、流派系统、武器系统、技能系统、天赋系统、敌人Boss、道具经济、UI适配、音效、特效、性能优化等12大系统。
> 
> **Deliverables**:
> - 完整的游戏流程：开场→流派选择→难度选择→倒计时→游戏→结算→再来一局
> - 20个流派全部实现（核心被动+3专属技能+终极天赋）
> - 20种武器全部实现+15种融合配方+超武系统
> - 30种主动技能+25种被动技能+技能融合系统
> - 5层天赋树（攻击/防御/功能/元素/终极）
> - 40种敌人+15种精英词缀+5个Boss+Boss Rush
> - 20种道具+局内商店+能量币经济
> - 完整UI：主菜单/流派选择/图鉴/设置/暂停/结算/HUD
> - 音效系统+背景音乐+Boss战BGM
> - 视觉特效：粒子系统/元素特效/屏幕震动/伤害数字
> - 性能优化：对象池/空间网格/Canvas分层/Service Worker
> 
> **Estimated Effort**: XXXL (超大型 - 1000+优化点)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Wave 1 (Foundation) → Wave 2 (Combat) → Wave 3 (Content) → Wave 4 (Audio/Visual) → Wave 5 (Integration/Test)

---

## Context

### Original Request
用户提供了1000条详细的优化指令，覆盖游戏的每一个角落。参考了《吸血鬼幸存者》《弹壳特攻队》《NIMRODS: 枪匠幸存者》《球比伦战纪》《东方Project》等同类优秀产品。所有优化点均来自对标杆产品的深度分析提炼。

### Interview Summary
**Key Discussions**:
- 技术栈: 纯Vanilla JS + Canvas 2D + Web Audio API，可引入Howler.js等轻量库
- 部署: Cloudflare Pages纯静态部署
- 测试: Playwright自动化 + DevTools手动验证
- 数据: localStorage持久化，无后端

**Research Findings**:
- config.js: 数据驱动设计，已定义20流派/200技能/20武器/40道具/16敌人/4Boss
- core.js: 游戏引擎（循环/对象池/Canvas/场景/碰撞）476行
- player.js: 20种飞船设计，HP/护盾系统1056行
- bullets.js: 子弹实体+弹道生成器1165行
- enemies.js: 敌人AI+波次生成+BOSS 3243行
- skills.js: XP升级+技能选择+融合状态2105行
- weapons.js: 武器管理器679行
- items.js: 道具掉落+Buff/Debuff系统828行
- particles.js: 粒子特效系统1038行
- ui.js: UI管理器892行
- audio.js: 程序化音效350行
- storage.js: localStorage存档+排行榜448行
- main.js: 集成入口1059行

**已知Bug（用户明确反馈）**:
- 暴风雪技能没效果
- 剧毒技能没效果
- Boss血条不横贯屏幕
- 击杀回血Bug（子弹蹭到未死亡敌人就回血）
- 武器融合系统"完全没做"
- 电脑端不能全屏

### Metis Review
**Identified Gaps** (addressed):
- 1000点范围极大 → 分为5个执行波次，每波8个并行任务
- 许多功能"定义但未连接" → 逐一验证并修复
- 缺少性能基准 → 添加帧率和加载时间要求
- 测试清单过于笼统 → 每个任务添加具体QA场景

---

## Work Objectives

### Core Objective
将星域战机从"定义了但没连接"的状态，转变为"所有1000点优化全部落地"的完整游戏。逐条对照1000点优化指令，一条一条实现并验证。

### Concrete Deliverables
- 游戏流程: Logo动画→主菜单→流派选择→难度选择→倒计时→游戏→结算→再来一局
- 流派系统: 20个流派（8免费+12解锁），每个有核心被动+3技能+终极天赋
- 武器系统: 20种武器全部实现，15种融合配方，超武系统
- 技能系统: 30种主动+25种被动，技能融合，技能与流派协同
- 天赋系统: 5层天赋树，5个分支，每局5天赋点
- 敌人系统: 40种敌人，15种精英词缀，5个Boss，Boss Rush
- 道具系统: 20种道具，加权随机掉落，光柱标识
- 经济系统: 局内商店，能量币货币，经济曲线
- UI系统: 主菜单/流派选择/图鉴/设置/暂停/结算/HUD
- 音效系统: Howler.js管理，5层音效，Boss战BGM
- 特效系统: 粒子对象池，元素特效，屏幕震动
- 性能优化: 对象池/空间网格/Canvas分层/Service Worker

### Definition of Done
- [ ] 所有1000点优化逐条实现并验证
- [ ] Playwright自动化测试通过
- [ ] 帧率 ≥55fps (iPhone SE前期), ≥30fps (50波+后期)
- [ ] 桌面端全程 ≥60fps
- [ ] 首屏加载 <3秒
- [ ] 纯静态部署到Cloudflare Pages

### Must Have
- 暴风雪技能必须能看到范围减速效果和冰霜特效【用户反馈：暴风雪没效果】
- 剧毒技能必须能看到敌人绿光和持续掉血数字【用户反馈：剧毒没效果】
- Boss长血条正确横贯屏幕顶部，显示名字和百分比
- Boss击杀后15秒缓冲期，Boss不会连轴出现
- 击杀回血Bug已修复（子弹蹭到未死亡敌人不回血）
- 武器融合系统必须实现（15种超武配方）
- 全屏适配必须完成（16:9 letterbox模式）
- 手机竖屏UI完整可用

### Must NOT Have (Guardrails)
- ❌ 不做局外永久升级（用户明确说"纯静态局内成长版"）
- ❌ 不做后端服务（纯静态限制）
- ❌ 不做多人联机
- ❌ 不做构建工具（保持原生HTML/CSS/JS）
- ❌ 不过度抽象（保持数据驱动设计，config.js定义所有内容）
- ❌ 不使用"大量""少许""一定概率"等模糊词汇（用户明确要求具体数值）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (需要设置)
- **Automated tests**: Tests-after (实现后测试)
- **Framework**: Playwright MCP (浏览器自动化)
- **Setup**: 在Wave 1中包含测试基础设施

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright - Navigate, interact, assert DOM, screenshot
- **Game Logic**: Use Bash (curl to start server) + Playwright - Open game, play, verify
- **Performance**: Use Playwright - Measure FPS via requestAnimationFrame timing

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - 8 tasks, ALL parallel):
├── T1:  Game Flow & Scene System [quick]
├── T2:  Config Architecture & Data Expansion [deep]
├── T3:  Player & Character System [unspecified-high]
├── T4:  HUD & In-Game UI Foundation [visual-engineering]
├── T5:  localStorage & Persistence [quick]
├── T6:  Performance Foundation (Object Pools) [deep]
├── T7:  Error Handling & Loading Screen [quick]
└── T8:  Canvas Layer System & Responsive Layout [visual-engineering]

Wave 2 (Combat Systems - 8 tasks, ALL parallel):
├── T9:  Weapon System (20 weapons) [deep]
├── T10: Faction System (20 factions) [deep]
├── T11: Skill System (30 active + 25 passive) [deep]
├── T12: Talent System (5 branches) [unspecified-high]
├── T13: Weapon Fusion System (15 recipes) [deep]
├── T14: Skill Fusion & Synergy System [unspecified-high]
├── T15: Element Reaction System [unspecified-high]
└── T16: Enemy AI & Movement Patterns [deep]

Wave 3 (Content & Polish - 8 tasks, ALL parallel):
├── T17: Enemy Types (40 types) [deep]
├── T18: Boss System (5 bosses + Boss Rush) [deep]
├── T19: Elite Enemies & Affixes [unspecified-high]
├── T20: Item System (20 items) [unspecified-high]
├── T21: Shop & Economy System [unspecified-high]
├── T22: Menu Screens (Main/Select/Collection) [visual-engineering]
├── T23: Wave System & Spawning Logic [deep]
└── T24: Tutorial & New Player Guide [quick]

Wave 4 (Audio & Visual - 6 tasks, ALL parallel):
├── T25: Audio System (Howler.js + Procedural) [unspecified-high]
├── T26: Particle System & Effects [deep]
├── T27: Element Visual Effects [visual-engineering]
├── T28: Screen Shake & Damage Numbers [quick]
├── T29: Performance Optimization (Canvas Layers) [deep]
└── T30: Service Worker & Offline Support [quick]

Wave 5 (Integration & Testing - 4 tasks):
├── T31: System Integration & Bug Fixes [deep]
├── T32: Full Verification Checklist [unspecified-high]
├── T33: Mobile Performance Optimization [deep]
└── T34: Cloudflare Pages Deployment [quick]

Wave FINAL (4 parallel reviews):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Real Manual QA (unspecified-high)
└── F4: Scope Fidelity Check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T9 → T13 → T17 → T23 → T31 → F1-F4 → user okay
Parallel Speedup: ~80% faster than sequential
Max Concurrent: 8 (Waves 1-3)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | - | T9,T10,T11,T22,T23 |
| T2 | - | T9,T10,T11,T12,T16,T17 |
| T3 | - | T9,T10,T11 |
| T4 | - | T22,T23 |
| T5 | - | T21,T31 |
| T6 | - | T16,T17,T26 |
| T7 | - | T31 |
| T8 | - | T22,T29 |
| T9 | T1,T2,T3 | T13,T31 |
| T10 | T1,T2,T3 | T14,T15,T16 |
| T11 | T1,T2,T3 | T14,T15 |
| T12 | T2 | T31 |
| T13 | T9 | T31 |
| T14 | T10,T11 | T31 |
| T15 | T10,T11 | T31 |
| T16 | T2,T6 | T17,T18,T19 |
| T17 | T2,T6,T16 | T18,T19,T23 |
| T18 | T16,T17 | T23 |
| T19 | T16,T17 | T23 |
| T20 | T1,T5 | T21 |
| T21 | T5,T20 | T31 |
| T22 | T1,T4,T8 | T31 |
| T23 | T1,T4,T16,T17,T18 | T31 |
| T24 | T1,T4 | T31 |
| T25 | T1 | T31 |
| T26 | T6 | T27,T28 |
| T27 | T26 | T31 |
| T28 | T26 | T31 |
| T29 | T6,T8 | T31 |
| T30 | T7 | T31 |
| T31 | ALL | F1-F4 |
| T32 | T31 | F1-F4 |
| T33 | T29,T31 | F1-F4 |
| T34 | T31 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 8 tasks - T1→`quick`, T2→`deep`, T3→`unspecified-high`, T4→`visual-engineering`, T5→`quick`, T6→`deep`, T7→`quick`, T8→`visual-engineering`
- **Wave 2**: 8 tasks - T9→`deep`, T10→`deep`, T11→`deep`, T12→`unspecified-high`, T13→`deep`, T14→`unspecified-high`, T15→`unspecified-high`, T16→`deep`
- **Wave 3**: 8 tasks - T17→`deep`, T18→`deep`, T19→`unspecified-high`, T20→`unspecified-high`, T21→`unspecified-high`, T22→`visual-engineering`, T23→`deep`, T24→`quick`
- **Wave 4**: 6 tasks - T25→`unspecified-high`, T26→`deep`, T27→`visual-engineering`, T28→`quick`, T29→`deep`, T30→`quick`
- **Wave 5**: 4 tasks - T31→`deep`, T32→`unspecified-high`, T33→`deep`, T34→`quick`
- **FINAL**: 4 tasks - F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [ ] 1. Game Flow & Scene System (Points 1-20, 27-38, 70-76)

  **What to do**:
  - 实现完整游戏流程: Logo动画(2秒可跳过) → 主菜单(星空粒子背景) → 流派选择面板 → 难度选择(普通/困难/地狱) → 3秒倒计时(3-2-1-GO) → 游戏 → 结算面板
  - 实现暂停系统: ESC暂停，画面变暗50%，暂停菜单(继续/武器查看/技能查看/商店/返回主菜单)
  - 实现结算面板: 数据逐一滚动展示(击杀→能量币→等级)，新纪录金色高亮，三个按钮(再来一局/返回主菜单/分享战绩)
  - 实现"放弃并结算"按钮(暂停菜单中)
  - 实现波次系统: 前5波45秒/5-15波50-65秒/15波后40-55秒，每5波补给波(敌人-30%掉率+50%)，每10波精英波(≥2精英怪)，每20波Boss波
  - 实现波次间隔: 前10波3秒/10-30波5秒/30波后8秒
  - 实现Boss Rush(每50波): 连续3个Boss，击败后传说奖励
  - 实现"快速开始"选项(使用上次流派和配置)
  - 实现新手引导(5步: 移动→射击→拾取→升级→完成)
  - 实现回流引导(7天未登录→欢迎回来+双倍经验Buff)
  - 实现错误处理(全局try-catch，友好提示)
  - 实现性能模式自动切换(帧率<33fps→降级到低特效)

  **Must NOT do**:
  - 不要修改config.js中的数据定义（只修改流程控制代码）
  - 不要添加后端服务

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 复杂的场景状态机和流程控制，需要深度理解现有架构
  - **Skills**: [`follow-plan`, `karpathy-skills`]
    - `follow-plan`: 严格按照1000点规划执行
    - `karpathy-skills`: 先思考再编码，避免过度复杂

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4, T5, T6, T7, T8)
  - **Blocks**: T9, T10, T11, T22, T23
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `js/core.js:20-30` - Scene system (GAME_CONFIG.SCENES.MENU/GAMEPLAY/LEVEL_UP/GAME_OVER)
  - `js/core.js:81-95` - Game.init() method, event listener setup
  - `js/main.js:27-53` - init() function, scene setup, background creation
  - `js/main.js:56-70` - createStarfield() background particle system
  - `js/ui.js:9-78` - UIManager constructor, DOM element references
  - `js/ui.js:69-74` - UI callbacks (onStartGame, onSkillSelected, etc.)

  **API/Type References**:
  - `js/config.js:40-48` - SCENES enum (MENU, CHARACTER_SELECT, GAMEPLAY, LEVEL_UP, GAME_OVER, LEADERBOARD)
  - `js/config.js:11-38` - BALANCE constants (CANVAS_WIDTH/HEIGHT, timing values)

  **WHY Each Reference Matters**:
  - `core.js` scene system: 现有的场景切换机制，需要扩展为完整的流程状态机
  - `main.js` init: 现有的初始化流程，需要添加Logo动画和引导
  - `ui.js` UIManager: 现有的UI管理器，需要添加暂停菜单和结算面板
  - `config.js` SCENES: 需要扩展场景枚举以支持新流程

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 游戏完整流程测试
    Tool: Playwright
    Preconditions: 游戏加载完成，显示主菜单
    Steps:
      1. 等待主菜单显示，验证标题"星域战机"可见
      2. 点击"开始游戏"按钮
      3. 验证流派选择面板弹出，显示流派卡片
      4. 选择一个流派（如"剧毒流"），点击"确认出战"
      5. 验证难度选择面板出现，选择"普通"
      6. 验证倒计时"3-2-1-GO"出现
      7. 验证游戏开始，敌人开始刷新
      8. 按ESC暂停，验证暂停菜单出现
      9. 点击"继续游戏"，验证游戏恢复
      10. 等待玩家死亡，验证结算面板出现
      11. 验证结算数据（击杀数、能量币、等级）显示
      12. 点击"再来一局"，验证回到流派选择
    Expected Result: 完整流程无卡顿，所有UI正确显示
    Evidence: .sisyphus/evidence/task-1-full-flow.png

  Scenario: Boss波次与缓冲期测试
    Tool: Playwright
    Preconditions: 游戏进行中，到达第20波
    Steps:
      1. 等待第20波开始
      2. 验证"WARNING"警告动画出现
      3. 验证Boss血条横贯屏幕顶部
      4. 击败Boss
      5. 验证Boss爆炸动画播放
      6. 验证"BOSS DEFEATED！"文字出现
      7. 验证15秒缓冲期（不刷新敌人）
      8. 验证"区域已肃清"文字显示
      9. 验证缓冲期结束后"第21波"倒计时
    Expected Result: Boss战流程完整，缓冲期≥15秒
    Evidence: .sisyphus/evidence/task-1-boss-flow.png
  ```

  **Commit**: YES
  - Message: `feat(flow): complete game flow with scenes, pause, settlement, wave system`
  - Files: `js/main.js`, `js/core.js`, `js/ui.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080` (verify game loads)

- [ ] 2. Config Architecture & Data Expansion (Points 79-80, 221-225, 381-386, 551-552, 651-652, 781-782)

  **What to do**:
  - 扩展config.js，添加1000点文档中定义的所有新数据结构
  - 添加天赋系统数据(5分支×5层，共90个天赋节点)
  - 添加局外成长系统数据(5方向，攻击力/生命/移速/经验/掉落)
  - 添加成就系统数据(20个成就定义)
  - 添加角色数据(3个可选角色，不同初始属性)
  - 添加每日/每周挑战数据结构
  - 添加多语言支持架构(JSON键值对)
  - 添加难度选择数据(普通/困难/地狱的数值倍率)
  - 统一所有技能描述格式(禁止模糊词汇，必须具体数值)
  - 添加武器融合配方数据(15种超武配方)
  - 添加技能融合配方数据(4种技能融合)
  - 添加精英词缀数据(15种词缀)
  - 添加Boss数据(5个Boss定义)
  - 添加敌人属性成长公式(血量/伤害随波次增长)
  - 添加局内经济曲线数据(能量币获取/商店定价)

  **Must NOT do**:
  - 不要修改现有数据结构的格式（保持向后兼容）
  - 不要删除已有数据

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 大量数据结构设计，需要深度理解游戏数值平衡
  - **Skills**: [`follow-plan`, `karpathy-skills`]
    - `follow-plan`: 严格按照1000点规划执行
    - `karpathy-skills`: 简洁优先，不添加未请求的灵活性

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4, T5, T6, T7, T8)
  - **Blocks**: T9, T10, T11, T12, T16, T17
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/config.js:9-1340` - 现有config.js完整结构，数据驱动设计模式
  - `js/config.js:50-200` - FACTIONS定义示例（20个流派的数据格式）
  - `js/config.js:200-400` - WEAPONS定义示例（20种武器的数据格式）
  - `js/config.js:400-600` - SKILLS定义示例（技能数据格式）
  - `js/config.js:600-800` - ENEMIES定义示例（敌人数据格式）

  **External References**:
  - 1000点文档第81-220条: 流派系统详细数据
  - 1000点文档第221-380条: 武器系统详细数据
  - 1000点文档第381-550条: 技能系统详细数据
  - 1000点文档第551-650条: 天赋系统详细数据

  **WHY Each Reference Matters**:
  - `config.js`现有结构: 保持数据格式一致，新数据按相同模式添加
  - 1000点文档: 每一条优化都是数据定义的来源

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: config.js数据完整性验证
    Tool: Bash (node)
    Preconditions: config.js已更新
    Steps:
      1. 运行 `node -e "const cfg = require('./js/config.js'); console.log(Object.keys(cfg.FACTIONS).length)"`
      2. 验证输出 ≥20（流派数量）
      3. 运行 `node -e "const cfg = require('./js/config.js'); console.log(Object.keys(cfg.WEAPONS).length)"`
      4. 验证输出 ≥20（武器数量）
      5. 运行 `node -e "const cfg = require('./js/config.js'); console.log(Object.keys(cfg.SKILLS).length)"`
      6. 验证输出 ≥55（30主动+25被动）
      7. 验证TALENTS数据结构存在
      8. 验证ACHIEVEMENTS数据结构存在
    Expected Result: 所有数据结构存在且数量正确
    Evidence: .sisyphus/evidence/task-2-config-verify.txt

  Scenario: 技能描述规范化验证
    Tool: Bash (grep)
    Preconditions: config.js已更新
    Steps:
      1. 搜索config.js中的模糊词汇："大量|少许|一定概率|若干"
      2. 验证搜索结果为空（无模糊词汇）
      3. 搜索所有技能描述，验证包含具体数值
    Expected Result: 零模糊词汇，所有描述包含具体数值
    Evidence: .sisyphus/evidence/task-2-description-verify.txt
  ```

  **Commit**: YES
  - Message: `feat(config): expand config with talents, achievements, fusion recipes, enemy data`
  - Files: `js/config.js`
  - Pre-commit: `node -e "require('./js/config.js')"` (verify no syntax errors)

- [ ] 3. Player & Character System (Points 49-57, 113-118, 119-124)

  **What to do**:
  - 实现3个可选角色(先锋战机+15%攻击/铁壁战机+30%生命/灵动战机+20%移速)
  - 实现角色选择界面(卡片展示，飞机预览，名称，特殊被动)
  - 实现角色解锁条件(初始1个，累计击杀500解锁第2个，击败Boss解锁第3个)
  - 实现局外成长系统(5方向: 攻击力+3%/级×20级, 生命+4%×15, 移速+2%×10, 经验+5%×15, 掉落+3%×10)
  - 实现星币系统(公式: 星币=存活分钟×10+击杀×2+Boss×100)
  - 实现"强化"页面(技能树样式，已解锁绿色，未解锁灰色)
  - 实现"重置强化"按钮(返还80%星币)
  - 实现护盾系统(护盾流核心被动: 每15秒生成护盾)
  - 实现吸血光环流(击杀回血1.5%，伤害回血2%)
  - 修复击杀回血Bug(子弹蹭到未死亡敌人不回血)

  **Must NOT do**:
  - 不要修改现有飞船绘制代码（ShipDesigns对象）
  - 不要添加后端服务

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 复杂的角色系统和成长系统，需要理解现有玩家实体
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4, T5, T6, T7, T8)
  - **Blocks**: T9, T10, T11
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/player.js:17-46` - ShipDesigns对象，20种飞船绘制函数
  - `js/player.js:100-200` - Player类构造函数，stats系统
  - `js/player.js:200-300` - Player.update()方法，移动和碰撞
  - `js/config.js:50-200` - FACTIONS定义，baseStats结构

  **WHY Each Reference Matters**:
  - `player.js` Player类: 需要扩展以支持角色特殊被动和局外成长
  - `config.js` FACTIONS: 角色数据需要与流派数据协调

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 角色选择与解锁测试
    Tool: Playwright
    Preconditions: 游戏主菜单显示
    Steps:
      1. 点击"开始游戏"
      2. 验证角色选择界面出现
      3. 验证初始角色(先锋战机)可选
      4. 验证其他角色显示解锁条件
      5. 选择先锋战机，进入游戏
      6. 验证攻击力+15%生效（检查伤害数字）
    Expected Result: 角色选择正常，属性加成生效
    Evidence: .sisyphus/evidence/task-3-character-select.png

  Scenario: 击杀回血Bug修复验证
    Tool: Playwright
    Preconditions: 选择吸血光环流，进入游戏
    Steps:
      1. 记录当前血量
      2. 射击敌人但不击杀（只蹭血）
      3. 验证血量没有增加
      4. 击杀敌人
      5. 验证血量增加（击杀回血1.5%）
    Expected Result: 只有击杀才回血，蹭血不回血
    Evidence: .sisyphus/evidence/task-3-heal-bug-fix.png
  ```

  **Commit**: YES
  - Message: `feat(player): character selection, permanent upgrades, shield system, heal fix`
  - Files: `js/player.js`, `js/main.js`, `js/ui.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 4. HUD & In-Game UI Foundation (Points 21-26, 879-892)

  **What to do**:
  - 实现完整HUD: 波次显示(顶部中央)、玩家等级(左上)、经验条、能量币(右上)、击杀数、血量条(底部)
  - HUD元素使用半透明深色背景(rgba(0,0,0,0.5))
  - 血量条颜色: 绿色(>50%)、黄色(25-50%)、红色闪烁(<25%)
  - 升级时数字放大并闪烁
  - 能量币拾取时数字跳变
  - 实现游戏内时间显示(分钟:秒，从0:00开始)
  - 实现波次进度条(当前波次剩余敌人比例)
  - 实现Boss血条(横贯屏幕90%以上，高度20px，分色段: 绿→黄→橙→红闪烁)
  - 实现暂停按钮(移动端右上角，44x44px，半透明"||"图标)
  - 实现技能栏(底部，主动技能上排带冷却倒计时，被动技能下排)
  - 实现武器栏(底部，显示武器图标和等级)
  - 实现连击显示(Combo文字，金色，带衰减)

  **Must NOT do**:
  - 不要修改游戏核心逻辑
  - 不要修改Canvas渲染层

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 纯UI/UX工作，需要视觉设计能力
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T5, T6, T7, T8)
  - **Blocks**: T22, T23
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/ui.js:9-78` - UIManager构造函数，DOM元素引用
  - `js/ui.js:80-200` - UIManager方法，HUD更新逻辑
  - `index.html:35-66` - HUD HTML结构和CSS样式

  **WHY Each Reference Matters**:
  - `ui.js` UIManager: 需要扩展HUD更新方法
  - `index.html` HUD: 需要添加新的HUD元素HTML

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: HUD完整性验证
    Tool: Playwright
    Preconditions: 游戏进行中
    Steps:
      1. 验证左上角显示"Lv.X"等级
      2. 验证右上角显示能量币数量
      3. 验证右上角显示击杀数
      4. 验证顶部中央显示波次
      5. 验证底部显示血量条
      6. 验证血量条颜色随血量变化
      7. 验证Boss血条横贯屏幕顶部
    Expected Result: 所有HUD元素可见且正确更新
    Evidence: .sisyphus/evidence/task-4-hud-complete.png
  ```

  **Commit**: YES
  - Message: `feat(hud): complete HUD with wave display, boss HP bar, skill/weapon bars`
  - Files: `js/ui.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 5. localStorage & Persistence (Points 53-60, 63-64, 495, 586-588, 909-910)

  **What to do**:
  - 实现完整localStorage持久化系统
  - 存储键名: `game_settings`(音量/特效等级/语言), `game_ui_state`(上次流派/难度), `permanent_upgrades`(局外成长), `achievements`(成就), `unlocked_characters`(角色解锁), `unlocked_factions`(流派解锁), `statistics`(统计数据)
  - 实现成就系统(20个成就): 首次击杀精英/首次击败Boss/存活10分钟/单局击杀1000/持有5把满级武器/触发5次融合/使用每种流派各一次等
  - 实现统计数据面板: 总游戏次数/总击杀/总死亡/最长存活/最常用流派
  - 实现每日挑战存储(`daily_challenge_YYYYMMDD`)
  - 实现每周挑战存储(`weekly_challenge_YYYYWW`)
  - 实现隐私模式降级(localStorage读取失败时不影响游戏)
  - 实现天赋解锁状态持久化
  - 实现技能解锁状态持久化
  - 实现武器图鉴解锁状态持久化
  - 实现敌人图鉴解锁状态持久化

  **Must NOT do**:
  - 不要修改现有StorageManager的编码方式（保持base64+checksum）
  - 不要添加后端服务

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 数据存储逻辑相对简单，主要是添加新的存储键
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T6, T7, T8)
  - **Blocks**: T21, T31
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/storage.js:1-448` - StorageManager和LeaderboardManager完整实现
  - `js/storage.js:12-42` - _checksum方法，数据校验模式
  - `js/storage.js:48-61` - saveGame方法，base64编码模式
  - `js/storage.js:67-90` - loadGame方法，解码和校验模式

  **WHY Each Reference Matters**:
  - `storage.js`现有模式: 新存储功能需要遵循相同的编码和校验模式

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: localStorage持久化验证
    Tool: Playwright
    Preconditions: 游戏已运行一段时间
    Steps:
      1. 进入游戏，击杀一些敌人，获得成就
      2. 刷新页面
      3. 验证设置保持（音量、特效等级）
      4. 验证成就保持
      5. 验证统计数据保持
      6. 验证流派解锁状态保持
    Expected Result: 刷新后所有数据保持
    Evidence: .sisyphus/evidence/task-5-persistence.png

  Scenario: 隐私模式降级测试
    Tool: Playwright
    Preconditions: 模拟localStorage不可用
    Steps:
      1. 在DevTools中禁用localStorage
      2. 刷新页面
      3. 验证游戏正常加载
      4. 验证显示"数据无法保存"提示
      5. 验证游戏功能正常
    Expected Result: 隐私模式下游戏正常运行
    Evidence: .sisyphus/evidence/task-5-privacy-mode.png
  ```

  **Commit**: YES
  - Message: `feat(storage): complete persistence with achievements, statistics, unlock states`
  - Files: `js/storage.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 6. Performance Foundation - Object Pools (Points 981-989)

  **What to do**:
  - 实现完整对象池系统: 子弹池(200个)、敌人池(40个)、粒子池(150个)、道具池(30个)、伤害数字池(50个)
  - 对象池动态扩容但不回收给GC
  - 实现空间网格碰撞检测(4×4网格，16个格子)
  - 每个实体只检测所在网格及相邻网格的碰撞
  - 避免在游戏循环中创建新对象
  - 避免在热路径中使用filter/map等高开销方法
  - 使用预分配数组和手动索引
  - 在波次间隙主动触发小规模清理
  - 实现同屏敌人数量上限: 普通怪40只、精英怪6只、Boss1只
  - 实现同屏粒子上限150个
  - 实现同屏道具上限30个

  **Must NOT do**:
  - 不要修改游戏逻辑（只修改底层性能基础设施）
  - 不要改变现有API接口

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 底层性能优化需要深度理解游戏循环和碰撞检测
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T5, T7, T8)
  - **Blocks**: T16, T17, T26
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/core.js:40-56` - 现有实体池和对象池定义
  - `js/core.js:100-200` - 游戏循环，实体更新和碰撞检测
  - `js/bullets.js:1-15` - Bullet类，对象池复用模式
  - `js/particles.js:1-40` - Particle类，对象池复用模式

  **WHY Each Reference Matters**:
  - `core.js`游戏循环: 需要优化碰撞检测为网格模式
  - `bullets.js`/`particles.js`: 对象池复用的参考实现

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 对象池上限验证
    Tool: Playwright + DevTools Console
    Preconditions: 游戏进行中，大量敌人和子弹
    Steps:
      1. 打开DevTools Console
      2. 进入游戏，让大量敌人出现
      3. 执行 `game.enemies.length` 验证≤40
      4. 执行 `game.playerBullets.length` 验证≤200
      5. 执行 `game.particles.length` 验证≤150
      6. 验证帧率≥30fps
    Expected Result: 所有实体数量在上限内，帧率稳定
    Evidence: .sisyphus/evidence/task-6-pool-limits.png

  Scenario: 空间网格碰撞检测验证
    Tool: DevTools Console
    Preconditions: 游戏进行中
    Steps:
      1. 在DevTools中监控碰撞检测时间
      2. 验证碰撞检测时间<2ms/帧
      3. 验证敌人之间不互相碰撞（只检测玩家子弹vs敌人）
    Expected Result: 碰撞检测高效，无多余计算
    Evidence: .sisyphus/evidence/task-6-collision-perf.png
  ```

  **Commit**: YES
  - Message: `perf(core): object pools, spatial grid collision, entity limits`
  - Files: `js/core.js`, `js/bullets.js`, `js/particles.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 7. Error Handling & Loading Screen (Points 70-78, 997)

  **What to do**:
  - 实现加载界面(进度条，显示"正在加载音效...80%"，星空背景)
  - 实现全局try-catch错误处理(友好提示"游戏出了点小问题，请刷新页面重试")
  - 实现localStorage降级(隐私模式下不影响游戏)
  - 实现回流引导(7天未登录→"欢迎回来！"+双倍经验Buff，10分钟内有效)
  - 实现版本号显示(设置页面底部)
  - 实现"检查更新"按钮(对比manifest文件)
  - 首屏加载控制在3秒以内(骨架屏+渐进式加载)
  - 游戏启动时先加载核心JS和主菜单，后台加载音效和次要资源

  **Must NOT do**:
  - 不要修改游戏核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 相对简单的UI和错误处理
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T5, T6, T8)
  - **Blocks**: T31
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `index.html:1-10` - HTML头部，meta标签
  - `js/main.js:10-53` - main.js IIFE入口，初始化流程

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 加载界面测试
    Tool: Playwright
    Preconditions: 清除浏览器缓存
    Steps:
      1. 打开游戏页面
      2. 验证加载界面出现（进度条或星空背景）
      3. 验证加载完成后界面消失
      4. 验证主菜单正常显示
    Expected Result: 加载界面流畅，无白屏
    Evidence: .sisyphus/evidence/task-7-loading.png

  Scenario: 错误处理测试
    Tool: Playwright + DevTools
    Preconditions: 游戏运行中
    Steps:
      1. 在DevTools中触发一个错误
      2. 验证友好错误提示出现
      3. 验证游戏不白屏
    Expected Result: 错误被友好处理
    Evidence: .sisyphus/evidence/task-7-error-handling.png
  ```

  **Commit**: YES
  - Message: `feat(core): loading screen, error handling, return guide, version check`
  - Files: `js/main.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 8. Canvas Layer System & Responsive Layout (Points 893-900, 984-987)

  **What to do**:
  - 实现多Canvas分层渲染: 背景层(星空)、游戏层(飞机/子弹/敌人)、粒子层(特效/伤害数字)、UI层(HUD)
  - 背景层不需要每帧重绘
  - 实现Canvas设计分辨率1280×720(16:9)
  - 实现letterbox模式: 屏幕>16:9按高度适配(两侧黑边)，<16:9按宽度适配(上下黑边)
  - 实现移动端竖屏布局(宽度<768px，UI元素垂直排列)
  - 实现移动端按钮最小尺寸44×44px，间距≥8px
  - 实现移动端字体最小14px
  - 实现刘海屏适配(CSS env(safe-area-inset-*))
  - 实现全屏切换按钮(F11原生全屏API)
  - 使用CSS will-change和transform: translateZ(0)开启GPU加速
  - 移动端Canvas分辨率自适应(DPR>2时使用DPR/2)

  **Must NOT do**:
  - 不要修改游戏逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Canvas分层和响应式布局是视觉工程
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T5, T6, T7)
  - **Blocks**: T22, T29
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `js/core.js:81-95` - Canvas初始化，事件监听
  - `js/core.js:200-250` - _onResize方法，窗口大小变化处理
  - `index.html:17-25` - Canvas CSS样式

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 全屏适配测试
    Tool: Playwright
    Preconditions: 游戏加载完成
    Steps:
      1. 调整浏览器窗口为16:9比例
      2. 验证游戏画面居中，无黑边
      3. 调整窗口为4:3比例
      4. 验证letterbox模式（上下黑边）
      5. 调整窗口为超宽屏(21:9)
      6. 验证letterbox模式（左右黑边）
    Expected Result: 所有比例下画面正确适配
    Evidence: .sisyphus/evidence/task-8-letterbox.png

  Scenario: 移动端竖屏测试
    Tool: Playwright (mobile viewport)
    Preconditions: 设置移动端视口(375×812)
    Steps:
      1. 验证UI元素垂直排列
      2. 验证按钮尺寸≥44×44px
      3. 验证字体≥14px
      4. 验证刘海屏安全区域
    Expected Result: 移动端UI完整可用
    Evidence: .sisyphus/evidence/task-8-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(render): canvas layers, letterbox, mobile responsive, GPU acceleration`
  - Files: `js/core.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 9. Weapon System - 20 Weapons (Points 221-245, 271-278, 279-309)

  **What to do**:
  - 实现20种武器全部弹道和射击逻辑:
    ①机关枪(高速连射±5度散布) ②激光炮(穿透激光束) ③散射枪(5颗扇形35度)
    ④追踪导弹(自动追踪) ⑤火焰喷射器(近距离扇形100px) ⑥冰霜炮(命中减速30%)
    ⑦闪电枪(连锁跳跃3次) ⑧火箭筒(爆炸范围80px) ⑨回旋镖(边缘反弹)
    ⑩浮游炮(2架环绕自身) ⑪地雷投放器(身后留雷) ⑫能量鞭(360度旋转)
    ⑬飞锯(弹射+15%伤害) ⑭音波炮(扩散音波环) ⑮毒液枪(毒雾区域60px)
    ⑯磁力枪(吸引敌人100px) ⑰分身射击(镜像50%伤害) ⑱黑洞发生器(吸引+伤害)
    ⑲光子矛(穿透一切) ⑳混沌弹(随机弹道)
  - 每种武器独立音效
  - 实现武器稀有度系统(普通白/稀有蓝/史诗紫/传说橙)
  - 实现武器弹道特效分级(普通无拖尾/稀有光晕/史诗粒子拖尾/传说冲击波)
  - 实现武器伤害数字(普通白/暴击黄/持续伤害绿/橙)
  - 实现武器后坐力屏幕震动(大型武器3-5px)
  - 实现武器弹壳效果(实弹武器金色/铜色矩形粒子)
  - 实现武器与流派联动(剧毒+毒液枪+30%伤害等8种联动)

  **Must NOT do**:
  - 不要删除现有武器定义

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 20种武器各有独特弹道和逻辑，需要深度实现
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T10, T11, T12, T13, T14, T15, T16)
  - **Blocks**: T13
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `js/weapons.js:15-679` - WeaponManager类完整实现
  - `js/weapons.js:38-54` - setWeapon方法，武器切换逻辑
  - `js/weapons.js:60-80` - update方法，射击计时逻辑
  - `js/bullets.js:17-1165` - Bullet类和BulletPatterns弹道生成器
  - `js/config.js:200-400` - WEAPONS数据定义

  **WHY Each Reference Matters**:
  - `weapons.js` WeaponManager: 需要扩展以支持20种武器的独立逻辑
  - `bullets.js` BulletPatterns: 需要添加新的弹道模式
  - `config.js` WEAPONS: 武器数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 20种武器射击感验证
    Tool: Playwright
    Preconditions: 游戏进行中，通过升级获得多种武器
    Steps:
      1. 获得机关枪，验证高速连射弹道
      2. 获得激光炮，验证穿透激光束
      3. 获得散射枪，验证扇形弹幕
      4. 获得追踪导弹，验证自动追踪
      5. 获得火焰喷射器，验证近距离扇形
      6. 获得冰霜炮，验证命中减速
      7. 获得闪电枪，验证连锁跳跃
      8. 验证每种武器有独立音效
    Expected Result: 20种武器射击感各不相同
    Evidence: .sisyphus/evidence/task-9-weapons.png

  Scenario: 武器伤害数字验证
    Tool: Playwright
    Preconditions: 游戏进行中
    Steps:
      1. 射击敌人
      2. 验证伤害数字飘出（白色普通）
      3. 触发暴击，验证黄色伤害数字
      4. 使用火焰喷射器，验证橙色持续伤害数字
    Expected Result: 伤害数字颜色和动画正确
    Evidence: .sisyphus/evidence/task-9-damage-numbers.png
  ```

  **Commit**: YES
  - Message: `feat(weapons): 20 weapons with unique projectiles, effects, sounds`
  - Files: `js/weapons.js`, `js/bullets.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 10. Faction System - 20 Factions (Points 81-220)

  **What to do**:
  - 实现20个流派，每个包含: 1个核心被动(永久生效) + 3个专属技能 + 1个终极天赋
  - 免费流派(8个): 剧毒流/冰冻流/火焰流/闪电流/护盾流/弹幕流/狂怒流/召唤流
  - 解锁流派(12个): 吸血光环流/时空流/元素共鸣流/幸运流/重力流/音波流/魔仆流/数据流/虚空流/圣光流/暗影流/科技流/混沌流/自然流
  - 实现流派解锁条件(localStorage记录)
  - 实现辅修流派系统(主修70%/辅修30%概率)
  - 实现流派卡片式选择界面(图标/名称/核心机制/难度星级)
  - 特别实现:
    - 剧毒流: 30%概率中毒，5秒每秒20%攻击力伤害，敌人绿色+气泡粒子
    - 冰冻流: 25%概率减速30%，3层冻结1.5秒，暴风雪每8秒150px范围
    - 火焰流: 35%概率燃烧3秒，每秒30%攻击力伤害
    - 闪电流: 20%概率闪电链跳跃3次
    - 召唤流: 永久1架无人机环绕射击
    - 护盾流: 每15秒生成护盾
    - 吸血光环流: 击杀回血1.5%，伤害回血2%
    - 弹幕流: 子弹数量+1

  **Must NOT do**:
  - 不要删除现有流派定义

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 20个流派各有独特机制，需要深度实现
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T9, T11, T12, T13, T14, T15, T16)
  - **Blocks**: T14, T15, T16
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `js/config.js:50-200` - FACTIONS数据定义
  - `js/player.js:100-300` - Player类，stats系统
  - `js/skills.js:1-100` - SkillManager，技能系统

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 剧毒流效果验证【用户反馈：剧毒没效果】
    Tool: Playwright
    Preconditions: 选择剧毒流，进入游戏
    Steps:
      1. 射击敌人
      2. 验证敌人身体变为绿色
      3. 验证绿色气泡粒子上升
      4. 验证持续掉血数字(绿色小号数字)
      5. 验证中毒持续5秒
      6. 验证每秒造成攻击力20%伤害
    Expected Result: 剧毒效果完全可见且数值正确
    Evidence: .sisyphus/evidence/task-10-poison-effect.png

  Scenario: 冰冻流暴风雪验证【用户反馈：暴风雪没效果】
    Tool: Playwright
    Preconditions: 选择冰冻流，进入游戏
    Steps:
      1. 等待8秒（暴风雪冷却）
      2. 验证身边释放暴风雪（白色旋转雪花粒子）
      3. 验证范围内敌人变蓝减速
      4. 验证减速效果可叠加
      5. 验证3层后冻结敌人
    Expected Result: 暴风雪效果完全可见，减速和冻结生效
    Evidence: .sisyphus/evidence/task-10-blizzard-effect.png
  ```

  **Commit**: YES
  - Message: `feat(factions): 20 factions with core passives, skills, ultimates`
  - Files: `js/config.js`, `js/player.js`, `js/skills.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 11. Skill System - 30 Active + 25 Passive (Points 381-495)

  **What to do**:
  - 实现30种主动技能(冷却/手动或自动触发):
    ①全域攻击 ②弹幕风暴 ③召唤援军 ④能量护盾 ⑤时间减速 ⑥黑洞吸引
    ⑦回血光环 ⑧闪电风暴 ⑨火焰风暴 ⑩冰霜新星 ⑪毒雾弥漫 ⑫分身术
    ⑬冲击波 ⑭能量爆发 ⑮瞬移 ⑯自动炮台 ⑰磁力场 ⑱陨石召唤
    ⑲圣光降临 ⑳暗影突袭 ㉑超载 ㉒复制 ㉓元素爆发 ㉔时间回溯
    ㉕牺牲打击 ㉖狂暴 ㉗冻结领域 ㉘连锁爆弹 ㉙生命链接 ㉚维度裂缝
  - 实现25种被动技能(永久生效):
    ①攻击强化 ②生命强化 ③移速强化 ④射速强化 ⑤暴击强化 ⑥拾取范围
    ⑦经验加成 ⑧掉落率 ⑨冷却缩减 ⑩击退强化 ⑪弹丸数 ⑫穿透
    ⑬吸血 ⑭生命回复 ⑮元素抗性 ⑯护盾回复 ⑰暴击回血 ⑱闪避
    ⑲反伤 ⑳金币加成 ㉑最后抵抗 ㉒武器经验 ㉓弹速 ㉔范围伤害 ㉕生命吸取光环
  - 升级时3选1(2主动+1被动或1主动+2被动随机)
  - 技能最高5级，升级提升数值
  - 满级后不再出现在选项中
  - 实现技能CD视觉反馈(扇形遮罩)
  - 实现技能热键(桌面端1-6)
  - 实现技能与流派协同(剧毒+毒雾弥漫+50%伤害等)
  - 实现技能与武器联动(弹丸数+机关枪额外+1等)

  **Must NOT do**:
  - 不要删除现有技能定义

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 55种技能各有独特效果，需要深度实现
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T9, T10, T12, T13, T14, T15, T16)
  - **Blocks**: T14, T15
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `js/skills.js:1-2105` - SkillManager完整实现
  - `js/skills.js:60-75` - addXp方法，升级逻辑
  - `js/skills.js:100-200` - levelUp方法，技能选择逻辑
  - `js/config.js:400-600` - SKILLS数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 技能升级3选1验证
    Tool: Playwright
    Preconditions: 游戏进行中，获得足够经验升级
    Steps:
      1. 等待升级触发
      2. 验证3个技能选项出现
      3. 选择一个技能
      4. 验证技能添加到技能栏
      5. 验证技能图标显示在底部
      6. 再次升级，验证已满级技能不再出现
    Expected Result: 升级选择正常，满级技能不重复
    Evidence: .sisyphus/evidence/task-11-skill-select.png

  Scenario: 主动技能冷却验证
    Tool: Playwright
    Preconditions: 拥有主动技能
    Steps:
      1. 使用主动技能
      2. 验证技能图标变灰
      3. 验证扇形遮罩显示冷却比例
      4. 等待冷却完成
      5. 验证图标恢复，播放"叮"音效
    Expected Result: 冷却视觉反馈正确
    Evidence: .sisyphus/evidence/task-11-skill-cooldown.png
  ```

  **Commit**: YES
  - Message: `feat(skills): 30 active + 25 passive skills with cooldowns, synergies`
  - Files: `js/skills.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 12. Talent System - 5 Branches (Points 551-591)

  **What to do**:
  - 实现天赋系统(独立于流派和技能的第三层Build维度)
  - 5个分支: 攻击(5层×2-3选项) / 防御(5层) / 功能(5层) / 元素(5层) / 终极(3层)
  - 每局5个天赋点，每击败Boss额外+1
  - 天赋选择在流派选择后、游戏开始前
  - 实现天赋树UI(树状图或层级列表)
  - 实现天赋与流派协同(剧毒推荐毒之侵蚀/处刑者等)
  - 实现天赋重置(开局前可反复调整)
  - 实现天赋解锁条件(Lv1默认，高层需上层被选过)
  - 实现天赋平衡性验证(DPS增益±10%以内)

  **Must NOT do**:
  - 不要添加局外永久天赋升级

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 复杂的天赋树系统，需要UI和数值平衡
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T9, T10, T11, T13, T14, T15, T16)
  - **Blocks**: T31
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `js/config.js` - 需要添加TALENTS数据结构
  - `js/skills.js` - SkillManager，天赋系统可参考技能系统模式
  - `js/ui.js` - UIManager，天赋选择UI

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 天赋选择流程验证
    Tool: Playwright
    Preconditions: 选择流派后
    Steps:
      1. 验证天赋选择界面出现
      2. 验证5个分支显示
      3. 选择攻击分支Lv1"锋刃"
      4. 验证攻击力+10%生效
      5. 验证天赋点减少
      6. 点击确认进入游戏
    Expected Result: 天赋选择正常，属性加成生效
    Evidence: .sisyphus/evidence/task-12-talent-select.png
  ```

  **Commit**: YES
  - Message: `feat(talents): 5-branch talent tree with 90 nodes, per-run allocation`
  - Files: `js/config.js`, `js/skills.js`, `js/ui.js`, `js/main.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 13. Weapon Fusion System - 15 Recipes (Points 246-270)

  **What to do**:
  - 实现武器融合系统: 两把满级(5级)武器+1个融合核心→超级武器
  - 实现15种融合配方:
    ①机关枪+激光炮→等离子机枪 ②散射枪+追踪导弹→制导散弹
    ③火焰喷射器+毒液枪→瘟疫火焰 ④冰霜炮+闪电枪→雷暴冰暴
    ⑤回旋镖+飞锯→死亡风暴 ⑥浮游炮+激光炮→轨道激光阵列
    ⑦火箭筒+地雷投放器→集束炸弹 ⑧黑洞发生器+光子矛→奇点投射
    ⑨能量鞭+火焰喷射器→火焰鞭 ⑩音波炮+冰霜炮→寒冰音波
    ⑪磁力枪+闪电枪→电磁风暴 ⑫分身射击+散射枪→镜像军团
    ⑬混沌弹+追踪导弹→混沌追踪 ⑭火焰喷射器+火箭筒→核弹发射器
    ⑮机关枪+散射枪→弹幕风暴
  - 实现融合提示(屏幕下方闪烁"融合！"按钮)
  - 实现融合确认界面(前后对比)
  - 实现融合动画(两武器图标碰撞融合，粒子特效，2秒)
  - 融合后释放武器槽位
  - 实现融合核心掉落(精英15%/Boss必掉/商店150币)
  - 实现超载核心(超武伤害+50%，Boss Rush掉落)
  - 实现技能融合(4种: 毒雾+冰霜→瘟疫冰暴，火焰+闪电→等离子风暴等)

  **Must NOT do**:
  - 不要修改现有武器基础逻辑

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 复杂的融合系统，需要理解武器和技能系统
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T10, T11, T12, T14, T15, T16)
  - **Blocks**: T31
  - **Blocked By**: T9

  **References**:

  **Pattern References**:
  - `js/weapons.js:15-679` - WeaponManager类
  - `js/skills.js:46-50` - 融合系统状态初始化
  - `js/config.js` - 需要添加FUSION_RECIPES数据

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 武器融合流程验证
    Tool: Playwright
    Preconditions: 拥有两把满级武器和融合核心
    Steps:
      1. 验证屏幕下方出现"融合！"按钮
      2. 点击融合按钮
      3. 验证融合确认界面出现（前后对比）
      4. 点击确认
      5. 验证融合动画播放（2秒）
      6. 验证新超武出现在武器栏
      7. 验证释放了一个武器槽位
    Expected Result: 融合流程完整，动画流畅
    Evidence: .sisyphus/evidence/task-13-fusion.png
  ```

  **Commit**: YES
  - Message: `feat(fusion): 15 weapon fusion recipes, 4 skill fusions, fusion UI`
  - Files: `js/weapons.js`, `js/skills.js`, `js/config.js`, `js/ui.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 14. Skill Fusion & Synergy System (Points 442-465, 469-473)

  **What to do**:
  - 实现技能与流派协同(8种): 剧毒+毒雾弥漫+50%伤害/冰冻+冰霜新星+1.5秒冻结/火焰+火焰风暴+2次+40%伤害等
  - 实现技能与武器联动(6种): 弹丸数+机关枪+1/穿透+激光炮+2/暴击+追踪导弹+8%等
  - 实现技能融合(4种): 毒雾满级+冰霜满级→瘟疫冰暴/火焰满级+闪电满级→等离子风暴等
  - 实现升级选项优化: 已持有技能+30%概率出现/15%概率刷新按钮/10%概率融合核心选项
  - 实现被动技能叠加规则: 同属性加法叠加，不同属性独立乘算
  - 实现闪避上限40%
  - 实现控制技能对Boss效果减半
  - 实现技能描述规范化(统一格式，禁止模糊词汇)

  **Must NOT do**:
  - 不要修改基础技能逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 复杂的协同和融合系统
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T10, T11, T12, T13, T15, T16)
  - **Blocks**: T31
  - **Blocked By**: T10, T11

  **References**:

  **Pattern References**:
  - `js/skills.js:1-2105` - SkillManager完整实现
  - `js/config.js:400-600` - SKILLS数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 流派与技能协同验证
    Tool: Playwright
    Preconditions: 选择剧毒流，获得"毒雾弥漫"技能
    Steps:
      1. 验证毒雾伤害+50%
      2. 验证毒雾持续时间+3秒
      3. 使用毒雾弥漫技能
      4. 验证伤害数值正确
    Expected Result: 协同效果生效
    Evidence: .sisyphus/evidence/task-14-synergy.png
  ```

  **Commit**: YES
  - Message: `feat(synergy): faction-skill-weapon synergies, skill fusion, stacking rules`
  - Files: `js/skills.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 15. Element Reaction System (Points 143-148, 203-208)

  **What to do**:
  - 实现元素反应系统: 同时持有2种不同元素技能时，所有元素伤害+25%
  - 元素反应额外造成攻击力30%伤害
  - 实现4种元素: 火(燃烧)/冰(冻结)/毒(中毒)/电(闪电)
  - 实现元素共鸣流: 元素扩散/元素过载/元素融合/元素主宰
  - 实现混沌流: 5%概率随机元素效果
  - 实现元素视觉特效: 中毒绿色/冰冻蓝色/火焰橙红/闪电黄色
  - 实现元素反应触发时多彩粒子爆炸

  **Must NOT do**:
  - 不要修改基础元素效果

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 元素反应系统需要理解多种元素交互
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T10, T11, T12, T13, T14, T16)
  - **Blocks**: T31
  - **Blocked By**: T10, T11

  **References**:

  **Pattern References**:
  - `js/config.js` - 元素数据定义
  - `js/skills.js` - 技能系统中的元素逻辑

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 元素反应触发验证
    Tool: Playwright
    Preconditions: 持有火焰+冰冻两种元素技能
    Steps:
      1. 验证元素伤害+25%
      2. 触发元素反应
      3. 验证额外30%攻击力伤害
      4. 验证多彩粒子爆炸特效
    Expected Result: 元素反应正确触发
    Evidence: .sisyphus/evidence/task-15-element-reaction.png
  ```

  **Commit**: YES
  - Message: `feat(elements): element reaction system with visual effects`
  - Files: `js/skills.js`, `js/config.js`, `js/particles.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 16. Enemy AI & Movement Patterns (Points 651-670, 714-718)

  **What to do**:
  - 实现10种基础小怪AI: 侦察机(直线)/巡逻机(正弦波)/环绕机(圆周)/俯冲机(俯冲)/跟踪机(追踪)/随机漫步机/锯齿飞行机/螺旋机/V型编队/U型编队
  - 实现8种弹幕小怪: 扇形射手/自机狙射手/开花弹射手/螺旋弹射手/弹墙射手/激光射手/追踪弹射手/随机弹射手
  - 实现7种特殊小怪: 自爆机/分裂机/护盾机/隐身机/加速机/治疗机/召唤机
  - 实现5种障碍小怪: 肉盾机/反弹机/减速场机/吸能机/自爆陨石
  - 实现敌人AI行为树: 攻击型/冲撞型/环绕型/逃跑型/支援型
  - 实现敌人属性成长公式: 血量=基础×(1+波次×0.06)²，伤害=基础×(1+波次×0.04)
  - 实现弹幕模式随机化(从招式池随机选取)
  - 实现弹幕密度控制(上限5%屏幕面积)
  - 实现敌人入场预警(红色三角箭头)

  **Must NOT do**:
  - 不要删除现有敌人定义

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 30种敌人各有独特AI，需要深度实现
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T10, T11, T12, T13, T14, T15)
  - **Blocks**: T17, T18, T19
  - **Blocked By**: T2, T6

  **References**:

  **Pattern References**:
  - `js/enemies.js:12-68` - Enemy类构造函数
  - `js/enemies.js:100-300` - Enemy.update()方法，AI逻辑
  - `js/enemies.js:500-800` - WaveSpawner波次生成器
  - `js/config.js:600-800` - ENEMIES数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 敌人AI多样性验证
    Tool: Playwright
    Preconditions: 游戏进行中，多种敌人出现
    Steps:
      1. 验证侦察机直线飞行
      2. 验证巡逻机正弦波飞行
      3. 验证环绕机围绕玩家转圈
      4. 验证俯冲机从上方俯冲
      5. 验证跟踪机追踪玩家
      6. 验证弹幕模式随机化
    Expected Result: 每种敌人行为不同
    Evidence: .sisyphus/evidence/task-16-enemy-ai.png

  Scenario: 敌人属性成长验证
    Tool: DevTools Console
    Preconditions: 游戏进行到第20波
    Steps:
      1. 记录第1波敌人血量
      2. 记录第20波敌人血量
      3. 验证血量增长符合公式: 基础×(1+20×0.06)²
    Expected Result: 属性成长公式正确
    Evidence: .sisyphus/evidence/task-16-scaling.png
  ```

  **Commit**: YES
  - Message: `feat(enemies): 30 enemy types with AI, bullet patterns, scaling`
  - Files: `js/enemies.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 17. Enemy Types - 40 Types Total (Points 651-682, 719-720)

  **What to do**:
  - 实现完整40种敌人(10基础+8弹幕+7特殊+5障碍+6精英+4Boss+1隐藏Boss)
  - 每种敌人独立外形(Canvas绘制)
  - 每种敌人受击反馈(闪烁白色0.1秒)
  - 每种敌人死亡效果: 火烧死→焦黑碎屑/冰冻死→碎冰块/毒死→绿烟/电死→抽搐爆炸/物理→碎裂
  - 实现敌人图鉴(主菜单图鉴页面，遇到的显示完整信息，未遇到的显示"???")
  - 实现同屏敌人上限(普通40/精英6/Boss1)

  **Must NOT do**:
  - 不要使用换皮怪

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 40种敌人需要独立实现
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T18, T19, T20, T21, T22, T23, T24)
  - **Blocks**: T18, T19, T23
  - **Blocked By**: T2, T6, T16

  **References**:

  **Pattern References**:
  - `js/enemies.js:12-68` - Enemy类
  - `js/enemies.js:200-400` - 敌人绘制逻辑
  - `js/config.js:600-800` - ENEMIES数据

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 敌人死亡效果验证
    Tool: Playwright
    Preconditions: 游戏进行中
    Steps:
      1. 用火焰武器击杀敌人，验证焦黑碎屑
      2. 用冰冻武器击杀敌人，验证碎冰块
      3. 用毒液武器击杀敌人，验证绿烟
      4. 用闪电武器击杀敌人，验证抽搐爆炸
    Expected Result: 每种元素死亡效果不同
    Evidence: .sisyphus/evidence/task-17-death-effects.png
  ```

  **Commit**: YES
  - Message: `feat(enemies): 40 enemy types with unique visuals and death effects`
  - Files: `js/enemies.js`, `js/config.js`, `js/ui.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 18. Boss System - 5 Bosses + Boss Rush (Points 687-708)

  **What to do**:
  - 实现5个Boss:
    ①钢铁堡垒(巨型战舰，扇形弹幕+冲撞+召唤自爆机)
    ②虚空领主(紫色能量体，追踪能量球+瞬移+分裂)
    ③冰封女王(冰蓝机体，减速冰弹+冰墙+暴风雪)
    ④烈焰霸主(红色机甲，火焰喷射+火焰路径+陨石雨)
    ⑤混沌核心(隐藏Boss，触发条件: 4种元素反应各5次，三阶段切换元素)
  - 实现Boss入场(全屏变暗+WARNING警告+专属BGM切换)
  - 实现Boss血条(横贯屏幕90%+，20px高，分色段: 绿→黄→橙→红闪烁)
  - 实现Boss血条显示名字和百分比
  - 实现Boss多阶段(75%召唤/50%切换模式/25%狂暴)
  - 实现Boss战节奏(1.5-3分钟，弹幕有规律可循)
  - 实现Boss击败流程: 爆炸动画1.5秒→清除小怪→"BOSS DEFEATED！"→15秒缓冲期
  - 实现Boss Rush(每50波): 连续3个Boss，击败后传说奖励
  - 严禁Boss连轴出现(间隔≥15波)

  **Must NOT do**:
  - 不要让Boss无预警出现在玩家脸上

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 5个Boss各有复杂多阶段战斗
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T19, T20, T21, T22, T23, T24)
  - **Blocks**: T23
  - **Blocked By**: T16, T17

  **References**:

  **Pattern References**:
  - `js/enemies.js:60-68` - Boss相关属性
  - `js/enemies.js:400-600` - Boss AI逻辑
  - `js/config.js` - BOSS数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Boss血条验证【用户明确要求】
    Tool: Playwright
    Preconditions: 到达Boss波
    Steps:
      1. 验证"WARNING"警告动画出现
      2. 验证Boss血条横贯屏幕顶部(≥90%宽度)
      3. 验证血条高度≥20px
      4. 验证显示Boss名字
      5. 验证显示百分比
      6. 验证分色段(绿→黄→橙→红闪烁)
    Expected Result: Boss血条完全符合要求
    Evidence: .sisyphus/evidence/task-18-boss-hp.png

  Scenario: Boss缓冲期验证【用户明确要求】
    Tool: Playwright
    Preconditions: 击败Boss
    Steps:
      1. 验证Boss爆炸动画(1.5秒)
      2. 验证场上小怪自动清除
      3. 验证"BOSS DEFEATED！"文字
      4. 验证15秒缓冲期(不刷新敌人)
      5. 验证"区域已肃清"文字
      6. 验证道具自动向玩家移动
    Expected Result: 缓冲期≥15秒，流程完整
    Evidence: .sisyphus/evidence/task-18-boss-buffer.png
  ```

  **Commit**: YES
  - Message: `feat(boss): 5 bosses with multi-phase, boss rush, HP bar, buffer period`
  - Files: `js/enemies.js`, `js/config.js`, `js/ui.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 19. Elite Enemies & Affixes (Points 683-686)

  **What to do**:
  - 实现精英怪系统(基础属性3倍血量2倍伤害)
  - 实现15种词缀: 狂暴/分裂/护盾/瞬移/吸血/瘟疫/反伤/巨大化/急速/熔岩/冰冻光环/雷电护体/多重射击/硬化/再生
  - 每个精英怪随机2-4个词缀
  - 词缀外观体现: 狂暴红光/分裂裂纹/护盾半透明罩/瞬移残影等
  - 精英怪掉落: 武器箱15%/融合核心15%/能量币30-60/道具30%
  - 精英波(每10波): 必定≥2只精英怪，"警告：精英来袭！"

  **Must NOT do**:
  - 不要让精英词缀过于影响性能

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 词缀系统需要与敌人系统集成
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T20, T21, T22, T23, T24)
  - **Blocks**: T23
  - **Blocked By**: T16, T17

  **References**:

  **Pattern References**:
  - `js/enemies.js:12-68` - Enemy类
  - `js/config.js` - 需要添加ELITE_AFFIXES数据

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 精英词缀验证
    Tool: Playwright
    Preconditions: 精英波出现
    Steps:
      1. 验证精英怪体型/颜色与普通怪不同
      2. 验证词缀外观体现(红光/裂纹等)
      3. 验证精英怪血量为普通怪3倍
      4. 验证击杀后掉落武器箱/融合核心
    Expected Result: 精英系统完整
    Evidence: .sisyphus/evidence/task-19-elite.png
  ```

  **Commit**: YES
  - Message: `feat(elite): 15 affixes with visual indicators, elite wave spawning`
  - Files: `js/enemies.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 20. Item System - 20 Items (Points 781-812)

  **What to do**:
  - 实现20种道具:
    ①小型血包(10%) ②中型血包(25%) ③大型血包(50%) ④火力全开(+50%攻击8秒)
    ⑤速度爆发(+40%移速5秒) ⑥无敌护盾(1次) ⑦磁铁(吸引6秒) ⑧经验加成(+80%10秒)
    ⑨能量币袋(50-200) ⑩武器箱 ⑪融合核心 ⑫折扣券(5折) ⑬金喵(无敌3秒+清怪)
    ⑭武器强化石(500经验) ⑮技能卷轴 ⑯天赋重置卷 ⑰超载核心 ⑱时空水晶(-50%CD12秒)
    ⑲诱导弹(吸引+爆炸) ⑳生命果实(永久+5%生命)
  - 实现加权随机掉落算法
  - 实现保底机制(60秒未掉→必掉中型血包)
  - 实现道具视觉(旋转+浮动，光柱: 普通无/稀有蓝30px/史诗紫50px/传说金80px)
  - 实现道具拾取反馈(音效+图标飞向UI+光晕)
  - 实现道具自动吸附(50px内瞬间/50-150px缓慢/150px外不吸附)
  - 实现道具过期(15-20秒，过期前5秒闪烁)

  **Must NOT do**:
  - 不要删除现有道具定义

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 20种道具各有独特效果
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T19, T21, T22, T23, T24)
  - **Blocks**: T21
  - **Blocked By**: T1, T5

  **References**:

  **Pattern References**:
  - `js/items.js:1-828` - Item/BuffManager/ItemSpawner完整实现
  - `js/config.js` - ITEMS数据定义

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 道具掉落与拾取验证
    Tool: Playwright
    Preconditions: 游戏进行中
    Steps:
      1. 击杀敌人，验证道具掉落
      2. 验证道具旋转+浮动动画
      3. 验证光柱标识(稀有蓝色/史诗紫色)
      4. 靠近道具，验证自动吸附
      5. 验证拾取音效
      6. 验证图标飞向UI动画
      7. 验证血包回血数值正确
    Expected Result: 道具系统完整
    Evidence: .sisyphus/evidence/task-20-items.png
  ```

  **Commit**: YES
  - Message: `feat(items): 20 items with weighted drops, auto-pickup, visual effects`
  - Files: `js/items.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 21. Shop & Economy System (Points 813-837)

  **What to do**:
  - 实现局内商店(屏幕右下角按钮/B键打开)
  - 商店面板: 半屏弹窗，游戏暂停，2列×3行卡片
  - 商品: 武器强化(40币)/技能升级(60币)/血包(30/80/200)/临时护盾(50)/武器箱(100)/技能抽取(80)/融合核心(150)/刷新(20)/武器槽+1(300)
  - 商店每5波自动刷新，手动刷新20币/次，每局限5次
  - Boss击败后限时优惠(30秒): 稀有武器120/融合核心100/超载核心200
  - 折扣券自动应用
  - 实现能量币系统(蓝色发光颗粒，吸取范围50px，地面30秒消失)
  - 实现局内经济曲线: 前期20-30币/分→中期50-80→后期100-150

  **Must NOT do**:
  - 不要让商店定价与能量币获取脱节

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 商店UI和经济平衡
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T19, T20, T22, T23, T24)
  - **Blocks**: T31
  - **Blocked By**: T5, T20

  **References**:

  **Pattern References**:
  - `js/ui.js` - UIManager
  - `js/items.js` - 道具系统
  - `js/config.js` - 需要添加SHOP数据

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 商店购买流程验证
    Tool: Playwright
    Preconditions: 游戏进行中，有足够能量币
    Steps:
      1. 按B键打开商店
      2. 验证商店面板出现，游戏暂停
      3. 验证商品显示(图标/名称/价格)
      4. 购买一个商品
      5. 验证能量币扣除
      6. 验证商品效果生效
      7. 关闭商店，验证游戏恢复
    Expected Result: 商店流程完整
    Evidence: .sisyphus/evidence/task-21-shop.png
  ```

  **Commit**: YES
  - Message: `feat(shop): in-game shop with energy currency, economy curve`
  - Files: `js/ui.js`, `js/items.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 22. Menu Screens (Points 1-5, 39-40, 49-52, 58-60, 63-64, 863-875)

  **What to do**:
  - 实现主菜单(星空粒子背景50个，游戏标题描边发光，4个按钮: 开始游戏/图鉴/设置/关于)
  - 实现流派选择界面(卡片网格，桌面3列/移动1列滚动，选中金色边框)
  - 实现难度选择(普通/困难/地狱三个图标按钮)
  - 实现图鉴界面(4标签: 武器/技能/流派/敌人)
  - 实现设置界面(音量滑块/画面设置/语言选择/数据管理)
  - 实现统计面板(总游戏次数/总击杀/总死亡/最长存活/最常用流派)
  - 实现成就系统列表(已解锁显示时间，未解锁显示条件)
  - 实现所有界面切换淡入淡出(0.3-0.5秒)
  - 实现按钮交互(hover放大105%/点击缩小95%)

  **Must NOT do**:
  - 不要修改游戏核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 纯UI/UX工作
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T19, T20, T21, T23, T24)
  - **Blocks**: T31
  - **Blocked By**: T1, T4, T8

  **References**:

  **Pattern References**:
  - `js/ui.js:1-892` - UIManager完整实现
  - `index.html:67-100` - 菜单HTML结构

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 主菜单验证
    Tool: Playwright
    Preconditions: 游戏首次加载
    Steps:
      1. 验证星空粒子背景动画
      2. 验证游戏标题描边发光效果
      3. 验证4个按钮可见
      4. 点击"开始游戏"，验证流派选择面板
      5. 点击"图鉴"，验证图鉴界面
      6. 点击"设置"，验证设置界面
    Expected Result: 所有菜单界面正常
    Evidence: .sisyphus/evidence/task-22-menus.png
  ```

  **Commit**: YES
  - Message: `feat(ui): main menu, faction select, difficulty, codex, settings, achievements`
  - Files: `js/ui.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 23. Wave System & Spawning Logic (Points 10-20, 712-713, 724-730)

  **What to do**:
  - 实现完整波次系统: 前5波45秒/5-15波50-65秒/15波后40-55秒
  - 实现补给波(每5波): 敌人-30%，掉率+50%
  - 实现精英波(每10波): ≥2精英怪，"警告：精英来袭！"
  - 实现Boss波(每20波): WARNING警告，背景变暗
  - 实现Boss Rush(每50波): 连续3个Boss
  - 实现终极试炼(200波后每50波): 全属性翻倍，奖励三倍
  - 实现波次间隔: 前10波3秒/10-30波5秒/30波后8秒
  - 实现波次显示(屏幕顶部"第X波"，1.5秒消失)
  - 实现波次进度条(剩余敌人比例)
  - 实现敌人入场预警(红色三角箭头0.5秒前)
  - 实现同屏敌人上限(普通40/精英6/Boss1)
  - 实现弹幕密度控制(上限5%屏幕面积)

  **Must NOT do**:
  - 不要让Boss连轴出现

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 复杂的波次逻辑和平衡
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T19, T20, T21, T22, T24)
  - **Blocks**: T31
  - **Blocked By**: T1, T4, T16, T17, T18

  **References**:

  **Pattern References**:
  - `js/enemies.js:500-800` - WaveSpawner波次生成器
  - `js/config.js` - 波次相关数据

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 波次系统验证
    Tool: Playwright
    Preconditions: 游戏进行中
    Steps:
      1. 验证第1波开始，显示"第1波"
      2. 验证每5波补给波(敌人减少)
      3. 验证每10波精英波("警告：精英来袭！")
      4. 验证每20波Boss波(WARNING警告)
      5. 验证Boss不会连轴出现
      6. 验证波次间隔递增
    Expected Result: 波次系统完整
    Evidence: .sisyphus/evidence/task-23-waves.png
  ```

  **Commit**: YES
  - Message: `feat(waves): complete wave system with supply/elite/boss waves, spawning logic`
  - Files: `js/enemies.js`, `js/main.js`, `js/config.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 24. Tutorial & New Player Guide (Points 41-48)

  **What to do**:
  - 实现新手引导(5步): ①移动飞机(手指滑动提示)→②射击敌人(自动射击提示)→③拾取道具(靠近自动拾取)→④升级选技能(模拟升级)→⑤完成引导
  - 引导中非操作区域变暗(蒙版)，当前目标高亮光圈
  - 每步完成播放"叮"音效
  - 引导可在设置中关闭，完成一次后不再触发
  - 引导文本简洁口语化，气泡对话框样式
  - 实现每日挑战(固定随机种子，禁用局外成长)
  - 实现每周挑战(更高难度，丰厚奖励)
  - 挑战数据存储localStorage

  **Must NOT do**:
  - 不要强制玩家完成引导

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 相对简单的引导系统
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T17, T18, T19, T20, T21, T22, T23)
  - **Blocks**: T31
  - **Blocked By**: T1, T4

  **References**:

  **Pattern References**:
  - `js/ui.js` - UIManager
  - `js/main.js` - 游戏初始化

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 新手引导流程验证
    Tool: Playwright
    Preconditions: 首次进入游戏(清除localStorage)
    Steps:
      1. 验证引导第一步出现(移动飞机提示)
      2. 移动飞机，验证"叮"音效
      3. 验证第二步(射击提示)
      4. 完成所有5步
      5. 验证引导结束
      6. 刷新页面，验证引导不再触发
    Expected Result: 引导流程完整，只触发一次
    Evidence: .sisyphus/evidence/task-24-tutorial.png
  ```

  **Commit**: YES
  - Message: `feat(tutorial): 5-step new player guide, daily/weekly challenges`
  - Files: `js/main.js`, `js/ui.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 25. Audio System (Points 911-935)

  **What to do**:
  - 实现音效系统(Howler.js或Web Audio API)
  - 5层音效: UI音效层/射击音效层/命中击杀层/环境音效层/音乐层
  - 20种武器独立射击音效
  - 命中音效(根据武器类型变化)
  - 击杀音效(根据死亡方式: 火烧-燃烧音/冰冻-玻璃碎裂/电死-电击)
  - 暴击音效(高音调"叮")
  - 20种道具拾取音效
  - Boss出场音效(低音警报+WARNING)
  - Boss击败音效(爆炸+胜利号角)
  - 玩家升级音效(上升音阶do-mi-sol-do)
  - 玩家受伤音效(短促警报，<30%心跳声)
  - 30种主动技能独立音效
  - 背景音乐: 主菜单舒缓/普通关卡120-130BPM/BOSS战140-160BPM
  - 音乐平滑切换(1.5秒交叉渐变)
  - 环境音效(太空嗡嗡声，极低音量)
  - 音量设置(总/音效/音乐三个滑块，localStorage记忆)
  - 低性能模式关闭环境音效和音乐

  **Must NOT do**:
  - 不要使用外部音频文件(保持程序化生成)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 音效系统需要Web Audio API知识
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T26, T27, T28, T29, T30)
  - **Blocks**: T31
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `js/audio.js:1-350` - AudioManager完整实现，程序化音效生成
  - `js/audio.js:52-71` - _playTone方法，振荡器音效模式
  - `js/audio.js:73-100` - _playNoise方法，噪声音效模式

  **WHY Each Reference Matters**:
  - `audio.js`现有模式: 所有新音效需要遵循相同的Web Audio API模式

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 音效系统验证
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 验证射击音效播放
      2. 验证命中音效播放
      3. 验证击杀音效播放
      4. 验证Boss出场音效
      5. 验证Boss战BGM切换
      6. 调整音量滑块，验证音量变化
      7. 刷新页面，验证音量设置保持
    Expected Result: 所有音效正常
    Evidence: .sisyphus/evidence/task-25-audio.png
  ```

  **Commit**: YES
  - Message: `feat(audio): complete sound system with 5-layer audio, BGM transitions`
  - Files: `js/audio.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 26. Particle System & Effects (Points 951-974)

  **What to do**:
  - 实现粒子对象池(上限150个)
  - 每个粒子有生命周期(0.5-3秒)，超时回收
  - 超过屏幕外粒子立即回收
  - 特效等级三档: 低(粒子-50%)/中(粒子-30%)/高(全特效)
  - 实现爆炸效果(径向扩散冲击波0.5秒)
  - 实现屏幕震动(3-8px，0.2-0.5秒，可关闭)
  - 实现弹道拖尾(稀有+，长度10-30px，渐变透明)
  - 实现Boss出场屏幕变暗(50%黑色1秒)
  - 实现无敌状态闪烁(0.3秒切换)
  - 实现经验条升级闪光(白色0.15秒)
  - 实现暴击视觉(伤害数字150%放大金色+星形粒子)
  - 实现低血量警告(红色暗角vignette)
  - 实现道具掉落光柱(普通无/稀有蓝30px/史诗紫50px/传说金80px)
  - 实现能量币拾取弧线飞向UI
  - 实现技能冷却完成闪光(图标放大110%)
  - 所有粒子使用离屏Canvas预渲染

  **Must NOT do**:
  - 不要使用复杂纹理贴图(保持纯色+渐变)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 粒子系统是游戏视觉核心
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T25, T27, T28, T29, T30)
  - **Blocks**: T27, T28
  - **Blocked By**: T6

  **References**:

  **Pattern References**:
  - `js/particles.js:1-1038` - Particle/ParticleSystem完整实现
  - `js/particles.js:12-38` - Particle类
  - `js/particles.js:46-80` - init方法，粒子初始化

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 粒子系统验证
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 验证爆炸粒子效果
      2. 验证屏幕震动效果
      3. 验证弹道拖尾效果
      4. 验证低血量红色暗角
      5. 验证暴击金色数字
      6. 验证粒子数量≤150
    Expected Result: 所有视觉效果正常
    Evidence: .sisyphus/evidence/task-26-particles.png
  ```

  **Commit**: YES
  - Message: `feat(particles): object pool, visual effects, screen shake, damage numbers`
  - Files: `js/particles.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 27. Element Visual Effects (Points 88, 94, 100, 106, 953-960)

  **What to do**:
  - 实现中毒视觉: 敌人变绿+绿色气泡粒子上升
  - 实现冰冻视觉: 敌人变蓝冰块+冰晶纹理+碎裂飞散
  - 实现燃烧视觉: 敌人全身着火+火星粒子飘动
  - 实现闪电视觉: 锯齿黄色电弧+垂直黄色光柱
  - 实现虚空视觉: 深紫色裂缝+吸积盘
  - 实现圣光视觉: 金色发光弹+金色光环
  - 实现黑洞视觉: 深紫色旋转漩涡+吸积盘
  - 实现流派终极天赋屏幕边缘光晕(对应颜色)
  - 元素主题颜色: 中毒#00ff88/冰冻#00ccff/火焰#ff6600/闪电#ffdd00/虚空#8800ff/圣光#ffd700

  **Must NOT do**:
  - 不要使用复杂纹理

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 纯视觉特效工作
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T25, T26, T28, T29, T30)
  - **Blocks**: T31
  - **Blocked By**: T26

  **References**:

  **Pattern References**:
  - `js/particles.js` - 粒子系统
  - `js/enemies.js` - 敌人绘制

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 元素特效验证
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 使用火焰武器，验证敌人着火特效
      2. 使用冰冻武器，验证冰块碎裂特效
      3. 使用毒液武器，验证绿色气泡特效
      4. 使用闪电武器，验证黄色电弧特效
    Expected Result: 每种元素特效独特且可见
    Evidence: .sisyphus/evidence/task-27-element-fx.png
  ```

  **Commit**: YES
  - Message: `feat(effects): element visual effects for poison/freeze/burn/lightning`
  - Files: `js/particles.js`, `js/enemies.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 28. Screen Shake & Damage Numbers (Points 304-308, 956, 965)

  **What to do**:
  - 实现屏幕震动(大型爆炸/Boss出场/大量伤害时3-8px)
  - 震动可在设置中关闭或调低(0-100%滑块)
  - 实现伤害数字系统: 普通白色/暴击黄色放大150%/持续伤害绿/橙小号快速跳动
  - 伤害数字从命中点向上飘动0.8秒渐隐
  - 实现暴击星形粒子
  - 实现Boss出场屏幕变暗效果

  **Must NOT do**:
  - 不要让屏幕震动影响性能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 相对简单的视觉反馈
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T25, T26, T27, T29, T30)
  - **Blocks**: T31
  - **Blocked By**: T26

  **References**:

  **Pattern References**:
  - `js/core.js:60-64` - 屏幕震动变量
  - `js/particles.js` - 粒子系统

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 伤害数字验证
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 射击敌人，验证白色伤害数字
      2. 触发暴击，验证黄色放大数字
      3. 使用火焰武器，验证橙色持续伤害数字
      4. 验证数字向上飘动0.8秒渐隐
    Expected Result: 伤害数字系统完整
    Evidence: .sisyphus/evidence/task-28-damage-numbers.png
  ```

  **Commit**: YES
  - Message: `feat(effects): screen shake, damage numbers, critical visuals`
  - Files: `js/particles.js`, `js/core.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 29. Performance Optimization - Canvas Layers (Points 983-993)

  **What to do**:
  - 实现多Canvas分层渲染(背景/游戏/粒子/UI)
  - 背景层不需要每帧重绘
  - 使用离屏Canvas预渲染静态元素
  - 使用精灵图合并小图标
  - requestAnimationFrame驱动主循环
  - 游戏逻辑固定60Hz(delta time修正)
  - 避免在热路径中创建新对象
  - 使用预分配数组和手动索引
  - 移动端DPR>2时使用DPR/2分辨率
  - 低性能模式自动降级(帧率<30fps持续5秒→降级)
  - 低性能模式: 粒子-50%/关闭拖尾/子弹上限100

  **Must NOT do**:
  - 不要改变游戏玩法

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 底层性能优化
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T25, T26, T27, T28, T30)
  - **Blocks**: T31, T33
  - **Blocked By**: T6, T8

  **References**:

  **Pattern References**:
  - `js/core.js:1-476` - Game类完整实现
  - `js/core.js:100-200` - 游戏循环

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 性能优化验证
    Tool: Playwright
    Preconditions: 游戏运行中，大量敌人和子弹
    Steps:
      1. 验证帧率≥55fps(前期)
      2. 到达50波+，验证帧率≥30fps
      3. 验证Canvas分层生效(DevTools检查多个canvas)
      4. 验证低性能模式自动降级
    Expected Result: 性能达标
    Evidence: .sisyphus/evidence/task-29-performance.png
  ```

  **Commit**: YES
  - Message: `perf(render): canvas layers, offscreen rendering, DPR optimization`
  - Files: `js/core.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 30. Service Worker & Offline Support (Points 67-69, 994-996)

  **What to do**:
  - 实现Service Worker缓存所有游戏资源
  - 缓存策略: Cache First(优先缓存，后台更新)
  - 离线状态下也能打开游戏
  - 实现版本更新检查(对比manifest)
  - Cloudflare Pages部署优化: Auto Minify/Brotli/HTTP/3
  - Cache-Control: max-age=31536000

  **Must NOT do**:
  - 不要破坏现有功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 相对简单的Service Worker
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T25, T26, T27, T28, T29)
  - **Blocks**: T31, T34
  - **Blocked By**: T7

  **References**:

  **Pattern References**:
  - `index.html` - HTML入口
  - 需要创建 `sw.js` - Service Worker文件

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 离线支持验证
    Tool: Playwright
    Preconditions: 游戏已加载过一次
    Steps:
      1. 断开网络
      2. 刷新页面
      3. 验证游戏正常加载
      4. 验证游戏功能正常
    Expected Result: 离线状态游戏可用
    Evidence: .sisyphus/evidence/task-30-offline.png
  ```

  **Commit**: YES
  - Message: `feat(pwa): service worker, offline support, CF Pages optimization`
  - Files: `sw.js`, `index.html`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 31. System Integration & Bug Fixes (Points 474-477, All Known Bugs)

  **What to do**:
  - 集成所有系统: 游戏流程+流派+武器+技能+天赋+敌人+道具+商店+UI+音效+特效
  - 修复已知Bug:
    - 暴风雪技能没效果【用户反馈】→ 验证范围减速和冰霜特效可见
    - 剧毒技能没效果【用户反馈】→ 验证敌人绿光和持续掉血数字
    - Boss血条不横贯屏幕 → 验证血条≥90%宽度
    - 击杀回血Bug → 验证只有击杀才回血
    - 武器融合"完全没做" → 验证15种融合配方可用
    - 电脑端不能全屏 → 验证F11全屏
  - 确保所有系统协同工作，无冲突
  - 确保所有localStorage数据正确存取
  - 确保所有UI界面正确切换

  **Must NOT do**:
  - 不要添加新功能（只修复Bug和集成）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 复杂的系统集成和Bug修复
  - **Skills**: [`follow-plan`, `karpathy-skills`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: ALL previous tasks

  **References**:

  **Pattern References**:
  - 所有JS文件 - 需要确保系统间正确连接
  - `js/main.js` - 集成入口，需要确保所有模块正确初始化

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 已知Bug修复验证【用户明确要求】
    Tool: Playwright
    Preconditions: 游戏运行中
    Steps:
      1. 选择冰冻流，验证暴风雪技能效果可见（雪花粒子+敌人减速变蓝）
      2. 选择剧毒流，验证剧毒效果可见（敌人绿色+掉血数字）
      3. 到达Boss波，验证Boss血条横贯屏幕顶部
      4. 击杀Boss，验证15秒缓冲期
      5. 使用吸血光环流，验证只有击杀才回血
      6. 获得两把满级武器+融合核心，验证融合可用
      7. 按F11，验证全屏模式
    Expected Result: 所有已知Bug已修复
    Evidence: .sisyphus/evidence/task-31-bugfixes.png

  Scenario: 完整游戏流程集成测试
    Tool: Playwright
    Preconditions: 首次游戏
    Steps:
      1. 主菜单→流派选择→难度选择→倒计时→游戏
      2. 升级选择技能→击杀敌人→拾取道具
      3. 到达Boss波→击败Boss→缓冲期
      4. 继续游戏→死亡→结算面板
      5. 再来一局→验证流程循环
    Expected Result: 完整流程无卡顿
    Evidence: .sisyphus/evidence/task-31-integration.png
  ```

  **Commit**: YES
  - Message: `fix(integration): system integration, bug fixes for known issues`
  - Files: ALL JS files
  - Pre-commit: `npx serve . -p 8080`

- [ ] 32. Full Verification Checklist (Points 12 Testing Section)

  **What to do**:
  - 逐条对照1000点文档第12部分"测试与验收清单"
  - 核心机制测试: Boss血条/Boss缓冲期/Boss不连轴/击杀回血修复/随机出怪/随机子弹
  - 武器技能测试: 20种武器/融合配方/剧毒效果/暴风雪效果/加弹道/技能描述一致
  - 流派测试: 20个流派被动/终极天赋/技能叠加/图鉴完整
  - 道具商店测试: 回血道具/商店购买/能量币计算
  - UI适配测试: 手机竖屏/桌面全屏/按钮可点击
  - 音效测试: 音效播放/音量调节/Boss战BGM
  - 性能测试: 后期帧率/低性能模式/对象池上限
  - 数值测试: Boss战无刮痧/成长曲线平滑/升级可感知
  - 数据持久化测试: localStorage存取/刷新保持/隐私模式

  **Must NOT do**:
  - 不要修改代码（只验证）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 全面的验证测试
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: T31

  **References**:

  **Pattern References**:
  - 1000点文档第12部分 - 测试与验收清单

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 完整验收清单验证
    Tool: Playwright + DevTools
    Preconditions: 游戏完整运行
    Steps:
      1. 逐条验证核心机制测试清单
      2. 逐条验证武器与技能测试清单
      3. 逐条验证流派测试清单
      4. 逐条验证道具与商店测试清单
      5. 逐条验证UI与适配测试清单
      6. 逐条验证音效测试清单
      7. 逐条验证性能测试清单
      8. 逐条验证数值测试清单
      9. 逐条验证数据持久化测试清单
    Expected Result: 所有验收项通过
    Evidence: .sisyphus/evidence/task-32-verification.png
  ```

  **Commit**: NO (verification only)

- [ ] 33. Mobile Performance Optimization (Points 991-993, 893-897)

  **What to do**:
  - 移动端Canvas分辨率自适应(DPR>2时DPR/2)
  - 低性能模式自动降级(帧率<30fps持续5秒)
  - 低性能模式: 粒子-50%/关闭拖尾/子弹上限100/敌人上限30
  - 移动端HUD简化(合并能量币和击杀数)
  - 移动端技能图标缩小但保持可点击
  - 刘海屏安全区域适配
  - 触摸操作优化(滑动灵敏度)

  **Must NOT do**:
  - 不要影响桌面端体验

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 移动端性能优化需要深度调试
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: T29, T31

  **References**:

  **Pattern References**:
  - `js/core.js` - 游戏循环和Canvas管理
  - `js/ui.js` - UI管理器

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 移动端性能验证
    Tool: Playwright (mobile viewport)
    Preconditions: 设置移动端视口(375×812)
    Steps:
      1. 验证游戏加载正常
      2. 验证UI元素布局正确
      3. 验证触摸操作正常
      4. 验证帧率≥30fps
      5. 验证低性能模式降级
    Expected Result: 移动端体验流畅
    Evidence: .sisyphus/evidence/task-33-mobile.png
  ```

  **Commit**: YES
  - Message: `perf(mobile): DPR optimization, low-perf mode, touch optimization`
  - Files: `js/core.js`, `js/ui.js`
  - Pre-commit: `npx serve . -p 8080`

- [ ] 34. Cloudflare Pages Deployment (Points 996)

  **What to do**:
  - 准备Cloudflare Pages部署
  - 确保所有资源使用相对路径
  - 确保Service Worker正确注册
  - 配置Auto Minify(HTML/CSS/JS)
  - 配置Brotli压缩
  - 配置HTTP/3
  - 配置Cache-Control: max-age=31536000
  - 创建部署文档

  **Must NOT do**:
  - 不要修改游戏逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的部署配置
  - **Skills**: [`follow-plan`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: T31

  **References**:

  **Pattern References**:
  - `index.html` - HTML入口
  - `sw.js` - Service Worker

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 部署验证
    Tool: Bash
    Preconditions: 代码准备就绪
    Steps:
      1. 验证所有文件使用相对路径
      2. 验证Service Worker注册
      3. 验证无硬编码绝对路径
    Expected Result: 可直接部署到CF Pages
    Evidence: .sisyphus/evidence/task-34-deploy.png
  ```

  **Commit**: YES
  - Message: `chore(deploy): Cloudflare Pages configuration`
  - Files: `index.html`, `sw.js`
  - Pre-commit: `npx serve . -p 8080`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run linter + check all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(core): game flow, player system, HUD, persistence, performance foundation`
- **Wave 2**: `feat(combat): weapons, factions, skills, talents, fusion systems`
- **Wave 3**: `feat(content): enemies, bosses, items, shop, menus, waves`
- **Wave 4**: `feat(audio-visual): sound system, particles, effects, performance optimization`
- **Wave 5**: `fix(integration): system integration, bug fixes, mobile optimization, deployment`
- **Final**: `chore: final verification and cleanup`

---

## Success Criteria

### Verification Commands
```bash
# Start local server
npx serve D:\works\stg-game -p 8080

# Playwright: Open game, verify main menu loads
# Playwright: Select faction, start game, verify gameplay
# Playwright: Verify boss blood bar spans screen
# Playwright: Verify 暴风雪 skill effect visible
# Playwright: Verify 剧毒 skill effect visible
# Playwright: Verify weapon fusion works
# Performance: requestAnimationFrame timing ≥55fps
```

### Final Checklist
- [ ] All 1000 optimization points implemented
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] 暴风雪 skill works (visible frost effect + slow)
- [ ] 剧毒 skill works (green glow + DOT numbers)
- [ ] Boss blood bar spans screen top
- [ ] Boss buffer period after kill (15s minimum)
- [ ] Kill-to-heal bug fixed
- [ ] Weapon fusion system works (15 recipes)
- [ ] Full screen adaptation (16:9 letterbox)
- [ ] Mobile portrait UI works
- [ ] FPS ≥55 on iPhone SE (early game)
- [ ] FPS ≥30 on iPhone SE (50+ waves)
- [ ] Desktop ≥60fps throughout
- [ ] First load <3 seconds
- [ ] localStorage persistence works
- [ ] Service Worker offline support
