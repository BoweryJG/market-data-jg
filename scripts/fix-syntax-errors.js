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

// Fix import path issues
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix double slash in import paths (common after automated fixes)
  content = content.replace(/from ['"]([^'"]+)\/\/([^'"]+)['"]/g, (match, before, after) => {
    modified = true;
    totalFixed++;
    return `from '${before}/${after}'`;
  });
  
  // Fix import paths that end with /loggerHelpers/loggerHelpers
  content = content.replace(/\/loggerHelpers\/loggerHelpers/g, '/loggerHelpers');
  
  // Fix broken logger calls that might have syntax errors
  // Match patterns like: logger.error('message', errorToLogData(error)));
  content = content.replace(/logger\.(error|warn|info|debug|fatal)\s*\([^)]+\)\)\);/g, (match) => {
    const fixedMatch = match.replace(/\)\);$/, ');');
    if (fixedMatch !== match) {
      modified = true;
      totalFixed++;
    }
    return fixedMatch;
  });
  
  // Fix double parentheses in logger calls
  content = content.replace(/logger\.(error|warn|info|debug|fatal)\s*\(([^,]+),\s*(toLogData|errorToLogData)\(([^)]+)\)\)\)/g, 
    (match, method, message, helper, data) => {
      modified = true;
      totalFixed++;
      return `logger.${method}(${message}, ${helper}(${data}))`;
    }
  );
  
  // Fix displayName assignments that might be broken
  content = content.replace(/;export default/g, ';\nexport default');
  content = content.replace(/displayName = '[^']+';export/g, (match) => {
    modified = true;
    return match.replace(';export', ';\nexport');
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed syntax in: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal syntax fixes applied: ${totalFixed}`);