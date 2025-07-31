#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Track statistics
const stats = {
  totalFiles: 0,
  filesModified: 0,
  parameterReferencesFixed: 0,
  missingReactImports: 0,
  tsNocheckRemoved: 0,
  unusedVariablesFixed: 0
};

// Fix parameter references that were prefixed with underscore
function fixParameterReferences(content) {
  let modifiedContent = content;
  let fixedCount = 0;
  
  // Common patterns where we prefixed parameters but still use them
  const patterns = [
    // Fix _error references
    { pattern: /function\s+\w+\s*\(_error\b[^)]*\)[^{]*{([^}]*)error\./g, replacement: '_error.' },
    { pattern: /\(_error\b[^)]*\)\s*=>[^{]*{([^}]*)error\./g, replacement: '_error.' },
    { pattern: /\(_error\b[^)]*\)\s*=>[^{]*error\./g, replacement: '_error.' },
    
    // Fix _result references  
    { pattern: /function\s+\w+\s*\(_result\b[^)]*\)[^{]*{([^}]*)result\./g, replacement: '_result.' },
    { pattern: /\(_result\b[^)]*\)\s*=>[^{]*{([^}]*)result\./g, replacement: '_result.' },
    
    // Fix other common prefixed parameters
    { pattern: /\b_(\w+)\b([^)]*\))[^{]*{[^}]*\b\1\b/g, replacement: '_$1' }
  ];
  
  // Apply fixes
  patterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        fixedCount++;
        return match.replace(/\berror\./g, replacement)
                   .replace(/\bresult\./g, replacement);
      });
    }
  });
  
  // More specific fixes
  modifiedContent = modifiedContent.replace(/export function (\w+)\((_\w+)[^)]*\)[^{]*{([^}]*)}/g, (match, funcName, param, body) => {
    const paramName = param.substring(1); // Remove underscore
    if (body.includes(paramName + '.') || body.includes(paramName + '[') || body.includes(paramName + '(')) {
      fixedCount++;
      return match.replace(new RegExp('\\b' + paramName + '\\b', 'g'), param);
    }
    return match;
  });
  
  return { content: modifiedContent, fixedCount };
}

// Add React import for files with JSX but no React import
function addMissingReactImports(content, filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
    return { content, added: false };
  }
  
  // Check if file has JSX
  const hasJSX = /<[A-Z]\w*|<[a-z]+\s|<\//.test(content);
  if (!hasJSX) {
    return { content, added: false };
  }
  
  // Check if React is already imported
  const hasReactImport = /import\s+(?:\*\s+as\s+)?React\b/.test(content);
  if (hasReactImport) {
    return { content, added: false };
  }
  
  // Add React import at the top
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find where to insert (after other imports)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i + 1;
    } else if (insertIndex > 0) {
      break;
    }
  }
  
  lines.splice(insertIndex, 0, "import React from 'react';");
  return { content: lines.join('\n'), added: true };
}

// Remove @ts-nocheck comments
function removeTsNocheck(content) {
  if (content.includes('// @ts-nocheck')) {
    return { 
      content: content.replace(/\/\/\s*@ts-nocheck\s*\n?/g, ''), 
      removed: true 
    };
  }
  return { content, removed: false };
}

// Fix common unused variables
function fixUnusedVariables(content) {
  let modifiedContent = content;
  let fixedCount = 0;
  
  // Remove unused imports that are commonly left over
  const unusedImportPatterns = [
    /import\s*{\s*SearchResult\s*}\s*from\s*['"][^'"]+['"];?\n?/g,
    /import\s*{\s*CacheEntry\s*}\s*from\s*['"][^'"]+['"];?\n?/g,
    /,\s*SearchResult\s*(?=[,}])/g,
    /,\s*CacheEntry\s*(?=[,}])/g,
  ];
  
  unusedImportPatterns.forEach(pattern => {
    if (pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(pattern, '');
      fixedCount++;
    }
  });
  
  // Fix variables that are assigned but never used
  const assignedButUnused = [
    'floridaData', 'populationGrowth', 'retireePercentage', 'avgSpendIncrease', 'NEWS_PROXY_URL'
  ];
  
  assignedButUnused.forEach(varName => {
    const pattern = new RegExp(`const\\s+${varName}\\s*=\\s*[^;]+;\\s*\\n?`, 'g');
    if (pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(pattern, '');
      fixedCount++;
    }
  });
  
  return { content: modifiedContent, fixedCount };
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip unified-auth files
    if (filePath.includes('unified-auth')) return;
    
    // 1. Fix parameter references
    const { content: content1, fixedCount: paramFixed } = fixParameterReferences(content);
    if (paramFixed > 0) {
      content = content1;
      stats.parameterReferencesFixed += paramFixed;
      modified = true;
    }
    
    // 2. Add missing React imports
    const { content: content2, added } = addMissingReactImports(content, filePath);
    if (added) {
      content = content2;
      stats.missingReactImports++;
      modified = true;
    }
    
    // 3. Remove @ts-nocheck
    const { content: content3, removed } = removeTsNocheck(content);
    if (removed) {
      content = content3;
      stats.tsNocheckRemoved++;
      modified = true;
    }
    
    // 4. Fix unused variables
    const { content: content4, fixedCount: varFixed } = fixUnusedVariables(content);
    if (varFixed > 0) {
      content = content4;
      stats.unusedVariablesFixed += varFixed;
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`${colors.green}✓${colors.reset} ${filePath}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log(`${colors.blue}Starting final ESLint fixes...${colors.reset}\n`);
  
  // Find all TypeScript and JavaScript files
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'services/**/*.{ts,tsx,js,jsx}'
  ];
  
  const files = [];
  patterns.forEach(pattern => {
    const matchedFiles = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/unified-auth/**']
    });
    files.push(...matchedFiles);
  });
  
  stats.totalFiles = files.length;
  console.log(`Found ${stats.totalFiles} files to process\n`);
  
  // Process each file
  files.forEach(processFile);
  
  // Print summary
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`Total files processed: ${stats.totalFiles}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Parameter references fixed: ${stats.parameterReferencesFixed}`);
  console.log(`React imports added: ${stats.missingReactImports}`);
  console.log(`@ts-nocheck removed: ${stats.tsNocheckRemoved}`);
  console.log(`Unused variables fixed: ${stats.unusedVariablesFixed}`);
  
  console.log(`\n${colors.green}✓ Final ESLint fixes completed!${colors.reset}`);
}

// Run the script
if (require.main === module) {
  main();
}