/**
 * GameSceneUI — 游戏场景 UI 控制器
 *
 * 组合：
 *   - TopBar: 返回按钮 + LevelBadge + KnifeBadge
 *   - Stage: CutObject + CutLine
 *   - Footer: KnifeBadge + ItemSlots(2) + 切按钮
 *   - Toast: 提示
 *   - TutorialOverlay: 首次引导
 *
 * 事件订阅：
 *   - GameEvent.KnivesChanged → 更新 KnifeBadge
 *   - GameEvent.RatioChanged → 更新切割线颜色（金色/白色）+ Toast
 *   - GameEvent.JudgeResult → 3 秒后根据结果跳 WinScene / FailScene
 *   - GameEvent.Reset → 重置物体位置 + 切割线
 */

import { _decorator, Component, Node, Label, Sprite, UITransform, Color, find, director } from 'cc';
import { GameManager, GameEvent, gameEventTarget } from '../../core/GameManager';
import { CutLine } from '../../gameplay/CutLine';
import { CutObject } from '../../gameplay/CutObject';
import { CutAnimator } from '../../gameplay/CutAnimator';
import { KnifeBadge } from '../components/KnifeBadge';
import { LevelBadge } from '../components/LevelBadge';
import { Toast } from '../components/Toast';
import { PrimaryButton } from '../components/PrimaryButton';
import { ItemSlot } from '../components/ItemSlot';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { SceneRouter } from '../../routing/SceneRouter';
import { ITEM, OBJECTS, CutObjectConfig } from '../../core/GameConfig';
import { ItemManager, ItemEvent } from '../../items/ItemManager';
import { AudioManager } from '../../audio/AudioManager';
import { COLOR, FONT } from '../theme/Theme';
import { Logger } from '../../utils/Logger';
import { UIBuilder } from '../../utils/UIBuilder';
const { ccclass, property } = _decorator;

@ccclass('GameSceneUI')
export class GameSceneUI extends Component {
    // 顶栏
    @property(Node) backBtnNode: Node | null = null;
    @property(Node) levelBadgeNode: Node | null = null;
    @property(Node) knifeBadgeNode: Node | null = null;
    // 舞台
    @property(Node) objectNode: Node | null = null;
    @property(Node) cutLineNode: Node | null = null;
    // 底栏
    @property(Node) cutBtnNode: Node | null = null;
    @property(Node) itemUndoNode: Node | null = null;
    @property(Node) itemRecutNode: Node | null = null;
    @property(Node) toastNode: Node | null = null;
    @property(Node) tutorialNode: Node | null = null;

    private _cutLine: CutLine | null = null;
    private _cutObject: CutObject | null = null;
    private _knifeBadge: KnifeBadge | null = null;
    private _levelBadge: LevelBadge | null = null;
    private _toast: Toast | null = null;
    private _tutorial: TutorialOverlay | null = null;
    private _itemUndo: ItemSlot | null = null;
    private _itemRecut: ItemSlot | null = null;

