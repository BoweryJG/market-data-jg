// Common type definitions for the market data application

// Base interfaces
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Social media links structure
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  [platform: string]: string | undefined;
}

// Search and API response types
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  source?: string;
}

export interface BraveSearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
}

export interface PerplexityResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export interface FirecrawlResponse {
  content: string;
  metadata: {
    title: string;
    description?: string;
    url: string;
  };
}

// Market data types
export interface MarketMetrics {
  marketSize: number;
  growthRate: number;
  cagr?: number;
  marketShare?: number;
  revenueGrowth?: number;
}

export interface RegionalData {
  region: string;
  marketSize: number;
  growthRate: number;
  penetrationRate?: number;
  demographics?: DemographicData;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  genderDistribution: Record<string, number>;
  incomeDistribution: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

// Enhanced procedure types
export interface ProcedureMetrics extends MarketMetrics {
  averageCost: number;
  costRange: {
    min: number;
    max: number;
  };
  procedureDuration?: number;
  recoveryTime?: number;
  successRate?: number;
  satisfactionScore?: number;
}

export interface ClinicalData {
  evidenceLevel: 'high' | 'medium' | 'low';
  studyCount: number;
  sampleSize: number;
  efficacyRate: number;
  sideEffects: string[];
  contraindications: string[];
}

// Enhanced company types
export interface CompanyMetrics extends MarketMetrics {
  revenue: number;
  employeeCount: number;
  foundedYear: number;
  valuation?: number;
  profitMargin?: number;
  debtToEquity?: number;
}

export interface CompanyFinancials {
  annualRevenue: number;
  quarterlyGrowth: number;
  profitMargin: number;
  ebitda?: number;
  cashFlow?: number;
  marketCap?: number;
}

// Error handling types
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: unknown;
  constraint?: string;
}

// API response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: AppError[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalPages: number;
  };
}

// Event handler types
export interface SelectionEvent<T> {
  item: T;
  index: number;
  source: 'click' | 'keyboard' | 'programmatic';
}

export interface FilterEvent {
  field: string;
  value: unknown;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
}

export interface SortEvent {
  field: string;
  direction: 'asc' | 'desc';
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
  key: string;
}

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'ttl';
}

// Research and enrichment types
export interface ResearchData {
  marketSize?: number;
  growthRate?: number;
  competitiveAnalysis?: string;
  trends?: string[];
  regulations?: string;
  sources: string[];
  confidence: number;
  lastUpdated: string;
}

export interface EnrichmentResult {
  procedureId: number;
  researchData: ResearchData;
  regionalData?: RegionalData[];
  clinicalData?: ClinicalData;
  status: 'completed' | 'failed' | 'partial';
  processingTime: number;
}

// Logging types
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface MetricsData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: string;
}

// Form and UI types
export interface FormField<T = unknown> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  value: T;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: Array<{label: string; value: T}>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
  };
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown, row: T) => React.ReactNode;
}

// Chart and visualization types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'heatmap';
  data: ChartDataPoint[] | TimeSeriesDataPoint[];
  options: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showTooltip?: boolean;
    colors?: string[];
    height?: number;
    width?: number;
  };
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status and state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

// Auth and user types
export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  expiresAt: string;
  lastActivity: string;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AppError | null;
}