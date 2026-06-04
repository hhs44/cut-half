/**
 * PrimaryButton — 主按钮（大橙按钮 + "按下阴影"效果）
 *
 * 结构（由编辑器创建并拖进 Inspector 绑定，或在 onLoad 中自动以命名查找）：
 *   this.node（按钮根）
 *     ├─ shadow   // 暗色"阴影"节点（按下时隐藏，弹起时显示）
 *     └─ body     // 橙色主体（带 label）
 *
 * 交互：
 *   - TOUCH_START → body 下移 + shadow 隐藏（视觉上"按下去"）
 *   - TOUCH_END / CANCEL → body 归位 + shadow 显示
 *   - 结束若在节点内 → 触发 onClick 回调
 */

import { _decorator, Button, Component, EventTouch, Label, Node, Sprite, tween, UITransform, Vec2, Vec3 } from 'cc';
import { COLOR, FONT, RADIUS, SHADOW } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('PrimaryButton')
export class PrimaryButton extends Component {
    @property(Label) label: Label | null = null;
    @property(Node) body: Node | null = null;        // 橙色主体
    @property(Node) shadow: Node | null = null;      // 阴影层（位置比 body 低一点）
    @property({ type: Button }) button: Button | null = null;

    /** 点击回调（给场景 UI 绑定） */
    public onClick: (() => void) | null = null;

    /** 初始化一次（onLoad 自动处理，不用手动调） */
    onLoad() {
        if (!this.button) this.button = this.node.getComponent(Button);
        if (!this.button) this.button = this.node.addComponent(Button);

        this.node.on(Node.EventType.TOUCH_START, this._onPress, this);
        this.node.on(Node.EventType.TOUCH_END, this._onRelease, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onRelease, this);

        // 默认样式
        if (this.body) {
            const s = this.body.getComponent(Sprite);
            if (s) s.color = COLOR.ORANGE;
        }
        if (this.label) {
            this.label.color = COLOR.WHITE;
            this.label.fontSize = FONT.H3;
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this._onPress, this);
        this.node.off(Node.EventType.TOUCH_END, this._onRelease, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onRelease, this);
    }

    /** 设置按钮文案 */
    public setText(text: string) {
        if (this.label) this.label.string = text;
    }

    private _onPress() {
        if (this.body) {
            tween(this.body)
                .to(0.08, { position: new Vec3(0, -SHADOW.BTN_OFFSET_Y, 0) })
                .start();
        }
        if (this.shadow) this.shadow.active = false;
    }

    private _onRelease(_e: EventTouch) {
        if (this.body) {
            tween(this.body)
                .to(0.08, { position: new Vec3(0, 0, 0) })
                .start();
        }
        if (this.shadow) this.shadow.active = true;
        if (this.onClick) this.onClick();
    }
}
