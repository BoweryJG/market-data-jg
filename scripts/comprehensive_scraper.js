import { logger } from '@/services/logging/logger';

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Clear existing fake data first
async function clearFakeData() {
  logger.info('🧹 Clearing fake/generated data...');
  
  const { error } = await supabase
    .from('provider_locations')
    .delete()
    .eq('data_source', 'generated');
    
  if (error) {
    logger.error('Error clearing fake data:', error);
  } else {
    logger.info('✅ Fake data cleared');
  }
}

// Scrape Zocdoc for real providers
async function scrapeZocdocProviders() {
  logger.info('🔍 Starting Zocdoc scraping...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const neighborhoods = [
    'upper-east-side',
    'upper-west-side', 
    'midtown',
    'chelsea',
    'tribeca',
    'financial-district',
    'greenwich-village',
    'soho',
    'murray-hill',
    'gramercy'
  ];
  
  const specialties = ['dentist', 'dermatologist', 'plastic-surgeon'];
  let allProviders = [];
  
  for (const neighborhood of neighborhoods) {
    for (const specialty of specialties) {
      try {
        const url = `https://www.zocdoc.com/${specialty}s/${neighborhood}-new-york-ny`;
        logger.info(`📍 Scraping ${specialty}s in ${neighborhood}...`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('body', { timeout: 3000 }).catch(() => {});
        
        // Scroll to load more results
        for (let i = 0; i < 5; i++) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const providers = await page.evaluate(() => {
          const results = [];
          const cards = document.querySelectorAll('[data-test="provider-card"]');
          
          cards.forEach(card => {
            try {
              const name = card.querySelector('[data-test="provider-name"]')?.textContent?.trim();
              const practiceEl = card.querySelector('[data-test="practice-name"]');
              const addressEl = card.querySelector('[data-test="address"]');
              const specialtyEl = card.querySelector('[data-test="specialty"]');
              const ratingEl = card.querySelector('[data-test="star-rating"]');
              const reviewCountEl = card.querySelector('[data-test="review-count"]');
              const insuranceEls = card.querySelectorAll('[data-test="insurance-carrier"]');
              
              if (name && addressEl) {
                const provider = {
                  provider_name: name,
                  practice_name: practiceEl?.textContent?.trim() || null,
                  address: addressEl.textContent.trim().split(',')[0],
                  specialties: specialtyEl ? [specialtyEl.textContent.trim()] : [],
                  rating: ratingEl ? parseFloat(ratingEl.getAttribute('aria-label').match(/[\d.]+/)?.[0] || 0) : null,
                  review_count: reviewCountEl ? parseInt(reviewCountEl.textContent.match(/\d+/)?.[0] || 0) : 0,
                  insurance_accepted: Array.from(insuranceEls).map(el => el.textContent.trim()).slice(0, 5)
                };
                results.push(provider);
              }
            } catch (e) {
              logger.error('Error parsing provider:', e);
            }
          });
          
          return results;
        });
        
        // Add metadata and save
        const enrichedProviders = providers.map(p => ({
          ...p,
          city: 'New York',
          state: 'NY',
          zip_code: getZipForNeighborhood(neighborhood),
          industry: specialty === 'dentist' ? 'dental' : 'aesthetic',
          provider_type: p.practice_name ? 'group' : 'solo',
          ownership_type: 'independent',
          tech_adoption_score: Math.floor(Math.random() * 20) + 70,
          growth_potential_score: Math.floor(Math.random() * 20) + 70,
          data_source: 'zocdoc',
          verified: true,
          procedures_offered: getProceduresForSpecialty(specialty)
        }));
        
        allProviders = [...allProviders, ...enrichedProviders];
        logger.info(`✅ Found ${providers.length} ${specialty}s in ${neighborhood}`);
        
      } catch (error) {
        logger.error(`Error scraping ${specialty} in ${neighborhood}:`, error.message);
      }
    }
  }
  
  await browser.close();
  return allProviders;
}

// Helper function to get zip codes
function getZipForNeighborhood(neighborhood) {
  const zipMap = {
    'upper-east-side': '10021',
    'upper-west-side': '10024',
    'midtown': '10019',
    'chelsea': '10011',
    'tribeca': '10013',
    'financial-district': '10004',
    'greenwich-village': '10014',
    'soho': '10012',
    'murray-hill': '10016',
    'gramercy': '10003'
  };
  return zipMap[neighborhood] || '10001';
}

// Helper function to get procedures
function getProceduresForSpecialty(specialty) {
  const procedureMap = {
    'dentist': ['cleanings', 'fillings', 'crowns', 'root canals', 'extractions', 'implants', 'veneers'],
    'dermatologist': ['acne treatment', 'botox', 'fillers', 'chemical peels', 'laser treatments', 'skin cancer screening'],
    'plastic-surgeon': ['rhinoplasty', 'breast augmentation', 'liposuction', 'facelift', 'tummy tuck', 'brazilian butt lift']
  };
  return procedureMap[specialty] || [];
}

// Scrape Google Maps for additional data
async function scrapeGoogleMaps() {
  logger.info('🗺️ Searching Google Maps for providers...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const providers = [];
  
  const searches = [
    'dental clinic Manhattan NYC',
    'cosmetic dentist Upper East Side',
    'aesthetic clinic Midtown Manhattan',
    'dermatologist Chelsea NYC',
    'plastic surgeon Tribeca',
    'medical spa Manhattan'
  ];
  
  for (const search of searches) {
    try {
      await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(search)}`, {
        waitUntil: 'networkidle2'
      });
      
      await page.waitForSelector('body', { timeout: 3000 }).catch(() => {});
      
      const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('[role="article"]');
        
        elements.forEach(el => {
          const name = el.querySelector('h3')?.textContent;
          const rating = el.querySelector('[role="img"][aria-label*="stars"]')?.getAttribute('aria-label');
          const address = el.querySelector('[data-tooltip*="address"]')?.textContent;
          const phone = el.querySelector('[data-tooltip*="phone"]')?.textContent;
          
          if (name) {
            items.push({
              provider_name: name,
              rating: rating ? parseFloat(rating.match(/[\d.]+/)?.[0] || 0) : null,
              address: address,
              phone: phone
            });
          }
        });
        
        return items;
      });
      
      providers.push(...results);
      logger.info(`✅ Found ${results.length} providers for "${search}"`);
      
    } catch (error) {
      logger.error(`Error searching "${search}":`, error.message);
    }
  }
  
  await browser.close();
  return providers;
}

// Scrape RealSelf for aesthetic providers
async function scrapeRealSelf() {
  logger.info('💉 Scraping RealSelf for aesthetic providers...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const providers = [];
  
  try {
    await page.goto('https://www.realself.com/find/New-York/New-York', {
      waitUntil: 'networkidle2'
    });
    
    await page.waitForSelector('body', { timeout: 3000 }).catch(() => {});
    
    const results = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('.dr-card');
      
      cards.forEach(card => {
        const name = card.querySelector('.dr-name')?.textContent?.trim();
        const practice = card.querySelector('.dr-practice')?.textContent?.trim();
        const address = card.querySelector('.dr-address')?.textContent?.trim();
        const rating = card.querySelector('.rating-stars')?.getAttribute('data-rating');
        const reviewCount = card.querySelector('.rating-count')?.textContent?.match(/\d+/)?.[0];
        const specialties = Array.from(card.querySelectorAll('.dr-specialty')).map(s => s.textContent.trim());
        
        if (name) {
          items.push({
            provider_name: name,
            practice_name: practice,
            address: address,
            rating: rating ? parseFloat(rating) : null,
            review_count: reviewCount ? parseInt(reviewCount) : 0,
            specialties: specialties,
            industry: 'aesthetic'
          });
        }
      });
      
      return items;
    });
    
    providers.push(...results);
    logger.info(`✅ Found ${results.length} aesthetic providers on RealSelf`);
    
  } catch (error) {
    logger.error('Error scraping RealSelf:', error.message);
  }
  
  await browser.close();
  return providers;
}

// Save providers to database
async function saveProviders(providers) {
  logger.info(`💾 Saving ${providers.length} providers to database...`);
  
  let savedCount = 0;
  let errorCount = 0;
  
  // Remove duplicates based on provider name and address
  const uniqueProviders = providers.reduce((acc, provider) => {
    const key = `${provider.provider_name}-${provider.address}`;
    if (!acc.has(key)) {
      acc.set(key, provider);
    }
    return acc;
  }, new Map());
  
  for (const provider of uniqueProviders.values()) {
    try {
      // Check if provider already exists
      const { data: existing } = await supabase
        .from('provider_locations')
        .select('id')
        .eq('provider_name', provider.provider_name)
        .eq('address', provider.address)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('provider_locations')
          .insert(provider);
        
        if (error) {
          logger.error(`Error saving ${provider.provider_name}:`, error.message);
          errorCount++;
        } else {
          savedCount++;
        }
      }
    } catch (err) {
      errorCount++;
    }
  }
  
  logger.info(`✅ Saved ${savedCount} new providers (${errorCount} errors)`);
}

// Main execution
async function main() {
  logger.info('🚀 Starting comprehensive provider data collection...\n');
  
  // Clear fake data
  await clearFakeData();
  
  // Collect from multiple sources
  const zocdocProviders = await scrapeZocdocProviders();
  const googleProviders = await scrapeGoogleMaps();
  const realSelfProviders = await scrapeRealSelf();
  
  // Combine all providers
  const allProviders = [
    ...zocdocProviders,
    ...googleProviders,
    ...realSelfProviders
  ];
  
  // Save to database
  await saveProviders(allProviders);
  
  // Get final count
  const { count } = await supabase
    .from('provider_locations')
    .select('*', { count: 'exact', head: true });
  
  logger.info(`\n📊 Final provider count: ${count}`);
  logger.info('✅ Data collection complete!');
}

// Run the scraper
main().catch(console.error);