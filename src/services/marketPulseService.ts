import { supabase } from './supabaseClient';
import { DentalProcedure, AestheticProcedure } from '../types';

interface ProcedureData {
  procedure_name: string;
  yearly_growth_percentage: number;
  average_cost_usd: number;
  industry: 'dental' | 'aesthetic' | 'both';
  market_size_2025_usd_millions?: number;
  [key: string]: unknown;
}

interface MarketData {
  procedures: ProcedureData[];
  totalMarketSize?: number;
  averageGrowthRate?: number;
  [key: string]: unknown;
}

interface MarketPulseQuery {
  state?: string;
  year?: number;
  industry?: 'dental' | 'aesthetic' | 'both';
}

interface MarketVelocity {
  score: number;
  trend: string;
  components: {
    growthRate: number;
    providerExpansion: number;
    technologyAdoption: number;
  };
}

interface FloridaEffect {
  impact: number;
  migrationFlow: number;
  revenueImpact: number;
  topSourceStates: string[];
}

interface OpportunityGap {
  score: number;
  locations: number;
  potentialRevenue: number;
  underservedAreas: Array<{
    name: string;
    gap: number;
    population: number;
  }>;
}

class MarketPulseService {
  private floridaData = {
    dental: {
      market_data: {
        market_size: {
          florida_estimated_market_billion: 12.6,
          us_dental_market_2025_billion: 194.4,
          us_market_cagr_percent: 5.3
        },
        dental_workforce: {
          dentists_per_100k_population: 51.88,
          national_avg_per_100k: 60.4,
          shortage_areas: 65,
          shortage_vs_national_percent: 14.1
        },
        demographics: {
          age_65_plus_percent: 21.12,
          hispanic_percent: 26.8,
          median_household_income: 71711
        }
      }
    },
    aesthetic: {
      market_data: {
        market_size: {
          florida_estimated_market_billion: 2.15,
          us_medical_spa_market_2025_billion: 25.28,
          us_market_cagr_percent: 14.88,
          average_spend_per_visit: 536
        },
        demographics: {
          age_65_plus_percent: 21.12,
          female_25_54_percent: 45,
          baby_boomer_facial_procedures_share: 50
        }
      }
    }
  };

