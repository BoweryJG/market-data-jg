#!/bin/bash

# Remove .env files from Git history
# This script uses BFG Repo-Cleaner to remove all .env files from Git history

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Git History Cleanup Script ===${NC}"
echo -e "${YELLOW}This script will remove all .env files from Git history${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Get repository name for backup
REPO_NAME=$(basename "$(pwd)")
BACKUP_NAME="${REPO_NAME}_backup_$(date +%Y%m%d_%H%M%S)"

echo -e "${GREEN}Step 1: Creating backup of repository...${NC}"
cd ..
cp -r "$REPO_NAME" "$BACKUP_NAME"
echo -e "${GREEN}✓ Backup created: ../$BACKUP_NAME${NC}"
cd "$REPO_NAME"

# Check if BFG is available
echo -e "${GREEN}Step 2: Checking for BFG Repo-Cleaner...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed. BFG requires Java to run.${NC}"
    echo "Please install Java first:"
    echo "  brew install openjdk"
    exit 1
fi

# Download BFG if not present
BFG_JAR="bfg-1.14.0.jar"
if [ ! -f "$BFG_JAR" ]; then
    echo -e "${YELLOW}Downloading BFG Repo-Cleaner...${NC}"
    curl -L -o "$BFG_JAR" "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar"
    echo -e "${GREEN}✓ BFG downloaded${NC}"
else
    echo -e "${GREEN}✓ BFG already present${NC}"
fi

# Create a file with all .env patterns to remove
echo -e "${GREEN}Step 3: Creating patterns file for BFG...${NC}"
cat > .env-patterns.txt << EOF
.env
.env.*
*.env
EOF
echo -e "${GREEN}✓ Patterns file created${NC}"

# Show what files will be removed
echo -e "${YELLOW}Files that will be removed from history:${NC}"
git log --all --full-history --name-only --format=format: | grep -E "^\.env" | sort | uniq | while read file; do
    echo "  - $file"
done
echo ""

# Stash any current changes
echo -e "${GREEN}Step 4: Stashing current changes...${NC}"
if git diff-index --quiet HEAD --; then
    echo "No changes to stash"
    STASHED=false
else
    git stash push -m "Temporary stash before BFG cleanup"
    STASHED=true
    echo -e "${GREEN}✓ Changes stashed${NC}"
fi

# Run BFG to remove .env files
echo -e "${GREEN}Step 5: Running BFG to remove .env files from history...${NC}"
echo -e "${YELLOW}This may take a while for large repositories...${NC}"

# Remove all .env files and their variations
java -jar "$BFG_JAR" --delete-files '{.env,.env.local,.env.production,.env.sphere1a,.env.template,.env.example,.env.local.example}' --no-blob-protection .

echo -e "${GREEN}✓ BFG cleanup completed${NC}"

# Clean up the repository
echo -e "${GREEN}Step 6: Cleaning up repository...${NC}"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo -e "${GREEN}✓ Repository cleaned${NC}"

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo -e "${GREEN}Step 7: Restoring stashed changes...${NC}"
    git stash pop
    echo -e "${GREEN}✓ Changes restored${NC}"
fi

# Clean up
rm -f .env-patterns.txt

echo ""
echo -e "${GREEN}=== Cleanup Complete ===${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo "1. Review the changes carefully"
echo "2. Check that your repository still works correctly"
echo "3. When ready, force push to remote:"
echo -e "${RED}   git push --force --all${NC}"
echo -e "${RED}   git push --force --tags${NC}"
echo ""
echo -e "${YELLOW}WARNING:${NC} Force pushing will rewrite history on the remote!"
echo "Make sure all team members are aware before proceeding."
echo ""
echo -e "${GREEN}Backup saved at: ../$BACKUP_NAME${NC}"
echo ""
echo "To verify no .env files remain in history, run:"
echo "  git log --all --full-history --name-only --format=format: | grep -E '^\.env' | sort | uniq"