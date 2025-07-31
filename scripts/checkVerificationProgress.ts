import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProgress() {
  logger.info('=== Market Data Verification Progress ===\n');
  
  // Check aesthetic procedures
  const { data: aestheticStats } = await supabase
    .from('aesthetic_procedures')
    .select('data_verification_date, market_confidence_score')
    .not('data_verification_date', 'is', null);
  
  const { count: totalAesthetic } = await supabase
    .from('aesthetic_procedures')
    .select('*', { count: 'exact', head: true });
  
  // Check dental procedures  
  const { data: dentalStats } = await supabase
    .from('dental_procedures')
    .select('data_verification_date, market_confidence_score')
    .not('data_verification_date', 'is', null);
    
  const { count: totalDental } = await supabase
    .from('dental_procedures')
    .select('*', { count: 'exact', head: true });
  
  const verifiedAesthetic = aestheticStats?.length || 0;
  const verifiedDental = dentalStats?.length || 0;
  
  logger.info(`Aesthetic Procedures:`);
  logger.info(`  Total: ${totalAesthetic}`);
  logger.info(`  Verified: ${verifiedAesthetic} (${((verifiedAesthetic / (totalAesthetic || 1)) * 100).toFixed(1)}%)`);
  
  logger.info(`\nDental Procedures:`);
  logger.info(`  Total: ${totalDental}`);
  logger.info(`  Verified: ${verifiedDental} (${((verifiedDental / (totalDental || 1)) * 100).toFixed(1)}%)`);
  
  logger.info(`\nTotal Progress:`);
  logger.info(`  ${verifiedAesthetic + verifiedDental} of ${(totalAesthetic || 0) + (totalDental || 0)} procedures verified`);
  
  // Check some examples with full data
  const { data: examples } = await supabase
    .from('aesthetic_procedures')
    .select('procedure_name, market_size_2025_usd_millions, market_size_2030_usd_millions, cagr_5year, market_confidence_score')
    .not('market_size_2030_usd_millions', 'is', null)
    .limit(5);
  
  if (examples && examples.length > 0) {
    logger.info('\n=== Example Verified Procedures ===');
    examples.forEach(proc => {
      logger.info(`\n${proc.procedure_name}:`);
      logger.info(`  2025 Market: $${proc.market_size_2025_usd_millions}M`);
      logger.info(`  2030 Market: $${proc.market_size_2030_usd_millions}M`);
      logger.info(`  5-Year CAGR: ${proc.cagr_5year}%`);
      logger.info(`  Confidence: ${proc.market_confidence_score}/10`);
    });
  }
}

checkProgress().catch(console.error);