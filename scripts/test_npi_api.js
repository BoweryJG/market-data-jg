const https = require('https');

// Test the NPI API with a simple query
const testUrl = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&city=New%20York&state=NY&limit=5';

console.log('Testing NPI API...');
console.log('URL:', testUrl);

https.get(testUrl, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\nAPI Response:');
      console.log('Result count:', parsed.result_count);
      console.log('Results array length:', parsed.results ? parsed.results.length : 0);
      
      if (parsed.results && parsed.results[0]) {
        console.log('\nFirst result sample:');
        console.log('NPI:', parsed.results[0].number);
        console.log('Name:', parsed.results[0].basic);
        console.log('Taxonomies:', parsed.results[0].taxonomies);
      }
      
      console.log('\nFull response (first 500 chars):');
      console.log(JSON.stringify(parsed, null, 2).substring(0, 500));
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e);
});