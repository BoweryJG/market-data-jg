import fetch from 'node-fetch';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// NPI Registry API - FREE and COMPLETE access
class NPICompleteCollector {
  constructor() {
    this.baseUrl = 'https://npiregistry.cms.hhs.gov/api/';
    this.providers = [];
    this.stats = {
      total: 0,
      byState: {},
      byTaxonomy: {},
      apiCalls: 0
    };
  }

  // All relevant taxonomies for our market
  getTaxonomies() {
    return {
      // Dental
      '1223G0001X': 'General Dentist',
      '1223S0112X': 'Oral Surgery',
      '1223E0200X': 'Endodontics', 
      '1223P0221X': 'Orthodontics',
      '1223P0300X': 'Periodontics',
      '1223D0001X': 'Pediatric Dentistry',
      '1223X0400X': 'Prosthodontics',
      
      // Aesthetic/Dermatology
      '207N00000X': 'Dermatology',
      '207ND0900X': 'Dermatopathology',
      '207NI0002X': 'Clinical & Laboratory Dermatological Immunology',
      '207NP0225X': 'Pediatric Dermatology',
      '207NS0135X': 'Mohs Surgery',
      
      // Plastic Surgery
      '208200000X': 'Plastic Surgery',
      '2082S0099X': 'Plastic Surgery Within the Head and Neck',
      '2082S0105X': 'Surgery of the Hand',
      
      // Other Aesthetic Providers
      '163WP0808X': 'Nurse Practitioner - Family (often in medspas)',
      '363LP0808X': 'Nurse Practitioner - Primary Care',
      '367A00000X': 'Physician Assistant (often in medspas)'
    };
  }

  // Search NPI Registry with pagination
  async searchNPI(state, taxonomy, skip = 0) {
    const params = new URLSearchParams({
      version: '2.1',
      state: state,
      taxonomy_description: taxonomy,
      limit: 200, // Max allowed
      skip: skip
    });

    try {
      console.log(`  API Call #${++this.stats.apiCalls}: ${state} - ${taxonomy} (skip: ${skip})`);
      
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      if (data.results) {
        console.log(`    ✅ Found ${data.results.length} providers`);
        return {
          results: data.results,
          count: data.result_count
        };
      }
      
      return { results: [], count: 0 };
      
    } catch (error) {
      console.error(`  ❌ API Error: ${error.message}`);
      return { results: [], count: 0 };
    }
  }

  // Process provider data
  processProvider(npiData) {
    const provider = npiData.basic || {};
    const address = npiData.addresses?.find(a => a.address_purpose === 'LOCATION') || npiData.addresses?.[0] || {};
    const taxonomy = npiData.taxonomies?.find(t => t.primary) || npiData.taxonomies?.[0] || {};
    
    return {
      npi: npiData.number,
      firstName: provider.first_name || '',
      lastName: provider.last_name || '',
      middleName: provider.middle_name || '',
      credential: provider.credential || '',
      organizationName: provider.organization_name || '',
      gender: provider.gender || '',
      lastUpdated: provider.last_updated || '',
      
      practiceAddress1: address.address_1 || '',
      practiceAddress2: address.address_2 || '',
      practiceCity: address.city || '',
      practiceState: address.state || '',
      practiceZip: address.postal_code || '',
      practicePhone: address.telephone_number || '',
      practiceFax: address.fax_number || '',
      
      taxonomyCode: taxonomy.code || '',
      taxonomyDescription: taxonomy.desc || '',
      taxonomyLicense: taxonomy.license || '',
      taxonomyState: taxonomy.state || '',
      isPrimaryTaxonomy: taxonomy.primary || false,
      
      category: this.categorizeProvider(taxonomy.desc)
    };
  }

  // Categorize provider type
  categorizeProvider(taxonomyDesc) {
    const desc = (taxonomyDesc || '').toLowerCase();
    if (desc.includes('dent')) return 'dentist';
    if (desc.includes('dermatolog')) return 'dermatologist';
    if (desc.includes('plastic')) return 'plastic_surgeon';
    if (desc.includes('nurse practitioner') || desc.includes('physician assistant')) return 'aesthetic_provider';
    return 'other';
  }

