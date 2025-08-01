#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: path.resolve(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Pattern to match logger calls with non-object second parameter
  const loggerPattern = /logger\.(error|warn|info|debug|fatal)\s*\(\s*([^,]+),\s*([^)]+)\)/g;
  
  content = content.replace(loggerPattern, (match, method, message, data) => {
    // Skip if already using toLogData or errorToLogData
    if (data.includes('toLogData') || data.includes('errorToLogData')) {
      return match;
    }
    
    // Skip if it's already a proper object literal
    if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
      return match;
    }
    
    // Skip if no data parameter (undefined)
    if (data.trim() === 'undefined' || data.trim() === '') {
      return match;
    }
    
    modified = true;
    totalFixed++;
    
    // For error method, use errorToLogData
    if (method === 'error' && (data.includes('error') || data.includes('Error') || data.includes('err'))) {
      return `logger.${method}(${message}, errorToLogData(${data}))`;
    }
    
    // For other cases, use toLogData
    return `logger.${method}(${message}, toLogData(${data}))`;
  });
  
  // Add import for helper functions if logger is used and file was modified
  if (modified && content.includes('logger') && !content.includes('loggerHelpers')) {
    // Find the last import statement
    const importMatch = content.match(/^((?:import[^;]+;[\s]*)+)/m);
    if (importMatch) {
      const imports = importMatch[0];
      const restOfFile = content.substring(imports.length);
      
      // Add the new import
      const newImport = "import { toLogData, errorToLogData } from '../utils/loggerHelpers';\n";
      
      // Adjust the import path based on the file location
      const relativePath = path.relative(path.dirname(file), path.join(__dirname, '..', 'src', 'utils'));
      const adjustedImport = newImport.replace('../utils', relativePath + '/loggerHelpers').replace(/\\/g, '/');
      
      content = imports + adjustedImport + restOfFile;
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed logger calls in: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal logger calls fixed: ${totalFixed}`);
console.log('Now running TypeScript compiler to check for remaining errors...\n');