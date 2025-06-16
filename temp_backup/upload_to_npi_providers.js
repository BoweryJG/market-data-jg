import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadToNPIProviders() {
  console.log('📤 UPLOADING TO npi_providers TABLE IN SPHERE1A\n');
  
  try {
    // First check current count
    const { count: currentCount } = await supabase
      .from('npi_providers')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Current providers in npi_providers table: ${currentCount || 0}\n`);
    
    // Read the high-value providers CSV
    const content = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} high-value providers to add\n`);
    
    const BATCH_SIZE = 50;
    let uploaded = 0;
    
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      const batch = providers.slice(i, i + BATCH_SIZE);
      
      // Transform to match npi_providers table structure
      const transformedBatch = batch.map(record => ({
        npi: record.npi,
        first_name: record.firstName || record.name?.split(' ')[0] || '',
        last_name: record.lastName || record.name?.split(' ').slice(1).join(' ') || '',
        organization_name: record.name?.includes('PLLC') || record.name?.includes('LLC') ? record.name : null,
        credential: record.credential || '',
        address_1: record.address,
        city: record.city,
        state: record.state,
        postal_code: record.zip,
        telephone_number: record.phone,
        taxonomy_description: record.taxonomy,
        primary_taxonomy: true,
        data_source: 'npi_high_value',
        created_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('npi_providers')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
      } else {
        uploaded += batch.length;
        console.log(`✓ Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(providers.length/BATCH_SIZE)} uploaded - Total: ${uploaded}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Get final count
    const { count: finalCount } = await supabase
      .from('npi_providers')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SPHERE1A DATABASE UPDATED');
    console.log('='.repeat(50));
    console.log(`Started with: ${currentCount || 0} providers`);
    console.log(`Added: ${uploaded} high-value providers`);
    console.log(`Total now: ${finalCount || 0} providers`);
    
    if (finalCount > 9000) {
      console.log('\n✅ SUCCESS! Your Sphere1a database now has ~10,000 providers!');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

uploadToNPIProviders();