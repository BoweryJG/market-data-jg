// Market Intelligence Types for Enhanced Procedure Data

export interface MarketIntelligence {
  // Year-by-year projections
  market_size_2026_usd_millions?: number;
  market_size_2027_usd_millions?: number;
  market_size_2028_usd_millions?: number;
  market_size_2029_usd_millions?: number;
  market_size_2030_usd_millions?: number;
  
  // Growth metrics
  cagr_5year?: number;
  market_confidence_score?: number; // 1-10
  data_source_quality?: string;
  
  // Competitive landscape
  top_3_device_manufacturers?: string[];
  device_market_shares?: Record<string, number>;
  average_device_price?: number;
  
  // Market dynamics
  procedure_volume_2025?: number;
  regional_hotspots?: string[];
  procedure_volume_by_region?: Record<string, number>;
  
  // Business intelligence
  reimbursement_trend?: 'increasing' | 'stable' | 'decreasing' | 'not_covered';
  adoption_curve_stage?: 'innovators' | 'early_adopters' | 'early_majority' | 'late_majority' | 'laggards';
  
  // Sales intelligence
  key_opinion_leaders?: string[];
  decision_maker_titles?: string[];
  sales_cycle_days?: number;
  technology_refresh_cycle?: number;
  competitive_procedures?: string[];
  
  // Metadata
  data_verification_date?: string;
  data_sources_used?: string[];
}

export interface EnhancedProcedure extends ProcedureBase, MarketIntelligence {
  // Existing fields
  id: number;
  procedure_name: string;
  name?: string;
  description?: string;
  category?: string;
  market_size_2025_usd_millions?: number;
  yearly_growth_percentage?: number;
  average_cost_usd?: number;
  
  // Market maturity
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated';
}

// Helper functions for UI display
export const formatMarketSize = (value?: number): string => {
  if (!value) return 'N/A';
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(0)}M`;
};

export const getConfidenceColor = (score?: number): string => {
  if (!score) return 'grey';
  if (score >= 8) return '#4caf50'; // green
  if (score >= 6) return '#ff9800'; // orange
  if (score >= 4) return '#f44336'; // red
  return '#9e9e9e'; // grey
};

export const getMaturityColor = (stage?: string): string => {
  switch (stage) {
    case 'Emerging': return '#9c27b0'; // purple
    case 'Growth': return '#2196f3'; // blue
    case 'Expansion': return '#4caf50'; // green
    case 'Mature': return '#ff9800'; // orange
    case 'Saturated': return '#f44336'; // red
    default: return '#9e9e9e'; // grey
  }
};

export const getReimbursementIcon = (trend?: string): string => {
  switch (trend) {
    case 'increasing': return '📈';
    case 'stable': return '➡️';
    case 'decreasing': return '📉';
    case 'not_covered': return '❌';
    default: return '❓';
  }
};