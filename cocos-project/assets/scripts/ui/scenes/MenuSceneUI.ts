/**
 * MenuSceneUI — 主菜单控制器
 *
 * 负责：
 *   - 标题文字渲染（shadow/outline 效果由 cocos 的 Label Outline 组件提供）
 *   - 开始按钮 → 进入 GameScene
 *   - 设置按钮 → 打开设置弹层
 *   - 页脚：背景音乐/音效状态提示
 */

import { _decorator, Component, Node, Label, find, director, sys, UITransform, Sprite, Color } from 'cc';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SceneRouter } from '../../routing/SceneRouter';
import { GameManager } from '../../core/GameManager';
import { AudioManager } from '../../audio/AudioManager';
import { COLOR, FONT } from '../theme/Theme';
import { SettingsModal } from './SettingsModal';
import { Logger } from '../../utils/Logger';
import { UIBuilder } from '../../utils/UIBuilder';
const { ccclass, property } = _decorator;

@ccclass('MenuSceneUI')
export class MenuSceneUI extends Component {
    @property(Node) startBtnNode: Node | null = null;   // 挂 PrimaryButton
    @property(Node) settingsBtnNode: Node | null = null;// 挂 SecondaryButton
    @property(Label) titleLabel: Label | null = null;
    @property(Label) subtitleLabel: Label | null = null;
    @property(Node) settingsModal: Node | null = null;  // 设置弹层（默认隐藏）

    onLoad() {
        Logger.info('MenuSceneUI', '▶ onLoad 开始：进入主菜单场景');
        try {
            Logger.info('MenuSceneUI', '  [1/5] 清空场景路由历史');
            SceneRouter.clearHistory();

            Logger.info('MenuSceneUI', '  [2/5] 确保单例逻辑组件存在');
            this._ensureSingleton('GameManagerNode', GameManager);
            this._ensureSingleton('AudioManagerNode', AudioManager);
            Logger.info('MenuSceneUI', '    GameManagerNode 存在=' + (find('/GameManagerNode') !== null));
            Logger.info('MenuSceneUI', '    AudioManagerNode 存在=' + (find('/AudioManagerNode') !== null));

            Logger.info('MenuSceneUI', '  [3/5] 程序化构建 UI 节点');
            this._ensureNodes();
            Logger.info('MenuSceneUI', `    titleLabel=${!!this.titleLabel} subtitleLabel=${!!this.subtitleLabel} startBtnNode=${!!this.startBtnNode} settingsBtnNode=${!!this.settingsBtnNode} settingsModal=${!!this.settingsModal}`);

            Logger.info('MenuSceneUI', '  [4/5] 配置标题文案');
            if (this.titleLabel) {
                this.titleLabel.color = COLOR.ORANGE;
                this.titleLabel.fontSize = 48;
                this.titleLabel.string = '切一半';
                Logger.info('MenuSceneUI', '    titleLabel 已配置："切一半"');
            } else {
                Logger.warn('MenuSceneUI', '    titleLabel 缺失，跳过配置');
            }
            if (this.subtitleLabel) {
                this.subtitleLabel.color = COLOR.INK;
                this.subtitleLabel.fontSize = FONT.BODY;
                this.subtitleLabel.string = '精准切割 50%';
            }

            Logger.info('MenuSceneUI', '  [5/5] 配置按钮点击回调');
            const start = this.startBtnNode?.getComponent(PrimaryButton) || this.startBtnNode?.addComponent(PrimaryButton);
            if (start) {
                start.setText('▶ 开始游戏');
                start.onClick = () => {
                    Logger.info('MenuSceneUI', '玩家点击"开始游戏" → 跳 GameScene');
                    SceneRouter.navigateTo('GameScene');
                };
                Logger.info('MenuSceneUI', '    开始按钮 已绑定');
            } else {
                Logger.error('MenuSceneUI', '    startBtnNode / PrimaryButton 挂载失败');
            }

            const settings = this.settingsBtnNode?.getComponent(SecondaryButton) || this.settingsBtnNode?.addComponent(SecondaryButton);
            if (settings) {
                settings.setText('⚙ 设置');
                settings.onClick = () => {
                    Logger.info('MenuSceneUI', '玩家点击"设置" → 打开设置弹层');
                    if (this.settingsModal) this.settingsModal.active = true;
                };
                Logger.info('MenuSceneUI', '    设置按钮 已绑定');
            } else {
                Logger.error('MenuSceneUI', '    settingsBtnNode / SecondaryButton 挂载失败');
            }

            if (this.settingsModal) this.settingsModal.active = false;
            Logger.info('MenuSceneUI', '✅ onLoad 完成：主菜单初始化成功');
        } catch (e: any) {
            Logger.error('MenuSceneUI', '❌ onLoad 异常：' + (e?.message ?? e));
            Logger.error('MenuSceneUI', '   stack: ' + (e?.stack ?? 'no stack'));
        }
    }

