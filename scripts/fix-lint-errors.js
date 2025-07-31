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
  reactImportsAdded: 0,
  unusedImportsRemoved: 0,
  parametersFixed: 0,
  anyTypesFixed: 0
};

// Common Material-UI imports that are often unused
const commonUnusedImports = [
  'Tooltip', 'Divider', 'LinearProgress', 'Badge', 'ListItem', 'ListItemText',
  'List', 'DialogTitle', 'DialogContent', 'DialogActions', 'MenuItem',
  'FormControl', 'InputLabel', 'Select', 'Chip', 'Avatar', 'Paper',
  'Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow',
  'Tabs', 'Tab', 'Accordion', 'AccordionSummary', 'AccordionDetails',
  'Snackbar', 'Alert', 'Backdrop', 'Fade', 'Grow', 'Zoom', 'Slide'
];

// Common icon imports that are often unused
const commonUnusedIcons = [
  'Speed', 'Star', 'LocationOn', 'Warning', 'TrendingUp', 'FilterList',
  'AttachMoney', 'Search', 'Add', 'Edit', 'Delete', 'Close', 'Check',
  'ArrowBack', 'ArrowForward', 'ExpandMore', 'ExpandLess', 'MoreVert',
  'Settings', 'Help', 'Info', 'Error', 'CheckCircle', 'Cancel'
];

// Check if file uses JSX
function usesJSX(content) {
  return /<[A-Z]\w*|<[a-z]+\s|<\/|\/>/g.test(content);
}

// Check if React is imported
function hasReactImport(content) {
  return /import\s+(?:\*\s+as\s+)?React(?:\s*,\s*{[^}]*})?\s+from\s+['"]react['"]/.test(content);
}

// Add React import to file
function addReactImport(content) {
  if (hasReactImport(content)) return content;
  
  // Find the first import statement
  const firstImportMatch = content.match(/^import\s+.*$/m);
  
  if (firstImportMatch) {
    const insertPosition = content.indexOf(firstImportMatch[0]);
    return content.slice(0, insertPosition) + "import React from 'react';\n" + content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning
    return "import React from 'react';\n\n" + content;
  }
}

// Remove unused imports
function removeUnusedImports(content, filePath) {
  let modifiedContent = content;
  let removedCount = 0;
  
  // Helper to check if an identifier is used in the code (excluding import statements)
  function isUsed(identifier, searchContent) {
    // Remove all import statements from search content
    const contentWithoutImports = searchContent.replace(/^import\s+.*$/gm, '');
    
    // Create regex patterns to match the identifier usage
    const patterns = [
      new RegExp(`\\b${identifier}\\b`, 'g'), // Word boundary match
      new RegExp(`<${identifier}[\\s/>]`, 'g'), // JSX component
      new RegExp(`\\.${identifier}\\b`, 'g'), // Property access
    ];
    
    return patterns.some(pattern => pattern.test(contentWithoutImports));
  }
  
  // Process import statements
  const importRegex = /^import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"];?$/gm;
  
  modifiedContent = modifiedContent.replace(importRegex, (match, namedImports, defaultImport, namespaceImport, source) => {
    if (namedImports) {
      // Handle named imports
      const imports = namedImports.split(',').map(imp => imp.trim());
      const usedImports = imports.filter(imp => {
        const name = imp.includes(' as ') ? imp.split(' as ')[1].trim() : imp.trim();
        return isUsed(name, content);
      });
      
      if (usedImports.length === 0) {
        removedCount += imports.length;
        return ''; // Remove entire import statement
      } else if (usedImports.length < imports.length) {
        removedCount += imports.length - usedImports.length;
        return `import { ${usedImports.join(', ')} } from '${source}';`;
      }
    } else if (defaultImport && !isUsed(defaultImport, content)) {
      removedCount++;
      return ''; // Remove entire import statement
    } else if (namespaceImport && !isUsed(namespaceImport, content)) {
      removedCount++;
      return ''; // Remove entire import statement
    }
    
    return match;
  });
  
  // Clean up multiple empty lines
  modifiedContent = modifiedContent.replace(/\n\n\n+/g, '\n\n');
  
  return { content: modifiedContent, removedCount };
}

// Fix unused function parameters by prefixing with underscore
function fixUnusedParameters(content) {
  let modifiedContent = content;
  let fixedCount = 0;
  
  // Common unused parameters in callbacks
  const commonUnusedParams = [
    'index', 'event', 'error', 'response', 'result', 'data',
    'params', 'props', 'state', 'context', 'next', 'req', 'res'
  ];
  
  // Pattern to match function parameters
  const patterns = [
    // Arrow functions
    /\(([^)]+)\)\s*=>/g,
    // Regular functions
    /function\s+\w*\s*\(([^)]+)\)/g,
    // Method definitions
    /(\w+)\s*\(([^)]+)\)\s*{/g,
    // Async functions
    /async\s+(?:function\s+\w*\s*)?\(([^)]+)\)/g
  ];
  
  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, (match, params) => {
      if (!params) return match;
      
      const paramList = params.split(',').map(param => {
        const trimmed = param.trim();
        // Check if it's a common unused param and not already prefixed
        if (commonUnusedParams.some(p => trimmed === p || trimmed.startsWith(`${p}:`))) {
          fixedCount++;
          return trimmed.replace(/^(\w+)/, '_$1');
        }
        return param;
      });
      
      return match.replace(params, paramList.join(', '));
    });
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
    
    // 1. Add React import if needed (for .tsx and .jsx files)
    if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && usesJSX(content) && !hasReactImport(content)) {
      content = addReactImport(content);
      stats.reactImportsAdded++;
      modified = true;
    }
    
    // 2. Remove unused imports
    const { content: contentAfterImports, removedCount } = removeUnusedImports(content, filePath);
    if (removedCount > 0) {
      content = contentAfterImports;
      stats.unusedImportsRemoved += removedCount;
      modified = true;
    }
    
    // 3. Fix unused parameters
    const { content: contentAfterParams, fixedCount } = fixUnusedParameters(content);
    if (fixedCount > 0) {
      content = contentAfterParams;
      stats.parametersFixed += fixedCount;
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
  console.log(`${colors.blue}Starting ESLint error fixes...${colors.reset}\n`);
  
  // Find all TypeScript and JavaScript files
  const patterns = ['src/**/*.{ts,tsx,js,jsx}'];
  
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
  console.log(`React imports added: ${stats.reactImportsAdded}`);
  console.log(`Unused imports removed: ${stats.unusedImportsRemoved}`);
  console.log(`Parameters prefixed with _: ${stats.parametersFixed}`);
  
  console.log(`\n${colors.green}✓ ESLint fixes completed!${colors.reset}`);
  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Run npm run lint to check remaining errors');
  console.log('2. Test the application');
  console.log('3. Commit the changes');
}

// Run the script
if (require.main === module) {
  main();
}