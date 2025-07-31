import { supabase } from './supabaseClient';
import type { Category } from '../types/api';

export interface DentalProcedure {
  id: string;
  procedure_name: string;
  category: string;
  description?: string;
  average_cost_usd?: number;
  market_size_usd_millions?: number;
  growth_rate?: number;
  popularity_score?: number;
  clinical_category?: string;
  industry: 'dental';
}

export interface AestheticProcedure {
  id: string;
  procedure_name: string;
  category: string;
  description?: string;
  average_cost_usd?: number;
  market_size_usd_millions?: number;
  growth_rate?: number;
  popularity_score?: number;
  aesthetic_category?: string;
  industry: 'aesthetic';
}

export const ProceduresService = {
  /**
   * Fetch all dental procedures with proper categorization
   */
  async getAllDentalProcedures(): Promise<DentalProcedure[]> {
    const { data, error } = await supabase
      .from('dental_procedures')
      .select('*');
    
    if (error) {
      // Error fetching dental procedures
      return [];
    }
    
    return (data || []).map((proc: Record<string, unknown>) => ({
      ...proc,
      id: proc.id || `dental_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.clinical_category || 'General Dentistry',
      industry: 'dental' as const,
    } as DentalProcedure));
  },

  /**
   * Fetch all aesthetic procedures with proper categorization
   */
  async getAllAestheticProcedures(): Promise<AestheticProcedure[]> {
    // Fetch procedures with category join
    const { data: procedures, error: procError } = await supabase
      .from('aesthetic_procedures')
      .select('*');
    
    const { data: categories, error: catError } = await supabase
      .from('aesthetic_categories')
      .select('*');
    
    if (procError) {
      // Error fetching aesthetic procedures
      return [];
    }
    
    if (catError) {
      // Error fetching aesthetic categories
    }
    
    return (procedures || []).map((proc: Record<string, unknown>) => {
      // Find the related category
      const relatedCategory = (categories || []).find((cat: Record<string, unknown>) => 
        cat.id === proc.aesthetic_category_id || 
        cat.name === proc.category ||
        cat.name === proc.aesthetic_category
      );

      return {
        ...proc,
        id: String(proc.id || Math.floor(Math.random() * 1000000)),
        procedure_name: String(proc.procedure_name || proc.name || 'Unknown Procedure'),
        category: relatedCategory?.name || proc.category || 'Aesthetic Medicine',
        category_id: relatedCategory?.id || proc.aesthetic_category_id,
        category_description: relatedCategory?.description,
        industry: 'aesthetic' as const,
      } as AestheticProcedure;
    });
  },

  /**
   * Get procedures by category for dental
   */
  async getDentalProceduresByCategory(category: string): Promise<DentalProcedure[]> {
    const { data, error } = await supabase
      .from('dental_procedures')
      .select('*')
      .or(`category.eq.${category},clinical_category.eq.${category}`);
    
    if (error) {
      // Error fetching dental procedures for category
      return [];
    }
    
    return (data || []).map((proc: Record<string, unknown>) => ({
      ...proc,
      id: proc.id || `dental_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.clinical_category || 'General Dentistry',
      industry: 'dental' as const,
    } as DentalProcedure));
  },

  /**
   * Get procedures by category for aesthetic
   */
  async getAestheticProceduresByCategory(category: string): Promise<AestheticProcedure[]> {
    const { data, error } = await supabase
      .from('aesthetic_procedures')
      .select('*')
      .or(`category.eq.${category},aesthetic_category.eq.${category}`);
    
    if (error) {
      // Error fetching aesthetic procedures for category
      return [];
    }
    
    return (data || []).map((proc: Record<string, unknown>) => ({
      ...proc,
      id: proc.id || `aesthetic_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || 'Aesthetic Medicine',
      industry: 'aesthetic' as const,
    } as AestheticProcedure));
  },

  /**
   * Get all procedures combined with proper industry tagging
   */
  async getAllProcedures(): Promise<(DentalProcedure | AestheticProcedure)[]> {
    const [dental, aesthetic] = await Promise.all([
      this.getAllDentalProcedures(),
      this.getAllAestheticProcedures(),
    ]);
    
    return [...dental, ...aesthetic];
  },

  /**
   * Test connection to both tables
   */
  async testConnection(): Promise<{ dental: PromiseSettledResult<unknown>; aesthetic: PromiseSettledResult<unknown> }> {
    // Testing procedures connection
    const [dentalTest, aestheticTest] = await Promise.allSettled([
      supabase.from('dental_procedures').select('*').limit(3),
      supabase.from('aesthetic_procedures').select('*').limit(3),
    ]);

    return {
      dental: dentalTest,
      aesthetic: aestheticTest,
    };
  },
};