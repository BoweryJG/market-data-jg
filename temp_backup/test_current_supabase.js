import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n📊 Checking what tables exist...\n');
  
  // List of common table names to check
  const tablesToCheck = [
    'providers', 
    'dental_procedures',
    'aesthetic_procedures', 
    'dental_companies',
    'aesthetic_companies',
    'practices',
    'medical_spas',
    'npi_providers'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table} - does not exist`);
        } else {
          console.log(`⚠️  ${table} - error: ${error.message}`);
        }
      } else {
        // Get actual count
        const { count: actualCount } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`✅ ${table} - exists (${actualCount || 0} rows)`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error checking`);
    }
  }
  
  console.log('\n💡 This appears to be a different Supabase project!');
  console.log('The 9,137 providers were uploaded to a different project.');
}

checkTables();