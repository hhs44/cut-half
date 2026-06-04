# 切一半 — 代码架构（ARCHITECTURE）

> 适用版本：v0.4（MVP）
> 目的：为开发者 / 接手者提供模块地图、事件流、关键接口。

---

## 1. 架构总览

本项目采用 **单例 + 事件驱动 + 分层组件** 的架构：

```
                    ┌──────────────────────────┐
                    │  Cocos Creator .scene    │   ← 5 个场景文件，由编辑器维护
                    │  (Canvas 节点树)         │   ← .scene = Nodes + Components
                    └──────────┬───────────────┘
                               │ 在 Canvas 下挂以下组件
              ┌────────────────┼─────────────────┐
              ▼                ▼                 ▼
   ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
   │  GameManager    │  │ AudioManager │  │  ItemManager │  ← 全局单例，跨场景存活
   │  (状态机/判定)  │  │  (BGM/SFX)   │  │ (道具/倒计时)│
   └────────┬────────┘  └──────┬───────┘  └───────┬──────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                ▼
                    ┌─────────────────────────────┐
                    │   gameEventTarget (Node)    │  ← 全局事件中心（由 GameManager 提供）
                    └─────────────────────────────┘
                                ▲
                                │ 订阅/发射事件
            ┌───────────────────┼──────────────────────┐
            ▼                   ▼                      ▼
   ┌────────────────┐  ┌──────────────────┐    ┌──────────────────┐
   │  gameplay 层   │  │       ui 层       │    │      items 层    │
   │ CutLine        │  │  MenuSceneUI      │    │  ItemManager     │
   │ CutAnimator    │  │  GameSceneUI      │    │  (单例-事件驱动)  │
   │ CutObject      │  │  ResultSceneUI    │    └──────────────────┘
   └────────────────┘  │  FailSceneUI      │
                       │  GameOverSceneUI  │
                       │  SettingsModal     │
                       │  components/*      │
                       │  TutorialOverlay   │
                       │  theme/Theme.ts    │
                       └───────────────────┘
                                ▲
                                │
                    ┌───────────┴────────────┐
                    ▼                        ▼
           ┌────────────────┐        ┌──────────────────┐
           │   routing      │        │      utils       │
           │ SceneRouter    │        │  Logger          │
           └────────────────┘        └──────────────────┘
                ▲
                │ 调用
           ┌────────────────┐
           │ AdaptiveLayout │ ← 静态类，场景启动时调一次
           └────────────────┘
```

**核心原则**：
- **数据单向流动**：玩家输入 → `GameManager` 判定 → 发射事件 → UI/音频响应
- **模块零耦合**（尽量）：UI 组件不直接 import GameManager 的内部状态；全部通过 `gameEventTarget.on/off/emit`
- **资源隔离**：运行时加载的资源放在 `assets/resources/`，场景静态引用的放在 `assets/textures/`

---

## 2. 目录结构

