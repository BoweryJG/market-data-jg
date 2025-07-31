import { logger } from '@/services/logging/logger';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need import path fixes
const filesToFix = [
  'src/utils/authDebug.ts',
  'src/components/Auth/SignupModal.tsx',
  'src/components/Dashboard/Dashboard.tsx',
  'src/pages/AuthCallback.tsx',
  'src/services/categoryHierarchyService.ts',
  'src/services/providerDataService.ts',
  'src/services/newsService.ts',
  'src/services/apiClient.ts',
  'src/services/comprehensiveDataService.ts',
  'src/services/marketIntelligenceService.ts',
  'src/services/braveSearchService.ts'
];

function getCorrectImportPath(filePath) {
  const dir = path.dirname(filePath);
  const relativePath = path.relative(dir, 'src/utils/errorUtils').replace(/\\/g, '/');
  return `import { getErrorMessage } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
}

function fixImportPath(filePath) {
  logger.info(`Fixing import path in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and replace the incorrect import
  const incorrectPatterns = [
    /import { getErrorMessage } from '\.\/utils\/errorUtils';/g,
    /import { getErrorMessage } from '\.\.\/utils\/errorUtils';/g,
    /import { getErrorMessage } from '\.\.\/\.\.\/utils\/errorUtils';/g
  ];
  
  const correctImport = getCorrectImportPath(filePath);
  
  incorrectPatterns.forEach(pattern => {
    content = content.replace(pattern, correctImport);
  });
  
  fs.writeFileSync(filePath, content);
  logger.info(`Fixed ${filePath}`);
}

// Run fixes
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fixImportPath(fullPath);
  } else {
    logger.warn(`File not found: ${fullPath}`);
  }
});

logger.info('Import path fixes complete!');