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
        
        // Alternative approach: Query known table patterns (only tables that exist)
        const knownTablePatterns = [
          'procedures', 'dental_procedures', 'aesthetic_procedures',
          'companies', 'dental_procedure_categories', 'aesthetic_categories',
          'standardized_procedure_categories'
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
      // Only fetch the tables you actually have
      console.log('📊 Fetching from dental_procedures and aesthetic_procedures tables...');
      const [
        dentalProceduresResponse,
        aestheticProceduresResponse,
      ] = await Promise.allSettled([
        supabase.from('dental_procedures').select('*'),
        supabase.from('aesthetic_procedures').select('*'),
      ]);

      console.log('📊 Dental procedures response:', dentalProceduresResponse);
      console.log('📊 Aesthetic procedures response:', aestheticProceduresResponse);

      // Process dental procedures
      const processedDentalProcedures = (dentalProceduresResponse.status === 'fulfilled' ? dentalProceduresResponse.value.data || [] : [])
        .map((proc: any) => ({
          ...proc,
          id: proc.id || `dental_${proc.procedure_name || proc.name}`,
          procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
          category: proc.category || 
                   proc.clinical_category ||
                   proc.normalized_category ||
                   proc.procedure_category ||
                   'Dental Procedure',
          industry: 'dental',
          market_size_2025_usd_millions: proc.market_size_2025_usd_millions || proc.market_size_usd_millions || proc.market_size || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0,
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
          trending_score: proc.trending_score || proc.popularity_score || 0,
          popularity_score: proc.popularity_score || proc.trending_score || 0,
        }));

      // Process aesthetic procedures
      const processedAestheticProcedures = (aestheticProceduresResponse.status === 'fulfilled' ? aestheticProceduresResponse.value.data || [] : [])
        .map((proc: any) => ({
          ...proc,
          id: proc.id || `aesthetic_${proc.procedure_name || proc.name}`,
          procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
          category: proc.category || 
                   proc.aesthetic_category ||
                   proc.normalized_category ||
                   proc.procedure_category ||
                   'Aesthetic Procedure',
          industry: 'aesthetic',
          market_size_2025_usd_millions: proc.market_size_2025_usd_millions || proc.market_size_usd_millions || proc.market_size || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0,
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
          trending_score: proc.trending_score || proc.popularity_score || 0,
          popularity_score: proc.popularity_score || proc.trending_score || 0,
        }));

      const allProcedures = [
        ...processedDentalProcedures,
        ...processedAestheticProcedures,
      ];

      console.log(`✅ Processed ${processedDentalProcedures.length} dental and ${processedAestheticProcedures.length} aesthetic procedures`);

      // Extract territory data from procedures regional_popularity
      const territories = this.extractTerritoryData(allProcedures);

      // Calculate market metrics
      const totalMarketSize = allProcedures.reduce((sum, p) => 
        sum + (p.market_size_2025_usd_millions || p.market_size_usd_millions || 0), 0
      );
      
      const avgGrowth = allProcedures.length > 0 
        ? allProcedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || p.growth_rate || 0), 0) / allProcedures.length
        : 0;

      const comprehensiveData: ComprehensiveMarketData = {
        procedures: allProcedures,
        companies: [], // Empty for now - focus on procedures
        categories: [], // Empty for now - focus on procedures  
        territories,
        analytics: [], // Empty for now - focus on procedures
        marketMetrics: {
          totalMarketSize,
          totalProcedures: allProcedures.length,
          totalCompanies: 0,
          averageGrowth: avgGrowth,
          territoryCount: territories.length,
        },
      };

      this.dataCache = comprehensiveData;
      this.lastFetch = now;

      console.log('✅ Comprehensive market data loaded:', {
        procedures: allProcedures.length,
        dentalProcedures: processedDentalProcedures.length,
        aestheticProcedures: processedAestheticProcedures.length,
        territories: territories.length,
        totalMarketSize: totalMarketSize.toFixed(2) + 'M',
        avgGrowth: avgGrowth.toFixed(1) + '%',
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

  // Special method to test specific tables for debugging
  async testSpecificTables(): Promise<any> {
    console.log('🧪 Testing specific dental_procedures and aesthetic_procedures tables...');
    
    try {
      const [dentalTest, aestheticTest] = await Promise.allSettled([
        supabase.from('dental_procedures').select('*').limit(5),
        supabase.from('aesthetic_procedures').select('*').limit(5),
      ]);

      console.log('🦷 Dental procedures test:', dentalTest);
      console.log('💄 Aesthetic procedures test:', aestheticTest);

      return {
        dental: dentalTest,
        aesthetic: aestheticTest,
      };
    } catch (error) {
      console.error('❌ Table test failed:', error);
      return { error };
    }
  }
}

export const comprehensiveDataService = ComprehensiveDataService.getInstance();