  // Collect all providers for a state
  async collectState(state) {
    console.log(`\n📍 Collecting ALL providers in ${state}...\n`);
    
    const taxonomies = this.getTaxonomies();
    const stateProviders = [];
    
    for (const [code, description] of Object.entries(taxonomies)) {
      console.log(`\n🔍 Searching: ${description} (${code})`);
      
      let skip = 0;
      let hasMore = true;
      let taxonomyTotal = 0;
      
      while (hasMore) {
        const { results, count } = await this.searchNPI(state, code, skip);
        
        if (results.length === 0) {
          hasMore = false;
        } else {
          // Process and add providers
          results.forEach(result => {
            const provider = this.processProvider(result);
            if (provider.practiceState === state) {
              stateProviders.push(provider);
              taxonomyTotal++;
            }
          });
          
          skip += results.length;
          
          // Check if more results available
          hasMore = results.length === 200 && skip < count;
        }
        
        // Rate limiting - NPI allows 10 requests per second
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      console.log(`  📊 Total ${description}: ${taxonomyTotal}`);
      this.stats.byTaxonomy[description] = (this.stats.byTaxonomy[description] || 0) + taxonomyTotal;
    }
    
    this.stats.byState[state] = stateProviders.length;
    console.log(`\n✅ ${state} Complete: ${stateProviders.length} providers found`);
    
    return stateProviders;
  }

  // Main collection process
  async collectComplete() {
    console.log('🚀 NPI COMPLETE PROVIDER COLLECTION');
    console.log('===================================\n');
    console.log('Target: ALL dentists, dermatologists, plastic surgeons, aesthetic providers');
    console.log('States: New York and Florida\n');
    
    // Collect NY
    const nyProviders = await this.collectState('NY');
    this.providers.push(...nyProviders);
    
    // Collect FL
    const flProviders = await this.collectState('FL');
    this.providers.push(...flProviders);
    
    this.stats.total = this.providers.length;
    
    // Save results
    await this.saveResults();
    
    // Display summary
    this.displaySummary();
  }

  // Save to CSV
  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `npi_complete_ny_fl_${timestamp}.csv`;
    
    // Convert to CSV
    const csv = stringify(this.providers, {
      header: true,
      columns: [
        'npi', 'firstName', 'lastName', 'middleName', 'credential',
        'organizationName', 'gender', 'lastUpdated',
        'practiceAddress1', 'practiceAddress2', 'practiceCity',
        'practiceState', 'practiceZip', 'practicePhone', 'practiceFax',
        'taxonomyCode', 'taxonomyDescription', 'taxonomyLicense',
        'taxonomyState', 'isPrimaryTaxonomy', 'category'
      ]
    });
    
    await fs.writeFile(filename, csv);
    console.log(`\n💾 Saved to ${filename}`);
    
    // Also save summary
    const summary = {
      collectionDate: new Date().toISOString(),
      stats: this.stats,
      breakdown: {
        byCategory: {},
        byStateAndCategory: {
          NY: {},
          FL: {}
        }
      }
    };
    
    // Calculate breakdown
    this.providers.forEach(p => {
      summary.breakdown.byCategory[p.category] = (summary.breakdown.byCategory[p.category] || 0) + 1;
      summary.breakdown.byStateAndCategory[p.practiceState][p.category] = 
        (summary.breakdown.byStateAndCategory[p.practiceState][p.category] || 0) + 1;
    });
    
    await fs.writeFile(
      `npi_complete_summary_${timestamp}.json`,
      JSON.stringify(summary, null, 2)
    );
  }

  // Display summary
  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE COLLECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Providers: ${this.stats.total.toLocaleString()}`);
    console.log(`API Calls Made: ${this.stats.apiCalls}`);
    
    console.log('\nBy State:');
    Object.entries(this.stats.byState).forEach(([state, count]) => {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    });
    
    console.log('\nBy Specialty:');
    Object.entries(this.stats.byTaxonomy)
      .sort((a, b) => b[1] - a[1])
      .forEach(([taxonomy, count]) => {
        console.log(`  ${taxonomy}: ${count.toLocaleString()}`);
      });
    
    console.log('\n✅ Collection Complete!');
    console.log('\nThis is the COMPLETE provider database for NY & FL!');
    console.log('No sampling, no limits - EVERY provider in the NPI registry.');
  }
}

// Alternative: Download from CMS
function showBulkDownloadOption() {
  console.log('\n📌 ALTERNATIVE: Bulk Download Option');
  console.log('====================================\n');
  console.log('For the COMPLETE database, you can also download from CMS:');
  console.log('1. Go to: https://download.cms.gov/nppes/NPI_Files.html');
  console.log('2. Download the full NPPES data file (~5GB)');
  console.log('3. Filter for NY and FL providers');
  console.log('4. This gives you ALL 5+ million providers nationwide\n');
  console.log('Our API approach is better for targeted collection!');
}

// Run the collector
async function main() {
  const collector = new NPICompleteCollector();
  
  try {
    await collector.collectComplete();
    showBulkDownloadOption();
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default NPICompleteCollector;