/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * @ignore
 * @module
 */

export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    LOG = 4,
    DEBUG = 5
}

export type ConsoleLevel = 'error' | 'warn' | 'info' | 'log' | 'debug';

export type LogArgs = Array<unknown>;

export class Logger {
    constructor(private logLevel: LogLevel = LogLevel.LOG) {}

    private static instance: Logger;

    static getInstance(logLevel: LogLevel = LogLevel.LOG): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(logLevel);
        }

        return Logger.instance;
    }

    private _logToConsole(level: ConsoleLevel, msg: string, ...args: LogArgs) {
        if (!console[level]) {
            console.warn(`Custom System Builder | Called Logger with unknown level ${level}`);
            level = 'log';
        }

        msg = 'Custom System Builder | ' + msg;

        console[level](msg, ...args);
    }

    public error(msg: string, ...args: LogArgs): void {
        if (this.logLevel >= LogLevel.ERROR) {
            this._logToConsole('error', msg, ...args);
        }
    }

    public warn(msg: string, ...args: LogArgs): void {
        if (this.logLevel >= LogLevel.WARN) {
            this._logToConsole('warn', msg, ...args);
        }
    }

    public info(msg: string, ...args: LogArgs): void {
        if (this.logLevel >= LogLevel.INFO) {
            this._logToConsole('info', msg, ...args);
        }
    }

    public log(msg: string, ...args: LogArgs): void {
        if (this.logLevel >= LogLevel.LOG) {
            this._logToConsole('log', msg, ...args);
        }
    }

    public debug(msg: string, ...args: LogArgs): void {
        if (this.logLevel >= LogLevel.DEBUG) {
            this._logToConsole('debug', msg, ...args);
        }
    }

    public setLogLevel(newLevel: string | number) {
        if (typeof newLevel === 'number') {
            if (!Object.values(LogLevel).includes(newLevel)) {
                console.error(`Custom System Builder | Tried to set unknown level ${newLevel}`);
            } else {
                this.logLevel = newLevel;
            }
        } else {
            if (!(newLevel in LogLevel)) {
                console.error(`Custom System Builder | Tried to set unknown level ${newLevel}`);
            } else {
                this.logLevel = LogLevel[newLevel as keyof typeof LogLevel];
            }
        }
    }
}

export default Logger.getInstance();
