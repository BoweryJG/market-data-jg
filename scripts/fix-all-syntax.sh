#!/bin/bash

# Fix all remaining syntax errors in the codebase

echo "Fixing remaining syntax errors..."

# Fix toLogData( pattern in logger calls
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(letting/letting/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(user/user/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(redirecting/redirecting/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(closing/closing/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(executing/executing/g'

# Fix broken useEffect calls
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/useEffect(())/useEffect()/g'

# Fix broken arrow functions in object literals
find src -name "*.tsx" -o -name "*.ts" | xargs perl -i -pe 's/action:\s*\(\)\s*=>\s*logger/action: () => logger/g'

# Fix broken object syntax in arrays
find src -name "*.tsx" -o -name "*.ts" | xargs perl -i -pe 's/\}\s*,\s*toLogData\(/}, /g'

# Fix double closing parentheses
find src -name "*.tsx" -o -name "*.ts" | xargs perl -i -pe 's/\)\);\s*$/);/g' 

# Fix broken logger.info calls with response vs result
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/toLogData(response)/toLogData(result)/g'

# Fix gsap.to calls
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/gsap\.to(\$1,/gsap.to(modalRef.current,/g'

# Fix "No newline at end of file" followed by component.displayName
find src -name "*.tsx" -o -name "*.ts" | xargs perl -i -pe 's/\n\nNo newline at end of file\n/\n/g'

echo "Syntax fixes complete!"