/**
 * FailSceneUI — 失败场景控制器
 *
 * 显示：大字百分比 + FailMessage（情绪色胶囊）+ 道具槽（undo/recut） + 倒计时圆环 + 重新开始 + 返回菜单
 */

import { _decorator, Component, Node, Label, UITransform, Color, find, director } from 'cc';
import { SceneRouter } from '../../routing/SceneRouter';
import { PercentageDisplay } from '../components/PercentageDisplay';
import { FailMessage } from '../components/FailMessage';
import { CountdownRing } from '../components/CountdownRing';
import { ItemSlot } from '../components/ItemSlot';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { GameEvent, gameEventTarget, GameManager } from '../../core/GameManager';
import { ITEM } from '../../core/GameConfig';
import { ItemManager, ItemEvent } from '../../items/ItemManager';
import { COLOR, FONT } from '../theme/Theme';
import { Logger } from '../../utils/Logger';
import { UIBuilder } from '../../utils/UIBuilder';
const { ccclass, property } = _decorator;

@ccclass('FailSceneUI')
export class FailSceneUI extends Component {
    @property(Node) percentNode: Node | null = null;
    @property(Node) failMsgNode: Node | null = null;
    @property(Node) countdownRingNode: Node | null = null;
    @property(Node) itemUndoNode: Node | null = null;
    @property(Node) itemRecutNode: Node | null = null;
    @property(Node) restartBtnNode: Node | null = null;
    @property(Node) backBtnNode: Node | null = null;

    private _percent: PercentageDisplay | null = null;
    private _failMsg: FailMessage | null = null;
    private _ring: CountdownRing | null = null;
    private _itemUndo: ItemSlot | null = null;
    private _itemRecut: ItemSlot | null = null;

    onLoad() {
        Logger.info('FailSceneUI', '▶ onLoad 开始：进入失败场景');
        try {
            Logger.info('FailSceneUI', '  [1/6] 确保 ItemManager 单例存在');
            this._ensureSingleton('ItemManagerNode', ItemManager);
            Logger.info('FailSceneUI', `    ItemManagerNode 存在=${find('/ItemManagerNode') !== null}`);

            Logger.info('FailSceneUI', '  [2/6] 程序化构建 UI 节点');
            this._ensureNodes();
            Logger.info('FailSceneUI', `    percentNode=${!!this.percentNode} failMsgNode=${!!this.failMsgNode} countdownRingNode=${!!this.countdownRingNode}`);
            Logger.info('FailSceneUI', `    itemUndoNode=${!!this.itemUndoNode} itemRecutNode=${!!this.itemRecutNode} restartBtnNode=${!!this.restartBtnNode} backBtnNode=${!!this.backBtnNode}`);

            Logger.info('FailSceneUI', '  [3/6] 关联组件');
            this._percent = this._getOrAdd(this.percentNode, PercentageDisplay);
            this._failMsg = this._getOrAdd(this.failMsgNode, FailMessage);
            this._ring = this._getOrAdd(this.countdownRingNode, CountdownRing);
            this._itemUndo = this._getOrAdd(this.itemUndoNode, ItemSlot);
            this._itemRecut = this._getOrAdd(this.itemRecutNode, ItemSlot);
            Logger.info('FailSceneUI', `    _percent=${!!this._percent} _failMsg=${!!this._failMsg} _ring=${!!this._ring} _itemUndo=${!!this._itemUndo} _itemRecut=${!!this._itemRecut}`);

            Logger.info('FailSceneUI', '  [4/6] 读取 payload 并显示比例');
            const payload = SceneRouter.consumePayload<{ ratio: number; knives: number }>();
            const ratio = payload?.ratio ?? 30;
            Logger.info('FailSceneUI', `    payload=${JSON.stringify(payload)} → ratio=${ratio}%`);
            this._percent?.setRatio(ratio, true);
            this._failMsg?.setRatio(ratio);
            Logger.info('FailSceneUI', `    比例显示完成`);

            Logger.info('FailSceneUI', '  [5/6] 配置道具 + 倒计时圆环');
            this._itemUndo?.setOwned(true, '↩', '撤销');
            this._itemRecut?.setOwned(true, '🔪', '再切一刀');
            this._ring?.begin(3);
            Logger.info('FailSceneUI', '启动 3 秒道具倒计时圆环');

            const restart = this._getOrAdd(this.restartBtnNode, PrimaryButton);
            if (restart) {
                restart.setText('↻ 重新开始');
                restart.onClick = () => {
                    Logger.info('FailSceneUI', '玩家点击"重新开始" → 跳 GameScene');
                    SceneRouter.navigateTo('GameScene');
                };
            }
            const back = this._getOrAdd(this.backBtnNode, SecondaryButton);
            if (back) {
                back.setText('返回菜单');
                back.onClick = () => {
                    Logger.info('FailSceneUI', '玩家点击"返回菜单" → 跳 MenuScene');
                    SceneRouter.navigateTo('MenuScene');
                };
            }

            if (this._itemUndo) {
                this._itemUndo.onClick = () => {
                    Logger.info('FailSceneUI', '玩家点击"撤销"道具');
                    ItemManager.instance.useItem(ITEM.UNDO);
                    GameManager.instance.undoLastCut();
                    SceneRouter.navigateTo('GameScene');
                };
            }
            if (this._itemRecut) {
                this._itemRecut.onClick = () => {
                    Logger.info('FailSceneUI', '玩家点击"再切一刀"道具');
                    ItemManager.instance.useItem(ITEM.RECUT);
                    GameManager.instance.grantExtraKnife();
                    SceneRouter.navigateTo('GameScene');
                };
            }

            Logger.info('FailSceneUI', '  [6/6] 订阅 ItemManager 倒计时事件');
            gameEventTarget.on(ItemEvent.CountdownTick, (d: any) => this._ring?.setRemaining(d.sec), this);
            gameEventTarget.on(ItemEvent.Expired, () => {
                Logger.info('FailSceneUI', '道具倒计时过期 → 跳 GameScene');
                SceneRouter.navigateTo('GameScene');
            }, this);
            Logger.info('FailSceneUI', `✅ onLoad 完成：失败场景初始化成功 ratio=${ratio}%`);
        } catch (e: any) {
            Logger.error('FailSceneUI', '❌ onLoad 异常：' + (e?.message ?? e));
            Logger.error('FailSceneUI', '   stack: ' + (e?.stack ?? 'no stack'));
        }
    }

