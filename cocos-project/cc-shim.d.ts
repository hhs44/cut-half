/**
 * cc-shim.d.ts — Cocos Creator 3.8 minimal type stub
 *
 * 目的：让 `tsc --noEmit` 在没有安装 @cocos/creator-types 时也能进行语法检查。
 *
 * 这个 shim 只声明 Cocos 3.8 公开 API 的"形状"，类型字段宽松（多数用 any），
 * 不会影响实际 Cocos 编辑器 / 引擎运行。开发时仍然推荐在 Cocos Creator 内置的
 * `tsconfig.json` (engine 内置的 types/creator.d.ts) 中做完整类型检查。
 *
 * Cocos 3.8 实际类型来源：https://docs.cocos.com/creator/3.8/api/zh/
 */

declare module 'cc' {

    // ===== Decorators =====
    export const _decorator: {
        ccclass: (name?: string) => ClassDecorator;
        property: (...args: any[]) => PropertyDecorator & any;
        executeInEditMode: (enabled?: boolean) => ClassDecorator;
        requireComponent: (...types: any[]) => ClassDecorator;
        executionOrder: (order: number) => ClassDecorator;
        disallowMultiple: (enabled?: boolean) => ClassDecorator;
        menu: (path: string) => ClassDecorator;
        help: (url: string) => ClassDecorator;
        integer: PropertyDecorator;
        float: PropertyDecorator;
        type: (t: any) => PropertyDecorator;
    };

    // ===== Core classes =====
    export class Component {
        node: Node;
        name: string;
        enabled: boolean;
        constructor();
        protected onLoad?(): void;
        protected onEnable?(): void;
        protected start?(): void;
        protected update?(dt: number): void;
        protected lateUpdate?(dt: number): void;
        protected onDisable?(): void;
        protected onDestroy?(): void;
        onFocusInEditor?(): void;
        onLostFocusInEditor?(): void;
        resetInEditor?(): void;
        schedule(callback: (dt: number) => void, interval?: number): void;
        scheduleOnce(callback: (dt: number) => void, interval?: number): void;
        unsubscribeAll(): void;
        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T extends Component>(type: new (...args: any[]) => T): T[];
        addComponent<T extends Component>(type: new (...args: any[]) => T): T;
    }

    export class Node {
        static EventType: {
            TRANSFORM_CHANGED: string;
            SIZE_CHANGED: string;
            ANCHOR_CHANGED: string;
            COLOR_CHANGED: string;
            CHILD_ADDED: string;
            CHILD_REMOVED: string;
            PARENT_CHANGED: string;
            NODE_DESTROYED: string;
            TOUCH_START: string;
            TOUCH_MOVE: string;
            TOUCH_END: string;
            TOUCH_CANCEL: string;
            MOUSE_DOWN: string;
            MOUSE_MOVE: string;
            MOUSE_UP: string;
            MOUSE_ENTER: string;
            MOUSE_LEAVE: string;
            MOUSE_WHEEL: string;
        };
        static TransformBit: any;
        name: string;
        active: boolean;
        parent: Node | null;
        children: Node[];
        position: Vec3;
        worldPosition: Vec3;
        rotation: Quat;
        worldRotation: Quat;
        angle: number;
        scale: Vec3;
        worldScale: Vec3;
        eulerAngles: Vec3;
        layer: number;
        activeInHierarchy: boolean;
        constructor(name?: string);
        on(type: string, callback: (event: any) => void, target?: any, useCapture?: boolean): void;
        once(type: string, callback: (event: any) => void, target?: any, useCapture?: boolean): void;
        off(type: string, callback?: (event: any) => void, target?: any, useCapture?: boolean): void;
        targetOff(target: any): void;
        emit(type: string, ...args: any[]): void;
        dispatchEvent(event: Event): void;
        setPosition(x: number | Vec3, y?: number, z?: number): void;
        setWorldPosition(x: number | Vec3, y?: number, z?: number): void;
        setRotation(x: number | Quat, y?: number, z?: number, w?: number): void;
        setScale(x: number | Vec3, y?: number, z?: number): void;
        setParent(value: Node | null, worldStays?: boolean): void;
        addChild(child: Node): Node;
        removeChild(child: Node): void;
        removeFromParent(): void;
        removeAllChildren(): void;
        getChildByName(name: string): Node | null;
        getChildByPath(path: string): Node | null;
        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T extends Component>(type: new (...args: any[]) => T): T[];
        addComponent<T extends Component>(type: new (...args: any[]) => T): T;
        destroy(): void;
        isValid: boolean;
        setSiblingIndex(index: number): void;
        getSiblingIndex(): number;
    }

