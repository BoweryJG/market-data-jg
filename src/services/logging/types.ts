export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    [key: string]: any;
  };
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

export interface LogFilter {
  shouldLog(entry: LogEntry): boolean;
}