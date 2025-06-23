#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getConfidence7Procedures() {
  console.log('=== PROCEDURES WITH CONFIDENCE SCORE 7 ===\n');
  
  const { data: aesthetic, error: aestheticError } = await supabase
    .from('aesthetic_procedures')
    .select('id, procedure_name, category, market_size_2025_usd_millions')
    .eq('market_confidence_score', 7)
    .order('procedure_name');
    
  if (aestheticError) {
    console.error('Error:', aestheticError);
    return;
  }
  
  console.log(`Found ${aesthetic?.length || 0} aesthetic procedures with confidence 7:\n`);
  
  aesthetic?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.procedure_name}`);
    console.log(`   Category: ${p.category}`);
    console.log(`   Current Market Size: $${p.market_size_2025_usd_millions}M`);
    console.log('');
  });
}

getConfidence7Procedures().catch(console.error);