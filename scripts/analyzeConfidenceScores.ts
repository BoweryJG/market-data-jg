import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeConfidenceScores() {
  logger.info('=== Analyzing Confidence Score Distribution ===\n');

  // Get confidence score distribution for aesthetic procedures
  const { data: aestheticScores, error: aestheticError } = await supabase
    .from('aesthetic_procedures')
    .select('procedure_name, market_confidence_score, market_size_2025_usd_millions, yearly_growth_percentage')
    .order('market_confidence_score', { ascending: false });

  if (aestheticError) {
    logger.error('Error fetching aesthetic procedures:', aestheticError);
    return;
  }

  // Get confidence score distribution for dental procedures
  const { data: dentalScores, error: dentalError } = await supabase
    .from('dental_procedures')
    .select('procedure_name, market_confidence_score, market_size_2025_usd_millions, yearly_growth_percentage')
    .order('market_confidence_score', { ascending: false });

  if (dentalError) {
    logger.error('Error fetching dental procedures:', dentalError);
    return;
  }

  // Analyze distribution
  const analyzeDistribution = (procedures: any[], type: string) => {
    const distribution: Record<number, number> = {};
    
    procedures.forEach(proc => {
      const score = proc.market_confidence_score || 0;
      distribution[score] = (distribution[score] || 0) + 1;
    });

    logger.info(`\n${type} Procedures Confidence Distribution:`);
    logger.info('Score | Count | Percentage');
    logger.info('------|-------|------------');
    
    Object.keys(distribution)
      .sort((a, b) => Number(b) - Number(a))
      .forEach(score => {
        const count = distribution[Number(score)];
        const percentage = ((count / procedures.length) * 100).toFixed(1);
        logger.info(`  ${score}   |  ${count.toString().padEnd(4)} | ${percentage}%`);
      });

    // Show examples of low confidence procedures
    const lowConfidence = procedures.filter(p => p.market_confidence_score <= 5);
    logger.info(`\nLow Confidence (≤5) Examples:`);
    lowConfidence.slice(0, 10).forEach(proc => {
      logger.info(`- ${proc.procedure_name}: Score ${proc.market_confidence_score}, Market $${proc.market_size_2025_usd_millions}M, Growth ${proc.yearly_growth_percentage}%`);
    });

    return { distribution, lowConfidenceCount: lowConfidence.length };
  };

  const aestheticAnalysis = analyzeDistribution(aestheticScores || [], 'Aesthetic');
  const dentalAnalysis = analyzeDistribution(dentalScores || [], 'Dental');

  // Summary
  logger.info('\n=== SUMMARY ===');
  logger.info(`Total Aesthetic Procedures: ${aestheticScores?.length || 0}`);
  logger.info(`Low Confidence Aesthetic: ${aestheticAnalysis.lowConfidenceCount} (${((aestheticAnalysis.lowConfidenceCount / (aestheticScores?.length || 1)) * 100).toFixed(1)}%)`);
  logger.info(`\nTotal Dental Procedures: ${dentalScores?.length || 0}`);
  logger.info(`Low Confidence Dental: ${dentalAnalysis.lowConfidenceCount} (${((dentalAnalysis.lowConfidenceCount / (dentalScores?.length || 1)) * 100).toFixed(1)}%)`);

  // Identify patterns in low confidence procedures
  logger.info('\n=== PATTERNS IN LOW CONFIDENCE DATA ===');
  const allProcedures = [...(aestheticScores || []), ...(dentalScores || [])];
  const lowConfidenceAll = allProcedures.filter(p => p.market_confidence_score <= 5);
  
  // Check for common growth rates
  const growthRates: Record<number, number> = {};
  lowConfidenceAll.forEach(proc => {
    const rate = proc.yearly_growth_percentage;
    growthRates[rate] = (growthRates[rate] || 0) + 1;
  });
  
  logger.info('\nMost Common Growth Rates in Low Confidence Procedures:');
  Object.entries(growthRates)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([rate, count]) => {
      logger.info(`- ${rate}%: ${count} procedures`);
    });

  // Recommendations
  logger.info('\n=== RECOMMENDATIONS ===');
  logger.info('1. Procedures with confidence ≤ 5 need real market research using MCP tools');
  logger.info('2. Focus on high-value procedures (market size > $1B) first');
  logger.info('3. Procedures with generic growth rates (7.5%, 8%, etc.) likely need verification');
  logger.info('4. Consider using Perplexity deep research for comprehensive analysis');
}

// Execute
analyzeConfidenceScores().catch(console.error);