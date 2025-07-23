#!/bin/bash

# Master script to remove all .env files from Git history
# This coordinates the entire cleanup process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}     Git History .env File Removal Tool${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""
echo -e "${YELLOW}This tool will help you remove all .env files from your Git history${NC}"
echo -e "${YELLOW}to prevent sensitive information from being exposed.${NC}"
echo ""

# Function to pause and wait for user
pause() {
    echo ""
    read -p "Press Enter to continue..."
    echo ""
}

# Step 1: Pre-flight check
echo -e "${BLUE}Step 1: Pre-flight Check${NC}"
echo "Running initial checks..."
./check-env-in-history.sh
pause

# Step 2: Update .gitignore
echo -e "${BLUE}Step 2: Update .gitignore${NC}"
echo "Do you want to update .gitignore to properly exclude .env files?"
read -p "Update .gitignore? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./update-gitignore.sh
    echo ""
    echo -e "${GREEN}✓ .gitignore updated${NC}"
    echo "You should commit this change before proceeding with history cleanup."
    read -p "Commit .gitignore changes now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .gitignore
        git commit -m "Update .gitignore to exclude all .env files"
        echo -e "${GREEN}✓ .gitignore changes committed${NC}"
    fi
fi
pause

# Step 3: Final warning
echo -e "${RED}================================================${NC}"
echo -e "${RED}                   WARNING${NC}"
echo -e "${RED}================================================${NC}"
echo ""
echo "This process will:"
echo "1. Create a backup of your repository"
echo "2. Download BFG Repo-Cleaner (if needed)"
echo "3. Remove ALL .env files from Git history"
echo "4. Rewrite your Git history"
echo ""
echo -e "${YELLOW}After completion, you will need to:${NC}"
echo -e "${RED}• Force push to all remote repositories${NC}"
echo -e "${RED}• Notify all team members to re-clone the repository${NC}"
echo ""
read -p "Do you understand and want to proceed? (yes/no): " -r
if [[ ! $REPLY == "yes" ]]; then
    echo "Aborting cleanup process."
    exit 0
fi
echo ""

# Step 4: Run the cleanup
echo -e "${BLUE}Step 4: Running History Cleanup${NC}"
./remove-env-from-history.sh
pause

# Step 5: Verify cleanup
echo -e "${BLUE}Step 5: Verifying Cleanup${NC}"
./verify-cleanup.sh
pause

# Step 6: Final instructions
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}           Cleanup Process Complete${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""
echo -e "${GREEN}✓ Local repository has been cleaned${NC}"
echo ""
echo -e "${YELLOW}CRITICAL NEXT STEPS:${NC}"
echo ""
echo "1. ${YELLOW}Review your repository${NC} to ensure everything works correctly"
echo ""
echo "2. ${YELLOW}Force push to remote${NC} (this will rewrite history!):"
echo -e "   ${RED}git push --force --all${NC}"
echo -e "   ${RED}git push --force --tags${NC}"
echo ""
echo "3. ${YELLOW}Notify all team members${NC} that they need to:"
echo "   • Delete their local copies"
echo "   • Re-clone the repository"
echo "   • Or run: git fetch --all && git reset --hard origin/main"
echo ""
echo "4. ${YELLOW}Update any CI/CD systems${NC} that might have cached the old history"
echo ""
echo "5. ${YELLOW}Rotate any credentials${NC} that were in the .env files"
echo ""
echo -e "${GREEN}Remember: Never commit .env files with real credentials!${NC}"
echo ""

# Create a summary file
cat > CLEANUP_SUMMARY.txt << EOF
Git History Cleanup Summary
Generated: $(date)

Repository: $(basename "$(pwd)")
Backup location: ../$(basename "$(pwd)")_backup_*

Next steps completed:
[ ] Verified repository works correctly
[ ] Force pushed to all remotes
[ ] Notified all team members
[ ] Updated CI/CD systems
[ ] Rotated exposed credentials

Commands to force push:
  git push --force --all
  git push --force --tags

For team members to update their local copies:
  git fetch --all
  git reset --hard origin/main
EOF

echo -e "${GREEN}Summary saved to: CLEANUP_SUMMARY.txt${NC}"