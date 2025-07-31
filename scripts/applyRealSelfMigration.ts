import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  logger.info('Applying RealSelf columns migration...\n');
  
  try {
    // First, let's check if columns already exist by trying to select them
    const { error: testError } = await supabase
      .from('aesthetic_procedures')
      .select('id, realself_worth_it_rating')
      .limit(1);
    
    if (testError && testError.message.includes('column')) {
      logger.info('RealSelf columns do not exist yet. Please run the migration SQL manually:');
      logger.info('\n--- Copy and run this SQL in Supabase SQL Editor ---\n');
      logger.info(`ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER CHECK (realself_worth_it_rating >= 0 AND realself_worth_it_rating <= 100),
ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER CHECK (realself_total_reviews >= 0),
ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
ADD COLUMN IF NOT EXISTS realself_url TEXT,
ADD COLUMN IF NOT EXISTS realself_last_updated DATE;`);
      logger.info('\n--- End of SQL ---\n');
      logger.info('After running the SQL, run: npm run scrape:realself');
    } else {
      logger.info('✓ RealSelf columns already exist in the database!');
      logger.info('You can now run: npm run scrape:realself');
    }
  } catch (error) {
    logger.error('Error checking database schema:', error);
  }
}

applyMigration();