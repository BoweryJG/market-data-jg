import { logger } from '@/services/logging/logger';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Required environment variables
const requiredEnvVars = {
  // Frontend variables (VITE_ prefix)
  frontend: [
    {
      name: 'VITE_SUPABASE_URL',
      description: 'Supabase project URL',
      pattern: /^https:\/\/[a-zA-Z0-9]+\.supabase\.co$/,
      example: 'https://YOUR_PROJECT.supabase.co'
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key',
      pattern: /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
      example: 'eyJhbGc....'
    },
    {
      name: 'VITE_API_URL',
      description: 'Backend API URL',
      pattern: /^https?:\/\/.+$/,
      example: 'https://osbackend-zl1h.onrender.com'
    },
    {
      name: 'VITE_GOOGLE_CLIENT_ID',
      description: 'Google OAuth Client ID',
      pattern: /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/,
      example: '123456789-abcdefg.apps.googleusercontent.com'
    }
  ],
  
  // Backend variables
  backend: [
    {
      name: 'STRIPE_SECRET_KEY',
      description: 'Stripe secret key',
      pattern: /^sk_(test|live)_[a-zA-Z0-9]+$/,
      example: 'sk_test_...'
    },
    {
      name: 'BRAVE_API_KEY',
      description: 'Brave Search API key',
      pattern: /^[a-zA-Z0-9\-]+$/,
      example: 'BSA...'
    }
  ],
  
  // Optional variables
  optional: [
    {
      name: 'VITE_SENTRY_DSN',
      description: 'Sentry DSN for error tracking',
      pattern: /^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.]+\/[0-9]+$/,
      example: 'https://abc123@sentry.io/123456'
    }
  ]
};

// Check if environment variable is set and valid
function checkEnvVar(envVar, value) {
  if (!value) {
    return { valid: false, error: 'Not set' };
  }
  
  if (envVar.pattern && !envVar.pattern.test(value)) {
    return { valid: false, error: 'Invalid format' };
  }
  
  // Check for placeholder values
  if (value.includes('your_') || value.includes('YOUR_')) {
    return { valid: false, error: 'Contains placeholder value' };
  }
  
  return { valid: true };
}

// Load environment variables
function loadEnvFile(filename) {
  const envPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

// Main validation function
function validateEnvironment() {
  logger.info(`${colors.blue}Environment Configuration Validator${colors.reset}\n`);
  
  // Check which environment files exist
  const envFiles = ['.env', '.env.local', '.env.production'];
  let foundEnvFile = false;
  let envVars = {};
  
  for (const file of envFiles) {
    const vars = loadEnvFile(file);
    if (vars) {
      logger.info(`${colors.green}✓${colors.reset} Found ${file}`);
      envVars = { ...envVars, ...vars };
      foundEnvFile = true;
    }
  }
  
  if (!foundEnvFile) {
    logger.info(`${colors.red}✗ No environment files found!${colors.reset}`);
    logger.info(`\nPlease create a .env.local file based on .env.example`);
    process.exit(1);
  }
  
  logger.info('\n' + '='.repeat(50) + '\n');
  
  // Validate frontend variables
  logger.info(`${colors.blue}Frontend Environment Variables:${colors.reset}`);
  let hasErrors = false;
  
  requiredEnvVars.frontend.forEach(envVar => {
    const value = envVars[envVar.name];
    const result = checkEnvVar(envVar, value);
    
    if (result.valid) {
      logger.info(`${colors.green}✓${colors.reset} ${envVar.name}`);
    } else {
      logger.info(`${colors.red}✗${colors.reset} ${envVar.name}: ${result.error}`);
      logger.info(`  ${colors.yellow}Description:${colors.reset} ${envVar.description}`);
      logger.info(`  ${colors.yellow}Example:${colors.reset} ${envVar.example}`);
      hasErrors = true;
    }
  });
  
  // Validate backend variables (if running on backend)
  if (process.env.NODE_ENV === 'production' || process.argv.includes('--backend')) {
    logger.info(`\n${colors.blue}Backend Environment Variables:${colors.reset}`);
    
    requiredEnvVars.backend.forEach(envVar => {
      const value = envVars[envVar.name];
      const result = checkEnvVar(envVar, value);
      
      if (result.valid) {
        logger.info(`${colors.green}✓${colors.reset} ${envVar.name}`);
      } else {
        logger.info(`${colors.red}✗${colors.reset} ${envVar.name}: ${result.error}`);
        logger.info(`  ${colors.yellow}Description:${colors.reset} ${envVar.description}`);
        logger.info(`  ${colors.yellow}Example:${colors.reset} ${envVar.example}`);
        hasErrors = true;
      }
    });
  }
  
  // Check optional variables
  logger.info(`\n${colors.blue}Optional Environment Variables:${colors.reset}`);
  
  requiredEnvVars.optional.forEach(envVar => {
    const value = envVars[envVar.name];
    if (value) {
      const result = checkEnvVar(envVar, value);
      if (result.valid) {
        logger.info(`${colors.green}✓${colors.reset} ${envVar.name} (configured)`);
      } else {
        logger.info(`${colors.yellow}⚠${colors.reset} ${envVar.name}: ${result.error}`);
      }
    } else {
      logger.info(`${colors.yellow}-${colors.reset} ${envVar.name} (not configured)`);
    }
  });
  
  // Summary
  logger.info('\n' + '='.repeat(50) + '\n');
  
  if (hasErrors) {
    logger.info(`${colors.red}✗ Environment validation failed!${colors.reset}`);
    logger.info('\nPlease fix the errors above before proceeding.');
    process.exit(1);
  } else {
    logger.info(`${colors.green}✓ Environment validation passed!${colors.reset}`);
    logger.info('\nYour environment is properly configured.');
  }
}

// Run validation
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };