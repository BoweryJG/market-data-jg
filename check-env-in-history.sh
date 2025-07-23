#!/bin/bash

# Check for .env files in Git history
# This script helps identify all .env files that exist in the Git history

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Checking for .env files in Git history ===${NC}"
echo ""

# Check current .env files in working directory
echo -e "${BLUE}Current .env files in working directory:${NC}"
find . -name ".env*" -type f | grep -v node_modules | while read file; do
    echo "  - $file"
done
echo ""

# Check .env files in Git history
echo -e "${BLUE}.env files found in Git history:${NC}"
git log --all --full-history --name-only --format=format: | grep -E "^\.env" | sort | uniq | while read file; do
    echo "  - $file"
done
echo ""

# Check if any .env files are in the current index
echo -e "${BLUE}Checking if .env files are staged:${NC}"
git ls-files | grep -E "\.env" || echo "  No .env files in staging area"
echo ""

# Show commits that added .env files
echo -e "${BLUE}Commits that touched .env files:${NC}"
git log --all --full-history --oneline -- '.env*' | head -20
echo ""

# Count total commits with .env files
TOTAL_COMMITS=$(git log --all --full-history --oneline -- '.env*' | wc -l)
echo -e "${YELLOW}Total commits containing .env files: $TOTAL_COMMITS${NC}"
echo ""

# Check file sizes
echo -e "${BLUE}Checking sizes of .env files in history:${NC}"
git rev-list --all --objects | grep -E "\.env" | while read sha path; do
    size=$(git cat-file -s $sha 2>/dev/null || echo "0")
    if [ "$size" -gt 0 ]; then
        echo "  - $path: $(numfmt --to=iec-i --suffix=B $size)"
    fi
done | sort -u
echo ""

echo -e "${GREEN}Check complete!${NC}"
echo ""
echo -e "${YELLOW}To remove these files from history, run:${NC}"
echo "  ./remove-env-from-history.sh"