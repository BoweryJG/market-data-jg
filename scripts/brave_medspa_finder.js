import { logger } from '@/services/logging/logger';

const fs = require('fs');
const { parse } = require('json2csv');

// Use Brave Search API to find medspas
// This is more reliable than web scraping and provides rich results

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || 'BSA9AzPzmrTcPfaAxx0keBgoelvQoMp';

const LOCATIONS = [
  // New York
  { city: 'New York City', state: 'NY' },
  { city: 'Manhattan', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Queens', state: 'NY' },
  { city: 'Long Island', state: 'NY' },
  { city: 'Buffalo', state: 'NY' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Albany', state: 'NY' },
  { city: 'Syracuse', state: 'NY' },
  
  // Florida
  { city: 'Miami', state: 'FL' },
  { city: 'Fort Lauderdale', state: 'FL' },
  { city: 'West Palm Beach', state: 'FL' },
  { city: 'Boca Raton', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Naples', state: 'FL' },
  { city: 'Sarasota', state: 'FL' },
  { city: 'Fort Myers', state: 'FL' }
];

const SEARCH_QUERIES = [
  'medical spa',
  'medspa',
  'botox clinic',
  'aesthetic center',
  'cosmetic dermatology',
  'laser clinic',
  'anti aging clinic',
  'wellness spa medical'
];

// Extract business info from search result
function extractBusinessInfo(result, query, location) {
  const description = result.description || '';
  const title = result.title || '';
  
  return {
    businessName: extractBusinessName(title),
    title: title,
    description: description,
    url: result.url || '',
    displayUrl: result.display_url || '',
    
    // Location
    city: location.city,
    state: location.state,
    address: extractAddress(description),
    
    // Contact
    phone: extractPhone(description),
    
    // Services
    servicesDetected: detectServices(`${title} ${description}`),
    
    // Confidence scoring
    confidenceScore: calculateConfidence(result, query),
    isLikelyMedSpa: false,
    
    // Search metadata
    searchQuery: query,
    searchRank: result.rank || 0,
    
    // Additional info
    snippet: result.meta_description || description.substring(0, 200),
    
    // Source
    source: 'Brave Search',
    scrapedDate: new Date().toISOString()
  };
}

// Extract business name from title
function extractBusinessName(title) {
  // Remove common suffixes
  let name = title.replace(/\s*[-|•·]\s*.*/g, '');
  name = name.replace(/\s*(Medical Spa|MedSpa|Med Spa|Medspa).*/i, '$1');
  return name.trim();
}

// Extract address from text
function extractAddress(text) {
  const addressPattern = /\d+\s+[\w\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)/i;
  const match = text.match(addressPattern);
  return match ? match[0] : '';
}

// Extract phone from text
function extractPhone(text) {
  const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phonePattern);
  return match ? match[0] : '';
}

// Detect services
function detectServices(text) {
  const textLower = text.toLowerCase();
  const services = [];
  
  const serviceCategories = {
    'Injectables': ['botox', 'dysport', 'xeomin', 'filler', 'juvederm', 'restylane'],
    'Laser': ['laser', 'ipl', 'bbl', 'fraxel', 'co2'],
    'Body Contouring': ['coolsculpting', 'emsculpt', 'sculpsure', 'velashape'],
    'Skin Treatments': ['hydrafacial', 'microneedling', 'chemical peel', 'dermaplaning'],
    'Wellness': ['iv therapy', 'vitamin injection', 'hormone', 'weight loss']
  };
  
  for (const [category, keywords] of Object.entries(serviceCategories)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      services.push(category);
    }
  }
  
  return services.join('; ') || 'General Aesthetic Services';
}

// Calculate confidence score
function calculateConfidence(result, query) {
  let score = 50; // Base score
  const text = `${result.title} ${result.description}`.toLowerCase();
  
  // Title matches
  if (result.title.toLowerCase().includes('medical spa') || 
      result.title.toLowerCase().includes('medspa')) {
    score += 30;
  }
  
  // URL indicators
  const url = result.url.toLowerCase();
  if (url.includes('medspa') || url.includes('medical-spa')) {
    score += 20;
  }
  
  // Service keywords
  const medicalKeywords = ['botox', 'filler', 'laser', 'dermatology', 'aesthetic', 'cosmetic'];
  medicalKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 10;
  });
  
  // Negative indicators
  const nonMedical = ['salon', 'barbershop', 'nail', 'hair'];
  nonMedical.forEach(term => {
    if (text.includes(term) && !text.includes('medical')) score -= 20;
  });
  
  return Math.max(0, Math.min(100, score));
}

