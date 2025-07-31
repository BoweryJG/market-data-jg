export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: any;
  context?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

export interface LogFilter {
  shouldLog(entry: LogEntry): boolean;
}