/**
 * CountdownPill — 倒计时胶囊（"⏰ 3 秒后自动撤销"）
 *
 * 订阅倒计时事件（由 ItemManager 发出），或手动 setSeconds(3) 更新。
 */

import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('CountdownPill')
export class CountdownPill extends Component {
    @property(Label) secondsLabel: Label | null = null;
    @property(Label) textLabel: Label | null = null;
    @property(Node) bg: Node | null = null;

    onLoad() {
        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = COLOR.INK;
        }
        if (this.secondsLabel) {
            this.secondsLabel.color = COLOR.GOLD;
            this.secondsLabel.fontSize = FONT.H3;
        }
        if (this.textLabel) {
            this.textLabel.color = COLOR.WHITE;
            this.textLabel.fontSize = FONT.SMALL;
        }
    }

    public setSeconds(sec: number) {
        if (this.secondsLabel) this.secondsLabel.string = `${sec}`;
        if (this.textLabel) this.textLabel.string = '秒后自动撤销';
    }

    public show() { this.node.active = true; }
    public hide() { this.node.active = false; }
}
