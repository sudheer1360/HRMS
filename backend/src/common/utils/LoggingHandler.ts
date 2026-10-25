/**
 * LoggingHandler — Structured logging wrapper around HRMS's pino logger.
 *
 * Mirrors the Backend Structure's LoggingHandler interface:
 *   logging.info(module, message, data?)
 *   logging.error(module, message, error?)
 *   logging.warn(module, message, data?)
 *   logging.debug(module, message, data?)
 *
 * The `module` param (analogous to filePath in the backend structure)
 * is added to every log entry as { module } so log aggregators can
 * filter by feature area (e.g. 'attendance.service', 'payroll.controller').
 *
 * Usage in a controller / service that extends BaseController / BaseService:
 *   this.logging.info('employee.service', 'Fetching employee', { id });
 *   this.logging.error('auth.controller', 'Login failed', err);
 */
import { logger as pinoLogger } from '../../config/logger.js';

type LogData = Record<string, unknown>;

export class LoggingHandler {
  private readonly logger = pinoLogger;

  info(module: string, message: string, data?: LogData): void {
    this.logger.info({ module, ...data }, message);
  }

  warn(module: string, message: string, data?: LogData): void {
    this.logger.warn({ module, ...data }, message);
  }

  error(module: string, message: string, error?: unknown, data?: LogData): void {
    const errorData: LogData = {};

    if (error instanceof Error) {
      errorData.errorMessage = error.message;
      errorData.errorName = error.name;
      if (process.env.NODE_ENV === 'development') {
        errorData.stack = error.stack;
      }
    } else if (error !== undefined) {
      errorData.error = String(error);
    }

    this.logger.error({ module, ...errorData, ...data }, message);
  }

  debug(module: string, message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug({ module, ...data }, message);
    }
  }

  /**
   * Log request performance metrics.
   * Called by beforeRequest middleware at response end.
   */
  performance(
    module: string,
    method: string,
    path: string,
    statusCode: number,
    durationMs: number
  ): void {
    this.logger.info(
      { module, method, path, statusCode, durationMs },
      `${method} ${path} → ${statusCode} (${durationMs}ms)`
    );
  }
}

// Singleton — controllers and services share one instance
export const loggingHandler = new LoggingHandler();
