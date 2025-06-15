import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client using Vite env vars (since they're in .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Brave Search API configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || '';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

interface ProcedureData {
  id: number;
  procedure_name: string;
  category: string;
  market_size_2025_usd_millions: number;
  yearly_growth_percentage: number;
  average_cost_usd: number;
}

interface MarketResearchResult {
  marketSize: number;
  growthRate: number;
  avgCost: number;
  sources: string[];
  confidence: number;
}

async function searchMarketData(procedureName: string, category: string): Promise<MarketResearchResult> {
  try {
    // Search for market size
    const marketSizeQuery = `"${procedureName}" market size 2025 USD millions forecast`;
    const growthQuery = `"${procedureName}" CAGR growth rate 2025-2030 forecast`;
    const costQuery = `"${procedureName}" average cost USD 2024 2025`;

    const searches = await Promise.all([
      axios.get(BRAVE_API_URL, {
        headers: { 'X-Subscription-Token': BRAVE_API_KEY },
        params: { q: marketSizeQuery, count: 5 }
      }),
      axios.get(BRAVE_API_URL, {
        headers: { 'X-Subscription-Token': BRAVE_API_KEY },
        params: { q: growthQuery, count: 5 }
      }),
      axios.get(BRAVE_API_URL, {
        headers: { 'X-Subscription-Token': BRAVE_API_KEY },
        params: { q: costQuery, count: 5 }
      })
    ]);

    // Extract market data from search results
    const marketSize = extractMarketSize(searches[0].data.web?.results || []);
    const growthRate = extractGrowthRate(searches[1].data.web?.results || []);
    const avgCost = extractAverageCost(searches[2].data.web?.results || []);
    
    const sources = [
      ...extractSources(searches[0].data.web?.results || []),
      ...extractSources(searches[1].data.web?.results || []),
      ...extractSources(searches[2].data.web?.results || [])
    ];

    return {
      marketSize,
      growthRate,
      avgCost,
      sources: [...new Set(sources)], // Remove duplicates
      confidence: calculateConfidence(marketSize, growthRate, sources.length)
    };
  } catch (error) {
    console.error(`Error searching for ${procedureName}:`, error);
    return {
      marketSize: 0,
      growthRate: 0,
      avgCost: 0,
      sources: [],
      confidence: 0
    };
  }
}

function extractMarketSize(results: any[]): number {
  for (const result of results) {
    const description = result.description || '';
    const title = result.title || '';
    const text = `${title} ${description}`.toLowerCase();
    
    // Look for market size patterns
    const billionMatch = text.match(/\$?(\d+\.?\d*)\s*billion/i);
    if (billionMatch) {
      return parseFloat(billionMatch[1]) * 1000; // Convert to millions
    }
    
    const millionMatch = text.match(/\$?(\d+\.?\d*)\s*million/i);
    if (millionMatch) {
      return parseFloat(millionMatch[1]);
    }
  }
  return 0;
}

function extractGrowthRate(results: any[]): number {
  for (const result of results) {
    const description = result.description || '';
    const title = result.title || '';
    const text = `${title} ${description}`.toLowerCase();
    
    // Look for CAGR or growth rate patterns
    const cagrMatch = text.match(/cagr\s*(?:of\s*)?(\d+\.?\d*)%/i);
    if (cagrMatch) {
      return parseFloat(cagrMatch[1]);
    }
    
    const growthMatch = text.match(/growth\s*(?:rate\s*)?(?:of\s*)?(\d+\.?\d*)%/i);
    if (growthMatch) {
      return parseFloat(growthMatch[1]);
    }
  }
  return 0;
}

function extractAverageCost(results: any[]): number {
  for (const result of results) {
    const description = result.description || '';
    const title = result.title || '';
    const text = `${title} ${description}`.toLowerCase();
    
    // Look for cost patterns
    const costMatch = text.match(/(?:average|avg|cost|price)\s*(?:is\s*)?\$?(\d{1,3}(?:,\d{3})*)/i);
    if (costMatch) {
      return parseInt(costMatch[1].replace(/,/g, ''));
    }
  }
  return 0;
}

function extractSources(results: any[]): string[] {
  return results
    .map(r => new URL(r.url).hostname.replace('www.', ''))
    .filter(source => 
      source.includes('research') || 
      source.includes('market') || 
      source.includes('insights') ||
      source.includes('intelligence')
    );
}

function calculateConfidence(marketSize: number, growthRate: number, sourceCount: number): number {
  let confidence = 0;
  
  if (marketSize > 0) confidence += 40;
  if (growthRate > 0) confidence += 30;
  if (sourceCount >= 3) confidence += 30;
  else if (sourceCount >= 2) confidence += 20;
  else if (sourceCount >= 1) confidence += 10;
  
  return Math.min(confidence, 100);
}

async function enrichProcedures(procedureType: 'aesthetic' | 'dental') {
  console.log(`Starting enrichment for ${procedureType} procedures...`);
  
  // Get procedures needing enrichment
  const { data: procedures, error } = await supabase
    .from(`${procedureType}_procedures`)
    .select('id, procedure_name, category, market_size_2025_usd_millions, yearly_growth_percentage, average_cost_usd')
    .in('market_size_2025_usd_millions', 
      procedureType === 'aesthetic' 
        ? [625.00, 550.00, 354.17, 167.50, 133.33, 3081.67]
        : [200.8052631578947360, 68.0, 120.0, 160.0, 280.0, 200.0, 514.8, 180.0, 140.0]
    )
    .order('procedure_name');

  if (error) {
    console.error('Error fetching procedures:', error);
    return;
  }

  console.log(`Found ${procedures?.length || 0} procedures needing enrichment`);

  // Process in batches
  const batchSize = 5;
  for (let i = 0; i < (procedures?.length || 0); i += batchSize) {
    const batch = procedures?.slice(i, i + batchSize) || [];
    
    await Promise.all(
      batch.map(async (procedure) => {
        console.log(`Researching: ${procedure.procedure_name}`);
        
        const researchResult = await searchMarketData(
          procedure.procedure_name,
          procedure.category
        );
        
        if (researchResult.confidence >= 60) {
          // Insert into staging table for review
          const { error: insertError } = await supabase
            .from('procedure_enrichment_staging')
            .insert({
              procedure_name: procedure.procedure_name,
              procedure_type: procedureType,
              original_id: procedure.id,
              current_market_size: procedure.market_size_2025_usd_millions,
              new_market_size: researchResult.marketSize || procedure.market_size_2025_usd_millions,
              current_growth_rate: procedure.yearly_growth_percentage,
              new_growth_rate: researchResult.growthRate || procedure.yearly_growth_percentage,
              current_avg_cost: procedure.average_cost_usd,
              new_avg_cost: researchResult.avgCost || procedure.average_cost_usd,
              data_sources: researchResult.sources,
              confidence_score: researchResult.confidence,
              research_notes: `Automated enrichment via Brave Search API`,
              validation_status: researchResult.confidence >= 80 ? 'validated' : 'pending'
            });
            
          if (insertError) {
            console.error(`Error saving research for ${procedure.procedure_name}:`, insertError);
          } else {
            console.log(`✓ Saved research for ${procedure.procedure_name} (confidence: ${researchResult.confidence}%)`);
          }
        } else {
          console.log(`✗ Low confidence for ${procedure.procedure_name} (${researchResult.confidence}%)`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      })
    );
  }
}

async function main() {
  console.log('Starting procedure data enrichment...');
  
  // Process both aesthetic and dental procedures
  await enrichProcedures('aesthetic');
  await enrichProcedures('dental');
  
  console.log('Enrichment process complete!');
  
  // Generate summary report
  const { data: summary } = await supabase
    .from('procedure_enrichment_staging')
    .select('procedure_type, validation_status, count')
    .eq('created_at', new Date().toISOString().split('T')[0]);
    
  console.log('\nEnrichment Summary:');
  console.log(summary);
}

// Run the enrichment
main().catch(console.error);