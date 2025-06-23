import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying RealSelf columns migration...\n');
  
  try {
    // First, let's check if columns already exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('aesthetic_procedures')
      .select('id, realself_worth_it_rating')
      .limit(1);
    
    if (testError && testError.message.includes('column')) {
      console.log('RealSelf columns do not exist yet. Please run the migration SQL manually:');
      console.log('\n--- Copy and run this SQL in Supabase SQL Editor ---\n');
      console.log(`ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER CHECK (realself_worth_it_rating >= 0 AND realself_worth_it_rating <= 100),
ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER CHECK (realself_total_reviews >= 0),
ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
ADD COLUMN IF NOT EXISTS realself_url TEXT,
ADD COLUMN IF NOT EXISTS realself_last_updated DATE;`);
      console.log('\n--- End of SQL ---\n');
      console.log('After running the SQL, run: npm run scrape:realself');
    } else {
      console.log('✓ RealSelf columns already exist in the database!');
      console.log('You can now run: npm run scrape:realself');
    }
  } catch (error) {
    console.error('Error checking database schema:', error);
  }
}

applyMigration();