    onEnable() {
        Logger.info('MenuSceneUI', '▶ onEnable：主菜单节点激活（onEnter）');
        Logger.info('MenuSceneUI', `    子节点数量=${this.node.children.length}`);
    }

    start() {
        Logger.info('MenuSceneUI', '▶ start：主菜单首帧渲染完成');
    }

    private _ensureNodes() {
        const root = this.node;
        // Canvas 尺寸对齐
        const ui = root.getComponent(UITransform);
        if (!ui) root.addComponent(UITransform);
        const canvasUI = root.getComponent(UITransform)!;
        canvasUI.setContentSize(720, 1280);

        // 标题：Canvas 中心偏上
        if (!this.titleLabel) {
            const n = UIBuilder.label(root, 'titleLabel', '切一半', COLOR.ORANGE, 48, 0, 300, 400, 80);
            this.titleLabel = n.getComponent(Label);
        }
        // 副标题
        if (!this.subtitleLabel) {
            const n = UIBuilder.label(root, 'subtitleLabel', '精准切割 50%', COLOR.INK, FONT.BODY, 0, 220, 300, 40);
            this.subtitleLabel = n.getComponent(Label);
        }
        // 开始按钮
        if (!this.startBtnNode) {
            this.startBtnNode = UIBuilder.button(root, 'startBtnNode', COLOR.ORANGE, '▶ 开始游戏', COLOR.WHITE, 22, 0, 80, 400, 100);
        }
        // 设置按钮
        if (!this.settingsBtnNode) {
            this.settingsBtnNode = UIBuilder.button(root, 'settingsBtnNode', COLOR.WHITE, '⚙ 设置', COLOR.INK, 20, 0, -50, 360, 80);
        }
        // 设置弹层（默认隐藏）
        if (!this.settingsModal) {
            const modal = UIBuilder.sprite(root, 'settingsModal', new Color(0, 0, 0, 180), 0, 0, 720, 1280);
            const panel = UIBuilder.sprite(modal, 'panel', COLOR.WHITE, 0, 0, 520, 600);
            // 标题
            UIBuilder.label(panel, 'modalTitle', '设 置', COLOR.INK, 28, 0, 220, 300, 40);
            // BGM 行
            const bgmRow = UIBuilder.node(panel, 'bgmToggleNode', 0, 120, 420, 60);
            UIBuilder.label(bgmRow, 'bgmLabel', '背景音乐', COLOR.INK, 20, -140, 0, 200, 40);
            const bgmTrack = UIBuilder.sprite(bgmRow, 'track', COLOR.LINE, 120, 0, 80, 40);
            UIBuilder.sprite(bgmTrack, 'thumb', COLOR.WHITE, -10, 0, 28, 28);
            bgmRow.addComponent(SettingsModal);
            // SFX 行
            const sfxRow = UIBuilder.node(panel, 'sfxToggleNode', 0, 40, 420, 60);
            UIBuilder.label(sfxRow, 'sfxLabel', '音效', COLOR.INK, 20, -140, 0, 200, 40);
            const sfxTrack = UIBuilder.sprite(sfxRow, 'track', COLOR.LINE, 120, 0, 80, 40);
            UIBuilder.sprite(sfxTrack, 'thumb', COLOR.WHITE, -10, 0, 28, 28);
            sfxRow.addComponent(SettingsModal);
            // 关闭按钮
            const closeBtn = UIBuilder.button(panel, 'closeBtn', COLOR.ORANGE, '关闭', COLOR.WHITE, 20, 0, -180, 240, 70);
            closeBtn.on(Node.EventType.TOUCH_END, () => { modal.active = false; }, this);
            this.settingsModal = modal;
            modal.active = false;
        }
    }

    private _ensureSingleton<T extends Component>(nodeName: string, ctor: new () => T) {
        if (find(`/${nodeName}`)) return;
        const n = new Node(nodeName);
        n.addComponent(ctor);
        director.addPersistRootNode(n);
    }
}
