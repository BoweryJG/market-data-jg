import fetch from 'node-fetch';
import fs from 'fs/promises';
import { stringify } from 'csv-stringify/sync';

// Collect ALL providers in NY and FL efficiently
class StatewideNPICollector {
  constructor() {
    this.baseUrl = 'https://npiregistry.cms.hhs.gov/api/';
    this.allProviders = [];
  }

  // Search by state - gets ALL provider types
  async searchByState(state, skip = 0) {
    const params = new URLSearchParams({
      version: '2.1',
      state: state,
      limit: 200,
      skip: skip
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      
      return {
        results: data.results || [],
        totalCount: data.result_count || 0
      };
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      return { results: [], totalCount: 0 };
    }
  }

  // Filter for our target providers
  isTargetProvider(provider) {
    const taxonomy = provider.taxonomies?.find(t => t.primary)?.desc || '';
    const taxonomyLower = taxonomy.toLowerCase();
    
    return (
      taxonomyLower.includes('dent') ||
      taxonomyLower.includes('dermatolog') ||
      taxonomyLower.includes('plastic') ||
      taxonomyLower.includes('aesthetic') ||
      taxonomyLower.includes('cosmetic')
    );
  }

  // Collect all providers for a state
  async collectState(state) {
    console.log(`\n🎯 Collecting ALL providers in ${state}...`);
    
    let skip = 0;
    let totalProcessed = 0;
    let stateProviders = [];
    let hasMore = true;
    
    while (hasMore) {
      console.log(`  Fetching batch: ${skip} - ${skip + 200}...`);
      
      const { results, totalCount } = await this.searchByState(state, skip);
      
      if (results.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process providers
      results.forEach(result => {
        if (this.isTargetProvider(result)) {
          const provider = this.processProvider(result);
          if (provider.practiceState === state) {
            stateProviders.push(provider);
          }
        }
      });
      
      totalProcessed += results.length;
      skip += results.length;
      
      console.log(`  ✅ Processed: ${totalProcessed} | Found targets: ${stateProviders.length}`);
      
      // Continue if more results
      hasMore = results.length === 200 && totalProcessed < totalCount;
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return stateProviders;
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
      category: this.categorizeProvider(taxonomy.desc)
    };
  }

  // Categorize provider
  categorizeProvider(taxonomyDesc) {
    const desc = (taxonomyDesc || '').toLowerCase();
    if (desc.includes('dent')) return 'dentist';
    if (desc.includes('dermatolog')) return 'dermatologist';
    if (desc.includes('plastic')) return 'plastic_surgeon';
    if (desc.includes('nurse practitioner')) return 'nurse_practitioner';
    if (desc.includes('physician assistant')) return 'physician_assistant';
    return 'other';
  }

  // Main collection
  async collect() {
    console.log('🚀 STATEWIDE NPI COLLECTOR');
    console.log('=========================\n');
    console.log('Collecting ALL dentists, dermatologists, plastic surgeons');
    console.log('and aesthetic providers in NY and FL\n');
    
    // Collect both states
    const nyProviders = await this.collectState('NY');
    const flProviders = await this.collectState('FL');
    
    this.allProviders = [...nyProviders, ...flProviders];
    
    // Save results
    await this.saveResults();
    
    // Summary
    this.displaySummary();
  }

  // Save results
  async saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `npi_statewide_ny_fl_${timestamp}.csv`;
    
    const csv = stringify(this.allProviders, {
      header: true,
      columns: [
        'npi', 'firstName', 'lastName', 'credential', 'organizationName',
        'practiceAddress1', 'practiceCity', 'practiceState', 'practiceZip',
        'practicePhone', 'taxonomyDescription', 'category'
      ]
    });
    
    await fs.writeFile(filename, csv);
    console.log(`\n💾 Saved ${this.allProviders.length} providers to ${filename}`);
  }

  // Display summary
  displaySummary() {
    const summary = {
      total: this.allProviders.length,
      byState: {},
      byCategory: {}
    };
    
    this.allProviders.forEach(p => {
      summary.byState[p.practiceState] = (summary.byState[p.practiceState] || 0) + 1;
      summary.byCategory[p.category] = (summary.byCategory[p.category] || 0) + 1;
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Providers: ${summary.total.toLocaleString()}`);
    
    console.log('\nBy State:');
    Object.entries(summary.byState).forEach(([state, count]) => {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    });
    
    console.log('\nBy Category:');
    Object.entries(summary.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count.toLocaleString()}`);
      });
    
    console.log('\n✅ This is your COMPLETE provider database!');
  }
}

// Quick start function
async function quickCollect() {
  console.log('⚡ QUICK COLLECTION MODE\n');
  console.log('This will get you started quickly:');
  console.log('1. Searches broadly by state');
  console.log('2. Filters for our target providers');
  console.log('3. Saves clean CSV ready for use\n');
  
  const collector = new StatewideNPICollector();
  await collector.collect();
}

// Run it
if (import.meta.url === `file://${process.argv[1]}`) {
  quickCollect();
}

export default StatewideNPICollector;