    onLoad() {
        Logger.info('GameSceneUI', '▶ onLoad 开始：进入游戏场景');
        try {
            Logger.info('GameSceneUI', '  [1/7] 确保单例存在');
            this._ensureSingleton('GameManagerNode', GameManager);
            this._ensureSingleton('AudioManagerNode', AudioManager);
            Logger.info('GameSceneUI', `    GameManagerNode=${find('/GameManagerNode') !== null} AudioManagerNode=${find('/AudioManagerNode') !== null}`);

            Logger.info('GameSceneUI', '  [2/7] 程序化构建 UI 节点');
            this._ensureNodes();
            Logger.info('GameSceneUI', `    backBtnNode=${!!this.backBtnNode} levelBadgeNode=${!!this.levelBadgeNode} knifeBadgeNode=${!!this.knifeBadgeNode}`);
            Logger.info('GameSceneUI', `    objectNode=${!!this.objectNode} cutLineNode=${!!this.cutLineNode}`);
            Logger.info('GameSceneUI', `    cutBtnNode=${!!this.cutBtnNode} itemUndoNode=${!!this.itemUndoNode} itemRecutNode=${!!this.itemRecutNode}`);
            Logger.info('GameSceneUI', `    toastNode=${!!this.toastNode} tutorialNode=${!!this.tutorialNode}`);

            Logger.info('GameSceneUI', '  [3/7] 关联游戏组件');
            this._cutObject = this._getOrAdd(this.objectNode, CutObject);
            this._cutLine = this._getOrAdd(this.cutLineNode, CutLine);
            this._knifeBadge = this._getOrAdd(this.knifeBadgeNode, KnifeBadge);
            this._levelBadge = this._getOrAdd(this.levelBadgeNode, LevelBadge);
            this._toast = this._getOrAdd(this.toastNode, Toast);
            this._tutorial = this._getOrAdd(this.tutorialNode, TutorialOverlay);
            this._itemUndo = this._getOrAdd(this.itemUndoNode, ItemSlot);
            this._itemRecut = this._getOrAdd(this.itemRecutNode, ItemSlot);
            Logger.info('GameSceneUI', `    组件状态: _cutObject=${!!this._cutObject} _cutLine=${!!this._cutLine} _knifeBadge=${!!this._knifeBadge} _levelBadge=${!!this._levelBadge}`);

            if (this.objectNode) this._getOrAdd(this.objectNode, CutAnimator);

            if (this._levelBadge) this._levelBadge.setLevel(1, '矩形');
            if (this._itemUndo) this._itemUndo.setOwned(false, '↩', '撤销');
            if (this._itemRecut) this._itemRecut.setOwned(false, '🔪', '再切一刀');

            Logger.info('GameSceneUI', '  [4/7] 配置切割按钮 + 返回按钮 + 道具槽回调');
            const cutBtn = this._getOrAdd(this.cutBtnNode, PrimaryButton);
            if (cutBtn) {
                cutBtn.setText('✂ 切 割');
                cutBtn.onClick = () => this._onCut();
                Logger.info('GameSceneUI', '    cutBtn 绑定成功');
            } else {
                Logger.error('GameSceneUI', '    cutBtn 挂载失败！');
            }
            Logger.info('GameSceneUI', '按钮 / 徽章 / 道具槽 已挂载');

            if (this.backBtnNode) {
                this.backBtnNode.on(Node.EventType.TOUCH_END, () => SceneRouter.goBack('MenuScene'), this);
                Logger.info('GameSceneUI', '    返回按钮 已绑定');
            } else {
                Logger.warn('GameSceneUI', '    backBtnNode 缺失');
            }

            if (this._itemUndo) this._itemUndo.onClick = () => ItemManager.instance.useItem(ITEM.UNDO);
            if (this._itemRecut) this._itemRecut.onClick = () => ItemManager.instance.useItem(ITEM.RECUT);

            Logger.info('GameSceneUI', '  [5/7] 设置切割线范围');
            const ui = this.objectNode?.getComponent(UITransform);
            if (ui && this._cutLine) {
                const h = ui.height;
                Logger.info('GameSceneUI', `    物体高度=${h}，设置切割线范围 ±${Math.floor(h / 2)} + GameManager.objectHeight`);
                this._cutLine.setRange(Math.floor(h / 2), -Math.floor(h / 2));
                GameManager.instance.setObjectHeight(h);
            } else {
                Logger.warn('GameSceneUI', `    objectNode UITransform=${!!ui} _cutLine=${!!this._cutLine}，跳过范围设置`);
            }

            Logger.info('GameSceneUI', '  [6/7] 订阅切割线回调');
            if (this._cutLine) {
                this._cutLine.onCutLineChanged = (y) => {
                    GameManager.instance.onCutLineMoved(y);
                    if (this._tutorial) this._tutorial.showDragHint(2.0);
                };
                Logger.info('GameSceneUI', '    切割线回调 已绑定');
            } else {
                Logger.error('GameSceneUI', '    _cutLine 缺失，无法绑定拖动回调');
            }

            Logger.info('GameSceneUI', '  [7/7] 订阅游戏事件');
            gameEventTarget.on(GameEvent.KnivesChanged, (d: any) => {
                Logger.info('GameSceneUI', `KnivesChanged: remaining=${d.remaining}/${d.max}`);
                this._knifeBadge?.setKnives(d.remaining, d.max);
            }, this);
            gameEventTarget.on(GameEvent.RatioChanged, (d: any) => this._onRatio(d.ratio, d.near), this);
            gameEventTarget.on(GameEvent.JudgeResult, (d: any) => this._onJudge(d), this);
            gameEventTarget.on(GameEvent.Reset, () => {
                Logger.info('GameSceneUI', '收到 Reset：重置物体 + 切割线');
                this._onReset();
            }, this);
            gameEventTarget.on(ItemEvent.Available, (d: any) => this._onItemAvailable(d), this);
            Logger.info('GameSceneUI', '    KnivesChanged / RatioChanged / JudgeResult / Reset / Available 已订阅');

            Logger.info('GameSceneUI', '  [额外] 随机选择物体样式');
            this._applyRandomObject();
            
            Logger.info('GameSceneUI', '🔔 调用 startRound()');
            GameManager.instance.startRound();
            Logger.info('GameSceneUI', '✅ onLoad 完成：游戏场景初始化成功');
        } catch (e: any) {
            Logger.error('GameSceneUI', '❌ onLoad 异常：' + (e?.message ?? e));
            Logger.error('GameSceneUI', '   stack: ' + (e?.stack ?? 'no stack'));
        }
    }

