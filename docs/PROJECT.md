# 切一半 — 项目总览

> 一句话项目描述：**玩家拖动一条水平切割线，把物体精准切成 50% / 50%，精确命中即通关。**
> 产品阶段：**MVP 内测**（1 关 / 矩形物体 / 3 刀 + 2 个道具）
> 技术栈：**Cocos Creator 3.8 + TypeScript**，目标平台 **抖音小游戏**

---

## 1. 快速开始

```bash
# 1. 用 Cocos Creator 3.8 打开
open cocos-project

# 2. 打开任一 .scene（Menu/Game/Result/Fail/GameOver），点击 Play
# 3. 菜单 → 开始游戏 → 拖动切割线 → 点击「切」按钮
```

开发/调试：
- 预览分辨率：**720 × 1280**（竖屏）
- 自适应策略：`ResolutionPolicy.FIXED_WIDTH`
- 逻辑分辨率：720（宽）

---

## 2. 文档地图

| 文件 | 用途 |
|------|------|
| `PRD.md` | **产品需求文档**（核心玩法、判定规则、道具、里程碑） |
| `docs/PROJECT.md` | **本文件**（项目总览、快速开始、目录说明） |
| `docs/ARCHITECTURE.md` | **代码架构**（目录结构、模块职责、事件流、数据流） |
| `docs/ITEMS-DESIGN.md` | **道具系统设计**（2 个 MVP 道具 + 4 个 M4 道具 + UI） |
| `docs/decisions.md` | **设计决策日志**（为什么这样做、有哪些取舍） |
| `AGENTS.md` | **给 AI / 接手者的交接说明**（scene 备份、Cocos 注意点） |
| `prototype-v0.4.html` | **高保真原型**（HTML/CSS 版，可直接浏览器打开参考视觉） |
| `cocos-project/.mavis/plans/plan.yaml` | 可执行的开发任务计划（Mavis 专用） |

**推荐阅读顺序**：`PRD.md` → `docs/PROJECT.md` → `docs/ARCHITECTURE.md` → `docs/decisions.md` → `docs/ITEMS-DESIGN.md`

---

## 3. MVP 交付清单

✅ **已完成**（v0.4）：

- [x] **核心玩法**：拖动切割线 → 切 → 判定（严格 50%）
- [x] **3 刀机制**：失败扣 1 刀，3 刀用尽 → GameOver
- [x] **2 个道具**：撤销（undo）、再切一刀（recut）+ 3 秒倒计时
- [x] **5 个场景**：主菜单 / 游戏 / 通关 / 失败 / GameOver
- [x] **视觉系统**：橙/金/薄荷主题、像素卡通风格、按下回弹按钮
- [x] **音频**：BGM 循环 + 切刀/完美/失败/滴答/道具/按钮 SFX
- [x] **首次引导**：TutorialOverlay（提示切到中间）
- [x] **设计系统**：`Theme.ts` 统一颜色 / 圆角 / 阴影 / 字号常量
- [x] **设置弹窗**：BGM / 音效开关，localStorage 持久化
- [x] **TypeScript 无错误**

**下一步计划**（详见 `PRD.md` / `docs/decisions.md`）：
- M3：多关卡（20 关）、多形状（西瓜/蛋糕/披萨等不规则形状）
- M4：复杂形状 + 4 个新道具（放大镜/中心线/减半/自动切）
- M5：抖音激励视频广告接入
- M6：排行榜、无尽模式

---

## 4. 核心目录结构

