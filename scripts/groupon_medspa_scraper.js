const puppeteer = require('puppeteer');
const fs = require('fs');
const { parse } = require('json2csv');

// Groupon MedSpa Scraper
// Finds medical spas advertising on Groupon in NY and FL

const LOCATIONS = [
  // New York
  { city: 'New York', state: 'NY', searchQuery: 'new-york' },
  { city: 'Manhattan', state: 'NY', searchQuery: 'manhattan-ny' },
  { city: 'Brooklyn', state: 'NY', searchQuery: 'brooklyn' },
  { city: 'Queens', state: 'NY', searchQuery: 'queens' },
  { city: 'Long Island', state: 'NY', searchQuery: 'long-island' },
  { city: 'Buffalo', state: 'NY', searchQuery: 'buffalo' },
  { city: 'Rochester', state: 'NY', searchQuery: 'rochester' },
  { city: 'Albany', state: 'NY', searchQuery: 'albany' },
  
  // Florida
  { city: 'Miami', state: 'FL', searchQuery: 'miami' },
  { city: 'Fort Lauderdale', state: 'FL', searchQuery: 'fort-lauderdale' },
  { city: 'West Palm Beach', state: 'FL', searchQuery: 'west-palm-beach' },
  { city: 'Orlando', state: 'FL', searchQuery: 'orlando' },
  { city: 'Tampa', state: 'FL', searchQuery: 'tampa' },
  { city: 'Jacksonville', state: 'FL', searchQuery: 'jacksonville' },
  { city: 'Naples', state: 'FL', searchQuery: 'naples-fl' },
  { city: 'Sarasota', state: 'FL', searchQuery: 'sarasota' }
];

const SEARCH_CATEGORIES = [
  'beauty-and-spas/spa-services/medical-spa',
  'beauty-and-spas/spa-services',
  'beauty-and-spas/cosmetic-procedures'
];

// Keywords to identify medical spas
const MEDSPA_KEYWORDS = [
  'medspa', 'med spa', 'medical spa', 'medi spa',
  'botox', 'dysport', 'xeomin', 'filler', 'juvederm', 'restylane',
  'laser', 'ipl', 'coolsculpting', 'hydrafacial', 'microneedling',
  'prp', 'vampire', 'chemical peel', 'dermaplaning',
  'aesthetic', 'cosmetic', 'rejuvenation', 'anti-aging'
];

// Extract medspa data from deal
function extractMedSpaData(deal, location) {
  return {
    businessName: deal.merchantName || '',
    dealTitle: deal.title || '',
    location: deal.location || location.city,
    state: location.state,
    neighborhood: deal.neighborhood || '',
    
    // Pricing
    originalPrice: deal.originalPrice || '',
    discountedPrice: deal.price || '',
    discountPercent: deal.discount || '',
    
    // Services detected
    servicesDetected: detectServices(deal.title + ' ' + deal.description),
    
    // Deal details
    dealDescription: (deal.description || '').substring(0, 500),
    highlights: deal.highlights || [],
    
    // Business info
    address: deal.address || '',
    phone: deal.phone || '',
    website: deal.website || '',
    
    // Ratings
    rating: deal.rating || '',
    reviewCount: deal.reviewCount || 0,
    
    // Metadata
    dealUrl: deal.url || '',
    expirationDate: deal.expirationDate || '',
    soldCount: deal.soldCount || 0,
    
    // Categories
    categories: deal.categories || [],
    tags: deal.tags || [],
    
    // Confidence score
    confidenceScore: calculateConfidence(deal),
    isLikelyMedSpa: false,
    
    // Scrape metadata
    scrapedDate: new Date().toISOString(),
    source: 'Groupon'
  };
}

// Detect services from text
function detectServices(text) {
  const textLower = text.toLowerCase();
  const services = [];
  
  const serviceKeywords = {
    'Botox/Neurotoxins': ['botox', 'dysport', 'xeomin', 'jeuveau'],
    'Dermal Fillers': ['filler', 'juvederm', 'restylane', 'sculptra', 'radiesse'],
    'Laser Treatments': ['laser', 'ipl', 'bbl', 'photofacial', 'resurfacing'],
    'Body Contouring': ['coolsculpting', 'emsculpt', 'sculpsure', 'velashape', 'body contouring'],
    'Skin Treatments': ['hydrafacial', 'microneedling', 'chemical peel', 'dermaplaning'],
    'Injectables': ['kybella', 'prp', 'vampire', 'pdo threads'],
    'Hair Removal': ['laser hair removal', 'hair removal'],
    'IV Therapy': ['iv therapy', 'vitamin injection', 'b12 shot'],
    'Weight Loss': ['semaglutide', 'tirzepatide', 'weight loss injection']
  };
  
  for (const [category, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      services.push(category);
    }
  }
  
  return services.join('; ');
}

// Calculate confidence score
function calculateConfidence(deal) {
  let score = 0;
  const text = `${deal.merchantName} ${deal.title} ${deal.description}`.toLowerCase();
  
  // Check merchant name
  MEDSPA_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) score += 20;
  });
  
  // Check categories
  if (deal.categories && deal.categories.some(cat => cat.includes('medical-spa'))) {
    score += 50;
  }
  
  // Check for medical procedures
  const medicalProcedures = ['botox', 'filler', 'laser', 'injection', 'vitamin', 'prp'];
  medicalProcedures.forEach(procedure => {
    if (text.includes(procedure)) score += 15;
  });
  
  // Penalty for non-medical
  const nonMedical = ['massage', 'facial', 'manicure', 'pedicure', 'hair cut', 'salon'];
  nonMedical.forEach(term => {
    if (text.includes(term) && !text.includes('medical')) score -= 10;
  });
  
  return Math.max(0, Math.min(100, score));
}

