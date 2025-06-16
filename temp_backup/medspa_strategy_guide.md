# MedSpa Data Collection Strategy Guide

## The Challenge
MedSpas are difficult to capture through NPI data alone because:
- Many operate under generic business names without "medspa" keywords
- They register under individual provider NPIs rather than organization NPIs
- They use varied terminology: wellness center, aesthetic clinic, rejuvenation center, etc.
- Many are cash-only practices that don't need extensive insurance credentials

## Current Results
- NPI search found only 31 medspas in NY & FL combined
- Actual market size is likely 1,000+ medspas in these two states
- Need multi-source approach to capture complete market

## Comprehensive MedSpa Discovery Strategy

### 1. Enhanced NPI Mining
```javascript
// Search for organizations owned by aesthetic providers
const aestheticProviderNPIs = [/* dermatologists, plastic surgeons */];
// Cross-reference their practice locations
// Many medspas operate under the provider's medical practice
```

### 2. Web Scraping Sources (Priority Order)

#### A. Google Maps/Places API
- Search: "medical spa near [city]", "medspa near [city]"
- Benefits: Most complete, includes reviews, services, photos
- Data: Name, address, phone, website, hours, reviews

#### B. Business Directories
1. **Yelp** - Has dedicated "Medical Spas" category
2. **Groupon** - Many medspas use for promotions
3. **RealSelf** - Aesthetic procedure directory
4. **American Med Spa Association** - Industry directory
5. **Spa Finder** - Wellness/spa directory
6. **Vagaro/Mindbody** - Booking platforms

#### C. Social Media
- Instagram: #medspa #medspanyc #medspamiami
- Facebook Business Pages
- LinkedIn company search

#### D. State Registrations
- State medical board databases
- Business entity registrations
- Professional licensing boards

### 3. Identification Patterns

#### Business Name Patterns
```
[Name] + Medical Spa/MedSpa/Med Spa
[Name] + Aesthetics/Aesthetic Center
[Name] + Wellness/Wellness Center  
[Name] + Rejuvenation/Anti-Aging
[Location] + Laser/Laser Center
[Doctor Name] + MD/Dermatology/Plastic Surgery
```

#### Service Keywords
- Injectables: Botox, Dysport, Filler, Juvederm
- Body: CoolSculpting, Emsculpt, Sculpsure
- Skin: Laser, IPL, Microneedling, Chemical Peel
- Wellness: IV Therapy, Hormone, Weight Loss

### 4. Data Enrichment Process

1. **Initial Collection**: Gather from all sources
2. **Deduplication**: Match by address/phone/name
3. **Verification**: 
   - Check state medical board
   - Verify medical director
   - Confirm services offered
4. **Enrichment**:
   - Add provider credentials
   - Services offered
   - Price ranges
   - Insurance acceptance
   - Technology/equipment used

### 5. Implementation Plan

#### Phase 1: Enhanced NPI Analysis
- Mine existing NPI data for hidden medspas
- Search by provider addresses
- Look for multiple providers at same location

#### Phase 2: Web Scraping
- Google Maps API implementation
- Yelp scraper
- Business directory aggregation

#### Phase 3: Data Fusion
- Combine all sources
- Deduplicate and verify
- Create confidence scoring

#### Phase 4: Continuous Updates
- Monthly refresh of data
- New business monitoring
- Closure tracking

## Expected Results
- 500-1,000 medspas per state (major states)
- 90%+ coverage of active medspas
- Rich data including services, providers, pricing

## Technical Implementation

### Google Maps Scraper Example
```javascript
async function scrapeGoogleMaps(query, location) {
  // Use Puppeteer or Playwright
  // Search for query in location
  // Extract business cards
  // Get details for each result
}
```

### Yelp Scraper Example
```javascript
async function scrapeYelp(category, location) {
  // Navigate to medical spas category
  // Iterate through pages
  // Extract business information
}
```

### Data Schema
```javascript
{
  businessName: '',
  dba: '',
  address: {},
  phone: '',
  website: '',
  email: '',
  medicalDirector: '',
  providers: [],
  services: [],
  technology: [],
  insuranceAccepted: false,
  hours: {},
  established: '',
  socialMedia: {},
  reviews: {},
  certifications: [],
  priceRange: '',
  dataSource: [],
  verificationStatus: '',
  lastUpdated: ''
}
```

## Next Steps
1. Implement Google Maps scraper
2. Create Yelp category scraper
3. Build data fusion pipeline
4. Develop verification system
5. Create update monitoring