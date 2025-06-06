const fs = require('fs');
const https = require('https');
const { parse } = require('json2csv');

/**
 * Comprehensive MedSpa Finder
 * 
 * This script uses multiple strategies to find medspas:
 * 1. NPI Registry - Organization search with keywords
 * 2. Business name patterns
 * 3. Provider associations (dermatologists/plastic surgeons with business entities)
 * 4. Web scraping preparation for business directories
 */

// MedSpa identification keywords
const MEDSPA_KEYWORDS = {
  primary: [
    'medspa', 'med spa', 'medical spa', 'medi spa', 'medispa',
    'med-spa', 'medi-spa', 'medical aesthetics', 'aesthetic medicine'
  ],
  secondary: [
    'aesthetic center', 'aesthetics clinic', 'rejuvenation center',
    'laser center', 'laser clinic', 'cosmetic center', 'cosmetic clinic',
    'wellness center', 'wellness spa', 'beauty clinic', 'skin center',
    'skin clinic', 'anti-aging center', 'anti aging clinic',
    'body contouring', 'body sculpting', 'injection clinic',
    'botox clinic', 'dermatology center', 'plastic surgery center'
  ],
  services: [
    'botox', 'dysport', 'xeomin', 'filler', 'juvederm', 'restylane',
    'sculptra', 'kybella', 'coolsculpting', 'emsculpt', 'morpheus8',
    'microneedling', 'prp', 'vampire facial', 'chemical peel',
    'hydrafacial', 'laser hair removal', 'ipl', 'photofacial',
    'ultherapy', 'thermage', 'thread lift', 'pdo threads',
    'iv therapy', 'vitamin injection', 'weight loss injection',
    'semaglutide', 'tirzepatide', 'hormone therapy', 'pellet therapy'
  ]
};

// States to search
const STATES = ['NY', 'FL'];

// NPI API endpoint
const NPI_API_URL = 'https://npiregistry.cms.hhs.gov/api';

// Sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Make API request
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
      await sleep(1000 * (i + 1));
    }
  }
}

