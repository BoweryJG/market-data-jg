import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpload() {
  console.log('🔍 Debug Upload Test\n');
  
  // Try to insert a single provider
  const testProvider = {
    name: 'Test Provider',
    npi: '1234567890',
    address: '123 Test St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    phone: '555-1234',
    industry: 'dental',
    specialties: ['General Dentistry'],
    provider_type: 'solo',
    ownership_type: 'independent',
    data_source: 'test',
    verified: true
  };
  
  console.log('Attempting to insert:', testProvider);
  
  const { data, error } = await supabase
    .from('providers')
    .insert([testProvider])
    .select();
  
  if (error) {
    console.error('\n❌ Error details:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('\nFull error:', JSON.stringify(error, null, 2));
  } else {
    console.log('\n✅ Success! Inserted:', data);
  }
  
  // Check table columns
  console.log('\n📊 Checking providers table structure...');
  const { data: sample } = await supabase
    .from('providers')
    .select('*')
    .limit(1);
    
  if (sample && sample.length > 0) {
    console.log('Table columns:', Object.keys(sample[0]));
  }
}

debugUpload();