```
切一半/
├── PRD.md                                 # 产品需求文档
├── AGENTS.md                              # 项目交接说明
├── prototype-v0.4.html                    # 高保真原型（HTML/CSS）
├── docs/                                  # ← 所有设计/架构文档
│   ├── PROJECT.md                         # 本文件
│   ├── ARCHITECTURE.md                    # 代码架构
│   ├── ITEMS-DESIGN.md                    # 道具系统
│   └── decisions.md                       # 设计决策
└── cocos-project/                         # Cocos Creator 工程根目录
    ├── assets/
    │   ├── scenes/                        # 5 个 .scene（Menu/Game/Result/Fail/GameOver）
    │   │   ├── MenuScene.scene
    │   │   ├── GameScene.scene
    │   │   ├── ResultScene.scene
    │   │   ├── FailScene.scene
    │   │   └── GameOverScene.scene
    │   ├── scripts/                       # 全部 TypeScript 源码
    │   │   ├── AdaptiveLayout.ts          # 跨场景自适应（FIXED_WIDTH + 安全区）
    │   │   ├── audio/                     # 音频单例
    │   │   │   └── AudioManager.ts        # BGM 循环 + SFX 池 + localStorage 开关
    │   │   ├── core/                      # 游戏核心逻辑
    │   │   │   ├── GameManager.ts         # ★ 状态机 + 刀数 + 判定 + 事件中心
    │   │   │   ├── GameConfig.ts          # 游戏常量（CUT/KNIVES/COUNTDOWN/TIERS/LEVELS/ITEM）
    │   │   │   └── CutValidator.ts        # 切割比例计算（纯数学函数，易测试）
    │   │   ├── gameplay/                  # 玩法相关组件
    │   │   │   ├── CutLine.ts             # 切割线拖动 + 整数像素吸附 + 钳制
    │   │   │   ├── CutAnimator.ts         # 切刀动画 + 物体分离 + 掉落
    │   │   │   └── CutObject.ts           # 被切割物体（矩形 + 边缘高亮）
    │   │   ├── items/                     # 道具系统
    │   │   │   └── ItemManager.ts         # 道具库存 + 3 秒倒计时 + 事件驱动 UI
    │   │   ├── routing/                   # 场景路由
    │   │   │   └── SceneRouter.ts         # navigateTo / goBack / 一次性 payload
    │   │   ├── ui/                        # UI 层（按组件/场景/主题/引导分层）
    │   │   │   ├── components/            # 可复用 UI 组件
    │   │   │   │   ├── PrimaryButton.ts   # 主按钮（橙底+深橙阴影+按下回弹）
    │   │   │   │   ├── SecondaryButton.ts # 次按钮（白底+边框）
    │   │   │   │   ├── Toast.ts           # 顶部提示
    │   │   │   │   ├── Toggle.ts          # 开关（BGM / SFX 用）
    │   │   │   │   ├── CountdownPill.ts   # 倒计时胶囊（秒数显示）
    │   │   │   │   ├── CountdownRing.ts   # 倒计时圆环（可选视觉）
    │   │   │   │   ├── FailMessage.ts     # 失败文案（带情绪色）
    │   │   │   │   ├── ItemSlot.ts        # 道具槽（undo/recut）
    │   │   │   │   ├── KnifeBadge.ts      # 刀数徽章（显示 N/3）
    │   │   │   │   ├── LevelBadge.ts      # 关卡徽章（Lv.1）
    │   │   │   │   └── PercentageDisplay.ts # 比例大字（50%）
    │   │   │   ├── scenes/                # 场景 UI 控制器（每个 .scene 挂一个）
    │   │   │   │   ├── MenuSceneUI.ts     # 主菜单：标题 + 开始 + 设置
    │   │   │   │   ├── GameSceneUI.ts     # 游戏场景：TopBar + Stage + Footer
    │   │   │   │   ├── ResultSceneUI.ts   # 通关：50% 大字 + 完美 + 再来一局
    │   │   │   │   ├── FailSceneUI.ts     # 失败：比例 + 情绪文案 + 道具 + 倒计时
    │   │   │   │   ├── GameOverSceneUI.ts # GameOver：0 刀 + 返回菜单
    │   │   │   │   └── SettingsModal.ts   # 设置弹层（BGM/SFX 开关）
    │   │   │   ├── theme/
    │   │   │   │   └── Theme.ts           # ★ 统一设计系统（COLOR / RADIUS / SHADOW / FONT）
    │   │   │   └── tutorial/
    │   │   │       └── TutorialOverlay.ts # 首次引导（切到中间试试～）
    │   │   └── utils/
    │   │       └── Logger.ts              # 分级日志（debug/info/warn/error）+ 断言
    │   ├── resources/                     # Cocos dynamic load 专用目录
    │   │   └── audio/                      # 运行时 resources.load('audio/xxx')
    │   │       ├── bgm-loop.mp3
    │   │       ├── sfx-button.mp3
    │   │       ├── sfx-cut.wav
    │   │       ├── sfx-fail.wav
    │   │       ├── sfx-item.mp3
    │   │       ├── sfx-perfect.wav
    │   │       └── sfx-tick.wav
    │   └── textures/                      # 静态贴图（icons / bg / logo / particles）
    │       ├── icons/                     # back / recut / results / settings / timer / tutorial / undo
    │       ├── objects/                   # cake / chili / diamond / pizza / rect / watermelon
    │       ├── bg-menu.png / bg-game.png / bg-fail.png / bg-result.png / bg-gameover.png
    │       ├── cut-line.png
    │       ├── logo.png
    │       └── particle-confetti.png
    ├── library/                           # 自动生成（.gitignore）
    ├── settings/                          # Cocos 编辑器设置
    ├── extensions/                        # 扩展（暂无）
    ├── node_modules/                      # .gitignore
    ├── package.json
    ├── tsconfig.json
    └── .gitignore
```

