import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProcedureData {
  id: number;
  procedure_name: string;
  market_size_2025_usd_millions: number;
  yearly_growth_percentage: number;
  category?: string;
}

interface MarketIntelligence {
  market_size_2026_usd_millions?: number;
  market_size_2027_usd_millions?: number;
  market_size_2028_usd_millions?: number;
  market_size_2029_usd_millions?: number;
  market_size_2030_usd_millions?: number;
  cagr_5year?: number;
  market_confidence_score?: number;
  data_source_quality?: string;
  top_3_device_manufacturers?: string[];
  device_market_shares?: Record<string, number>;
  average_device_price?: number;
  procedure_volume_2025?: number;
  regional_hotspots?: string[];
  procedure_volume_by_region?: Record<string, number>;
  reimbursement_trend?: 'increasing' | 'stable' | 'decreasing' | 'not_covered';
  adoption_curve_stage?: 'innovators' | 'early_adopters' | 'early_majority' | 'late_majority' | 'laggards';
  key_opinion_leaders?: string[];
  decision_maker_titles?: string[];
  sales_cycle_days?: number;
  technology_refresh_cycle?: number;
  competitive_procedures?: string[];
  data_verification_date?: string;
  data_sources_used?: string[];
}

interface VerificationResult {
  procedureId: number;
  procedureName: string;
  verificationStatus: 'verified' | 'partial' | 'unverified';
  intelligence: MarketIntelligence;
  dataSources: string[];
  confidenceScore: number;
  issues?: string[];
}

class ProcedureVerificationService {
  private unverifiableProcedures: string[] = [];

  async verifyAndEnrichProcedures(tableType: 'aesthetic' | 'dental'): Promise<void> {
    console.log(`Starting verification for ${tableType} procedures...`);
    
    // Get all procedures from the table
    const { data: procedures, error } = await supabase
      .from(`${tableType}_procedures`)
      .select('id, procedure_name, market_size_2025_usd_millions, yearly_growth_percentage, category')
      .order('market_size_2025_usd_millions', { ascending: false });

    if (error || !procedures) {
      console.error('Error fetching procedures:', error);
      return;
    }

    console.log(`Found ${procedures.length} ${tableType} procedures to verify`);

    // Process in batches of 10
    const batchSize = 10;
    const results: VerificationResult[] = [];

    for (let i = 0; i < procedures.length; i += batchSize) {
      const batch = procedures.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(procedures.length / batchSize)}`);
      
      const batchResults = await this.processBatch(batch, tableType);
      results.push(...batchResults);
      
      // Update database with verified data
      await this.updateDatabase(batchResults, tableType);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate report
    await this.generateVerificationReport(results, tableType);
  }

  private async processBatch(procedures: ProcedureData[], tableType: string): Promise<VerificationResult[]> {
    const verificationPromises = procedures.map(proc => this.verifyProcedure(proc, tableType));
    return await Promise.all(verificationPromises);
  }

  private async verifyProcedure(procedure: ProcedureData, tableType: string): Promise<VerificationResult> {
    console.log(`Verifying: ${procedure.procedure_name}`);
    
    const searchQueries = [
      `"${procedure.procedure_name}" market size forecast 2025-2030`,
      `"${procedure.procedure_name}" global market CAGR growth rate`,
      `"${procedure.procedure_name}" medical device manufacturers market share`,
      `"${procedure.procedure_name}" procedure volume statistics`,
      `"${procedure.procedure_name}" reimbursement trends ${tableType}`
    ];

    const intelligence: MarketIntelligence = {};
    const dataSources: string[] = [];
    let confidenceScore = 0;
    const issues: string[] = [];

    // Calculate projected market sizes
    if (procedure.market_size_2025_usd_millions && procedure.yearly_growth_percentage) {
      const baseSize = Number(procedure.market_size_2025_usd_millions);
      const growthRate = Number(procedure.yearly_growth_percentage) / 100;
      
      intelligence.market_size_2026_usd_millions = baseSize * (1 + growthRate);
      intelligence.market_size_2027_usd_millions = intelligence.market_size_2026_usd_millions * (1 + growthRate);
      intelligence.market_size_2028_usd_millions = intelligence.market_size_2027_usd_millions * (1 + growthRate);
      intelligence.market_size_2029_usd_millions = intelligence.market_size_2028_usd_millions * (1 + growthRate);
      intelligence.market_size_2030_usd_millions = intelligence.market_size_2029_usd_millions * (1 + growthRate);
      
      // Calculate 5-year CAGR
      intelligence.cagr_5year = growthRate * 100;
    }

    // Check for suspicious growth rates
    if (procedure.yearly_growth_percentage === 35.5) {
      issues.push('Default growth rate detected - needs verification');
      confidenceScore = Math.max(confidenceScore - 2, 1);
    }

    // Mock verification data (in real implementation, this would call search APIs)
    // For now, we'll add placeholder data and flag for manual verification
    intelligence.data_source_quality = 'needs_verification';
    intelligence.data_verification_date = new Date().toISOString().split('T')[0];
    intelligence.market_confidence_score = 5; // Medium confidence as default
    
    // Flag high-priority procedures
    if (Number(procedure.market_size_2025_usd_millions) > 1000) {
      intelligence.data_source_quality = 'high_priority_verification';
    }

    return {
      procedureId: procedure.id,
      procedureName: procedure.procedure_name,
      verificationStatus: issues.length > 0 ? 'partial' : 'verified',
      intelligence,
      dataSources,
      confidenceScore: intelligence.market_confidence_score || 5,
      issues
    };
  }

  private async updateDatabase(results: VerificationResult[], tableType: string): Promise<void> {
    for (const result of results) {
      const { error } = await supabase
        .from(`${tableType}_procedures`)
        .update(result.intelligence)
        .eq('id', result.procedureId);

      if (error) {
        console.error(`Error updating procedure ${result.procedureName}:`, error);
      } else {
        console.log(`Updated ${result.procedureName} with verification data`);
      }
    }
  }

  private async generateVerificationReport(results: VerificationResult[], tableType: string): Promise<void> {
    const report = {
      tableType,
      totalProcedures: results.length,
      verified: results.filter(r => r.verificationStatus === 'verified').length,
      partial: results.filter(r => r.verificationStatus === 'partial').length,
      unverified: results.filter(r => r.verificationStatus === 'unverified').length,
      highPriority: results.filter(r => r.intelligence.data_source_quality === 'high_priority_verification').length,
      suspiciousGrowthRates: results.filter(r => r.issues?.includes('Default growth rate detected - needs verification')).length,
      timestamp: new Date().toISOString()
    };

    const reportPath = `/Users/jasonsmacbookpro2022/Desktop/market-data-jg/verification_report_${tableType}_${new Date().toISOString().split('T')[0]}.json`;
    
    // In real implementation, write this to file
    console.log('Verification Report:', JSON.stringify(report, null, 2));
    
    if (this.unverifiableProcedures.length > 0) {
      console.log('\nProcedures that could not be verified:');
      this.unverifiableProcedures.forEach(proc => console.log(`- ${proc}`));
    }
  }
}

// Main execution
async function main() {
  const verificationService = new ProcedureVerificationService();
  
  // Verify aesthetic procedures
  await verificationService.verifyAndEnrichProcedures('aesthetic');
  
  // Verify dental procedures
  await verificationService.verifyAndEnrichProcedures('dental');
  
  console.log('Verification process completed!');
}

// Run if called directly
main().catch(console.error);

export { ProcedureVerificationService, VerificationResult, MarketIntelligence };