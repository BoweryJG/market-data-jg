import fetch from 'node-fetch';
import fs from 'fs/promises';
import { stringify } from 'csv-stringify/sync';

// Target HIGH-VALUE areas only - where the money is
class HighValueCollector {
  constructor() {
    this.baseUrl = 'https://npiregistry.cms.hhs.gov/api/';
    this.practices = new Map(); // Group by address
    this.stats = {
      totalProviders: 0,
      totalPractices: 0,
      apiCalls: 0
    };
  }

  // Wealthy zip codes = buyers with budgets
  getHighValueZipCodes() {
    return {
      NY: {
        // Manhattan Elite
        '10021': 'Upper East Side',
        '10028': 'Upper East Side', 
        '10075': 'Lenox Hill',
        '10022': 'Midtown East',
        '10023': 'Upper West Side',
        '10024': 'Upper West Side',
        
        // Long Island Gold Coast
        '11568': 'Old Westbury',
        '11545': 'Glen Head',
        '11030': 'Manhasset',
        '11576': 'Roslyn',
        '11024': 'Great Neck',
        
        // Westchester Wealth
        '10583': 'Scarsdale',
        '10514': 'Chappaqua',
        '10528': 'Harrison',
        '10573': 'Port Chester/Rye'
      },
      FL: {
        // Miami Luxury
        '33139': 'Miami Beach',
        '33140': 'Miami Beach North',
        '33154': 'Bal Harbour',
        '33156': 'Coral Gables',
        '33143': 'Coral Gables',
        '33146': 'Coral Gables',
        
        // Palm Beach Prestige
        '33480': 'Palm Beach',
        '33483': 'Delray Beach',
        '33432': 'Boca Raton',
        '33496': 'Boca Raton West',
        
        // Naples & Ft Lauderdale
        '34102': 'Naples',
        '34103': 'Naples',
        '33301': 'Fort Lauderdale',
        '33062': 'Pompano Beach'
      }
    };
  }

  // Search by zip code
  async searchByZip(zip, state, skip = 0) {
    const params = new URLSearchParams({
      version: '2.1',
      postal_code: zip,
      state: state,
      limit: 200,
      skip: skip
    });

    try {
      this.stats.apiCalls++;
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      return {
        results: data.results || [],
        count: data.result_count || 0
      };
    } catch (error) {
      console.error(`Error searching ${zip}:`, error.message);
      return { results: [], count: 0 };
    }
  }

  // Process and group providers by practice
  processProvider(npiData) {
    const basic = npiData.basic || {};
    const addr = npiData.addresses?.find(a => a.address_purpose === 'LOCATION') || {};
    const tax = npiData.taxonomies?.find(t => t.primary) || {};
    
    // Only include our target specialties
    const targetTaxonomies = [
      'dent', 'dermat', 'plastic', 'aesthetic', 'cosmetic', 
      'facial', 'medspa', 'spa', 'wellness'
    ];
    
    const taxonomyLower = (tax.desc || '').toLowerCase();
    const isTarget = targetTaxonomies.some(t => taxonomyLower.includes(t));
    
    if (!isTarget) return null;
    
    return {
      npi: npiData.number,
      name: basic.organization_name || `${basic.first_name} ${basic.last_name}`,
      firstName: basic.first_name,
      lastName: basic.last_name,
      credential: basic.credential,
      address: addr.address_1,
      city: addr.city,
      state: addr.state,
      zip: addr.postal_code,
      phone: addr.telephone_number,
      taxonomy: tax.desc,
      isPractice: !!basic.organization_name
    };
  }

  // Group providers into practices
  groupIntoPractices(providers) {
    providers.forEach(provider => {
      if (!provider) return;
      
      // Create unique key for practice location
      const practiceKey = `${provider.address}_${provider.city}_${provider.zip}`;
      
      if (!this.practices.has(practiceKey)) {
        this.practices.set(practiceKey, {
          address: provider.address,
          city: provider.city,
          state: provider.state,
          zip: provider.zip,
          providers: [],
          specialties: new Set(),
          phones: new Set(),
          isPracticeName: false,
          practiceName: null,
          estimatedSize: 'small'
        });
      }
      
      const practice = this.practices.get(practiceKey);
      practice.providers.push(provider);
      practice.specialties.add(provider.taxonomy);
      if (provider.phone) practice.phones.add(provider.phone);
      
      // If any provider has an organization name, use it
      if (provider.isPractice && provider.name) {
        practice.isPracticeName = true;
        practice.practiceName = provider.name;
      }
      
      // Estimate practice size
      if (practice.providers.length >= 10) practice.estimatedSize = 'large';
      else if (practice.providers.length >= 5) practice.estimatedSize = 'medium';
    });
  }