---

## 5. 核心玩法流程（数据流）

```
【主菜单】→ 「开始游戏」
  ↓ SceneRouter.navigateTo('GameScene')
【游戏场景】
  ↓ 玩家拖动切割线
    CutLine → onTouchMove → clamp(0, objectHeight)
    → Math.round(y) 吸附整数像素
    → gameEventTarget.emit(GameEvent.RatioChanged, { ratio, near })
    → UI 更新：切割线变金色（near=true）
  ↓ 玩家点击「切」按钮
    GameManager.requestCut(cutLineY, objectNode)
    → emit(GameEvent.CutAnimationRequested)
    → CutAnimator 播放：刀光划过 → 上下分离 → 下方掉落
    → 动画完成 → emit(GameEvent.CutAnimationDone)
    → GameManager._doJudge(ratio)
    ├─ ratio === 50 → JudgeResult.pass
    │   → emit(JudgeResult, { pass:true, ratio })
    │   → AudioManager.playPerfect()
    │   → SceneRouter.navigateTo('ResultScene', { ratio })
    │
    └─ ratio !== 50 → JudgeResult.fail（扣 1 刀）
        → emit(JudgeResult, { pass:false, ratio, gameOver: knifes<=0 })
        → AudioManager.playFail()
        ├─ knife > 0 → 显示失败弹层（FailSceneUI）+ ItemManager 启动 3 秒倒计时
        │              玩家可点 undo / recut；倒计时结束 → 自动 undo 或进入 gameover
        └─ knife === 0 → SceneRouter.navigateTo('GameOverScene')

【通关场景】→ 「再来一局」→ SceneRouter.navigateTo('GameScene')
【失败场景】→ 同上；「返回菜单」→ SceneRouter.navigateTo('MenuScene')
```

---

## 6. 判定规则（来自 PRD §2）

- **切割比例** = `round(cutLineY / objectHeight * 100)`（整数比较，避免浮点误差）
- **通关条件**：`ratio === 50`（严格命中，无误差容许）
- **失败分级**（给 UI 用的颜色 & 文案）：
  | 差距 | 档位 | 颜色 | 文案 |
  |------|------|------|------|
  | 0 | win | 薄荷绿 | 完美！ |
  | 1 | tier1 | 黄 | 差 1%！就差一点了～ |
  | 2-5 | tier2 | 橙 | 差 N%，再来！ |
  | 6-10 | tier3 | 红 | 差 N%，再仔细看看 |
  | >10 | tier4 | 深红 | 差太远啦，物体中心在哪？ |
