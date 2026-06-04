/**
 * ResultSceneUI — 通关场景（Win）
 *
 * Emoji 🎉 + "50%" 大字（橙+金色高亮） + 再来一局 + 返回菜单
 */

import { _decorator, Component, Node, Label, UITransform } from 'cc';
import { SceneRouter } from '../../routing/SceneRouter';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { COLOR, FONT } from '../theme/Theme';
import { Logger } from '../../utils/Logger';
import { UIBuilder } from '../../utils/UIBuilder';
const { ccclass, property } = _decorator;

@ccclass('ResultSceneUI')
export class ResultSceneUI extends Component {
    @property(Label) emojiLabel: Label | null = null;
    @property(Label) ratioLabel: Label | null = null;
    @property(Node) againBtnNode: Node | null = null;
    @property(Node) backBtnNode: Node | null = null;

    onLoad() {
        Logger.info('ResultSceneUI', '▶ onLoad 开始：进入通关场景');
        try {
            Logger.info('ResultSceneUI', '  [1/4] 程序化构建 UI 节点');
            this._ensureNodes();
            Logger.info('ResultSceneUI', `    emojiLabel=${!!this.emojiLabel} ratioLabel=${!!this.ratioLabel} againBtnNode=${!!this.againBtnNode} backBtnNode=${!!this.backBtnNode}`);

            Logger.info('ResultSceneUI', '  [2/4] 读取路由 payload');
            const payload = SceneRouter.consumePayload<{ ratio: number }>();
            const ratio = payload?.ratio ?? 50;
            Logger.info('ResultSceneUI', `    payload=${JSON.stringify(payload)} → 显示 ratio=${ratio}%`);

            Logger.info('ResultSceneUI', '  [3/4] 配置文案');
            if (this.emojiLabel) { this.emojiLabel.string = '🎉 ✨'; this.emojiLabel.fontSize = FONT.H1; }
            if (this.ratioLabel) {
                this.ratioLabel.string = `${ratio}%`;
                this.ratioLabel.color = COLOR.ORANGE;
                this.ratioLabel.fontSize = 72;
                Logger.info('ResultSceneUI', `    ratioLabel="${ratio}%"`);
            }

            Logger.info('ResultSceneUI', '  [4/4] 绑定按钮回调');
            const again = this.againBtnNode?.getComponent(PrimaryButton) || this.againBtnNode?.addComponent(PrimaryButton);
            if (again) {
                again.setText('↻ 再来一局');
                again.onClick = () => {
                    Logger.info('ResultSceneUI', '玩家点击"再来一局" → 跳 GameScene');
                    SceneRouter.navigateTo('GameScene');
                };
                Logger.info('ResultSceneUI', '    againBtn 绑定成功');
            }
            const back = this.backBtnNode?.getComponent(SecondaryButton) || this.backBtnNode?.addComponent(SecondaryButton);
            if (back) {
                back.setText('返回菜单');
                back.onClick = () => {
                    Logger.info('ResultSceneUI', '玩家点击"返回菜单" → 跳 MenuScene');
                    SceneRouter.navigateTo('MenuScene');
                };
                Logger.info('ResultSceneUI', '    backBtn 绑定成功');
            }
            Logger.info('ResultSceneUI', `✅ onLoad 完成：通关场景初始化成功 ratio=${ratio}%`);
        } catch (e: any) {
            Logger.error('ResultSceneUI', '❌ onLoad 异常：' + (e?.message ?? e));
            Logger.error('ResultSceneUI', '   stack: ' + (e?.stack ?? 'no stack'));
        }
    }

    onEnable() {
        Logger.info('ResultSceneUI', '▶ onEnable：通关场景节点激活（onEnter）');
        Logger.info('ResultSceneUI', `    子节点数量=${this.node.children.length}`);
    }

    start() {
        Logger.info('ResultSceneUI', '▶ start：通关场景首帧渲染完成');
    }

    private _ensureNodes() {
        const root = this.node;
        const ui = root.getComponent(UITransform) || root.addComponent(UITransform);
        ui.setContentSize(720, 1280);

        if (!this.emojiLabel) {
            const n = UIBuilder.label(root, 'emojiLabel', '🎉 ✨', COLOR.ORANGE, FONT.H1, 0, 300, 300, 60);
            this.emojiLabel = n.getComponent(Label);
        }
        if (!this.ratioLabel) {
            const n = UIBuilder.label(root, 'ratioLabel', '50%', COLOR.ORANGE, 72, 0, 180, 300, 100);
            this.ratioLabel = n.getComponent(Label);
        }
        if (!this.againBtnNode) {
            this.againBtnNode = UIBuilder.button(root, 'againBtnNode', COLOR.ORANGE, '↻ 再来一局', COLOR.WHITE, 22, 0, 0, 400, 100);
        }
        if (!this.backBtnNode) {
            this.backBtnNode = UIBuilder.button(root, 'backBtnNode', COLOR.WHITE, '返回菜单', COLOR.INK, 20, 0, -120, 360, 80);
        }
    }
}
