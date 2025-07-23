import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRealSelfData() {
  console.log('=== RealSelf Data Analysis ===\n');
  
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
    console.log(`Total procedures with RealSelf data: ${withData.length}\n`);
    
    // Top rated procedures
    console.log('=== Top 5 Highest Rated (Worth It %) ===');
    withData.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.procedure_name}: ${p.realself_worth_it_rating}% (${p.realself_total_reviews} reviews)`);
    });
    
    // Lowest rated procedures
    console.log('\n=== Bottom 5 Lowest Rated (Worth It %) ===');
    withData.slice(-5).reverse().forEach((p, i) => {
      console.log(`${i + 1}. ${p.procedure_name}: ${p.realself_worth_it_rating}% (${p.realself_total_reviews} reviews)`);
    });
    
    // Most reviewed procedures
    const mostReviewed = [...withData].sort((a, b) => b.realself_total_reviews - a.realself_total_reviews);
    console.log('\n=== Top 5 Most Reviewed ===');
    mostReviewed.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.procedure_name}: ${p.realself_total_reviews.toLocaleString()} reviews (${p.realself_worth_it_rating}% Worth It)`);
    });
    
    // Market size vs satisfaction analysis
    console.log('\n=== Market Size vs Patient Satisfaction ===');
    const highMarketLowSatisfaction = withData
      .filter(p => p.market_size_2025_usd_millions > 500 && p.realself_worth_it_rating < 75)
      .sort((a, b) => b.market_size_2025_usd_millions - a.market_size_2025_usd_millions);
    
    if (highMarketLowSatisfaction.length > 0) {
      console.log('High Market Size but Low Satisfaction (<75%):');
      highMarketLowSatisfaction.forEach(p => {
        console.log(`- ${p.procedure_name}: $${p.market_size_2025_usd_millions}M market, ${p.realself_worth_it_rating}% satisfaction`);
      });
    }
    
    // Statistics
    const avgRating = withData.reduce((sum, p) => sum + p.realself_worth_it_rating, 0) / withData.length;
    const totalReviews = withData.reduce((sum, p) => sum + p.realself_total_reviews, 0);
    
    console.log('\n=== Overall Statistics ===');
    console.log(`Average Worth It Rating: ${avgRating.toFixed(1)}%`);
    console.log(`Total Patient Reviews: ${totalReviews.toLocaleString()}`);
    console.log(`Average Reviews per Procedure: ${Math.round(totalReviews / withData.length).toLocaleString()}`);
  }
  
  if (withoutData && withoutData.length > 0) {
    console.log('\n=== High-Value Procedures Missing RealSelf Data ===');
    withoutData.forEach((p, i) => {
      console.log(`${i + 1}. ${p.procedure_name}: $${p.market_size_2025_usd_millions}M market`);
    });
  }
}

analyzeRealSelfData().catch(console.error);