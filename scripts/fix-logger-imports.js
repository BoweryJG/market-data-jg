#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Calculate the correct relative path from a file to src/services/logging/logger
function getCorrectLoggerPath(filePath) {
  const fileDir = path.dirname(filePath);
  const targetPath = 'src/services/logging/logger';
  const relativePath = path.relative(fileDir, targetPath);
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

// Fix logger imports in a file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find logger import statements
  const loggerImportRegex = /from\s+['"]([^'"]*logging\/logger)['"]/g;
  
  content = content.replace(loggerImportRegex, (match, importPath) => {
    const correctPath = getCorrectLoggerPath(filePath);
    if (importPath !== correctPath) {
      modified = true;
      return `from '${correctPath}'`;
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

console.log('Fixing logger import paths...\n');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/unified-auth/**']
});

let fixedCount = 0;
files.forEach(file => {
  try {
    const before = fs.readFileSync(file, 'utf8');
    fixFile(file);
    const after = fs.readFileSync(file, 'utf8');
    if (before !== after) fixedCount++;
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files`);