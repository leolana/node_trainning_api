import * as path from 'path';
import { Logger as WinstonLogger }from 'winston';
import { injectable } from 'inversify';

import { LoggerInterface } from './LoggerInterface';

/**
 * Logger
 * ------------------------------------------------
 *
 * This is the main Logger Object. You can create a scope logger
 * or directly use the static log methods.
 *
 * By Default it uses the debug-adapter, but you are able to change
 * this in the start up process in the src/infrastructure/logger/index.ts file.
 */

@injectable()
class Logger implements LoggerInterface {
  public static DEFAULT_SCOPE = 'app';
  private winston: WinstonLogger;

  private static parsePathToScope(filepath: string): string {
    if (filepath.indexOf(path.sep) >= 0) {
      return filepath
        .replace(process.cwd(), '')
        .replace(`${path.sep}src${path.sep}`, '')
        .replace(`${path.sep}dist${path.sep}`, '')
        .replace('.ts', '')
        .replace('.js', '')
        .replace(path.sep, ':');
    }
    return filepath;
  }

  private scope: string;

  constructor(
    winston: WinstonLogger,
    scope?: string
    ) {
    this.scope = Logger.parsePathToScope(scope ? scope : Logger.DEFAULT_SCOPE);
    this.winston = winston;
  }

  public debug(message: string, ...args: any[]): void {
    this.log('debug', message, args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(level: string, message: string, ...args: any[]): void {
    this.winston.log(level, `${this.formatScope()} ${message}`, args);
  }

  private formatScope(): string {
    return `[${this.scope}]`;
  }
}

export default Logger;
