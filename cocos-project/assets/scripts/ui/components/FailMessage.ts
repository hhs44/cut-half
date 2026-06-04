/**
 * FailMessage — 失败文案胶囊（按比例变色）
 *
 * 内容示例："差 3%，再来！"、"差太远啦，物体中心在哪？"
 */

import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { tierFromRatio } from '../../core/GameConfig';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('FailMessage')
export class FailMessage extends Component {
    @property(Label) msgLabel: Label | null = null;
    @property(Node) bg: Node | null = null;

    onLoad() {
        if (this.msgLabel) {
            this.msgLabel.color = COLOR.INK;
            this.msgLabel.fontSize = FONT.BODY;
        }
    }

    /** 根据切割比例选择文案胶囊颜色 */
    public setRatio(ratio: number) {
        const tier = tierFromRatio(ratio);
        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = tier.bgColor;
        }
        if (this.msgLabel) {
            this.msgLabel.color = tier.textColor;
            const diff = Math.abs(ratio - 50);
            this.msgLabel.string = tier.message(diff);
        }
    }
}
