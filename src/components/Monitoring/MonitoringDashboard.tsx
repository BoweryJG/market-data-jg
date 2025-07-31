import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle,
  Warning,
  Speed,
  Memory,
  Storage,
  Refresh,
  Download,
  Clear,
} from '@mui/icons-material';
import { logger, LogLevel, LogEntry } from '../../services/logging/logger';
import { apiInterceptor, RequestMetrics } from '../../services/api/interceptor';
import { logger } from '../../services/logging/logger';


interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: string;
      message: string;
      duration?: string;
      details?: any;
    };
  };
}

export const MonitoringDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [apiMetrics, setApiMetrics] = useState<RequestMetrics[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();
    loadHealthStatus();
    loadApiMetrics();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs();
        loadHealthStatus();
        loadApiMetrics();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = () => {
    const localLogs = logger.getLocalLogs();
    setLogs(localLogs.sort((a,  b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      logger.error('Failed to load health status:', error);
    }
  };

  const loadApiMetrics = () => {
    const metrics = apiInterceptor.getMetrics();
    setApiMetrics(metrics.sort((a,  b) => b.startTime - a.startTime));
  };

  const clearLogs = () => {
    logger.clearLocalLogs();
    loadLogs();
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return '#888';
      case LogLevel.INFO: return '#2196F3';
      case LogLevel.WARN: return '#FF9800';
      case LogLevel.ERROR: return '#F44336';
      case LogLevel.FATAL: return '#D32F2F';
      default: return '#000';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle color="success" />;
      case 'unhealthy':
        return <ErrorIcon color="error" />;
      case 'degraded':
        return <Warning color="warning" />;
      default:
        return <Warning color="disabled" />;
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getErrorCount = () => logs.filter(log => log.level >= LogLevel.ERROR).length;
  const getWarningCount = () => logs.filter(log => log.level === LogLevel.WARN).length;
  const getAverageResponseTime = () => apiInterceptor.getAverageResponseTime(/./);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex',  justifyContent: 'space-between',  alignItems: 'center',  mb: 3 }}>
        <Typography variant="h4">System Monitoring</Typography>
        <Box>
          <Button
            startIcon={<Download />}
            onClick={exportLogs}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Export Logs
          </Button>
          <Button
            startIcon={<Clear />}
            onClick={clearLogs}
            variant="outlined"
            color="error"
            sx={{ mr: 1 }}
          >
            Clear Logs
          </Button>
          <IconButton
            onClick={() => setAutoRefresh(!autoRefresh)}
            color={autoRefresh ? 'primary' : 'default'}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Health Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getStatusIcon(healthStatus?.status || 'unknown')}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  System Health
                </Typography>
              </Box>
              <Typography variant="h4" color={
                healthStatus?.status === 'healthy' ? 'success.main' : 
                healthStatus?.status === 'unhealthy' ? 'error.main' : 'warning.main'
              }>
                {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </Typography>
              {healthStatus?.uptime && (
                <Typography variant="caption" color="text.secondary">
                  Uptime: {formatDuration(healthStatus.uptime * 1000)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Errors
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {getErrorCount()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Warnings
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {getWarningCount()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Avg Response
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {formatDuration(getAverageResponseTime())}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                API Performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Health Checks Detail */}
      {healthStatus?.checks && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Health Checks
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(healthStatus.checks).map(([name,  check]) => (
              <Grid item xs={12} sm={6} md={3} key={name}>
                <Alert
                  severity={
                    check.status === 'healthy' ? 'success' :
                    check.status === 'unhealthy' ? 'error' : 'warning'
                  }
                  icon={
                    name === 'database' ? <Storage /> :
                    name === 'memory' ? <Memory /> :
                    getStatusIcon(check.status)
                  }
                >
                  <Typography variant="subtitle2">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2">
                    {check.message}
                  </Typography>
                  {check.duration && (
                    <Typography variant="caption" display="block">
                      Duration: {check.duration}
                    </Typography>
                  )}
                  {check.details && (
                    <Typography variant="caption" display="block">
                      {JSON.stringify(check.details)}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Recent API Calls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent API Calls
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Method</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiMetrics.slice(0, 10).map((metric, _index) => (
                <TableRow key={_index}>
                  <TableCell>
                    <Chip
                      label={metric.method}
                      size="small"
                      color={metric.method === 'GET' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {metric.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {metric.status && (
                      <Chip
                        label={metric.status}
                        size="small"
                        color={
                          metric.status >= 200 && metric.status < 300 ? 'success' :
                          metric.status >= 400 ? 'error' : 'warning'
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {metric.duration && formatDuration(metric.duration)}
                  </TableCell>
                  <TableCell>
                    {new Date(metric.startTime).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Logs */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Logs
        </Typography>
        <List>
          {logs.slice(0, 20).map((log) => (
            <ListItem
              key={log.id}
              button
              onClick={() => setSelectedLog(log)}
              sx={{
                borderLeft: `4px solid ${getLogLevelColor(log.level)}`,
                mb: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={LogLevel[log.level]}
                      size="small"
                      sx={{
                        backgroundColor: getLogLevelColor(log.level),
                        color: 'white',
                      }}
                    />
                    <Typography variant="body2">
                      {log.message}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Log Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Log Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Level: {LogLevel[selectedLog.level]}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Time: {new Date(selectedLog.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Message: {selectedLog.message}
              </Typography>
              {selectedLog.context && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Context:
                  </Typography>
                  <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: 8,
                    borderRadius: 4,
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </>
              )}
              {selectedLog.error && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Error:
                  </Typography>
                  <pre style={{
                    backgroundColor: '#ffebee',
                    padding: 8,
                    borderRadius: 4,
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(selectedLog.error, null, 2)}
                  </pre>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

MonitoringDashboard.displayName = 'MonitoringDashboard';