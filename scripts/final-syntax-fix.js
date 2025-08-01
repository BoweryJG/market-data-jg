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
  const originalContent = content;
  
  // Fix missing closing parentheses in logger calls
  content = content.replace(/logger\.(error|warn|info|debug|fatal)\([^;]+\);/g, (match) => {
    // Count parentheses
    let openCount = 0;
    let closeCount = 0;
    for (let char of match) {
      if (char === '(') openCount++;
      if (char === ')') closeCount++;
    }
    
    if (openCount > closeCount) {
      // Add missing closing parentheses
      const missing = openCount - closeCount;
      const fixedMatch = match.slice(0, -1) + ')'.repeat(missing) + ';';
      return fixedMatch;
    }
    return match;
  });
  
  // Fix broken toLogData calls
  content = content.replace(/toLogData\(([^)]+);/g, 'toLogData($1));');
  
  // Fix broken errorToLogData calls
  content = content.replace(/errorToLogData\(([^)]+);/g, 'errorToLogData($1));');
  
  // Fix useEffect with empty parentheses
  content = content.replace(/useEffect\(\(\)/g, 'useEffect(()');
  
  // Fix arrow functions with broken syntax
  content = content.replace(/=>\s*\)\s*=>/g, '=> ');
  
  // Fix broken gsap.to calls
  content = content.replace(/gsap\.to\([^,]+,\s*toLogData\(/g, 'gsap.to($1, ');
  
  // Fix broken onComplete callbacks
  content = content.replace(/onComplete:\s*\)\s*=>/g, 'onComplete: () =>');
  
  // Fix specific LogoutModal issues
  if (file.includes('LogoutModal')) {
    content = content.replace(/logger\.info\('No user session found, toLogData\(closing modal'/g, 
      "logger.info('No user session found, closing modal'");
    content = content.replace(/logger\.debug\('Animation completed, toLogData\(executing callbacks'/g,
      "logger.debug('Animation completed, executing callbacks'");
  }
  
  // Fix specific SalesWorkspace issues
  if (file.includes('SalesWorkspace')) {
    content = content.replace(/logger\.info\('Selected:', toLogData\(response\);/g,
      "logger.info('Selected:', toLogData(result));");
  }
  
  // Fix specific QuickActionsBar issues
  if (file.includes('QuickActionsBar')) {
    content = content.replace(/logger\.info\('Searching for:', toLogData\(searchQuery\);/g,
      "logger.info('Searching for:', toLogData(searchQuery));");
  }
  
  // Fix displayName exports that might be on same line
  content = content.replace(/displayName = '[^']+';export/g, (match) => {
    return match.replace(';export', ';\n\nexport');
  });
  
  if (content !== originalContent) {
    modified = true;
    totalFixed++;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);