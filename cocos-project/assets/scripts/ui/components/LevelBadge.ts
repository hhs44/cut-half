/**
 * LevelBadge — 关卡徽章（"Lv.1 矩形"）
 *
 * 金色渐变背景，白色文字。
 */

import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('LevelBadge')
export class LevelBadge extends Component {
    @property(Label) titleLabel: Label | null = null;
    @property(Node) bg: Node | null = null;

    onLoad() {
        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = COLOR.GOLD;
        }
        if (this.titleLabel) {
            this.titleLabel.color = COLOR.WHITE;
            this.titleLabel.fontSize = FONT.BODY;
        }
    }

    public setLevel(level: number, name: string) {
        if (this.titleLabel) this.titleLabel.string = `Lv.${level} ${name}`;
    }
}
