import { logger } from '@/services/logging/logger';

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General API rate limiter
const generalLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests
  'Too many requests, please try again later.'
);

// Auth rate limiter (stricter)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

// AI/Search rate limiter
const aiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests
  'AI query limit exceeded, please try again later.'
);

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;

    Object.keys(schema).forEach(key => {
      const rule = schema[key];
      const value = data[key];

      // Check required fields
      if (rule.required && !value) {
        errors.push(`${key} is required`);
      }

      // Type validation
      if (value && rule.type && typeof value !== rule.type) {
        errors.push(`${key} must be of type ${rule.type}`);
      }

      // Pattern validation
      if (value && rule.pattern) {
        const regex = new RegExp(rule.pattern);
        if (!regex.test(value)) {
          errors.push(`${key} has invalid format`);
        }
      }

      // Length validation
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${key} exceeds maximum length of ${rule.maxLength}`);
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors.push(`${key} must be at least ${rule.minLength} characters`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://market-data-jg.netlify.app',
      'https://crm.repspheres.com',
      'https://canvas.repspheres.com',
      'https://repspheres.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    // Allow requests with no origin (e.g., mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // CSP header
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://*.supabase.co https://osbackend-zl1h.onrender.com https://api.stripe.com wss://*.supabase.co; " +
    "frame-src 'self' https://accounts.google.com https://checkout.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "block-all-mixed-content; " +
    "upgrade-insecure-requests"
  );

  // Other security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS header (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
  // Sanitize body, query, and params
  ['body', 'query', 'params'].forEach(key => {
    if (req[key]) {
      Object.keys(req[key]).forEach(field => {
        if (typeof req[key][field] === 'string') {
          // Remove script tags
          req[key][field] = req[key][field].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          // Remove event handlers
          req[key][field] = req[key][field].replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
          // Remove javascript: protocol
          req[key][field] = req[key][field].replace(/javascript:/gi, '');
        }
      });
    }
  });

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', err);

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    // Known error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid input data',
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong',
    });
  }

  // Development error response
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack,
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
  validateInput,
  corsOptions,
  securityHeaders,
  sanitizeRequest,
  errorHandler,
  helmet: helmet({
    contentSecurityPolicy: false, // We set our own CSP
    hsts: process.env.NODE_ENV === 'production',
  }),
  mongoSanitize: mongoSanitize(),
  xssFilter: (req, res, next) => {
    // Apply XSS filtering to request data
    ['body', 'query', 'params'].forEach(key => {
      if (req[key]) {
        Object.keys(req[key]).forEach(field => {
          if (typeof req[key][field] === 'string') {
            req[key][field] = xss(req[key][field]);
          }
        });
      }
    });
    next();
  },
  hpp: hpp(),
};