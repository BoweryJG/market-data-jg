import { logger } from '@/services/logging/logger';

const fs = require('fs');
const https = require('https');
const { parse } = require('json2csv');

// NPI Registry API endpoint
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api';

// Taxonomy codes for our target specialties
const TAXONOMY_CODES = {
  dentists: [
    '122300000X', // Dentist
    '1223G0001X', // General Practice
    '1223P0221X', // Pediatric Dentistry
    '1223S0112X', // Oral Surgery
    '1223X0400X', // Orthodontics
    '1223P0300X', // Periodontics
    '1223D0001X', // Dental Public Health
    '1223E0200X', // Endodontics
    '1223P0106X', // Oral and Maxillofacial Pathology
    '1223D0008X', // Oral and Maxillofacial Radiology
    '1223P0700X', // Prosthodontics
  ],
  dermatologists: [
    '207N00000X', // Dermatology
    '207ND0900X', // Dermatopathology
    '207NI0002X', // Clinical & Laboratory Dermatological Immunology
    '207NP0225X', // Pediatric Dermatology
    '207NS0135X', // Mohs Surgery
  ],
  plasticSurgeons: [
    '208200000X', // Plastic Surgery
    '2082S0105X', // Surgery of the Hand
    '2082S0099X', // Plastic Surgery Within the Head and Neck
  ]
};

// Cities configuration
const CITIES = [
  { city: 'New York', state: 'NY' },
  { city: 'Miami', state: 'FL' }
];

// Sleep helper for rate limiting
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Make API request
async function makeApiRequest(params) {
  return new Promise((resolve, reject) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${NPI_API_URL}?${queryString}`;

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
    
    // Identifiers
    identifiers: (provider.identifiers || []).map(id => `${id.identifier}:${id.desc}`).join(';'),
    
    // Other names
    otherNames: (provider.other_names || []).map(name => `${name.first_name} ${name.last_name}`).join(';'),
    
    // Category
    category: category
  };
}

// Categorize provider based on taxonomy
function categorizeProvider(provider) {
  if (!provider.taxonomies) return null;
  
  for (const taxonomy of provider.taxonomies) {
    if (TAXONOMY_CODES.dentists.includes(taxonomy.code)) return 'dentist';
    if (TAXONOMY_CODES.dermatologists.includes(taxonomy.code)) return 'dermatologist';
    if (TAXONOMY_CODES.plasticSurgeons.includes(taxonomy.code)) return 'plastic_surgeon';
  }
  return null;
}

// Fetch all providers for a city
async function fetchCityProviders(city, state) {
  const categorizedProviders = {
    dentist: [],
    dermatologist: [],
    plastic_surgeon: []
  };
  
  logger.info(`\nFetching all providers in ${city}, ${state}...`);
  
  let skip = 0;
  let hasMore = true;
  let totalFound = 0;
  
  while (hasMore) {
    try {
      const params = {
        version: '2.1',
        city: city,
        state: state,
        limit: 200,
        skip: skip
      };
      
      logger.info(`  Fetching batch starting at ${skip}...`);
      const response = await makeApiRequest(params);
      
      if (response.results && response.results.length > 0) {
        // Process each provider
        for (const provider of response.results) {
          const category = categorizeProvider(provider);
          if (category) {
            const providerData = extractProviderData(provider, category);
            categorizedProviders[category].push(providerData);
          }
        }
        
        totalFound += response.results.length;
        logger.info(`    Processed ${response.results.length} providers (Total seen: ${totalFound})`);
        logger.info(`    Current counts - Dentists: ${categorizedProviders.dentist.length}, Dermatologists: ${categorizedProviders.dermatologist.length}, Plastic Surgeons: ${categorizedProviders.plastic_surgeon.length}`);
        
        if (response.results.length < 200) {
          hasMore = false;
        } else {
          skip += 200;
          await sleep(300); // Rate limiting
        }
        
        // Safety limit to prevent infinite loops
        if (skip > 10000) {
          logger.info('  Reached safety limit of 10,000 providers');
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      logger.error(`  Error fetching data: ${error.message}`);
      hasMore = false;
    }
  }
  
  logger.info(`\nCompleted ${city}, ${state}:`);
  logger.info(`  Total Dentists: ${categorizedProviders.dentist.length}`);
  logger.info(`  Total Dermatologists: ${categorizedProviders.dermatologist.length}`);
  logger.info(`  Total Plastic Surgeons: ${categorizedProviders.plastic_surgeon.length}`);
  
  return categorizedProviders;
}

// Main execution
async function main() {
  logger.info('Starting NPI Registry data collection...');
  logger.info('==================================\n');
  
  const allData = {
    dentists: [],
    dermatologists: [],
    plasticSurgeons: []
  };
  
  // Collect data for each city
  for (const location of CITIES) {
    const cityProviders = await fetchCityProviders(location.city, location.state);
    
    allData.dentists.push(...cityProviders.dentist);
    allData.dermatologists.push(...cityProviders.dermatologist);
    allData.plasticSurgeons.push(...cityProviders.plastic_surgeon);
  }
  
  // Save to CSV files
  logger.info('\n=== Saving data to CSV files ===');
  
  // Define CSV fields
  const fields = [
    'npi', 'firstName', 'lastName', 'middleName', 'credential',
    'organizationName', 'gender', 'lastUpdated',
    'practiceAddress1', 'practiceAddress2', 'practiceCity', 
    'practiceState', 'practiceZip', 'practicePhone', 'practiceFax',
    'mailingAddress1', 'mailingAddress2', 'mailingCity',
    'mailingState', 'mailingZip',
    'taxonomyCode', 'taxonomyDescription', 'taxonomyLicense',
    'taxonomyState', 'isPrimaryTaxonomy', 'allTaxonomies',
    'identifiers', 'otherNames', 'category'
  ];
  
  // Save each specialty to separate CSV
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Save dentists
  if (allData.dentists.length > 0) {
    const csv = parse(allData.dentists, { fields });
    const filename = `npi_dentists_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${allData.dentists.length} dentists to ${filename}`);
  }
  
  // Save dermatologists
  if (allData.dermatologists.length > 0) {
    const csv = parse(allData.dermatologists, { fields });
    const filename = `npi_dermatologists_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${allData.dermatologists.length} dermatologists to ${filename}`);
  }
  
  // Save plastic surgeons
  if (allData.plasticSurgeons.length > 0) {
    const csv = parse(allData.plasticSurgeons, { fields });
    const filename = `npi_plastic_surgeons_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${allData.plasticSurgeons.length} plastic surgeons to ${filename}`);
  }
  
  // Save combined data
  const combinedData = [
    ...allData.dentists,
    ...allData.dermatologists,
    ...allData.plasticSurgeons
  ];
  
  if (combinedData.length > 0) {
    const combinedCsv = parse(combinedData, { fields });
    const combinedFilename = `npi_all_providers_${timestamp}.csv`;
    fs.writeFileSync(combinedFilename, combinedCsv);
    logger.info(`  Saved ${combinedData.length} total providers to ${combinedFilename}`);
  }
  
  // Summary
  logger.info('\n=== Collection Summary ===');
  logger.info(`Total Dentists: ${allData.dentists.length}`);
  logger.info(`Total Dermatologists: ${allData.dermatologists.length}`);
  logger.info(`Total Plastic Surgeons: ${allData.plasticSurgeons.length}`);
  logger.info(`Grand Total: ${combinedData.length} providers`);
  
  logger.info('\nData collection complete!');
}

// Run the script
main().catch(console.error);