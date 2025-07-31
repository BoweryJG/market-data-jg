import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/services/logging/logger';


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRealSelfData() {
  logger.info('=== RealSelf Data Analysis ===\n');
  
  // Get procedures with RealSelf data
  const { data: withData } = await supabase
    .from('aesthetic_procedures')
    .select('*')
    .not('realself_worth_it_rating', 'is', null)
    .order('realself_worth_it_rating', { ascending: false });
  
  // Get procedures without RealSelf data
  const { data: withoutData } = await supabase
    .from('aesthetic_procedures')
    .select('procedure_name, market_size_2025_usd_millions')
    .is('realself_worth_it_rating', null)
    .order('market_size_2025_usd_millions', { ascending: false })
    .limit(10);
  
  if (withData) {
    logger.info(`Total procedures with RealSelf data: ${withData.length}\n`);
    
    // Top rated procedures
    logger.info('=== Top 5 Highest Rated (Worth It %) ===');
    withData.slice(0, 5).forEach((p, i) => {
      logger.info(`${i + 1}. ${p.procedure_name}: ${p.realself_worth_it_rating}% (${p.realself_total_reviews} reviews)`);
    });
    
    // Lowest rated procedures
    logger.info('\n=== Bottom 5 Lowest Rated (Worth It %) ===');
    withData.slice(-5).reverse().forEach((p, i) => {
      logger.info(`${i + 1}. ${p.procedure_name}: ${p.realself_worth_it_rating}% (${p.realself_total_reviews} reviews)`);
    });
    
    // Most reviewed procedures
    const mostReviewed = [...withData].sort((a, b) => b.realself_total_reviews - a.realself_total_reviews);
    logger.info('\n=== Top 5 Most Reviewed ===');
    mostReviewed.slice(0, 5).forEach((p, i) => {
      logger.info(`${i + 1}. ${p.procedure_name}: ${p.realself_total_reviews.toLocaleString()} reviews (${p.realself_worth_it_rating}% Worth It)`);
    });
    
    // Market size vs satisfaction analysis
    logger.info('\n=== Market Size vs Patient Satisfaction ===');
    const highMarketLowSatisfaction = withData
      .filter(p => p.market_size_2025_usd_millions > 500 && p.realself_worth_it_rating < 75)
      .sort((a, b) => b.market_size_2025_usd_millions - a.market_size_2025_usd_millions);
    
    if (highMarketLowSatisfaction.length > 0) {
      logger.info('High Market Size but Low Satisfaction (<75%):');
      highMarketLowSatisfaction.forEach(p => {
        logger.info(`- ${p.procedure_name}: $${p.market_size_2025_usd_millions}M market, ${p.realself_worth_it_rating}% satisfaction`);
      });
    }
    
    // Statistics
    const avgRating = withData.reduce((sum, p) => sum + p.realself_worth_it_rating, 0) / withData.length;
    const totalReviews = withData.reduce((sum, p) => sum + p.realself_total_reviews, 0);
    
    logger.info('\n=== Overall Statistics ===');
    logger.info(`Average Worth It Rating: ${avgRating.toFixed(1)}%`);
    logger.info(`Total Patient Reviews: ${totalReviews.toLocaleString()}`);
    logger.info(`Average Reviews per Procedure: ${Math.round(totalReviews / withData.length).toLocaleString()}`);
  }
  
  if (withoutData && withoutData.length > 0) {
    logger.info('\n=== High-Value Procedures Missing RealSelf Data ===');
    withoutData.forEach((p, i) => {
      logger.info(`${i + 1}. ${p.procedure_name}: $${p.market_size_2025_usd_millions}M market`);
    });
  }
}

analyzeRealSelfData().catch(console.error);