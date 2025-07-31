import { logger } from '@/services/logging/logger';

const fs = require('fs');
const https = require('https');
const { parse } = require('json2csv');

// NPI Registry API endpoint
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api';

// Taxonomy codes for our target specialties
const TAXONOMY_CODES = {
  dentists: [
    { code: '122300000X', desc: 'Dentist' },
    { code: '1223G0001X', desc: 'General Practice Dentist' },
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
  ]
};

// Target states and their major cities
const LOCATIONS = [
  { state: 'NY', cities: ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'] },
  { state: 'FL', cities: ['Miami', 'Miami Beach', 'Coral Gables', 'Aventura', 'Fort Lauderdale', 'Boca Raton'] }
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

// Fetch providers by taxonomy code
async function fetchProvidersByTaxonomy(taxonomyCode, state, city = null) {
  const providers = [];
  let skip = 0;
  let hasMore = true;
  let totalFetched = 0;
  
  while (hasMore) {
    try {
      const params = {
        version: '2.1',
        state: state,
        limit: 200,
        skip: skip
      };
      
      // Add city if specified
      if (city) {
        params.city = city;
      }
      
      // Add taxonomy filter
      params.taxonomy_description = taxonomyCode;
      
      const response = await makeApiRequest(params);
      
      if (response.results && response.results.length > 0) {
        providers.push(...response.results);
        totalFetched += response.results.length;
        
        if (response.results.length < 200) {
          hasMore = false;
        } else {
          skip += 200;
          await sleep(200); // Rate limiting
        }
        
        // Prevent infinite loops
        if (skip > 50000) {
          logger.info('    Reached maximum limit');
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      logger.error(`    Error: ${error.message}`);
      hasMore = false;
    }
  }
  
  return providers;
}

// Main execution
async function main() {
  logger.info('Starting comprehensive NPI Registry data collection...');
  logger.info('================================================\n');
  
  const allData = {
    dentists: [],
    dermatologists: [],
    plasticSurgeons: []
  };
  
  const uniqueNPIs = new Set();
  
  // Process each location
  for (const location of LOCATIONS) {
    logger.info(`\n=== Processing ${location.state} ===`);
    
    // Search by state for each taxonomy
    logger.info(`\nSearching all ${location.state} providers by taxonomy...`);
    
    // Dentists
    logger.info('\nDENTISTS:');
    for (const taxonomy of TAXONOMY_CODES.dentists) {
      logger.info(`  Searching ${taxonomy.desc} (${taxonomy.code})...`);
      const providers = await fetchProvidersByTaxonomy(taxonomy.code, location.state);
      logger.info(`    Found ${providers.length} providers`);
      
      for (const provider of providers) {
        if (!uniqueNPIs.has(provider.number)) {
          uniqueNPIs.add(provider.number);
          allData.dentists.push(extractProviderData(provider, 'dentist'));
        }
      }
    }
    
    // Dermatologists
    logger.info('\nDERMATOLOGISTS:');
    for (const taxonomy of TAXONOMY_CODES.dermatologists) {
      logger.info(`  Searching ${taxonomy.desc} (${taxonomy.code})...`);
      const providers = await fetchProvidersByTaxonomy(taxonomy.code, location.state);
      logger.info(`    Found ${providers.length} providers`);
      
      for (const provider of providers) {
        if (!uniqueNPIs.has(provider.number)) {
          uniqueNPIs.add(provider.number);
          allData.dermatologists.push(extractProviderData(provider, 'dermatologist'));
        }
      }
    }
    
    // Plastic Surgeons
    logger.info('\nPLASTIC SURGEONS:');
    for (const taxonomy of TAXONOMY_CODES.plasticSurgeons) {
      logger.info(`  Searching ${taxonomy.desc} (${taxonomy.code})...`);
      const providers = await fetchProvidersByTaxonomy(taxonomy.code, location.state);
      logger.info(`    Found ${providers.length} providers`);
      
      for (const provider of providers) {
        if (!uniqueNPIs.has(provider.number)) {
          uniqueNPIs.add(provider.number);
          allData.plasticSurgeons.push(extractProviderData(provider, 'plastic_surgeon'));
        }
      }
    }
    
    logger.info(`\nState ${location.state} totals:`);
    logger.info(`  Dentists: ${allData.dentists.filter(p => p.practiceState === location.state).length}`);
    logger.info(`  Dermatologists: ${allData.dermatologists.filter(p => p.practiceState === location.state).length}`);
    logger.info(`  Plastic Surgeons: ${allData.plasticSurgeons.filter(p => p.practiceState === location.state).length}`);
  }
  
  // Filter to only include providers in our target cities
  const targetCities = LOCATIONS.flatMap(loc => loc.cities.map(city => city.toUpperCase()));
  
  const filteredData = {
    dentists: allData.dentists.filter(p => 
      targetCities.includes(p.practiceCity.toUpperCase()) || 
      targetCities.includes(p.mailingCity.toUpperCase())
    ),
    dermatologists: allData.dermatologists.filter(p => 
      targetCities.includes(p.practiceCity.toUpperCase()) || 
      targetCities.includes(p.mailingCity.toUpperCase())
    ),
    plasticSurgeons: allData.plasticSurgeons.filter(p => 
      targetCities.includes(p.practiceCity.toUpperCase()) || 
      targetCities.includes(p.mailingCity.toUpperCase())
    )
  };
  
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
  if (filteredData.dentists.length > 0) {
    const csv = parse(filteredData.dentists, { fields });
    const filename = `npi_dentists_comprehensive_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${filteredData.dentists.length} dentists to ${filename}`);
  }
  
  // Save dermatologists
  if (filteredData.dermatologists.length > 0) {
    const csv = parse(filteredData.dermatologists, { fields });
    const filename = `npi_dermatologists_comprehensive_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${filteredData.dermatologists.length} dermatologists to ${filename}`);
  }
  
  // Save plastic surgeons
  if (filteredData.plasticSurgeons.length > 0) {
    const csv = parse(filteredData.plasticSurgeons, { fields });
    const filename = `npi_plastic_surgeons_comprehensive_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`  Saved ${filteredData.plasticSurgeons.length} plastic surgeons to ${filename}`);
  }
  
  // Save combined data
  const combinedData = [
    ...filteredData.dentists,
    ...filteredData.dermatologists,
    ...filteredData.plasticSurgeons
  ];
  
  if (combinedData.length > 0) {
    const combinedCsv = parse(combinedData, { fields });
    const combinedFilename = `npi_all_providers_comprehensive_${timestamp}.csv`;
    fs.writeFileSync(combinedFilename, combinedCsv);
    logger.info(`  Saved ${combinedData.length} total providers to ${combinedFilename}`);
  }
  
  // Summary by city
  logger.info('\n=== Final Summary by City ===');
  for (const location of LOCATIONS) {
    logger.info(`\n${location.state}:`);
    for (const city of location.cities) {
      const cityDentists = filteredData.dentists.filter(p => 
        p.practiceCity.toUpperCase() === city.toUpperCase()
      ).length;
      const cityDerms = filteredData.dermatologists.filter(p => 
        p.practiceCity.toUpperCase() === city.toUpperCase()
      ).length;
      const cityPlastic = filteredData.plasticSurgeons.filter(p => 
        p.practiceCity.toUpperCase() === city.toUpperCase()
      ).length;
      
      if (cityDentists + cityDerms + cityPlastic > 0) {
        logger.info(`  ${city}: ${cityDentists} dentists, ${cityDerms} dermatologists, ${cityPlastic} plastic surgeons`);
      }
    }
  }
  
  // Final totals
  logger.info('\n=== Final Collection Summary ===');
  logger.info(`Total Unique Dentists: ${filteredData.dentists.length}`);
  logger.info(`Total Unique Dermatologists: ${filteredData.dermatologists.length}`);
  logger.info(`Total Unique Plastic Surgeons: ${filteredData.plasticSurgeons.length}`);
  logger.info(`Grand Total: ${combinedData.length} providers`);
  
  logger.info('\nData collection complete!');
}

// Run the script
main().catch(console.error);