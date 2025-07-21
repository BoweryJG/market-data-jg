# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests with Vitest
- `npm run typecheck` - TypeScript type checking

### Backend Development
- `cd server && npm start` - Start local backend server
- `cd server && npm run dev` - Start backend in development mode

### Deployment
- Frontend: Auto-deploy via Netlify on push to main branch
- Backend: Currently using unified osbackend-zl1h.onrender.com
- Manual deployment: `npm run build` then deploy `dist/` folder

## Architecture Overview

### Core Application Structure
This is a **React 18 + TypeScript Market Intelligence Dashboard** built for medical device and aesthetic sales teams. The application provides real-time market data, competitive intelligence, and sales insights for dental and aesthetic procedures.

### Key Architectural Patterns

#### 1. Backend Integration (`src/services/backendClient.ts`)
The application uses a unified backend approach:
- **Primary Backend**: `osbackend-zl1h.onrender.com`
- **Fallback URL**: Configurable via `VITE_API_URL` environment variable
- **Authentication**: Supabase Auth with JWT tokens
- **Cross-domain**: Enabled with `withCredentials: true`

#### 2. Authentication System (`src/auth/`)
**Supabase-based authentication** with RepSpheres ecosystem integration:
- Single sign-on across RepSpheres applications
- JWT token management with automatic refresh
- Cross-domain authentication support
- Magic link authentication for seamless login

#### 3. Subscription Management (`src/hooks/useSubscription.ts`)
**Feature-based subscription system**:
- Plan-based access control (Free, Starter, Professional, Enterprise)
- Usage tracking for AI queries, categories, automations
- Add-on purchase capabilities
- Integration with Stripe for billing

#### 4. Market Intelligence Engine
- **261 Verified Procedures**: Aesthetic and dental procedures with market data
- **Real-time Market Intelligence**: Brave Search API integration
- **Competitive Analysis**: Company and procedure tracking
- **Market Maturity Classification**: Growth stage indicators

### Component Architecture

#### Dashboard Components (`src/components/Dashboard/`)
- **ActionableSalesDashboard**: Main sales intelligence interface
- **MarketIntelligenceDashboard**: Market data visualization
- **CategoryHierarchyView**: Procedure categorization system
- **QuantumMarketDashboard**: Advanced visualization dashboard

#### Market Intelligence (`src/components/MarketPulse/`)
- **MarketPulseEngine**: Real-time market trend analysis
- **OpportunityRadar**: Lead identification system
- **VelocityStreams**: Market velocity indicators

#### Sales Tools (`src/components/Sales/`)
- **SalesIntelligenceHub**: Centralized sales tools
- **FieldTools**: Mobile-optimized sales utilities
- **IndustrySpecificTools**: Vertical-specific features

### Data Flow

#### 1. Authentication Flow
```
User Login → Supabase Auth → JWT Token → Backend Authorization → Feature Access
```

#### 2. Market Data Flow
```
UI Request → backendClient → osbackend API → Market Intelligence Response → UI Update
```

#### 3. Subscription Flow
```
Feature Access Check → useSubscription Hook → Backend Validation → Access Grant/Deny
```

### Integration Points

#### Backend Synchronization Status
**Market Data ↔ osbackend-zl1h.onrender.com Integration**

**✅ FULLY SYNCHRONIZED ENDPOINTS:**
- `GET /api/subscription/status` - Subscription status (✅ Added)
- `POST /api/subscription/track-usage` - Usage tracking (✅ Added)
- `POST /api/subscription/purchase-addon` - Add-on purchases (✅ Added)
- `GET /api/subscription/usage` - Usage statistics (✅ Added)
- `GET /api/subscription/billing-history` - Billing history (✅ Added)
- `POST /api/subscription/create-checkout` - Stripe checkout (✅ Added)
- `POST /api/subscription/portal` - Customer portal (✅ Added)
- `GET /health` - Backend health check (✅ Working)

**🔧 FUNCTIONAL FEATURES:**
- **Subscription Management**: Full integration with Stripe
- **Usage Tracking**: AI queries, categories, automations
- **Billing**: Checkout sessions and customer portal
- **Authentication**: JWT tokens with Supabase
- **Cross-domain**: Proper CORS configuration

#### External Services
- **Supabase**: Database, authentication, real-time updates
- **Brave Search API**: Market intelligence and news
- **Stripe**: Subscription billing and payment processing
- **Netlify**: Frontend hosting and serverless functions

#### Cross-App Navigation
The app integrates with the RepSpheres ecosystem:
- **CRM** (`crm.repspheres.com`)
- **Canvas** (`canvas.repspheres.com`) 
- **Main Site** (`repspheres.com`)
- **Shared Authentication**: Cross-domain cookies

### State Management

#### React Context Usage
- **AuthContext**: User authentication state and session management
- **ThemeContext**: UI theme and customization preferences
- **Market Intelligence**: Real-time data updates and caching

