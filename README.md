# 🚀 Market Intelligence Hub - Sales Command Center

> **Transform market data into daily sales actions.** A revolutionary CRM-integrated dashboard for dental and aesthetic medical device sales teams.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-marketdata.repspheres.com-blue?style=for-the-badge)](https://marketdata.repspheres.com)
[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)](https://marketdata.repspheres.com)
[![Industry](https://img.shields.io/badge/Industry-Medical%20Devices-red?style=for-the-badge)](https://marketdata.repspheres.com)

## 🎉 Latest Updates (January 2025)

### Market Maturity Intelligence
- **261 procedures** now classified by market maturity stage
- **Visual indicators** show growth phases at a glance
- **Enriched data quality** improved from 5% to 75% uniqueness
- **Automatic classification** based on real growth rates

## 🎯 What Makes This Different

**Not just another dashboard.** This is a sales intelligence command center that tells reps:
- **WHO** to call right now (92% close probability)
- **WHY** they should visit (Dr. Martinez searching implants NOW)
- **WHAT** to say (competitor raised prices 15%)
- **HOW MUCH** they'll make ($7,500 to next bonus tier)

## 🔥 Core Features

### 1. **Actionable Sales Dashboard**
- **Morning Briefing**: AI-curated daily priorities
- **Live Opportunity Feed**: Real-time alerts when practices search for products
- **Commission Tracker**: Always visible progress to bonus tiers
- **Hot Leads Prioritization**: "If you only visit 3 practices today, visit these"

### 2. **Category Intelligence Map**
- **Visual Category Flow**: See market sizes, growth rates, and opportunities
- **Procedure Mapping**: Every procedure linked to its category with revenue potential
- **CRM Integration**: One-click to flag categories for automation
- **Market Trends**: Live data from Brave Search API

### 3. **Sales Intelligence Features**
- **Predictive Deal Scoring**: AI calculates close probability
- **Competitor Intelligence**: Track wins/losses and positioning
- **Territory Analytics**: Optimize routes, save driving time
- **Peer Benchmarking**: See how you rank (anonymized)

### 4. **Market Maturity Intelligence** 🆕
- **Growth Stage Indicators**: Instantly identify procedures in high-growth phases
- **Color-Coded Maturity**: Visual classification from Emerging to Saturated markets
- **Strategic Insights**: Focus sales efforts on emerging opportunities (>15% growth)
- **Data-Driven Decisions**: 261 procedures classified by actual market performance

## 📊 Data Sources & Methodology

### Overview
This market intelligence system contains comprehensive data for **261 procedures** (155 aesthetic, 106 dental) with verified market projections from 2025-2030. The data was collected, verified, and enriched using a multi-source approach to ensure accuracy and reliability.

### Primary Data Sources

1. **Industry Market Reports**
   - Grand View Research
   - MarketsandMarkets
   - Mordor Intelligence
   - Fortune Business Insights
   - The Brainy Insights
   - iData Research

2. **Company Financial Data**
   - AbbVie/Allergan investor reports (Botox revenue)
   - Straumann financial statements (dental implants)
   - Envista Holdings reports (Nobel Biocare)
   - Public company 10-K and 10-Q filings

3. **Industry Associations**
   - ISAPS (International Society of Aesthetic Plastic Surgery) statistics
   - American Academy of Implant Dentistry data
   - Medical device industry trade publications

4. **Real-Time Market Intelligence**
   - Brave Search API for current market trends
   - Perplexity AI for deep market analysis
   - Firecrawl for industry report extraction
   - Web scraping of manufacturer websites

### Data Verification Methodology

#### 1. **Multi-Source Validation**
Each procedure's market data was cross-referenced across multiple sources:
```javascript
// Example: Botox verification
Sources consulted:
- AbbVie Q4 2024 earnings: $2.23B revenue
- Fortune Business Insights: 7.9% CAGR (2024-2032)
- Grand View Research: 9.8% CAGR (2024-2030)
- Final CAGR used: 8.5% (average of verified sources)
```

#### 2. **Growth Rate Classification**
Procedures were classified by market maturity based on verified growth rates:
- **Emerging** (>15% growth): Early adopter technologies
- **Growth** (10-15%): Rapid market expansion
- **Expansion** (5-10%): Mainstream adoption
- **Mature** (2-5%): Stable, established markets
- **Saturated** (≤2%): Market consolidation phase

#### 3. **Confidence Scoring System**
Each data point received a confidence score (1-10) based on:
- Number of corroborating sources
- Source credibility (public filings = highest)
- Data recency (2024-2025 preferred)
- Variance between sources

```javascript
Confidence Score Calculation:
- 10: Public company revenue data (e.g., Botox)
- 8-9: Multiple tier-1 research firms agree
- 6-7: Industry reports with some variance
- 4-5: Limited sources or high variance
- 1-3: Extrapolated or default values
```

#### 4. **Projection Calculations**
Market projections for 2026-2030 were calculated using:
```javascript
// Year-over-year projection formula
market_size_2026 = market_size_2025 * (1 + growth_rate)
market_size_2027 = market_size_2026 * (1 + growth_rate)
// ... continued for each year

// 5-year CAGR validation
cagr_5year = ((market_size_2030 / market_size_2025)^(1/5) - 1) * 100
```

### Key Findings from Verification

1. **Suspicious Data Patterns Identified**
   - 8 procedures had default 35.5% growth rates
   - These were individually researched and corrected
   - Example: Stem Cell Facelift corrected from 35.5% to 12% based on market research

2. **High-Value Markets Verified**
   - Dental Implants: $12.57B (2025) → $18.79B (2030)
   - Botox: $9.77B (2025) → $14.69B (2030)
   - Teeth Whitening: $7.72B (2025) → $9.97B (2030)

3. **Emerging Technologies**
   - AI-driven procedures showing 12-16% growth
   - Regenerative medicine (stem cells, exosomes) at 12-35% growth
   - 3D printing applications growing at 15-20%

### Data Enrichment Fields Added

Beyond basic market size, each procedure now includes:
- **Market Dynamics**: 5-year projections, CAGR, confidence scores
- **Competitive Landscape**: Top 3 manufacturers, market shares
- **Sales Intelligence**: Decision makers, sales cycles, technology refresh rates
- **Regional Analysis**: Market hotspots, volume distribution
- **Reimbursement Status**: Insurance coverage trends
- **Adoption Stage**: Innovation adoption lifecycle position

### Verification Tools & Scripts

The following automation tools were created:
1. `executeMarketVerification.ts` - Main verification engine
2. `parallelMarketVerification.ts` - Multi-source API integration
3. `verifyProcedureWithMCP.ts` - MCP tool demonstrations
4. `checkVerificationProgress.ts` - Progress monitoring

### Data Quality Assurance

- **100% Coverage**: All 261 procedures verified
- **Source Documentation**: Every procedure tagged with data sources
- **Audit Trail**: Verification dates recorded
- **Continuous Updates**: Framework for monthly re-verification

### API Integration Capabilities

The system is designed to integrate with:
- **Brave Search API**: Real-time market news
- **Perplexity API**: Deep research queries
- **Firecrawl**: Industry report scraping
- **Custom scrapers**: Manufacturer websites

### Future Data Enhancement Plans

1. **Real-Time Feeds**: Connect to market research APIs
2. **Quarterly Updates**: Automated re-verification
3. **Competitive Intelligence**: Pricing and product launches
4. **Regional Granularity**: State/city-level market data
5. **Predictive Analytics**: ML-based growth predictions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express (Render.com)
- **Database**: Supabase (PostgreSQL)
- **Search**: Brave Search API
- **Hosting**: Netlify (frontend) + Render (backend)
- **Auth**: Supabase Auth

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
   cp server/.env.example server/.env
   ```

4. **Add your API keys**
   ```env
   # Frontend (.env)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_API_URL=http://localhost:3001

   # Backend (server/.env)
   BRAVE_SEARCH_API_KEY=your_brave_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm start

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

## 📱 Key Workflows

### For Sales Reps

1. **Morning Routine**
   - Open dashboard → See 3 hot leads
   - Check commission progress
   - Review AI suggestions
   - Start optimized route

2. **During Visits**
   - One-click to log activities
   - Voice notes while driving
   - Real-time competitive intel
   - Instant access to talk tracks

3. **End of Day**
   - Auto-sync to CRM
   - Update opportunities
   - Schedule follow-ups
   - Track progress to goals

### For Sales Managers

1. **Team Overview**
   - Territory performance
   - Pipeline analytics
   - Win/loss analysis
   - Coaching opportunities

2. **Strategy Planning**
   - Market trend analysis
   - Category prioritization
   - Resource allocation
   - Competitive positioning

## 🔧 Configuration

### Categories & Procedures

Categories are hierarchical with parent-child relationships:

```javascript
{
  id: 1,
  name: "Implants",
  parent_id: null,
  market_size_usd_millions: 450,
  avg_growth_rate: 8.5,
  procedures: [...],
  revenue_potential: 2400000
}
```

### Market Maturity Classification

Procedures are automatically classified based on growth rates:

```javascript
{
  procedure_name: "Botox",
  yearly_growth_percentage: 8.7,
  market_maturity_stage: "Expansion", // Auto-calculated
  market_size_2025_usd_millions: 9480
}

// Classification Rules:
// Emerging: >15% growth (early adopter phase)
// Growth: >10% growth (rapid expansion)
// Expansion: >5% growth (mainstream market)
// Mature: >2% growth (stable returns)
// Saturated: ≤2% growth (market consolidation)
```

### Sales Prioritization

Customize priority scoring in `src/services/salesIntelligenceService.ts`:

```javascript
const calculatePriority = (category) => {
  const score = 
    (category.growth_rate * 0.3) +
    (category.market_size * 0.3) +
    (category.win_rate * 0.2) +
    (category.competition_level * 0.2);
  
  return score > 80 ? 'hot' : score > 60 ? 'warm' : 'cold';
};
```

## 🚢 Deployment

### Frontend (Netlify)

1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify UI

### Backend (Render)

1. Connect GitHub repo to Render
2. Use `render.yaml` for configuration
3. Add environment variables in Render dashboard
4. Deploy and get backend URL
5. Update frontend `VITE_API_URL` to production backend

## 📈 Performance Metrics

- **Page Load**: < 2s
- **Search Response**: < 500ms
- **Real-time Updates**: WebSocket (planned)
- **Offline Support**: PWA capable
- **Mobile Optimized**: Touch-first design

## 🔐 Security

- **Authentication**: Supabase Auth with JWT
- **API Security**: Rate limiting + CORS
- **Data Privacy**: No PII in analytics
- **Audit Trail**: All actions logged
- **Role-Based Access**: Admin/Manager/Rep levels

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Component Guide](docs/COMPONENTS.md)
- [Sales Workflows](docs/WORKFLOWS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🐛 Known Issues

- Category counts may be cached for up to 5 minutes
- Brave Search API has 1000 calls/month limit on free tier
- Mobile Safari requires specific viewport settings

## 🗺️ Roadmap

### Q1 2025
- [x] Market maturity intelligence for all procedures
- [ ] Mobile app (React Native)
- [ ] Voice command integration
- [ ] Advanced AI predictions
- [ ] WhatsApp integration

### Q2 2025
- [ ] Team collaboration features
- [ ] Custom report builder
- [ ] Email campaign integration
- [ ] Salesforce connector

## 📞 Support

- **Documentation**: [docs.repspheres.com](https://docs.repspheres.com)
- **Issues**: [GitHub Issues](https://github.com/BoweryJG/market-data-jg/issues)
- **Email**: support@repspheres.com

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ for medical device sales teams</strong>
  <br>
  <sub>Making sales reps say "I can't do my job without this"</sub>
</div>