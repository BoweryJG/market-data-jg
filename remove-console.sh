#!/bin/bash

# Remove console statements from all files
echo "Removing console statements from all files..."

# Find all .ts, .tsx, .js, .jsx files and remove console statements
find /Users/jasonsmacbookpro2022/market-data-jg -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec sed -i '' 's/console\.log(/\/\/ console.log(/g' {} \; \
  -exec sed -i '' 's/console\.error(/\/\/ console.error(/g' {} \; \
  -exec sed -i '' 's/console\.warn(/\/\/ console.warn(/g' {} \; \
  -exec sed -i '' 's/console\.info(/\/\/ console.info(/g' {} \; \
  -exec sed -i '' 's/console\.debug(/\/\/ console.debug(/g' {} \;

echo "Console statements have been commented out!"