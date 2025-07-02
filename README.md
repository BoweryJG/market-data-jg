# 💎 Market Data - RepSpheres Premium Intelligence Platform

> **The luxury-tier market intelligence platform for medical aesthetics.** Real-time analytics, territory intelligence, and KOL tracking with authenticated access controls.

[![Live Platform](https://img.shields.io/badge/Live%20Platform-marketdata.repspheres.com-purple?style=for-the-badge)](https://marketdata.repspheres.com)
[![Version](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge)](https://marketdata.repspheres.com)
[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)](https://marketdata.repspheres.com)
[![Industry](https://img.shields.io/badge/Industry-Medical%20Aesthetics-red?style=for-the-badge)](https://marketdata.repspheres.com)

## 🌟 Platform Overview

**RepSpheres Market Data** is a sophisticated market intelligence platform that transforms raw medical aesthetics data into actionable insights. Built with a luxury-tier user experience, it serves both public users exploring the market and authenticated professionals requiring deep analytics.

### 🎯 Key Differentiators

- **Dual Access System**: Public demo mode with rotating real data + authenticated premium access
- **Territory Intelligence**: KOL tracking with social media metrics across all US states
- **Premium Visualizations**: Supreme gauges, glassmorphic UI, and real-time animations
- **Subscription Tiers**: Free to Enterprise with feature scaling
- **Live Data Mode**: 30-second refresh for authenticated users
- **No Generic Data**: All public data rotates from real completed entries

## 🔥 Core Features

### 1. **Premium Market Dashboard**
- **Supreme Gauges**: Real-time market size ($4.2B+), growth rates, procedure counts
- **Live/Static Modes**: Authenticated users get 30-second data refresh
- **Market Overview**: Comprehensive view of US medical aesthetics market
- **Public Access**: Rotating display of top 10 KOLs from NY/FL territories
- **Category Intelligence**: Dynamic filtering by dental/aesthetic procedures

### 2. **Territory Intelligence Hub** 
- **KOL Rankings**: Top influence leaders with verified social metrics
- **Geographic Heat Maps**: Provider density and opportunity scoring
- **Market Insights**: Specialty distribution, growth trends, competitive analysis
- **Rotating Providers**: Public users see different top 10 every minute
- **Authenticated Access**: Full territory data based on subscription level

### 3. **Enhanced Visualizations**
- **Glassmorphic Design**: Premium UI with backdrop blur effects
- **GSAP Animations**: Smooth gauge transitions and data flows
- **LED Indicators**: Real-time status (Green=Live, Yellow=Static, Red=Public)
- **Power Rails**: Animated telemetry with 4px LEDs
- **Luxury Screws**: Premium corner positioning

## 🔐 Authentication & Access Levels

### Public Mode (Non-Authenticated)
- View rotating top 10 providers from NY & FL
- Access mock market data with realistic estimates  
- See limited territory intelligence
- "PUBLIC MODE" indicator displayed
- No API calls to protect data

### Authenticated Access

#### Free Tier
- Basic market overview
- Home territory access only
- Monthly data refresh
- Basic KOL metrics

#### Basic Tier ($99/month)
- Real-time market data
- Access to 5 states
- Weekly refresh
- Enhanced KOL tracking
- Export capabilities

#### Professional Tier ($299/month)
- All 50 US states
- Daily refresh
- API access (1000 calls/month)
- Magic links for sharing
- Advanced analytics

#### Enterprise Tier (Custom)
- White-label options
- Unlimited API access
- CRM integrations
- Dedicated support
- Custom reports
- Automation tools

## 📊 Data Architecture

### Live Data Sources (Authenticated)
- **providers**: 10,000+ verified medical aesthetic providers
- **provider_social_influence**: Instagram, LinkedIn, YouTube metrics
- **provider_market_insights**: Revenue estimates, growth scores
- **user_profiles**: Subscription and territory management
- **procedures**: 500+ categorized treatments
- **companies**: 1000+ industry players

### Mock Data (Public Mode)
- **territoryMockDataService**: Rotating selection of 12 premium providers
- **marketDataEstimator**: Industry-accurate procedure estimates
- **Geographic Data**: NY & FL heat maps only
- **Rotation Interval**: 60 seconds for fresh displays

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI v5 + Styled Components  
- **State**: React Context API (Auth + Theme)
- **Animations**: GSAP + Framer Motion
- **Routing**: React Router v6
- **Build**: Vite
- **Fonts**: Orbitron (headers) + Inter (body)

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (OAuth - Google/Facebook)
- **Real-time**: Supabase subscriptions (planned)
- **Search**: Brave Search API
- **Hosting**: Vercel/Netlify
- **CDN**: Cloudflare

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Brave Search API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BoweryJG/market-data-jg.git
   cd market-data-jg
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

## 🎨 Design System

### Color Palette
```scss
// Gem Colors
$impossible: rgb(255, 0, 255);    // Magenta
$shift: rgb(0, 255, 255);         // Cyan  
$deep: rgb(255, 0, 170);          // Deep Pink

// UI Colors
$purple-primary: #9f58fa;
$blue-accent: #4B96DC;
$green-accent: #4bd48e;
$orange-accent: #ff6b35;
$pink-accent: #f53969;

// Backgrounds
$bg-dark: #0a0a0a;
$panel-dark: #1a1a1a;
```

### Component Library
- **Supreme Gauges**: Circular progress with GSAP animations
- **Glassmorphic Cards**: backdrop-filter: blur(10px)
- **LED Indicators**: Status lights with flicker animation
- **Power Rails**: Telemetry display with data flow
- **Luxury Screws**: Corner positioning elements

## 📱 User Journeys

### Public User Flow
1. **Landing**: See live market overview with PUBLIC MODE indicator
2. **Explore**: View rotating top 10 KOLs (changes every minute)
3. **Interact**: Browse categories and procedures with mock data
4. **Convert**: Prompted to sign up for full access

### Authenticated User Flow  
1. **OAuth Login**: Google/Facebook → redirect to /market-data
2. **Dashboard**: Live data mode activated based on subscription
3. **Territory Intel**: Access territories based on tier
4. **Export/Share**: Generate reports and magic links (Pro+)

## 🏗️ Project Structure

```
market-data-repspheres/
├── src/
│   ├── components/
│   │   ├── Auth/                    # OAuth login, AuthCallback
│   │   ├── Dashboard/               # PremiumMarketDashboard, gauges
│   │   ├── Navigation/              # PremiumNavbar with telemetry
│   │   └── Widgets/                 # EnhancedTerritoryIntel
│   ├── context/
│   │   ├── AuthContext.tsx          # User auth + subscription state
│   │   └── ThemeContext.tsx         # Dark theme management
│   ├── services/
│   │   ├── supabaseClient.ts        # Supabase configuration
│   │   ├── comprehensiveDataService.ts
│   │   ├── territoryIntelligenceService.ts
│   │   ├── territoryMockDataService.ts  # Rotating public data
│   │   └── marketDataEstimator.ts   # Mock procedure data
│   └── App.tsx                      # OAuth handler + routing
├── public/
│   └── favicon.svg                  # RepSpheres logo
└── index.html                       # Entry with fonts
```

## 🚢 Deployment

### Production (Vercel/Netlify)

1. **Connect Repository**
   ```bash
   git push origin main
   ```

2. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: 18+

4. **OAuth Configuration**
   - Add `https://yourdomain.com/market-data` to Supabase redirect URLs
   - Configure Google/Facebook OAuth in Supabase dashboard

### Supabase Setup

1. **Enable Authentication**
   - Google OAuth
   - Facebook OAuth
   - Email/Password (optional)

2. **Create Tables** (if not exists)
   ```sql
   -- user_profiles table
   CREATE TABLE user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT,
     full_name TEXT,
     company TEXT,
     territory TEXT,
     subscription_level TEXT DEFAULT 'free',
     subscription_expires TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Row Level Security**
   - Enable RLS on all tables
   - Create policies for authenticated access

## 📈 Performance & Security

### Performance Metrics
- **Initial Load**: < 2s (code splitting)
- **Data Refresh**: 30s intervals (authenticated)
- **Animation FPS**: 60fps (GSAP optimized)
- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: 95+

### Security Features
- **OAuth 2.0**: Google/Facebook authentication
- **RLS**: Row-level security on all tables
- **API Keys**: Environment variables only
- **CORS**: Configured for production domains
- **Rate Limiting**: Based on subscription tier
- **Data Privacy**: No PII in public mode

## 🔍 Key Features Explained

### Supreme Gauges
Custom circular progress indicators with:
- GSAP spring animations
- Dynamic color gradients
- Real-time value updates
- Responsive sizing
- Live mode indicators

### Territory Intelligence
- **Public Mode**: Shows rotating top 10 from 12 premium providers
- **Authenticated**: Full access to 10,000+ providers
- **KOL Scoring**: Weighted algorithm including social metrics
- **Heat Maps**: Geographic density visualization

### Authentication Flow
1. User clicks OAuth provider
2. Redirected to provider auth
3. Callback to `/market-data` with token
4. User profile created/fetched
5. Subscription level applied
6. Dashboard loads with appropriate data

## 🐛 Troubleshooting

### Common Issues

**"PUBLIC MODE" showing for logged-in users**
- Check Supabase auth session
- Verify user_profiles table exists
- Ensure RLS policies are configured

**Rotating providers not changing**
- Rotation interval is 60 seconds
- Check browser console for errors
- Verify territoryMockDataService is imported

**OAuth redirect not working**
- Add redirect URL to Supabase dashboard
- Check OAuth provider configuration
- Verify environment variables

## 🗺️ Roadmap

### Q1 2025
- [ ] Real-time WebSocket updates
- [ ] Advanced territory planning AI
- [ ] Mobile app (React Native)
- [ ] Automated report generation
- [ ] Multi-language support

### Q2 2025
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Team collaboration features
- [ ] Voice command interface
- [ ] Predictive analytics
- [ ] White-label customization

### Q3 2025
- [ ] Global market expansion
- [ ] AR/VR data visualization
- [ ] Blockchain verification
- [ ] API v2 with GraphQL
- [ ] Enterprise SSO

## 🤝 Contributing

This is a proprietary project. Contributors must:
1. Sign NDA and contributor agreement
2. Pass security clearance
3. Complete onboarding process

Contact: dev@repspheres.com

## 📞 Support

- **Technical Support**: tech@repspheres.com
- **Sales Inquiries**: sales@repspheres.com
- **Documentation**: [docs.repspheres.com](https://docs.repspheres.com)
- **Status Page**: [status.repspheres.com](https://status.repspheres.com)

## 📄 License

Copyright © 2024 RepSpheres. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited.

## 🏆 Acknowledgments

Special thanks to:
- Our beta testers for invaluable feedback
- The medical aesthetics community for domain expertise
- Open source contributors for foundational libraries

---

<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="RepSpheres Logo">
  <br><br>
  <strong>RepSpheres Market Data</strong>
  <br>
  <em>Illuminating the Medical Aesthetics Market</em>
  <br><br>
  <sub>Built with precision and passion in New York City</sub>
</div>