#### Data Persistence
- **Supabase**: Primary database (PostgreSQL) for procedures, categories, market data
- **Local Storage**: Theme preferences, user settings, cached market data
- **Session Storage**: Temporary UI state and search results

### Important Development Notes

#### Environment Variables
**Backend Connection:**
- `VITE_API_URL=https://osbackend-zl1h.onrender.com` (unified backend)

**Required for full functionality:**
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (authentication and database)
- `BRAVE_SEARCH_API_KEY` (market intelligence)
- `STRIPE_*` variables (subscription billing)

#### Build Configuration
- **Vite**: Fast development and optimized production builds
- **TypeScript**: Full type safety with strict mode
- **Material-UI**: Consistent design system
- **Netlify deployment** with automatic builds

#### Error Handling
- **Graceful degradation** when backend is unavailable
- **Retry logic** for market data requests
- **User feedback** for subscription and billing issues

#### Performance Considerations
- **Code splitting** for dashboard components
- **Lazy loading** of market intelligence features
- **Caching** of market data and user preferences
- **Optimized** bundle size for mobile users

#### Mobile Optimization
- **Responsive design** with mobile-first approach
- **Touch-friendly** interface elements
- **Progressive Web App** capabilities
- **Offline** data caching for core features

### Testing Strategy
- **Vitest**: Unit and integration testing framework
- **TypeScript**: Compile-time error detection
- **End-to-End**: Planned with Playwright
- **API Integration**: Mock services for reliable testing

### Security Implementation
- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Secrets**: Secure API key management
- **Rate Limiting**: Backend API protection

This architecture enables the Market Intelligence Hub to provide real-time, actionable sales insights while maintaining high performance and reliability across the RepSpheres ecosystem.

## Backend Synchronization Status

### Overview
The Market Data application is fully synchronized with the unified osbackend-zl1h.onrender.com backend. All subscription management, usage tracking, and billing functionality is operational.

### Market Data Backend Sync Status - Complete ✅

#### Synchronized API Endpoints
```javascript
// All endpoints now working on osbackend-zl1h.onrender.com:

GET  /api/subscription/status          // ✅ Subscription status
POST /api/subscription/track-usage     // ✅ Usage tracking
POST /api/subscription/purchase-addon  // ✅ Add-on purchases  
GET  /api/subscription/usage           // ✅ Usage statistics
GET  /api/subscription/billing-history // ✅ Billing history
POST /api/subscription/create-checkout // ✅ Stripe checkout
POST /api/subscription/portal          // ✅ Customer portal
```

#### Implementation Details
- **Backend**: All endpoints implemented in `routes/stripe.js`
- **Frontend**: Uses `src/services/backendClient.ts` configured for osbackend
- **Architecture**: Shared routing under `/api/subscription` path
- **Features**: Complete subscription management system

#### Current Capabilities
- **Subscription Status**: Real-time plan and feature checking
- **Usage Tracking**: AI queries, categories, automations monitoring
- **Billing Integration**: Full Stripe checkout and portal access
- **Add-on Purchases**: Dynamic feature upgrades
- **Cross-App Auth**: JWT tokens with Supabase integration

### Environment Configuration
```env
# Frontend Environment Variables
VITE_API_URL=https://osbackend-zl1h.onrender.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Environment Variables (on Render)
STRIPE_SECRET_KEY=your_stripe_secret_key
MARKET_DATA_STARTER_PRICE_ID=price_for_starter_plan
MARKET_DATA_PROFESSIONAL_PRICE_ID=price_for_professional_plan
MARKET_DATA_ENTERPRISE_PRICE_ID=price_for_enterprise_plan
```

### Integration Status Summary
- **Backend Integration**: 100% Complete ✅
- **Subscription System**: Fully Functional ✅
- **Billing & Payments**: Operational ✅
- **Usage Tracking**: Implemented ✅
- **Authentication**: Cross-domain Ready ✅

The Market Data application is now fully integrated with the unified osbackend system and ready for production use with complete subscription and billing functionality.

## File Naming Conventions

When creating new files:
- **Market Data specific**: Include "market" or "intelligence" in filename
- **Sales tools**: Include "sales" or "field" in filename  
- **Dashboard components**: Include "dashboard" in filename
- **Shared/Universal**: Use generic descriptive names

## API Integration Notes

### Market Intelligence APIs
- **Brave Search**: Real-time market trends and news
- **Procedure Database**: 261 verified procedures with market data
- **Company Intelligence**: Manufacturer and competitor tracking
- **Growth Projections**: 2025-2030 market forecasts

### Subscription Management
- **Feature Gating**: Plan-based access control
- **Usage Limits**: AI queries, categories, automations
- **Billing**: Stripe integration for payments
- **Add-ons**: Dynamic feature purchases

## Important Notes

- **Always use osbackend** for subscription and billing features
- **Authentication required** for most backend endpoints
- **Market data cached** for performance optimization
- **Mobile responsive** design throughout application
- **Cross-app compatibility** with RepSpheres ecosystem

This application provides comprehensive market intelligence and sales tools for medical device sales teams, with full integration to the unified osbackend system.