    // ===== Math types =====
    export class Vec2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        set(x: number, y: number): Vec2;
        clone(): Vec2;
        static ZERO: Readonly<Vec2>;
        static ONE: Readonly<Vec2>;
    }
    export class Vec3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        set(x: number, y: number, z: number): Vec3;
        clone(): Vec3;
        static ZERO: Readonly<Vec3>;
        static ONE: Readonly<Vec3>;
    }
    export class Quat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
    }
    export class Size {
        width: number;
        height: number;
        constructor(width?: number, height?: number);
    }
    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
    }
    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
        static WHITE: Readonly<Color>;
        static BLACK: Readonly<Color>;
        static RED: Readonly<Color>;
        static GREEN: Readonly<Color>;
        static BLUE: Readonly<Color>;
    }

    // ===== Event / Input =====
    export class Event {
        type: string;
        bubbles: boolean;
        target: any;
        currentTarget: any;
        propagationStopped: boolean;
        propagationImmediateStopped: boolean;
        constructor(type: string, bubbles?: boolean);
        preventSwallow: boolean;
    }
    export class EventTouch extends Event {
        touch: any;
        getLocation(): Vec2;
        getUILocation(): Vec2;
        getPreviousLocation(): Vec2;
        getDelta(): Vec2;
    }
    export class EventKeyboard extends Event {
        keyCode: number;
    }
    export class EventMouse extends Event {
        button: number;
        scrollY: number;
    }

    export const input: {
        on(type: string, callback: (event: any) => void, target?: any): void;
        off(type: string, callback?: (event: any) => void, target?: any): void;
        once(type: string, callback: (event: any) => void, target?: any): void;
    };
    export class Input {
        static EventType: {
            TOUCH_START: string;
            TOUCH_MOVE: string;
            TOUCH_END: string;
            TOUCH_CANCEL: string;
            MOUSE_DOWN: string;
            MOUSE_MOVE: string;
            MOUSE_UP: string;
            MOUSE_WHEEL: string;
            KEY_DOWN: string;
            KEY_PRESSING: string;
            KEY_UP: string;
            DEVICEMOTION: string;
        };
    }
    export enum KeyCode {
        SPACE = 32,
        ENTER = 13,
        ESCAPE = 27,
    }

    export class EventTarget {
        on(type: string, callback: (...args: any[]) => void, target?: any): void;
        once(type: string, callback: (...args: any[]) => void, target?: any): void;
        off(type: string, callback?: (...args: any[]) => void, target?: any): void;
        emit(type: string, ...args: any[]): void;
        dispatchEvent(event: Event): void;
        removeAll(type: string): void;
        targetOff(target: any): void;
    }

    // ===== Scene / Director =====
    export class Scene extends Node { }
    export const director: {
        loadScene(sceneName: string, onLoaded?: (err: Error | null, scene: any) => void): void;
        preloadScene(sceneName: string, onLoaded?: (err: Error | null) => void): void;
        runScene(scene: any): void;
        getScene(): any;
        addPersistRootNode(node: Node): void;
        removePersistRootNode(node: Node): void;
    };

    // ===== Asset Management =====
    export const resources: {
        load(path: string, type: any, onComplete: (err: Error | null, asset: any) => void): void;
        loadDir(path: string, type: any, onComplete: (err: Error | null, assets: any[]) => void): void;
        preload(path: string, type: any): void;
    };
    export const assetManager: {
        loadBundle(name: string, options?: any, onComplete?: (err: Error | null, bundle: any) => void): void;
        getBundle(name: string): any;
        releaseAsset(asset: any): void;
        loadRemote<T>(url: string, onComplete: (err: Error | null, asset: T) => void): void;
    };
    export function instantiate<T>(original: T): T;
    export function find(path: string, refNode?: Node): Node | null;

    // ===== Tween =====
    export function tween<T extends Object>(target?: T): Tween<T>;
    export class Tween<T extends Object> {
        constructor(target?: T);
        to(duration: number, props: Partial<T> | { [k: string]: any }, opts?: any): Tween<T>;
        by(duration: number, props: Partial<T> | { [k: string]: any }, opts?: any): Tween<T>;
        start(): Tween<T>;
        stop(): Tween<T>;
        pause(): Tween<T>;
        resume(): Tween<T>;
        clone(): Tween<T>;
        union(other: Tween<any>): Tween<T>;
        repeat(times: number, embedTween?: Tween<any>): Tween<T>;
        repeatForever(embedTween?: Tween<any>): Tween<T>;
        delay(duration: number): Tween<T>;
        call(callback: (...args: any[]) => void): Tween<T>;
        parallel(...tweens: Tween<any>[]): Tween<T>;
        sequence(...tweens: Tween<any>[]): Tween<T>;
        then(other: Tween<any>): Tween<T>;
        target(): T;
        static stopAllByTarget(target: any): void;
        static stopAll(): void;
    }

    // ===== Engine helpers =====
    export const sys: {
        platform: number;
        isBrowser: boolean;
        isNative: boolean;
        isMobile: boolean;
        os: number;
        osVersion: string;
        /** Cocos 3.8 提供的 localStorage 抽象（小游戏平台下对应 tt.setStorageSync 等） */
        localStorage: { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; clear(): void; };
        Platform: {
            WECHAT_GAME: number;
            BYTEDANCE_MINI_GAME: number;
            MOBILE_BROWSER: number;
            DESKTOP_BROWSER: number;
        };
    };

    // ===== Audio engine =====
    export const audioEngine: {
        playMusic(clip: AudioClip, loop: boolean): number;
        playEffect(clip: AudioClip, loop?: boolean, volume?: number): number;
        stop(id: number): void;
        stopAll(): void;
        setMusicVolume(volume: number): void;
        setEffectsVolume(volume: number): void;
        getMusicVolume(): number;
        getEffectsVolume(): number;
        pause(id: number): void;
        resume(id: number): void;
        setLoop(id: number, loop: boolean): void;
        setVolume(id: number, volume: number): void;
    };

    export class AudioSource extends Component {
        clip: AudioClip | null;
        loop: boolean;
        volume: number;
        mute: boolean;
        playing: boolean;
        play(): void;
        stop(): void;
        pause(): void;
        resume(): void;
        playOneShot(clip: AudioClip, volumeScale?: number): void;
        getCurrentTime(): number;
        setCurrentTime(t: number): void;
    }

    // ===== UI / Renderer components (minimal) =====
    export class UITransform extends Component {
        contentSize: Size;
        width: number;
        height: number;
        anchorPoint: Vec2;
        priority: number;
        setContentSize(size: Size | number, height?: number): void;
        getBoundingBox(): any;
        getBoundingBoxToWorld(): any;
        convertToNodeSpaceAR(worldPoint: Vec3): Vec3;
        convertToWorldSpaceAR(localPoint: Vec3): Vec3;
    }
    export class Canvas extends Component {
        cameraComponent: Camera | null;
        alignCanvasWithScreen: boolean;
        fitWidth: boolean;
        fitHeight: boolean;
    }
    export enum ResolutionPolicy {
        UNKNOWN = 0,
        EXACT_FIT = 1,
        FIXED_WIDTH = 2,
        FIXED_HEIGHT = 3,
        SHOW_ALL = 4,
        NO_BORDER = 5,
        FIXED_NONE = 6,
    }
    export const view: {
        setResolutionPolicy(policy: ResolutionPolicy): void;
        getResolutionPolicy(): ResolutionPolicy;
        getVisibleSize(): Size;
        getVisibleSizeInPixel(): Size;
        getDesignResolutionSize(): Size;
        getFrameSize(): Size;
        getFrameSizeInPixel(): Size;
        setDesignResolutionSize(width: number, height: number, policy: ResolutionPolicy): void;
        resizeWithBrowserSize(enabled: boolean): void;
    };
    export const screen: {
        getSafeAreaRect(): Rect;
        windowSize: Size;
    };
    export class Widget extends Component {
        isAlignLeft: boolean;
        isAlignRight: boolean;
        isAlignTop: boolean;
        isAlignBottom: boolean;
        isAlignHorizontalCenter: boolean;
        isAlignVerticalCenter: boolean;
        isAlignOnce: boolean;
        left: number;
        right: number;
        top: number;
        bottom: number;
        horizontalCenter: number;
        verticalCenter: number;
        isAbsoluteLeft: boolean;
        isAbsoluteRight: boolean;
        isAbsoluteTop: boolean;
        isAbsoluteBottom: boolean;
        isAbsoluteHorizontalCenter: boolean;
        isAbsoluteVerticalCenter: boolean;
        target: Node | null;
        alignMode: number;
        updateAlignment(flush?: boolean): void;
    }
    export namespace Widget {
        export enum AlignMode {
            ONCE = 0,
            ON_WINDOW_RESIZE = 1,
            ALWAYS = 2,
        }
    }
    export class Camera extends Component {
        projection: number;
        fov: number;
        fovAxis: number;
        orthoHeight: number;
        near: number;
        far: number;
        color: Color;
        clearFlags: number;
        rect: Rect;
        priority: number;
    }
    export class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        color: Color;
        sizeMode: number;
        trim: boolean;
        fillRange: number;
        fillType: number;
        type: number;
    }
    export namespace Sprite {
        export enum Type {
            SIMPLE = 0,
            SLICED = 1,
            TILED = 2,
            FILLED = 3,
        }
    }
    export class UIOpacity extends Component {
        opacity: number;
    }
    export class Graphics extends Component {
        lineWidth: number;
        strokeColor: Color;
        fillColor: Color;
        rect(x: number, y: number, w: number, h: number): Graphics;
        fill(): Graphics;
        stroke(): Graphics;
        clear(): Graphics;
        moveTo(x: number, y: number): Graphics;
        lineTo(x: number, y: number): Graphics;
        arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean): Graphics;
        close(): Graphics;
        circle(cx: number, cy: number, r: number): Graphics;
        ellipse(cx: number, cy: number, rx: number, ry: number): Graphics;
        roundRect(x: number, y: number, w: number, h: number, r: number | number[]): Graphics;
        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Graphics;
        bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphics;
    }
    export class Label extends Component {
        string: string;
        font: any;
        fontSize: number;
        color: Color;
        lineHeight: number;
        horizontalAlign: number;
        verticalAlign: number;
        useSystemFont: boolean;
        fontFamily: string;
        isBold: boolean;
    }
    export namespace Label {
        export enum HorizontalAlign {
            LEFT = 0,
            CENTER = 1,
            RIGHT = 2,
        }
        export enum VerticalAlign {
            TOP = 0,
            CENTER = 1,
            BOTTOM = 2,
        }
    }
    export class Button extends Component {
        interactable: boolean;
        transition: number;
        target: Node | null;
        clickEvents: any[];
    }

    // ===== Asset types =====
    export class Asset {
        name: string;
        nativeUrl: string;
        refCount: number;
        addRef(): void;
        decRef(): void;
    }
    export class Prefab extends Asset { }
    export class SpriteFrame extends Asset {
        texture: Texture2D | null;
    }
    export class Texture2D extends Asset { }
    export class Material extends Asset { }
    export class AudioClip extends Asset { }
}

declare module 'cc/env' {
    export const DEBUG: boolean;
    export const EDITOR: boolean;
    export const PREVIEW: boolean;
    export const BUILD: boolean;
    export const TEST: boolean;
    export const NATIVE: boolean;
    export const HTML5: boolean;
    export const MINIGAME: boolean;
    export const WECHAT: boolean;
    export const BYTEDANCE: boolean;
    export const OPPO: boolean;
    export const VIVO: boolean;
    export const HUAWEI: boolean;
    export const XIAOMI: boolean;
    export const JKW: boolean;
    export const ALIPAY: boolean;
    export const BAIDU: boolean;
    export const COCOSPLAY: boolean;
    export const TAOBAO: boolean;
    export const TAOBAO_MINIGAME: boolean;
    export const LINSHI: boolean;
    export const QTT: boolean;
    export const RUNTIME_BASED: boolean;
    export const SUPPORT_JIT: boolean;
}
