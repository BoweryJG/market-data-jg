import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Find potential medspas from NPI data
class NPIMedSpaFinder {
  constructor() {
    this.potentialMedSpas = [];
    this.stats = {
      totalProviders: 0,
      dermatologists: 0,
      plasticSurgeons: 0,
      potentialMedSpas: 0,
      byState: {}
    };
  }

  // Parse NPI CSV file
  async parseNPIData(filePath) {
    return new Promise((resolve, reject) => {
      const records = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      createReadStream(filePath)
        .pipe(parser)
        .on('data', (data) => records.push(data))
        .on('end', () => resolve(records))
        .on('error', reject);
    });
  }

  // Check if provider might run a medspa
  isPotentialMedSpa(provider) {
    // Organization names that suggest medical spa
    const orgName = (provider.organizationName || '').toLowerCase();
    const medSpaKeywords = [
      'aesthetic', 'cosmetic', 'laser', 'skin', 'beauty',
      'rejuvenation', 'wellness', 'anti-aging', 'medspa',
      'med spa', 'medical spa', 'glow', 'radiance', 'renew'
    ];
    
    // Check organization name
    for (const keyword of medSpaKeywords) {
      if (orgName.includes(keyword)) {
        return { isPotential: true, reason: `Organization name contains '${keyword}'` };
      }
    }
    
    // Check if dermatologist or plastic surgeon with organization
    const taxonomy = (provider.taxonomyDescription || '').toLowerCase();
    if (provider.organizationName && 
        (taxonomy.includes('dermatolog') || taxonomy.includes('plastic'))) {
      return { isPotential: true, reason: 'Specialist with business name' };
    }
    
    // Check practice address - suites often indicate medical spas
    const address = (provider.practiceAddress1 || '').toLowerCase();
    if (address.includes('suite') && provider.organizationName) {
      return { isPotential: true, reason: 'Has suite address with business name' };
    }
    
    return { isPotential: false };
  }

  // Process NPI data
  async processNPIData() {
    console.log('📂 Reading NPI data files...\n');
    
    // Process all provider types
    const files = [
      { path: 'npi_dermatologists_complete_2025-06-04.csv', type: 'dermatologist' },
      { path: 'npi_plastic_surgeons_complete_2025-06-04.csv', type: 'plastic_surgeon' }
    ];
    
    for (const file of files) {
      try {
        console.log(`🔍 Processing ${file.type}s...`);
        const providers = await this.parseNPIData(file.path);
        
        for (const provider of providers) {
          this.stats.totalProviders++;
          
          if (file.type === 'dermatologist') this.stats.dermatologists++;
          if (file.type === 'plastic_surgeon') this.stats.plasticSurgeons++;
          
          // Check if potential medspa
          const check = this.isPotentialMedSpa(provider);
          if (check.isPotential) {
            const medSpa = {
              name: provider.organizationName || `${provider.firstName} ${provider.lastName} ${provider.credential}`,
              organizationName: provider.organizationName,
              providerName: `${provider.firstName} ${provider.lastName}`,
              credential: provider.credential,
              npi: provider.npi,
              taxonomy: provider.taxonomyDescription,
              address: provider.practiceAddress1,
              city: provider.practiceCity,
              state: provider.practiceState,
              zip: provider.practiceZip,
              phone: provider.practicePhone,
              type: file.type,
              reason: check.reason,
              lastUpdated: provider.lastUpdated
            };
            
            this.potentialMedSpas.push(medSpa);
            this.stats.potentialMedSpas++;
            this.stats.byState[provider.practiceState] = 
              (this.stats.byState[provider.practiceState] || 0) + 1;
          }
        }
        
        console.log(`✅ Found ${this.potentialMedSpas.length} potential medical spas\n`);
        
      } catch (error) {
        console.error(`❌ Error processing ${file.path}: ${error.message}`);
      }
    }
  }

