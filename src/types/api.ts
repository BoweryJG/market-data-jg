// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  status?: number;
  error?: {
    message: string;
    status?: number;
    data?: unknown;
  };
}

// MCP Tool Types
export interface MCPToolResult {
  results?: SearchResult[];
  error?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  snippet?: string;
  published?: string;
  domain?: string;
}

export interface MCPToolArgs {
  query?: string;
  limit?: number;
  [key: string]: unknown;
}

// Billing and Subscription Types
export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

export interface UsageMetrics {
  aiQueries: {
    used: number;
    limit: number;
  };
  users: {
    used: number;
    limit: number;
  };
  categories: {
    used: number;
    limit: number;
  };
  automationRuns: {
    used: number;
    limit: number;
  };
}

// Procedure Types
export interface Procedure {
  id: string;
  name: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  average_cost?: number;
  growth_rate?: number;
  complexity?: 'low' | 'medium' | 'high';
  duration_minutes?: number;
  recovery_days?: number;
  success_rate?: number;
  satisfaction_score?: number;
  market_demand?: 'low' | 'medium' | 'high';
  trend?: 'growing' | 'stable' | 'declining';
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  procedures?: Procedure[];
  market_size?: number;
  growth_rate?: number;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  category_id?: number;
  website?: string;
  location?: string;
  employee_count?: number;
  revenue?: number;
  market_share?: number;
  founded_year?: number;
  technologies?: string[];
}

// News Types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  published_date: string;
  source: string;
  category_id?: number;
  procedure_category_id?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevance_score?: number;
}

// Market Data Types
export interface MarketGrowth {
  procedure_id: string;
  period: string;
  growth_rate: number;
  market_size: number;
  forecast?: {
    next_quarter: number;
    next_year: number;
  };
}

// Provider Data Types
export interface ProviderProfile {
  id: string;
  name: string;
  specialty?: string;
  location?: string;
  experience_years?: number;
  rating?: number;
  reviews_count?: number;
  certifications?: string[];
  services?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media?: Record<string, string>;
  business_hours?: Record<string, string>;
  insurance_accepted?: string[];
  decision_makers?: Array<{
    name: string;
    role: string;
    contact?: string;
  }>;
}

// Territory Data Types
export interface TerritoryData {
  id: string;
  name: string;
  type: 'city' | 'state' | 'region' | 'country';
  population?: number;
  market_size?: number;
  competition_level?: 'low' | 'medium' | 'high';
  demographics?: {
    age_groups?: Record<string, number>;
    income_levels?: Record<string, number>;
    education_levels?: Record<string, number>;
  };
  key_providers?: ProviderProfile[];
  market_trends?: Array<{
    procedure: string;
    trend: 'growing' | 'stable' | 'declining';
    opportunity_score: number;
  }>;
}

// Error Types
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

// Generic HTTP Error
export interface HttpError {
  message: string;
  status: number;
  data?: unknown;
}

// Database Query Result
export interface QueryResult<T = unknown> {
  data: T[];
  count: number;
  error?: string;
}

// Auth Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
}

// Market Intelligence Types
export interface CompetitiveIntelligence {
  company: string;
  recentNews: SearchResult[];
  keyInsights: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  threats: string[];
  opportunities: string[];
  lastUpdated: string;
}

export interface MarketSignal {
  id: string;
  title: string;
  description: string;
  source: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  timestamp: string;
  actionable_insights: string[];
  sales_action: string;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl?: number;
}