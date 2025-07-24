import { supabase } from './supabaseClient';
import { logger } from './logging/logger';
import { getErrorMessage } from '../utils/errorUtils';

export interface ProviderLocation {
  id: string;
  provider_name: string;
  practice_name?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  email?: string;
  industry: 'dental' | 'aesthetic' | 'both';
  specialties?: string[];
  procedures_offered?: string[];
  insurance_accepted?: string[];
  rating?: number;
  review_count?: number;
  years_in_practice?: number;
  provider_type?: 'solo' | 'group' | 'hospital' | 'clinic' | 'spa';
  ownership_type?: 'independent' | 'dso' | 'franchise' | 'hospital_owned';
  annual_revenue_estimate?: number;
  patient_volume_monthly?: number;
  tech_adoption_score?: number;
  equipment_brands?: string[];
  software_systems?: string[];
  marketing_channels?: string[];
  social_media?: any;
  competitor_density?: number;
  market_share_estimate?: number;
  growth_potential_score?: number;
  last_equipment_purchase?: string;
  decision_makers?: any;
  notes?: string;
  data_source?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MarketTerritory {
  id: string;
  name: string;
  city: string;
  state: string;
  population?: number;
  median_income?: number;
  provider_count?: number;
  provider_density?: number;
  market_size_dental?: number;
  market_size_aesthetic?: number;
  growth_rate_annual?: number;
  competition_level?: 'low' | 'medium' | 'high' | 'saturated';
  opportunity_score?: number;
  demographics?: any;
  key_employers?: string[];
  insurance_penetration?: number;
  aesthetic_spending_index?: number;
}

export interface ProviderEquipment {
  id: string;
  provider_location_id: string;
  equipment_category: string;
  brand?: string;
  model?: string;
  purchase_date?: string;
  purchase_price?: number;
  financing_type?: 'cash' | 'lease' | 'loan' | 'unknown';
  replacement_due?: string;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  usage_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  maintenance_contract?: boolean;
}

export interface ProviderMarketInsight {
  provider: ProviderLocation;
  territory_market_size?: number;
  territory_growth_rate?: number;
  competition_level?: string;
  territory_opportunity_score?: number;
  equipment_count?: number;
  avg_equipment_value?: number;
}

class ProviderDataService {
  private static instance: ProviderDataService;
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): ProviderDataService {
    if (!ProviderDataService.instance) {
      ProviderDataService.instance = new ProviderDataService();
    }
    return ProviderDataService.instance;
  }

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  async getProvidersByTerritory(city: string, state: string): Promise<ProviderLocation[]> {
    const cacheKey = `providers_${city}_${state}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase
        .from('provider_locations')
        .select('*')
        .eq('city', city)
        .eq('state', state)
        .order('rating', { ascending: false });

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      logger.error('Error fetching providers by territory', { error: getErrorMessage(error) });
      return [];
    }
  }

  async getProviderById(id: string): Promise<ProviderLocation | null> {
    try {
      const { data, error } = await supabase
        .from('provider_locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching provider by ID', { error: getErrorMessage(error) });
      return null;
    }
  }

  async getProviderEquipment(providerId: string): Promise<ProviderEquipment[]> {
    try {
      const { data, error } = await supabase
        .from('provider_equipment')
        .select('*')
        .eq('provider_location_id', providerId)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching provider equipment', { error: getErrorMessage(error) });
      return [];
    }
  }

  async searchProviders(params: {
    query?: string;
    city?: string;
    state?: string;
    industry?: string;
    specialties?: string[];
    minRevenue?: number;
    minGrowthScore?: number;
    providerType?: string;
    limit?: number;
  }): Promise<ProviderLocation[]> {
    try {
      let query = supabase.from('provider_locations').select('*');

      if (params.query) {
        query = query.or(`provider_name.ilike.%${params.query}%,practice_name.ilike.%${params.query}%`);
      }

      if (params.city) {
        query = query.eq('city', params.city);
      }

      if (params.state) {
        query = query.eq('state', params.state);
      }

      if (params.industry) {
        query = query.eq('industry', params.industry);
      }

      if (params.specialties && params.specialties.length > 0) {
        query = query.contains('specialties', params.specialties);
      }

      if (params.minRevenue) {
        query = query.gte('annual_revenue_estimate', params.minRevenue);
      }

      if (params.minGrowthScore) {
        query = query.gte('growth_potential_score', params.minGrowthScore);
      }

      if (params.providerType) {
        query = query.eq('provider_type', params.providerType);
      }

      query = query.order('growth_potential_score', { ascending: false });

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching providers', { error: getErrorMessage(error) });
      return [];
    }
  }

  async getMarketTerritories(state?: string): Promise<MarketTerritory[]> {
    const cacheKey = `territories_${state || 'all'}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let query = supabase
        .from('market_territories')
        .select('*')
        .order('opportunity_score', { ascending: false });

      if (state) {
        query = query.eq('state', state);
      }

      const { data, error } = await query;

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      logger.error('Error fetching market territories', { error: getErrorMessage(error) });
      return [];
    }
  }

  async getTerritoryByName(name: string): Promise<MarketTerritory | null> {
    try {
      const { data, error } = await supabase
        .from('market_territories')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching territory by name', { error: getErrorMessage(error) });
      return null;
    }
  }

  async getProviderMarketInsights(params: {
    city?: string;
    state?: string;
    minOpportunityScore?: number;
    limit?: number;
  }): Promise<ProviderMarketInsight[]> {
    try {
      let query = supabase.from('provider_market_insights').select('*');

      if (params.city) {
        query = query.eq('city', params.city);
      }

      if (params.state) {
        query = query.eq('state', params.state);
      }

      if (params.minOpportunityScore) {
        query = query.gte('territory_opportunity_score', params.minOpportunityScore);
      }

      query = query.order('growth_potential_score', { ascending: false });

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the flat view data into the expected structure
      return (data || []).map(row => ({
        provider: {
          id: row.id,
          provider_name: row.provider_name,
          practice_name: row.practice_name,
          address: row.address,
          city: row.city,
          state: row.state,
          zip_code: row.zip_code,
          lat: row.lat,
          lng: row.lng,
          phone: row.phone,
          website: row.website,
          email: row.email,
          industry: row.industry,
          specialties: row.specialties,
          procedures_offered: row.procedures_offered,
          rating: row.rating,
          review_count: row.review_count,
          years_in_practice: row.years_in_practice,
          provider_type: row.provider_type,
          ownership_type: row.ownership_type,
          annual_revenue_estimate: row.annual_revenue_estimate,
          patient_volume_monthly: row.patient_volume_monthly,
          tech_adoption_score: row.tech_adoption_score,
          growth_potential_score: row.growth_potential_score,
        },
        territory_market_size: row.territory_market_size,
        territory_growth_rate: row.territory_growth_rate,
        competition_level: row.competition_level,
        territory_opportunity_score: row.territory_opportunity_score,
        equipment_count: row.equipment_count,
        avg_equipment_value: row.avg_equipment_value,
      }));
    } catch (error) {
      logger.error('Error fetching provider market insights', { error: getErrorMessage(error) });
      return [];
    }
  }

  async getTopOpportunities(limit: number = 10): Promise<{
    providers: ProviderLocation[];
    territories: MarketTerritory[];
  }> {
    try {
      const [providersResult, territoriesResult] = await Promise.all([
        supabase
          .from('provider_locations')
          .select('*')
          .gte('growth_potential_score', 80)
          .order('growth_potential_score', { ascending: false })
          .limit(limit),
        supabase
          .from('market_territories')
          .select('*')
          .gte('opportunity_score', 80)
          .order('opportunity_score', { ascending: false })
          .limit(limit),
      ]);

      return {
        providers: providersResult.data || [],
        territories: territoriesResult.data || [],
      };
    } catch (error) {
      logger.error('Error fetching top opportunities', { error: getErrorMessage(error) });
      return { providers: [], territories: [] };
    }
  }

  async getEquipmentReplacementOpportunities(daysAhead: number = 180): Promise<{
    provider: ProviderLocation;
    equipment: ProviderEquipment;
  }[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      const { data: equipment, error: equipError } = await supabase
        .from('provider_equipment')
        .select('*')
        .lte('replacement_due', futureDate.toISOString())
        .order('replacement_due', { ascending: true });

      if (equipError) throw equipError;

      const opportunities = [];
      
      for (const equip of equipment || []) {
        const { data: provider } = await supabase
          .from('provider_locations')
          .select('*')
          .eq('id', equip.provider_location_id)
          .single();
          
        if (provider) {
          opportunities.push({ provider, equipment: equip });
        }
      }

      return opportunities;
    } catch (error) {
      logger.error('Error fetching equipment replacement opportunities', { error: getErrorMessage(error) });
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

export const providerDataService = ProviderDataService.getInstance();