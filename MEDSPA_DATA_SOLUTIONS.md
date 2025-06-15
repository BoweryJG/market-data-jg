# MedSpa Data Collection Solutions

## Current Status

### Successfully Collected:
- **9,136 healthcare providers** in NYC & Miami metro areas
  - 7,635 Dentists
  - 1,066 Dermatologists  
  - 433 Plastic Surgeons
- **31 MedSpas** found through NPI (significant undercount)

### The MedSpa Challenge:
Only 31 medspas found via NPI because:
1. Most register under generic names without "medspa" keywords
2. Many operate under individual provider licenses
3. Cash-based practices don't always need organizational NPIs
4. Use varied names: "wellness center", "aesthetic clinic", etc.

## Comprehensive MedSpa Discovery Solutions

### Solution 1: Google Maps API Scraper
```javascript
// Pseudocode for Google Maps scraping
const searchQueries = [
  "medical spa", "medspa", "botox clinic", 
  "aesthetic center", "laser clinic"
];

for (const city of ["New York", "Miami"]) {
  for (const query of searchQueries) {
    results = googleMapsAPI.search(`${query} in ${city}`);
    // Extract: name, address, phone, website, services
  }
}
```

### Solution 2: Multi-Source Web Scraping

#### Priority Sources:
1. **Groupon** - Most medspas advertise here
   - Search: "medical spa deals [city]"
   - Extract: Business name, location, services, prices

2. **Yelp** - Has dedicated medspa category
   - Category: "medspas"
   - Extract: All businesses with reviews

3. **RealSelf** - Aesthetic procedure marketplace
   - Provider directory by location
   - Includes services offered

4. **Instagram** - Social media mining
   - Hashtags: #medspa[city] #botox[city]
   - Geo-tagged business accounts

### Solution 3: Business Registration Mining

#### Approach:
1. Get list of all dermatologists/plastic surgeons from NPI
2. Search business registrations for their names
3. Cross-reference addresses with commercial properties
4. Identify multiple providers at same address (likely medspa)

### Solution 4: Franchise/Chain Identification

#### Major MedSpa Chains to Track:
- Ideal Image
- LaserAway  
- Skin Laundry
- SEV Laser
- European Wax Center (some locations)
- Amazing Lash Studio (some offer medical services)

### Implementation Roadmap

#### Phase 1: Quick Win (1-2 days)
- Scrape Groupon for all medspa deals in NY/FL
- Extract Yelp medspa category listings
- Estimated yield: 500-1,000 medspas

#### Phase 2: Comprehensive (1 week)
- Google Maps API implementation
- Instagram business account scraping
- Cross-reference with NPI data
- Estimated yield: 1,500-2,000 medspas

#### Phase 3: Enrichment (ongoing)
- Add service menus
- Pricing information
- Provider credentials
- Technology/equipment used

## Expected Results

### Conservative Estimate:
- **New York State**: 800-1,200 medspas
- **Florida**: 1,000-1,500 medspas
- **Data completeness**: 85-90% market coverage

### Data Schema for MedSpas:
```json
{
  "business_name": "",
  "locations": [],
  "services": {
    "injectables": ["botox", "filler"],
    "laser": ["hair removal", "skin resurfacing"],
    "body": ["coolsculpting", "emsculpt"],
    "wellness": ["iv therapy", "hormone therapy"]
  },
  "providers": {
    "medical_director": "",
    "nurse_practitioners": [],
    "aestheticians": []
  },
  "price_range": "$-$$$$",
  "insurance_accepted": false,
  "established_year": "",
  "certifications": [],
  "technology_brands": [],
  "social_media": {},
  "reviews": {
    "google": 0,
    "yelp": 0,
    "realself": 0
  }
}
```

## Quick Start Scripts

### 1. Groupon Scraper (Node.js)
```javascript
// See scripts/groupon_medspa_scraper.js
```

### 2. Yelp API Integration
```javascript
// See scripts/yelp_medspa_finder.js
```

### 3. Data Fusion Pipeline
```javascript
// See scripts/medspa_data_fusion.js
```

## ROI Analysis

### Current NPI-Only Approach:
- 31 medspas found
- Missing ~98% of market
- Limited business intelligence

### Multi-Source Approach:
- 2,000+ medspas expected
- Rich data including services, pricing
- Competitive intelligence on chains/franchises
- Market penetration analysis possible

## Next Steps

1. **Immediate**: Run Groupon scraper for quick wins
2. **This Week**: Implement Yelp and Google Maps scrapers
3. **Next Week**: Build data fusion and deduplication
4. **Ongoing**: Monthly updates and new source additions