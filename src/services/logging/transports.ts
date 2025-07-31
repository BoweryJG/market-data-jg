import { LogLevel, LogEntry, LogTransport } from './types';


export class ConsoleTransport implements LogTransport {
  private colors = {
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m', // Magenta
  };

  private levelNames = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.FATAL]: 'FATAL',
  };

  log(entry: LogEntry): void {
    // Only log in development
    if (import.meta.env.PROD) return;

    const color = this.colors[entry.level];
    const reset = '\x1b[0m';
    const levelName = this.levelNames[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    const prefix = `${color}[${levelName}]${reset} ${timestamp}`;
    
    // Use appropriate console method based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        if (entry.data) {
          console.info(prefix, entry.message, entry.data);
        } else {
          console.info(prefix, entry.message);
        }
        break;
      case LogLevel.WARN:
        if (entry.data) {
          console.warn(prefix, entry.message, entry.data);
        } else {
          console.warn(prefix, entry.message);
        }
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        if (entry.data) {
          console.error(prefix, entry.message, entry.data);
        } else {
          console.error(prefix, entry.message);
        }
        break;
    }
  }
}