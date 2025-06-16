import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Yelp API - FREE 5,000 calls per day
class YelpMedSpaFinder {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.YELP_API_KEY;
    this.baseUrl = 'https://api.yelp.com/v3/businesses/search';
    this.results = [];
  }

  // Search locations
  getSearchLocations() {
    return [
      // NY
      { location: 'Manhattan, NY', neighborhoods: ['Upper East Side', 'Midtown', 'Chelsea', 'Tribeca'] },
      { location: 'Brooklyn, NY' },
      { location: 'Great Neck, NY' },
      { location: 'Scarsdale, NY' },
      // FL
      { location: 'Miami Beach, FL' },
      { location: 'Coral Gables, FL' },
      { location: 'Boca Raton, FL' },
      { location: 'Fort Lauderdale, FL' },
      { location: 'Naples, FL' },
      { location: 'Palm Beach, FL' }
    ];
  }

  // Search Yelp
  async searchLocation(location, category = 'medspas') {
    const params = new URLSearchParams({
      location: location,
      categories: category,
      limit: 50,
      sort_by: 'rating'
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status}`);
      }

      const data = await response.json();
      return data.businesses || [];
    } catch (error) {
      console.error(`Error searching ${location}: ${error.message}`);
      return [];
    }
  }

  // Process all locations
  async findAllMedSpas() {
    console.log('🚀 Starting Yelp medical spa search...\n');
    
    const locations = this.getSearchLocations();
    const categories = ['medspas', 'skincare', 'laserhairremoval'];
    
    for (const loc of locations) {
      console.log(`📍 Searching ${loc.location}...`);
      
      for (const category of categories) {
        const businesses = await this.searchLocation(loc.location, category);
        
        // Filter for medical spas
        const medspas = businesses.filter(biz => {
          const name = biz.name.toLowerCase();
          const cats = biz.categories.map(c => c.alias).join(' ');
          
          return (
            cats.includes('medspa') ||
            cats.includes('skincare') ||
            cats.includes('laser') ||
            name.includes('medical spa') ||
            name.includes('med spa') ||
            name.includes('aesthetic')
          );
        });
        
        this.results.push(...medspas.map(biz => ({
          name: biz.name,
          address: biz.location.address1,
          city: biz.location.city,
          state: biz.location.state,
          zip: biz.location.zip_code,
          phone: biz.phone,
          rating: biz.rating,
          reviewCount: biz.review_count,
          categories: biz.categories.map(c => c.title),
          url: biz.url,
          coordinates: biz.coordinates
        })));
        
        console.log(`  ✅ Found ${medspas.length} in ${category}`);
        
        // Rate limit: 5 requests per second
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Deduplicate
    const unique = Array.from(
      new Map(this.results.map(item => [item.phone || item.name, item])).values()
    );
    
    console.log(`\n✅ Total found: ${unique.length} medical spas`);
    
    // Save results
    const filename = `yelp_medspas_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify({
      summary: {
        total: unique.length,
        byState: {
          NY: unique.filter(m => m.state === 'NY').length,
          FL: unique.filter(m => m.state === 'FL').length
        }
      },
      medspas: unique
    }, null, 2));
    
    console.log(`💾 Saved to ${filename}`);
    return unique;
  }
}

// Alternative: Use Google Search (via Serper MCP)
async function googleSearchMedSpas() {
  console.log('\n🔍 Alternative: Using Google Search for medical spas\n');
  
  const searches = [
    'medical spa Manhattan NYC phone address',
    'med spa Brooklyn NYC contact',
    'botox clinic Miami Beach FL',
    'aesthetic center Boca Raton FL',
    'laser hair removal Fort Lauderdale'
  ];
  
  console.log('Run these searches manually or via Serper API:');
  searches.forEach(s => console.log(`- ${s}`));
  
  console.log('\nThen extract business info from results.');
}

// Main
async function main() {
  console.log('🏥 Medical Spa Finder - No Blocking!\n');
  
  if (process.env.YELP_API_KEY) {
    const finder = new YelpMedSpaFinder();
    await finder.findAllMedSpas();
  } else {
    console.log('❌ No Yelp API key found.\n');
    console.log('To get FREE Yelp API access:');
    console.log('1. Go to https://www.yelp.com/developers');
    console.log('2. Create app (takes 2 minutes)');
    console.log('3. Add to .env: YELP_API_KEY=your_key_here\n');
    
    await googleSearchMedSpas();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default YelpMedSpaFinder;