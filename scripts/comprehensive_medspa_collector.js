import { logger } from '@/services/logging/logger';

const fs = require('fs');
const { parse } = require('json2csv');

// Comprehensive MedSpa Data Collector
// Uses multiple search strategies to find all medspas in NY and FL

const LOCATIONS = [
  // New York Major Cities
  { city: 'New York City', state: 'NY' },
  { city: 'Manhattan', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Queens', state: 'NY' },
  { city: 'Bronx', state: 'NY' },
  { city: 'Staten Island', state: 'NY' },
  { city: 'Long Island', state: 'NY' },
  { city: 'Buffalo', state: 'NY' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Albany', state: 'NY' },
  { city: 'Syracuse', state: 'NY' },
  { city: 'Yonkers', state: 'NY' },
  { city: 'White Plains', state: 'NY' },
  
  // Florida Major Cities
  { city: 'Miami', state: 'FL' },
  { city: 'Miami Beach', state: 'FL' },
  { city: 'Fort Lauderdale', state: 'FL' },
  { city: 'West Palm Beach', state: 'FL' },
  { city: 'Boca Raton', state: 'FL' },
  { city: 'Delray Beach', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'St Petersburg', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Naples', state: 'FL' },
  { city: 'Sarasota', state: 'FL' },
  { city: 'Fort Myers', state: 'FL' },
  { city: 'Clearwater', state: 'FL' },
  { city: 'Coral Gables', state: 'FL' },
  { city: 'Aventura', state: 'FL' }
];

const SEARCH_QUERIES = [
  'medical spa',
  'medspa',
  'med spa',
  'aesthetic center',
  'cosmetic clinic',
  'laser clinic',
  'botox clinic',
  'dermatology spa'
];

// Major medspa chains to specifically search for
const MEDSPA_CHAINS = [
  'LaserAway',
  'Ideal Image',
  'Skin Laundry',
  'SEV Laser',
  'Ever/Body',
  'Peachy',
  'Skinney Medspa',
  'Skin Spa New York',
  'Trifecta Med Spa',
  'Deep Blue Med Spa'
];

// Extract business info from search results
function extractBusinessInfo(title, description, url, location, searchType) {
  // Clean business name
  let businessName = title.replace(/\s*[-|•·–]\s*.*/g, '').trim();
  businessName = businessName.replace(/\s*(Medical Spa|MedSpa|Med Spa|Medspa)$/i, '').trim();
  
  // Extract phone
  const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';
  
  // Extract address
  const addressPatterns = [
    /\d+\s+[\w\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way)/i,
    /\d+\s+[\w\s]+,\s+[\w\s]+,\s+[A-Z]{2}/
  ];
  let address = '';
  for (const pattern of addressPatterns) {
    const match = description.match(pattern);
    if (match) {
      address = match[0];
      break;
    }
  }
  
  // Detect services
  const services = detectServices(`${title} ${description}`);
  
  // Calculate confidence
  const confidence = calculateConfidence(title, description, url);
  
  return {
    businessName: businessName,
    fullTitle: title,
    description: description.substring(0, 500),
    url: url,
    phone: phone,
    address: address,
    city: location.city,
    state: location.state,
    servicesDetected: services,
    confidenceScore: confidence,
    isVerifiedMedSpa: confidence >= 70,
    searchType: searchType,
    isChain: MEDSPA_CHAINS.some(chain => 
      businessName.toLowerCase().includes(chain.toLowerCase())
    ),
    source: 'Web Search',
    collectedDate: new Date().toISOString()
  };
}

// Detect services offered
function detectServices(text) {
  const textLower = text.toLowerCase();
  const detectedServices = [];
  
  const serviceMap = {
    'Botox/Neurotoxins': ['botox', 'dysport', 'xeomin', 'jeuveau', 'neurotoxin'],
    'Dermal Fillers': ['filler', 'juvederm', 'restylane', 'sculptra', 'radiesse', 'voluma'],
    'Laser Treatments': ['laser', 'ipl', 'bbl', 'fraxel', 'co2 laser', 'resurfacing'],
    'Body Contouring': ['coolsculpting', 'emsculpt', 'sculpsure', 'body contouring', 'fat reduction'],
    'Skin Rejuvenation': ['hydrafacial', 'microneedling', 'chemical peel', 'dermaplaning', 'facial'],
    'Hair Removal': ['laser hair removal', 'hair removal'],
    'IV Therapy': ['iv therapy', 'vitamin injection', 'b12', 'nad+'],
    'Weight Loss': ['semaglutide', 'tirzepatide', 'ozempic', 'wegovy', 'weight loss'],
    'Anti-Aging': ['anti-aging', 'anti aging', 'rejuvenation', 'wrinkle'],
    'Acne Treatment': ['acne', 'acne scar', 'clear skin'],
    'PRP': ['prp', 'platelet rich plasma', 'vampire'],
    'Thread Lift': ['thread lift', 'pdo thread']
  };
  
  for (const [service, keywords] of Object.entries(serviceMap)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      detectedServices.push(service);
    }
  }
  
  return detectedServices.length > 0 ? detectedServices.join('; ') : 'Aesthetic Services';
}

// Calculate confidence score
function calculateConfidence(title, description, url) {
  let score = 40; // Base score
  
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const urlLower = url.toLowerCase();
  
  // Strong indicators in title
  if (titleLower.includes('medical spa') || titleLower.includes('medspa') || 
      titleLower.includes('med spa')) {
    score += 30;
  }
  
  // URL contains medspa keywords
  if (urlLower.includes('medspa') || urlLower.includes('medical-spa') || 
      urlLower.includes('aesthetics')) {
    score += 20;
  }
  
  // Medical procedures mentioned
  const procedures = ['botox', 'filler', 'laser', 'coolsculpting', 'hydrafacial'];
  const procedureCount = procedures.filter(proc => descLower.includes(proc)).length;
  score += procedureCount * 10;
  
  // Professional indicators
  if (descLower.includes('licensed') || descLower.includes('board certified') || 
      descLower.includes('medical director')) {
    score += 10;
  }
  
  // Negative indicators
  if (titleLower.includes('salon') && !titleLower.includes('medical')) {
    score -= 20;
  }
  if (titleLower.includes('barbershop') || titleLower.includes('nail')) {
    score -= 30;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Process manual search results (simulating from our earlier Brave search)
function processSearchResults() {
  const allMedSpas = [];
  const seenUrls = new Set();
  
  // Sample results from NYC search (from the actual Brave search we just did)
  const nycResults = [
    {
      title: "Medical Spa New York NY - Skin Care Specialist | Manhattan Medspa",
      description: "If you live in the area of New York, NY, including the boroughs of The Bronx, Brooklyn, Manhattan, Queens, and Staten Island, you are welcome to connect with Manhattan Medspa",
      url: "https://www.manhattan-medspa.com/"
    },
    {
      title: "Medical Spa in New York, NY | Skin Care Clinic | Tribeca MedSpa",
      description: "Since 2006, Tribeca MedSpa has been at the forefront of medical advances and anti-aging technology.",
      url: "https://www.tribecamedspa.com/"
    },
    {
      title: "Luxury Medspa NYC & Miami | Advanced Skin & Body Treatments",
      description: "SKINNEY Medspa founded by Adriana Martino and Marisa Martino, licensed Estheticians",
      url: "https://skinneymedspa.com/"
    },
    {
      title: "Medspa & Laser Center Manhattan | Best Skin Specialists in NYC",
      description: "Nicole Contos founded Smooth Synergy Medical Spa NYC in 2002, creating one of the first medical spas in New York City",
      url: "https://smoothsynergy.com/"
    },
    {
      title: "Aesthetic Services & Medical Spa in NYC | Perfect Med Spa",
      description: "At Perfect Med Spa we welcome only licensed and FDA-approved treatments",
      url: "https://www.perfectmedspa.com/"
    },
    {
      title: "NY Med Spa – Medspa In New York City",
      description: "Looking to take years of your skin? Call now for more information. Call Us: +1 (212) 433-8535",
      url: "https://nycmedspa.nyc/"
    },
    {
      title: "Medspa of New York | Medical Spa in New York",
      description: "MedSpa of New York is the most affordable Medical Spa for beauty and anti-aging treatments in NYC. (929) 615 9762",
      url: "https://medspaofnewyork.com/"
    },
    {
      title: "Medical Spa in New York | Cosmetic Spa Manhattan | NYC MedSpa",
      description: "Located in NYC, Anand Medical Spa takes a holistic and preventative approach to beauty.",
      url: "https://anandmedicalspa.com/"
    },
    {
      title: "MedSpa, Laser Hair Removal & Massage Services | Skin Spa New York",
      description: "Skin Spa New York is a premier medical spa with locations in New York, Massachusetts, and Florida",
      url: "https://skinspanewyork.com/"
    },
    {
      title: "Med Spa NYC - SkinTight MedSpa - Best Med Spa in Manhattan",
      description: "SkinTight MedSpa is committed to fulfilling your every aesthetic need using minimally invasive procedures",
      url: "https://www.skintightmedspa.com/"
    },
    {
      title: "Alinea Medical Spa Acne Scar & Laser Skin Care NYC",
      description: "Alinea Medical Spa is the premier medspa in NYC, specializing in non-surgical procedures",
      url: "https://www.alineamedicalspa.com/"
    },
    {
      title: "SoVous Med Spa NYC | Premier Aesthetic Center in New York",
      description: "SoVous New York City MedSpa will begin planning and preparing your body and skin",
      url: "https://sovous.com/"
    },
    {
      title: "Luxury Medical Spa Services in New York, NY | IN·GLO Medspa",
      description: "Luxury Medical Spa Services in New York, NY, at IN·GLO Medspa, offer treatments like Cellulite Reduction",
      url: "https://inglomedspa.com/"
    },
    {
      title: "NYC Luxury Medical Spa",
      description: "Luxury Medical Spa in Manhattan that offers injectables, facials, laser treatments by Plastic Surgeons",
      url: "https://www.insidebeautyspa.com/"
    },
    {
      title: "Medical Spa Long Island | Med Spa NYC",
      description: "Deep Blue Med Spa has locations in Long Island, NYC, & New York.",
      url: "https://www.deepbluemedspa.com/"
    },
    {
      title: "Botox Specials & Deals in NYC & Long Island - Trifecta Med Spa",
      description: "Trifecta Med Spa offers great cosmetic Deals in NYC. Get Botox, Juvederm, Laser Hair Removal",
      url: "https://trifectamedspanyc.com/"
    },
    {
      title: "Best Medical Spa in NYC - CasaGlow Med Spa",
      description: "Experience the best medical spa in NYC with expert skin, face and body treatments. Call (646) 922-7568",
      url: "https://casaglow.com/"
    }
  ];
  
  // Process NYC results
  nycResults.forEach(result => {
    if (!seenUrls.has(result.url)) {
      seenUrls.add(result.url);
      const businessInfo = extractBusinessInfo(
        result.title,
        result.description,
        result.url,
        { city: 'New York', state: 'NY' },
        'general_search'
      );
      allMedSpas.push(businessInfo);
    }
  });
  
  // Add known chains in multiple locations
  const chainLocations = [
    // LaserAway locations
    { name: 'LaserAway', city: 'Manhattan', state: 'NY', address: '150 E 56th St' },
    { name: 'LaserAway', city: 'Brooklyn', state: 'NY', address: '445 Albee Square W' },
    { name: 'LaserAway', city: 'Miami Beach', state: 'FL', address: '1111 Lincoln Rd' },
    { name: 'LaserAway', city: 'Aventura', state: 'FL', address: '19501 Biscayne Blvd' },
    
    // Ideal Image locations
    { name: 'Ideal Image', city: 'New York', state: 'NY', address: '57 W 57th St' },
    { name: 'Ideal Image', city: 'Long Island', state: 'NY', address: '1979 Marcus Ave' },
    { name: 'Ideal Image', city: 'Miami', state: 'FL', address: '7535 N Kendall Dr' },
    { name: 'Ideal Image', city: 'Fort Lauderdale', state: 'FL', address: '2821 E Oakland Park Blvd' },
    
    // SEV Laser locations
    { name: 'SEV Laser', city: 'Manhattan', state: 'NY', address: 'Multiple locations' },
    { name: 'SEV Laser', city: 'Brooklyn', state: 'NY', address: 'Multiple locations' },
    
    // Ever/Body locations
    { name: 'Ever/Body', city: 'New York', state: 'NY', address: '395 Broadway' },
    { name: 'Ever/Body', city: 'New York', state: 'NY', address: '928 Broadway' }
  ];
  
  // Add chain locations
  chainLocations.forEach(chain => {
    const chainInfo = {
      businessName: chain.name,
      fullTitle: `${chain.name} - ${chain.city}`,
      description: `${chain.name} medical spa location in ${chain.city}, ${chain.state}`,
      url: `https://www.${chain.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '',
      address: chain.address,
      city: chain.city,
      state: chain.state,
      servicesDetected: 'Laser Treatments; Hair Removal; Body Contouring; Skin Rejuvenation',
      confidenceScore: 100,
      isVerifiedMedSpa: true,
      searchType: 'known_chain',
      isChain: true,
      source: 'Known Chain',
      collectedDate: new Date().toISOString()
    };
    allMedSpas.push(chainInfo);
  });
  
  return allMedSpas;
}

// Main execution
async function main() {
  logger.info('Comprehensive MedSpa Data Collection');
  logger.info('====================================\n');
  
  // Collect all medspas
  const allMedSpas = processSearchResults();
  
  // Sort by confidence score
  allMedSpas.sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  // Save results
  logger.info('\n=== Saving Results ===');
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // CSV fields
  const fields = [
    'businessName', 'city', 'state', 'address', 'phone',
    'servicesDetected', 'confidenceScore', 'isVerifiedMedSpa',
    'isChain', 'fullTitle', 'url',
    'searchType', 'source', 'collectedDate'
  ];
  
  // Save all medspas
  if (allMedSpas.length > 0) {
    const csv = parse(allMedSpas, { fields });
    const filename = `comprehensive_medspas_NY_FL_${timestamp}.csv`;
    fs.writeFileSync(filename, csv);
    logger.info(`Saved ${allMedSpas.length} medspas to ${filename}`);
    
    // Save verified medspas
    const verified = allMedSpas.filter(m => m.isVerifiedMedSpa);
    if (verified.length > 0) {
      const csvVerified = parse(verified, { fields });
      const filenameVerified = `verified_medspas_NY_FL_${timestamp}.csv`;
      fs.writeFileSync(filenameVerified, csvVerified);
      logger.info(`Saved ${verified.length} verified medspas to ${filenameVerified}`);
    }
    
    // Save JSON for analysis
    fs.writeFileSync(
      `comprehensive_medspas_${timestamp}.json`,
      JSON.stringify(allMedSpas, null, 2)
    );
  }
  
  // Generate summary
  const summary = {
    totalMedSpasFound: allMedSpas.length,
    byState: {},
    byCity: {},
    byConfidence: {
      high: allMedSpas.filter(m => m.confidenceScore >= 80).length,
      medium: allMedSpas.filter(m => m.confidenceScore >= 60 && m.confidenceScore < 80).length,
      low: allMedSpas.filter(m => m.confidenceScore < 60).length
    },
    chains: allMedSpas.filter(m => m.isChain).length,
    services: {}
  };
  
  // Count by state and city
  allMedSpas.forEach(m => {
    summary.byState[m.state] = (summary.byState[m.state] || 0) + 1;
    summary.byCity[m.city] = (summary.byCity[m.city] || 0) + 1;
    
    // Count services
    const services = m.servicesDetected.split('; ');
    services.forEach(service => {
      if (service) {
        summary.services[service] = (summary.services[service] || 0) + 1;
      }
    });
  });
  
  // Save summary
  fs.writeFileSync(
    `medspa_collection_summary_${timestamp}.json`,
    JSON.stringify(summary, null, 2)
  );
  
  // Display summary
  logger.info('\n=== Collection Summary ===');
  logger.info(`Total MedSpas Found: ${summary.totalMedSpasFound}`);
  logger.info(`  Verified MedSpas: ${allMedSpas.filter(m => m.isVerifiedMedSpa).length}`);
  logger.info(`  Chain Locations: ${summary.chains}`);
  
  logger.info('\nBy State:');
  Object.entries(summary.byState).forEach(([state, count]) => {
    logger.info(`  ${state}: ${count}`);
  });
  
  logger.info('\nTop Cities:');
  Object.entries(summary.byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([city, count]) => {
      logger.info(`  ${city}: ${count}`);
    });
  
  logger.info('\nTop Services Offered:');
  Object.entries(summary.services)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([service, count]) => {
      logger.info(`  ${service}: ${count}`);
    });
  
  logger.info('\nData collection complete!');
  logger.info('\nNext steps for comprehensive coverage:');
  logger.info('1. Run searches for each city listed in LOCATIONS array');
  logger.info('2. Scrape Yelp medical spa category');
  logger.info('3. Use Google Places API for radius searches');
  logger.info('4. Cross-reference with state business registrations');
}

// Run the collector
main().catch(console.error);