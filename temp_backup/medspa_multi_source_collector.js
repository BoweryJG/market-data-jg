import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Medical spa indicators and keywords
const MEDSPA_INDICATORS = {
  businessNames: [
    'med spa', 'medspa', 'medical spa', 'medi spa', 'medi-spa',
    'aesthetic center', 'aesthetics', 'cosmetic center', 'laser center',
    'skin center', 'skin clinic', 'wellness center', 'rejuvenation',
    'beauty clinic', 'anti-aging', 'laser clinic'
  ],
  services: [
    'botox', 'dysport', 'xeomin', 'jeuveau', 'neurotoxin',
    'filler', 'juvederm', 'restylane', 'sculptra', 'radiesse',
    'laser', 'ipl', 'coolsculpting', 'emsculpt', 'ultherapy',
    'microneedling', 'chemical peel', 'dermaplaning', 'hydrafacial',
    'prp', 'vampire facial', 'kybella', 'pdo thread', 'morpheus8'
  ],
  equipment: [
    'candela', 'cynosure', 'lumenis', 'syneron', 'alma',
    'cutera', 'sciton', 'venus concept', 'btl', 'allergan'
  ]
};

// Search patterns for different platforms
const SEARCH_QUERIES = {
  google: [
    'medical spa near {location}',
    'med spa {location}',
    'botox clinic {location}',
    'laser hair removal {location}',
    'aesthetic center {location}',
    'cosmetic clinic {location}'
  ],
  yelp: {
    categories: [
      'medicalspas',
      'skincare',
      'laserhairremoval',
      'cosmeticdentists'
    ],
    terms: ['medical spa', 'botox', 'laser treatment']
  },
  instagram: [
    '#{city}medspa',
    '#{city}botox',
    '#{city}aesthetics',
    '#{city}skincare',
    '#{city}laser'
  ]
};

// Main collection class
class MedSpaCollector {
  constructor() {
    this.results = new Map(); // Use map to prevent duplicates
    this.stats = {
      sourceCounts: {},
      totalFound: 0,
      validated: 0,
      highConfidence: 0
    };
  }

  // Generate search locations for NY and FL
  getSearchLocations() {
    return {
      NY: [
        // NYC Boroughs
        { city: 'Manhattan', state: 'NY', neighborhoods: ['Upper East Side', 'Midtown', 'Chelsea', 'Tribeca', 'SoHo', 'Financial District'] },
        { city: 'Brooklyn', state: 'NY', neighborhoods: ['Park Slope', 'Williamsburg', 'DUMBO', 'Brooklyn Heights', 'Bay Ridge'] },
        { city: 'Queens', state: 'NY', neighborhoods: ['Astoria', 'Long Island City', 'Forest Hills', 'Flushing', 'Jackson Heights'] },
        { city: 'Bronx', state: 'NY', neighborhoods: ['Riverdale', 'Pelham Bay', 'Morris Park'] },
        { city: 'Staten Island', state: 'NY', neighborhoods: ['St. George', 'Great Kills'] },
        // Long Island
        { city: 'Great Neck', state: 'NY' },
        { city: 'Manhasset', state: 'NY' },
        { city: 'Garden City', state: 'NY' },
        { city: 'Huntington', state: 'NY' },
        // Westchester
        { city: 'White Plains', state: 'NY' },
        { city: 'Scarsdale', state: 'NY' },
        { city: 'Greenwich', state: 'NY' }
      ],
      FL: [
        // Miami Area
        { city: 'Miami Beach', state: 'FL', neighborhoods: ['South Beach', 'Mid-Beach', 'North Beach'] },
        { city: 'Miami', state: 'FL', neighborhoods: ['Brickell', 'Coral Gables', 'Coconut Grove', 'Aventura', 'Kendall'] },
        { city: 'Fort Lauderdale', state: 'FL', neighborhoods: ['Las Olas', 'Victoria Park', 'Wilton Manors'] },
        { city: 'Boca Raton', state: 'FL', neighborhoods: ['Downtown', 'Mizner Park', 'Royal Palm'] },
        { city: 'West Palm Beach', state: 'FL', neighborhoods: ['Downtown', 'Palm Beach', 'Wellington'] },
        // Other Major Cities
        { city: 'Naples', state: 'FL' },
        { city: 'Sarasota', state: 'FL' },
        { city: 'Tampa', state: 'FL', neighborhoods: ['Hyde Park', 'Westshore', 'Carrollwood'] },
        { city: 'Orlando', state: 'FL', neighborhoods: ['Winter Park', 'Dr. Phillips', 'Lake Nona'] },
        { city: 'Jacksonville', state: 'FL', neighborhoods: ['Riverside', 'San Marco', 'Ponte Vedra'] }
      ]
    };
  }

