import { logger } from '@/services/logging/logger';

const https = require('https');

// Test different parameter combinations
const testQueries = [
  {
    name: 'Direct taxonomy code',
    params: {
      version: '2.1',
      taxonomy_description: '122300000X',
      state: 'NY',
      limit: 5
    }
  },
  {
    name: 'Enumeration type Individual + state',
    params: {
      version: '2.1',
      enumeration_type: 'NPI-1',
      state: 'NY',
      limit: 5
    }
  },
  {
    name: 'Address type with state',
    params: {
      version: '2.1',
      address_purpose: 'LOCATION',
      state: 'NY',
      limit: 5
    }
  }
];

async function testQuery(queryInfo) {
  return new Promise((resolve) => {
    const queryString = new URLSearchParams(queryInfo.params).toString();
    const url = `https://npiregistry.cms.hhs.gov/api/?${queryString}`;
    
    logger.info(`\nTesting: ${queryInfo.name}`);
    logger.info(`URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          logger.info(`Result count: ${parsed.result_count}`);
          logger.info(`Results length: ${parsed.results ? parsed.results.length : 0}`);
          
          if (parsed.results && parsed.results[0]) {
            const provider = parsed.results[0];
            logger.info('First provider:');
            logger.info(`  NPI: ${provider.number}`);
            logger.info(`  Name: ${provider.basic.first_name || provider.basic.organization_name}`);
            if (provider.taxonomies && provider.taxonomies[0]) {
              logger.info(`  Taxonomy: ${provider.taxonomies[0].code} - ${provider.taxonomies[0].desc}`);
            }
          }
          
          resolve();
        } catch (e) {
          logger.error('Error:', e.message);
          resolve();
        }
      });
    }).on('error', (e) => {
      logger.error('Request error:', e.message);
      resolve();
    });
  });
}

async function main() {
  logger.info('Testing NPI API parameter combinations...');
  
  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Now test searching for dentists specifically
  logger.info('\n\nSearching for dentists in NY state...');
  const dentistUrl = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&state=NY&enumeration_type=NPI-1&limit=200';
  
  https.get(dentistUrl, (res) => {
    let data = '';
    
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        logger.info(`Total providers in NY: ${parsed.result_count}`);
        
        // Count dentists
        let dentistCount = 0;
        let dermCount = 0;
        let plasticCount = 0;
        
        if (parsed.results) {
          for (const provider of parsed.results) {
            if (provider.taxonomies) {
              for (const tax of provider.taxonomies) {
                if (tax.code && tax.code.startsWith('122')) dentistCount++;
                if (tax.code && tax.code.startsWith('207N')) dermCount++;
                if (tax.code && tax.code.startsWith('2082')) plasticCount++;
              }
            }
          }
        }
        
        logger.info(`In first 200 results:`);
        logger.info(`  Dentists found: ${dentistCount}`);
        logger.info(`  Dermatologists found: ${dermCount}`);
        logger.info(`  Plastic surgeons found: ${plasticCount}`);
        
      } catch (e) {
        logger.error('Error:', e.message);
      }
    });
  }).on('error', console.error);
}

main();