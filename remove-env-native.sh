#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}=== Native Git .env Removal Script ===${NC}"
echo -e "${YELLOW}This will remove all .env files from Git history using native Git commands${NC}"
echo ""

# Create backup first
BACKUP_DIR="../market-data-jg_backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${BLUE}Creating backup...${NC}"
cp -r . "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"

# List of .env patterns to remove
ENV_PATTERNS=(
    ".env"
    ".env.local"
    ".env.production" 
    ".env.sphere1a"
    ".env.template"
    ".env.example"
    ".env.local.example"
    "server/.env"
    "server/.env.example"
    "server/server/.env"
    "server/server/.env.example"
)

echo -e "${BLUE}Files that will be removed from history:${NC}"
for pattern in "${ENV_PATTERNS[@]}"; do
    echo "  - $pattern"
done

echo ""
echo -e "${YELLOW}WARNING: This will rewrite Git history and require force push!${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo -e "${BLUE}Stashing current changes...${NC}"
git stash push -m "Pre-cleanup stash"

echo -e "${BLUE}Removing .env files from Git history...${NC}"

# Use git filter-branch to remove files from history
for pattern in "${ENV_PATTERNS[@]}"; do
    echo -e "${YELLOW}Removing: $pattern${NC}"
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch '$pattern'" \
        --prune-empty --tag-name-filter cat -- --all
done

echo -e "${BLUE}Cleaning up Git references...${NC}"
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo -e "${BLUE}Removing current .env files from working directory...${NC}"
for pattern in "${ENV_PATTERNS[@]}"; do
    if [ -f "$pattern" ]; then
        rm -f "$pattern"
        echo "  - Removed: $pattern"
    fi
done

# Add patterns to .gitignore if not already there
echo -e "${BLUE}Updating .gitignore...${NC}"
cat >> .gitignore << 'EOF'

# Environment files (DO NOT COMMIT)
.env
.env.local
.env.production
.env.sphere1a
.env.template
server/.env
server/server/.env

EOF

git add .gitignore
git commit -m "Add .env files to .gitignore after history cleanup

🔒 Security: Remove all environment files from Git tracking
- Prevents future accidental commits of sensitive data
- Part of production security hardening

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

echo ""
echo -e "${GREEN}✓ .env files removed from Git history!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create .env.local from .env.example with your actual values"
echo "2. Force push to update remote repository:"
echo -e "   ${BLUE}git push --force-with-lease origin main${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: All team members will need to re-clone the repository${NC}"
echo -e "${RED}⚠️  after you force push, as Git history has been rewritten.${NC}"
echo ""
echo -e "${GREEN}Security remediation complete!${NC}"