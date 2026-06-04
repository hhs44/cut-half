# 切一半 — 设计决策记录（decisions / ADR）

> MADR 风格的轻量级 ADR（Architecture Decision Records）。
> 每条记录：`[日期] 决策标题` ，包含 → 背景 / 方案权衡 / 选择理由 / 后果。

---

## [2026-05-15] D001 判定逻辑采用「严格 50%」

**背景**：
切一半的核心玩法要求玩家把物体切成「上下相等的两部分」。但在 720×1280 设计稿中，切割线 y=120（物体高 240）时，浮点除法 `120/240 = 0.5`，但如果玩家拖到 y=119.9999，`119.9999/240 * 100 = 49.999958...` — 在浮点误差下**永不等于 50**。

**可选方案**：
- A：`Math.abs(ratio - 50) < ε`，ε=0.5%（宽松判定）
- B：先 `Math.round(y)` 和 `Math.round(h)`，再 `Math.round(y*100/h)`（整数比例 → 严格 `===50`）
- C：用一个范围「50±1%」都算成功（难度更低，玩家更容易通关）

**选择**：B — 整数比例 + 严格 `=== 50`。

**理由**：
1. 数学精确 — 当玩家真的切到中线（y=120, h=240），计算结果必为 50。
2. 消除所有浮点误差 — 所有比较都在整数域。
3. 游戏体感公平 — 「就差一点点」的挫败感是体验核心；宽松判定会让胜利太廉价。

**后果**：
- 玩家需要精确拖动切割线（±1 像素的精度）。
- 需要在 UI 层提供「接近反馈」：±2% 时把切割线变金色 —— 告知玩家「再挪一点就中了」。
- 在代码中加入 `selfCheckPerfect()` 自检函数，方便开发时快速验证。

---

## [2026-05-18] D002 事件驱动（EventBus）替代全局单例直接调用

**背景**：
初始版本里，UI 组件直接 `import GameManager` 并读写内部字段。导致：
1. 类型强耦合 — 改 GameManager 字段会导致 UI 代码全挂。
2. 组件在场景加载时需等 GameManager 初始化完成 — 竞态条件。
3. 难以在不启动游戏的情况下测试单个组件。

**可选方案**：
- A：所有组件 import `GameManager.instance` 并直接调用方法（强耦合）
- B：`gameEventTarget` 作为全局事件总线，组件订阅/发射事件（松耦合）
- C：RxJS / redux-like （过度设计，小游戏场景不划算）

**选择**：B — 全局 eventBus（一个 `Node` 实例 `gameEventTarget`）。

**理由**：
1. Cocos 的 `Node.on/emit/off` 已经是成熟的事件系统；无需引入第三方库。
2. 任何组件在 `onLoad` 时订阅，`onDestroy` 时退订 — 生命周期天然安全。
3. UI 组件不需要知道 GameManager 存在 — 只处理事件 → 单元测试可用 mock 事件驱动。