// Calculate medspa confidence score
function calculateMedSpaScore(provider) {
  let score = 0;
  const orgName = (provider.basic?.organization_name || '').toLowerCase();
  const taxonomies = provider.taxonomies || [];
  
  // Check primary keywords (highest weight)
  for (const keyword of MEDSPA_KEYWORDS.primary) {
    if (orgName.includes(keyword)) score += 30;
  }
  
  // Check secondary keywords
  for (const keyword of MEDSPA_KEYWORDS.secondary) {
    if (orgName.includes(keyword)) score += 20;
  }
  
  // Check service keywords
  for (const keyword of MEDSPA_KEYWORDS.services) {
    if (orgName.includes(keyword)) score += 10;
  }
  
  // Check if has aesthetic-related providers
  const aestheticTaxonomies = [
    '207N00000X', // Dermatology
    '208200000X', // Plastic Surgery
    '207W00000X', // Ophthalmology
    '163WP0218X', // Nurse Practitioner
    '363LP0200X'  // Physician Assistant
  ];
  
  for (const taxonomy of taxonomies) {
    if (aestheticTaxonomies.includes(taxonomy.code)) {
      score += 15;
    }
  }
  
  // Penalty for obvious non-medspa terms
  const exclusions = ['hospital', 'emergency', 'urgent care', 'pediatric', 'dental'];
  for (const exclusion of exclusions) {
    if (orgName.includes(exclusion)) score -= 50;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Extract medspa data
function extractMedSpaData(provider) {
  const basic = provider.basic || {};
  const addresses = provider.addresses || [];
  const taxonomies = provider.taxonomies || [];
  const practiceLocation = addresses.find(addr => addr.address_purpose === 'LOCATION') || addresses[0] || {};
  const score = calculateMedSpaScore(provider);
  
  // Determine services offered based on name
  const detectedServices = [];
  const orgName = (basic.organization_name || '').toLowerCase();
  
  for (const service of MEDSPA_KEYWORDS.services) {
    if (orgName.includes(service)) {
      detectedServices.push(service);
    }
  }
  
  return {
    npi: provider.number,
    organizationName: basic.organization_name || '',
    doingBusinessAs: basic.name || '',
    authorizedOfficial: `${basic.authorized_official_first_name || ''} ${basic.authorized_official_last_name || ''}`.trim(),
    authorizedOfficialTitle: basic.authorized_official_title_or_position || '',
    
    // Location
    address1: practiceLocation.address_1 || '',
    address2: practiceLocation.address_2 || '',
    city: practiceLocation.city || '',
    state: practiceLocation.state || '',
    zip: practiceLocation.postal_code || '',
    phone: practiceLocation.telephone_number || '',
    fax: practiceLocation.fax_number || '',
    
    // Confidence and categorization
    confidenceScore: score,
    confidenceLevel: score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low',
    detectedServices: detectedServices.join('; '),
    
    // Provider information
    providerTypes: taxonomies.map(t => t.desc).join('; '),
    taxonomyCodes: taxonomies.map(t => t.code).join('; '),
    
    // Metadata
    lastUpdated: basic.last_updated || '',
    status: basic.status || '',
    
    // Business details
    isChain: orgName.includes('franchise') || orgName.includes('chain') ? 'Possible' : 'Unknown',
    
    // Additional classification
    primaryCategory: score >= 70 ? 'Medical Spa' : 
                    score >= 40 ? 'Possible Medical Spa' : 
                    'Aesthetic Practice'
  };
}

// Search by keyword combinations
async function searchByKeywords(state, keywords) {
  const allResults = [];
  const seenNPIs = new Set();
  
  for (const keyword of keywords) {
    console.log(`    Searching for "${keyword}"...`);
    let skip = 0;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const params = {
          version: '2.1',
          state: state,
          organization_name: `*${keyword}*`,
          enumeration_type: 'NPI-2',
          limit: 200,
          skip: skip
        };
        
        const response = await makeApiRequest(params);
        
        if (response.results && response.results.length > 0) {
          for (const result of response.results) {
            if (!seenNPIs.has(result.number)) {
              seenNPIs.add(result.number);
              allResults.push(result);
            }
          }
          
          if (response.results.length < 200) {
            hasMore = false;
          } else {
            skip += 200;
            if (skip > 1000) hasMore = false; // Limit per keyword
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`      Error: ${error.message}`);
        hasMore = false;
      }
      
      await sleep(100);
    }
    
    console.log(`      Found ${allResults.length} total organizations`);
  }
  
  return allResults;
}

// Find provider-owned businesses
async function findProviderOwnedBusinesses(state) {
  console.log(`  Searching for provider-owned aesthetic businesses...`);
  const businesses = [];
  
  // Search for businesses owned by dermatologists and plastic surgeons
  const providerTypes = [
    { last_name: 'MD', description: 'physician-owned' },
    { last_name: 'DO', description: 'physician-owned' },
    { last_name: 'PA', description: 'PA-owned' },
    { last_name: 'NP', description: 'NP-owned' }
  ];
  
  for (const providerType of providerTypes) {
    let skip = 0;
    let hasMore = true;
    
    while (hasMore && skip < 1000) {
      try {
        const params = {
          version: '2.1',
          state: state,
          authorized_official_last_name: `*${providerType.last_name}*`,
          enumeration_type: 'NPI-2',
          limit: 200,
          skip: skip
        };
        
        const response = await makeApiRequest(params);
        
        if (response.results && response.results.length > 0) {
          // Filter for potential medspas
          const filtered = response.results.filter(org => {
            const score = calculateMedSpaScore(org);
            return score > 20;
          });
          
          businesses.push(...filtered);
          
          if (response.results.length < 200) {
            hasMore = false;
          } else {
            skip += 200;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        hasMore = false;
      }
      
      await sleep(100);
    }
  }
  
  console.log(`    Found ${businesses.length} potential provider-owned medspas`);
  return businesses;
}

// Main execution
async function main() {
  console.log('Comprehensive MedSpa Finder - NY & FL');
  console.log('=====================================\n');
  
  const allMedSpas = [];
  const uniqueNPIs = new Set();
  
  for (const state of STATES) {
    console.log(`\n=== Processing ${state} ===`);
    
    // Strategy 1: Search by primary keywords
    console.log('\nStrategy 1: Primary MedSpa Keywords');
    const primaryResults = await searchByKeywords(state, MEDSPA_KEYWORDS.primary);
    
    // Strategy 2: Search by secondary keywords
    console.log('\nStrategy 2: Secondary Keywords');
    const secondaryResults = await searchByKeywords(state, MEDSPA_KEYWORDS.secondary.slice(0, 10));
    
    // Strategy 3: Search by service keywords
    console.log('\nStrategy 3: Service Keywords');
    const serviceResults = await searchByKeywords(state, MEDSPA_KEYWORDS.services.slice(0, 10));
    
    // Strategy 4: Provider-owned businesses
    console.log('\nStrategy 4: Provider-Owned Businesses');
    const providerBusinesses = await findProviderOwnedBusinesses(state);
    
    // Combine all results
    const allStateResults = [
      ...primaryResults,
      ...secondaryResults,
      ...serviceResults,
      ...providerBusinesses
    ];
    
    // Process and score each potential medspa
    console.log(`\nProcessing ${allStateResults.length} potential medspas...`);
    
    for (const provider of allStateResults) {
      if (!uniqueNPIs.has(provider.number)) {
        uniqueNPIs.add(provider.number);
        const medSpaData = extractMedSpaData(provider);
        
        // Only include if confidence score is above threshold
        if (medSpaData.confidenceScore >= 20) {
          allMedSpas.push(medSpaData);
        }
      }
    }
    
    // State summary
    const stateMedSpas = allMedSpas.filter(m => m.state === state);
    console.log(`\n${state} Summary:`);
    console.log(`  High Confidence MedSpas: ${stateMedSpas.filter(m => m.confidenceLevel === 'High').length}`);
    console.log(`  Medium Confidence MedSpas: ${stateMedSpas.filter(m => m.confidenceLevel === 'Medium').length}`);
    console.log(`  Low Confidence MedSpas: ${stateMedSpas.filter(m => m.confidenceLevel === 'Low').length}`);
    console.log(`  Total: ${stateMedSpas.length}`);
  }
  
  // Sort by confidence score
  allMedSpas.sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  // Save to CSV
  console.log('\n=== Saving MedSpa Data ===');
  
  const fields = [
    'npi', 'organizationName', 'doingBusinessAs', 
    'authorizedOfficial', 'authorizedOfficialTitle',
    'address1', 'address2', 'city', 'state', 'zip', 'phone', 'fax',
    'confidenceScore', 'confidenceLevel', 'primaryCategory',
    'detectedServices', 'providerTypes', 'taxonomyCodes',
    'isChain', 'lastUpdated', 'status'
  ];
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Save all medspas
  if (allMedSpas.length > 0) {
    const csv = parse(allMedSpas, { fields });
    const filename = `medspas_comprehensive_NY_FL_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`Saved ${allMedSpas.length} medspas to ${filename}`);
  }
  
  // Save high-confidence medspas separately
  const highConfidence = allMedSpas.filter(m => m.confidenceLevel === 'High');
  if (highConfidence.length > 0) {
    const csv = parse(highConfidence, { fields });
    const filename = `medspas_high_confidence_NY_FL_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`Saved ${highConfidence.length} high-confidence medspas to ${filename}`);
  }
  
  // Create a summary report
  const summaryData = {
    totalMedSpasFound: allMedSpas.length,
    byState: {
      NY: allMedSpas.filter(m => m.state === 'NY').length,
      FL: allMedSpas.filter(m => m.state === 'FL').length
    },
    byConfidence: {
      high: allMedSpas.filter(m => m.confidenceLevel === 'High').length,
      medium: allMedSpas.filter(m => m.confidenceLevel === 'Medium').length,
      low: allMedSpas.filter(m => m.confidenceLevel === 'Low').length
    },
    topServices: {},
    topCities: {}
  };
  
  // Count services
  allMedSpas.forEach(m => {
    const services = m.detectedServices.split('; ').filter(s => s);
    services.forEach(service => {
      summaryData.topServices[service] = (summaryData.topServices[service] || 0) + 1;
    });
    
    // Count cities
    if (m.city) {
      summaryData.topCities[m.city] = (summaryData.topCities[m.city] || 0) + 1;
    }
  });
  
  // Save summary
  fs.writeFileSync(
    `medspa_summary_${timestamp}.json`,
    JSON.stringify(summaryData, null, 2)
  );
  
  console.log('\n=== Final Summary ===');
  console.log(`Total MedSpas Found: ${allMedSpas.length}`);
  console.log(`  NY: ${summaryData.byState.NY}`);
  console.log(`  FL: ${summaryData.byState.FL}`);
  console.log(`\nBy Confidence Level:`);
  console.log(`  High: ${summaryData.byConfidence.high}`);
  console.log(`  Medium: ${summaryData.byConfidence.medium}`);
  console.log(`  Low: ${summaryData.byConfidence.low}`);
  
  // Show top cities
  const topCities = Object.entries(summaryData.topCities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('\nTop 10 Cities:');
  topCities.forEach(([city, count]) => {
    console.log(`  ${city}: ${count}`);
  });
  
  console.log('\nMedSpa data collection complete!');
  console.log('\nNext steps for even more comprehensive data:');
  console.log('1. Scrape Google Maps/Places API for "medical spa" searches');
  console.log('2. Cross-reference with state business registrations');
  console.log('3. Scrape Yelp, Groupon, and other directories');
  console.log('4. Check Instagram/Facebook business pages');
  console.log('5. Use RealSelf and similar aesthetic procedure directories');
}

// Run the script
main().catch(console.error);