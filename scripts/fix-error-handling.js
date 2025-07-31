import { logger } from '@/services/logging/logger';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files that need error handling fixes based on the TypeScript errors
const filesToFix = [
  'src/components/Auth/SignupModal.tsx',
  'src/components/Dashboard/Dashboard.tsx',
  'src/pages/AuthCallback.tsx',
  'src/services/apiClient.ts',
  'src/services/braveSearchService.ts',
  'src/services/categoryHierarchyService.ts',
  'src/services/comprehensiveDataService.ts',
  'src/services/marketIntelligenceService.ts',
  'src/services/newsService.ts',
  'src/services/providerDataService.ts',
  'src/utils/authDebug.ts'
];

const importStatement = "import { getErrorMessage } from '../utils/errorUtils';";
const importStatementAlt = "import { getErrorMessage } from '../../utils/errorUtils';";
const importStatementAlt2 = "import { getErrorMessage } from './utils/errorUtils';";

function getCorrectImportPath(filePath) {
  const depth = filePath.split('/').length - 2; // -2 for 'src' and filename
  if (depth === 1) return importStatement;
  if (depth === 2) return importStatementAlt;
  return importStatementAlt2;
}

function fixErrorHandling(filePath) {
  logger.info(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not already present
  if (!content.includes('getErrorMessage')) {
    const importToAdd = getCorrectImportPath(filePath);
    // Find the last import statement
    const lastImportMatch = content.match(/import[\s\S]*?from\s+['"][^'"]+['"];/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) + '\n' + importToAdd + content.slice(lastImportIndex + lastImport.length);
    }
  }
  
  // Replace error.message patterns
  content = content.replace(/(\s+)error\.message/g, '$1getErrorMessage(error)');
  content = content.replace(/(\s+)err\.message/g, '$1getErrorMessage(err)');
  content = content.replace(/(\s+)e\.message/g, '$1getErrorMessage(e)');
  
  // Replace patterns like { error: error.message }
  content = content.replace(/\{\s*error:\s*error\.message\s*\}/g, '{ error: getErrorMessage(error) }');
  content = content.replace(/\{\s*error:\s*err\.message\s*\}/g, '{ error: getErrorMessage(err) }');
  content = content.replace(/\{\s*error:\s*e\.message\s*\}/g, '{ error: getErrorMessage(e) }');
  
  fs.writeFileSync(filePath, content);
  logger.info(`Fixed ${filePath}`);
}

// Run fixes
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fixErrorHandling(fullPath);
  } else {
    logger.warn(`File not found: ${fullPath}`);
  }
});

logger.info('Error handling fixes complete!');