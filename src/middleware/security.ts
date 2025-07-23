// Security middleware configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://osbackend-zl1h.onrender.com https://api.stripe.com wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Error message
}

export const rateLimitConfigs = {
  // General API rate limit
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests, please try again later.',
  },
  
  // Auth endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests, please try again later.',
  },
  
  // AI endpoints (most expensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'AI query limit exceeded, please try again later.',
  },
};

// Input validation rules
export const validationRules = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  // Remove any script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Escape HTML entities
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  sanitized = sanitized.replace(/[&<>"'\/]/g, (s) => entityMap[s]);
  
  // Remove any event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized.trim();
}

// Validate request payload
export function validatePayload(payload: any, schema: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  Object.keys(schema).forEach(key => {
    const rule = schema[key];
    
    if (rule.required && !payload[key]) {
      errors.push(`${key} is required`);
    }
    
    if (payload[key] && rule.type) {
      const actualType = typeof payload[key];
      if (actualType !== rule.type) {
        errors.push(`${key} must be of type ${rule.type}`);
      }
    }
    
    if (payload[key] && rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(payload[key])) {
        errors.push(`${key} has invalid format`);
      }
    }
    
    if (payload[key] && rule.maxLength && payload[key].length > rule.maxLength) {
      errors.push(`${key} exceeds maximum length of ${rule.maxLength}`);
    }
    
    if (payload[key] && rule.minLength && payload[key].length < rule.minLength) {
      errors.push(`${key} must be at least ${rule.minLength} characters`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check if origin is allowed
export function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'https://market-data-jg.netlify.app',
    'https://crm.repspheres.com',
    'https://canvas.repspheres.com',
    'https://repspheres.com',
    'http://localhost:5173', // Development
  ];
  
  return allowedOrigins.includes(origin);
}

// Security middleware for API routes
export function applySecurityMiddleware(request: Request): Headers {
  const headers = new Headers();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // CORS handling
  const origin = request.headers.get('origin');
  if (origin && isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  }
  
  return headers;
}