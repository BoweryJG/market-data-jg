import { supabase } from './supabaseClient';

export interface TerritoryMetrics {
  territoryId: string;
  name: string;
  state: string;
  providerCount: number;
  influenceScore: number;
  marketSize: number;
  growthRate: number;
  opportunityScore: number;
  competitiveDensity: number;
  avgRevenue: number;
  topInfluencers: InfluenceLeader[];
  geographicData: GeographicPoint[];
}

export interface InfluenceLeader {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  specialty: string;
  city: string;
  state: string;
  kolScore: number;
  instagramFollowers: number;
  instagramEngagementRate: number;
  linkedinConnections: number;
  youtubeSubscribers: number;
  realselfRating: number;
  realselfReviewCount: number;
  googleRating: number;
  googleReviewCount: number;
  verified: boolean;
  nationalInfluenceScore: number;
  localInfluenceScore: number;
  publishedArticles: number;
  speakingEngagements: number;
  trainingCoursesOffered: boolean;
}

export interface GeographicPoint {
  lat: number;
  lng: number;
  providerCount: number;
  influenceScore: number;
  city: string;
  zipCode: string;
}

export interface TerritoryAnalytics {
  totalProviders: number;
  averageInfluenceScore: number;
  topSpecialties: Array<{ specialty: string; count: number; avgInfluence: number }>;
  marketConcentration: Array<{ city: string; providerCount: number; marketShare: number }>;
  growthTrends: Array<{ month: string; newProviders: number; influenceGrowth: number }>;
  competitiveGaps: Array<{ area: string; gapScore: number; opportunity: string }>;
}

class TerritoryIntelligenceService {
  /**
   * Get territory metrics aggregated by state or region
   */
  async getTerritoryMetrics(territoryType: 'state' | 'city' | 'zip', value: string): Promise<TerritoryMetrics | null> {
    try {
      const whereClause = territoryType === 'state' ? { state: value.toUpperCase() } 
                        : territoryType === 'city' ? { city: value }
                        : { zip_code: value };

      // Get provider count and basic metrics
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select(`
          id, name, first_name, last_name, organization_name,
          specialty, city, state, zip_code, lat, lng,
          verified, created_at
        `)
        .match(whereClause)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (providerError) throw providerError;

      // Get social influence data for providers in this territory
      const providerIds = providerData?.map(p => p.id) || [];
      
      const { data: influenceData, error: influenceError } = await supabase
        .from('provider_social_influence')
        .select(`
          provider_id,
          instagram_followers, instagram_engagement_rate,
          linkedin_connections, linkedin_posts_count,
          youtube_subscribers, youtube_video_count,
          realself_worth_it_rating, realself_review_count,
          google_rating, google_review_count,
          kol_score, local_influence_score, national_influence_score,
          published_articles_count, speaking_engagements_count,
          training_courses_offered
        `)
        .in('provider_id', providerIds.length > 0 ? providerIds.slice(0, 1000) : ['dummy']); // Limit for performance

      if (influenceError) throw influenceError;

      // Create a map of provider influence data
      const influenceMap = new Map();
      influenceData?.forEach(inf => {
        influenceMap.set(inf.provider_id, inf);
      });

      // Calculate territory metrics
      const territory = this.calculateTerritoryMetrics(
        providerData || [],
        influenceMap,
        territoryType,
        value
      );

      return territory;
    } catch (error) {
      console.error('Error fetching territory metrics:', error);
      return null;
    }
  }

