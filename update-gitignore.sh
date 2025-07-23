#!/bin/bash

# Update .gitignore to properly exclude all .env files

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Updating .gitignore for .env files ===${NC}"
echo ""

# Backup current .gitignore
if [ -f .gitignore ]; then
    cp .gitignore .gitignore.backup
    echo -e "${GREEN}✓ Backed up current .gitignore to .gitignore.backup${NC}"
fi

# Create comprehensive .env ignore patterns
cat > .gitignore.env-section << 'EOF'

# Environment variables - NEVER commit these!
.env
.env.*
!.env.example
!.env.template.example
*.env
env/
.envrc
.env.local
.env.production
.env.development
.env.test
.env.staging
.env.sphere1a
.env.template
.env.backup
.env.save

# Other sensitive files
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx
secrets/
credentials/
config/secrets/

# IDE and editor files that might contain secrets
.vscode/settings.json
.idea/
*.sublime-workspace

EOF

# Check if .gitignore exists
if [ -f .gitignore ]; then
    # Remove existing .env entries to avoid duplicates
    grep -v -E "^\.env" .gitignore > .gitignore.tmp || true
    mv .gitignore.tmp .gitignore
    
    # Append new .env section
    cat .gitignore.env-section >> .gitignore
else
    # Create new .gitignore with .env section
    cat .gitignore.env-section > .gitignore
fi

# Clean up
rm -f .gitignore.env-section

echo -e "${GREEN}✓ Updated .gitignore with comprehensive .env patterns${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the updated .gitignore file"
echo "2. Commit the changes: git add .gitignore && git commit -m 'Update .gitignore to exclude all .env files'"
echo "3. Run ./remove-env-from-history.sh to clean the Git history"