  // Validate if a business is likely a medical spa
  validateMedSpa(business) {
    let score = 0;
    const reasons = [];

    // Check business name
    const nameLower = business.name.toLowerCase();
    for (const indicator of MEDSPA_INDICATORS.businessNames) {
      if (nameLower.includes(indicator)) {
        score += 20;
        reasons.push(`Name contains '${indicator}'`);
        break;
      }
    }

    // Check services
    const servicesText = (business.services || []).join(' ').toLowerCase();
    const descriptionText = (business.description || '').toLowerCase();
    const combinedText = servicesText + ' ' + descriptionText;
    
    let serviceMatches = 0;
    for (const service of MEDSPA_INDICATORS.services) {
      if (combinedText.includes(service)) {
        serviceMatches++;
        score += 15;
      }
    }
    if (serviceMatches > 0) {
      reasons.push(`Offers ${serviceMatches} medical spa services`);
    }

    // Check for medical oversight
    if (business.medicalDirector || combinedText.includes('md') || 
        combinedText.includes('medical director') || combinedText.includes('physician')) {
      score += 25;
      reasons.push('Has medical oversight');
    }

    // Check categories
    const categories = (business.categories || []).map(c => c.toLowerCase());
    if (categories.some(c => c.includes('medical') || c.includes('spa') || 
                            c.includes('laser') || c.includes('skin'))) {
      score += 20;
      reasons.push('Listed in medical spa category');
    }

    // Negative indicators (exclude these)
    const excludeTerms = ['salon', 'barber', 'nail', 'massage only', 'hair'];
    if (excludeTerms.some(term => nameLower.includes(term))) {
      score -= 50;
      reasons.push('Appears to be a beauty salon');
    }

    return {
      isLikelyMedSpa: score >= 50,
      confidence: score > 80 ? 'high' : score > 50 ? 'medium' : 'low',
      score,
      reasons
    };
  }

  // Mock function - in reality, this would use Google Places API
  async searchGooglePlaces(location, query) {
    console.log(`🔍 Searching Google Places: ${query} in ${location.city}, ${location.state}`);
    // In production, implement actual Google Places API call
    // For now, return mock data structure
    return [];
  }

  // Mock function - in reality, this would use Yelp Fusion API
  async searchYelp(location, category) {
    console.log(`🔍 Searching Yelp: ${category} in ${location.city}, ${location.state}`);
    // In production, implement actual Yelp API call
    return [];
  }

