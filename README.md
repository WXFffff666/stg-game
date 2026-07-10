# 🎮 星域战机 (Star Domain STG)

> HTML5 Canvas 弹幕飞行射击游戏 | 无尽波次 | 87流派 × 200+技能 × 50+武器 × 融合系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-HTML5-orange.svg)]()

🕹️ **在线试玩**: [https://game1.the37777777.top](https://game1.the37777777.top)

---

## 🎯 游戏特色

### 87 种流派
每个流派拥有核心被动、3 个专属技能、终极被动；缺失配置的流派会在运行时自动补全。

### 天赋树（3 通用 + 2 流派专属）
- **战斗 / 生存 / 功能** 三条通用主干
- **流派攻击链 / 流派终极链** 随所选流派变色联动

### 武器升级与融合
- 重复选择同一武器可升级至 **Lv.8**（里程碑 3/5/8）
- 两把武器 Lv.5+ 消耗融合核心可融合进化
- 技能融合、商店/波次奖励/升级三选一 统一升级轨道

### 性能优化（v1.1）
- 单 RAF 游戏循环（HUD 不再独立循环）
- 追踪弹共享寻敌目标 + 碰撞网格查询
- 穿透弹 Set 复用（零分配热路径）
- 低性能模式自动降级

### 敌人系统
- 16+ 敌人类型（小兵、快速兵、中型机、障碍物、精英机、狙击机、分裂者、护盾者、冲锋者、编织者、传送者、生成者、坦克、狙击精英、集群者、神风）
- 4 种 BOSS（守护者、召唤者、巨龙、经典BOSS）
- 每种敌人独特外形和 AI 行为
- 波次制：每 5 关精英波，每 10 关 BOSS

---

## 🚀 快速开始

```bash
# 启动本地服务器
python -m http.server 8080
# 或
npx serve .

# 浏览器打开
http://localhost:8080
```

或直接部署到 **Cloudflare Pages**（纯静态文件）。

---

## 🎮 操作说明

| 操作 | 按键 |
|------|------|
| 移动战机 | 鼠标移动 / 触摸滑动 |
| 射击 | 自动 |
| 暂停/恢复 | `P` 或 `ESC` |
| 全屏切换 | `F` |
| 选择技能 | 点击技能卡片 |

---

## 📁 项目结构

```
stg-game/
├── index.html          # 入口 HTML + CSS
├── README.md
└── js/
    ├── config.js       # 游戏数据配置（驱动整个游戏）
    ├── core.js         # 游戏引擎（循环/对象池/Canvas/场景/碰撞）
    ├── player.js       # 玩家实体（20种飞机造型/输入/HP/护盾）
    ├── bullets.js      # 子弹实体 + 弹道生成器
    ├── enemies.js      # 敌人 AI + 波次生成 + BOSS
    ├── items.js        # 道具掉落 + Buff/Debuff 系统
    ├── weapons.js      # 武器管理器
    ├── skills.js       # XP升级 + 技能选择
    ├── particles.js    # 粒子特效（爆炸/闪电/冲击波/星空）
    ├── storage.js      # localStorage 存档 + 排行榜
    ├── audio.js        # Web Audio 程序化音效/BGM
    ├── ui.js           # UI 管理
    └── main.js         # 集成入口
```

---

## 🛠️ 技术栈

- **纯 Vanilla JavaScript**（ES6+，零依赖）
- **HTML5 Canvas 2D** 渲染
- **Web Audio API** 程序化音效
- **localStorage** 数据持久化
- **requestAnimationFrame** + deltaTime 游戏循环
- **对象池** 模式优化性能
- **数据驱动** 架构（config.js 定义所有内容）

---

## 📊 游戏数据

| 类别 | 数量 |
|------|------|
| 流派 | 20 |
| 技能 | 200 |
| 武器/弹道 | 20 |
| 道具 | 40 |
| 敌人类型 | 16+ |
| BOSS | 4 |
| 飞机造型 | 20 |
| 总代码行数 | ~11,500 |

---

## 🌐 Cloudflare Pages 部署

### 方式 A：Git 连接（Dashboard）

1. 在 Cloudflare Pages 中连接 GitHub 仓库 `WXFffff666/stg-game`
2. 构建设置：
   - **构建命令**：留空（或填 `exit 0`）
   - **输出目录**：`.`（根目录，不要用 `/`）
   - **生产分支**：`master`
3. 部署完成

若出现 `Failed: unable to submit build job`（卡在 Initializing build environment），这是 **Cloudflare 与 GitHub 集成故障**，不是代码问题。按下方「故障排查」处理。

### 方式 B：GitHub Actions 直接上传（推荐，更稳定）

仓库已包含 `.github/workflows/deploy-cloudflare-pages.yml`，用 Wrangler **Direct Upload** 上传静态文件，不经过 CF 的 Git 构建队列。

**一次性配置：**

1. Cloudflare Dashboard → **My Profile** → **API Tokens** → Create Token  
   - 模板选 **Edit Cloudflare Workers**，或自定义权限包含 **Account → Cloudflare Pages → Edit**
2. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**，添加：
   - `CLOUDFLARE_API_TOKEN`：上一步的 Token
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 控制台右侧边栏 Account ID
3. 确认 Pages 项目名称为 `stg-game`（若不同，改 workflow 里的 `--project-name=`）
4. push 到 `master` 后 Actions 自动部署；也可在 Actions 页手动 **Run workflow**

### 方式 C：本地命令行部署

```bash
npx wrangler login
npx wrangler pages deploy . --project-name=stg-game --branch=master
```

### 故障排查：`unable to submit build job`

| 步骤 | 操作 |
|------|------|
| 1 | Cloudflare Pages 项目 → **Settings** → **Builds** → 暂时关闭 **Automatic deployments**（若已用 Actions） |
| 2 | GitHub → **Settings** → **Applications** → **Cloudflare Pages** → 检查授权 → 必要时 **Reconfigure** 或重装 |
| 3 | Cloudflare → **Workers & Pages** → 创建项目 → **Connect to Git** → 重新连接 GitHub |
| 4 | 改用 **方式 B（GitHub Actions）** 或 **方式 C（wrangler 本地）** |

排行榜功能在本地使用 localStorage，部署后可配合 Cloudflare Workers + KV 实现联网排行。

---

## 📝 License

MIT

---

**Enjoy the bullet hell! 🎆**
