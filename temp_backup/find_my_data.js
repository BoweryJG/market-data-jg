import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMyData() {
  console.log('🔍 SEARCHING FOR YOUR 9,137 PROVIDERS IN SPHERE1A\n');
  
  const tables = [
    'providers',
    'npi_providers', 
    'medical_spas',
    'practices',
    'dental_companies',
    'aesthetic_companies',
    'medical_providers',
    'healthcare_providers',
    'provider_data',
    'npi_data'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (!error && count > 0) {
        console.log(`✅ ${table}: ${count} rows`);
        
        // Check if it has NPI data
        const { data: sample } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (sample && sample[0] && sample[0].npi) {
          console.log(`   ^ This table has NPI data!`);
        }
      }
    } catch (e) {
      // Table doesn't exist
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('Your 9,137 providers might be in a different table or project.');
  console.log('The current Sphere1a database seems to have mostly mock data.');
}

findMyData();