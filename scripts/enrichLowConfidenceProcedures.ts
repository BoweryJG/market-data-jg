#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getLowConfidenceProcedures() {
  console.log('=== GETTING LOW CONFIDENCE PROCEDURES ===\n');
  
  // Get aesthetic procedures with confidence <= 8
  const { data: aestheticProcs, error: aestheticError } = await supabase
    .from('aesthetic_procedures')
    .select('id, procedure_name, category, market_confidence_score')
    .or('market_confidence_score.lte.8,market_confidence_score.is.null')
    .order('market_confidence_score', { ascending: true, nullsFirst: true })
    .order('procedure_name');
    
  if (aestheticError) {
    console.error('Error fetching aesthetic procedures:', aestheticError);
    return;
  }
  
  // Get dental procedures with confidence <= 8
  const { data: dentalProcs, error: dentalError } = await supabase
    .from('dental_procedures')
    .select('id, procedure_name, category, market_confidence_score')
    .or('market_confidence_score.lte.8,market_confidence_score.is.null')
    .order('market_confidence_score', { ascending: true, nullsFirst: true })
    .order('procedure_name');
    
  if (dentalError) {
    console.error('Error fetching dental procedures:', dentalError);
    return;
  }
  
  const allProcedures = [
    ...(aestheticProcs || []).map(p => ({ ...p, table: 'aesthetic_procedures' })),
    ...(dentalProcs || []).map(p => ({ ...p, table: 'dental_procedures' }))
  ];
  
  console.log(`Found ${allProcedures.length} procedures needing enrichment:\n`);
  
  // Group by confidence score
  const byConfidence: Record<string, any[]> = {};
  allProcedures.forEach(proc => {
    const score = proc.market_confidence_score || 0;
    if (!byConfidence[score]) byConfidence[score] = [];
    byConfidence[score].push(proc);
  });
  
  // Display breakdown
  Object.keys(byConfidence).sort((a, b) => Number(a) - Number(b)).forEach(score => {
    console.log(`Confidence ${score}: ${byConfidence[score].length} procedures`);
    if (Number(score) <= 5) {
      // Show first 5 for low confidence
      byConfidence[score].slice(0, 5).forEach(p => {
        console.log(`  - ${p.procedure_name} (${p.table.replace('_procedures', '')})`);
      });
      if (byConfidence[score].length > 5) {
        console.log(`  ... and ${byConfidence[score].length - 5} more`);
      }
    }
  });
  
  console.log(`\nTotal procedures to enrich: ${allProcedures.length}`);
  console.log('\nStarting with lowest confidence procedures first...\n');
  
  return allProcedures;
}

// Execute
getLowConfidenceProcedures().catch(console.error);