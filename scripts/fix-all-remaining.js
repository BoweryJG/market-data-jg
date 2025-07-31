#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

let filesFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix logger import paths
  if (content.includes("from '../services/logging/logger'")) {
    const depth = (filePath.match(/\//g) || []).length - 2; // src/ is 2 levels
    const prefix = '../'.repeat(depth - 1);
    content = content.replace(/from '\.\.\/services\/logging\/logger'/g, `from '${prefix}services/logging/logger'`);
    modified = true;
  }
  
  // Fix props references
  if (content.includes('Cannot find name \'props\'') || content.includes('{props')) {
    content = content.replace(/value={props/g, 'value={value');
    content = content.replace(/\.\.\.(props as any)/g, '...props');
    modified = true;
  }
  
  // Fix index references
  content = content.replace(/\bindex\b(?!\s*:)/g, (match, offset) => {
    const before = content.substring(Math.max(0, offset - 50), offset);
    if (before.includes('_index') || before.includes('.map')) {
      return '_index';
    }
    return match;
  });
  
  // Fix error parameter in specific files
  if (filePath.includes('backendClient.ts')) {
    content = content.replace(/\(_error\)/g, '(error)');
    modified = true;
  }
  
  // Fix crossDomainAuth event typing
  if (filePath.includes('crossDomainAuth.ts')) {
    content = content.replace(/\(_event:/g, '(event:');
    content = content.replace(/_event\./g, 'event.');
    content = content.replace(/_event as MessageEvent/g, 'event as MessageEvent');
    modified = true;
  }
  
  // Fix types/errors.ts
  if (filePath.includes('types/errors.ts')) {
    content = content.replace(/\berror\b/g, '_error');
    content = content.replace(/function handleError\(_error:/g, 'function handleError(error:');
    content = content.replace(/function logError\(_error:/g, 'function logError(error:');
    content = content.replace(/function captureError\(_error:/g, 'function captureError(error:');
    content = content.replace(/function reportError\(_error:/g, 'function reportError(error:');
    content = content.replace(/function formatError\(_error:/g, 'function formatError(error:');
    modified = true;
  }
  
  // Fix test mocks
  if (filePath.includes('test/mocks/supabase.ts')) {
    content = content.replace(/{ data, error }/g, '{ data: null, error: null }');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`Fixed: ${filePath}`);
  }
}

console.log('Fixing all remaining TypeScript errors...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/unified-auth/**']
});

files.forEach(fixFile);

// Also fix services at root
glob.sync('services/**/*.{ts,tsx}').forEach(fixFile);

console.log(`\nFixed ${filesFixed} files`);