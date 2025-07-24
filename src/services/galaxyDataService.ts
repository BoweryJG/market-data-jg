import { supabase } from './supabaseClient';
import { braveSearchService } from './braveSearchService';
import { logger } from './logging/logger';
import { CacheEntry, SearchResult } from '../types/common';

export interface GalaxyProcedure {
  id: string;
  procedure_name: string;
  industry: 'dental' | 'aesthetic' | 'both';
  category: string;
  market_size_2025_usd_millions: number;
  yoy_growth_2024_to_2025_percent: number;
  complexity_score_1_to_10: number;
  average_cost_usd: number;
  trending_score_1_to_100: number;
  adoption_rate_percent: number;
  key_demographics: string;
  top_states_by_volume: string[];
  innovation_index: number;
  competitive_intensity: number;
  // Sales-specific fields
  total_addressable_accounts?: number;
  penetration_rate?: number;
  average_deal_size?: number;
  sales_cycle_days?: number;
}

export interface CategoryAggregate {
  id: string;
  name: string;
  industry: string;
  total_market_size: number;
  avg_growth_rate: number;
  procedure_count: number;
  innovation_score: number;
  trending_direction: 'up' | 'down' | 'stable';
  top_procedures: GalaxyProcedure[];
  market_signals?: MarketSignal[];
  sales_opportunities?: SalesOpportunity[];
}

export interface MarketSignal {
  id: string;
  type: 'FDA_APPROVAL' | 'COMPETITOR_MOVE' | 'PRICE_CHANGE' | 'NEW_TECHNOLOGY' | 'MARKET_TREND';
  title: string;
  description: string;
  source: string;
  url?: string;
  relevance_score: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  detected_at: Date;
  affected_procedures: string[];
  sales_action?: string;
}

export interface SalesOpportunity {
  id: string;
  type: 'CROSS_SELL' | 'UPSELL' | 'NEW_ACCOUNT' | 'COMPETITIVE_DISPLACEMENT';
  title: string;
  description: string;
  potential_revenue: number;
  probability: number;
  recommended_actions: string[];
  target_accounts?: string[];
  urgency_score: number;
}

