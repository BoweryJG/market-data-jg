import { logger } from '@/services/logging/logger';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File to fix
const filePath = path.join(__dirname, '../services/api-client.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace patterns
const replacements = [
  // Generic type parameters
  { from: /<T = any>/g, to: '<T = unknown>' },
  
  // Function parameters
  { from: /data\?: any,/g, to: 'data?: unknown,' },
  { from: /data\?: any\)/g, to: 'data?: unknown)' },
  
  // Catch blocks - using axios error type
  { from: /catch \(error: any\)/g, to: 'catch (error: unknown)' },
  
  // Error handling
  { from: /error\.message/g, to: '(error as Error).message' },
  { from: /error\.response/g, to: '(axios.isAxiosError(error) ? error.response : undefined)' },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Add axios import for error checking if not present
if (!content.includes('axios.isAxiosError') && content.includes('(axios.isAxiosError(error)')) {
  // Already has axios imported, just need to use the error type check
  const axiosImportMatch = content.match(/import axios.* from 'axios';/);
  if (axiosImportMatch) {
    content = content.replace(
      axiosImportMatch[0],
      axiosImportMatch[0].replace('axios', 'axios, { isAxiosError }').replace(', { isAxiosError }, { isAxiosError }', ', { isAxiosError }')
    );
  }
}

// Fix the axios import to include isAxiosError
content = content.replace(
  "import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';",
  "import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios';"
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

logger.info('✅ Fixed all "any" types in api-client.ts');
logger.info('📝 Changes made:');
logger.info('  - Replaced "any" with "unknown" in generic type parameters');
logger.info('  - Updated error handling to use proper type checking');
logger.info('  - Added axios error type checking');
logger.info('\nPlease review the changes and ensure TypeScript compilation passes.');