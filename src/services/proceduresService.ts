import { supabase } from './supabaseClient';

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
      console.error('Error fetching dental procedures:', error);
      return [];
    }
    
    return (data || []).map((proc: any) => ({
      ...proc,
      id: proc.id || `dental_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.clinical_category || 'General Dentistry',
      industry: 'dental' as const,
    }));
  },

  /**
   * Fetch all aesthetic procedures with proper categorization
   */
  async getAllAestheticProcedures(): Promise<AestheticProcedure[]> {
    const { data, error } = await supabase
      .from('aesthetic_procedures')
      .select('*');
    
    if (error) {
      console.error('Error fetching aesthetic procedures:', error);
      return [];
    }
    
    return (data || []).map((proc: any) => ({
      ...proc,
      id: proc.id || `aesthetic_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.aesthetic_category || 'Aesthetic Medicine',
      industry: 'aesthetic' as const,
    }));
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
      console.error(`Error fetching dental procedures for category ${category}:`, error);
      return [];
    }
    
    return (data || []).map((proc: any) => ({
      ...proc,
      id: proc.id || `dental_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.clinical_category || 'General Dentistry',
      industry: 'dental' as const,
    }));
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
      console.error(`Error fetching aesthetic procedures for category ${category}:`, error);
      return [];
    }
    
    return (data || []).map((proc: any) => ({
      ...proc,
      id: proc.id || `aesthetic_${proc.procedure_name || proc.name}`,
      procedure_name: proc.procedure_name || proc.name || 'Unknown Procedure',
      category: proc.category || proc.aesthetic_category || 'Aesthetic Medicine',
      industry: 'aesthetic' as const,
    }));
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
  async testConnection(): Promise<{ dental: any; aesthetic: any }> {
    console.log('🧪 Testing procedures connection...');
    
    const [dentalTest, aestheticTest] = await Promise.allSettled([
      supabase.from('dental_procedures').select('*').limit(3),
      supabase.from('aesthetic_procedures').select('*').limit(3),
    ]);

    console.log('🦷 Dental test:', dentalTest);
    console.log('💄 Aesthetic test:', aestheticTest);

    return {
      dental: dentalTest,
      aesthetic: aestheticTest,
    };
  },
};