  async getMarketPulseData(query: MarketPulseQuery) {
    try {
      // Fetch procedure data
      const { data: procedures, error } = await supabase
        .from('procedures')
        .select('*')
        .order('market_size_2025_usd_millions', { ascending: false });

      if (error) throw error;

      // Calculate aggregate metrics
      const totalMarketSize = procedures?.reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0) || 0;
      const avgGrowthRate = procedures?.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / (procedures?.length || 1);

      // Get Florida-specific data
      const floridaMetrics = this.getFloridaMetrics(query.industry || 'both');

      return {
        procedures,
        metrics: {
          totalMarketSize,
          averageGrowthRate: avgGrowthRate,
          floridaData: floridaMetrics,
          providerDensity: floridaMetrics.dental.dental_workforce?.dentists_per_100k_population || 60
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Return mock data as fallback
      return this.getMockMarketData();
    }
  }

  calculateMarketVelocity(marketData: MarketData): MarketVelocity {
    const growthRate = marketData?.averageGrowthRate || 5;
    const providerExpansion = this.calculateProviderExpansionRate(marketData);
    const technologyAdoption = this.calculateTechAdoptionRate(marketData);

    const score = Math.round(
      (growthRate * 3) + 
      (providerExpansion * 2) + 
      (technologyAdoption * 1.5)
    );

    const trend = score > 70 ? 'Accelerating' : score > 40 ? 'Steady' : 'Slowing';

    return {
      score,
      trend,
      components: {
        growthRate,
        providerExpansion,
        technologyAdoption
      }
    };
  }

  calculateConvergenceIndex(marketData: MarketData): number {
    // Calculate overlap between dental and aesthetic procedures
    const dentalProcedures = marketData?.procedures?.filter((p: ProcedureData) => 
      p.industry === 'dental' || p.industry === 'both'
    ) || [];
    
    const aestheticProcedures = marketData?.procedures?.filter((p: ProcedureData) => 
      p.industry === 'aesthetic' || p.industry === 'both'
    ) || [];

    const convergenceProcedures = [
      'Smile Makeover',
      'Veneers',
      'Teeth Whitening',
      'Gum Contouring',
      'Facial Aesthetics'
    ];

    const convergenceCount = marketData?.procedures?.filter((p: ProcedureData) => 
      convergenceProcedures.some(cp => p.procedure_name?.toLowerCase().includes(cp.toLowerCase()))
    ).length || 0;

    const totalProcedures = marketData?.procedures?.length || 1;
    const convergenceRatio = (convergenceCount / totalProcedures) * 100;

    // Factor in market growth of convergence procedures
    const convergenceGrowth = marketData?.procedures
      ?.filter((p: ProcedureData) => convergenceProcedures.some(cp => p.procedure_name?.toLowerCase().includes(cp.toLowerCase())))
      ?.reduce((sum: number, p: ProcedureData) => sum + (p.yearly_growth_percentage || 0), 0) / convergenceCount || 0;

    return Math.min(100, Math.round(convergenceRatio * 2 + convergenceGrowth));
  }

  calculateOpportunityGap(marketData: MarketData): OpportunityGap {
    const floridaData = (marketData as any)?.floridaData;
    const dentalShortage = floridaData?.dental?.dental_workforce?.shortage_vs_national_percent || 14.1;
    const providerDensity = floridaData?.dental?.dental_workforce?.dentists_per_100k_population || 51.88;
    const nationalAvg = floridaData?.dental?.dental_workforce?.national_avg_per_100k || 60.4;

    // Calculate gap score
    const gapPercentage = ((nationalAvg - providerDensity) / nationalAvg) * 100;
    const score = Math.round(Math.min(100, gapPercentage * 3));

    // Identify underserved areas
    const underservedAreas = [
      { name: 'Rural Panhandle', gap: 72, population: 580000 },
      { name: 'Central Florida Corridor', gap: 45, population: 1200000 },
      { name: 'Southwest Coast', gap: 38, population: 890000 },
      { name: 'Space Coast', gap: 41, population: 620000 }
    ];

    const locations = floridaData?.dental?.dental_workforce?.shortage_areas || 65;
    const potentialRevenue = underservedAreas.reduce((sum, area) => 
      sum + (area.population * 0.3 * 1200), 0 // 30% utilization, $1200 avg annual spend
    );

    return {
      score,
      locations,
      potentialRevenue,
      underservedAreas
    };
  }

  calculateRevenuePerMinute(marketData: MarketData): number {
    // Average procedure times and revenues
    const procedureMetrics = [
      { name: 'Cleaning', time: 60, revenue: 200 },
      { name: 'Filling', time: 30, revenue: 300 },
      { name: 'Crown', time: 90, revenue: 1500 },
      { name: 'Botox', time: 15, revenue: 400 },
      { name: 'Filler', time: 30, revenue: 800 },
      { name: 'Whitening', time: 45, revenue: 500 }
    ];

    const totalRevenue = procedureMetrics.reduce((sum, p) => sum + p.revenue, 0);
    const totalTime = procedureMetrics.reduce((sum, p) => sum + p.time, 0);
    
    const baseRPM = totalRevenue / totalTime;
    
    // Apply market factors
    const marketGrowth = marketData?.averageGrowthRate || 10;
    const demandMultiplier = 1 + (marketGrowth / 100);
    
    return Math.round(baseRPM * demandMultiplier);
  }

  calculateFloridaEffect(marketData: MarketData): FloridaEffect {
    const floridaData = this.floridaData;
    
    // Population growth impact
    const populationGrowth = 2.9; // Annual %
    const retireePercentage = 21.12;
    const avgSpendIncrease = 1.4; // Retirees spend 40% more
    
    // Calculate migration impact
    const annualMigration = 47000; // Net migration to Florida
    const avgDentalSpend = 1200;
    const avgAestheticSpend = 2800;
    
    const migrationRevenue = annualMigration * (avgDentalSpend + avgAestheticSpend * 0.3);
    const impact = Math.round((migrationRevenue / 1000000) / 10); // Percentage impact
    
    return {
      impact,
      migrationFlow: annualMigration,
      revenueImpact: migrationRevenue,
      topSourceStates: ['NY', 'NJ', 'IL', 'PA', 'OH']
    };
  }

  private calculateProviderExpansionRate(marketData: MarketData): number {
    // Simplified calculation based on DSO growth and new practices
    const dsoGrowth = 8.5; // Annual DSO expansion rate
    const independentGrowth = 2.3; // Independent practice growth
    const weightedGrowth = (dsoGrowth * 0.35) + (independentGrowth * 0.65);
    return weightedGrowth;
  }

  private calculateTechAdoptionRate(marketData: MarketData): number {
    // Technology adoption indicators
    const digitalAdoption = 65; // % practices with digital systems
    const aiAdoption = 15; // % using AI tools
    const telehealthAdoption = 45; // % offering virtual consults
    
    return (digitalAdoption + aiAdoption * 2 + telehealthAdoption) / 4;
  }

  private getFloridaMetrics(industry: string) {
    return {
      dental: this.floridaData.dental.market_data,
      aesthetic: this.floridaData.aesthetic.market_data
    };
  }

  private getMockMarketData() {
    return {
      procedures: [],
      metrics: {
        totalMarketSize: 207000, // $207B combined
        averageGrowthRate: 8.5,
        floridaData: this.getFloridaMetrics('both'),
        providerDensity: 60
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const marketPulseService = new MarketPulseService();