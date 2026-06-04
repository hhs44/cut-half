/**
 * CutObject — 切割物体（简单矩形：支持多种颜色主题，上下边缘高亮）
 *
 * 物体本身不处理切割逻辑，只负责"视觉状态"，被 CutAnimator 控制。
 */

import { _decorator, Component, Node, Sprite, UITransform, Color, Vec3 } from 'cc';
import { COLOR } from '../ui/theme/Theme';
import { Logger } from '../utils/Logger';
import { CutObjectConfig } from '../core/GameConfig';
const { ccclass, property } = _decorator;

@ccclass('CutObject')
export class CutObject extends Component {
    @property(Node) topHighlight: Node | null = null;
    @property(Node) bottomHighlight: Node | null = null;
    @property(Node) body: Node | null = null;

    private _currentConfig: CutObjectConfig | null = null;

    onLoad() {
        Logger.info('CutObject', '组件初始化');
        if (this.body) {
            const s = this.body.getComponent(Sprite);
            if (s) s.color = COLOR.ORANGE;
        }
        if (this.topHighlight) {
            const s = this.topHighlight.getComponent(Sprite);
            if (s) s.color = new Color(255, 255, 255, 40);
        }
        if (this.bottomHighlight) {
            const s = this.bottomHighlight.getComponent(Sprite);
            if (s) s.color = new Color(230, 106, 61, 100);
        }
    }

    /**
     * 应用物体配置
     */
    public applyConfig(config: CutObjectConfig) {
        this._currentConfig = config;
        Logger.info('CutObject', `应用配置: ${config.name}`);
        
        if (this.body) {
            const s = this.body.getComponent(Sprite);
            if (s) s.color = config.mainColor;
        }
        if (this.bottomHighlight) {
            const s = this.bottomHighlight.getComponent(Sprite);
            if (s) s.color = config.highlightColor;
        }
    }

    /** 获取当前物体配置 */
    public getConfig(): CutObjectConfig | null {
        return this._currentConfig;
    }

    public getHeight(): number {
        const ui = this.node.getComponent(UITransform);
        const h = ui ? ui.height : 0;
        Logger.info('CutObject', `获取物体高度: ${h}`);
        return h;
    }

    public reset() {
        this.node.setPosition(0, 0, 0);
        this.node.setScale(1, 1, 1);
        this.node.active = true;
        Logger.info('CutObject', '物体归位并激活');
    }
}
