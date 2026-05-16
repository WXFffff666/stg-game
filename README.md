# 🎮 星域战机 (Star Domain STG)

> HTML5 Canvas 弹幕飞行射击游戏 | 无尽波次 | 20流派 × 200技能 × 20武器 × 40道具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-HTML5-orange.svg)]()

---

## 🎯 游戏特色

### 20 种流派
⚡攻速流 · 🛡️反伤流 · 💥暴击流 · 🛸召唤流 · 🔥元素流 · 🩸吸血流转 · 🔮盾反流 · ☠️毒伤流 · ❄️冰控流 · 🌊弹幕流 · 🌌重力流 · 🕳️虚空流 · 🌩️雷电流 · 🍃风之流 · 🌑暗影流 · ✨圣光流 · 🩸血祭流 · 🧲磁力流 · 🪞镜之流 · ⏳时之流

### 200 种技能
- 40+ 独特主动/视觉技能（流星雨、黑洞、激光扫射、冰霜新星、时间冻结等）
- 160 参数化被动技能
- 升级时三选一，稀有度权重随机
- 击杀/受击/闪避/暴击条件触发

### 20 种武器弹道
标准弹 · 追踪弹 · 激光炮 · 散射弹 · 浮游炮 · 电弧链 · 回旋镖 · 穿甲弹 · 爆破弹 · 波动炮 · 导弹群 · 针弹 · 重力井 · 火焰喷射 · 手里剑 · 虚空裂隙 · 雷电 · 冰晶 · 火箭弹幕 · 光子束

### 40 种道具
26 Buff + 14 Debuff，包含回血、火力升级、速度提升、护盾、磁铁、无敌、经验翻倍、减速力场、暴击提升、分数翻倍等

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

1. Fork 本仓库
2. 在 Cloudflare Pages 中连接仓库
3. 构建设置：
   - 构建命令：留空
   - 输出目录：`/`（根目录）
4. 部署完成

排行榜功能在本地使用 localStorage，部署后可配合 Cloudflare Workers + KV 实现联网排行。

---

## 📝 License

MIT

---

**Enjoy the bullet hell! 🎆**
