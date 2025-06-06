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
function extractProviderData(provider) {
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
  };
}

// Fetch providers by specialty and location
async function fetchProviders(taxonomyCodes, city, state, specialtyName) {
  const allProviders = [];
  let totalProcessed = 0;
  
  console.log(`\nFetching ${specialtyName} in ${city}, ${state}...`);
  
  // For each taxonomy code, search providers
  for (const taxonomyCode of taxonomyCodes) {
    let skip = 0;
    let hasMore = true;
    
    while (hasMore) {
      try {
        // NPI API uses 'version' and searches by taxonomy code directly
        const params = {
          version: '2.1',
          city: city,
          state: state,
          taxonomy_description: taxonomyCode,
          limit: 200,
          skip: skip
        };
        
        console.log(`  Searching taxonomy ${taxonomyCode} - offset ${skip}...`);
        const response = await makeApiRequest(params);
        
        if (response.results && response.results.length > 0) {
          // Filter to only include providers with our target taxonomy
          const filteredProviders = response.results.filter(provider => {
            return provider.taxonomies && provider.taxonomies.some(tax => 
              taxonomyCodes.includes(tax.code)
            );
          });
          
          const providers = filteredProviders.map(extractProviderData);
          allProviders.push(...providers);
          totalProcessed += providers.length;
          console.log(`    Found ${providers.length} relevant providers (Total: ${totalProcessed})`);
          
          if (response.results.length < 200) {
            hasMore = false;
          } else {
            skip += 200;
            await sleep(300); // Rate limiting
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`  Error fetching data: ${error.message}`);
        hasMore = false;
      }
    }
  }
  
  console.log(`  Total ${specialtyName} found: ${allProviders.length}`);
  return allProviders;
}

// Main execution
async function main() {
  console.log('Starting NPI Registry data collection...');
  console.log('==================================\n');
  
  const allData = {
    dentists: [],
    dermatologists: [],
    plasticSurgeons: []
  };
  
  // Collect data for each city and specialty
  for (const location of CITIES) {
    console.log(`\n=== Processing ${location.city}, ${location.state} ===`);
    
    // Fetch dentists
    const dentists = await fetchProviders(
      TAXONOMY_CODES.dentists,
      location.city,
      location.state,
      'Dentists'
    );
    allData.dentists.push(...dentists);
    
    // Fetch dermatologists
    const dermatologists = await fetchProviders(
      TAXONOMY_CODES.dermatologists,
      location.city,
      location.state,
      'Dermatologists'
    );
    allData.dermatologists.push(...dermatologists);
    
    // Fetch plastic surgeons
    const plasticSurgeons = await fetchProviders(
      TAXONOMY_CODES.plasticSurgeons,
      location.city,
      location.state,
      'Plastic Surgeons'
    );
    allData.plasticSurgeons.push(...plasticSurgeons);
  }
  
  // Save to CSV files
  console.log('\n=== Saving data to CSV files ===');
  
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
    'identifiers', 'otherNames'
  ];
  
  // Save each specialty to separate CSV
  const timestamp = new Date().toISOString().split('T')[0];
  
  for (const [specialty, data] of Object.entries(allData)) {
    if (data.length > 0) {
      const csv = parse(data, { fields });
      const filename = `npi_${specialty}_${timestamp}.csv`;
      fs.writeFileSync(filename, csv);
      console.log(`  Saved ${data.length} ${specialty} to ${filename}`);
    }
  }
  
  // Save combined data
  const combinedData = [
    ...allData.dentists.map(d => ({ ...d, specialty: 'Dentist' })),
    ...allData.dermatologists.map(d => ({ ...d, specialty: 'Dermatologist' })),
    ...allData.plasticSurgeons.map(d => ({ ...d, specialty: 'Plastic Surgeon' }))
  ];
  
  if (combinedData.length > 0) {
    const combinedFields = [...fields, 'specialty'];
    const combinedCsv = parse(combinedData, { fields: combinedFields });
    const combinedFilename = `npi_all_providers_${timestamp}.csv`;
    fs.writeFileSync(combinedFilename, combinedCsv);
    console.log(`  Saved ${combinedData.length} total providers to ${combinedFilename}`);
  }
  
  // Summary
  console.log('\n=== Collection Summary ===');
  console.log(`Total Dentists: ${allData.dentists.length}`);
  console.log(`Total Dermatologists: ${allData.dermatologists.length}`);
  console.log(`Total Plastic Surgeons: ${allData.plasticSurgeons.length}`);
  console.log(`Grand Total: ${combinedData.length} providers`);
  
  console.log('\nData collection complete!');
}

// Run the script
main().catch(console.error);