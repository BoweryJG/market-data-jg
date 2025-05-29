# 🚀 Market Intelligence Hub - Sales Command Center

> **Transform market data into daily sales actions.** A revolutionary CRM-integrated dashboard for dental and aesthetic medical device sales teams.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-marketdata.repspheres.com-blue?style=for-the-badge)](https://marketdata.repspheres.com)
[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)](https://marketdata.repspheres.com)
[![Industry](https://img.shields.io/badge/Industry-Medical%20Devices-red?style=for-the-badge)](https://marketdata.repspheres.com)

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

## 📊 Data Sources

- **Supabase**: Core procedure and category data
- **Brave Search API**: Real-time market intelligence
- **AI Enhancement**: Automated insights and predictions
- **CRM Sync**: Bidirectional data flow (configurable)

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