#!/bin/bash

# Verify that .env files have been removed from Git history

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Verifying .env file cleanup ===${NC}"
echo ""

# Check for .env files in history
echo -e "${BLUE}Checking Git history for .env files...${NC}"
ENV_IN_HISTORY=$(git log --all --full-history --name-only --format=format: | grep -E "^\.env" | sort | uniq | wc -l)

if [ "$ENV_IN_HISTORY" -eq 0 ]; then
    echo -e "${GREEN}✓ SUCCESS: No .env files found in Git history!${NC}"
else
    echo -e "${RED}✗ WARNING: Found $ENV_IN_HISTORY .env file references in history${NC}"
    echo -e "${RED}Files found:${NC}"
    git log --all --full-history --name-only --format=format: | grep -E "^\.env" | sort | uniq | while read file; do
        echo "  - $file"
    done
fi
echo ""

# Check current working directory
echo -e "${BLUE}Checking working directory for .env files...${NC}"
CURRENT_ENV_FILES=$(find . -name ".env*" -type f | grep -v node_modules | wc -l)
if [ "$CURRENT_ENV_FILES" -gt 0 ]; then
    echo -e "${YELLOW}Found $CURRENT_ENV_FILES .env files in working directory:${NC}"
    find . -name ".env*" -type f | grep -v node_modules | while read file; do
        echo "  - $file"
    done
    echo -e "${YELLOW}Make sure these are listed in .gitignore!${NC}"
else
    echo -e "${GREEN}✓ No .env files in working directory${NC}"
fi
echo ""

# Check .gitignore
echo -e "${BLUE}Checking .gitignore for .env patterns...${NC}"
if [ -f .gitignore ]; then
    if grep -q "^\.env" .gitignore; then
        echo -e "${GREEN}✓ .gitignore contains .env patterns${NC}"
        echo "Patterns found:"
        grep -E "^\.env|^\*\.env" .gitignore | head -10 | while read pattern; do
            echo "  - $pattern"
        done
    else
        echo -e "${RED}✗ WARNING: .gitignore does not contain .env patterns!${NC}"
        echo "Run ./update-gitignore.sh to fix this"
    fi
else
    echo -e "${RED}✗ WARNING: No .gitignore file found!${NC}"
fi
echo ""

# Check repository size
echo -e "${BLUE}Repository statistics:${NC}"
REPO_SIZE=$(du -sh .git | cut -f1)
echo "Git repository size: $REPO_SIZE"
echo ""

# Final summary
echo -e "${YELLOW}=== Summary ===${NC}"
if [ "$ENV_IN_HISTORY" -eq 0 ]; then
    echo -e "${GREEN}✓ Git history is clean of .env files${NC}"
    echo ""
    echo -e "${YELLOW}Safe to push to remote:${NC}"
    echo "  git push --force --all"
    echo "  git push --force --tags"
else
    echo -e "${RED}✗ .env files still exist in history${NC}"
    echo "Run ./remove-env-from-history.sh to clean them"
fi
echo ""
echo -e "${YELLOW}Remember:${NC}"
echo "- Always use .env.example or .env.template for sample configurations"
echo "- Never commit actual .env files with real credentials"
echo "- Use environment variables in your deployment platform instead"