    onEnable() {
        Logger.info('FailSceneUI', '▶ onEnable：失败场景节点激活（onEnter）');
        Logger.info('FailSceneUI', `    子节点数量=${this.node.children.length}`);
    }

    start() {
        Logger.info('FailSceneUI', '▶ start：失败场景首帧渲染完成');
    }

    onDestroy() {
        gameEventTarget.off(ItemEvent.CountdownTick, () => {}, this);
        gameEventTarget.off(ItemEvent.Expired, () => {}, this);
    }

    private _ensureNodes() {
        const root = this.node;
        const ui = root.getComponent(UITransform) || root.addComponent(UITransform);
        ui.setContentSize(720, 1280);

        // 大字百分比
        if (!this.percentNode) {
            const p = UIBuilder.sprite(root, 'percentNode', new Color(255, 255, 255, 0), 0, 350, 300, 150);
            UIBuilder.label(p, 'percentLabel', '30%', COLOR.TIER3, 72, 0, 0, 280, 120);
            this.percentNode = p;
        }
        // FailMessage（情绪胶囊）
        if (!this.failMsgNode) {
            const m = UIBuilder.sprite(root, 'failMsgNode', COLOR.TIER3_BG, 0, 200, 400, 80);
            UIBuilder.label(m, 'msgLabel', '差太远啦', COLOR.TIER3, 20, 0, 0, 360, 40);
            this.failMsgNode = m;
        }
        // CountdownRing（圆环）
        if (!this.countdownRingNode) {
            const c = UIBuilder.sprite(root, 'countdownRingNode', COLOR.ORANGE, 0, 80, 120, 120);
            UIBuilder.label(c, 'centerLabel', '3', COLOR.INK, 40, 0, 0, 80, 80);
            this.countdownRingNode = c;
        }
        // 道具 undo（左下）
        if (!this.itemUndoNode) {
            const u = UIBuilder.sprite(root, 'itemUndoNode', COLOR.ORANGE_SOFT, -200, -80, 150, 150);
            UIBuilder.label(u, 'iconLabel', '↩', COLOR.ORANGE_DEEP, 32, 0, 15, 120, 50);
            UIBuilder.label(u, 'nameLabel', '撤销', COLOR.ORANGE_DEEP, 16, 0, -35, 120, 30);
            this.itemUndoNode = u;
        }
        // 道具 recut（右下）
        if (!this.itemRecutNode) {
            const r = UIBuilder.sprite(root, 'itemRecutNode', COLOR.ORANGE_SOFT, 200, -80, 150, 150);
            UIBuilder.label(r, 'iconLabel', '🔪', COLOR.ORANGE_DEEP, 32, 0, 15, 120, 50);
            UIBuilder.label(r, 'nameLabel', '再切一刀', COLOR.ORANGE_DEEP, 16, 0, -35, 120, 30);
            this.itemRecutNode = r;
        }
        // 重新开始按钮
        if (!this.restartBtnNode) {
            this.restartBtnNode = UIBuilder.button(root, 'restartBtnNode', COLOR.ORANGE, '↻ 重新开始', COLOR.WHITE, 22, 0, -280, 400, 100);
        }
        // 返回菜单按钮
        if (!this.backBtnNode) {
            this.backBtnNode = UIBuilder.button(root, 'backBtnNode', COLOR.WHITE, '返回菜单', COLOR.INK, 20, 0, -420, 360, 80);
        }
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
