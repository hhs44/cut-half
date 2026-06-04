/**
 * AudioManager — 音频单例（事件驱动）
 *
 * 订阅：
 *   - GameEvent.JudgeResult → pass: 通关音效；fail: 失败音效
 *   - GameEvent.CutAnimationRequested → 切割音效
 *   - SettingsEvent.Bgm / Sfx → 开关
 *   - 场景启动 → 循环背景音乐
 */

import { _decorator, AudioClip, AudioSource, Component, director, Node, resources, sys } from 'cc';
import { GameEvent, gameEventTarget } from '../core/GameManager';
import { SettingsEvent } from '../ui/scenes/SettingsModal';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    public static get instance(): AudioManager { return AudioManager._instance!; }

    private _bgm: AudioSource | null = null;
    private _sfx: AudioSource | null = null;
    private _bgmOn = true;
    private _sfxOn = true;

    onLoad() {
        if (AudioManager._instance && AudioManager._instance !== this) {
            this.node.destroy();
            return;
        }
        AudioManager._instance = this;
        director.addPersistRootNode(this.node);

        this._bgm = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
        this._bgm.loop = true;
        this._bgm.volume = 0.3;

        this._sfx = this.node.addComponent(AudioSource);
        this._sfx.loop = false;
        this._sfx.volume = 0.5;

        // 初始值
        this._bgmOn = sys.localStorage.getItem('settings-bgm') !== '0';
        this._sfxOn = sys.localStorage.getItem('settings-sfx') !== '0';

        // 尝试加载 BGM（若资源目录未提供 → 静默失败）
        resources.load('audio/bgm-loop', AudioClip, (err, clip) => {
            if (err) { Logger.warn('AudioManager', 'BGM 未找到: ' + err); return; }
            if (!this._bgm) return;
            this._bgm.clip = clip;
            if (this._bgmOn) this._bgm.play();
        });

        gameEventTarget.on(GameEvent.CutAnimationRequested, () => this._playSfx('audio/sfx-cut'), this);
        gameEventTarget.on(GameEvent.JudgeResult, (d: any) => {
            if (d.pass) this._playSfx('audio/sfx-perfect');
            else this._playSfx('audio/sfx-fail');
        }, this);
        gameEventTarget.on(SettingsEvent.Bgm, (d: { on: boolean }) => this._toggleBgm(d.on), this);
        gameEventTarget.on(SettingsEvent.Sfx, (d: { on: boolean }) => { this._sfxOn = d.on; }, this);
    }

    onDestroy() {
        gameEventTarget.off(GameEvent.CutAnimationRequested, () => {}, this);
        gameEventTarget.off(GameEvent.JudgeResult, () => {}, this);
    }

    private _playSfx(path: string) {
        if (!this._sfxOn || !this._sfx) return;
        resources.load(path, AudioClip, (err, clip) => {
            if (err) { Logger.warn('AudioManager', `SFX 未找到: ${path}`); return; }
            if (this._sfx && this._sfxOn) this._sfx.playOneShot(clip, 1.0);
        });
    }

    private _toggleBgm(on: boolean) {
        this._bgmOn = on;
        if (this._bgm) {
            if (on && !this._bgm.playing) this._bgm.play();
            if (!on && this._bgm.playing) this._bgm.stop();
        }
    }
}