```
cocos-project/assets/scripts/
├── AdaptiveLayout.ts          # 静态工具类：ResolutionPolicy + Widget + 安全区
├── audio/
│   └── AudioManager.ts        # ★ 单例：BGM 循环 + SFX 自动播放
├── core/                      # ★ 游戏核心
│   ├── GameManager.ts         # ★ 状态机 + 刀数 + 判定 + 事件中心
│   ├── GameConfig.ts          # 常量（CUT/KNIVES/COUNTDOWN/TIERS/LEVELS/ITEM）
│   └── CutValidator.ts        # 纯函数：computeRatio / isPerfectCut / isNearTarget
├── gameplay/                  # 玩法组件（挂到 scene 的 Sprite/Node 上）
│   ├── CutLine.ts             # 切割线拖动 + 钳制 + 整数像素吸附
│   ├── CutAnimator.ts         # 切刀动画（划过 → 分离 → 掉落）
│   └── CutObject.ts           # 被切割物体（矩形 + 上下边缘高亮）
├── items/                     # 道具系统
│   └── ItemManager.ts         # 道具库存 + 3 秒倒计时 + 事件驱动
├── routing/
│   └── SceneRouter.ts         # navigateTo / goBack / 一次性 payload
├── ui/                        # ★ UI 层
│   ├── components/            # 可复用 UI 组件（每个文件 = 1 个 Component）
│   │   ├── PrimaryButton.ts   # 主按钮
│   │   ├── SecondaryButton.ts # 次按钮
│   │   ├── Toast.ts           # 顶部提示
│   │   ├── Toggle.ts          # 开关
│   │   ├── CountdownPill.ts   # 倒计时胶囊
│   │   ├── CountdownRing.ts   # 倒计时圆环
│   │   ├── FailMessage.ts     # 失败情绪文案
│   │   ├── ItemSlot.ts        # 道具槽
│   │   ├── KnifeBadge.ts      # 刀数徽章
│   │   ├── LevelBadge.ts      # 关卡徽章
│   │   └── PercentageDisplay.ts # 比例大字（50%）
│   ├── scenes/                # 场景 UI 控制器（1 scene = 1 UI 控制器）
│   │   ├── MenuSceneUI.ts     # 主菜单
│   │   ├── GameSceneUI.ts     # 游戏场景
│   │   ├── ResultSceneUI.ts   # 通关
│   │   ├── FailSceneUI.ts     # 失败 + 道具
│   │   ├── GameOverSceneUI.ts # GameOver
│   │   └── SettingsModal.ts   # 设置弹层（BGM/SFX 开关）
│   ├── theme/
│   │   └── Theme.ts           # ★ 设计系统：COLOR / RADIUS / SHADOW / FONT
│   └── tutorial/
│       └── TutorialOverlay.ts # 首次引导（"切到中间试试～"）
└── utils/
    └── Logger.ts              # 分级日志 + 断言（DEBUG 环境可用）
```

**设计选择说明**：
- **`core/` vs `gameplay/`**：core 是与 UI 无关的纯逻辑（GameManager/GameConfig/CutValidator），可以独立跑单测；gameplay 是依赖 Cocos Node / Sprite / UITransform 的视觉组件。
- **`ui/components/`**：可复用组件，每个都是 `@ccclass`，可以在编辑器 Inspector 中挂到任意 Node；属性通过 `@property` 暴露给编辑器。
- **`ui/scenes/`**：每个场景一个 UI 控制器，职责是把 scene 中的节点关联起来，并订阅 `gameEventTarget`。
- **`theme/Theme.ts`**：不挂 Node，纯常量对象，全局 import 即可；业务代码不得手写颜色/字号字面量。

---

## 3. 全局单例 & 生命周期

| 单例 | 初始化位置 | 跨场景 | 状态数据 |
|------|-----------|--------|---------|
| `GameManager` | `MenuSceneUI.onLoad` → `_ensureSingleton('GameManagerNode','GameManager')` | √ | state, knives |
| `AudioManager` | 同上 | √ | bgmOn, sfxOn, loaded clips |
| `ItemManager` | 同上 | √ | timers（倒计时） |
| `gameEventTarget` | `GameManager.ts` 模块级 Node | √ | — (仅事件) |
| `SceneRouter` | 静态工具类 | √ | history[], pendingPayload |
| `AdaptiveLayout` | 静态工具类 | √ | 无状态 |
| `Logger` | 纯函数 | √ | `__LOG_LEVEL__` |

**生命周期要点**：
1. `MenuSceneUI.onLoad` 调用 `_ensureSingleton(...)`：如果节点不存在 → 创建新 Node（永久根节点）并挂组件。
2. `director.addPersistRootNode(this.node)` 保证单例跨场景存活，不被销毁。
3. 如果重复打开 MenuScene（比如从 GameScene 返回），第二个 GameManager 实例会在 `onLoad` 中发现已存在的 instance 并自毁（`this.node.destroy()`），防止重复。

---

## 4. 事件中心（Event Reference）

**发布者**：`GameManager.ts` 导出 `GameEvent` 常量字典 + `gameEventTarget: Node`。

