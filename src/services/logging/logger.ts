import { LogLevel, LogEntry, LogTransport } from './types';
import { ConsoleTransport } from './transports';

class Logger {
  private static instance: Logger;
  private transports: LogTransport[] = [];
  private minLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {
    // Only use console transport in development
    if (this.isDevelopment) {
      this.addTransport(new ConsoleTransport());
    }
    
    // In production, logs are completely silent unless explicitly configured
    if (import.meta.env.PROD) {
      this.minLevel = LogLevel.ERROR; // Only log errors in production
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(transport: LogTransport): void {
    this.transports = this.transports.filter(t => t !== transport);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    // Store in local logs for monitoring
    this.storeLocalLog(entry);

    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (error) {
        // Silently fail to avoid infinite loops
      }
    });
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, data);
  }

  // Local log storage for development/monitoring
  private localLogs: LogEntry[] = [];
  private maxLocalLogs = 1000;

  getLocalLogs(): LogEntry[] {
    return [...this.localLogs];
  }

  clearLocalLogs(): void {
    this.localLogs = [];
  }

  private storeLocalLog(entry: LogEntry): void {
    this.localLogs.push(entry);
    if (this.localLogs.length > this.maxLocalLogs) {
      this.localLogs.shift();
    }
  }

  // API logging methods
  logRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, { method, url, data });
  }

  logResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} - ${status}`, { method, url, status, data });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export types for external use
export type { LogLevel, LogEntry } from './types';