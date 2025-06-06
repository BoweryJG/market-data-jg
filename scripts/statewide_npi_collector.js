const fs = require('fs');
const https = require('https');
const { parse } = require('json2csv');

// NPI Registry API endpoint
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api';

// Taxonomy codes for our target specialties
const TAXONOMY_CODES = {
  dentists: [
    { code: '122300000X', desc: 'Dentist' },
    { code: '1223G0001X', desc: 'General Practice' },
    { code: '1223P0221X', desc: 'Pediatric Dentistry' },
    { code: '1223S0112X', desc: 'Oral & Maxillofacial Surgery' },
    { code: '1223X0400X', desc: 'Orthodontics' },
    { code: '1223P0300X', desc: 'Periodontics' },
    { code: '1223E0200X', desc: 'Endodontics' },
    { code: '1223P0700X', desc: 'Prosthodontics' }
  ],
  dermatologists: [
    { code: '207N00000X', desc: 'Dermatology' },
    { code: '207ND0900X', desc: 'Dermatopathology' },
    { code: '207NP0225X', desc: 'Pediatric Dermatology' },
    { code: '207NS0135X', desc: 'Mohs Surgery' }
  ],
  plasticSurgeons: [
    { code: '208200000X', desc: 'Plastic Surgery' },
    { code: '2082S0105X', desc: 'Surgery of the Hand' },
    { code: '2082S0099X', desc: 'Plastic Surgery Within the Head & Neck' }
  ],
  // Additional codes for aesthetic medicine providers
  aestheticProviders: [
    { code: '207W00000X', desc: 'Ophthalmology (often do cosmetic procedures)' },
    { code: '207RC0200X', desc: 'Critical Care Medicine' },
    { code: '207Q00000X', desc: 'Family Medicine' },
    { code: '207R00000X', desc: 'Internal Medicine' },
    { code: '163WP0218X', desc: 'Registered Nurse Practitioner' },
    { code: '363LP0200X', desc: 'Physician Assistant' }
  ]
};

// States to collect
const STATES = ['NY', 'FL'];

// Sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Make API request with retry logic
async function makeApiRequest(params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `${NPI_API_URL}/?${queryString}`;

        https.get(url, (res) => {
          let data = '';
          
          res.on('data', chunk => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}

// Extract provider data
function extractProviderData(provider, category) {
  const basic = provider.basic || {};
  const addresses = provider.addresses || [];
  const taxonomies = provider.taxonomies || [];
  const practiceLocation = addresses.find(addr => addr.address_purpose === 'LOCATION') || addresses[0] || {};
  const mailingAddress = addresses.find(addr => addr.address_purpose === 'MAILING') || {};
  const primaryTaxonomy = taxonomies.find(tax => tax.primary) || taxonomies[0] || {};

  return {
    npi: provider.number,
    enumeration_type: provider.enumeration_type,
    firstName: basic.first_name || '',
    lastName: basic.last_name || '',
    middleName: basic.middle_name || '',
    credential: basic.credential || '',
    organizationName: basic.organization_name || '',
    gender: basic.gender || '',
    lastUpdated: basic.last_updated || '',
    
    // Practice location
    practiceAddress1: practiceLocation.address_1 || '',
    practiceAddress2: practiceLocation.address_2 || '',
    practiceCity: practiceLocation.city || '',
    practiceState: practiceLocation.state || '',
    practiceZip: practiceLocation.postal_code || '',
    practicePhone: practiceLocation.telephone_number || '',
    practiceFax: practiceLocation.fax_number || '',
    
    // Mailing address
    mailingAddress1: mailingAddress.address_1 || '',
    mailingAddress2: mailingAddress.address_2 || '',
    mailingCity: mailingAddress.city || '',
    mailingState: mailingAddress.state || '',
    mailingZip: mailingAddress.postal_code || '',
    
    // Taxonomy/Specialty
    taxonomyCode: primaryTaxonomy.code || '',
    taxonomyDescription: primaryTaxonomy.desc || '',
    taxonomyLicense: primaryTaxonomy.license || '',
    taxonomyState: primaryTaxonomy.state || '',
    isPrimaryTaxonomy: primaryTaxonomy.primary || false,
    
    // Additional taxonomies
    allTaxonomies: taxonomies.map(t => `${t.code}:${t.desc}`).join(';'),
    
    // Category
    category: category
  };
}

// Check if provider matches our taxonomies
function categorizeProvider(provider) {
  if (!provider.taxonomies) return null;
  
  const taxonomyCodes = provider.taxonomies.map(t => t.code);
  
  for (const code of taxonomyCodes) {
    if (TAXONOMY_CODES.dentists.some(t => t.code === code)) return 'dentist';
    if (TAXONOMY_CODES.dermatologists.some(t => t.code === code)) return 'dermatologist';
    if (TAXONOMY_CODES.plasticSurgeons.some(t => t.code === code)) return 'plastic_surgeon';
    if (TAXONOMY_CODES.aestheticProviders.some(t => t.code === code)) return 'aesthetic_provider';
  }
  
  return null;
}

// Check if organization might be a medspa
function isMedSpaOrganization(provider) {
  if (provider.enumeration_type !== 'NPI-2') return false;
  
  const orgName = (provider.basic?.organization_name || '').toLowerCase();
  const medSpaKeywords = [
    'medspa', 'med spa', 'medical spa', 'medi spa', 'medispa',
    'aesthetic', 'aesthetics', 'rejuvenation', 'laser clinic',
    'cosmetic center', 'wellness center', 'beauty clinic',
    'skin care center', 'skin clinic', 'anti-aging',
    'botox', 'filler', 'injectable', 'body sculpting',
    'coolsculpting', 'hydrafacial', 'microneedling'
  ];
  
  return medSpaKeywords.some(keyword => orgName.includes(keyword));
}

// Fetch all providers for a state by alphabet
async function fetchStateProvidersByLetter(state, letter, enumType = 'NPI-1') {
  const providers = [];
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const params = {
        version: '2.1',
        state: state,
        last_name: `${letter}*`, // For individuals
        organization_name: `${letter}*`, // For organizations
        enumeration_type: enumType,
        limit: 200,
        skip: skip
      };
      
      // Remove the inappropriate field based on enumeration type
      if (enumType === 'NPI-1') {
        delete params.organization_name;
      } else {
        delete params.last_name;
      }
      
      const response = await makeApiRequest(params);
      
      if (response.results && response.results.length > 0) {
        providers.push(...response.results);
        
        if (response.results.length < 200) {
          hasMore = false;
        } else {
          skip += 200;
          await sleep(100);
        }
        
        // Safety limit per letter
        if (skip > 50000) {
          console.log(`    Reached limit for letter ${letter}`);
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`    Error fetching ${letter}: ${error.message}`);
      hasMore = false;
    }
  }
  
  return providers;
}

// Main execution
async function main() {
  console.log('Statewide NPI Data Collection - NY & FL');
  console.log('=======================================\n');
  
  const allData = {
    dentists: [],
    dermatologists: [],
    plasticSurgeons: [],
    aestheticProviders: [],
    medspas: []
  };
  
  const uniqueNPIs = new Set();
  let totalProcessed = 0;
  
  // Process each state
  for (const state of STATES) {
    console.log(`\n=== Processing ${state} (Full State) ===`);
    
    // Search by alphabet for comprehensive coverage
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Search individuals
    console.log('\nSearching Individual Providers:');
    for (const letter of alphabet) {
      console.log(`  Searching last names starting with ${letter}...`);
      const individuals = await fetchStateProvidersByLetter(state, letter, 'NPI-1');
      console.log(`    Found ${individuals.length} providers`);
      
      let counts = { dentist: 0, dermatologist: 0, plastic_surgeon: 0, aesthetic_provider: 0 };
      
      for (const provider of individuals) {
        const category = categorizeProvider(provider);
        if (category && !uniqueNPIs.has(provider.number)) {
          uniqueNPIs.add(provider.number);
          const providerData = extractProviderData(provider, category);
          
          switch(category) {
            case 'dentist':
              allData.dentists.push(providerData);
              counts.dentist++;
              break;
            case 'dermatologist':
              allData.dermatologists.push(providerData);
              counts.dermatologist++;
              break;
            case 'plastic_surgeon':
              allData.plasticSurgeons.push(providerData);
              counts.plastic_surgeon++;
              break;
            case 'aesthetic_provider':
              allData.aestheticProviders.push(providerData);
              counts.aesthetic_provider++;
              break;
          }
          totalProcessed++;
        }
      }
      
      console.log(`    Relevant: ${counts.dentist} dentists, ${counts.dermatologist} dermatologists, ${counts.plastic_surgeon} plastic surgeons, ${counts.aesthetic_provider} aesthetic providers`);
      await sleep(200);
    }
    
    // Search organizations (potential medspas)
    console.log('\nSearching Organizations (Including MedSpas):');
    for (const letter of alphabet) {
      console.log(`  Searching organizations starting with ${letter}...`);
      const organizations = await fetchStateProvidersByLetter(state, letter, 'NPI-2');
      console.log(`    Found ${organizations.length} organizations`);
      
      let medspaCount = 0;
      let dentalOrgCount = 0;
      
      for (const org of organizations) {
        if (!uniqueNPIs.has(org.number)) {
          uniqueNPIs.add(org.number);
          
          // Check if it's a medspa
          if (isMedSpaOrganization(org)) {
            const orgData = extractProviderData(org, 'medspa');
            allData.medspas.push(orgData);
            medspaCount++;
            totalProcessed++;
          }
          // Check if it's a dental organization
          else if (categorizeProvider(org) === 'dentist') {
            const orgData = extractProviderData(org, 'dentist');
            allData.dentists.push(orgData);
            dentalOrgCount++;
            totalProcessed++;
          }
        }
      }
      
      console.log(`    Found ${medspaCount} potential medspas, ${dentalOrgCount} dental organizations`);
      await sleep(200);
    }
    
    // State summary
    console.log(`\n${state} Summary:`);
    console.log(`  Dentists: ${allData.dentists.filter(p => p.practiceState === state).length}`);
    console.log(`  Dermatologists: ${allData.dermatologists.filter(p => p.practiceState === state).length}`);
    console.log(`  Plastic Surgeons: ${allData.plasticSurgeons.filter(p => p.practiceState === state).length}`);
    console.log(`  Aesthetic Providers: ${allData.aestheticProviders.filter(p => p.practiceState === state).length}`);
    console.log(`  MedSpas: ${allData.medspas.filter(p => p.practiceState === state).length}`);
  }
  
  // Save to CSV files
  console.log('\n=== Saving Data ===');
  
  const fields = [
    'npi', 'enumeration_type', 'firstName', 'lastName', 'middleName', 'credential',
    'organizationName', 'gender', 'lastUpdated',
    'practiceAddress1', 'practiceAddress2', 'practiceCity', 
    'practiceState', 'practiceZip', 'practicePhone', 'practiceFax',
    'mailingAddress1', 'mailingAddress2', 'mailingCity',
    'mailingState', 'mailingZip',
    'taxonomyCode', 'taxonomyDescription', 'taxonomyLicense',
    'taxonomyState', 'isPrimaryTaxonomy', 'allTaxonomies',
    'category'
  ];
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Save each category
  const categories = [
    { data: allData.dentists, name: 'dentists' },
    { data: allData.dermatologists, name: 'dermatologists' },
    { data: allData.plasticSurgeons, name: 'plastic_surgeons' },
    { data: allData.aestheticProviders, name: 'aesthetic_providers' },
    { data: allData.medspas, name: 'medspas' }
  ];
  
  for (const { data, name } of categories) {
    if (data.length > 0) {
      const csv = parse(data, { fields });
      const filename = `npi_${name}_NY_FL_statewide_${timestamp}.csv`;
      fs.writeFileSync(filename, csv);
      console.log(`Saved ${data.length} ${name} to ${filename}`);
    }
  }
  
  // Save combined
  const combinedData = [
    ...allData.dentists,
    ...allData.dermatologists,
    ...allData.plasticSurgeons,
    ...allData.aestheticProviders,
    ...allData.medspas
  ];
  
  if (combinedData.length > 0) {
    const combinedCsv = parse(combinedData, { fields });
    const combinedFilename = `npi_all_providers_NY_FL_statewide_${timestamp}.csv`;
    fs.writeFileSync(combinedFilename, combinedCsv);
    console.log(`Saved ${combinedData.length} total providers to ${combinedFilename}`);
  }
  
  // Final summary
  console.log('\n=== FINAL STATEWIDE SUMMARY ===');
  console.log(`Total Dentists: ${allData.dentists.length}`);
  console.log(`Total Dermatologists: ${allData.dermatologists.length}`);
  console.log(`Total Plastic Surgeons: ${allData.plasticSurgeons.length}`);
  console.log(`Total Aesthetic Providers: ${allData.aestheticProviders.length}`);
  console.log(`Total MedSpas: ${allData.medspas.length}`);
  console.log(`Grand Total: ${combinedData.length} providers`);
}

// Run the script
main().catch(console.error);