import { supabase } from './supabaseClient';

export interface TableInfo {
  tablename: string;
  rowCount: number;
  columns: string[];
  sampleData: any[];
  hasMarketData: boolean;
  hasGeoData: boolean;
  dataType: 'procedures' | 'companies' | 'categories' | 'analytics' | 'geography' | 'other';
}

export interface ComprehensiveMarketData {
  procedures: any[];
  companies: any[];
  categories: any[];
  territories: any[];
  analytics: any[];
  marketMetrics: {
    totalMarketSize: number;
    totalProcedures: number;
    totalCompanies: number;
    averageGrowth: number;
    territoryCount: number;
  };
}

class ComprehensiveDataService {
  private static instance: ComprehensiveDataService;
  private tableCache: Map<string, TableInfo> = new Map();
  private dataCache: ComprehensiveMarketData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ComprehensiveDataService {
    if (!ComprehensiveDataService.instance) {
      ComprehensiveDataService.instance = new ComprehensiveDataService();
    }
    return ComprehensiveDataService.instance;
  }

  async discoverAllTables(): Promise<TableInfo[]> {
    console.log('🔍 Discovering all Supabase tables...');
    
    try {
      // Try to get all tables using RPC function first
      let tables: any[] | null = null;
      let error: any = null;

      try {
        const rpcResult = await supabase.rpc('list_tables');
        tables = rpcResult.data;
        error = rpcResult.error;
      } catch (rpcError) {
        console.warn('RPC function not available, trying alternative approach...');
        error = rpcError;
      }

      if (error) {
        console.warn('Failed to get tables from RPC, trying direct query...');
        
        // Alternative approach: Query known table patterns
        const knownTablePatterns = [
          'procedures', 'dental_procedures', 'aesthetic_procedures',
          'companies', 'dental_companies', 'aesthetic_companies',
          'categories', 'dental_procedure_categories', 'aesthetic_categories',
          'providers', 'articles', 'trends', 'search_analytics',
          'v_dashboard_*', 'standardized_*'
        ];

        const discoveredTables: TableInfo[] = [];
        
        for (const pattern of knownTablePatterns) {
          try {
            const tableName = pattern.replace('*', '');
            const { data, error: queryError, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .limit(3);

            if (!queryError && data) {
              const columns = data.length > 0 ? Object.keys(data[0]) : [];
              const hasMarketData = columns.some(col => 
                col.includes('market_size') || col.includes('revenue') || col.includes('cost')
              );
              const hasGeoData = columns.some(col => 
                col.includes('region') || col.includes('territory') || col.includes('location')
              );

              discoveredTables.push({
                tablename: tableName,
                rowCount: count || 0,
                columns,
                sampleData: data,
                hasMarketData,
                hasGeoData,
                dataType: this.categorizeTable(tableName, columns),
              });
            }
          } catch (e) {
            // Table doesn't exist, continue
          }
        }

        return discoveredTables;
      }

      // Process the discovered tables
      const tableInfos: TableInfo[] = [];
      
      for (const table of tables || []) {
        const tableName = table.table_name || table.tablename;
        
        try {
          // Get row count and sample data
          const { data, error: queryError, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(5);

          if (!queryError && data) {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            const hasMarketData = columns.some(col => 
              col.includes('market_size') || col.includes('revenue') || col.includes('cost') || col.includes('price')
            );
            const hasGeoData = columns.some(col => 
              col.includes('region') || col.includes('territory') || col.includes('location') || col.includes('geo')
            );

            const tableInfo: TableInfo = {
              tablename: tableName,
              rowCount: count || 0,
              columns,
              sampleData: data,
              hasMarketData,
              hasGeoData,
              dataType: this.categorizeTable(tableName, columns),
            };

            tableInfos.push(tableInfo);
            this.tableCache.set(tableName, tableInfo);
          }
        } catch (error) {
          console.warn(`Failed to analyze table ${tableName}:`, error);
        }
      }

      console.log(`✅ Discovered ${tableInfos.length} tables with comprehensive data`);
      return tableInfos;
      
    } catch (error) {
      console.error('Error discovering tables:', error);
      return [];
    }
  }

  private categorizeTable(tableName: string, columns: string[]): TableInfo['dataType'] {
    const name = tableName.toLowerCase();
    
    if (name.includes('procedure')) return 'procedures';
    if (name.includes('company') || name.includes('provider')) return 'companies';
    if (name.includes('categor')) return 'categories';
    if (name.includes('analytic') || name.includes('search') || name.includes('trend')) return 'analytics';
    if (name.includes('region') || name.includes('territory') || name.includes('location') || name.includes('geo')) return 'geography';
    
    return 'other';
  }

  async getComprehensiveMarketData(): Promise<ComprehensiveMarketData> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.dataCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.dataCache;
    }

    console.log('🚀 Fetching comprehensive market data...');

    try {
      // Fetch all core data in parallel
      const [
        proceduresResponse,
        dentalProceduresResponse,
        aestheticProceduresResponse,
        dentalCompaniesResponse,
        aestheticCompaniesResponse,
        dentalCategoriesResponse,
        aestheticCategoriesResponse,
        providersResponse,
        trendsResponse,
        analyticsResponse,
      ] = await Promise.allSettled([
        supabase.from('procedures').select('*').order('market_size_2025_usd_millions', { ascending: false }),
        supabase.from('dental_procedures').select('*'),
        supabase.from('aesthetic_procedures').select('*'),
        supabase.from('dental_companies').select('*'),
        supabase.from('aesthetic_companies').select('*'),
        supabase.from('dental_procedure_categories').select('*'),
        supabase.from('aesthetic_categories').select('*'),
        supabase.from('providers').select('*').limit(100),
        supabase.from('trends').select('*').limit(50),
        supabase.from('search_analytics').select('*').limit(100),
      ]);

      // Combine all procedures
      const allProcedures = [
        ...(proceduresResponse.status === 'fulfilled' ? proceduresResponse.value.data || [] : []),
        ...(dentalProceduresResponse.status === 'fulfilled' ? dentalProceduresResponse.value.data || [] : []),
        ...(aestheticProceduresResponse.status === 'fulfilled' ? aestheticProceduresResponse.value.data || [] : []),
      ];

      // Combine all companies
      const allCompanies = [
        ...(dentalCompaniesResponse.status === 'fulfilled' ? 
          (dentalCompaniesResponse.value.data || []).map((c: any) => ({ ...c, industry: 'dental' })) : []),
        ...(aestheticCompaniesResponse.status === 'fulfilled' ? 
          (aestheticCompaniesResponse.value.data || []).map((c: any) => ({ ...c, industry: 'aesthetic' })) : []),
      ];

      // Combine all categories
      const allCategories = [
        ...(dentalCategoriesResponse.status === 'fulfilled' ? dentalCategoriesResponse.value.data || [] : []),
        ...(aestheticCategoriesResponse.status === 'fulfilled' ? aestheticCategoriesResponse.value.data || [] : []),
      ];

      // Extract territory data from procedures regional_popularity
      const territories = this.extractTerritoryData(allProcedures);

      // Get analytics data
      const analytics = [
        ...(trendsResponse.status === 'fulfilled' ? trendsResponse.value.data || [] : []),
        ...(analyticsResponse.status === 'fulfilled' ? analyticsResponse.value.data || [] : []),
      ];

      // Calculate market metrics
      const totalMarketSize = allProcedures.reduce((sum, p) => 
        sum + (p.market_size_2025_usd_millions || p.market_size_usd_millions || 0), 0
      );
      
      const avgGrowth = allProcedures.length > 0 
        ? allProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || p.growth_rate || 0), 0) / allProcedures.length
        : 0;