  /**
   * Get top influence leaders for a territory
   */
  async getTopInfluenceLeaders(
    territoryType: 'state' | 'city',
    value: string,
    limit: number = 10
  ): Promise<InfluenceLeader[]> {
    try {
      const { data, error } = await supabase
        .from('provider_market_insights')
        .select(`
          id, provider_name, practice_name, city, state, specialties,
          lat, lng, rating, review_count, years_in_practice,
          annual_revenue_estimate, patient_volume_monthly,
          tech_adoption_score, growth_potential_score
        `)
        .eq(territoryType, territoryType === 'state' ? value.toUpperCase() : value)
        .order('growth_potential_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get corresponding social influence data
      const providerIds = data?.map(p => p.id) || [];
      
      const { data: socialData, error: socialError } = await supabase
        .from('provider_social_influence')
        .select('*')
        .in('provider_id', providerIds.length > 0 ? providerIds.slice(0, 100) : ['dummy']);

      if (socialError) throw socialError;

      // Merge the data
      const leaders: InfluenceLeader[] = (data || []).map(provider => {
        const social = socialData?.find(s => s.provider_id === provider.id);
        
        return {
          id: provider.id,
          name: provider.provider_name || provider.practice_name,
          specialty: Array.isArray(provider.specialties) 
            ? provider.specialties[0] 
            : provider.specialties || 'General Practice',
          city: provider.city,
          state: provider.state,
          kolScore: social?.kol_score || 0,
          instagramFollowers: social?.instagram_followers || 0,
          instagramEngagementRate: social?.instagram_engagement_rate || 0,
          linkedinConnections: social?.linkedin_connections || 0,
          youtubeSubscribers: social?.youtube_subscribers || 0,
          realselfRating: social?.realself_worth_it_rating || provider.rating || 0,
          realselfReviewCount: social?.realself_review_count || provider.review_count || 0,
          googleRating: social?.google_rating || provider.rating || 0,
          googleReviewCount: social?.google_review_count || provider.review_count || 0,
          verified: social?.realself_top_doctor || false,
          nationalInfluenceScore: social?.national_influence_score || 0,
          localInfluenceScore: social?.local_influence_score || 0,
          publishedArticles: social?.published_articles_count || 0,
          speakingEngagements: social?.speaking_engagements_count || 0,
          trainingCoursesOffered: social?.training_courses_offered || false,
        };
      });

      return leaders.sort((a, b) => b.kolScore - a.kolScore);
    } catch (error) {
      console.error('Error fetching influence leaders:', error);
      return [];
    }
  }

  /**
   * Get detailed territory analytics
   */
  async getTerritoryAnalytics(state: string): Promise<TerritoryAnalytics | null> {
    try {
      // Get comprehensive analytics using the market insights view
      const { data, error } = await supabase
        .from('provider_market_insights')
        .select(`
          specialties, city, annual_revenue_estimate,
          patient_volume_monthly, tech_adoption_score,
          growth_potential_score, competitor_density,
          market_share_estimate, created_at
        `)
        .eq('state', state.toUpperCase());

      if (error) throw error;

      const analytics = this.calculateAnalytics(data || []);
      return analytics;
    } catch (error) {
      console.error('Error fetching territory analytics:', error);
      return null;
    }
  }

  /**
   * Get geographic heatmap data for visualization
   */
  async getGeographicHeatmap(state: string, granularity: 'city' | 'zip'): Promise<GeographicPoint[]> {
    try {
      const selectFields = granularity === 'city'
        ? 'city, lat, lng, verified, zip_code'
        : 'zip_code, lat, lng, verified, city';
      
      const { data, error } = await supabase
        .from('providers')
        .select(selectFields)
        .eq('state', state.toUpperCase())
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;

      // Group by location and calculate metrics
      const locationMap = new Map<string, GeographicPoint>();
      
      data?.forEach((provider: any) => {
        const location = granularity === 'city' ? provider.city : provider.zip_code;
        if (!location) return;

        if (!locationMap.has(location)) {
          locationMap.set(location, {
            lat: provider.lat,
            lng: provider.lng,
            providerCount: 0,
            influenceScore: 0,
            city: granularity === 'city' ? location : provider.city || '',
            zipCode: granularity === 'zip' ? location : provider.zip_code || '',
          });
        }

        const point = locationMap.get(location)!;
        point.providerCount++;
        point.influenceScore += provider.verified ? 10 : 5; // Simple scoring
      });

      return Array.from(locationMap.values());
    } catch (error) {
      console.error('Error fetching geographic heatmap:', error);
      return [];
    }
  }

  /**
   * Calculate territory metrics from provider and influence data
   */
  private calculateTerritoryMetrics(
    providers: any[],
    influenceMap: Map<string, any>,
    territoryType: string,
    value: string
  ): TerritoryMetrics {
    const providerCount = providers.length;
    
    // Calculate influence scores
    let totalInfluenceScore = 0;
    let totalRevenue = 0;
    const topInfluencers: InfluenceLeader[] = [];

    providers.forEach(provider => {
      const influence = influenceMap.get(provider.id);
      const kolScore = influence?.kol_score || 0;
      totalInfluenceScore += kolScore;

      if (kolScore > 50) { // Only include significant influencers
        topInfluencers.push({
          id: provider.id,
          name: provider.organization_name || `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || provider.name,
          specialty: provider.specialty || 'General Practice',
          city: provider.city,
          state: provider.state,
          kolScore,
          instagramFollowers: influence?.instagram_followers || 0,
          instagramEngagementRate: influence?.instagram_engagement_rate || 0,
          linkedinConnections: influence?.linkedin_connections || 0,
          youtubeSubscribers: influence?.youtube_subscribers || 0,
          realselfRating: influence?.realself_worth_it_rating || 0,
          realselfReviewCount: influence?.realself_review_count || 0,
          googleRating: influence?.google_rating || 0,
          googleReviewCount: influence?.google_review_count || 0,
          verified: influence?.realself_top_doctor || false,
          nationalInfluenceScore: influence?.national_influence_score || 0,
          localInfluenceScore: influence?.local_influence_score || 0,
          publishedArticles: influence?.published_articles_count || 0,
          speakingEngagements: influence?.speaking_engagements_count || 0,
          trainingCoursesOffered: influence?.training_courses_offered || false,
        });
      }
    });

    // Sort by KOL score and take top 5
    topInfluencers.sort((a, b) => b.kolScore - a.kolScore);
    const top5Influencers = topInfluencers.slice(0, 5);

    // Calculate metrics
    const averageInfluenceScore = providerCount > 0 ? totalInfluenceScore / providerCount : 0;
    const estimatedMarketSize = providerCount * 485000; // Average revenue per provider
    const growthRate = this.calculateGrowthRate(providers);
    const opportunityScore = this.calculateOpportunityScore(providerCount, averageInfluenceScore, growthRate);
    const competitiveDensity = Math.min(100, (providerCount / 50) * 100); // Normalize based on 50 providers per area

    return {
      territoryId: `${territoryType}-${value.toLowerCase()}`,
      name: this.formatTerritoryName(territoryType, value),
      state: territoryType === 'state' ? value.toUpperCase() : providers[0]?.state || '',
      providerCount,
      influenceScore: Math.round(averageInfluenceScore),
      marketSize: estimatedMarketSize,
      growthRate: Math.round(growthRate * 10) / 10,
      opportunityScore: Math.round(opportunityScore),
      competitiveDensity: Math.round(competitiveDensity),
      avgRevenue: 485000, // Base average
      topInfluencers: top5Influencers,
      geographicData: this.createGeographicPoints(providers),
    };
  }

  private calculateGrowthRate(providers: any[]): number {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    
    const recentProviders = providers.filter(p => 
      p.created_at && new Date(p.created_at) > sixMonthsAgo
    );
    
    if (providers.length === 0) return 0;
    return (recentProviders.length / providers.length) * 100;
  }

  private calculateOpportunityScore(providerCount: number, avgInfluence: number, growthRate: number): number {
    // Opportunity score based on market gaps and growth potential
    const densityScore = Math.max(0, 100 - (providerCount / 10)); // Lower density = higher opportunity
    const influenceScore = Math.min(100, avgInfluence * 2);
    const growthScore = Math.min(100, growthRate * 5);
    
    return (densityScore * 0.4 + influenceScore * 0.3 + growthScore * 0.3);
  }

  private createGeographicPoints(providers: any[]): GeographicPoint[] {
    const cityMap = new Map<string, GeographicPoint>();
    
    providers.forEach(provider => {
      if (!provider.lat || !provider.lng || !provider.city) return;
      
      const key = `${provider.city}-${provider.state}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          lat: provider.lat,
          lng: provider.lng,
          providerCount: 0,
          influenceScore: 0,
          city: provider.city,
          zipCode: provider.zip_code || '',
        });
      }
      
      const point = cityMap.get(key)!;
      point.providerCount++;
      point.influenceScore += provider.verified ? 10 : 5;
    });
    
    return Array.from(cityMap.values());
  }

  private calculateAnalytics(data: any[]): TerritoryAnalytics {
    const totalProviders = data.length;
    const averageInfluenceScore = data.reduce((sum, p) => sum + (p.growth_potential_score || 0), 0) / totalProviders;
    
    // Top specialties
    const specialtyMap = new Map<string, { count: number; totalInfluence: number }>();
    data.forEach(provider => {
      const specialties = Array.isArray(provider.specialties) ? provider.specialties : [provider.specialties || 'General'];
      specialties.forEach((specialty: string) => {
        if (!specialtyMap.has(specialty)) {
          specialtyMap.set(specialty, { count: 0, totalInfluence: 0 });
        }
        const spec = specialtyMap.get(specialty)!;
        spec.count++;
        spec.totalInfluence += provider.growth_potential_score || 0;
      });
    });
    
    const topSpecialties = Array.from(specialtyMap.entries())
      .map(([specialty, data]) => ({
        specialty,
        count: data.count,
        avgInfluence: data.totalInfluence / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Market concentration by city
    const cityMap = new Map<string, number>();
    data.forEach(provider => {
      const city = provider.city || 'Unknown';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    
    const marketConcentration = Array.from(cityMap.entries())
      .map(([city, count]) => ({
        city,
        providerCount: count,
        marketShare: (count / totalProviders) * 100,
      }))
      .sort((a, b) => b.providerCount - a.providerCount)
      .slice(0, 10);

    return {
      totalProviders,
      averageInfluenceScore,
      topSpecialties,
      marketConcentration,
      growthTrends: [], // TODO: Implement time-series analysis
      competitiveGaps: [], // TODO: Implement gap analysis
    };
  }

  private formatTerritoryName(type: string, value: string): string {
    if (type === 'state') {
      const stateNames: { [key: string]: string } = {
        'FL': 'Florida',
        'CA': 'California',
        'TX': 'Texas',
        'NY': 'New York',
        // Add more as needed
      };
      return stateNames[value.toUpperCase()] || value;
    }
    return value;
  }
}

export const territoryIntelligenceService = new TerritoryIntelligenceService();