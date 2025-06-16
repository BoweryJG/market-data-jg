import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
let BATCH_SIZE = 100; // Upload 100 records at a time
let DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Progress tracking
let totalProcessed = 0;
let totalSuccess = 0;
let totalFailed = 0;
let failedRecords = [];

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Parse CSV file
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    createReadStream(filePath)
      .pipe(parser)
      .on('data', (data) => records.push(data))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

// Transform CSV record to provider format
function transformRecord(record) {
  // Build provider name from parts
  const providerName = [
    record.firstName,
    record.middleName,
    record.lastName,
    record.credential
  ].filter(Boolean).join(' ').trim();
  
  // Skip if no valid name
  if (!providerName && !record.organizationName) return null;
  
  return {
    provider_name: providerName || record.organizationName,
    practice_name: record.organizationName || null,
    address: record.practiceAddress1,
    city: record.practiceCity,
    state: record.practiceState,
    zip_code: record.practiceZip,
    phone: record.practicePhone,
    website: null, // Not in NPI data
    email: null, // Not in NPI data
    industry: determineIndustryFromTaxonomy(record),
    specialties: [record.taxonomyDescription].filter(Boolean),
    procedures_offered: getProceduresFromTaxonomy(record.taxonomyDescription),
    provider_type: record.organizationName ? 'group' : 'solo',
    ownership_type: 'independent',
    data_source: 'npi_registry',
    verified: true,
    // NPI specific fields
    notes: `NPI: ${record.npi}, Last Updated: ${record.lastUpdated}`,
    // Additional fields
    lat: null,
    lng: null,
    rating: null,
    review_count: 0
  };
}

function determineIndustryFromTaxonomy(record) {
  const taxonomy = (record.taxonomyDescription || '').toLowerCase();
  const category = (record.category || '').toLowerCase();
  
  if (category === 'dentist' || taxonomy.includes('dentist') || taxonomy.includes('orthodont')) {
    return 'dental';
  } else if (category === 'dermatologist' || category === 'plastic_surgeon' || 
             taxonomy.includes('dermatolog') || taxonomy.includes('plastic') || 
             taxonomy.includes('aesthetic')) {
    return 'aesthetic';
  }
  return 'both'; // default if unclear
}

function getProceduresFromTaxonomy(taxonomyDesc) {
  if (!taxonomyDesc) return [];
  
  const procedures = {
    'general practice': ['cleanings', 'fillings', 'crowns', 'root canals'],
    'orthodontics': ['braces', 'invisalign', 'retainers'],
    'oral surgery': ['extractions', 'dental implants', 'bone grafts'],
    'dermatology': ['botox', 'dermal fillers', 'laser treatments', 'chemical peels'],
    'plastic surgery': ['facial rejuvenation', 'rhinoplasty', 'breast augmentation'],
    'cosmetic': ['botox', 'dermal fillers', 'laser hair removal']
  };
  
  const lowerTaxonomy = taxonomyDesc.toLowerCase();
  for (const [key, procs] of Object.entries(procedures)) {
    if (lowerTaxonomy.includes(key)) {
      return procs;
    }
  }
  
  return [];
}

function parseSpecialties(record) {
  const specialties = [];
  if (record.specialties) {
    return record.specialties.split(',').map(s => s.trim());
  }
  if (record.specialty) {
    specialties.push(record.specialty);
  }
  if (record.primary_specialty) {
    specialties.push(record.primary_specialty);
  }
  return specialties;
}

function parseProcedures(record) {
  if (record.procedures_offered) {
    return record.procedures_offered.split(',').map(p => p.trim());
  }
  if (record.services) {
    return record.services.split(',').map(s => s.trim());
  }
  return [];
}

