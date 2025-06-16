import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

dotenv.config();

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProvidersTable() {
  console.log('📤 UPLOADING HIGH-VALUE PROVIDERS TO SPHERE1A\n');
  
  // Since providers table doesn't exist, let's use dental_companies or aesthetic_companies
  // Or create entries in the existing tables
  
  try {
    // Read the high-value providers CSV
    const content = await fs.readFile('high_value_providers_2025-06-05.csv', 'utf-8');
    const providers = parse(content, { columns: true, skip_empty_lines: true });
    
    console.log(`Found ${providers.length} providers to upload\n`);
    
    // Split into dental and aesthetic
    const dentalProviders = [];
    const aestheticProviders = [];
    
    providers.forEach(p => {
      const isDental = p.taxonomy?.toLowerCase().includes('dent');
      const provider = {
        name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        address: p.address,
        city: p.city,
        state: p.state,
        zip_code: p.zip,
        phone: p.phone,
        website: null,
        specialties: [p.taxonomy].filter(Boolean),
        procedures_offered: [],
        provider_type: 'high_value_practice',
        market_focus: 'premium',
        data_source: 'npi_high_value',
        npi: p.npi, // Store NPI in notes or custom field
        created_at: new Date().toISOString()
      };
      
      if (isDental) {
        dentalProviders.push(provider);
      } else {
        aestheticProviders.push(provider);
      }
    });
    
    console.log(`Dental: ${dentalProviders.length}, Aesthetic: ${aestheticProviders.length}\n`);
    
    // Upload dental providers
    if (dentalProviders.length > 0) {
      console.log('Uploading dental providers...');
      const { error: dentalError } = await supabase
        .from('dental_companies')
        .insert(dentalProviders);
        
      if (dentalError) {
        console.error('Dental upload error:', dentalError.message);
      } else {
        console.log(`✅ Uploaded ${dentalProviders.length} dental providers`);
      }
    }
    
    // Upload aesthetic providers
    if (aestheticProviders.length > 0) {
      console.log('Uploading aesthetic providers...');
      const { error: aestheticError } = await supabase
        .from('aesthetic_companies')
        .insert(aestheticProviders);
        
      if (aestheticError) {
        console.error('Aesthetic upload error:', aestheticError.message);
      } else {
        console.log(`✅ Uploaded ${aestheticProviders.length} aesthetic providers`);
      }
    }
    
    // Get final counts
    const { count: dentalCount } = await supabase
      .from('dental_companies')
      .select('*', { count: 'exact', head: true });
      
    const { count: aestheticCount } = await supabase
      .from('aesthetic_companies')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SPHERE1A DATABASE UPDATED');
    console.log('='.repeat(50));
    console.log(`Dental companies: ${dentalCount} (was 52)`);
    console.log(`Aesthetic companies: ${aestheticCount} (was 33)`);
    console.log(`Total: ${dentalCount + aestheticCount} companies`);
    console.log('\n✅ Your high-value providers are now in the database!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createProvidersTable();