# UI Mode Architecture - Clean Toggle System

## Core Principle
The market data visualization remains the hero. Modes are subtle enhancements, not overwrites.

## Visual Design

### Mode Toggle Component (Top Right Corner)
```typescript
// Minimal toggle - like Figma's view options
<ModeToggle>
  <Toggle icon="📊" label="Market" active={true} />
  <Toggle icon="💼" label="Sales" />
  <Toggle icon="🔍" label="SEO" />
</ModeToggle>
```

### Mode Behavior

#### 📊 Market Mode (Default)
- **What Shows**: Beautiful data visualizations, trends, market intelligence
- **What's Hidden**: Sales scripts, SEO metrics
- **Use Case**: Executives, analysts viewing market landscape
- **Key Features**:
  - Market size bubbles
  - Growth rate heat maps
  - Competitive landscape
  - Procedure popularity flows
  - Innovation timeline

#### 💼 Sales Mode
- **What Changes**: 
  - Data cards show "Conversation Starters"
  - Revenue opportunity badges appear
  - "Contact Provider" buttons activate
  - Objection handlers slide in
- **What Stays**: All core visualizations
- **Use Case**: Sales reps preparing for calls
- **Key Features**:
  - Talk tracks overlay on hover
  - ROI calculators embedded
  - Competitive battle cards
  - Success story links

#### 🔍 SEO Mode
- **What Changes**:
  - Search volume badges on procedures
  - "Ranking Opportunity" indicators
  - Keyword difficulty gradients
  - Content gap highlights
- **What Stays**: Market visualization context
- **Use Case**: Marketing teams, consultants
- **Key Features**:
  - Keyword clouds on hover
  - SERP preview panels
  - Quick win indicators
  - Content templates drawer

## Implementation Strategy

### 1. Data Structure (No New Tables)
```sql
-- Store mode-specific data in existing columns
-- expanded_description can hold JSON with all mode data
{
  "market": { /* existing data */ },
  "sales": {
    "talkTrack": "...",
    "objectionHandlers": [...],
    "roi": { /* calculations */ }
  },
  "seo": {
    "keywords": {
      "primary": "dental implants",
      "local": ["dental implants near me", "affordable dental implants"],
      "volume": { "national": 74000, "local": 2400 },
      "difficulty": 76
    },
    "contentTemplates": { /* ... */ }
  }
}
```

### 2. UI Components

#### Mode-Aware Data Cards
```tsx
<ProcedureCard procedure={procedure}>
  {/* Always visible */}
  <MarketData />
  
  {/* Conditionally rendered based on mode */}
  {mode === 'sales' && <SalesInsights />}
  {mode === 'seo' && <SEOMetrics />}
  
  {/* Smart tooltips change by mode */}
  <Tooltip content={getModeSpecificTooltip(mode)} />
</ProcedureCard>
```

#### Subtle Mode Indicators
- Thin colored border on active mode
- Mode-specific icons appear on hover
- Keyboard shortcuts (M, S, E) for power users

### 3. Progressive Enhancement

```typescript
// Start simple
const enrichmentPhases = {
  phase1: {
    sales: ['talkTracks', 'basicROI'],
    seo: ['primaryKeywords', 'searchVolume']
  },
  phase2: {
    sales: ['competitiveBattlecards', 'objectionHandlers'],
    seo: ['contentTemplates', 'serpAnalysis']
  },
  phase3: {
    sales: ['aiCoaching', 'personalizedScripts'],
    seo: ['rankTracking', 'competitorAlerts']
  }
};
```

## Example Mode Transitions

### Market → Sales Mode
- Smooth fade-in of sales badges
- Revenue opportunity highlights pulse once
- "How to Sell This" drawer becomes available
- Data stays in place, context enriches

### Market → SEO Mode  
- Search volume badges slide in from right
- Keyword difficulty colors fade into heat map
- "Optimize for Search" drawer becomes available
- SERP preview appears on procedure hover

## Design Principles

1. **Non-Invasive**: Modes add layers, don't replace
2. **Instant Value**: Each mode immediately useful
3. **Consistent Core**: Market data always visible
4. **Progressive Disclosure**: Details on demand
5. **Performance**: Lazy load mode-specific data

## Quick Implementation Win

Start with visual indicators only:
```tsx
// Phase 1: Just badges
{mode === 'seo' && procedure.searchVolume > 1000 && (
  <Badge variant="success">
    {procedure.searchVolume.toLocaleString()} searches/mo
  </Badge>
)}

{mode === 'sales' && procedure.revenueOpportunity > 100000 && (
  <Badge variant="gold">
    ${procedure.revenueOpportunity / 1000}K opportunity
  </Badge>
)}
```

This keeps your beautiful market data front and center while giving power users the tools they need!