// Upload batch with retry logic
async function uploadBatch(batch, batchNumber) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📤 Uploading batch ${batchNumber} (${batch.length} records) - Attempt ${attempt}`);
      
      const { data, error } = await supabase
        .from('provider_locations')
        .insert(batch)
        .select();

      if (error) {
        throw error;
      }

      totalSuccess += batch.length;
      console.log(`✅ Batch ${batchNumber} uploaded successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} failed - Attempt ${attempt}:`, error.message);
      
      if (attempt === MAX_RETRIES) {
        totalFailed += batch.length;
        failedRecords.push(...batch.map((record, index) => ({
          record,
          error: error.message,
          batchNumber,
          recordIndex: index
        })));
        return false;
      }
      
      await delay(RETRY_DELAY * attempt); // Exponential backoff
    }
  }
}

// Main upload function
async function uploadProviders(filePath) {
  console.log(`\n🚀 Starting batch upload from ${filePath}\n`);
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Parse CSV
    console.log('📖 Reading CSV file...');
    const records = await parseCSV(filePath);
    console.log(`📊 Found ${records.length} records to process\n`);
    
    // Transform records
    console.log('🔄 Transforming records...');
    const providers = records.map(transformRecord).filter(p => p.provider_name && p.address);
    console.log(`✅ ${providers.length} valid records after transformation\n`);
    
    // Process in batches
    const totalBatches = Math.ceil(providers.length / BATCH_SIZE);
    console.log(`📦 Processing ${totalBatches} batches of up to ${BATCH_SIZE} records each\n`);
    
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = providers.slice(i, i + BATCH_SIZE);
      
      totalProcessed += batch.length;
      
      // Upload batch
      await uploadBatch(batch, batchNumber);
      
      // Progress update
      const progress = Math.round((totalProcessed / providers.length) * 100);
      console.log(`\n📈 Progress: ${progress}% (${totalProcessed}/${providers.length})`);
      console.log(`✅ Success: ${totalSuccess} | ❌ Failed: ${totalFailed}\n`);
      
      // Delay between batches (except for last batch)
      if (i + BATCH_SIZE < providers.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...\n`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 UPLOAD COMPLETE - FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total records processed: ${totalProcessed}`);
    console.log(`✅ Successfully uploaded: ${totalSuccess}`);
    console.log(`❌ Failed to upload: ${totalFailed}`);
    console.log(`Success rate: ${Math.round((totalSuccess / totalProcessed) * 100)}%`);
    
    // Save failed records if any
    if (failedRecords.length > 0) {
      const failedFile = filePath.replace('.csv', '_failed.json');
      await fs.writeFile(failedFile, JSON.stringify(failedRecords, null, 2));
      console.log(`\n💾 Failed records saved to: ${failedFile}`);
    }
    
  } catch (error) {
    console.error('\n🚨 Fatal error:', error);
    process.exit(1);
  }
}

// Handle duplicate detection
async function checkDuplicates(providers) {
  console.log('🔍 Checking for duplicates...');
  
  // Get existing providers
  const { data: existing, error } = await supabase
    .from('provider_locations')
    .select('provider_name, address, phone');
    
  if (error) {
    console.error('Error fetching existing providers:', error);
    return providers;
  }
  
  // Create lookup set
  const existingSet = new Set(
    existing.map(p => `${p.provider_name}|${p.address}|${p.phone}`)
  );
  
  // Filter out duplicates
  const unique = providers.filter(p => {
    const key = `${p.provider_name}|${p.address}|${p.phone}`;
    return !existingSet.has(key);
  });
  
  console.log(`✅ Found ${providers.length - unique.length} duplicates, ${unique.length} new records`);
  return unique;
}

// CLI usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Usage: node batch_upload_providers.js <csv_file> [options]

Options:
  --check-duplicates    Check for existing records before uploading
  --batch-size <n>      Set batch size (default: 100)
  --delay <ms>          Set delay between batches in ms (default: 1000)

Examples:
  node batch_upload_providers.js npi_all_providers_complete_2025-06-04.csv
  node batch_upload_providers.js providers.csv --check-duplicates --batch-size 50
  `);
  process.exit(0);
}

// Parse options
const csvFile = args[0];
const options = {
  checkDuplicates: args.includes('--check-duplicates'),
  batchSize: args.includes('--batch-size') ? 
    parseInt(args[args.indexOf('--batch-size') + 1]) : BATCH_SIZE,
  delay: args.includes('--delay') ? 
    parseInt(args[args.indexOf('--delay') + 1]) : DELAY_BETWEEN_BATCHES
};

// Override defaults if options provided
if (options.batchSize) {
  BATCH_SIZE = options.batchSize;
}
if (options.delay) {
  DELAY_BETWEEN_BATCHES = options.delay;
}

// Run upload
uploadProviders(csvFile);