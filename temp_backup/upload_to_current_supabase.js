import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHighValueProviders() {
  console.log('📤 Uploading High-Value Providers to Current Supabase\n');
  
  try {
    // Read the CSV file
    const content = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} providers to upload\n`);
    
    // Upload in batches
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
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Batch error:`, error.message);
      } else {
        uploaded += batch.length;
        process.stdout.write(`\rProgress: ${uploaded}/${providers.length} providers uploaded`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n\n✅ Successfully uploaded ${uploaded} providers!`);
    
    // Also create medical_spas entries for group practices
    console.log('\n📤 Creating medical spa entries for group practices...\n');
    
    const practices = await fs.readFile('high_value_practices_2025-06-05.csv', 'utf-8');
    const practiceData = parse(practices, { columns: true, skip_empty_lines: true });
    
    // Filter for larger practices that might be medical spas
    const potentialSpas = practiceData
      .filter(p => p.providerCount > 3 && p.isNamedPractice === '1')
      .map(p => ({
        name: p.practiceName,
        address: p.address,
        city: p.city,
        state: p.state,
        zip_code: p.zip,
        phone: p.phones?.split(';')[0] || null,
        website: null,
        services_offered: p.specialties,
        business_type: 'medical_spa',
        size: p.estimatedSize,
        established_year: null,
        data_source: 'npi_analysis',
        verified: true,
        notes: `${p.providerCount} providers on staff`
      }));
    
    if (potentialSpas.length > 0) {
      const { error: spaError } = await supabase
        .from('medical_spas')
        .insert(potentialSpas);
        
      if (spaError) {
        console.error('Error uploading spas:', spaError.message);
      } else {
        console.log(`✅ Created ${potentialSpas.length} medical spa entries`);
      }
    }
    
    // Show final counts
    const { count: providerCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
      
    const { count: spaCount } = await supabase
      .from('medical_spas')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL DATABASE STATUS');
    console.log('='.repeat(50));
    console.log(`Total Providers: ${providerCount || 0}`);
    console.log(`Total Medical Spas: ${spaCount || 0}`);
    console.log('\n✅ Your database now has high-value provider data!');
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

function determineIndustry(taxonomy) {
  const tax = (taxonomy || '').toLowerCase();
  if (tax.includes('dent')) return 'dental';
  if (tax.includes('dermat') || tax.includes('plastic') || tax.includes('cosmetic')) return 'aesthetic';
  return 'medical';
}

uploadHighValueProviders();