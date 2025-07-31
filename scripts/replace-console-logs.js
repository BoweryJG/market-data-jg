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
let totalFiles = 0;
let totalReplacements = 0;
const fileReplacements = {};

// Console patterns to replace
const consolePatterns = [
  /console\s*\.\s*log\s*\(/g,
  /console\s*\.\s*error\s*\(/g,
  /console\s*\.\s*warn\s*\(/g,
  /console\s*\.\s*debug\s*\(/g,
  /console\s*\.\s*info\s*\(/g
];

// Map console methods to logger methods
const methodMap = {
  'log': 'info',
  'error': 'error',
  'warn': 'warn',
  'debug': 'debug',
  'info': 'info'
};

// Create logger import statement
const loggerImport = "import { logger } from '@/services/logging/logger';\n";

// Function to check if logger import already exists
function hasLoggerImport(content) {
  return content.includes("from '@/services/logging/logger'") ||
         content.includes('from "@/services/logging/logger"') ||
         content.includes("from '../services/logging/logger'") ||
         content.includes("from './services/logging/logger'");
}

// Function to add logger import
function addLoggerImport(content, filePath) {
  if (hasLoggerImport(content)) return content;
  
  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertPosition) + '\n' + loggerImport + content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning
    return loggerImport + '\n' + content;
  }
}

// Function to replace console statements
function replaceConsoleStatements(content, filePath) {
  let modifiedContent = content;
  let replacementCount = 0;
  
  // Replace each console pattern
  consolePatterns.forEach((pattern) => {
    modifiedContent = modifiedContent.replace(pattern, (match) => {
      const method = match.match(/console\s*\.\s*(\w+)\s*\(/)[1];
      const loggerMethod = methodMap[method] || 'info';
      replacementCount++;
      return `logger.${loggerMethod}(`;
    });
  });
  
  // If replacements were made, add logger import
  if (replacementCount > 0) {
    modifiedContent = addLoggerImport(modifiedContent, filePath);
  }
  
  return { modifiedContent, replacementCount };
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modifiedContent, replacementCount } = replaceConsoleStatements(content, filePath);
    
    if (replacementCount > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      fileReplacements[filePath] = replacementCount;
      totalReplacements += replacementCount;
      logger.info(`${colors.green}✓${colors.reset} ${filePath} - ${replacementCount} replacements`);
    }
  } catch (error) {
    logger.error(`${colors.red}✗${colors.reset} Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  logger.info(`${colors.blue}Starting console.log replacement...${colors.reset}\n`);
  
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
  logger.info(`Found ${totalFiles} files to process\n`);
  
  // Process each file
  files.forEach(processFile);
  
  // Print summary
  logger.info(`\n${colors.blue}Summary:${colors.reset}`);
  logger.info(`Total files processed: ${totalFiles}`);
  logger.info(`Total replacements: ${totalReplacements}`);
  logger.info(`Files modified: ${Object.keys(fileReplacements).length}`);
  
  if (Object.keys(fileReplacements).length > 0) {
    logger.info(`\n${colors.yellow}Modified files:${colors.reset}`);
    Object.entries(fileReplacements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([file, count]) => {
        logger.info(`  ${count} replacements in ${file}`);
      });
    
    if (Object.keys(fileReplacements).length > 10) {
      logger.info(`  ... and ${Object.keys(fileReplacements).length - 10} more files`);
    }
  }
  
  logger.info(`\n${colors.green}✓ Console.log replacement completed!${colors.reset}`);
  logger.info(`\n${colors.yellow}Note:${colors.reset} Make sure to:`);
  logger.info('1. Review the changes with git diff');
  logger.info('2. Test the application to ensure logging works correctly');
  logger.info('3. Commit the changes');
}

// Run the script
if (require.main === module) {
  main();
}