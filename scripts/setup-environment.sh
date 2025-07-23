#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Market Data Environment Setup${NC}"
echo "================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy .env.example to .env.local
echo "Creating .env.local from template..."
cp .env.example .env.local

echo -e "${GREEN}✓ Created .env.local${NC}"
echo ""

# Interactive setup
echo -e "${BLUE}Let's configure your environment variables:${NC}"
echo ""

# Supabase configuration
echo -e "${YELLOW}1. Supabase Configuration${NC}"
echo "   Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
read -p "   Enter your Supabase URL: " SUPABASE_URL
read -p "   Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

# Update .env.local
sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$SUPABASE_URL|" .env.local
sed -i.bak "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local

echo ""

# Backend API configuration
echo -e "${YELLOW}2. Backend API Configuration${NC}"
echo "   Production: https://osbackend-zl1h.onrender.com"
echo "   Development: http://localhost:3001"
read -p "   Use production backend? (Y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    API_URL="http://localhost:3001"
else
    API_URL="https://osbackend-zl1h.onrender.com"
fi

sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=$API_URL|" .env.local

echo ""

# Google OAuth configuration
echo -e "${YELLOW}3. Google OAuth Configuration${NC}"
echo "   Get from: https://console.cloud.google.com/apis/credentials"
read -p "   Enter your Google Client ID: " GOOGLE_CLIENT_ID

sed -i.bak "s|VITE_GOOGLE_CLIENT_ID=.*|VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID|" .env.local

echo ""

# Optional: Sentry configuration
echo -e "${YELLOW}4. Sentry Monitoring (Optional)${NC}"
read -p "   Do you want to configure Sentry? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "   Enter your Sentry DSN: " SENTRY_DSN
    sed -i.bak "s|VITE_SENTRY_DSN=.*|VITE_SENTRY_DSN=$SENTRY_DSN|" .env.local
fi

# Clean up backup files
rm -f .env.local.bak

echo ""
echo -e "${GREEN}✓ Environment setup complete!${NC}"
echo ""

# Validate the configuration
echo "Validating environment configuration..."
node scripts/validate-env.js

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. If you're setting up the backend, add these to your .env.local:"
echo "   - STRIPE_SECRET_KEY"
echo "   - BRAVE_API_KEY"
echo "   - Stripe Price IDs"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start development server:"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}Remember: NEVER commit .env.local to version control!${NC}"