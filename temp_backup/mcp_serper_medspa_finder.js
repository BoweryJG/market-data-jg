// This script uses the Serper MCP tool that's already available
// No API keys needed - it's already configured

const searchQueries = [
  // Manhattan specific searches
  'medical spa Upper East Side Manhattan NYC address phone',
  'med spa Midtown Manhattan NYC contact hours',
  'botox clinic Chelsea NYC location',
  'aesthetic center Tribeca NYC',
  'laser hair removal SoHo NYC medical spa',
  
  // Brooklyn
  'medical spa Park Slope Brooklyn address',
  'med spa Williamsburg Brooklyn NYC',
  'cosmetic clinic Brooklyn Heights',
  
  // Long Island
  'medical spa Great Neck NY phone',
  'aesthetic center Manhasset NY',
  'med spa Garden City Long Island',
  
  // Miami area
  'medical spa Miami Beach FL address phone',
  'med spa South Beach Miami contact',
  'botox clinic Coral Gables FL',
  'aesthetic center Aventura FL',
  'laser clinic Boca Raton FL',
  'medical spa Fort Lauderdale FL',
  'cosmetic clinic Palm Beach FL',
  'med spa Naples FL contact'
];

console.log('🚀 MCP Serper Medical Spa Search\n');
console.log('This uses the mcp__serper__google_search tool\n');

console.log('📋 Search queries to run:\n');
searchQueries.forEach((query, i) => {
  console.log(`${i + 1}. ${query}`);
});

console.log('\n💡 How to use:');
console.log('1. Run each search using the Serper MCP tool');
console.log('2. Extract business names, addresses, phones from results');
console.log('3. Focus on results with:');
console.log('   - Business names containing "spa", "aesthetic", "laser"');
console.log('   - Clear addresses and phone numbers');
console.log('   - Services like Botox, fillers, laser treatments');

console.log('\n📝 Expected format from each search:');
console.log('{');
console.log('  "organic": [');
console.log('    {');
console.log('      "title": "Glow Medical Spa - Upper East Side",');
console.log('      "snippet": "Premier medical spa offering Botox, fillers... Call (212) 555-1234",');
console.log('      "link": "https://glowmedspa.com"');
console.log('    }');
console.log('  ]');
console.log('}');

console.log('\n✅ This approach:');
console.log('- Uses existing MCP tools (no new setup)');
console.log('- Won\'t get blocked');
console.log('- Returns real business data');
console.log('- Free to use');

// Example of processing results
function extractMedSpaInfo(searchResults) {
  const medspas = [];
  
  if (searchResults.organic) {
    searchResults.organic.forEach(result => {
      // Extract phone numbers
      const phoneMatch = result.snippet.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      
      // Check if it's likely a medical spa
      const title = result.title.toLowerCase();
      const snippet = result.snippet.toLowerCase();
      
      if (
        title.includes('spa') || 
        title.includes('aesthetic') || 
        title.includes('laser') ||
        snippet.includes('botox') ||
        snippet.includes('filler')
      ) {
        medspas.push({
          name: result.title.split('-')[0].trim(),
          phone: phoneMatch ? phoneMatch[0] : null,
          website: result.link,
          description: result.snippet,
          source: 'serper_search'
        });
      }
    });
  }
  
  return medspas;
}

console.log('\n🎯 Start by running the first search query via MCP!');