/**
 * SecondaryButton — 次要按钮（白底 + 细线边框）
 *
 * 交互：点击后在边框色上短暂闪烁（反馈用户操作）。
 */

import { _decorator, Button, Component, EventTouch, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('SecondaryButton')
export class SecondaryButton extends Component {
    @property(Label) label: Label | null = null;
    @property(Node) body: Node | null = null;
    @property(Button) button: Button | null = null;

    public onClick: (() => void) | null = null;

    onLoad() {
        if (!this.button) this.button = this.node.getComponent(Button);
        if (!this.button) this.button = this.node.addComponent(Button);

        this.node.on(Node.EventType.TOUCH_START, this._onPress, this);
        this.node.on(Node.EventType.TOUCH_END, this._onRelease, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onRelease, this);

        if (this.body) {
            const s = this.body.getComponent(Sprite);
            if (s) s.color = COLOR.WHITE;
        }
        if (this.label) {
            this.label.color = COLOR.INK;
            this.label.fontSize = FONT.BODY;
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this._onPress, this);
        this.node.off(Node.EventType.TOUCH_END, this._onRelease, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onRelease, this);
    }

    public setText(text: string) {
        if (this.label) this.label.string = text;
    }

    private _onPress() {
        if (this.body) {
            tween(this.body)
                .to(0.08, { position: new Vec3(0, -2, 0) })
                .start();
        }
    }

    private _onRelease() {
        if (this.body) {
            tween(this.body)
                .to(0.08, { position: new Vec3(0, 0, 0) })
                .start();
        }
        if (this.onClick) this.onClick();
    }
}