- **刀数**：每关初始 3 刀，切错 -1，切对通关（不扣刀）
- **道具**：undo 撤销上一刀并 +1 刀；recut 额外 +1 刀（MVP 默认可用，M5 接入激励视频）

---

## 7. 事件中心（gameEventTarget）

所有模块通过 `Node` 事件通信，避免模块间强耦合。详见 `docs/ARCHITECTURE.md` §4。

**核心事件**：
- `GameEvent.KnivesChanged` → `{ remaining, max }`
- `GameEvent.RatioChanged` → `{ ratio, near }`
- `GameEvent.JudgeResult` → `{ pass, ratio, gameOver? }`
- `GameEvent.CutAnimationRequested` → `{ objectNode, cutLineY, ratio }`
- `GameEvent.CutAnimationDone` → `{ ratio }`
- `GameEvent.GameOver` / `GameEvent.Reset`
- `ItemEvent.Available` / `ItemEvent.CountdownTick` / `ItemEvent.Expired` / `ItemEvent.Used`
- `SettingsEvent.Bgm` / `SettingsEvent.Sfx`

---

## 8. 设计系统（Theme.ts）

所有颜色/圆角/阴影/字号统一在 `scripts/ui/theme/Theme.ts` 中定义：

```ts
COLOR.ORANGE      // #FF7F50 主色
COLOR.MINT        // #98FB98 副色
COLOR.GOLD        // #FFD700 强调
COLOR.CREAM       // #FFF8F0 背景
COLOR.INK         // #14171E 主文本
COLOR.MUTED       // #7C7A72 次要文本

RADIUS.SM / MD / LG / XL / PILL
SHADOW.BTN_OFFSET_Y / BTN_COLOR
FONT.H1(40) / H2(30) / H3(22) / BODY(16) / SMALL(13) / PERCENT_BIG(72)
```

---

## 9. 验收 & 自测清单

| 模块 | 验收项 |
|------|--------|
| 核心玩法 | 切割线可拖动、钳制在物体内、整数像素吸附 |
| 判定 | 切到 50% 必通关；切到 49% 或 51% 必失败 |
| 刀数 | 初始 3/3；每次失败 -1；到 0 进 GameOver |
| 道具 | undo 可撤销上一刀并 +1 刀；recut +1 刀；3 秒倒计时 |
| UI | 5 个场景渲染正确；按钮可点击；文案与情绪色对应 |
| 音频 | BGM 循环；切/完美/失败/道具/按钮 SFX 正常；设置开关生效 |
| 适配 | 720×1280 无黑边；长屏（如 XR）上下裁切合理；无 Home Indicator 遮挡 |
| 代码 | `npx tsc --noEmit -p cocos-project/tsconfig.json` 0 错 0 警 |

---

## 10. 后续计划

详见 `PRD.md` §7 + `docs/decisions.md` §5。

- **M3**：多形状 + 20 关卡 + 关卡选择 UI
- **M4**：复杂形状 + 像素级采样判定 + 4 个新道具
- **M5**：抖音激励视频（recut / 新道具解锁）+ 插屏广告
- **M6**：上线 & 数据复盘

---

## 11. 维护备注

- **.scene 文件不可直接手改**（Cocos 会用内部 UUID 引用），改组件属性走编辑器 `Add Component`，然后按 `Ctrl+S`
- **每个 .png/.wav/.mp3 都要有对应的 .meta**（由 Cocos 编辑器在导入时自动生成）
- **`resources/` 目录**：只有需要运行时 `resources.load()` 的文件放这里，其他贴图放在 `assets/textures/`
- **备份**：详见 `AGENTS.md` §3「scene 备份位置」

---

*最后更新：2026-06-04 — 项目处于 MVP 阶段。*
