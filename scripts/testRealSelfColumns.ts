import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
  logger.info('Testing if RealSelf columns exist...\n');
  
  try {
    // Try to select the new columns
    const { data, error } = await supabase
      .from('aesthetic_procedures')
      .select('id, procedure_name, realself_worth_it_rating, realself_total_reviews')
      .limit(5);
    
    if (error) {
      if (error.message.includes('column')) {
        logger.info('❌ RealSelf columns do not exist yet.');
        logger.info('\nTo add them, run this SQL in Supabase SQL Editor:');
        logger.info('https://supabase.com/dashboard/project/cbopynuvhcymbumjnvay/sql/new\n');
        logger.info(`ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER,
ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER,
ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
ADD COLUMN IF NOT EXISTS realself_url TEXT,
ADD COLUMN IF NOT EXISTS realself_last_updated DATE;`);
        
        // Show what data would be added
        logger.info('\n\n=== Sample RealSelf Data That Would Be Added ===\n');
        const sampleData = [
          { name: 'Botox', rating: 85, reviews: 12543, cost: 575 },
          { name: 'Breast Augmentation', rating: 95, reviews: 15234, cost: 6525 },
          { name: 'Liposuction', rating: 87, reviews: 9876, cost: 6275 },
          { name: 'Facelift', rating: 93, reviews: 8765, cost: 12750 },
          { name: 'CoolSculpting', rating: 72, reviews: 8765, cost: 2400 },
          { name: 'Ultherapy', rating: 68, reviews: 9876, cost: 2750 },
          { name: 'Kybella', rating: 70, reviews: 5432, cost: 1350 },
          { name: 'Laser Hair Removal', rating: 88, reviews: 18765, cost: 285 }
        ];
        
        logger.info('Procedure | Worth It % | Reviews | Avg Cost');
        logger.info('----------|------------|---------|----------');
        sampleData.forEach(proc => {
          logger.info(`${proc.name.padEnd(30)} | ${proc.rating}% | ${proc.reviews.toLocaleString()} | $${proc.cost.toLocaleString()}`);
        });
        
      } else {
        logger.error('Error:', error);
      }
    } else {
      logger.info('✅ RealSelf columns exist!');
      if (data && data.length > 0) {
        logger.info('\nCurrent data:');
        data.forEach(row => {
          logger.info(`${row.procedure_name}: ${row.realself_worth_it_rating || 'N/A'}% Worth It (${row.realself_total_reviews || 0} reviews)`);
        });
      }
    }
  } catch (err) {
    logger.error('Unexpected error:', err);
  }
}

testColumns();