  // Process and merge a new business record
  addBusiness(business, source) {
    const key = this.generateBusinessKey(business);
    
    if (this.results.has(key)) {
      // Merge with existing record
      const existing = this.results.get(key);
      existing.sources.push(source);
      existing.lastUpdated = new Date().toISOString();
      
      // Merge additional data
      if (business.phone && !existing.phone) existing.phone = business.phone;
      if (business.website && !existing.website) existing.website = business.website;
      if (business.services) {
        existing.services = [...new Set([...(existing.services || []), ...business.services])];
      }
    } else {
      // Add new record
      const validation = this.validateMedSpa(business);
      
      if (validation.isLikelyMedSpa) {
        this.results.set(key, {
          ...business,
          id: key,
          sources: [source],
          validation,
          collectedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        
        this.stats.totalFound++;
        if (validation.confidence === 'high') this.stats.highConfidence++;
      }
    }
    
    // Update source counts
    this.stats.sourceCounts[source] = (this.stats.sourceCounts[source] || 0) + 1;
  }

  // Generate unique key for deduplication
  generateBusinessKey(business) {
    // Use combination of name and address for uniqueness
    const name = business.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const address = (business.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const phone = (business.phone || '').replace(/[^0-9]/g, '');
    
    return `${name}_${address}_${phone}`.substring(0, 100);
  }

  // Main collection orchestrator
  async collectAll() {
    console.log('🚀 Starting medical spa collection for NY and FL\n');
    
    const locations = this.getSearchLocations();
    const allLocations = [...locations.NY, ...locations.FL];
    
    for (const location of allLocations) {
      console.log(`\n📍 Processing ${location.city}, ${location.state}`);
      
      // Search Google Places
      for (const queryTemplate of SEARCH_QUERIES.google) {
        const query = queryTemplate.replace('{location}', location.city);
        const results = await this.searchGooglePlaces(location, query);
        results.forEach(biz => this.addBusiness(biz, 'google'));
      }
      
      // Search Yelp
      for (const category of SEARCH_QUERIES.yelp.categories) {
        const results = await this.searchYelp(location, category);
        results.forEach(biz => this.addBusiness(biz, 'yelp'));
      }
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return this.generateReport();
  }

  // Generate collection report
  generateReport() {
    const results = Array.from(this.results.values());
    
    const report = {
      summary: {
        totalMedSpasFound: results.length,
        byState: {
          NY: results.filter(r => r.state === 'NY').length,
          FL: results.filter(r => r.state === 'FL').length
        },
        byConfidence: {
          high: results.filter(r => r.validation.confidence === 'high').length,
          medium: results.filter(r => r.validation.confidence === 'medium').length,
          low: results.filter(r => r.validation.confidence === 'low').length
        },
        sources: this.stats.sourceCounts
      },
      medspas: results.sort((a, b) => b.validation.score - a.validation.score)
    };
    
    return report;
  }

  // Save results to file and database
  async saveResults(report) {
    // Save to JSON file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `medspa_collection_${timestamp}.json`;
    await fs.writeFile(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Results saved to ${filename}`);
    
    // Save to Supabase
    if (report.medspas.length > 0) {
      console.log('\n📤 Uploading to Supabase...');
      
      // Transform for database
      const dbRecords = report.medspas.map(spa => ({
        provider_name: spa.name,
        practice_name: spa.name,
        address: spa.address,
        city: spa.city,
        state: spa.state,
        zip_code: spa.zipCode,
        phone: spa.phone,
        website: spa.website,
        email: spa.email,
        industry: 'aesthetic',
        provider_type: 'spa',
        ownership_type: 'independent',
        specialties: ['medical spa'],
        procedures_offered: spa.services || [],
        data_source: spa.sources.join(','),
        verified: spa.validation.confidence === 'high',
        notes: JSON.stringify({
          validation: spa.validation,
          sources: spa.sources,
          categories: spa.categories
        })
      }));
      
      // Upload in batches
      const batchSize = 50;
      for (let i = 0; i < dbRecords.length; i += batchSize) {
        const batch = dbRecords.slice(i, i + batchSize);
        const { error } = await supabase
          .from('provider_locations')
          .insert(batch);
          
        if (error) {
          console.error(`Error uploading batch: ${error.message}`);
        }
      }
      
      console.log('✅ Upload complete');
    }
    
    return filename;
  }
}

// Main execution
async function main() {
  const collector = new MedSpaCollector();
  
  try {
    // Note: This is a framework. To make it work, you need to:
    // 1. Implement actual API calls (Google Places, Yelp, etc.)
    // 2. Add web scraping functions
    // 3. Set up API credentials
    
    console.log('⚠️  This is a framework script. To use it:');
    console.log('1. Set up Google Places API key');
    console.log('2. Set up Yelp Fusion API key');
    console.log('3. Implement the search functions');
    console.log('4. Add web scraping capabilities\n');
    
    // For demonstration, let's show the structure
    const locations = collector.getSearchLocations();
    console.log(`📍 Will search ${locations.NY.length} NY locations`);
    console.log(`📍 Will search ${locations.FL.length} FL locations`);
    console.log(`\n🔍 Search queries configured for:`);
    console.log(`- Google: ${SEARCH_QUERIES.google.length} query patterns`);
    console.log(`- Yelp: ${SEARCH_QUERIES.yelp.categories.length} categories`);
    console.log(`- Instagram: ${SEARCH_QUERIES.instagram.length} hashtag patterns`);
    
    // Uncomment when APIs are implemented:
    // const report = await collector.collectAll();
    // await collector.saveResults(report);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MedSpaCollector, MEDSPA_INDICATORS, SEARCH_QUERIES };