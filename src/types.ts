import { ComponentType, LazyExoticComponent } from 'react';

export interface RouteConfig {
  path: string;
  element: LazyExoticComponent<ComponentType<any>>;
  exact?: boolean;
  children?: RouteConfig[];
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  category: string;
  averageCost: number;
  popularity: number;
  growthRate: number;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  procedureCount: number;
  marketSize: number;
  growthRate: number;
  imageUrl?: string;
}

export interface DentalCategory {
  id: number;
  name: string;
  description?: string;
  market_size_usd_millions?: number;
  yearly_growth_percentage?: number;
  procedure_count?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AestheticCategory {
  id: number;
  name: string;
  description?: string;
  market_size_usd_millions?: number;
  yearly_growth_percentage?: number;
  procedure_count?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CategoryHierarchy {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  icon_name?: string;
  color_code?: string;
  market_size_usd_millions?: number;
  yearly_growth_percentage?: number;
  procedure_count?: number;
  subcategories?: CategoryHierarchy[];
  parent_id?: number | null;
  industry?: 'dental' | 'aesthetic' | 'both';
  applicable_to?: 'dental' | 'aesthetic' | 'both';
  display_order?: number;
  is_featured?: boolean;
  avg_growth_rate?: number;
}

export interface DentalProcedure {
  id: string;
  name: string;
  category: string;
  category_id?: number;
  procedure_category_id?: number;
  clinical_category?: string;
  average_cost_usd?: number;
  yearly_growth_percentage?: number;
  cpt_cdt_code?: string;
  market_size_2025?: number;
  description?: string;
  popularity?: number;
  imageUrl?: string;
  procedure_source?: 'dental';
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated' | null;
}

export interface AestheticProcedure {
  id: string;
  name?: string;
  procedure_name: string;
  category: string;
  category_id?: number;
  procedure_category_id?: number;
  cost_range?: string;
  downtime?: string;
  trend_score?: number;
  body_areas_applicable?: string[];
  market_size_2025?: number;
  description?: string;
  popularity?: number;
  yearly_growth_percentage?: number;
  average_cost_usd?: number;
  imageUrl?: string;
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated' | null;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  marketShare: number;
  revenue: number;
  employeeCount: number;
  foundedYear: number;
  headquarters: string;
  website: string;
  logoUrl?: string;
  market_share_pct?: number;
  last_year_sales_usd_million?: number;
  projected_growth_pct?: number;
}

export interface MarketGrowth {
  year: number;
  quarter: number;
  marketSize: number;
  growthRate: number;
  region?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishDate: string;
  url: string;
  imageUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}
