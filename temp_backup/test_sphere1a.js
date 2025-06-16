import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Sphere1a connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // First check if we can read
  console.log('\n1. Testing READ access...');
  const { data: readTest, error: readError } = await supabase
    .from('providers')
    .select('*')
    .limit(1);
    
  if (readError) {
    console.error('Read error:', readError);
  } else {
    console.log('✓ Can read providers table');
    console.log('Current row count check...');
    
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    console.log('Current providers in database:', count);
  }
  
  // Try a simple insert
  console.log('\n2. Testing INSERT access...');
  const testProvider = {
    name: 'High Value Test Provider',
    npi: '9999999999',
    address: '123 Park Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10021',
    industry: 'dental',
    provider_type: 'solo',
    data_source: 'test'
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('providers')
    .insert([testProvider])
    .select();
    
  if (insertError) {
    console.error('Insert error:', insertError);
    console.error('Full error details:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✓ Successfully inserted test provider:', insertData);
    
    // Clean up
    await supabase
      .from('providers')
      .delete()
      .eq('npi', '9999999999');
  }
}

test();