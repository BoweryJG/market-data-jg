# Medical Spa Data Collection Strategy for NY & FL

## The Challenge
Medical spas are businesses, not individual providers. NPI registry tracks doctors, not the businesses they work for. A medspa typically has:
- A business name (e.g., "Glow Aesthetic Center")
- A medical director with an NPI number
- Business owner(s) who may not be medical professionals
- Multiple service providers (nurses, aestheticians)

## Multi-Source Discovery Strategy

### 1. Business Directory Sources
**Primary Targets:**
- Google Maps/Places API - Search "medical spa near [city]"
- Yelp API - Categories: "medspas", "skincare", "laser hair removal"
- Yellow Pages - "Medical Spas" category
- Facebook Business Pages - Location-based searches
- Instagram Business Profiles - Hashtag searches (#nycmedspa, #miamimedspa)

**Key Search Terms:**
- "medical spa" / "med spa" / "medspa"
- "aesthetic center" / "aesthetics clinic"
- "laser clinic" / "laser center"
- "skin spa" / "skin clinic"
- "cosmetic clinic" / "cosmetic center"
- "botox clinic" / "injection spa"
- "wellness spa" + "botox" / "laser"

### 2. Industry-Specific Sources
**Medical Spa Associations:**
- American Med Spa Association (AmSpa) - Member directory
- International Medical Spa Association - Member listings
- State-specific associations (FL Medical Spa Society)

**Equipment/Product Dealer Lists:**
- Allergan (Botox) - Provider finder
- Galderma (Restylane) - Clinic locator
- CoolSculpting - Provider directory
- Candela/Cynosure - Laser clinic finder

**Insurance/Financing:**
- CareCredit provider directory
- PatientFi partner clinics
- Alphaeon credit providers

### 3. Web Scraping Targets
**Review Sites:**
- RealSelf.com - Provider directory
- Groupon - "Beauty & Spas" → Medical treatments
- ClassPass - Medical spa services
- Vagaro/MindBody - Appointment booking platforms

**Local Directories:**
- Citysearch
- Foursquare
- Chamber of Commerce listings
- BBB accredited businesses

### 4. Social Media Mining
**Instagram:**
- Geotag searches at luxury areas
- Hashtag combinations: #[city]medspa #[city]botox
- Influencer partnerships/tags

**Facebook:**
- Local business pages
- Community group recommendations
- Facebook Marketplace ads

**TikTok:**
- Location-based content
- Treatment videos with clinic tags

### 5. Regulatory Databases
**State Licensing:**
- FL Dept of Health - Facility licenses
- NY State Education Dept - Business registrations
- Medical facility inspection records
- Electrology facility licenses

**Business Registrations:**
- Secretary of State corporate search
- DBA/Fictitious name registrations
- Business tax records

## Validation Criteria

### Must-Have Indicators:
1. **Medical Oversight**
   - Named medical director (MD, DO, NP, PA)
   - Medical license verification
   - State facility license (where required)

2. **Services Offered** (2+ required):
   - Botox/Dysport/neurotoxins
   - Dermal fillers
   - Laser treatments
   - Chemical peels
   - Microneedling
   - Body contouring (CoolSculpting, etc.)
   - IPL/photofacials
   - PRP treatments

3. **Business Indicators:**
   - Dedicated business location (not home-based)
   - Professional website
   - Online booking system
   - Business phone number
   - Pricing transparency

### Red Flags to Exclude:
- Day spas offering only massage/facials
- Hair salons with "add-on" services
- Dermatology offices (unless separate medspa division)
- Plastic surgery centers (unless separate medspa)
- Home-based practitioners
- Mobile-only services

## Data Points to Collect

### Essential Information:
```json
{
  "businessName": "",
  "dba": [], // Doing Business As names
  "addresses": [{
    "street": "",
    "city": "",
    "state": "",
    "zip": "",
    "isPrimary": true
  }],
  "phones": {
    "main": "",
    "booking": "",
    "text": ""
  },
  "website": "",
  "email": "",
  "socialMedia": {
    "instagram": "",
    "facebook": "",
    "tiktok": ""
  },
  "medicalDirector": {
    "name": "",
    "credentials": "",
    "npiNumber": "",
    "licenseNumber": ""
  },
  "ownership": {
    "type": "physician-owned|investor-owned|franchise",
    "parentCompany": "",
    "franchiseName": ""
  },
  "established": "",
  "employees": {
    "total": 0,
    "providers": 0,
    "nurses": 0
  }
}
```

### Service & Pricing Data:
```json
{
  "services": {
    "injectables": {
      "botox": { "available": true, "priceRange": "$10-14/unit" },
      "fillers": { "available": true, "brands": ["Juvederm", "Restylane"] }
    },
    "laser": {
      "hairRemoval": { "available": true, "equipment": ["Candela GentleMax"] },
      "skinResurfacing": { "available": true, "types": ["Fraxel", "CO2"] }
    },
    "bodyContouring": {
      "coolsculpting": { "available": true, "machines": 2 },
      "emsculpt": { "available": false }
    }
  },
  "equipment": [
    { "type": "laser", "brand": "Candela", "model": "GentleMax Pro" }
  ],
  "pricing": {
    "consultationFee": "$0-150",
    "membershipAvailable": true,
    "financingOptions": ["CareCredit", "PatientFi"]
  }
}
```

### Verification Status:
```json
{
  "verification": {
    "lastVerified": "2025-06-05",
    "verificationMethod": "phone|visit|website",
    "businessLicense": {
      "verified": true,
      "number": "xxx",
      "expiry": "2026-01-01"
    },
    "medicalLicense": {
      "verified": true,
      "state": "FL",
      "status": "active"
    },
    "insurance": {
      "liability": true,
      "malpractice": true
    }
  },
  "dataQuality": {
    "completeness": 0.85,
    "confidence": "high|medium|low",
    "sources": ["google", "yelp", "website", "phone"]
  }
}
```

## Collection Methodology

### Phase 1: Broad Discovery (Cast Wide Net)
1. **Google Maps Grid Search**
   - Divide NY/FL into grid squares
   - Search each grid for all target terms
   - Capture all potential matches

2. **Business Directory Sweep**
   - Systematically query each directory
   - Use multiple search terms
   - Save all results for validation

3. **Social Media Harvest**
   - Instagram location/hashtag scraping
   - Facebook business page searches
   - TikTok trending locations

### Phase 2: Validation & Enrichment
1. **Website Verification**
   - Confirm medical spa services
   - Extract medical director info
   - Identify service menu

2. **Phone Verification**
   - Call to confirm services
   - Ask about medical director
   - Verify address/hours

3. **Cross-Reference**
   - Match medical directors to NPI
   - Verify state licenses
   - Check BBB/reviews

### Phase 3: Data Fusion
1. **Deduplication**
   - Match by phone number
   - Match by address
   - Fuzzy match business names

2. **Merge Records**
   - Combine data from all sources
   - Prioritize verified information
   - Calculate confidence scores

3. **Fill Gaps**
   - Target specific missing data
   - Use specialized searches
   - Manual research for high-value targets

## Technical Implementation

### 1. Discovery Scripts
```javascript
// scripts/discover_medspas_google.js
// - Uses Google Maps API grid search
// - Exports raw results to JSON

// scripts/discover_medspas_yelp.js
// - Queries Yelp Fusion API
// - Filters by categories

// scripts/discover_medspas_social.js
// - Instagram/Facebook scraping
// - Hashtag and location based
```

### 2. Validation Pipeline
```javascript
// scripts/validate_medspas.js
// - Takes raw discoveries
// - Checks websites for keywords
// - Verifies medical services
// - Outputs validated set
```

### 3. Enrichment Tools
```javascript
// scripts/enrich_medspa_data.js
// - Adds medical director info
// - Finds NPI numbers
// - Gets state licenses
// - Collects equipment/services
```

### 4. Database Schema
```sql
-- Enhanced provider_locations table
ALTER TABLE provider_locations ADD COLUMN business_type VARCHAR(50);
ALTER TABLE provider_locations ADD COLUMN is_medical_spa BOOLEAN DEFAULT FALSE;
ALTER TABLE provider_locations ADD COLUMN medical_director_npi VARCHAR(20);
ALTER TABLE provider_locations ADD COLUMN franchise_affiliation VARCHAR(100);

-- New medical_spas table
CREATE TABLE medical_spas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  dba_names TEXT[],
  primary_address_id UUID REFERENCES addresses(id),
  medical_director_id UUID REFERENCES providers(id),
  ownership_type VARCHAR(50),
  parent_company VARCHAR(255),
  established_date DATE,
  employee_count INTEGER,
  provider_count INTEGER,
  services JSONB,
  equipment JSONB,
  certifications TEXT[],
  insurance_accepted BOOLEAN,
  financing_options TEXT[],
  website VARCHAR(255),
  social_media JSONB,
  verification_status JSONB,
  data_sources TEXT[],
  confidence_score DECIMAL(3,2),
  last_verified TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Execution Timeline

### Week 1: Infrastructure Setup
- Set up APIs (Google, Yelp, Facebook)
- Create scraping infrastructure
- Design database schema
- Build validation rules

### Week 2-3: Discovery Phase
- Run Google Maps grid search
- Execute Yelp/directory queries
- Perform social media collection
- Gather 1000+ potential locations

### Week 4: Validation & Enrichment
- Website verification pass
- Phone verification sampling
- License lookups
- NPI matching

### Week 5: Data Integration
- Deduplication
- Record merging
- Quality scoring
- Final database load

### Ongoing: Maintenance
- Monthly reverification
- New business monitoring
- Change detection
- Quality improvements

## Success Metrics

1. **Coverage**: 500+ verified medical spas in NY/FL
2. **Accuracy**: 95%+ correct business information
3. **Completeness**: 80%+ with medical director identified
4. **Freshness**: Updated within last 30 days

## Next Steps

1. Choose initial data sources to implement
2. Set up API access and scraping tools
3. Create validation ruleset
4. Build first collection script
5. Test on small geographic area first