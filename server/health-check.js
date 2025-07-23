const { createClient } = require('@supabase/supabase-js');

// Health check service
class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.registerDefaultChecks();
  }

  registerDefaultChecks() {
    // Database connectivity check
    this.register('database', async () => {
      try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          throw new Error('Database configuration missing');
        }

        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );

        // Simple query to test connection
        const { error } = await supabase
          .from('providers')
          .select('count')
          .limit(1);

        if (error) throw error;

        return {
          status: 'healthy',
          message: 'Database connection successful',
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${error.message}`,
          error: error.message,
        };
      }
    });

    // External API availability checks
    this.register('stripe', async () => {
      try {
        const response = await fetch('https://api.stripe.com/v1/health', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        });

        if (response.ok) {
          return {
            status: 'healthy',
            message: 'Stripe API is accessible',
          };
        } else {
          throw new Error(`Stripe API returned ${response.status}`);
        }
      } catch (error) {
        return {
          status: 'unhealthy',
          message: `Stripe API check failed: ${error.message}`,
          error: error.message,
        };
      }
    });

    // Memory usage check
    this.register('memory', async () => {
      const used = process.memoryUsage();
      const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
      const rssMB = Math.round(used.rss / 1024 / 1024);
      
      const heapPercentage = (used.heapUsed / used.heapTotal) * 100;
      
      if (heapPercentage > 90) {
        return {
          status: 'unhealthy',
          message: 'High memory usage detected',
          details: {
            heapUsed: `${heapUsedMB} MB`,
            heapTotal: `${heapTotalMB} MB`,
            rss: `${rssMB} MB`,
            percentage: `${heapPercentage.toFixed(2)}%`,
          },
        };
      }

      return {
        status: 'healthy',
        message: 'Memory usage is normal',
        details: {
          heapUsed: `${heapUsedMB} MB`,
          heapTotal: `${heapTotalMB} MB`,
          rss: `${rssMB} MB`,
          percentage: `${heapPercentage.toFixed(2)}%`,
        },
      };
    });

    // Disk space check (if applicable)
    this.register('disk', async () => {
      try {
        // This is a placeholder - actual implementation would depend on the OS
        // For now, we'll just return healthy
        return {
          status: 'healthy',
          message: 'Disk space check not implemented',
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: `Disk space check failed: ${error.message}`,
          error: error.message,
        };
      }
    });
  }

  register(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) {
      return {
        status: 'unknown',
        message: `Check '${name}' not found`,
      };
    }

    try {
      const startTime = Date.now();
      const result = await check();
      const duration = Date.now() - startTime;

      return {
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Check '${name}' threw an error`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runAllChecks() {
    const results = {};
    const promises = [];

    for (const [name, check] of this.checks) {
      promises.push(
        this.runCheck(name).then(result => {
          results[name] = result;
        })
      );
    }

    await Promise.all(promises);

    // Calculate overall status
    const statuses = Object.values(results).map(r => r.status);
    let overallStatus = 'healthy';
    
    if (statuses.includes('unhealthy') || statuses.includes('error')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('unknown')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: results,
    };
  }
}

// Express middleware
function createHealthCheckMiddleware(app) {
  const healthCheck = new HealthCheckService();

  // Basic health endpoint
  app.get('/health', async (req, res) => {
    try {
      const result = await healthCheck.runAllChecks();
      const statusCode = result.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
      });
    }
  });

  // Liveness probe (simple check that the server is running)
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness probe (check if the server is ready to accept traffic)
  app.get('/health/ready', async (req, res) => {
    try {
      // Check only critical services
      const dbResult = await healthCheck.runCheck('database');
      const isReady = dbResult.status === 'healthy';
      
      res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString(),
        database: dbResult.status,
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        error: error.message,
      });
    }
  });

  // Individual check endpoints
  app.get('/health/check/:name', async (req, res) => {
    try {
      const result = await healthCheck.runCheck(req.params.name);
      const statusCode = result.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Check failed',
        error: error.message,
      });
    }
  });

  return healthCheck;
}

module.exports = {
  HealthCheckService,
  createHealthCheckMiddleware,
};