import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');
  
  // Check providers table
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('*')
    .limit(1);
    
  if (provider && provider.length > 0) {
    console.log('✅ Providers table columns:');
    console.log(Object.keys(provider[0]).join(', '));
  } else {
    console.log('❌ Could not read providers table');
  }
  
  // Check if practices table exists
  const { data: practice, error: practiceError } = await supabase
    .from('practices')
    .select('*')
    .limit(1);
    
  if (practiceError?.code === '42P01') {
    console.log('\n❌ Practices table does not exist');
    return false;
  } else if (practice) {
    console.log('\n✅ Practices table exists');
    if (practice.length > 0) {
      console.log('Columns:', Object.keys(practice[0]).join(', '));
    }
  }
  
  return true;
}

async function uploadProvidersOnly() {
  console.log('\n📤 Uploading only new providers (checking for duplicates)...\n');
  
  try {
    // Find the provider file
    const files = await fs.readdir('.');
    const providerFile = files.find(f => f.startsWith('high_value_providers_') && f.endsWith('.csv'));
    
    if (!providerFile) {
      console.error('Could not find high_value_providers CSV file');
      return;
    }
    
    // Read and parse CSV
    const content = await fs.readFile(providerFile, 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} providers in CSV\n`);
    
    // Get existing NPIs to avoid duplicates
    console.log('Checking for existing NPIs...');
    const npiList = providers.map(p => p.npi);
    
    // Check in batches of 50
    const existingNPIs = new Set();
    for (let i = 0; i < npiList.length; i += 50) {
      const batch = npiList.slice(i, i + 50);
      const { data: existing } = await supabase
        .from('providers')
        .select('npi')
        .in('npi', batch);
      
      if (existing) {
        existing.forEach(p => existingNPIs.add(p.npi));
      }
    }
    
    console.log(`Found ${existingNPIs.size} providers already in database`);
    
    // Filter out duplicates
    const newProviders = providers.filter(p => !existingNPIs.has(p.npi));
    console.log(`${newProviders.length} new providers to upload\n`);
    
    if (newProviders.length === 0) {
      console.log('✅ All providers are already in the database!');
      return;
    }
    
    // Transform and upload in batches
    let uploaded = 0;
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < newProviders.length; i += BATCH_SIZE) {
      const batch = newProviders.slice(i, i + BATCH_SIZE);
      
      const transformedBatch = batch.map(record => ({
        name: record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim(),
        npi: record.npi,
        address: record.address,
        city: record.city,
        state: record.state,
        zip_code: record.zip,
        phone: record.phone,
        industry: record.taxonomy?.toLowerCase().includes('dent') ? 'dental' : 'aesthetic',
        specialties: [record.taxonomy].filter(Boolean),
        provider_type: 'solo',
        ownership_type: 'independent',
        data_source: 'npi_high_value',
        verified: true
      }));
      
      const { data, error } = await supabase
        .from('providers')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
      } else {
        uploaded += batch.length;
        console.log(`✓ Uploaded batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newProviders.length/BATCH_SIZE)}`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Successfully uploaded ${uploaded} new providers!`);
    console.log(`\nTotal providers in database: ~${9137 + 92 + uploaded}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main function
async function main() {
  console.log('🚀 HIGH-VALUE DATA CHECKER & UPLOADER');
  console.log('====================================\n');
  
  const tablesExist = await checkTableStructure();
  
  if (tablesExist) {
    await uploadProvidersOnly();
  } else {
    console.log('\n⚠️  Please create the missing tables in Supabase first');
  }
}

main();