    onEnable() {
        Logger.info('GameSceneUI', '▶ onEnable：游戏场景节点激活（onEnter）');
        Logger.info('GameSceneUI', `    子节点数量=${this.node.children.length}`);
        Logger.info('GameSceneUI', `    GameManager.instance 存在=${GameManager && !!GameManager.instance}`);
    }

    start() {
        Logger.info('GameSceneUI', '▶ start：游戏场景首帧渲染完成');
        const payload = SceneRouter.consumePayload<{ ratio?: number; knives?: number }>();
        if (payload) {
            Logger.info('GameSceneUI', `    携带 payload: ratio=${payload.ratio} knives=${payload.knives}`);
        }
    }

    onDestroy() {
        gameEventTarget.off(GameEvent.KnivesChanged, () => {}, this);
        gameEventTarget.off(GameEvent.RatioChanged, () => {}, this);
        gameEventTarget.off(GameEvent.JudgeResult, () => {}, this);
        gameEventTarget.off(GameEvent.Reset, () => {}, this);
        gameEventTarget.off(ItemEvent.Available, () => {}, this);
    }

    private _ensureNodes() {
        const root = this.node;
        const canvasUI = root.getComponent(UITransform) || root.addComponent(UITransform);
        canvasUI.setContentSize(720, 1280);

        // 返回按钮（左上角）
        if (!this.backBtnNode) {
            this.backBtnNode = UIBuilder.button(root, 'backBtnNode', COLOR.LINE, '← 返回', COLOR.INK, 16, -300, 560, 120, 60);
        }
        // LevelBadge（右上角）
        if (!this.levelBadgeNode) {
            const n = UIBuilder.sprite(root, 'levelBadgeNode', COLOR.GOLD, 260, 560, 160, 60);
            UIBuilder.label(n, 'titleLabel', 'Lv.1 矩形', COLOR.WHITE, 16, 0, 0, 140, 40);
            this.levelBadgeNode = n;
        }
        // KnifeBadge（右下区域，备用）
        if (!this.knifeBadgeNode) {
            const n = UIBuilder.sprite(root, 'knifeBadgeNode', COLOR.ORANGE_SOFT, 0, -460, 220, 60);
            UIBuilder.label(n, 'countLabel', '3/3', COLOR.ORANGE_DEEP, 20, 0, 0, 180, 40);
            this.knifeBadgeNode = n;
        }
        // 物体（舞台中央的大矩形）
        if (!this.objectNode) {
            const obj = UIBuilder.sprite(root, 'objectNode', COLOR.ORANGE, 0, 100, 400, 400);
            // 顶边高亮
            UIBuilder.sprite(obj, 'topHighlight', new Color(255, 255, 255, 40), 0, 195, 400, 10);
            // 底边高亮
            UIBuilder.sprite(obj, 'bottomHighlight', new Color(230, 106, 61, 100), 0, -195, 400, 10);
            // body (CutObject 需要名为 body 的节点)
            const body = UIBuilder.sprite(obj, 'body', COLOR.ORANGE, 0, 0, 400, 400);
            body.setSiblingIndex(0); // 放到最底层
            this.objectNode = obj;
        }
        // 切割线（覆盖在物体上，默认居中）
        if (!this.cutLineNode) {
            const line = UIBuilder.node(root, 'cutLineNode', 0, 100, 500, 4);
            // 主体横线
            const body = UIBuilder.sprite(line, 'lineBody', COLOR.WHITE, 0, 0, 480, 4);
            // 两端圆点
            UIBuilder.sprite(line, 'dotLeft', COLOR.WHITE, -240, 0, 20, 20);
            UIBuilder.sprite(line, 'dotRight', COLOR.WHITE, 240, 0, 20, 20);
            this.cutLineNode = line;
        }
        // Toast（顶部提示）
        if (!this.toastNode) {
            const t = UIBuilder.sprite(root, 'toastNode', COLOR.GOLD_SOFT, 0, 480, 300, 60);
            UIBuilder.label(t, 'msgLabel', '', COLOR.ORANGE_DEEP, 16, 0, 0, 280, 40);
            this.toastNode = t;
            t.active = false;
        }
        // 道具槽（底部两侧）
        if (!this.itemUndoNode) {
            const u = UIBuilder.sprite(root, 'itemUndoNode', COLOR.LINE_SOFT, -220, -360, 120, 120);
            UIBuilder.label(u, 'iconLabel', '↩', COLOR.MUTED, 28, 0, 10, 100, 40);
            UIBuilder.label(u, 'nameLabel', '撤销', COLOR.MUTED, 14, 0, -30, 100, 30);
            this.itemUndoNode = u;
        }
        if (!this.itemRecutNode) {
            const r = UIBuilder.sprite(root, 'itemRecutNode', COLOR.LINE_SOFT, 220, -360, 120, 120);
            UIBuilder.label(r, 'iconLabel', '🔪', COLOR.MUTED, 28, 0, 10, 100, 40);
            UIBuilder.label(r, 'nameLabel', '再切一刀', COLOR.MUTED, 14, 0, -30, 100, 30);
            this.itemRecutNode = r;
        }
        // 切割按钮（底部中央）
        if (!this.cutBtnNode) {
            this.cutBtnNode = UIBuilder.button(root, 'cutBtnNode', COLOR.ORANGE, '✂ 切 割', COLOR.WHITE, 22, 0, -200, 400, 100);
        }
        // 引导层（覆盖整个舞台）
        if (!this.tutorialNode) {
            const tut = UIBuilder.node(root, 'tutorialNode', 0, 0, 720, 1280);
            // 右上气泡
            const bubble = UIBuilder.sprite(tut, 'topBubble', COLOR.INK, 220, 540, 200, 60);
            UIBuilder.label(bubble, 'topBubbleLabel', '切到中间试试～', COLOR.WHITE, 16, 0, 0, 180, 40);
            // 拖动蒙版（半透明黑色）
            const mask = UIBuilder.sprite(tut, 'dragMask', new Color(0, 0, 0, 110), 0, 0, 720, 1280);
            mask.active = false;
            // 手指
            const finger = UIBuilder.sprite(tut, 'dragFinger', COLOR.ORANGE, 0, 100, 60, 60);
            finger.active = false;
            // 提示文字（在 mask 上）
            UIBuilder.label(mask, 'dragLabel', '拖动到这里试试', COLOR.WHITE, 20, 0, 200, 300, 40);
            this.tutorialNode = tut;
        }
    }

