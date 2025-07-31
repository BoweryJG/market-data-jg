#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

// Track changes
let filesFixed = 0;

// Fix files with underscore parameter issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix: _error parameter but using error in body
  content = content.replace(/function\s+(\w+)\s*\((_error\b[^)]*)\)([^{]*{[^}]*)\berror\b/g, (match, funcName, params, body) => {
    modified = true;
    return match.replace(/\berror\b/g, '_error');
  });
  
  // Fix: _event parameter but using event in body
  content = content.replace(/\((_event\b[^)]*)\)\s*=>\s*{([^}]*)\bevent\b/g, (match, params, body) => {
    modified = true;
    return match.replace(/\bevent\b/g, '_event');
  });
  
  // Fix: _result parameter but using result in body
  content = content.replace(/function\s+(\w+)\s*\(([^)]*_result[^)]*)\)([^{]*{[^}]*)\bresult\b/g, (match, funcName, params, body) => {
    modified = true;
    return match.replace(/\bresult\b/g, '_result');
  });
  
  // Fix: _index parameter but using index in body
  content = content.replace(/\.map\s*\(\s*\([^,]+,\s*_index\s*\)\s*=>\s*([^)]+)\bindex\b/g, (match, body) => {
    modified = true;
    return match.replace(/\bindex\b/g, '_index');
  });
  
  // Fix missing logger import path
  if (content.includes("from '@/services/logging/logger'")) {
    content = content.replace(/@\/services\/logging\/logger/g, '../services/logging/logger');
    modified = true;
  }
  
  // Fix props reference in TabPanel
  if (filePath.includes('TabPanel.tsx')) {
    content = content.replace(/value={props/, 'value={value');
    modified = true;
  }
  
  // Fix specific error patterns
  if (content.includes('Cannot find name \'error\'')) {
    // This means we have _error as param but still using error
    content = content.replace(/\(_error:/g, '(error:');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`Fixed: ${filePath}`);
  }
}

// Main
console.log('Fixing TypeScript errors...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/unified-auth/**']
});

files.forEach(fixFile);

console.log(`\nFixed ${filesFixed} files`);
console.log('\nNow run: npm run build');