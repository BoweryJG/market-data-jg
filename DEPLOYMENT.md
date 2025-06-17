# Market Data JG - Deployment Guide

## Prerequisites
- Netlify account
- Environment variables from .env.example

## Deployment Steps

### 1. Environment Variables in Netlify
Set these in Netlify Dashboard > Site Settings > Environment Variables:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_API_URL=https://your-api-domain.com
VITE_BRAVE_API_KEY=your_brave_api_key
```

### 2. Deploy Command
The build command is already configured in netlify.toml:
```
npm install && npm run build:vite-only
```

### 3. Public Routes
The following routes are publicly accessible without authentication:
- `/procedures` - Public procedures list
- `/login` - Login page
- `/auth/callback` - Auth callback handler

All other routes require authentication.

### 4. Domain Setup
Configure your custom domain in Netlify:
- Primary domain: market.repspheres.com
- SSL will be automatically provisioned

### 5. Post-Deployment
1. Test public procedures route: https://market.repspheres.com/procedures
2. Test authentication flow
3. Verify cross-domain auth if using SSO
4. Check that premium features require login

## Quick Deploy
1. Connect GitHub repo to Netlify
2. Set environment variables
3. Deploy