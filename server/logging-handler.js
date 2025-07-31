import { logger } from '@/services/logging/logger';

const fs = require('fs').promises;
const path = require('path');

class LoggingHandler {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.initializeLogDirectory();
  }

  async initializeLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create log directory:', error);
    }
  }

  getLogFileName(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `app-${year}-${month}-${day}.log`;
  }

  async writeLog(logEntry) {
    try {
      const fileName = this.getLogFileName();
      const filePath = path.join(this.logDir, fileName);
      
      // Format log entry
      const formattedEntry = JSON.stringify({
        ...logEntry,
        serverTimestamp: new Date().toISOString(),
      }) + '\n';

      // Append to file
      await fs.appendFile(filePath, formattedEntry);
    } catch (error) {
      logger.error('Failed to write log:', error);
    }
  }

  async writeBatch(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return;

    try {
      const fileName = this.getLogFileName();
      const filePath = path.join(this.logDir, fileName);
      
      // Format all log entries
      const formattedEntries = logs
        .map(log => JSON.stringify({
          ...log,
          serverTimestamp: new Date().toISOString(),
        }))
        .join('\n') + '\n';

      // Append to file
      await fs.appendFile(filePath, formattedEntries);
    } catch (error) {
      logger.error('Failed to write batch logs:', error);
    }
  }

  async getRecentLogs(hours = 24, filters = {}) {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files.filter(f => f.startsWith('app-') && f.endsWith('.log'));
      
      // Sort files by date (newest first)
      logFiles.sort().reverse();

      const logs = [];
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const log = JSON.parse(line);
            const logTime = new Date(log.timestamp || log.serverTimestamp).getTime();
            
            if (logTime < cutoffTime) continue;

            // Apply filters
            if (filters.level && log.level < filters.level) continue;
            if (filters.userId && log.context?.userId !== filters.userId) continue;
            if (filters.search && !JSON.stringify(log).toLowerCase().includes(filters.search.toLowerCase())) continue;

            logs.push(log);
          } catch (e) {
            // Skip invalid log entries
          }
        }
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.serverTimestamp).getTime();
        const timeB = new Date(b.timestamp || b.serverTimestamp).getTime();
        return timeB - timeA;
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get recent logs:', error);
      return [];
    }
  }

  async getLogStats(hours = 24) {
    const logs = await this.getRecentLogs(hours);
    
    const stats = {
      total: logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0,
      },
      byHour: {},
      topErrors: [],
      uniqueUsers: new Set(),
    };

    const errorCounts = new Map();

    for (const log of logs) {
      // Count by level
      const levelName = ['debug', 'info', 'warn', 'error', 'fatal'][log.level] || 'unknown';
      stats.byLevel[levelName]++;

      // Count by hour
      const hour = new Date(log.timestamp || log.serverTimestamp).getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;

      // Track unique users
      if (log.context?.userId) {
        stats.uniqueUsers.add(log.context.userId);
      }

      // Count errors
      if (log.level >= 3 && log.message) {
        const count = errorCounts.get(log.message) || 0;
        errorCounts.set(log.message, count + 1);
      }
    }

    // Get top errors
    stats.topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    stats.uniqueUsers = stats.uniqueUsers.size;

    return stats;
  }

  createMiddleware() {
    return (req, res, next) => {
      // Log endpoint
      if (req.path === '/api/logs' && req.method === 'POST') {
        const { logs } = req.body;
        
        if (!logs || !Array.isArray(logs)) {
          return res.status(400).json({ error: 'Invalid log data' });
        }

        this.writeBatch(logs);
        
        return res.status(200).json({ 
          success: true, 
          received: logs.length 
        });
      }

      // Get logs endpoint
      if (req.path === '/api/logs' && req.method === 'GET') {
        const { hours = 24, level, userId, search } = req.query;
        
        this.getRecentLogs(parseInt(hours), {
          level: level ? parseInt(level) : undefined,
          userId,
          search,
        }).then(logs => {
          res.json({ logs });
        }).catch(error => {
          res.status(500).json({ error: 'Failed to retrieve logs' });
        });
        
        return;
      }

      // Get log stats endpoint
      if (req.path === '/api/logs/stats' && req.method === 'GET') {
        const { hours = 24 } = req.query;
        
        this.getLogStats(parseInt(hours)).then(stats => {
          res.json({ stats });
        }).catch(error => {
          res.status(500).json({ error: 'Failed to get log stats' });
        });
        
        return;
      }

      next();
    };
  }

  // Cleanup old logs
  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files.filter(f => f.startsWith('app-') && f.endsWith('.log'));
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const file of logFiles) {
        // Extract date from filename
        const match = file.match(/app-(\d{4})-(\d{2})-(\d{2})\.log/);
        if (match) {
          const fileDate = new Date(match[1], match[2] - 1, match[3]);
          
          if (fileDate < cutoffDate) {
            const filePath = path.join(this.logDir, file);
            await fs.unlink(filePath);
            logger.info(`Deleted old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old logs:', error);
    }
  }
}

module.exports = LoggingHandler;