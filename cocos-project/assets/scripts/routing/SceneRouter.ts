/**
 * SceneRouter — 场景路由（取代 director.loadScene 的散落调用，统一入口）
 *
 * 特色：
 *   - 一次性"场景 payload"：navigateTo(name, payload?) → 下一 onLoad 可 consumePayload<T>()
 *   - 历史栈（用于简单"返回"）
 *
 * 用法：
 *   SceneRouter.navigateTo('GameScene', { level: 1 });
 *   // ... 新场景 onLoad():
 *   const payload = SceneRouter.consumePayload<{ level: number }>();
 *   if (payload) ...;
 */

import { _decorator, director } from 'cc';
import { Logger } from '../utils/Logger';
const { ccclass } = _decorator;

@ccclass('SceneRouter')
export class SceneRouter {
    private static _pendingPayload: any = null;
    private static _history: string[] = [];

    /** 切场景；payload 只在下一次 consumePayload 生效（一次性） */
    public static navigateTo(sceneName: string, payload?: any, onLaunched?: () => void) {
        SceneRouter._pendingPayload = payload;
        SceneRouter._history.push(sceneName);
        Logger.info('SceneRouter', `navigateTo → ${sceneName}${payload ? ' (has payload)' : ''}`);
        Logger.info('SceneRouter', `当前历史栈: [${SceneRouter._history.join(', ')}]`);
        director.loadScene(sceneName, (err) => {
            if (err) {
                Logger.error('SceneRouter', `加载失败: ${sceneName}`, err);
            } else {
                    Logger.info('SceneRouter', `成功加载: ${sceneName}`);
                    onLaunched && onLaunched();
                }
        });
    }

    /** 返回上一个场景（没有历史时回主菜单） */
    public static goBack(fallbackScene: string = 'MenuScene') {
        SceneRouter._history.pop(); // 丢当前
        const prev = SceneRouter._history[SceneRouter._history.length - 1] || fallbackScene;
        Logger.info('SceneRouter', `goBack → ${prev} (fallback=${fallbackScene})`);
        SceneRouter.navigateTo(prev);
    }

    /** 消费一次性 payload（只返回一次，之后返回 null） */
    public static consumePayload<T>(): T | null {
        const p = SceneRouter._pendingPayload;
        SceneRouter._pendingPayload = null;
        Logger.info('SceneRouter', `consumePayload → ${p ? JSON.stringify(p) : '(null'}`, p);
        return p as T | null;
    }

    /** 清历史（主菜单回到起点时调一次） */
    public static clearHistory() {
        SceneRouter._history = [];
        Logger.info('SceneRouter', 'clearHistory');
    }
}
