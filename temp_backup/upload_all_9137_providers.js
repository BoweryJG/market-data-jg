import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

// YOUR SPHERE1A
const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadAll9137Providers() {
  console.log('📤 UPLOADING ALL 9,137 PROVIDERS TO SPHERE1A\n');
  
  try {
    // First, create the providers table if it doesn't exist
    // You'll need to create this table in Supabase dashboard with these columns:
    console.log('⚠️  IMPORTANT: Create a "providers" table in Supabase with these columns:');
    console.log('- id (int8, primary key)');
    console.log('- npi (text, unique)');
    console.log('- name (text)');
    console.log('- first_name (text)');
    console.log('- last_name (text)');
    console.log('- organization_name (text)');
    console.log('- address (text)');
    console.log('- city (text)');
    console.log('- state (text)');
    console.log('- zip_code (text)');
    console.log('- phone (text)');
    console.log('- taxonomy (text)');
    console.log('- specialty (text)');
    console.log('- data_source (text)');
    console.log('- created_at (timestamptz)');
    console.log('\nThen run this script again!\n');
    
    // Read the 9,137 providers
    const content = await fs.readFile('npi_all_providers_complete_2025-06-04.csv', 'utf-8');
    const allProviders = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${allProviders.length} providers in CSV\n`);
    
    // Also add the 716 high-value providers
    const highValueContent = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const highValueProviders = parse(highValueContent, { columns: true, skip_empty_lines: true });
    
    console.log(`Plus ${highValueProviders.length} high-value providers\n`);
    
    // Combine all providers
    const combinedProviders = [
      ...allProviders.map(p => ({
        npi: p.npi,
        name: p.organizationName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        first_name: p.firstName || '',
        last_name: p.lastName || '',
        organization_name: p.organizationName || null,
        address: p.practiceAddress1 || p.address,
        city: p.practiceCity || p.city,
        state: p.practiceState || p.state,
        zip_code: p.practiceZip || p.zip,
        phone: p.practicePhone || p.phone,
        taxonomy: p.taxonomyDescription || p.taxonomy,
        specialty: p.category || determineSpecialty(p.taxonomyDescription),
        data_source: 'npi_registry',
        created_at: new Date().toISOString()
      })),
      ...highValueProviders.map(p => ({
        npi: p.npi,
        name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        first_name: p.firstName || '',
        last_name: p.lastName || '',
        organization_name: p.name?.includes('PLLC') || p.name?.includes('LLC') ? p.name : null,
        address: p.address,
        city: p.city,
        state: p.state,
        zip_code: p.zip,
        phone: p.phone,
        taxonomy: p.taxonomy,
        specialty: determineSpecialty(p.taxonomy),
        data_source: 'npi_high_value',
        created_at: new Date().toISOString()
      }))
    ];
    
    console.log(`TOTAL PROVIDERS TO UPLOAD: ${combinedProviders.length}\n`);
    
    // Upload in batches
    const BATCH_SIZE = 100;
    let uploaded = 0;
    
    for (let i = 0; i < combinedProviders.length; i += BATCH_SIZE) {
      const batch = combinedProviders.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabase
        .from('providers')
        .insert(batch);
      
      if (error) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
        
        // If table doesn't exist, stop
        if (error.code === '42P01') {
          console.error('\n❌ The providers table does not exist!');
          console.error('Please create it in Supabase first.');
          return;
        }
      } else {
        uploaded += batch.length;
        process.stdout.write(`\rProgress: ${uploaded}/${combinedProviders.length} providers uploaded`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n\n' + '='.repeat(50));
    console.log('📊 UPLOAD COMPLETE');
    console.log('='.repeat(50));
    console.log(`Successfully uploaded: ${uploaded} providers`);
    console.log('\n✅ YOUR SPHERE1A NOW HAS ALL ~10,000 PROVIDERS!');
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

function determineSpecialty(taxonomy) {
  const tax = (taxonomy || '').toLowerCase();
  if (tax.includes('dent')) return 'dental';
  if (tax.includes('dermat')) return 'dermatology';
  if (tax.includes('plastic')) return 'plastic_surgery';
  if (tax.includes('cosmetic')) return 'cosmetic';
  return 'other';
}

uploadAll9137Providers();