      const comprehensiveData: ComprehensiveMarketData = {
        procedures: allProcedures,
        companies: allCompanies,
        categories: allCategories,
        territories,
        analytics,
        marketMetrics: {
          totalMarketSize,
          totalProcedures: allProcedures.length,
          totalCompanies: allCompanies.length,
          averageGrowth: avgGrowth,
          territoryCount: territories.length,
        },
      };

      this.dataCache = comprehensiveData;
      this.lastFetch = now;

      console.log('✅ Comprehensive market data loaded:', {
        procedures: allProcedures.length,
        companies: allCompanies.length,
        categories: allCategories.length,
        territories: territories.length,
        totalMarketSize: totalMarketSize.toFixed(2) + 'M',
      });

      return comprehensiveData;

    } catch (error) {
      console.error('Error fetching comprehensive market data:', error);
      throw error;
    }
  }

  private extractTerritoryData(procedures: any[]): any[] {
    const territoryMap = new Map();

    procedures.forEach(procedure => {
      if (procedure.regional_popularity) {
        try {
          const regional = typeof procedure.regional_popularity === 'string' 
            ? JSON.parse(procedure.regional_popularity)
            : procedure.regional_popularity;

          Object.entries(regional).forEach(([territory, data]: [string, any]) => {
            if (!territoryMap.has(territory)) {
              territoryMap.set(territory, {
                name: territory,
                procedures: [],
                totalMarketSize: 0,
                averageGrowth: 0,
                companies: new Set(),
                saturation: 0,
              });
            }

            const territoryData = territoryMap.get(territory);
            territoryData.procedures.push(procedure.procedure_name || procedure.name);
            territoryData.totalMarketSize += procedure.market_size_2025_usd_millions || 0;
            
            if (data.popularity) {
              territoryData.saturation = Math.max(territoryData.saturation, data.popularity);
            }
          });
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    });

    return Array.from(territoryMap.values()).map(territory => ({
      ...territory,
      procedures: territory.procedures.length,
      companies: territory.companies.size,
    }));
  }

  async searchProcedures(query: string, filters: any = {}): Promise<any[]> {
    const data = await this.getComprehensiveMarketData();
    
    return data.procedures.filter(procedure => {
      const matchesQuery = !query || 
        procedure.procedure_name?.toLowerCase().includes(query.toLowerCase()) ||
        procedure.name?.toLowerCase().includes(query.toLowerCase()) ||
        procedure.category?.toLowerCase().includes(query.toLowerCase());

      const matchesIndustry = !filters.industry || 
        procedure.industry === filters.industry;

      const matchesMinMarketSize = !filters.minMarketSize || 
        (procedure.market_size_2025_usd_millions || procedure.market_size_usd_millions || 0) >= filters.minMarketSize;

      return matchesQuery && matchesIndustry && matchesMinMarketSize;
    });
  }

  async getTopGrowthProcedures(limit: number = 20): Promise<any[]> {
    const data = await this.getComprehensiveMarketData();
    
    return data.procedures
      .filter(p => p.yearly_growth_percentage || p.growth_rate)
      .sort((a, b) => (b.yearly_growth_percentage || b.growth_rate || 0) - (a.yearly_growth_percentage || a.growth_rate || 0))
      .slice(0, limit);
  }

  async getTerritoryInsights(): Promise<any[]> {
    const data = await this.getComprehensiveMarketData();
    return data.territories
      .sort((a, b) => b.totalMarketSize - a.totalMarketSize)
      .slice(0, 10); // Top 10 territories
  }

  clearCache(): void {
    this.dataCache = null;
    this.tableCache.clear();
    this.lastFetch = 0;
  }
}

export const comprehensiveDataService = ComprehensiveDataService.getInstance();