**订阅模式**：在组件 `onLoad / start` 中 `gameEventTarget.on(GameEvent.X, handler, this)`，在 `onDestroy` 中 `gameEventTarget.off(...)`。

### 4.1 GameManager 事件

| 事件 | payload | 触发时机 |
|------|---------|----------|
| `GameEvent.KnivesChanged` | `{ remaining, max }` | 刀数变化 |
| `GameEvent.RatioChanged` | `{ ratio, near }` | 切割线拖动时实时更新（near=±2%） |
| `GameEvent.JudgeResult` | `{ pass, ratio, gameOver? }` | 切割动画结束后判定 |
| `GameEvent.CutAnimationRequested` | `{ objectNode, cutLineY, ratio }` | 玩家点击「切」按钮 |
| `GameEvent.CutAnimationDone` | `{ ratio }` | CutAnimator 动画完成 |
| `GameEvent.GameOver` | — | 3 刀用尽 |
| `GameEvent.Reset` | — | 道具 undo / 新局开始 |

### 4.2 ItemManager 事件

| 事件 | payload | 触发时机 |
|------|---------|----------|
| `ItemEvent.Available` | `{ itemId, owned }` | 失败后道具可用；胜利/重置后隐藏 |
| `ItemEvent.CountdownTick` | `{ sec }` | 倒计时每秒一次 |
| `ItemEvent.Expired` | — | 倒计时 0 秒 |
| `ItemEvent.Used` | `{ itemId }` | 玩家成功使用道具 |

### 4.3 SettingsModal 事件

| 事件 | payload |
|------|---------|
| `SettingsEvent.Bgm` | `{ on: boolean }` |
| `SettingsEvent.Sfx` | `{ on: boolean }` |

---

## 5. 切割判定算法（CutValidator）

```ts
// CutValidator.ts — 核心函数（纯数学，无副作用）

/**
 * 把切割线 Y 坐标与物体高度量化为 0-100 的整数比例。
 * 强制四舍五入到整数像素，避免浮点比较导致永远 ≠ 50。
 */
export function computeRatio(cutLineY: number, objectHeight: number): number {
    const y = Math.round(cutLineY);
    const h = Math.round(objectHeight);
    if (h <= 0) return 0;
    return Math.round((y * 100) / h);
}

export const CUT = { TARGET_RATIO: 50, ... };
export function isPerfectCut(ratio: number): boolean {
    return ratio === CUT.TARGET_RATIO;   // 严格比较 — 本项目的核心设计
}

export const NEAR_THRESHOLD = 2;
export function isNearTarget(ratio: number): boolean {
    return Math.abs(ratio - CUT.TARGET_RATIO) <= NEAR_THRESHOLD;
}

/** 自检：确认 50% 在数学上成立（cutLineY=120, objectHeight=240 → 50） */
export function selfCheckPerfect(): boolean {
    return computeRatio(120, 240) === CUT.TARGET_RATIO;
}
```

**为什么要 round() 两次**？
1. 玩家拖动切割线产生浮点坐标 → `Math.round(y)` 落到整数像素。
2. 物体高度也是 `Math.round(h)`（实际上 UITransform.height 就是整数）。
3. `y * 100 / h` 再 round 一次 → 得到 0-100 的整数比例。
4. 最终判定用 `===` 整数比较，**永不产生浮点误差**。

在 `GameManager.ts` 的 `onLoad` 中会调 `selfCheckPerfect()` 作为自检，若失败（理论上不可能）会打一条 warn 日志，方便排查。

---

## 6. 事件流：一次完整切割

