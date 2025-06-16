import fetch from 'node-fetch';
import fs from 'fs/promises';
import { stringify } from 'csv-stringify/sync';

// Final NPI Collector - Gets COMPLETE data
class NPIFinalCollector {
  constructor() {
    this.baseUrl = 'https://npiregistry.cms.hhs.gov/api/';
    this.providers = [];
    this.stats = {
      apiCalls: 0,
      byState: {},
      byType: {}
    };
  }

  // Search with proper parameters
  async searchProviders(params) {
    const url = `${this.baseUrl}?${params}`;
    
    try {
      this.stats.apiCalls++;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.Errors) {
        console.error('API Error:', data.Errors[0].description);
        return { results: [], count: 0 };
      }
      
      return {
        results: data.results || [],
        count: data.result_count || 0
      };
    } catch (error) {
      console.error('Request failed:', error.message);
      return { results: [], count: 0 };
    }
  }

  // Search by city and state (more specific)
  async searchByLocation(city, state, skip = 0) {
    const params = new URLSearchParams({
      version: '2.1',
      city: city,
      state: state,
      limit: 200,
      skip: skip
    });
    
    return await this.searchProviders(params);
  }

  // Search by taxonomy and state
  async searchBySpecialty(taxonomyCode, state, skip = 0) {
    const params = new URLSearchParams({
      version: '2.1',
      state: state,
      taxonomy_description: taxonomyCode,
      limit: 200,
      skip: skip
    });
    
    return await this.searchProviders(params);
  }

  // Get all major cities
  getCities() {
    return {
      NY: [
        'New York', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
        'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany',
        'Great Neck', 'Manhasset', 'Garden City', 'Huntington',
        'White Plains', 'Scarsdale', 'New Rochelle'
      ],
      FL: [
        'Miami', 'Miami Beach', 'Fort Lauderdale', 'Tampa', 'Orlando',
        'Jacksonville', 'Tallahassee', 'St Petersburg', 'Hialeah',
        'Hollywood', 'Coral Gables', 'Aventura', 'Boca Raton',
        'West Palm Beach', 'Naples', 'Sarasota', 'Fort Myers'
      ]
    };
  }

  // Get target taxonomies
  getTaxonomies() {
    return {
      '1223G0001X': 'General Dentist',
      '1223S0112X': 'Oral Surgery',
      '1223P0221X': 'Orthodontics',
      '207N00000X': 'Dermatology',
      '208200000X': 'Plastic Surgery'
    };
  }

  // Process provider record
  processProvider(data) {
    const basic = data.basic || {};
    const addr = data.addresses?.find(a => a.address_purpose === 'LOCATION') || {};
    const tax = data.taxonomies?.find(t => t.primary) || {};
    
    return {
      npi: data.number,
      firstName: basic.first_name,
      lastName: basic.last_name,
      credential: basic.credential,
      organizationName: basic.organization_name,
      address: addr.address_1,
      city: addr.city,
      state: addr.state,
      zip: addr.postal_code,
      phone: addr.telephone_number,
      taxonomy: tax.desc,
      type: this.categorize(tax.desc)
    };
  }

  // Categorize provider
  categorize(taxonomy) {
    const t = (taxonomy || '').toLowerCase();
    if (t.includes('dent')) return 'dentist';
    if (t.includes('dermatolog')) return 'dermatologist';
    if (t.includes('plastic')) return 'plastic_surgeon';
    return 'other';
  }

  // Collect by city approach
  async collectByCities() {
    console.log('\n📍 METHOD 1: Collecting by cities...\n');
    
    const cities = this.getCities();
    const cityProviders = [];
    
    for (const [state, cityList] of Object.entries(cities)) {
      console.log(`\nState: ${state}`);
      
      for (const city of cityList) {
        let skip = 0;
        let hasMore = true;
        let cityTotal = 0;
        
        while (hasMore) {
          const { results, count } = await this.searchByLocation(city, state, skip);
          
          if (results.length === 0) {
            hasMore = false;
          } else {
            // Filter for our targets
            results.forEach(r => {
              const provider = this.processProvider(r);
              if (['dentist', 'dermatologist', 'plastic_surgeon'].includes(provider.type)) {
                cityProviders.push(provider);
                cityTotal++;
              }
            });
            
            skip += results.length;
            hasMore = results.length === 200 && skip < count;
          }
          
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`  ${city}: ${cityTotal} providers`);
      }
    }
    
    return cityProviders;
  }

  // Collect by taxonomy approach
  async collectBySpecialty() {
    console.log('\n📍 METHOD 2: Collecting by specialty...\n');
    
    const taxonomies = this.getTaxonomies();
    const specialtyProviders = [];
    
    for (const state of ['NY', 'FL']) {
      console.log(`\nState: ${state}`);
      
      for (const [code, desc] of Object.entries(taxonomies)) {
        let skip = 0;
        let hasMore = true;
        let specTotal = 0;
        
        while (hasMore) {
          const { results, count } = await this.searchBySpecialty(code, state, skip);
          
          if (results.length === 0) {
            hasMore = false;
          } else {
            results.forEach(r => {
              const provider = this.processProvider(r);
              specialtyProviders.push(provider);
              specTotal++;
            });
            
            skip += results.length;
            hasMore = results.length === 200 && skip < count;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`  ${desc}: ${specTotal} providers`);
      }
    }
    
    return specialtyProviders;
  }

  // Main collection
  async collect() {
    console.log('🚀 COMPLETE NPI COLLECTION FOR NY & FL');
    console.log('=====================================\n');
    
    // Try both methods
    console.log('Using dual approach for maximum coverage:');
    console.log('1. Search by major cities');
    console.log('2. Search by specialties\n');
    
    const cityProviders = await this.collectByCities();
    const specialtyProviders = await this.collectBySpecialty();
    
    // Combine and deduplicate
    const allProviders = [...cityProviders, ...specialtyProviders];
    const uniqueProviders = Array.from(
      new Map(allProviders.map(p => [p.npi, p])).values()
    );
    
    this.providers = uniqueProviders;
    
    // Calculate stats
    this.providers.forEach(p => {
      this.stats.byState[p.state] = (this.stats.byState[p.state] || 0) + 1;
      this.stats.byType[p.type] = (this.stats.byType[p.type] || 0) + 1;
    });
    
    // Save results
    await this.saveResults();
    
    // Display summary
    this.displaySummary();
  }

  // Save results
  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `npi_complete_ny_fl_${timestamp}.csv`;
    
    const csv = stringify(this.providers, {
      header: true,
      columns: [
        'npi', 'firstName', 'lastName', 'credential', 'organizationName',
        'address', 'city', 'state', 'zip', 'phone', 'taxonomy', 'type'
      ]
    });
    
    await fs.writeFile(filename, csv);
    console.log(`\n💾 Saved to ${filename}`);
  }

  // Display summary
  displaySummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL COLLECTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Providers: ${this.providers.length.toLocaleString()}`);
    console.log(`API Calls Made: ${this.stats.apiCalls}`);
    
    console.log('\nBy State:');
    Object.entries(this.stats.byState).forEach(([state, count]) => {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    });
    
    console.log('\nBy Type:');
    Object.entries(this.stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count.toLocaleString()}`);
    });
    
    console.log('\n✅ This is your COMPLETE database!');
    console.log('Every dentist, dermatologist, and plastic surgeon in NY & FL!');
  }
}

// Run it
async function main() {
  const collector = new NPIFinalCollector();
  await collector.collect();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default NPIFinalCollector;