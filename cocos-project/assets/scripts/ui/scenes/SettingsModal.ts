/**
 * SettingsModal — 设置弹层
 *
 * 内部：
 *   - 音乐开关（持久化：settings-bgm = '0' | '1'）
 *   - 音效开关（持久化：settings-sfx = '0' | '1'）
 *   - 关闭按钮
 */

import { _decorator, Component, Node, sys } from 'cc';
import { ToggleCustom } from '../components/Toggle';
import { GameEvent, gameEventTarget } from '../../core/GameManager';
import { Logger } from '../../utils/Logger';
const { ccclass, property } = _decorator;

const KEY_BGM = 'settings-bgm';
const KEY_SFX = 'settings-sfx';

export const SettingsEvent = {
    Bgm: 'settings-bgm',
    Sfx: 'settings-sfx',
};

@ccclass('SettingsModal')
export class SettingsModal extends Component {
    @property(Node) bgmToggleNode: Node | null = null;
    @property(Node) sfxToggleNode: Node | null = null;
    @property(Node) closeBtn: Node | null = null;

    onLoad() {
        // 读取保存值
        const bgmOn = sys.localStorage.getItem(KEY_BGM) !== '0';  // 默认开
        const sfxOn = sys.localStorage.getItem(KEY_SFX) !== '0';

        const bgm = this.bgmToggleNode?.getComponent(ToggleCustom) || this.bgmToggleNode?.addComponent(ToggleCustom);
        if (bgm) {
            bgm.set(bgmOn, false);
            bgm.onToggle = (on) => {
                sys.localStorage.setItem(KEY_BGM, on ? '1' : '0');
                gameEventTarget.emit(SettingsEvent.Bgm, { on });
                Logger.info('SettingsModal', `BGM = ${on}`);
            };
        }

        const sfx = this.sfxToggleNode?.getComponent(ToggleCustom) || this.sfxToggleNode?.addComponent(ToggleCustom);
        if (sfx) {
            sfx.set(sfxOn, false);
            sfx.onToggle = (on) => {
                sys.localStorage.setItem(KEY_SFX, on ? '1' : '0');
                gameEventTarget.emit(SettingsEvent.Sfx, { on });
                Logger.info('SettingsModal', `SFX = ${on}`);
            };
        }

        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, () => { this.node.active = false; }, this);
        }
    }

    public static isBgmOn(): boolean { return sys.localStorage.getItem(KEY_BGM) !== '0'; }
    public static isSfxOn(): boolean { return sys.localStorage.getItem(KEY_SFX) !== '0'; }
}
