import { logger } from '@/services/logging/logger';

const https = require('https');

// Test the NPI API with a simple query
const testUrl = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&city=New%20York&state=NY&limit=5';

logger.info('Testing NPI API...');
logger.info('URL:', testUrl);

https.get(testUrl, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      logger.info('\nAPI Response:');
      logger.info('Result count:', parsed.result_count);
      logger.info('Results array length:', parsed.results ? parsed.results.length : 0);
      
      if (parsed.results && parsed.results[0]) {
        logger.info('\nFirst result sample:');
        logger.info('NPI:', parsed.results[0].number);
        logger.info('Name:', parsed.results[0].basic);
        logger.info('Taxonomies:', parsed.results[0].taxonomies);
      }
      
      logger.info('\nFull response (first 500 chars):');
      logger.info(JSON.stringify(parsed, null, 2).substring(0, 500));
    } catch (e) {
      logger.error('Error parsing response:', e);
      logger.info('Raw response:', data.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  logger.error('Request error:', e);
});