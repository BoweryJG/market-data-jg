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
  
  // Fix the pattern: errorToLogData({ error: getErrorMessage(error)) })
  content = content.replace(
    /errorToLogData\(\{\s*error:\s*getErrorMessage\(error\)\s*\}\)/g,
    'errorToLogData(error)'
  );
  
  // Fix the pattern: toLogData({ someVar: someVar })
  content = content.replace(
    /toLogData\(\{\s*(\w+):\s*\1\s*\}\)/g,
    'toLogData($1)'
  );
  
  // Fix any remaining double closing parentheses in logger calls
  content = content.replace(
    /(logger\.(error|warn|info|debug|fatal)\([^;]+)\)\s*\);/g,
    '$1);'
  );
  
  if (content !== fs.readFileSync(file, 'utf8')) {
    modified = true;
    totalFixed++;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);