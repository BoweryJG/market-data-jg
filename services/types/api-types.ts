// API Response Types
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  status?: number;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: ErrorData;
}

export interface ErrorData {
  code?: string;
  details?: string;
  field?: string;
  [key: string]: unknown;
}

// Request Types
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
}

// Subscription Types
export interface SubscriptionStatus {
  isActive: boolean;
  planId: string;
  features: SubscriptionFeatures;
  usage: SubscriptionUsage;
  limits: SubscriptionLimits;
}

export interface SubscriptionFeatures {
  aiQueries: number | 'unlimited';
  users: number | 'unlimited';
  categories: number | 'unlimited';
  automation: boolean;
  api: boolean;
}

export interface SubscriptionUsage {
  aiQueries: number;
  users: number;
  categories: number;
  automationRuns: number;
}

export interface SubscriptionLimits {
  aiQueries: number | 'unlimited';
  users: number | 'unlimited';
  categories: number | 'unlimited';
}

// Procedure Types
export interface Procedure {
  id: string;
  name: string;
  category: string;
  description?: string;
  marketSize?: number;
  growthRate?: number;
  confidence?: number;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  industry?: string;
  procedures?: string[];
}

// Category Types
export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  procedures?: Procedure[];
}

// Search Result Types
export interface SearchResult {
  title: string;
  url: string;
  description: string;
  relevance?: number;
}

// Market Intelligence Types
export interface MarketIntelligence {
  trends: MarketTrend[];
  insights: MarketInsight[];
  competitors: CompetitorInfo[];
}

export interface MarketTrend {
  id: string;
  name: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  timeframe: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  date: string;
}

export interface CompetitorInfo {
  id: string;
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
}

// Generic API Request/Response types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// Error handler function type
export type ErrorHandler = (error: ApiError) => void | Promise<void>;

// Response transformer function type
export type ResponseTransformer<T = unknown> = (data: unknown) => T;