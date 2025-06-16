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
          'companies', 'dental_companies', 'aesthetic_companies',
          'dental_procedure_categories', 'aesthetic_categories',
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
      console.log('📊 Fetching procedures and companies data...');
      const [
        dentalProceduresResponse,
        aestheticProceduresResponse,
        dentalCompaniesResponse,
        aestheticCompaniesResponse,
      ] = await Promise.allSettled([
        supabase.from('dental_procedures').select('*'),
        supabase.from('aesthetic_procedures').select('*'),
        supabase.from('dental_companies').select('*'),
        supabase.from('aesthetic_companies').select('*'),
      ]);

      console.log('📊 Dental procedures response:', dentalProceduresResponse);
      console.log('📊 Aesthetic procedures response:', aestheticProceduresResponse);
      console.log('📊 Dental companies response:', dentalCompaniesResponse);
      console.log('📊 Aesthetic companies response:', aestheticCompaniesResponse);
      
      // Debug: Check sample procedure data structure
      if (dentalProceduresResponse.status === 'fulfilled' && dentalProceduresResponse.value.data?.length > 0) {
        const sampleProc = dentalProceduresResponse.value.data[0];
        console.log('🦷 Sample dental procedure fields:', {
          has_market_size_2025: 'market_size_2025_usd_millions' in sampleProc,
          has_market_size: 'market_size_usd_millions' in sampleProc,
          has_market_size_alt: 'market_size' in sampleProc,
          actual_fields: Object.keys(sampleProc).filter(k => k.includes('market'))
        });
      }

      // Fetch category data for proper joins - use both old and new category systems
      const [dentalCategoriesResponse, aestheticCategoriesResponse, categoryHierarchyResponse] = await Promise.allSettled([
        supabase.from('dental_procedure_categories').select('*'),
        supabase.from('aesthetic_categories').select('*'),
        supabase.from('category_hierarchy').select('*').order('display_order', { ascending: true }),
      ]);

      const dentalCategories = dentalCategoriesResponse.status === 'fulfilled' ? dentalCategoriesResponse.value.data || [] : [];
      const aestheticCategories = aestheticCategoriesResponse.status === 'fulfilled' ? aestheticCategoriesResponse.value.data || [] : [];
      const categoryHierarchy = categoryHierarchyResponse.status === 'fulfilled' ? categoryHierarchyResponse.value.data || [] : [];

      console.log('📊 Dental categories:', dentalCategories);
      console.log('📊 Aesthetic categories:', aestheticCategories);
      console.log('📊 Category hierarchy:', categoryHierarchy);

      // Process dental procedures with category joins
      const processedDentalProcedures = (dentalProceduresResponse.status === 'fulfilled' ? dentalProceduresResponse.value.data || [] : [])
        .map((proc: any) => {
          // Find the related category - try hierarchy first, then fallback to old categories
          const hierarchyCategory = categoryHierarchy.find(cat => 
            cat.id === proc.category_hierarchy_id ||
            (cat.industry === 'dental' && cat.name === proc.category) ||
            (cat.industry === 'dental' && cat.name === proc.clinical_category)
          );
          
          const oldCategory = dentalCategories.find(cat => 
            cat.id === proc.clinical_category_id || 
            cat.name === proc.category ||
            cat.name === proc.clinical_category
          );

          const finalCategory = hierarchyCategory || oldCategory;

          return {
            ...proc,
            id: proc.id || `dental_${proc.procedure_name || proc.name}`,
            procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
            category: finalCategory?.name || proc.category || proc.clinical_category || proc.normalized_category || 'General Dentistry',
            category_id: finalCategory?.id || proc.clinical_category_id || proc.category_hierarchy_id,
            category_description: finalCategory?.description,
            category_hierarchy_id: proc.category_hierarchy_id || hierarchyCategory?.id,
            hierarchy_category: hierarchyCategory,
            industry: 'dental',
            market_size_2025_usd_millions: proc.market_size_2025_usd_millions || proc.market_size_usd_millions || proc.market_size || 0,
            yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0,
            average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
            trending_score: proc.trending_score || proc.popularity_score || 0,
            popularity_score: proc.popularity_score || proc.trending_score || 0,
          };
        });

      // Process aesthetic procedures with category joins
      const processedAestheticProcedures = (aestheticProceduresResponse.status === 'fulfilled' ? aestheticProceduresResponse.value.data || [] : [])
        .map((proc: any) => {
          // Find the related category - try hierarchy first, then fallback to old categories
          const hierarchyCategory = categoryHierarchy.find(cat => 
            cat.id === proc.category_hierarchy_id ||
            (cat.industry === 'aesthetic' && cat.name === proc.category) ||
            (cat.industry === 'aesthetic' && cat.name === proc.aesthetic_category)
          );
          
          const oldCategory = aestheticCategories.find(cat => 
            cat.id === proc.aesthetic_category_id || 
            cat.name === proc.category ||
            cat.name === proc.aesthetic_category
          );

          const finalCategory = hierarchyCategory || oldCategory;

          return {
            ...proc,
            id: proc.id || `aesthetic_${proc.procedure_name || proc.name}`,
            procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
            category: finalCategory?.name || proc.category || proc.aesthetic_category || proc.normalized_category || 'Aesthetic Medicine',
            category_id: finalCategory?.id || proc.aesthetic_category_id || proc.category_hierarchy_id,
            category_description: finalCategory?.description,
            category_hierarchy_id: proc.category_hierarchy_id || hierarchyCategory?.id,
            hierarchy_category: hierarchyCategory,
            industry: 'aesthetic',
            market_size_2025_usd_millions: proc.market_size_2025_usd_millions || proc.market_size_usd_millions || proc.market_size || 0,
            yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0,
            average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
            trending_score: proc.trending_score || proc.popularity_score || 0,
            popularity_score: proc.popularity_score || proc.trending_score || 0,
          };
        });

      const allProcedures = [
        ...processedDentalProcedures,
        ...processedAestheticProcedures,
      ];
      
      // Remove duplicates based on procedure name and industry
      const uniqueProcedures = allProcedures.reduce((acc, procedure) => {
        const key = `${procedure.procedure_name}_${procedure.industry}`;
        const existing = acc.get(key);
        
        // Keep the procedure with more complete data (higher market size or more fields)
        if (!existing || 
            (procedure.market_size_2025_usd_millions > existing.market_size_2025_usd_millions) ||
            (procedure.market_size_2025_usd_millions === existing.market_size_2025_usd_millions && 
             procedure.yearly_growth_percentage > existing.yearly_growth_percentage)) {
          acc.set(key, procedure);
        }
        
        return acc;
      }, new Map());
      
      const dedupedProcedures = Array.from(uniqueProcedures.values());

      // Process dental companies
      const processedDentalCompanies = (dentalCompaniesResponse.status === 'fulfilled' ? dentalCompaniesResponse.value.data || [] : [])
        .map((company: any) => ({
          ...company,
          id: company.id || `dental_company_${company.name}`,
          company_name: company.name || 'Unknown Company',
          industry: 'dental',
          market_size_usd_billions: company.market_size_2025_usd_billion || 0,
        }));

      // Process aesthetic companies
      const processedAestheticCompanies = (aestheticCompaniesResponse.status === 'fulfilled' ? aestheticCompaniesResponse.value.data || [] : [])
        .map((company: any) => ({
          ...company,
          id: company.id || `aesthetic_company_${company.name}`,
          company_name: company.name || 'Unknown Company',
          industry: 'aesthetic',
          market_size_usd_billions: company.market_size_2025_usd_billion || 0,
        }));

      const allCompanies = [
        ...processedDentalCompanies,
        ...processedAestheticCompanies,
      ];

      console.log(`✅ Processed ${processedDentalProcedures.length} dental and ${processedAestheticProcedures.length} aesthetic procedures`);
      console.log(`✅ Processed ${processedDentalCompanies.length} dental and ${processedAestheticCompanies.length} aesthetic companies`);
      console.log(`✅ After deduplication: ${dedupedProcedures.length} unique procedures (removed ${allProcedures.length - dedupedProcedures.length} duplicates)`);
      
      // Debug: Check which market size fields are populated
      const marketSizeFieldUsage = dedupedProcedures.reduce((acc: any, proc: any) => {
        if (proc.market_size_2025_usd_millions > 0) acc.primary++;
        else if (proc.market_size_usd_millions > 0) acc.fallback1++;
        else if (proc.market_size > 0) acc.fallback2++;
        else acc.none++;
        return acc;
      }, { primary: 0, fallback1: 0, fallback2: 0, none: 0 });
      
      console.log('📊 Market size field usage:', marketSizeFieldUsage);

      // Extract territory data from procedures regional_popularity
      const territories = this.extractTerritoryData(dedupedProcedures);

      // Calculate market metrics
      const totalMarketSize = dedupedProcedures.reduce((sum, p: any) => 
        sum + (p.market_size_2025_usd_millions || p.market_size_usd_millions || 0), 0
      );
      
      const procedureCount = dedupedProcedures.length;
      const totalGrowth = dedupedProcedures.reduce((sum: number, p: any) => sum + (p.yearly_growth_percentage || p.growth_rate || 0), 0);
      const avgGrowth = procedureCount > 0 ? (totalGrowth as number) / (procedureCount as number) : 0;

      // Combine and process categories for filtering - prioritize hierarchy
      const processedCategories = [
        // Rich category hierarchy (primary)
        ...categoryHierarchy.map(cat => ({ ...cat, type: 'category_hierarchy' })),
        // Legacy categories as fallback  
        ...dentalCategories.map(cat => ({ ...cat, industry: 'dental', type: 'dental_procedure_category' })),
        ...aestheticCategories.map(cat => ({ ...cat, industry: 'aesthetic', type: 'aesthetic_category' }))
      ];

      const comprehensiveData: ComprehensiveMarketData = {
        procedures: dedupedProcedures,
        companies: allCompanies,
        categories: processedCategories,
        territories,
        analytics: [], // Empty for now - focus on procedures
        marketMetrics: {
          totalMarketSize: totalMarketSize as number,
          totalProcedures: dedupedProcedures.length,
          totalCompanies: allCompanies.length,
          averageGrowth: avgGrowth as number,
          territoryCount: territories.length,
        },
      };

      this.dataCache = comprehensiveData;
      this.lastFetch = now;

      console.log('✅ Comprehensive market data loaded:', {
        procedures: allProcedures.length,
        dentalProcedures: processedDentalProcedures.length,
        aestheticProcedures: processedAestheticProcedures.length,
        companies: allCompanies.length,
        dentalCompanies: processedDentalCompanies.length,
        aestheticCompanies: processedAestheticCompanies.length,
        territories: territories.length,
        totalMarketSize: (totalMarketSize as number).toFixed(2) + 'M',
        avgGrowth: (avgGrowth as number).toFixed(1) + '%',
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

  /**
   * Get rich categories for filtering
   */
  async getCategories(industry?: 'dental' | 'aesthetic'): Promise<any[]> {
    const data = await this.getComprehensiveMarketData();
    
    if (industry) {
      return data.categories.filter(cat => cat.industry === industry);
    }
    
    return data.categories;
  }

  /**
   * Get procedures by category with rich category information
   */
  async getProceduresByCategory(categoryName: string, industry?: 'dental' | 'aesthetic'): Promise<any[]> {
    const data = await this.getComprehensiveMarketData();
    
    return data.procedures.filter(procedure => {
      const matchesCategory = procedure.category === categoryName;
      const matchesIndustry = !industry || procedure.industry === industry;
      
      return matchesCategory && matchesIndustry;
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