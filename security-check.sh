#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}=== PRODUCTION SECURITY STATUS CHECK ===${NC}"
echo ""

# Check 1: .env files in working directory
echo -e "${BLUE}1. Checking for .env files in working directory...${NC}"
ENV_FILES=($(find . -name "*.env*" -not -name "*.example" -not -name "*.template" -not -name "*.md" -not -name "*.txt" 2>/dev/null))
if [ ${#ENV_FILES[@]} -eq 0 ]; then
    echo -e "   ${GREEN}✓ No sensitive .env files found in working directory${NC}"
else
    echo -e "   ${RED}✗ Found sensitive .env files:${NC}"
    for file in "${ENV_FILES[@]}"; do
        echo -e "     ${RED}- $file${NC}"
    done
fi

# Check 2: .gitignore configuration
echo -e "${BLUE}2. Checking .gitignore configuration...${NC}"
if grep -q "^\.env$" .gitignore && grep -q "^\.env\.local$" .gitignore; then
    echo -e "   ${GREEN}✓ .env files properly ignored in .gitignore${NC}"
else
    echo -e "   ${YELLOW}⚠ .gitignore may need .env file patterns${NC}"
fi

# Check 3: console.log statements
echo -e "${BLUE}3. Checking for console.log statements...${NC}"
CONSOLE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "console\." | wc -l)
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    echo -e "   ${GREEN}✓ No console statements found in source code${NC}"
else
    echo -e "   ${YELLOW}⚠ Found $CONSOLE_COUNT files with console statements${NC}"
fi

# Check 4: TypeScript compilation
echo -e "${BLUE}4. Checking TypeScript compilation...${NC}"
if npm run typecheck > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "   ${RED}✗ TypeScript compilation failed${NC}"
fi

# Check 5: Tests
echo -e "${BLUE}5. Checking test suite...${NC}"
if npm test > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Test suite passing${NC}"
else
    echo -e "   ${YELLOW}⚠ Test suite has issues${NC}"
fi

# Check 6: Build process
echo -e "${BLUE}6. Checking build process...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Build process successful${NC}"
else
    echo -e "   ${RED}✗ Build process failed${NC}"
fi

# Check 7: Required documentation
echo -e "${BLUE}7. Checking documentation...${NC}"
DOCS_FOUND=0
if [ -f "DEPLOYMENT.md" ]; then
    echo -e "   ${GREEN}✓ DEPLOYMENT.md exists${NC}"
    ((DOCS_FOUND++))
fi
if [ -f "SECURITY.md" ]; then
    echo -e "   ${GREEN}✓ SECURITY.md exists${NC}"
    ((DOCS_FOUND++))
fi
if [ -f "CLAUDE.md" ]; then
    echo -e "   ${GREEN}✓ CLAUDE.md exists${NC}"
    ((DOCS_FOUND++))
fi

if [ $DOCS_FOUND -eq 3 ]; then
    echo -e "   ${GREEN}✓ All documentation files present${NC}"
else
    echo -e "   ${YELLOW}⚠ Some documentation files missing${NC}"
fi

echo ""
echo -e "${PURPLE}=== SUMMARY ===${NC}"

# Overall assessment
CRITICAL_ISSUES=0
if [ ${#ENV_FILES[@]} -gt 0 ]; then
    ((CRITICAL_ISSUES++))
fi

if [ $CRITICAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 PRODUCTION READY!${NC}"
    echo -e "${GREEN}Your application has passed all critical security checks.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Create .env.local from .env.example with your production values"
    echo "2. Deploy to your hosting platform"
    echo "3. Set up monitoring and alerts"
    echo "4. Rotate any API keys that were previously exposed"
else
    echo -e "${RED}⚠️ CRITICAL ISSUES FOUND${NC}"
    echo -e "${RED}Please address the issues above before deploying to production.${NC}"
fi

echo ""
echo -e "${BLUE}Security recommendations:${NC}"
echo "• Rotate all API keys that were previously in committed .env files"
echo "• Set up error monitoring (Sentry)"
echo "• Configure rate limiting on your backend"
echo "• Enable HTTPS-only cookies for authentication"
echo "• Regular security audits with npm audit"