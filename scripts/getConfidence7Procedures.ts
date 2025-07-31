#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getConfidence7Procedures() {
  logger.info('=== PROCEDURES WITH CONFIDENCE SCORE 7 ===\n');
  
  const { data: aesthetic, error: aestheticError } = await supabase
    .from('aesthetic_procedures')
    .select('id, procedure_name, category, market_size_2025_usd_millions')
    .eq('market_confidence_score', 7)
    .order('procedure_name');
    
  if (aestheticError) {
    logger.error('Error:', aestheticError);
    return;
  }
  
  logger.info(`Found ${aesthetic?.length || 0} aesthetic procedures with confidence 7:\n`);
  
  aesthetic?.forEach((p, i) => {
    logger.info(`${i + 1}. ${p.procedure_name}`);
    logger.info(`   Category: ${p.category}`);
    logger.info(`   Current Market Size: $${p.market_size_2025_usd_millions}M`);
    logger.info('');
  });
}

getConfidence7Procedures().catch(console.error);