```
1. 玩家触摸 CutLine
   CutLine.ts (TOUCH_MOVE)
     │
     ├─ y = clamp(round(touchY), 0, objectHeight)
     └─ gameEventTarget.emit(GameEvent.RatioChanged, { ratio, near })
           │
           ├─ UI: KnifeBadge 更新刀数显示（KnivesChanged 时更新）
           └─ UI: CutLine 节点自身 → 如果 near=true → 切换金色

2. 玩家点击 PrimaryButton「切」
   GameSceneUI.ts
     │
     └─ GameManager.requestCut(cutLineY, objectNode)
           │
           ├─ this._knives -= 1
           ├─ emit(GameEvent.KnivesChanged)
           ├─ emit(GameEvent.CutAnimationRequested, payload)
           │      │
           │      ├─ AudioManager → playCut
           │      └─ CutAnimator → 播放切刀动画
           │
           └─ 订阅一次性 GameEvent.CutAnimationDone → _doJudge(ratio)

3. CutAnimator 完成后
   CutAnimator.ts → emit(GameEvent.CutAnimationDone)
     │
     └─ GameManager._doJudge(ratio)
           ├─ ratio === 50 ?
           │   ├─ YES → emit(JudgeResult, { pass:true })
           │   │               AudioManager.playPerfect()
           │   │               SceneRouter → ResultScene
           │   │
           │   └─ NO → emit(JudgeResult, { pass:false, gameOver:knives<=0 })
           │                   knives > 0 → FailSceneUI（道具可选）
           │                   knives === 0 → emit(GameOver) → GameOverScene
           │
           └─ ItemManager 监听 JudgeResult：
                pass=true → _resetAll（道具按钮不可点）
                pass=false → emit(ItemEvent.Available, undo/recut=true)
                            → 启动 3 秒 countdown tick

4. 玩家点 undo
   ItemSlot.ts → ItemManager.useItem('undo')
     │
     └─ emit(ItemEvent.Used, { itemId:'undo' })
        emit(GameEvent.Reset)
           ├─ GameManager → this._knives += 1 → emit(KnivesChanged)
           └─ GameSceneUI → resetObject / resetCutLine
```

---

## 7. 场景 → UI 控制器映射

| .scene | Canvas 下挂组件 | 主要 UI 组件 |
|--------|----------------|-------------|
| `MenuScene.scene` | `MenuSceneUI` | PrimaryButton（开始）、SecondaryButton（设置）、Title/Subtitle Label、SettingsModal 节点（默认 inactive） |
| `GameScene.scene` | `GameSceneUI` | TopBar（返回按钮 + LevelBadge + KnifeBadge）、Stage（CutObject + CutLine）、Footer（切按钮 + ItemSlot×2 + CountdownPill）、Toast、TutorialOverlay |
| `ResultScene.scene` | `ResultSceneUI` | PercentageDisplay（"50%"）、PrimaryButton（再来一局）、SecondaryButton（返回菜单）、撒花粒子 |
| `FailScene.scene` | `FailSceneUI` | FailMessage（情绪色文案 + 比例大字）、ItemSlot(undo/recut)、CountdownPill、重新开始/返回菜单 |
| `GameOverScene.scene` | `GameOverSceneUI` | "游戏失败"大字、剩余 0 刀、返回菜单 |

**注意**：`SettingsModal` 在 MenuScene 中作为弹窗存在，但 SettingsModal.ts 本身是独立组件，方便 M4 阶段搬到主菜单外。

---

## 8. Audio 资源加载策略

```ts
// AudioManager.ts — 加载时机
// 1. 启动：resources.load('audio/bgm-loop') → 缓存
// 2. 运行时：收到 JudgeResult / CutAnimationRequested → resources.load('audio/sfx-xxx.wav') 一次
// 3. 后续播放直接用 AudioClip（无需再查资源）
//
// 持久化：
//   localStorage['settings-bgm'] '0' | '1'（默认 1）
//   localStorage['settings-sfx'] '0' | '1'（默认 1）
//   SettingsModal 调 Toggle 会 emit(SettingsEvent.Bgm/Sfx)
//
// 注意：AudioClip 在小游戏中可能被系统回收，需做 fail-safe（try-catch + warn 日志）
```

---

## 9. 路由与场景数据传递