// Scrape Groupon for a location
async function scrapeGrouponLocation(browser, location) {
  console.log(`\nScraping ${location.city}, ${location.state}...`);
  const deals = [];
  
  for (const category of SEARCH_CATEGORIES) {
    try {
      const url = `https://www.groupon.com/${location.searchQuery}/${category}`;
      console.log(`  Checking category: ${category}`);
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Extract deals
      const pageDeals = await page.evaluate(() => {
        const dealElements = document.querySelectorAll('div[data-testid="deal-card"]');
        const extractedDeals = [];
        
        dealElements.forEach(element => {
          try {
            const deal = {
              merchantName: element.querySelector('h3')?.textContent?.trim() || '',
              title: element.querySelector('h4')?.textContent?.trim() || '',
              description: element.querySelector('p')?.textContent?.trim() || '',
              price: element.querySelector('[data-testid="deal-price"]')?.textContent?.trim() || '',
              originalPrice: element.querySelector('s')?.textContent?.trim() || '',
              rating: element.querySelector('[aria-label*="rating"]')?.textContent?.trim() || '',
              soldCount: element.querySelector('[data-testid="quantity-sold"]')?.textContent?.trim() || '',
              location: element.querySelector('[data-testid="merchant-location"]')?.textContent?.trim() || '',
              url: element.querySelector('a')?.href || ''
            };
            
            if (deal.merchantName || deal.title) {
              extractedDeals.push(deal);
            }
          } catch (e) {
            console.error('Error extracting deal:', e);
          }
        });
        
        return extractedDeals;
      });
      
      console.log(`    Found ${pageDeals.length} deals`);
      
      // Process each deal
      pageDeals.forEach(deal => {
        const medSpaData = extractMedSpaData(deal, location);
        if (medSpaData.confidenceScore >= 30) {
          medSpaData.isLikelyMedSpa = true;
          deals.push(medSpaData);
        }
      });
      
      await page.close();
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  Error scraping ${category}:`, error.message);
    }
  }
  
  console.log(`  Total qualifying medspas found: ${deals.length}`);
  return deals;
}

// Main execution
async function main() {
  console.log('Groupon MedSpa Scraper');
  console.log('======================\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allMedSpas = [];
  const seenBusinesses = new Set();
  
  try {
    // Scrape each location
    for (const location of LOCATIONS) {
      const locationDeals = await scrapeGrouponLocation(browser, location);
      
      // Deduplicate by business name
      locationDeals.forEach(deal => {
        const key = `${deal.businessName}-${deal.state}`;
        if (!seenBusinesses.has(key)) {
          seenBusinesses.add(key);
          allMedSpas.push(deal);
        }
      });
      
      // Rate limiting between locations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
  
  // Sort by confidence score
  allMedSpas.sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  // Save results
  console.log('\n=== Saving Results ===');
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Save all medspas
  if (allMedSpas.length > 0) {
    // CSV fields
    const fields = [
      'businessName', 'location', 'state', 'neighborhood',
      'dealTitle', 'servicesDetected',
      'originalPrice', 'discountedPrice', 'discountPercent',
      'rating', 'reviewCount', 'soldCount',
      'address', 'phone', 'website',
      'confidenceScore', 'isLikelyMedSpa',
      'dealDescription', 'dealUrl',
      'scrapedDate', 'source'
    ];
    
    const csv = parse(allMedSpas, { fields });
    const filename = `groupon_medspas_NY_FL_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`Saved ${allMedSpas.length} medspas to ${filename}`);
    
    // Save high confidence separately
    const highConfidence = allMedSpas.filter(m => m.confidenceScore >= 70);
    if (highConfidence.length > 0) {
      const csvHigh = parse(highConfidence, { fields });
      const filenameHigh = `groupon_medspas_high_confidence_${timestamp}.csv`;
      fs.writeFileSync(filenameHigh, csvHigh);
      console.log(`Saved ${highConfidence.length} high-confidence medspas to ${filenameHigh}`);
    }
    
    // Save JSON for analysis
    fs.writeFileSync(
      `groupon_medspas_${timestamp}.json`,
      JSON.stringify(allMedSpas, null, 2)
    );
  }
  
  // Summary statistics
  console.log('\n=== Summary ===');
  console.log(`Total MedSpas Found: ${allMedSpas.length}`);
  
  // By state
  const byState = {};
  allMedSpas.forEach(m => {
    byState[m.state] = (byState[m.state] || 0) + 1;
  });
  
  console.log('\nBy State:');
  Object.entries(byState).forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`);
  });
  
  // By confidence
  console.log('\nBy Confidence:');
  console.log(`  High (70+): ${allMedSpas.filter(m => m.confidenceScore >= 70).length}`);
  console.log(`  Medium (50-69): ${allMedSpas.filter(m => m.confidenceScore >= 50 && m.confidenceScore < 70).length}`);
  console.log(`  Low (30-49): ${allMedSpas.filter(m => m.confidenceScore < 50).length}`);
  
  // Top services
  const serviceCounts = {};
  allMedSpas.forEach(m => {
    const services = m.servicesDetected.split('; ');
    services.forEach(service => {
      if (service) serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
  });
  
  console.log('\nTop Services Offered:');
  Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([service, count]) => {
      console.log(`  ${service}: ${count}`);
    });
  
  console.log('\nGroupon scraping complete!');
}

// Run the scraper
main().catch(console.error);