import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

// SPHERE1A CREDENTIALS - YOUR REAL PROJECT
const supabaseUrl = 'https://cexnkpgibbtvkxcvpdfz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadToSphere1a() {
  console.log('📤 UPLOADING TO SPHERE1A - YOUR REAL PROJECT\n');
  console.log('Project: cexnkpgibbtvkxcvpdfz (sphere1a)');
  console.log('This is where your 9,137 providers already are!\n');
  
  try {
    // Read the high-value providers
    const content = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} high-value providers to add\n`);
    
    // Upload in batches to sphere1a
    const BATCH_SIZE = 50;
    let uploaded = 0;
    
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
        industry: determineIndustry(record.taxonomy),
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
        .insert(transformedBatch)
        .select();
      
      if (error) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
      } else {
        uploaded += batch.length;
        console.log(`✓ Uploaded batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(providers.length/BATCH_SIZE)} - Total: ${uploaded} providers`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Successfully uploaded ${uploaded} providers to SPHERE1A!`);
    
    // Get final count
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SPHERE1A DATABASE STATUS');
    console.log('='.repeat(50));
    console.log(`Previous: 9,137 providers + 92 medspas`);
    console.log(`Added: ${uploaded} high-value providers`);
    console.log(`Total Providers Now: ${count || '9,137+'}`);
    console.log('\n✅ Your SPHERE1A database is updated!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function determineIndustry(taxonomy) {
  const tax = (taxonomy || '').toLowerCase();
  if (tax.includes('dent')) return 'dental';
  if (tax.includes('dermat') || tax.includes('plastic') || tax.includes('cosmetic')) return 'aesthetic';
  return 'medical';
}

uploadToSphere1a();