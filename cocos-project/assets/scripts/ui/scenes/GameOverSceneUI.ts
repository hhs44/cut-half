/**
 * GameOverSceneUI — GameOver 场景（深色主题）
 *
 * "游戏失败" + 实际切割比例 + 金色"看广告重来" + 返回菜单
 */

import { _decorator, Component, Node, Label, Sprite, Color, UITransform } from 'cc';
import { SceneRouter } from '../../routing/SceneRouter';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { COLOR, FONT } from '../theme/Theme';
import { Logger } from '../../utils/Logger';
import { UIBuilder } from '../../utils/UIBuilder';
const { ccclass, property } = _decorator;

@ccclass('GameOverSceneUI')
export class GameOverSceneUI extends Component {
    @property(Node) bgNode: Node | null = null;
    @property(Label) titleLabel: Label | null = null;
    @property(Label) ratioLabel: Label | null = null;
    @property(Node) watchAdBtnNode: Node | null = null;
    @property(Node) backBtnNode: Node | null = null;

    onLoad() {
        Logger.info('GameOverSceneUI', '▶ onLoad 开始：进入 GameOver 场景');
        try {
            Logger.info('GameOverSceneUI', '  [1/4] 程序化构建 UI 节点');
            this._ensureNodes();
            Logger.info('GameOverSceneUI', `    bgNode=${!!this.bgNode} titleLabel=${!!this.titleLabel} ratioLabel=${!!this.ratioLabel}`);
            Logger.info('GameOverSceneUI', `    watchAdBtnNode=${!!this.watchAdBtnNode} backBtnNode=${!!this.backBtnNode}`);

            Logger.info('GameOverSceneUI', '  [2/4] 读取路由 payload');
            const payload = SceneRouter.consumePayload<{ ratio: number }>();
            const ratio = payload?.ratio ?? 30;
            Logger.info('GameOverSceneUI', `    payload=${JSON.stringify(payload)} → 显示 ratio=${ratio}%`);

            Logger.info('GameOverSceneUI', '  [3/4] 配置背景 + 文案');
            if (this.bgNode) {
                const s = this.bgNode.getComponent(Sprite);
                if (s) s.color = new Color(0x1A, 0x0E, 0x14, 0xFF);
                Logger.info('GameOverSceneUI', '    bgNode 已设置为深色');
            } else {
                Logger.warn('GameOverSceneUI', '    bgNode 缺失');
            }
            if (this.titleLabel) {
                this.titleLabel.string = '游戏失败';
                this.titleLabel.color = COLOR.WHITE;
                this.titleLabel.fontSize = FONT.H1;
            }
            if (this.ratioLabel) {
                this.ratioLabel.string = `${ratio}%`;
                this.ratioLabel.color = COLOR.ORANGE;
                this.ratioLabel.fontSize = 72;
                Logger.info('GameOverSceneUI', `    ratioLabel="${ratio}%"`);
            }

            Logger.info('GameOverSceneUI', '  [4/4] 绑定按钮回调');
            const ad = this._getOrAdd(this.watchAdBtnNode, PrimaryButton);
            if (ad) {
                ad.setText('📺 看广告 + 再来一局');
                ad.onClick = () => {
                    Logger.info('GameOverSceneUI', '玩家点击"看广告 + 再来一局" → 跳 GameScene');
                    SceneRouter.navigateTo('GameScene');
                };
                Logger.info('GameOverSceneUI', '    watchAdBtn 绑定成功');
            }
            const back = this._getOrAdd(this.backBtnNode, SecondaryButton);
            if (back) {
                back.setText('返回菜单');
                back.onClick = () => {
                    Logger.info('GameOverSceneUI', '玩家点击"返回菜单" → 跳 MenuScene');
                    SceneRouter.navigateTo('MenuScene');
                };
                Logger.info('GameOverSceneUI', '    backBtn 绑定成功');
            }
            Logger.info('GameOverSceneUI', `✅ onLoad 完成：GameOver 场景初始化成功 ratio=${ratio}%`);
        } catch (e: any) {
            Logger.error('GameOverSceneUI', '❌ onLoad 异常：' + (e?.message ?? e));
            Logger.error('GameOverSceneUI', '   stack: ' + (e?.stack ?? 'no stack'));
        }
    }

    onEnable() {
        Logger.info('GameOverSceneUI', '▶ onEnable：GameOver 场景节点激活（onEnter）');
        Logger.info('GameOverSceneUI', `    子节点数量=${this.node.children.length}`);
    }

    start() {
        Logger.info('GameOverSceneUI', '▶ start：GameOver 场景首帧渲染完成');
    }

    private _ensureNodes() {
        const root = this.node;
        const ui = root.getComponent(UITransform) || root.addComponent(UITransform);
        ui.setContentSize(720, 1280);

        if (!this.bgNode) {
            this.bgNode = UIBuilder.sprite(root, 'bgNode', new Color(0x1A, 0x0E, 0x14, 0xFF), 0, 0, 720, 1280);
        }
        if (!this.titleLabel) {
            const n = UIBuilder.label(root, 'titleLabel', '游戏失败', COLOR.WHITE, FONT.H1, 0, 300, 300, 80);
            this.titleLabel = n.getComponent(Label);
        }
        if (!this.ratioLabel) {
            const n = UIBuilder.label(root, 'ratioLabel', '30%', COLOR.ORANGE, 72, 0, 180, 300, 100);
            this.ratioLabel = n.getComponent(Label);
        }
        if (!this.watchAdBtnNode) {
            this.watchAdBtnNode = UIBuilder.button(root, 'watchAdBtnNode', COLOR.ORANGE, '📺 看广告 + 再来一局', COLOR.WHITE, 20, 0, 0, 420, 100);
        }
        if (!this.backBtnNode) {
            this.backBtnNode = UIBuilder.button(root, 'backBtnNode', new Color(0x2A, 0x18, 0x20, 0xFF), '返回菜单', COLOR.WHITE, 20, 0, -140, 360, 80);
        }
    }

    private _getOrAdd<T extends Component>(node: Node | null, ctor: new () => T): T | null {
        if (!node) return null;
        const existing = node.getComponent(ctor);
        if (existing) return existing;
        return node.addComponent(ctor);
    }
}
