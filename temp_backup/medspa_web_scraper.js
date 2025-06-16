import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

class MedSpaWebScraper {
  constructor() {
    this.results = new Map();
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Search RealSelf for medical spas
  async searchRealSelf(location) {
    console.log(`🔍 Searching RealSelf for medical spas in ${location.city}, ${location.state}`);
    const page = await this.browser.newPage();
    
    try {
      // RealSelf search URL
      const searchUrl = `https://www.realself.com/find/medical-spa/${location.state}/${location.city}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for results
      await page.waitForSelector('.results-container', { timeout: 10000 }).catch(() => {});
      
      // Extract provider data
      const providers = await page.evaluate(() => {
        const results = [];
        const cards = document.querySelectorAll('.provider-card');
        
        cards.forEach(card => {
          const name = card.querySelector('.provider-name')?.textContent?.trim();
          const businessName = card.querySelector('.practice-name')?.textContent?.trim();
          const address = card.querySelector('.address')?.textContent?.trim();
          const phone = card.querySelector('.phone')?.textContent?.trim();
          
          if (name || businessName) {
            results.push({
              name: businessName || name,
              providerName: name,
              address,
              phone,
              source: 'realself',
              url: window.location.href
            });
          }
        });
        
        return results;
      });
      
      console.log(`✅ Found ${providers.length} providers on RealSelf`);
      return providers;
      
    } catch (error) {
      console.error(`❌ Error searching RealSelf: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  // Search Groupon for medical spa deals
  async searchGroupon(location) {
    console.log(`🔍 Searching Groupon for medical spa deals in ${location.city}, ${location.state}`);
    const page = await this.browser.newPage();
    
    try {
      // Groupon search URL
      const searchUrl = `https://www.groupon.com/browse/${location.city.toLowerCase().replace(' ', '-')}?category=beauty-and-spas&query=medical+spa`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract deal data
      const deals = await page.evaluate(() => {
        const results = [];
        const dealCards = document.querySelectorAll('.cui-card');
        
        dealCards.forEach(card => {
          const title = card.querySelector('.cui-udc-title')?.textContent?.trim();
          const merchantName = card.querySelector('.cui-location-name')?.textContent?.trim();
          const neighborhood = card.querySelector('.cui-location-neighborhood')?.textContent?.trim();
          
          // Look for medical spa indicators
          const text = (title + ' ' + merchantName).toLowerCase();
          if (text.includes('botox') || text.includes('laser') || text.includes('filler') || 
              text.includes('medical') || text.includes('aesthetic')) {
            results.push({
              name: merchantName,
              dealTitle: title,
              neighborhood,
              source: 'groupon'
            });
          }
        });
        
        return results;
      });
      
      console.log(`✅ Found ${deals.length} medical spa deals on Groupon`);
      return deals;
      
    } catch (error) {
      console.error(`❌ Error searching Groupon: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  // Search Google Maps without API
  async searchGoogleMaps(location, searchTerm) {
    console.log(`🔍 Searching Google Maps for "${searchTerm}" in ${location.city}, ${location.state}`);
    const page = await this.browser.newPage();
    
    try {
      // Build search URL
      const query = encodeURIComponent(`${searchTerm} ${location.city} ${location.state}`);
      const mapsUrl = `https://www.google.com/maps/search/${query}`;
      
      await page.goto(mapsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for results to load
      await page.waitForSelector('[role="article"]', { timeout: 10000 }).catch(() => {});
      
      // Scroll to load more results
      await page.evaluate(async () => {
        const scrollContainer = document.querySelector('[role="feed"]');
        if (scrollContainer) {
          for (let i = 0; i < 5; i++) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      });
      
      // Extract business data
      const businesses = await page.evaluate(() => {
        const results = [];
        const cards = document.querySelectorAll('[role="article"]');
        
        cards.forEach(card => {
          const name = card.querySelector('h3')?.textContent?.trim();
          const address = card.querySelector('[data-tooltip*="address"]')?.textContent?.trim();
          const rating = card.querySelector('[role="img"][aria-label*="stars"]')?.getAttribute('aria-label');
          const website = card.querySelector('a[data-value="Website"]')?.href;
          
          if (name) {
            // Extract additional info from aria-labels and text
            const allText = card.textContent.toLowerCase();
            const services = [];
            
            if (allText.includes('botox')) services.push('botox');
            if (allText.includes('laser')) services.push('laser');
            if (allText.includes('filler')) services.push('fillers');
            if (allText.includes('medical spa') || allText.includes('med spa')) services.push('medical spa');
            
            results.push({
              name,
              address,
              rating,
              website,
              services,
              source: 'google_maps'
            });
          }
        });
        
        return results;
      });
      
      console.log(`✅ Found ${businesses.length} businesses on Google Maps`);
      return businesses;
      
    } catch (error) {
      console.error(`❌ Error searching Google Maps: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  // Validate and enrich business data
  async validateBusiness(business) {
    if (!business.website) return business;
    
    const page = await this.browser.newPage();
    try {
      await page.goto(business.website, { waitUntil: 'networkidle2', timeout: 15000 });
      
      // Extract additional information from website
      const websiteData = await page.evaluate(() => {
        const text = document.body.textContent.toLowerCase();
        const data = {
          services: [],
          hasMedicalDirector: false,
          equipment: []
        };
        
        // Check for services
        const serviceKeywords = ['botox', 'dysport', 'filler', 'juvederm', 'restylane', 
                               'laser', 'coolsculpting', 'microneedling', 'chemical peel'];
        serviceKeywords.forEach(service => {
          if (text.includes(service)) data.services.push(service);
        });
        
        // Check for medical director
        if (text.includes('medical director') || text.includes('m.d.') || text.includes('physician')) {
          data.hasMedicalDirector = true;
        }
        
        // Check for equipment brands
        const equipmentBrands = ['candela', 'cynosure', 'allergan', 'galderma'];
        equipmentBrands.forEach(brand => {
          if (text.includes(brand)) data.equipment.push(brand);
        });
        
        return data;
      });
      
      return { ...business, ...websiteData, validated: true };
      
    } catch (error) {
      console.error(`Failed to validate ${business.name}: ${error.message}`);
      return business;
    } finally {
      await page.close();
    }
  }

  // Process a single location
  async processLocation(location) {
    const allResults = [];
    
    // Search different sources
    const searchTerms = ['medical spa', 'med spa', 'botox clinic', 'laser clinic'];
    
    for (const term of searchTerms) {
      const googleResults = await this.searchGoogleMaps(location, term);
      allResults.push(...googleResults);
      
      // Add delay between searches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Search specialized sites
    const realselfResults = await this.searchRealSelf(location);
    allResults.push(...realselfResults);
    
    const grouponResults = await this.searchGroupon(location);
    allResults.push(...grouponResults);
    
    // Deduplicate and validate
    for (const business of allResults) {
      const key = this.generateKey(business);
      if (!this.results.has(key)) {
        // Add location info
        business.city = location.city;
        business.state = location.state;
        
        // Validate if possible
        if (business.website) {
          const validated = await this.validateBusiness(business);
          this.results.set(key, validated);
        } else {
          this.results.set(key, business);
        }
      }
    }
  }

  generateKey(business) {
    const name = (business.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const address = (business.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${name}_${address}`.substring(0, 50);
  }

  // Main collection process
  async collect() {
    await this.initialize();
    
    // Define target locations
    const locations = [
      // NY - Focus on high-value areas
      { city: 'Manhattan', state: 'NY' },
      { city: 'Brooklyn', state: 'NY' },
      { city: 'Great Neck', state: 'NY' },
      { city: 'Scarsdale', state: 'NY' },
      
      // FL - Major markets
      { city: 'Miami Beach', state: 'FL' },
      { city: 'Coral Gables', state: 'FL' },
      { city: 'Boca Raton', state: 'FL' },
      { city: 'Naples', state: 'FL' }
    ];
    
    // Process each location
    for (const location of locations) {
      console.log(`\n📍 Processing ${location.city}, ${location.state}`);
      await this.processLocation(location);
      
      // Save progress
      await this.saveResults();
    }
    
    await this.cleanup();
    
    console.log(`\n✅ Collection complete! Found ${this.results.size} unique medical spas`);
  }

  // Save results
  async saveResults() {
    const data = Array.from(this.results.values());
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save to JSON
    const filename = `medspa_web_scrape_${timestamp}.json`;
    await fs.writeFile(filename, JSON.stringify({
      summary: {
        total: data.length,
        byState: {
          NY: data.filter(d => d.state === 'NY').length,
          FL: data.filter(d => d.state === 'FL').length
        },
        sources: {
          google: data.filter(d => d.source === 'google_maps').length,
          realself: data.filter(d => d.source === 'realself').length,
          groupon: data.filter(d => d.source === 'groupon').length
        }
      },
      medspas: data
    }, null, 2));
    
    console.log(`💾 Progress saved to ${filename}`);
  }
}

// Run the scraper
async function main() {
  const scraper = new MedSpaWebScraper();
  
  try {
    console.log('🚀 Starting medical spa web scraping...\n');
    console.log('⚠️  Note: This script requires Puppeteer. Install with:');
    console.log('npm install puppeteer\n');
    
    // Check if Puppeteer is installed
    try {
      await import('puppeteer');
      await scraper.collect();
    } catch (error) {
      console.error('❌ Puppeteer not installed. Run: npm install puppeteer');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MedSpaWebScraper;