**后果**：
- 每个事件需在 `GameEvent` / `ItemEvent` 字典中登记 — 防止字符串 typo。
- 事件 payload 需要文档化（见 [ARCHITECTURE.md 第 4 节](file:///Users/huanghaoshu/apps/切一半/docs/ARCHITECTURE.md)）。
- 跨模块通信需「反着找订阅者」，比 direct call 稍难追踪 — 我们用事件常量集中管理来弥补。

---

## [2026-05-20] D003 「切」按钮需要 2 步确认（拖线 → 点按钮）

**背景**：
早期原型是「松手即切」。测试发现：
- 玩家在拖动过程中会**频繁误触**（松手 = 立即消耗一刀）。
- 新手学习成本极高。

**可选方案**：
- A：松手即切（简单，但误切率高）
- B：拖线 + 点「切」按钮 2 步（需要明确操作意图）
- C：长按切割线 0.5 秒后确认（交互不直观）

**选择**：B。

**理由**：
1. 意图明确 — 玩家必须主动点按钮才会消耗刀。
2. 切按钮是视觉焦点 — 放在屏幕底部中央，易于触摸。
3. 拖线过程可反复调整 — 玩家可来回移动切割线，不消耗刀数。

**后果**：
- 拖线时需实时更新比例数字（`PercentageDisplay`）。
- `CutLine` 拖动期间不能触发判定 — 它只是修改视觉位置。
- 按钮的 `spriteState` 需要按下态 + disabled 态（当切割线未就位时禁用）。

---

## [2026-05-22] D004 MVP 道具只做「undo + recut」两个

**背景**：
PRD 提到 6 个道具。但 M3-M6 道具设计复杂（需要激励视频、关卡解锁、经济系统）。

**可选方案**：
- A：全部 6 个道具一起做（大而全，但 MVP 交付风险高）
- B：挑 2 个最核心道具（undo/recut），其余在 M4+ 做
- C：全部道具 mock 成装饰性按钮（用户会误以为有效 — 不诚实）

**选择**：B。

**理由**：
1. MVP 只需验证核心玩法 — 「切一半」的本质不需要道具系统完整度。
2. undo/recut 解决的是「玩家切错一刀是否还有机会」— 直接影响留存。
3. 道具系统用事件驱动架构 — M4 新增道具只需在 `useItem()` 加 case 分支，不改 UI。

**后果**：
- `ItemManager` 以极简 boolean 管理 — 每局 undo/recut 各有 1 次。
- M4 扩展时将切换为 `Map<string, number>` 库存模型。
- M4 扩展 checklist 见 [ITEMS-DESIGN.md 第 9 节](file:///Users/huanghaoshu/apps/切一半/docs/ITEMS-DESIGN.md)。

---

## [2026-05-25] D005 视觉语言采用 emoji + 纯色扁平风

**背景**：
早期版本考虑过：拟物（wooden + 刀痕）、可爱（动物 + 食物）、几何抽象。

**可选方案**：
- A：拟物风（精致但贴图资源量大，开发成本高）
- B：可爱风（适合社交传播，但团队缺乏美术资源）
- C：emoji + 纯色扁平风（零美术成本，可即时在代码里画出来；情绪色 tier 驱动视觉）
- D：极简几何（类似 iOS 健身圆环 — 情绪色彩方案是方向）

**选择**：C + D 的结合 — emoji 图标 + 纯色卡片 + 情绪色 tier。

**理由**：
1. MVP 开发期：图标全部 emoji，不需要画贴图 — 开发/调试快速。
2. 情绪色 tier：完美=金色、接近=橙色、差距大=红色 — 玩家一目了然「差多远」。
3. 圆角 + 卡片：信息层级清晰，UI 组件在任何屏幕大小上都耐看。

**后果**：
- `Theme.ts` 集中管理颜色/字号/圆角/阴影 — 禁止在代码中手写 hex。
- 未来接入品牌方视觉系统时，唯一改动点是 `Theme.ts` + 替换贴图。
- emoji 在部分系统/语言环境中可能有不同渲染 — 需在真机上做视觉验证。

---

## [2026-05-27] D006 单例用「Node + PersistRootNode」实现

**背景**：
Cocos Creator 没有原生「单例组件」机制。需要跨场景存活的对象（GameManager、AudioManager、ItemManager）需要某种全局挂载方式。

**可选方案**：
- A：每个场景都把单例挂在 Canvas 下（重复挂载，且跨场景状态丢失）
- B：用 `director.addPersistRootNode(xxx)` 把单例挂到永久根节点；在第一个场景创建、在后续场景 self-check，重复的自毁
- C：纯 TS 类 + 静态字段（不继承 Component）— 不能用 Cocos 的 schedule/emit/生命周期

**选择**：B。

**理由**：
1. `PersistRootNode` 是 Cocos 官方推荐的跨场景持久化方式。
2. 单例依然是 Component — 可用 `scheduleOnce` 驱动倒计时。
3. 在 `onLoad` 中检查 `_instance !== this` 时自毁 — 天然防御重复创建。

**后果**：
- 单例必须在 **第一个进入的场景**（MenuScene）的 `onLoad` 中被创建一次。
- 每个单例都要实现「存在则自毁」的逻辑 — 统一模板见 [ARCHITECTURE.md 第 3 节](file:///Users/huanghaoshu/apps/切一半/docs/ARCHITECTURE.md)。
- `_ensureSingleton(nodeName, componentName)` 是一个可复用的工厂函数 — 放在 `GameManager.ts` 中供各场景 UI 控制器调用。

---

## [2026-05-28] D007 720×1280 设计稿；FitWidth 适配

**背景**：
小游戏在微信/抖音内运行的设备尺寸差异极大：375×812（iPhone SE）、428×926（iPhone 15 Pro）、360×640（安卓低端机）、甚至 iPad 横屏。

**可选方案**：
- A：让 Cocos Canvas 自动 stretch（会让圆形物体变成椭圆 — 不可接受）
- B：`ResolutionPolicy.FIXED_WIDTH` + 设计稿 720×1280 — 宽度对齐、上下留黑边
- C：`ResolutionPolicy.FIXED_HEIGHT` + 设计稿 1080×1920 — 高度对齐、左右留黑边（竖屏小游戏黑边会更大）

**选择**：B — `AdaptiveLayout.applyFitWidth(720, 1280)`。

**理由**：
1. 竖屏游戏，玩家眼睛在垂直方向移动更多 — 宽度对齐保证水平视觉比例一致。
2. 720 是高清贴图的最小公约数 — 贴图是 720/2/4 分割的资源量最优。
3. 切的是「物体高度百分比」— 物体实际像素高度不影响判定逻辑（始终是 0-100）。

**后果**：
- 长屏设备上下有黑边（可用纯色背景填充 — 我们用橙色渐变填充）。
- UI 组件用 Widget + 垂直百分比定位；禁止绝对像素定位。
- Notch 设备顶部安全区：`AdaptiveLayout` 用 `screen.windowSize` 做近似偏移 — M3 可接入原生安全区 API。

---

## [2026-05-30] D008 失败场景的情绪色 tier

**背景**：
失败不等于结束 — 玩家剩余刀数 + 与完美的差距 + 是否有道具可用 → 共同构成「情绪」。

**可选方案**：
- A：失败场景永远红色文案（千篇一律）
- B：根据 `|ratio-50|` 分 tier：5% 内=惋惜、5-15%=加油、>15%=再想想
- C：根据剩余刀数：0 刀=真正失败（GameOver）、≥1 刀=继续尝试（FailScene）

**选择**：B + C 的混合 tier。

**理由**：
1. 让每一次失败有「情绪差异」— 更有继续尝试的动力。
2. tier 划分与道具可用性耦合 — 见 [ITEMS-DESIGN.md 第 2 节](file:///Users/huanghaoshu/apps/切一半/docs/ITEMS-DESIGN.md)。
3. 情绪色文案可 M3 阶段本地化（不同语言不同情绪表达）。

**后果**：
- `FailMessage` 组件在 `onLoad` 时根据 `RatioChanged` payload 选 tier。
- tier 颜色在 `Theme.ts` 中定义 — GOLD（惋惜）/ ORANGE（加油）/ CORAL（再来）/ CRIMSON（真正失败）。
- 后期可加入轻量动画（tier=惋惜时抖动 ×1、tier=真正失败时整个背景渐红）。

---

## [2026-06-01] D009 场景备份到「切一半-MVP-交付/scenes/」

**背景**：
Cocos Creator 在 `.scene` JSON 被外部修改 / 编辑器意外重启后会用「简化模板」覆盖原文件。一旦被覆盖：节点树 + 组件绑定 + sprite 引用丢失 — 无法恢复。

**可选方案**：
- A：用 Git 做 scene 文件 LFS 追踪（正确但重，团队目前不要求每人 commit）
- B：在本地保存一份 working backup — 放在 `~/Desktop/切一半-MVP-交付/scenes/`
- C：把 scene 拆成 prefab + 纯代码动态构建（M4+ 可做，但 MVP 时间紧）

**选择**：B（MVP 阶段轻量方案） + A（长期方向）。

**理由**：
1. 5 个 scene 文件非常关键 — 被编辑器覆盖会导致 1-2 天返工。
2. 文件很小（每个 scene 约 20-60 KB）— 拷贝备份成本极低。
3. 在 AGENTS.md 明确恢复命令 — 接手者可一键恢复。

**后果**：
- **每一次大的 scene 改动后**：`cp -r cocos-project/assets/scenes/ ~/Desktop/切一半-MVP-交付/scenes/`。
- 在 Cocos 编辑器中启动工程第一件事：检查 scene 文件 mtime 是否被意外更新。
- M4+ 考虑迁移到 prefab-based 架构 — 每个场景 Canvas 下只有少量 root，主要节点由代码动态构建。

---

## [2026-06-03] D010 脚本按职责分层（audio/core/gameplay/items/routing/ui/utils）

**背景**：
初始版本 22 个 `.ts` 文件平铺在 `scripts/` 根目录 — 查找与 IDE 导航困难。

**可选方案**：
- A：按功能域分区（core / gameplay / ui / items / audio / routing / utils）
- B：按场景分区（scene-menu/ scene-game/ scene-result/ ...）
- C：混合（scene-xxx + components-xxx）

**选择**：A。

**理由**：
1. 功能域比场景更稳定 — 新增场景不会改变 GameManager 在哪。
2. `components/` 是天然的「复用层」—— 一个组件可以出现在多个场景中。
3. 单例（GameManager / AudioManager / ItemManager）天然归属于功能域，不属任何单个场景。

**后果**：
- 新增代码时要判断「这更像 core 逻辑还是 gameplay 视觉？」—— 规则见 [ARCHITECTURE.md 第 2 节](file:///Users/huanghaoshu/apps/切一半/docs/ARCHITECTURE.md) 脚注。
- 每个子目录平均 2-6 个文件 — 规模受控；未来大于 10 个文件时再细分。

---

## 验收清单（每次改动 scene / 脚本后自检）

- [ ] `npx tsc --noEmit -p cocos-project/tsconfig.json` → 0 error
- [ ] 5 个 scene 在 Cocos 编辑器中打开无报错
- [ ] 主菜单 → 游戏 → 通关 / 失败 → 再来一局 — 完整流程能跑通
- [ ] BGM 在主菜单循环；切 / 通关 / 失败 / tick 各 SFX 可听
- [ ] 道具（undo/recut）在正确场景出现，倒计时能正常结束
- [ ] 本文件如涉及新决策 → 追加一条 ADR

---

*最后更新：2026-06-04 — 新增 D001-D010 共 10 条决策。*
