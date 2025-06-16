import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

// SPHERE1A - YOUR PROJECT
const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadProviders() {
  console.log('📤 UPLOADING 716 HIGH-VALUE PROVIDERS TO SPHERE1A\n');
  
  try {
    // Read the high-value providers CSV
    const content = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} providers to upload\n`);
    
    const BATCH_SIZE = 50;
    let uploaded = 0;
    let failed = 0;
    
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      const batch = providers.slice(i, i + BATCH_SIZE);
      
      const transformedBatch = batch.map(record => ({
        name: record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim(),
        npi: record.npi,
        address: record.address,
        city: record.city,
        state: record.state,
        zip_code: record.zip,
        phone: record.phone,
        website: null,
        email: null,
        industry: record.taxonomy?.toLowerCase().includes('dent') ? 'dental' : 'aesthetic',
        specialties: [record.taxonomy].filter(Boolean),
        procedures_offered: [],
        provider_type: 'solo',
        ownership_type: 'independent',
        data_source: 'npi_high_value',
        verified: true,
        notes: `High-value area. ${record.credential || ''}`.trim()
      }));
      
      const { data, error } = await supabase
        .from('providers')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
        failed += batch.length;
      } else {
        uploaded += batch.length;
        console.log(`✓ Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(providers.length/BATCH_SIZE)} uploaded`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 UPLOAD COMPLETE');
    console.log('='.repeat(50));
    console.log(`Successfully uploaded: ${uploaded} providers`);
    console.log(`Failed: ${failed} providers`);
    
    if (uploaded > 0) {
      console.log('\n✅ Your Sphere1a database now has:');
      console.log('- 9,137 original providers');
      console.log(`- ${uploaded} new high-value providers`);
      console.log(`- TOTAL: ~${9137 + uploaded} providers!`);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

uploadProviders();