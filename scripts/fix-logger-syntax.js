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
  
  // Fix the specific pattern where errorToLogData is called with an object
  // logger.error('message', errorToLogData({ error: something) });
  content = content.replace(
    /logger\.(error|warn|info|debug|fatal)\s*\(\s*(['"][^'"]+['"]),\s*errorToLogData\(\s*\{\s*error:\s*([^}]+)\}\s*\)\s*\)\s*\)/g,
    (match, method, message, errorExpression) => {
      modified = true;
      totalFixed++;
      // Just pass the error expression directly to errorToLogData
      return `logger.${method}(${message}, errorToLogData(${errorExpression}))`;
    }
  );
  
  // Fix the pattern where toLogData is called with an object literal
  // This might have been incorrectly wrapped
  content = content.replace(
    /toLogData\(\s*\{\s*(\w+):\s*([^}]+)\}\s*\)/g,
    (match, key, value) => {
      // If the value is a simple variable that matches the key, just use toLogData on the value
      if (key === value.trim()) {
        modified = true;
        totalFixed++;
        return `toLogData(${value})`;
      }
      return match;
    }
  );
  
  // Fix double closing parentheses
  content = content.replace(/\)\s*\)\s*\);/g, '));');
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed logger syntax in: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal logger syntax fixes: ${totalFixed}`);