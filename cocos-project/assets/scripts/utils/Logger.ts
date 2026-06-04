/**
 * Logger.ts — 简单日志工具
 *
 * 在非 DEBUG 环境（release、小游戏上传包）下可以把 __LOG_LEVEL__ 设为 'warn'
 * 或 'error'，减少 console 打印。在 Cocos Creator 中默认 DEBUG 开启。
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// 可外部覆盖：(window as any).__LOG_LEVEL__ = 'warn'
declare const __LOG_LEVEL__: LogLevel | undefined;

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
};

function currentLevel(): LogLevel {
    try {
        if (typeof __LOG_LEVEL__ !== 'undefined') return __LOG_LEVEL__;
    } catch (_) { /* noop */ }
    return 'info';
}

function shouldLog(at: LogLevel): boolean {
    return LEVEL_ORDER[at] >= LEVEL_ORDER[currentLevel()];
}

const prefix = (tag: string) => `[${tag}]`;

export const Logger = {
    debug(tag: string, ...args: any[]) {
        if (!shouldLog('debug')) return;
        // eslint-disable-next-line no-console
        console.debug(prefix(tag), ...args);
    },
    info(tag: string, ...args: any[]) {
        if (!shouldLog('info')) return;
        // eslint-disable-next-line no-console
        console.log(prefix(tag), ...args);
    },
    warn(tag: string, ...args: any[]) {
        if (!shouldLog('warn')) return;
        // eslint-disable-next-line no-console
        console.warn(prefix(tag), ...args);
    },
    error(tag: string, ...args: any[]) {
        if (!shouldLog('error')) return;
        // eslint-disable-next-line no-console
        console.error(prefix(tag), ...args);
    },
};

/** 断言：只在 DEBUG 生效，失败时打 warn —— 不抛异常以免中断小游戏 */
export function assert(cond: any, message: string): void {
    if (!cond) {
        Logger.warn('ASSERT', message);
    }
}
