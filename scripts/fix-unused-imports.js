#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Track statistics
let totalFiles = 0;
let totalUnusedImports = 0;
const fileChanges = {};

// Parse TypeScript/JSX file
function parseFile(code) {
  return parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'decorators-legacy'],
    errorRecovery: true
  });
}

// Check if an identifier is used in the AST
function isIdentifierUsed(ast, name, importPath) {
  let used = false;
  
  traverse(ast, {
    // Skip the import declaration itself
    ImportDeclaration(path) {
      path.skip();
    },
    
    // Check all identifier references
    Identifier(path) {
      if (path.node.name === name && !path.isBindingIdentifier()) {
        // Make sure this isn't part of the import statement
        let parent = path.parent;
        while (parent) {
          if (parent.type === 'ImportDeclaration') {
            return;
          }
          parent = parent.parent;
        }
        used = true;
      }
    },
    
    // Check JSX elements (for React components)
    JSXIdentifier(path) {
      if (path.node.name === name) {
        used = true;
      }
    }
  });
  
  return used;
}

// Process imports in a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ast = parseFile(content);
    
    const unusedImports = [];
    const importDeclarations = [];
    
    // Collect all imports
    traverse(ast, {
      ImportDeclaration(path) {
        importDeclarations.push(path);
      }
    });
    
    // Check each import
    importDeclarations.forEach(importPath => {
      const node = importPath.node;
      const source = node.source.value;
      
      // Check default imports
      if (node.specifiers.length > 0) {
        const specifiersToRemove = [];
        
        node.specifiers.forEach((spec, index) => {
          let name;
          
          if (spec.type === 'ImportDefaultSpecifier') {
            name = spec.local.name;
          } else if (spec.type === 'ImportSpecifier') {
            name = spec.local.name;
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            name = spec.local.name;
          }
          
          if (name && !isIdentifierUsed(ast, name, source)) {
            specifiersToRemove.push(index);
            unusedImports.push(`${name} from '${source}'`);
          }
        });
        
        // Remove unused specifiers
        if (specifiersToRemove.length > 0) {
          if (specifiersToRemove.length === node.specifiers.length) {
            // Remove entire import
            importPath.remove();
          } else {
            // Remove only unused specifiers
            for (let i = specifiersToRemove.length - 1; i >= 0; i--) {
              node.specifiers.splice(specifiersToRemove[i], 1);
            }
          }
        }
      }
    });
    
    if (unusedImports.length > 0) {
      // Generate new code
      const { code: newCode } = generate(ast, {
        retainLines: true,
        retainFunctionParens: true,
        compact: false
      });
      
      fs.writeFileSync(filePath, newCode, 'utf8');
      fileChanges[filePath] = unusedImports.length;
      totalUnusedImports += unusedImports.length;
      
      console.log(`${colors.green}✓${colors.reset} ${filePath} - Removed ${unusedImports.length} unused imports`);
      unusedImports.forEach(imp => {
        console.log(`  ${colors.yellow}-${colors.reset} ${imp}`);
      });
    }
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log(`${colors.blue}Starting unused import removal...${colors.reset}\n`);
  
  // Find all TypeScript and JavaScript files
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,js}',
    'server/**/*.js'
  ];
  
  const files = [];
  patterns.forEach(pattern => {
    const matchedFiles = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/unified-auth/**']
    });
    files.push(...matchedFiles);
  });
  
  totalFiles = files.length;
  console.log(`Found ${totalFiles} files to process\n`);
  
  // Process each file
  files.forEach(processFile);
  
  // Print summary
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Total unused imports removed: ${totalUnusedImports}`);
  console.log(`Files modified: ${Object.keys(fileChanges).length}`);
  
  if (Object.keys(fileChanges).length > 0) {
    console.log(`\n${colors.yellow}Top modified files:${colors.reset}`);
    Object.entries(fileChanges)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([file, count]) => {
        console.log(`  ${count} imports removed from ${file}`);
      });
  }
  
  console.log(`\n${colors.green}✓ Unused import removal completed!${colors.reset}`);
}

// Run the script
if (require.main === module) {
  main();
}