```ts
// SceneRouter.ts — 用法
SceneRouter.navigateTo('GameScene', { level: 1 });           // 进入场景
SceneRouter.navigateTo('ResultScene', { ratio: 50 });         // 通关场景可读取本次切割比例

// 在目标场景 onLoad 中读取一次性 payload
onLoad() {
    const data = SceneRouter.consumePayload<{ ratio: number }>();
    if (data) this._ratio = data.ratio;
}

// 返回上一场景（菜单 → 游戏 → 失败 → 返回 = 返回菜单）
SceneRouter.goBack();

// 清栈（主菜单启动时调）
SceneRouter.clearHistory();
```

**设计说明**：
- 用 `pendingPayload` 保存一次性数据，`consumePayload` 读完即空；避免跨场景数据「粘滞」。
- `history[]` 简单栈：每次 navigateTo push 一次，`goBack` pop；最多 10 个（防无限增长）。
- 为什么不用 Cocos 自带的 `director.loadScene` 的 `onLaunched` callback？因为跨场景组件在 `onLoad` 时可能还拿不到回调参数；用 pending-payload 让 `onLoad` 同步读取，逻辑更干净。

---

## 10. 扩展指南（给后续开发者）

### 10.1 新增一个关卡
1. 在 `core/GameConfig.ts` 的 `LEVELS` 数组新增一条 `{ id, name, description }`。
2. 在 `gameplay/` 下新增一个具体形状组件（如果不是矩形）。
3. 在 `GameSceneUI` 中根据 `SceneRouter.consumePayload().level` 选 shape。

### 10.2 新增一个道具
1. 在 `core/GameConfig.ts` 的 `ITEM` 字典新增 `NEW_ITEM = 'xxx'`。
2. 在 `items/ItemManager.ts` 的 `useItem` switch 增加分支。
3. 在 `ui/components/` 新增对应 UI 组件或复用 ItemSlot。
4. 在 `FailSceneUI` 中新增一个槽位并订阅新事件。
5. 如果接激励视频：M5 时把 `useItem('recut')` 的「直接 +1 刀」改为「播完视频再 +1 刀」。

### 10.3 接入激励视频
- 所有视频调用集中在 `items/ItemManager.ts` 的一个方法里（例如 `_showRewardedAd(itemId)`），业务层不改。
- MVP 阶段可以 mock 成"假装播完了"，便于调试。
- 抖音 SDK 放在 `AudioManager.ts` 旁边的新文件 `platform/Douyin.ts`，通过 `sys.platform === 'wechatgame'` 判断。

### 10.4 加新 UI 组件
1. 在 `ui/components/` 新建 `@ccclass('Xxx') export class Xxx extends Component`。
2. 用 `@property(Node/Sprite/Label/number/string)` 暴露字段给编辑器。
3. 在 `Theme.ts` 引用颜色/字号，**不写字面量**。
4. 在对应 scene 的 UI 控制器中引用节点并订阅事件。

---

## 11. 已知限制 & TODO

| 模块 | 限制 | 后续版本可做 |
|------|------|------------|
| 切割判定 | 只支持矩形上下等分；复杂形状像素采样未实现 | M3/M4：基于 PNG alpha 通道统计实际像素面积 |
| 多关卡 | 硬编码 Lv.1；没有关卡数据文件 | M3：`assets/data/levels.json` + LevelManager |
| 道具 | undo/recut 默认可用，没有经济系统 | M5：激励视频 / 关卡通关奖励解锁 |
| 音频 | 只支持 BGM/7 个 SFX，无音量曲线 | M3：按「情绪色 tier」改变 SFX 音量 |
| 适配 | Notch 检测是简化版（硬编码 iOS 刘海） | M3：用 `screen.windowSize` + 安全区 API |
| 排行榜 / 无尽模式 | 完全没做 | M6 |

---

## 12. 编译 & 类型检查

```bash
cd cocos-project
npx tsc --noEmit -p tsconfig.json
# 应输出 0 error, 0 warning。
# 若报错：
#   - 缺 TypeScript → npm i -D typescript@~5.3
#   - 缺 cc 模块 → 是 Cocos Creator 在运行时注入的；编译前先让编辑器启动一次生成 .d.ts
```

---

*最后更新：2026-06-04 — 同步代码 v0.4。*
