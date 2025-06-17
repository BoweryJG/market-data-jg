# Cross-Domain Authentication Implementation

## Summary

This document outlines the cross-domain authentication implementation for the Market Data JG application, bringing it in line with the Canvas and CRM applications.

## Changes Made

### 1. Cross-Domain Auth Utility
- **File Created**: `src/utils/crossDomainAuth.ts`
- **Purpose**: Provides standardized authentication configuration and cross-domain synchronization
- **Key Features**:
  - Standardized Supabase auth configuration
  - Cross-domain session synchronization via iframes
  - Auth state broadcasting across RepSpheres domains
  - Support for development (localhost) and production domains

### 2. Updated Supabase Configuration
- **File Modified**: `src/auth/supabase.ts`
- **Changes**:
  - Replaced custom cookie configuration with `getStandardAuthConfig()`
  - Imports cross-domain auth utility
  - Maintains support for both VITE_ and REACT_APP_ environment variables

### 3. Enhanced AuthContext
- **File Modified**: `src/auth/AuthContext.tsx`
- **Changes**:
  - Added cross-domain auth listener setup
  - Broadcasts auth state changes to other domains
  - Uses cross-domain `storeReturnUrl` function
  - Handles cross-domain redirects after authentication

### 4. Auth Sync Page
- **File Created**: `public/auth/sync.html`
- **Purpose**: Handles cross-domain authentication synchronization
- **Features**:
  - Validates origin from RepSpheres domains
  - Stores/removes session data in localStorage
  - Communicates with parent windows via postMessage

### 5. Public Procedures Page
- **File Created**: `src/components/procedures/PublicProceduresList.tsx`
- **Purpose**: Public-accessible procedures list with teaser content
- **Features**:
  - Shows procedures grouped by category
  - Displays limited data for non-authenticated users
  - Progressive disclosure with expandable categories
  - Login CTAs throughout the interface

### 6. Updated Routing
- **File Modified**: `src/App.tsx`
- **Changes**:
  - Added `/procedures` as a public route
  - Restructured routing to support multiple public pages
  - Maintained existing protected routes

## Configuration

### Environment Variables
The application supports both environment variable prefixes:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Vite)
- `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` (Create React App)

### Domain Configuration
Supported domains:
- Production: `marketdata.repspheres.com`
- Development: `localhost:3001`

### Storage Key
All RepSpheres applications use the same storage key: `repspheres-auth`

## Testing Cross-Domain Auth

1. **Local Development**:
   - Run Market Data JG on port 3001
   - Run Canvas on port 3002
   - Run CRM on port 3003
   - Test login on one app and verify session persists on others

2. **Production**:
   - Login on any RepSpheres subdomain
   - Navigate to other subdomains
   - Verify authentication persists

## Public Routes

The following routes are accessible without authentication:
- `/procedures` - Public procedures list
- `/login` - Login page
- `/auth/callback` - OAuth callback
- `/magic-link/:token` - Magic link handler

All other routes require authentication and show the PublicMarketDashboard for unauthenticated users.

## Next Steps

1. Test cross-domain authentication thoroughly
2. Verify procedures data loads correctly from Supabase
3. Consider adding more public content pages
4. Monitor auth state synchronization performance
5. Add analytics to track public vs authenticated usage