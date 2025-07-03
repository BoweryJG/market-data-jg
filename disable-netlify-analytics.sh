#!/bin/bash

echo "🔍 Checking Netlify site configuration..."

# Check if site is linked
if ! npx netlify status > /dev/null 2>&1; then
    echo "❌ Site not linked. Please run: netlify link"
    exit 1
fi

echo "📊 Checking for Netlify Analytics..."
npx netlify api getSite --data "{}" | grep -i "analytics\|subscription\|usage" || echo "No analytics found in API response"

echo "🔍 Checking site plugins..."
npx netlify api listSitePlugins --data "{}" 2>/dev/null || echo "No plugins API available"

echo "🔍 Checking environment variables..."
npx netlify env:list | grep -i "analytics\|subscription\|usage\|identity" || echo "No suspicious env vars found"

echo "🔍 Checking build settings..."
npx netlify api getSiteBuildSettings --data "{}" 2>/dev/null | grep -i "processing" || echo "No build processing info"

echo "📝 Site Info:"
npx netlify api getSite --data "{}" | jq '.account_slug, .name, .id' 2>/dev/null || npx netlify api getSite --data "{}"