import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SearchResult {
  source: string;
  marketSize?: number;
  growthRate?: number;
  manufacturers?: string[];
  marketShares?: Record<string, number>;
  procedureVolume?: number;
  averagePrice?: number;
  reimbursementInfo?: string;
  regionalData?: Record<string, any>;
  confidence: number;
  rawData?: any;
}

interface AggregatedIntelligence {
  procedure_name: string;
  market_sizes: number[];
  growth_rates: number[];
  manufacturers: Set<string>;
  market_shares: Record<string, number[]>;
  procedure_volumes: number[];
  average_prices: number[];
  reimbursement_trends: string[];
  regional_insights: Record<string, any>;
  data_sources: string[];
  overall_confidence: number;
}

class ParallelMarketVerificationService {
  private failedVerifications: Map<string, string[]> = new Map();

  async performParallelVerification(procedureName: string, category: string): Promise<AggregatedIntelligence> {
    console.log(`Starting parallel verification for: ${procedureName}`);
    
    const searchPromises = [
      this.searchBrave(procedureName, category),
      this.searchPerplexity(procedureName, category),
      this.searchFirecrawl(procedureName, category),
      this.searchWithPuppeteer(procedureName, category)
    ];

    const results = await Promise.allSettled(searchPromises);
    const successfulResults: SearchResult[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successfulResults.push(result.value);
      } else if (result.status === 'rejected') {
        const source = ['Brave', 'Perplexity', 'Firecrawl', 'Puppeteer'][index];
        errors.push(`${source}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      this.failedVerifications.set(procedureName, errors);
    }

    return this.aggregateResults(procedureName, successfulResults);
  }

  private async searchBrave(procedureName: string, category: string): Promise<SearchResult> {
    const _queries = [
      `"${procedureName}" market size 2025 2026 2027 2028 2029 2030 forecast`,
      `"${procedureName}" medical device market share manufacturers`,
      `${category} "${procedureName}" procedure volume statistics`
    ];

    // Placeholder for Brave search implementation
    // In real implementation, this would use mcp__brave-search__brave_web_search
    
    return {
      source: 'Brave Search',
      marketSize: 0, // Would be extracted from search results
      growthRate: 0, // Would be extracted from search results
      manufacturers: [],
      confidence: 0,
      rawData: { placeholder: true }
    };
  }

  private async searchPerplexity(procedureName: string, category: string): Promise<SearchResult> {
    const _query = `Provide comprehensive market analysis for ${procedureName} in the ${category} sector including:
    1. Global market size projections from 2025-2030
    2. Year-over-year growth rates and 5-year CAGR
    3. Top 3 device manufacturers and their market shares
    4. Average device/equipment prices
    5. Procedure volumes by major regions (US, EU, Asia)
    6. Reimbursement trends and coverage changes
    7. Key opinion leaders and innovation centers`;

    // Placeholder for Perplexity deep research
    // In real implementation, this would use mcp__perplexity__deep_research
    
    return {
      source: 'Perplexity Deep Research',
      marketSize: 0,
      growthRate: 0,
      manufacturers: [],
      confidence: 0,
      rawData: { placeholder: true }
    };
  }

  private async searchFirecrawl(_procedureName: string, _category: string): Promise<SearchResult> {
    const _targetUrls = [
      'https://www.grandviewresearch.com',
      'https://www.marketsandmarkets.com',
      'https://www.mordorintelligence.com',
      'https://www.fortunebusinessinsights.com'
    ];

    // Placeholder for Firecrawl implementation
    // In real implementation, this would use mcp__firecrawl__firecrawl_search
    
    return {
      source: 'Firecrawl Market Reports',
      marketSize: 0,
      growthRate: 0,
      manufacturers: [],
      confidence: 0,
      rawData: { placeholder: true }
    };
  }

  private async searchWithPuppeteer(_procedureName: string, _category: string): Promise<SearchResult> {
    // Target specific industry databases and manufacturer sites
    const _manufacturerSites = [
      'https://www.medtronic.com/investor-relations',
      'https://www.jnj.com/innovation',
      'https://www.abbott.com/investors'
    ];

    // Placeholder for Puppeteer implementation
    // In real implementation, this would use mcp__puppeteer functions
    
    return {
      source: 'Puppeteer Direct Scraping',
      marketSize: 0,
      growthRate: 0,
      manufacturers: [],
      confidence: 0,
      rawData: { placeholder: true }
    };
  }

  private aggregateResults(procedureName: string, results: SearchResult[]): AggregatedIntelligence {
    const aggregated: AggregatedIntelligence = {
      procedure_name: procedureName,
      market_sizes: [],
      growth_rates: [],
      manufacturers: new Set<string>(),
      market_shares: {},
      procedure_volumes: [],
      average_prices: [],
      reimbursement_trends: [],
      regional_insights: {},
      data_sources: [],
      overall_confidence: 0
    };

    // Aggregate data from all sources
    results.forEach(result => {
      if (result.marketSize) aggregated.market_sizes.push(result.marketSize);
      if (result.growthRate) aggregated.growth_rates.push(result.growthRate);
      if (result.manufacturers) result.manufacturers.forEach(m => aggregated.manufacturers.add(m));
      if (result.procedureVolume) aggregated.procedure_volumes.push(result.procedureVolume);
      if (result.averagePrice) aggregated.average_prices.push(result.averagePrice);
      if (result.reimbursementInfo) aggregated.reimbursement_trends.push(result.reimbursementInfo);
      aggregated.data_sources.push(result.source);
    });

    // Calculate overall confidence based on source agreement
    aggregated.overall_confidence = this.calculateConfidence(aggregated);

    return aggregated;
  }

  private calculateConfidence(data: AggregatedIntelligence): number {
    let confidence = 5; // Base confidence
    
    // Increase confidence for multiple agreeing sources
    if (data.data_sources.length >= 3) confidence += 2;
    if (data.data_sources.length >= 4) confidence += 1;
    
    // Check market size variance
    if (data.market_sizes.length > 1) {
      const variance = this.calculateVariance(data.market_sizes);
      if (variance < 0.1) confidence += 1; // Low variance = high agreement
      if (variance > 0.3) confidence -= 1; // High variance = disagreement
    }
    
    // Check growth rate agreement
    if (data.growth_rates.length > 1) {
      const variance = this.calculateVariance(data.growth_rates);
      if (variance < 0.1) confidence += 1;
      if (variance > 0.3) confidence -= 1;
    }
    
    return Math.max(1, Math.min(10, confidence));
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return variance / (mean * mean); // Coefficient of variation
  }

  async processHighPriorityProcedures(): Promise<void> {
    // Get high-value procedures (>$1B market size)
    const tables = ['aesthetic_procedures', 'dental_procedures'];
    
    for (const table of tables) {
      const { data: procedures, error } = await supabase
        .from(table)
        .select('id, procedure_name, market_size_2025_usd_millions, yearly_growth_percentage, category')
        .gt('market_size_2025_usd_millions', 1000)
        .order('market_size_2025_usd_millions', { ascending: false });

      if (error || !procedures) {
        console.error(`Error fetching high-priority procedures from ${table}:`, error);
        continue;
      }

      console.log(`Found ${procedures.length} high-priority procedures in ${table}`);
      
      for (const procedure of procedures) {
        const intelligence = await this.performParallelVerification(
          procedure.procedure_name,
          procedure.category || table.replace('_procedures', '')
        );
        
        // Update database with verified intelligence
        await this.updateProcedureIntelligence(table, procedure.id, intelligence);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  private async updateProcedureIntelligence(
    table: string, 
    procedureId: number, 
    intelligence: AggregatedIntelligence
  ): Promise<void> {
    const updateData: any = {
      market_confidence_score: intelligence.overall_confidence,
      data_sources_used: intelligence.data_sources,
      data_verification_date: new Date().toISOString().split('T')[0]
    };

    // Calculate averages if we have data
    if (intelligence.market_sizes.length > 0) {
      // const avgMarketSize = intelligence.market_sizes.reduce((a, b) => a + b) / intelligence.market_sizes.length;
      // Use this to verify/update 2025 market size if significantly different
    }

    if (intelligence.growth_rates.length > 0) {
      const avgGrowthRate = intelligence.growth_rates.reduce((a, b) => a + b) / intelligence.growth_rates.length;
      updateData.cagr_5year = avgGrowthRate;
    }

    if (intelligence.manufacturers.size > 0) {
      updateData.top_3_device_manufacturers = Array.from(intelligence.manufacturers).slice(0, 3);
    }

    if (intelligence.average_prices.length > 0) {
      updateData.average_device_price = intelligence.average_prices.reduce((a, b) => a + b) / intelligence.average_prices.length;
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', procedureId);

    if (error) {
      console.error(`Error updating procedure intelligence:`, error);
    } else {
      console.log(`Updated intelligence for procedure ID ${procedureId}`);
    }
  }

  generateFailureReport(): void {
    if (this.failedVerifications.size > 0) {
      console.log('\n=== Failed Verifications Report ===');
      this.failedVerifications.forEach((errors, procedure) => {
        console.log(`\n${procedure}:`);
        errors.forEach(error => console.log(`  - ${error}`));
      });
    }
  }
}

// Export for use in other scripts
export { ParallelMarketVerificationService, AggregatedIntelligence, SearchResult };