const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importCSVToSupabase(csvFile) {
  console.log(`📥 Importing ${csvFile} to Supabase...`);
  
  const providers = [];
  let count = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        // Transform CSV row to match provider_locations schema
        const provider = {
          provider_name: row.businessName || `${row.firstName} ${row.lastName}, ${row.credential}`,
          practice_name: row.organizationName || row.businessName || `${row.lastName} ${row.category}`,
          address: row.practiceAddress1 || row.address,
          city: row.practiceCity || row.city,
          state: row.practiceState || row.state,
          zip_code: row.practiceZip || row.zip,
          phone: row.practicePhone || row.phone,
          website: row.website || null,
          industry: row.category === 'Dental Practice' ? 'dental' : 'aesthetic',
          specialties: row.taxonomyDescription ? [row.taxonomyDescription] : [],
          procedures_offered: row.servicesDetected ? row.servicesDetected.split(';').map(s => s.trim()) : [],
          rating: parseFloat(row.rating) || null,
          review_count: parseInt(row.review_count) || null,
          years_in_practice: null,
          provider_type: row.organizationName ? 'group' : 'solo',
          ownership_type: 'independent',
          annual_revenue_estimate: null,
          patient_volume_monthly: null,
          tech_adoption_score: parseInt(row.confidenceScore) || null,
          growth_potential_score: null,
          data_source: row.dataSources || 'csv_import',
          verified: row.sourceCount > 1,
          npi: row.npi || null
        };
        
        providers.push(provider);
        count++;
        
        // Insert in batches of 100
        if (providers.length >= 100) {
          insertBatch(providers.splice(0, 100), count);
        }
      })
      .on('end', async () => {
        // Insert remaining providers
        if (providers.length > 0) {
          await insertBatch(providers, count);
        }
        console.log(`✅ Import complete! Total processed: ${count}`);
        resolve(count);
      })
      .on('error', reject);
  });
}

async function insertBatch(providers, totalCount) {
  console.log(`📤 Inserting batch of ${providers.length} providers (total: ${totalCount})...`);
  
  const { data, error } = await supabase
    .from('provider_locations')
    .insert(providers);
    
  if (error) {
    console.error('❌ Error inserting batch:', error);
    // Continue with next batch even if this one fails
  } else {
    console.log(`✅ Batch inserted successfully`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting CSV to Supabase import...\n');
  
  const csvFiles = [
    'npi_all_providers_complete_2025-06-04.csv' // 9,136 total providers
  ];
  
  for (const file of csvFiles) {
    try {
      await importCSVToSupabase(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  console.log('\n🎉 All imports complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importCSVToSupabase };