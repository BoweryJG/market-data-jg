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
    
    console.log(`\nTesting: ${queryInfo.name}`);
    console.log(`URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`Result count: ${parsed.result_count}`);
          console.log(`Results length: ${parsed.results ? parsed.results.length : 0}`);
          
          if (parsed.results && parsed.results[0]) {
            const provider = parsed.results[0];
            console.log('First provider:');
            console.log(`  NPI: ${provider.number}`);
            console.log(`  Name: ${provider.basic.first_name || provider.basic.organization_name}`);
            if (provider.taxonomies && provider.taxonomies[0]) {
              console.log(`  Taxonomy: ${provider.taxonomies[0].code} - ${provider.taxonomies[0].desc}`);
            }
          }
          
          resolve();
        } catch (e) {
          console.error('Error:', e.message);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.error('Request error:', e.message);
      resolve();
    });
  });
}

async function main() {
  console.log('Testing NPI API parameter combinations...');
  
  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Now test searching for dentists specifically
  console.log('\n\nSearching for dentists in NY state...');
  const dentistUrl = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&state=NY&enumeration_type=NPI-1&limit=200';
  
  https.get(dentistUrl, (res) => {
    let data = '';
    
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`Total providers in NY: ${parsed.result_count}`);
        
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
        
        console.log(`In first 200 results:`);
        console.log(`  Dentists found: ${dentistCount}`);
        console.log(`  Dermatologists found: ${dermCount}`);
        console.log(`  Plastic surgeons found: ${plasticCount}`);
        
      } catch (e) {
        console.error('Error:', e.message);
      }
    });
  }).on('error', console.error);
}

main();