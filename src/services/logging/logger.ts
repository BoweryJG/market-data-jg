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

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (error) {
        // Silently fail to avoid infinite loops
      }
    });
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, data?: any): void {
    this.log(LogLevel.FATAL, message, data);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();