// Search using Brave API
async function searchBrave(query) {
  const https = require('https');
  const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=20`;
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    };
    
    https.get(searchUrl, options, (res) => {
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

// Search for medspas in a location
async function searchLocation(location) {
  logger.info(`\nSearching ${location.city}, ${location.state}...`);
  const allResults = [];
  const seenUrls = new Set();
  
  for (const baseQuery of SEARCH_QUERIES) {
    const query = `${baseQuery} ${location.city} ${location.state}`;
    logger.info(`  Query: "${query}"`);
    
    try {
      const response = await searchBrave(query);
      
      if (response.web && response.web.results) {
        logger.info(`    Found ${response.web.results.length} results`);
        
        response.web.results.forEach((result, index) => {
          result.rank = index + 1;
          const businessInfo = extractBusinessInfo(result, baseQuery, location);
          
          if (businessInfo.confidenceScore >= 40 && !seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            businessInfo.isLikelyMedSpa = businessInfo.confidenceScore >= 60;
            allResults.push(businessInfo);
          }
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      logger.error(`  Error searching: ${error.message}`);
    }
  }
  
  logger.info(`  Total medspas found: ${allResults.length}`);
  return allResults;
}

// Main execution
async function main() {
  logger.info('Brave Search MedSpa Finder');
  logger.info('==========================\n');
  
  if (!BRAVE_API_KEY) {
    logger.error('Error: BRAVE_SEARCH_API_KEY not set');
    return;
  }
  
  const allMedSpas = [];
  const seenBusinesses = new Set();
  
  // Search each location
  for (const location of LOCATIONS) {
    const locationResults = await searchLocation(location);
    
    // Deduplicate
    locationResults.forEach(result => {
      const key = `${result.businessName}-${result.state}`.toLowerCase();
      if (!seenBusinesses.has(key)) {
        seenBusinesses.add(key);
        allMedSpas.push(result);
      }
    });
  }
  
  // Sort by confidence
  allMedSpas.sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  // Save results
  logger.info('\n=== Saving Results ===');
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (allMedSpas.length > 0) {
    // CSV fields
    const fields = [
      'businessName', 'city', 'state', 'address', 'phone',
      'servicesDetected', 'confidenceScore', 'isLikelyMedSpa',
      'title', 'description', 'url', 'searchQuery', 'searchRank',
      'source', 'scrapedDate'
    ];
    
    // Save all results
    const csv = parse(allMedSpas, { fields });
    const filename = `brave_medspas_NY_FL_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`Saved ${allMedSpas.length} medspas to ${filename}`);
    
    // Save high confidence
    const highConfidence = allMedSpas.filter(m => m.confidenceScore >= 70);
    if (highConfidence.length > 0) {
      const csvHigh = parse(highConfidence, { fields });
      const filenameHigh = `brave_medspas_verified_${timestamp}.csv`;
      fs.writeFileSync(filenameHigh, csvHigh);
      logger.info(`Saved ${highConfidence.length} verified medspas to ${filenameHigh}`);
    }
    
    // Save JSON
    fs.writeFileSync(
      `brave_medspas_${timestamp}.json`,
      JSON.stringify(allMedSpas, null, 2)
    );
  }
  
  // Summary
  logger.info('\n=== Summary ===');
  logger.info(`Total MedSpas Found: ${allMedSpas.length}`);
  
  // By state
  const byState = {};
  allMedSpas.forEach(m => {
    byState[m.state] = (byState[m.state] || 0) + 1;
  });
  
  logger.info('\nBy State:');
  Object.entries(byState).forEach(([state, count]) => {
    logger.info(`  ${state}: ${count}`);
  });
  
  // By confidence
  logger.info('\nBy Confidence:');
  logger.info(`  High (70+): ${allMedSpas.filter(m => m.confidenceScore >= 70).length}`);
  logger.info(`  Medium (50-69): ${allMedSpas.filter(m => m.confidenceScore >= 50 && m.confidenceScore < 70).length}`);
  logger.info(`  Low (40-49): ${allMedSpas.filter(m => m.confidenceScore < 50).length}`);
  
  // Top cities
  const byCities = {};
  allMedSpas.forEach(m => {
    byCities[m.city] = (byCities[m.city] || 0) + 1;
  });
  
  logger.info('\nTop Cities:');
  Object.entries(byCities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([city, count]) => {
      logger.info(`  ${city}: ${count}`);
    });
  
  logger.info('\nBrave search complete!');
}

// Run the script
main().catch(console.error);