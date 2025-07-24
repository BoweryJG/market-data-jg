import { supabase } from './supabaseClient';
import { CategoryHierarchy } from '../types';
import { 
  mapProcedureToHierarchy, 
  procedureBelongsToCategory,
  categorizeProcedure 
} from '../components/Dashboard/CategoryMapping';
import { logger } from './logging/logger';
import { getErrorMessage } from '../utils/errorUtils';

export interface CategoryWithProcedures extends CategoryHierarchy {
  procedures?: any[];
  procedure_count_actual?: number;
}

class CategoryHierarchyService {
  private static instance: CategoryHierarchyService;
  private categoryCache: CategoryHierarchy[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): CategoryHierarchyService {
    if (!CategoryHierarchyService.instance) {
      CategoryHierarchyService.instance = new CategoryHierarchyService();
    }
    return CategoryHierarchyService.instance;
  }

  /**
   * Get all categories from the hierarchy
   */
  async getAllCategories(industry?: 'dental' | 'aesthetic'): Promise<CategoryHierarchy[]> {
    await this.loadCategories();
    
    if (industry) {
      return this.categoryCache.filter(cat => 
        cat.industry === industry || cat.applicable_to === industry
      );
    }
    
    return this.categoryCache;
  }

  /**
   * Get category hierarchy with parent-child relationships
   */
  async getCategoryHierarchy(industry?: 'dental' | 'aesthetic'): Promise<CategoryHierarchy[]> {
    const categories = await this.getAllCategories(industry);
    
    // Build hierarchy structure
    const categoryMap = new Map<number, CategoryHierarchy>();
    const rootCategories: CategoryHierarchy[] = [];
    
    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] });
    });
    
    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });
    
    return rootCategories;
  }

  /**
   * Get procedures for a specific category using the mapping logic
   */
  async getProceduresForCategory(
    categoryId: number, 
    industry?: 'dental' | 'aesthetic'
  ): Promise<any[]> {
    const category = await this.getCategoryById(categoryId);
    if (!category) return [];

    // Get all procedures from both tables
    const [dentalProcedures, aestheticProcedures] = await Promise.all([
      this.fetchDentalProcedures(),
      this.fetchAestheticProcedures()
    ]);

    const allProcedures = [...dentalProcedures, ...aestheticProcedures];
    const categories = await this.getAllCategories();

    // Filter procedures that belong to this category
    return allProcedures.filter(procedure => {
      const detectedIndustry = categorizeProcedure(procedure.procedure_name || procedure.name);
      
      // Skip if industry doesn't match
      if (industry && detectedIndustry !== industry) return false;
      
      // Use the mapping logic to check if procedure belongs to category
      return procedureBelongsToCategory(procedure, categoryId, detectedIndustry || undefined, categories);
    });
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<CategoryHierarchy | null> {
    const categories = await this.getAllCategories();
    return categories.find(cat => cat.id === id) || null;
  }

  /**
   * Get categories with actual procedure counts
   */
  async getCategoriesWithProcedureCounts(industry?: 'dental' | 'aesthetic'): Promise<CategoryWithProcedures[]> {
    const categories = await this.getAllCategories(industry);
    
    // Get procedure counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async category => {
        const procedures = await this.getProceduresForCategory(category.id, industry);
        
        return {
          ...category,
          procedures,
          procedure_count_actual: procedures.length
        };
      })
    );

    return categoriesWithCounts;
  }

  /**
   * Auto-categorize a procedure using the mapping logic
   */
  async categorizeProcedure(procedure: any): Promise<number[]> {
    const categories = await this.getAllCategories();
    const detectedIndustry = categorizeProcedure(procedure.procedure_name || procedure.name);
    
    return mapProcedureToHierarchy(procedure, detectedIndustry || undefined, categories);
  }

  /**
   * Update procedure category mappings in the database
   */
  async updateProcedureCategoryMappings(): Promise<void> {
    logger.info('Updating procedure category mappings');
    
    const [dentalProcedures, aestheticProcedures] = await Promise.all([
      this.fetchDentalProcedures(),
      this.fetchAestheticProcedures()
    ]);

    // Update dental procedures
    for (const procedure of dentalProcedures) {
      const categoryIds = await this.categorizeProcedure(procedure);
      if (categoryIds.length > 0) {
        const primaryCategoryId = categoryIds[0]; // Use first/primary category
        
        await supabase
          .from('dental_procedures')
          .update({ category_hierarchy_id: primaryCategoryId })
          .eq('id', procedure.id);
      }
    }

    // Update aesthetic procedures
    for (const procedure of aestheticProcedures) {
      const categoryIds = await this.categorizeProcedure(procedure);
      if (categoryIds.length > 0) {
        const primaryCategoryId = categoryIds[0]; // Use first/primary category
        
        await supabase
          .from('aesthetic_procedures')
          .update({ category_hierarchy_id: primaryCategoryId })
          .eq('id', procedure.id);
      }
    }

    // Update procedure counts
    await this.updateCategoryProcedureCounts();
    
    logger.info('Procedure category mappings updated');
  }

  /**
   * Update category procedure counts in database
   */
  async updateCategoryProcedureCounts(): Promise<void> {
    const { error } = await supabase.rpc('update_category_procedure_counts');
    
    if (error) {
      logger.error('Error updating category procedure counts', { error: getErrorMessage(error) });
    }
  }

  /**
   * Search procedures by category and filters
   */
  async searchProcedures(query: {
    categoryId?: number;
    industry?: 'dental' | 'aesthetic';
    searchTerm?: string;
    minMarketSize?: number;
  }): Promise<any[]> {
    let procedures: any[] = [];

    if (query.categoryId) {
      procedures = await this.getProceduresForCategory(query.categoryId, query.industry);
    } else {
      const [dental, aesthetic] = await Promise.all([
        this.fetchDentalProcedures(),
        this.fetchAestheticProcedures()
      ]);
      procedures = [...dental, ...aesthetic];
    }

    // Apply filters
    return procedures.filter(procedure => {
      if (query.industry && procedure.industry !== query.industry) return false;
      
      if (query.searchTerm) {
        const searchLower = query.searchTerm.toLowerCase();
        const nameMatch = (procedure.procedure_name || procedure.name || '').toLowerCase().includes(searchLower);
        const categoryMatch = (procedure.category || '').toLowerCase().includes(searchLower);
        if (!nameMatch && !categoryMatch) return false;
      }
      
      if (query.minMarketSize) {
        const marketSize = procedure.market_size_usd_millions || procedure.market_size_2025_usd_millions || 0;
        if (marketSize < query.minMarketSize) return false;
      }
      
      return true;
    });
  }

  /**
   * Private methods
   */
  private async loadCategories(): Promise<void> {
    const now = Date.now();
    
    if (this.categoryCache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return;
    }

    const { data, error } = await supabase
      .from('category_hierarchy')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error loading categories', { error: getErrorMessage(error) });
      return;
    }

    this.categoryCache = data || [];
    this.lastFetch = now;
  }

  private async fetchDentalProcedures(): Promise<any[]> {
    const { data, error } = await supabase
      .from('dental_procedures')
      .select('*');
    
    if (error) {
      logger.error('Error fetching dental procedures', { error: getErrorMessage(error) });
      return [];
    }
    
    return (data || []).map(proc => ({ ...proc, industry: 'dental' }));
  }

  private async fetchAestheticProcedures(): Promise<any[]> {
    const { data, error } = await supabase
      .from('aesthetic_procedures')
      .select('*');
    
    if (error) {
      logger.error('Error fetching aesthetic procedures', { error: getErrorMessage(error) });
      return [];
    }
    
    return (data || []).map(proc => ({ ...proc, industry: 'aesthetic' }));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.categoryCache = [];
    this.lastFetch = 0;
  }
}

export const categoryHierarchyService = CategoryHierarchyService.getInstance();
export default categoryHierarchyService;