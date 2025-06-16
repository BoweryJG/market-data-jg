import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Parse the medical spa directory
async function parseMedSpaDirectory() {
  const content = await fs.readFile('medical_spas_ny_fl_directory.md', 'utf-8');
  const lines = content.split('\n');
  
  const medspas = [];
  let currentSpa = null;
  let currentState = '';
  let currentCity = '';
  
  for (const line of lines) {
    // State headers
    if (line === '## NEW YORK') {
      currentState = 'NY';
    } else if (line === '## FLORIDA') {
      currentState = 'FL';
    }
    
    // City headers
    else if (line.startsWith('### ')) {
      currentCity = line.replace('### ', '').trim();
    }
    
    // Neighborhood headers
    else if (line.startsWith('#### ')) {
      const neighborhood = line.replace('#### ', '').trim();
      if (currentCity === 'MANHATTAN') {
        currentCity = neighborhood + ' Manhattan';
      }
    }
    
    // Medical spa name
    else if (line.startsWith('**') && line.endsWith('**')) {
      if (currentSpa) {
        medspas.push(currentSpa);
      }
      currentSpa = {
        name: line.replace(/\*\*/g, '').trim(),
        state: currentState,
        city: currentCity,
        address: null,
        phone: null,
        website: null,
        services: []
      };
    }
    
    // Parse details
    else if (currentSpa && line.startsWith('- ')) {
      const detail = line.substring(2);
      
      if (detail.startsWith('Address:')) {
        currentSpa.address = detail.replace('Address:', '').trim();
      } else if (detail.startsWith('Phone:')) {
        const phone = detail.replace('Phone:', '').trim();
        if (phone !== 'Not listed in search results') {
          currentSpa.phone = phone;
        }
      } else if (detail.startsWith('Website:')) {
        currentSpa.website = detail.replace('Website:', '').trim();
      } else if (detail.startsWith('Services:')) {
        currentSpa.services = detail.replace('Services:', '').trim().split(',').map(s => s.trim());
      } else if (detail.startsWith('Location:')) {
        if (!currentSpa.address) {
          currentSpa.address = detail.replace('Location:', '').trim();
        }
      }
    }
  }
  
  // Add last spa
  if (currentSpa) {
    medspas.push(currentSpa);
  }
  
  return medspas;
}

// Upload to Supabase
async function uploadToSupabase(medspas) {
  console.log(`\n📤 Uploading ${medspas.length} medical spas to Supabase...\n`);
  
  const dbRecords = medspas.map(spa => ({
    provider_name: spa.name,
    practice_name: spa.name,
    address: spa.address || `${spa.city}, ${spa.state}`,
    city: spa.city.replace(' Manhattan', '').replace(' Beach', ''),
    state: spa.state,
    zip_code: '00000', // Will need enrichment
    phone: spa.phone,
    website: spa.website,
    industry: 'aesthetic',
    provider_type: 'spa',
    ownership_type: 'independent',
    specialties: ['medical spa'],
    procedures_offered: spa.services.length > 0 ? spa.services : ['botox', 'fillers', 'laser treatments'],
    tech_adoption_score: spa.website ? 80 : 60,
    growth_potential_score: 75,
    data_source: 'brave_search_directory',
    verified: true,
    notes: JSON.stringify({
      source: 'comprehensive_brave_search',
      hasWebsite: !!spa.website,
      hasPhone: !!spa.phone,
      hasAddress: !!spa.address,
      collectedAt: new Date().toISOString()
    })
  }));
  
  // Remove duplicates by name
  const uniqueRecords = Array.from(
    new Map(dbRecords.map(item => [item.provider_name.toLowerCase(), item])).values()
  );
  
  console.log(`📊 Processing ${uniqueRecords.length} unique medical spas`);
  
  // Batch upload
  const batchSize = 50;
  let uploaded = 0;
  let failed = 0;
  
  for (let i = 0; i < uniqueRecords.length; i += batchSize) {
    const batch = uniqueRecords.slice(i, i + batchSize);
    
    console.log(`📦 Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(uniqueRecords.length/batchSize)}...`);
    
    const { data, error } = await supabase
      .from('provider_locations')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Batch error: ${error.message}`);
      failed += batch.length;
    } else {
      uploaded += data.length;
      console.log(`✅ Uploaded ${data.length} records`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 UPLOAD COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📍 States: NY and FL`);
  
  // Summary by location
  const byCity = {};
  uniqueRecords.forEach(r => {
    byCity[r.city] = (byCity[r.city] || 0) + 1;
  });
  
  console.log('\nTop locations:');
  Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([city, count]) => {
      console.log(`  ${city}: ${count}`);
    });
}

// Main execution
async function main() {
  try {
    console.log('🚀 Medical Spa Directory Upload');
    console.log('==============================\n');
    
    console.log('📖 Reading directory file...');
    const medspas = await parseMedSpaDirectory();
    
    console.log(`✅ Parsed ${medspas.length} medical spas`);
    console.log(`  NY: ${medspas.filter(m => m.state === 'NY').length}`);
    console.log(`  FL: ${medspas.filter(m => m.state === 'FL').length}`);
    
    await uploadToSupabase(medspas);
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default { parseMedSpaDirectory, uploadToSupabase };