class GalaxyDataService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCategoryAggregates(industry?: 'dental' | 'aesthetic'): Promise<CategoryAggregate[]> {
    const cacheKey = `categories_${industry || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Fetch all procedures
      let query = supabase
        .from('procedures')
        .select('*')
        .order('market_size_2025_usd_millions', { ascending: false });

      if (industry) {
        query = query.or(`industry.eq.${industry},industry.eq.both`);
      }

      const { data: procedures, error } = await query;

      if (error) throw error;

      // Group by category
      const categoryMap = new Map<string, GalaxyProcedure[]>();
      
      procedures?.forEach(proc => {
        const category = proc.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(proc);
      });

      // Create aggregates
      const aggregates: CategoryAggregate[] = Array.from(categoryMap.entries()).map(([category, procs]) => {
        const totalMarketSize = procs.reduce((sum, p) => sum + (p.market_size_2025_usd_millions || 0), 0);
        const avgGrowthRate = procs.reduce((sum, p) => sum + (p.yoy_growth_2024_to_2025_percent || 0), 0) / procs.length;
        const avgInnovation = procs.reduce((sum, p) => sum + (p.innovation_index || 50), 0) / procs.length;
        
        // Determine trending direction
        const trendingAvg = procs.reduce((sum, p) => sum + (p.trending_score_1_to_100 || 50), 0) / procs.length;
        const trendingDirection = trendingAvg > 70 ? 'up' : trendingAvg < 30 ? 'down' : 'stable';

        return {
          id: category.toLowerCase().replace(/\s+/g, '_'),
          name: category,
          industry: procs[0].industry,
          total_market_size: totalMarketSize,
          avg_growth_rate: avgGrowthRate,
          procedure_count: procs.length,
          innovation_score: avgInnovation,
          trending_direction: trendingDirection,
          top_procedures: procs.slice(0, 5), // Top 5 by market size
          market_signals: [], // Will be populated by Brave Search
          sales_opportunities: this.generateSalesOpportunities(category, procs)
        };
      });

      // Sort by total market size
      aggregates.sort((a, b) => b.total_market_size - a.total_market_size);

      this.setCache(cacheKey, aggregates);
      return aggregates;

    } catch (error) {
      logger.error('Error fetching category aggregates', { error: error.message });
      // Return demo data as fallback
      return this.getDemoCategories();
    }
  }

  async enrichWithMarketIntelligence(categories: CategoryAggregate[]): Promise<CategoryAggregate[]> {
    // Enrich each category with real-time market signals
    const enrichedCategories = await Promise.all(
      categories.map(async (category) => {
        try {
          // Search for recent market news
          const searchQuery = `${category.name} dental aesthetic market trends 2025`;
          const searchResults = await braveSearchService.searchNews(searchQuery, {
            count: 5,
            freshness: 'pw' // Past week
          });

          // Convert search results to market signals
          const marketSignals: MarketSignal[] = searchResults.map((result: SearchResult) => ({
            id: `signal_${Date.now()}_${Math.random()}`,
            type: this.categorizeSignal(result.title + ' ' + result.description),
            title: result.title,
            description: result.description,
            source: result.source || 'Brave Search',
            url: result.url,
            relevance_score: result.relevance_score || 0.5,
            urgency: this.calculateUrgency(result),
            detected_at: new Date(),
            affected_procedures: category.top_procedures.map(p => p.procedure_name),
            sales_action: this.generateSalesAction(result, category)
          }));

          return {
            ...category,
            market_signals: marketSignals
          };
        } catch (error) {
          logger.error('Error enriching category', { categoryName: category.name, error: error.message });
          return category;
        }
      })
    );

    return enrichedCategories;
  }

  private generateSalesOpportunities(category: string, procedures: GalaxyProcedure[]): SalesOpportunity[] {
    const opportunities: SalesOpportunity[] = [];

    // High growth opportunity
    const highGrowthProcs = procedures.filter(p => p.yoy_growth_2024_to_2025_percent > 15);
    if (highGrowthProcs.length > 0) {
      opportunities.push({
        id: `opp_growth_${category}`,
        type: 'NEW_ACCOUNT',
        title: `High Growth in ${category}`,
        description: `${highGrowthProcs.length} procedures growing >15% YoY. Target practices not yet offering these services.`,
        potential_revenue: highGrowthProcs.reduce((sum, p) => sum + (p.average_cost_usd * 100), 0), // Assume 100 procedures
        probability: 0.65,
        recommended_actions: [
          'Identify practices without these capabilities',
          'Prepare ROI calculator showing growth potential',
          'Schedule educational webinars'
        ],
        urgency_score: 85
      });
    }

    // Cross-sell opportunity
    if (procedures.length > 3) {
      opportunities.push({
        id: `opp_bundle_${category}`,
        type: 'CROSS_SELL',
        title: `Bundle Opportunity in ${category}`,
        description: `Practices typically adopt ${Math.floor(procedures.length * 0.6)} of ${procedures.length} available procedures.`,
        potential_revenue: procedures.slice(0, 3).reduce((sum, p) => sum + (p.average_cost_usd * 50), 0),
        probability: 0.75,
        recommended_actions: [
          'Analyze current customer procedure mix',
          'Create bundle pricing proposals',
          'Highlight operational synergies'
        ],
        urgency_score: 70
      });
    }

    return opportunities;
  }

  private categorizeSignal(text: string): MarketSignal['type'] {
    const lower = text.toLowerCase();
    if (lower.includes('fda') || lower.includes('approval')) return 'FDA_APPROVAL';
    if (lower.includes('competitor') || lower.includes('acquisition')) return 'COMPETITOR_MOVE';
    if (lower.includes('price') || lower.includes('cost')) return 'PRICE_CHANGE';
    if (lower.includes('technology') || lower.includes('innovation')) return 'NEW_TECHNOLOGY';
    return 'MARKET_TREND';
  }

  private calculateUrgency(result: SearchResult): 'HIGH' | 'MEDIUM' | 'LOW' {
    const keywords = ['immediate', 'urgent', 'now', 'breaking', 'alert'];
    const text = (result.title + ' ' + result.description).toLowerCase();
    const hasUrgentKeyword = keywords.some(kw => text.includes(kw));
    
    if (hasUrgentKeyword || result.relevance_score > 0.8) return 'HIGH';
    if (result.relevance_score > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  private generateSalesAction(result: SearchResult, category: CategoryAggregate): string {
    const signal = this.categorizeSignal(result.title);
    
    switch (signal) {
      case 'FDA_APPROVAL':
        return `Contact all ${category.name} accounts about new approved technology. Prepare first-mover advantage pitch.`;
      case 'COMPETITOR_MOVE':
        return `Review competitive positioning. Update battle cards. Schedule retention calls with at-risk accounts.`;
      case 'PRICE_CHANGE':
        return `Update pricing strategy. Communicate value proposition. Consider promotional bundles.`;
      case 'NEW_TECHNOLOGY':
        return `Schedule innovation workshops. Identify early adopter accounts. Prepare technology ROI models.`;
      default:
        return `Monitor market development. Update account strategies. Share insights with customers.`;
    }
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now(), key, ttl: this.CACHE_DURATION });
  }

  private getDemoCategories(): CategoryAggregate[] {
    // Fallback demo data matching real structure
    return [
      {
        id: 'dental_implants',
        name: 'Dental Implants',
        industry: 'dental',
        total_market_size: 4500,
        avg_growth_rate: 12.5,
        procedure_count: 15,
        innovation_score: 85,
        trending_direction: 'up',
        top_procedures: [],
        market_signals: [],
        sales_opportunities: []
      },
      // ... more demo categories
    ];
  }
}

export const galaxyDataService = new GalaxyDataService();