    private _onCut() {
        if (!this._cutLine || !this.objectNode) {
            Logger.warn('GameSceneUI', '_onCut: 切割线或物体节点缺失，忽略');
            return;
        }
        const y = this._cutLine.getCutY();
        Logger.info('GameSceneUI', `_onCut: getCutY=${y}，调用 requestCut`);
        GameManager.instance.requestCut(y, this.objectNode);
        if (this._tutorial) this._tutorial.markCompleted();
    }

    private _onRatio(ratio: number, near: boolean) {
        Logger.debug('GameSceneUI', `RatioChanged: ratio=${ratio}% near=${near}`);
        if (this._cutLine) this._cutLine.setNearTarget(near);
        if (near && this._toast) this._toast.show('⚡ 接近目标', 1.0);
    }

    private _onJudge(data: { pass: boolean; ratio: number; gameOver?: boolean }) {
        Logger.info('GameSceneUI', `判定: pass=${data.pass} ratio=${data.ratio}% gameOver=${data.gameOver}`);
        this.scheduleOnce(() => {
            if (data.pass) {
                SceneRouter.navigateTo('ResultScene', { ratio: data.ratio });
            } else if (data.gameOver) {
                SceneRouter.navigateTo('GameOverScene', { ratio: data.ratio });
            } else {
                SceneRouter.navigateTo('FailScene', { ratio: data.ratio, knives: GameManager.instance.knives });
            }
        }, 0.8);
    }

    private _onReset() {
        Logger.info('GameSceneUI', '重置时随机切换物体');
        this._applyRandomObject();
        this._cutObject?.reset();
        this._cutLine?.reset();
    }

    /**
     * 随机选择并应用物体样式
     */
    private _applyRandomObject() {
        if (!this._cutObject || OBJECTS.length === 0) {
            Logger.warn('GameSceneUI', '_applyRandomObject: 无可用物体配置');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * OBJECTS.length);
        const config = OBJECTS[randomIndex];
        Logger.info('GameSceneUI', `随机选择物体: ${config.name} (索引=${randomIndex})`);
        
        this._cutObject.applyConfig(config);
        
        if (this._levelBadge) {
            this._levelBadge.setLevel(1, config.name);
        }
        
        if (this._toast && config.description) {
            this._toast.show(`🎯 ${config.description}`, 1.5);
        }
    }

    private _onItemAvailable(d: { itemId: string; owned: boolean }) {
        if (d.itemId === ITEM.UNDO && this._itemUndo) this._itemUndo.setOwned(d.owned, '↩', '撤销');
        if (d.itemId === ITEM.RECUT && this._itemRecut) this._itemRecut.setOwned(d.owned, '🔪', '再切一刀');
    }

    private _getOrAdd<T extends Component>(node: Node | null, ctor: new () => T): T | null {
        if (!node) return null;
        const existing = node.getComponent(ctor);
        if (existing) return existing;
        return node.addComponent(ctor);
    }

    private _ensureSingleton<T extends Component>(nodeName: string, ctor: new () => T) {
        if (find(`/${nodeName}`)) return;
        const n = new Node(nodeName);
        n.addComponent(ctor);
        director.addPersistRootNode(n);
    }
}
