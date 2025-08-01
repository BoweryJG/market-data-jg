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

// Fix common TypeScript errors
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix 'index' not found errors - these are likely from map functions
  content = content.replace(/key=\{index\}/g, (match) => {
    modified = true;
    totalFixed++;
    return 'key={_index}';
  });
  
  // Fix standalone 'index' references
  content = content.replace(/\b(?<!_)index(?!\.|\w)/g, (match, offset) => {
    // Check if it's in a map/forEach context
    const before = content.substring(Math.max(0, offset - 100), offset);
    if (before.includes('.map(') || before.includes('.forEach(')) {
      modified = true;
      totalFixed++;
      return '_index';
    }
    return match;
  });
  
  // Fix FilterAlt to FilterList
  if (content.includes('FilterAlt')) {
    content = content.replace(/FilterAlt/g, 'FilterList');
    modified = true;
    totalFixed++;
  }
  
  // Fix undefined 'result' variable
  if (content.includes('result') && !content.includes('const result') && !content.includes('let result')) {
    content = content.replace(/\bresult\b/g, (match, offset) => {
      // Check context
      const lineStart = content.lastIndexOf('\n', offset);
      const lineEnd = content.indexOf('\n', offset);
      const line = content.substring(lineStart, lineEnd);
      
      if (line.includes('=') && !line.includes('result =')) {
        return match;
      }
      
      modified = true;
      totalFixed++;
      return 'response';
    });
  }
  
  // Fix test mocks
  if (file.includes('test/mocks/supabase.ts')) {
    content = content.replace(/return Promise.resolve\({ data, error }\);/, 'return Promise.resolve({ data: null, error: null });');
    modified = true;
  }
  
  // Fix crossDomainAuth event type issues
  if (file.includes('crossDomainAuth.ts')) {
    // Fix event type in postMessage listener
    content = content.replace(/\(event\)/g, '(event: MessageEvent)');
    
    // Fix optional event checks
    content = content.replace(/if \(event\?\.origin/g, 'if (event.origin');
    content = content.replace(/if \(event\?\.data/g, 'if (event.data');
    content = content.replace(/event\?\.source/g, 'event.source');
    
    modified = true;
  }
  
  // Fix marketData not defined
  if (file.includes('marketPulseService.ts')) {
    content = content.replace(/\bmarketData\b/g, (match, offset) => {
      const before = content.substring(Math.max(0, offset - 50), offset);
      if (!before.includes('const marketData') && !before.includes('let marketData')) {
        modified = true;
        totalFixed++;
        return 'data';
      }
      return match;
    });
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed errors in: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);
console.log('Now checking remaining TypeScript errors...\n');