  // Group by organization
  groupByOrganization() {
    const orgMap = new Map();
    
    for (const spa of this.potentialMedSpas) {
      if (spa.organizationName) {
        const key = spa.organizationName.toLowerCase();
        if (!orgMap.has(key)) {
          orgMap.set(key, {
            organizationName: spa.organizationName,
            locations: [],
            providers: new Set(),
            states: new Set()
          });
        }
        
        const org = orgMap.get(key);
        org.locations.push({
          address: spa.address,
          city: spa.city,
          state: spa.state,
          zip: spa.zip,
          phone: spa.phone
        });
        org.providers.add(spa.providerName);
        org.states.add(spa.state);
      }
    }
    
    return Array.from(orgMap.values()).map(org => ({
      ...org,
      providers: Array.from(org.providers),
      states: Array.from(org.states),
      locationCount: org.locations.length,
      isChain: org.locations.length > 1
    }));
  }

  // Generate report
  async generateReport() {
    const organizations = this.groupByOrganization();
    const nyFlOrgs = organizations.filter(org => 
      org.states.includes('NY') || org.states.includes('FL')
    );
    
    const report = {
      summary: {
        totalProvidersScanned: this.stats.totalProviders,
        dermatologistsScanned: this.stats.dermatologists,
        plasticSurgeonsScanned: this.stats.plasticSurgeons,
        potentialMedSpasFound: this.stats.potentialMedSpas,
        uniqueOrganizations: organizations.length,
        nyFlOrganizations: nyFlOrgs.length,
        chains: organizations.filter(o => o.isChain).length,
        byState: this.stats.byState
      },
      topOrganizations: organizations
        .sort((a, b) => b.locationCount - a.locationCount)
        .slice(0, 20),
      nyFlMedSpas: nyFlOrgs,
      allPotentialMedSpas: this.potentialMedSpas
        .filter(spa => spa.state === 'NY' || spa.state === 'FL')
        .sort((a, b) => {
          if (a.state !== b.state) return a.state.localeCompare(b.state);
          return a.city.localeCompare(b.city);
        })
    };
    
    // Save report
    const filename = `npi_potential_medspas_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to ${filename}`);
    
    // Save CSV for easy viewing
    const csvData = nyFlOrgs.map(org => ({
      organization: org.organizationName,
      locations: org.locationCount,
      states: org.states.join(', '),
      providers: org.providers.join('; '),
      firstLocation: org.locations[0] ? 
        `${org.locations[0].address}, ${org.locations[0].city}, ${org.locations[0].state}` : ''
    }));
    
    const csvContent = [
      'Organization,Locations,States,Providers,First Address',
      ...csvData.map(row => 
        `"${row.organization}",${row.locations},"${row.states}","${row.providers}","${row.firstLocation}"`
      )
    ].join('\n');
    
    const csvFilename = `npi_potential_medspas_${new Date().toISOString().split('T')[0]}.csv`;
    await fs.writeFile(csvFilename, csvContent);
    console.log(`💾 CSV saved to ${csvFilename}`);
    
    return report;
  }

  // Display results
  displayResults(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 POTENTIAL MEDICAL SPAS FROM NPI DATA');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`- Scanned ${report.summary.totalProvidersScanned} providers`);
    console.log(`- Found ${report.summary.potentialMedSpasFound} potential medical spa providers`);
    console.log(`- ${report.summary.uniqueOrganizations} unique organizations`);
    console.log(`- ${report.summary.nyFlOrganizations} organizations in NY/FL`);
    console.log(`- ${report.summary.chains} multi-location chains`);
    
    console.log(`\n📍 By State (NY/FL only):`);
    console.log(`- NY: ${report.summary.byState.NY || 0} potential medspas`);
    console.log(`- FL: ${report.summary.byState.FL || 0} potential medspas`);
    
    console.log(`\n🏆 Top Organizations by Location Count:`);
    report.topOrganizations.slice(0, 10).forEach((org, i) => {
      console.log(`${i + 1}. ${org.organizationName} - ${org.locationCount} locations in ${org.states.join(', ')}`);
    });
    
    console.log(`\n💡 Next Steps:`);
    console.log('1. Verify these organizations have medical spa services');
    console.log('2. Check their websites for service menus');
    console.log('3. Cross-reference with Yelp/Google for "medical spa" listings');
    console.log('4. Call to confirm they offer aesthetic services');
  }
}

// Main execution
async function main() {
  const finder = new NPIMedSpaFinder();
  
  try {
    console.log('🚀 Finding potential medical spas from NPI data\n');
    
    await finder.processNPIData();
    const report = await finder.generateReport();
    finder.displayResults(report);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default NPIMedSpaFinder;