  // Collect all high-value areas
  async collect() {
    console.log('🎯 HIGH-VALUE AREA COLLECTOR');
    console.log('==========================\n');
    console.log('Targeting wealthy zip codes with budget for premium services\n');
    
    const zipCodes = this.getHighValueZipCodes();
    
    for (const [state, zips] of Object.entries(zipCodes)) {
      console.log(`\n📍 Collecting ${state} High-Value Areas:`);
      
      for (const [zip, area] of Object.entries(zips)) {
        console.log(`\n  ${area} (${zip}):`);
        
        let skip = 0;
        let hasMore = true;
        let zipTotal = 0;
        
        while (hasMore) {
          const { results, count } = await this.searchByZip(zip, state, skip);
          
          if (results.length === 0) {
            hasMore = false;
          } else {
            // Process each provider
            const processed = results
              .map(r => this.processProvider(r))
              .filter(p => p !== null);
            
            this.groupIntoPractices(processed);
            
            zipTotal += processed.length;
            this.stats.totalProviders += processed.length;
            
            skip += results.length;
            hasMore = results.length === 200 && skip < count;
          }
          
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`    ✓ Found ${zipTotal} target providers`);
      }
    }
    
    this.stats.totalPractices = this.practices.size;
    
    // Save results
    await this.saveResults();
    
    // Display summary
    this.displaySummary();
  }

  // Save as both providers and practices
  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save practices (grouped data)
    const practicesArray = Array.from(this.practices.values()).map(p => ({
      practiceName: p.practiceName || `Practice at ${p.address}`,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      providerCount: p.providers.length,
      specialties: Array.from(p.specialties).join('; '),
      phones: Array.from(p.phones).join('; '),
      estimatedSize: p.estimatedSize,
      isNamedPractice: p.isPracticeName
    }));
    
    const practicesCsv = stringify(practicesArray, {
      header: true,
      columns: [
        'practiceName', 'address', 'city', 'state', 'zip',
        'providerCount', 'specialties', 'phones', 'estimatedSize', 'isNamedPractice'
      ]
    });
    
    await fs.writeFile(`high_value_practices_${timestamp}.csv`, practicesCsv);
    
    // Also save flat provider list
    const allProviders = [];
    this.practices.forEach(practice => {
      allProviders.push(...practice.providers);
    });
    
    const providersCsv = stringify(allProviders, {
      header: true,
      columns: ['npi', 'name', 'credential', 'address', 'city', 'state', 'zip', 'phone', 'taxonomy']
    });
    
    await fs.writeFile(`high_value_providers_${timestamp}.csv`, providersCsv);
    
    console.log(`\n💾 Saved ${this.stats.totalPractices} practices and ${this.stats.totalProviders} providers`);
  }

  // Display summary
  displaySummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 HIGH-VALUE COLLECTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total API Calls: ${this.stats.apiCalls}`);
    console.log(`Total Providers Found: ${this.stats.totalProviders}`);
    console.log(`Total Practices Identified: ${this.stats.totalPractices}`);
    console.log(`Average Providers per Practice: ${(this.stats.totalProviders / this.stats.totalPractices).toFixed(1)}`);
    
    // Show practice size distribution
    const sizes = { small: 0, medium: 0, large: 0 };
    this.practices.forEach(p => {
      sizes[p.estimatedSize]++;
    });
    
    console.log('\nPractice Sizes:');
    console.log(`  Large (10+ providers): ${sizes.large}`);
    console.log(`  Medium (5-9 providers): ${sizes.medium}`);
    console.log(`  Small (1-4 providers): ${sizes.small}`);
    
    console.log('\n✅ These are HIGH-VALUE practices in WEALTHY areas!');
    console.log('💰 They have budgets for premium equipment & services!');
  }
}

// Quick version - just top 5 zips per state
async function quickCollect() {
  console.log('⚡ QUICK HIGH-VALUE COLLECTION\n');
  console.log('Testing with just 5 zip codes per state...\n');
  
  const collector = new HighValueCollector();
  
  // Override with just a few zips for testing
  collector.getHighValueZipCodes = () => ({
    NY: {
      '10021': 'Upper East Side',
      '11024': 'Great Neck',
      '10583': 'Scarsdale'
    },
    FL: {
      '33139': 'Miami Beach',
      '33480': 'Palm Beach',
      '34102': 'Naples'
    }
  });
  
  await collector.collect();
}

// Run it
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--quick') {
    await quickCollect();
  } else {
    const collector = new HighValueCollector();
    await collector.collect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HighValueCollector;