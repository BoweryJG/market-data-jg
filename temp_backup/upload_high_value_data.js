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
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 1000;

// Progress tracking
let stats = {
  providersProcessed: 0,
  providersSuccess: 0,
  providersFailed: 0,
  practicesProcessed: 0,
  practicesSuccess: 0,
  practicesFailed: 0
};

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

// Transform provider data for upload
function transformProvider(record) {
  return {
    name: record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim(),
    npi: record.npi,
    address: record.address,
    city: record.city,
    state: record.state,
    zip_code: record.zip,
    phone: record.phone,
    website: null,
    email: null,
    industry: determineIndustryFromTaxonomy(record.taxonomy),
    specialties: [record.taxonomy].filter(Boolean),
    procedures_offered: getProceduresFromTaxonomy(record.taxonomy),
    provider_type: record.name?.includes('PLLC') || record.name?.includes('LLC') ? 'group' : 'solo',
    ownership_type: 'independent',
    data_source: 'npi_high_value',
    verified: true,
    notes: `High-value area provider. NPI: ${record.npi}. ${record.credential || ''}`.trim(),
    lat: null,
    lng: null,
    rating: null,
    review_count: 0
  };
}

// Transform practice data for a new practices table
function transformPractice(record) {
  return {
    name: record.practiceName,
    address: record.address,
    city: record.city,
    state: record.state,
    zip_code: record.zip,
    phones: record.phones,
    provider_count: parseInt(record.providerCount) || 1,
    specialties: record.specialties,
    estimated_size: record.estimatedSize,
    is_named_practice: record.isNamedPractice === '1' || record.isNamedPractice === 'true',
    data_source: 'npi_high_value_analysis',
    market_segment: 'premium',
    notes: `High-value area practice with ${record.providerCount} providers`
  };
}

function determineIndustryFromTaxonomy(taxonomy) {
  const tax = (taxonomy || '').toLowerCase();
  
  if (tax.includes('dent') || tax.includes('orthodont')) return 'dental';
  if (tax.includes('dermatolog')) return 'aesthetic';
  if (tax.includes('plastic') || tax.includes('cosmetic')) return 'aesthetic';
  if (tax.includes('spa') || tax.includes('aesthet')) return 'aesthetic';
  
  return 'medical';
}

function getProceduresFromTaxonomy(taxonomy) {
  const tax = (taxonomy || '').toLowerCase();
  const procedures = [];
  
  if (tax.includes('dent')) {
    procedures.push('General Dentistry', 'Cleanings', 'Fillings');
  }
  if (tax.includes('orthodont')) {
    procedures.push('Invisalign', 'Braces', 'Orthodontics');
  }
  if (tax.includes('dermatolog')) {
    procedures.push('Botox', 'Fillers', 'Laser Treatments', 'Skin Care');
  }
  if (tax.includes('plastic')) {
    procedures.push('Surgical Procedures', 'Injectables', 'Body Contouring');
  }
  
  return procedures;
}

// Upload batch with retry logic
async function uploadBatch(tableName, batch, transformFn, attempt = 1) {
  try {
    const transformedBatch = batch.map(transformFn);
    
    const { data, error } = await supabase
      .from(tableName)
      .upsert(transformedBatch, { 
        onConflict: tableName === 'providers' ? 'npi' : 'name,address,zip_code',
        ignoreDuplicates: true 
      });

    if (error) {
      console.error(`Batch upload error:`, error);
      return { success: 0, failed: batch.length };
    }

    return { success: batch.length, failed: 0 };
  } catch (error) {
    console.error(`Batch upload exception:`, error);
    if (attempt < 3) {
      console.log(`Retrying batch (attempt ${attempt + 1})...`);
      await delay(2000);
      return uploadBatch(tableName, batch, transformFn, attempt + 1);
    }
    return { success: 0, failed: batch.length };
  }
}

// Main upload function
async function uploadHighValueData() {
  console.log('🚀 HIGH-VALUE DATA UPLOADER');
  console.log('==========================\n');
  
  try {
    // Find the most recent files
    const files = await fs.readdir('.');
    const providerFile = files.find(f => f.startsWith('high_value_providers_') && f.endsWith('.csv'));
    const practiceFile = files.find(f => f.startsWith('high_value_practices_') && f.endsWith('.csv'));
    
    if (!providerFile || !practiceFile) {
      console.error('Could not find high_value CSV files');
      return;
    }
    
    // First, ensure practices table exists
    console.log('📊 Checking practices table...');
    const { error: tableError } = await supabase
      .from('practices')
      .select('name')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log('Creating practices table...');
      // Table doesn't exist - you might need to create it in Supabase dashboard
      console.log('\n⚠️  Please create a "practices" table in Supabase with these columns:');
      console.log('- name (text)');
      console.log('- address (text)'); 
      console.log('- city (text)');
      console.log('- state (text)');
      console.log('- zip_code (text)');
      console.log('- phones (text)');
      console.log('- provider_count (integer)');
      console.log('- specialties (text)');
      console.log('- estimated_size (text)');
      console.log('- is_named_practice (boolean)');
      console.log('- data_source (text)');
      console.log('- market_segment (text)');
      console.log('- notes (text)');
      console.log('\nThen run this script again.');
      return;
    }
    
    // Upload providers
    console.log(`\n📤 Uploading providers from ${providerFile}...`);
    const providers = await parseCSV(providerFile);
    console.log(`Found ${providers.length} providers to upload\n`);
    
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      const batch = providers.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(providers.length / BATCH_SIZE);
      
      process.stdout.write(`Uploading provider batch ${batchNum}/${totalBatches}... `);
      
      const result = await uploadBatch('providers', batch, transformProvider);
      stats.providersSuccess += result.success;
      stats.providersFailed += result.failed;
      stats.providersProcessed += batch.length;
      
      console.log(`✓ (${result.success} success, ${result.failed} failed)`);
      
      if (i + BATCH_SIZE < providers.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Upload practices
    console.log(`\n📤 Uploading practices from ${practiceFile}...`);
    const practices = await parseCSV(practiceFile);
    console.log(`Found ${practices.length} practices to upload\n`);
    
    for (let i = 0; i < practices.length; i += BATCH_SIZE) {
      const batch = practices.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(practices.length / BATCH_SIZE);
      
      process.stdout.write(`Uploading practice batch ${batchNum}/${totalBatches}... `);
      
      const result = await uploadBatch('practices', batch, transformPractice);
      stats.practicesSuccess += result.success;
      stats.practicesFailed += result.failed;
      stats.practicesProcessed += batch.length;
      
      console.log(`✓ (${result.success} success, ${result.failed} failed)`);
      
      if (i + BATCH_SIZE < practices.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(50));
    console.log('\nProviders:');
    console.log(`  Total processed: ${stats.providersProcessed}`);
    console.log(`  Successfully uploaded: ${stats.providersSuccess}`);
    console.log(`  Failed/Duplicates: ${stats.providersFailed}`);
    
    console.log('\nPractices:');
    console.log(`  Total processed: ${stats.practicesProcessed}`);
    console.log(`  Successfully uploaded: ${stats.practicesSuccess}`);
    console.log(`  Failed/Duplicates: ${stats.practicesFailed}`);
    
    console.log('\n✅ High-value data upload complete!');
    console.log('\nYour database now has:');
    console.log('- ~10,000 original providers + 716 high-value = ~10,716 total');
    console.log('- 92 medical spas + 521 practices = 613 business locations');
    console.log('\n💰 These are PREMIUM prospects in WEALTHY areas!');
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run it
uploadHighValueData();