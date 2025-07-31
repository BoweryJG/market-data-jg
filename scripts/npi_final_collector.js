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
    { code: '2082S0105X', desc: 'Surgery of the Hand' }
  ]
};

// Target locations
const LOCATIONS = [
  { 
    state: 'NY', 
    cities: ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'],
    postalCodes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010',
                  '10011', '10012', '10013', '10014', '10016', '10017', '10018', '10019', '10020', '10021',
                  '10022', '10023', '10024', '10025', '10026', '10027', '10028', '10029', '10030', '10031',
                  '10032', '10033', '10034', '10035', '10036', '10037', '10038', '10039', '10040', '10044',
                  '10065', '10069', '10075', '10128', '10280', '10282', '11201', '11203', '11204', '11205',
                  '11206', '11207', '11208', '11209', '11210', '11211', '11212', '11213', '11214', '11215',
                  '11216', '11217', '11218', '11219', '11220', '11221', '11222', '11223', '11224', '11225',
                  '11226', '11228', '11229', '11230', '11231', '11232', '11233', '11234', '11235', '11236',
                  '11237', '11238', '11239']
  },
  { 
    state: 'FL',
    cities: ['Miami', 'Miami Beach', 'Coral Gables', 'Aventura', 'Fort Lauderdale', 'Boca Raton'],
    postalCodes: ['33101', '33102', '33109', '33110', '33111', '33112', '33114', '33116', '33119', '33122',
                  '33124', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133',
                  '33134', '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142', '33143',
                  '33144', '33145', '33146', '33147', '33149', '33150', '33151', '33152', '33153', '33154',
                  '33155', '33156', '33157', '33158', '33160', '33161', '33162', '33163', '33164', '33165',
                  '33166', '33167', '33168', '33169', '33170', '33172', '33173', '33174', '33175', '33176',
                  '33177', '33178', '33179', '33180', '33181', '33182', '33183', '33184', '33185', '33186',
                  '33187', '33189', '33190', '33193', '33194', '33196', '33301', '33304', '33305', '33306',
                  '33308', '33309', '33310', '33311', '33312', '33313', '33314', '33315', '33316', '33317',
                  '33319', '33431', '33432', '33433', '33434']
  }
];

// Sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Make API request
async function makeApiRequest(params) {
  return new Promise((resolve, reject) => {
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
  }
  
  return null;
}

// Fetch providers by postal code
async function fetchByPostalCode(postalCode, enumType = 'NPI-1') {
  const providers = [];
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const params = {
        version: '2.1',
        postal_code: postalCode,
        enumeration_type: enumType,
        limit: 200,
        skip: skip
      };
      
      const response = await makeApiRequest(params);
      
      if (response.results && response.results.length > 0) {
        providers.push(...response.results);
        
        if (response.results.length < 200) {
          hasMore = false;
        } else {
          skip += 200;
          await sleep(100); // Rate limiting
        }
        
        // Safety limit
        if (skip > 5000) {
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
  logger.info('NPI Registry Comprehensive Data Collection');
  logger.info('=========================================\n');
  
  const allData = {
    dentists: [],
    dermatologists: [],
    plasticSurgeons: []
  };
  
  const uniqueNPIs = new Set();
  let totalProcessed = 0;
  
  // Process each location
  for (const location of LOCATIONS) {
    logger.info(`\n=== Processing ${location.state} ===`);
    logger.info(`Searching ${location.postalCodes.length} postal codes...`);
    
    for (let i = 0; i < location.postalCodes.length; i++) {
      const postalCode = location.postalCodes[i];
      logger.info(`\nPostal code ${postalCode} (${i + 1}/${location.postalCodes.length})...`);
      
      // Search individuals
      logger.info('  Searching individual providers...');
      const individuals = await fetchByPostalCode(postalCode, 'NPI-1');
      logger.info(`    Found ${individuals.length} individual providers`);
      
      // Search organizations
      logger.info('  Searching organizations...');
      const organizations = await fetchByPostalCode(postalCode, 'NPI-2');
      logger.info(`    Found ${organizations.length} organizations`);
      
      // Process all providers
      const allProviders = [...individuals, ...organizations];
      let counts = { dentist: 0, dermatologist: 0, plastic_surgeon: 0 };
      
      for (const provider of allProviders) {
        const category = categorizeProvider(provider);
        if (category && !uniqueNPIs.has(provider.number)) {
          uniqueNPIs.add(provider.number);
          const providerData = extractProviderData(provider, category);
          
          if (category === 'dentist') {
            allData.dentists.push(providerData);
            counts.dentist++;
          } else if (category === 'dermatologist') {
            allData.dermatologists.push(providerData);
            counts.dermatologist++;
          } else if (category === 'plastic_surgeon') {
            allData.plasticSurgeons.push(providerData);
            counts.plastic_surgeon++;
          }
          
          totalProcessed++;
        }
      }
      
      logger.info(`    Relevant: ${counts.dentist} dentists, ${counts.dermatologist} dermatologists, ${counts.plastic_surgeon} plastic surgeons`);
      logger.info(`    Total collected so far: ${totalProcessed}`);
      
      // Rate limiting between postal codes
      await sleep(200);
    }
    
    logger.info(`\n${location.state} Summary:`);
    logger.info(`  Dentists: ${allData.dentists.filter(p => p.practiceState === location.state).length}`);
    logger.info(`  Dermatologists: ${allData.dermatologists.filter(p => p.practiceState === location.state).length}`);
    logger.info(`  Plastic Surgeons: ${allData.plasticSurgeons.filter(p => p.practiceState === location.state).length}`);
  }
  
  // Save to CSV files
  logger.info('\n=== Saving Data ===');
  
  const fields = [
    'npi', 'firstName', 'lastName', 'middleName', 'credential',
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
  
  // Save dentists
  if (allData.dentists.length > 0) {
    const csv = parse(allData.dentists, { fields });
    const filename = `npi_dentists_complete_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`Saved ${allData.dentists.length} dentists to ${filename}`);
  }
  
  // Save dermatologists
  if (allData.dermatologists.length > 0) {
    const csv = parse(allData.dermatologists, { fields });
    const filename = `npi_dermatologists_complete_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`Saved ${allData.dermatologists.length} dermatologists to ${filename}`);
  }
  
  // Save plastic surgeons
  if (allData.plasticSurgeons.length > 0) {
    const csv = parse(allData.plasticSurgeons, { fields });
    const filename = `npi_plastic_surgeons_complete_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`Saved ${allData.plasticSurgeons.length} plastic surgeons to ${filename}`);
  }
  
  // Save combined
  const combinedData = [
    ...allData.dentists,
    ...allData.dermatologists,
    ...allData.plasticSurgeons
  ];
  
  if (combinedData.length > 0) {
    const combinedCsv = parse(combinedData, { fields });
    const combinedFilename = `npi_all_providers_complete_${timestamp}.csv`;
    fs.writeFileSync(combinedFilename, combinedCsv);
    logger.info(`Saved ${combinedData.length} total providers to ${combinedFilename}`);
  }
  
  // Final summary
  logger.info('\n=== FINAL SUMMARY ===');
  logger.info(`Total Dentists: ${allData.dentists.length}`);
  logger.info(`Total Dermatologists: ${allData.dermatologists.length}`);
  logger.info(`Total Plastic Surgeons: ${allData.plasticSurgeons.length}`);
  logger.info(`Grand Total: ${combinedData.length} providers`);
  
  // City breakdown
  logger.info('\n=== City Breakdown ===');
  const targetCities = LOCATIONS.flatMap(loc => loc.cities);
  for (const city of targetCities) {
    const cityDentists = allData.dentists.filter(p => 
      p.practiceCity.toLowerCase() === city.toLowerCase()
    ).length;
    const cityDerms = allData.dermatologists.filter(p => 
      p.practiceCity.toLowerCase() === city.toLowerCase()
    ).length;
    const cityPlastic = allData.plasticSurgeons.filter(p => 
      p.practiceCity.toLowerCase() === city.toLowerCase()
    ).length;
    
    if (cityDentists + cityDerms + cityPlastic > 0) {
      logger.info(`${city}: ${cityDentists} dentists, ${cityDerms} dermatologists, ${cityPlastic} plastic surgeons`);
    }
  }
  
  logger.info('\nData collection complete!');
}

// Run the script
main().catch(console.error);