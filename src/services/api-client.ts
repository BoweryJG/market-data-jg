import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { Category, Procedure, Company, NewsItem, MarketGrowth } from '../types/api';
import { logger } from './logging/logger';
import env from '../setupEnv';

// Define API Gateway configuration interface
interface ApiGatewayConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

// API response structure
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  status?: number;
  error?: {
    message: string;
    status?: number;
    data?: unknown; // To capture error response data
  };
}

// Simple API Gateway implementation
class ApiGateway {
  private client: AxiosInstance;
  
  constructor(config: ApiGatewayConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: config.headers || { 'Content-Type': 'application/json' },
      timeout: config.timeout || 30000,
      withCredentials: config.withCredentials || false
    });
  }
  
  // Update client configuration
  updateConfig(config: Partial<ApiGatewayConfig>): void {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    
    if (config.headers) {
      if (Object.keys(config.headers).length === 0 && config.headers.constructor === Object) {
        this.client.defaults.headers.common = { 'Content-Type': 'application/json' };
      } else {
        this.client.defaults.headers.common = {
          ...this.client.defaults.headers.common,
          ...config.headers
        };
      }
    }
    
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
    
    if (config.withCredentials !== undefined) {
      this.client.defaults.withCredentials = config.withCredentials;
    }
  }
  
  // Set authentication token
  setAuthToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }
  
  // GET request
  async get<T = unknown>(url: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`GET ${url} failed`, { message: axiosError.message, status: axiosError.response?.status });
      return {
        success: false,
        error: {
          message: axiosError.message || 'Unknown error',
          status: axiosError.response?.status,
          data: axiosError.response?.data
        }
      };
    }
  }
  
  // POST request
  async post<T = unknown>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`POST ${url} failed`, { message: axiosError.message, status: axiosError.response?.status });
      return {
        success: false,
        error: {
          message: axiosError.message || 'Unknown error',
          status: axiosError.response?.status,
          data: axiosError.response?.data
        }
      };
    }
  }
  
  // PUT request
  async put<T = unknown>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`PUT ${url} failed`, { message: axiosError.message, status: axiosError.response?.status });
      return {
        success: false,
        error: {
          message: axiosError.message || 'Unknown error',
          status: axiosError.response?.status,
          data: axiosError.response?.data
        }
      };
    }
  }
  
  // DELETE request
  async delete<T = unknown>(url: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      logger.error(`DELETE ${url} failed`, { message: axiosError.message, status: axiosError.response?.status });
      return {
        success: false,
        error: {
          message: axiosError.message || 'Unknown error',
          status: axiosError.response?.status,
          data: axiosError.response?.data
        }
      };
    }
  }
}

/**
 * Market Insights API Client
 */

export class MarketInsightsApiClient {
  private apiGateway: ApiGateway;
  private static instance: MarketInsightsApiClient;

  private constructor(config: ApiGatewayConfig) { // Made constructor private for singleton
    this.apiGateway = new ApiGateway(config);
  }

  public static getInstance(): MarketInsightsApiClient {
    if (!MarketInsightsApiClient.instance) {
      // Use env from setupEnv, which handles REACT_APP_ mapping
      const baseURL = env.VITE_API_URL;
      if (!baseURL) {
        throw new Error('Missing API URL environment variable');
      }
      const defaultConfig: ApiGatewayConfig = {
        baseURL,
        timeout: 15000, // Default timeout
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false
      };
      MarketInsightsApiClient.instance = new MarketInsightsApiClient(defaultConfig);
    }
    return MarketInsightsApiClient.instance;
  }

  public updateConfig(config: Partial<ApiGatewayConfig>): void {
    this.apiGateway.updateConfig(config);
  }

  public setAuthToken(token: string | null): void {
    this.apiGateway.setAuthToken(token);
  }

  public clearAuthToken(): void {
    this.apiGateway.setAuthToken(null);
  }

  private async handleResponse<T>(responsePromise: Promise<ApiResponse<T>>, errorMessagePrefix: string): Promise<T> {
    const response = await responsePromise;
    if (!response.success || response.data === undefined) {
      logger.error(errorMessagePrefix, { error: response.error });
      throw new Error(`${errorMessagePrefix}: ${response.error?.message || 'Unknown API error'}`);
    }
    return response.data;
  }

  public async checkHealth(): Promise<Record<string, unknown>> {
    return this.handleResponse(this.apiGateway.get<Record<string, unknown>>('/api/health'), 'Health check failed');
  }

  public async getCategories(): Promise<Category[]> {
    return this.handleResponse(this.apiGateway.get<Category[]>('/api/categories'), 'Failed to get categories');
  }

  public async getCategoryById(id: string): Promise<Category> {
    return this.handleResponse(this.apiGateway.get<Category>(`/api/categories/${id}`), `Failed to get category ${id}`);
  }

  public async getProcedures(limit: number = 20, offset: number = 0): Promise<Procedure[]> {
    return this.handleResponse(
      this.apiGateway.get<Procedure[]>('/api/procedures', { params: { limit, offset } }),
      'Failed to get procedures'
    );
  }

  public async getProcedureById(id: string): Promise<Procedure> {
    return this.handleResponse(this.apiGateway.get<Procedure>(`/api/procedures/${id}`), `Failed to get procedure ${id}`);
  }

  public async searchProcedures(query: string, filters?: Record<string, unknown>): Promise<Procedure[]> {
    return this.handleResponse(
      this.apiGateway.get<Procedure[]>('/api/procedures/search', { params: { q: query, ...filters } }),
      'Search failed'
    );
  }

  public async getMarketGrowth(procedureId: string, filters?: Record<string, unknown>): Promise<MarketGrowth> {
    return this.handleResponse(
      this.apiGateway.get<MarketGrowth>(`/api/market-growth/${procedureId}`, { params: filters }),
      'Failed to get market growth data'
    );
  }

  public async getNews(limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    return this.handleResponse(
      this.apiGateway.get<NewsItem[]>('/api/news', { params: { limit, offset } }),
      'Failed to get news'
    );
  }

  public async getNewsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    return this.handleResponse(
      this.apiGateway.get<NewsItem[]>(`/api/news/category/${categoryId}`, { params: { limit, offset } }),
      `Failed to get news for category ${categoryId}`
    );
  }

  public async getNewsByProcedureCategory(procedureCategoryId: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    return this.handleResponse(
      this.apiGateway.get<NewsItem[]>(`/api/news/procedure-category/${procedureCategoryId}`, { params: { limit, offset } }),
      `Failed to get news for procedure category ${procedureCategoryId}`
    );
  }

  public async getTopNewsByProcedureCategories(limit: number = 3): Promise<NewsItem[]> {
    return this.handleResponse(
      this.apiGateway.get<NewsItem[]>('/api/news/top-by-procedure-categories', { params: { limit } }),
      'Failed to get top news by procedure categories'
    );
  }

  public async executeQuery(query: string): Promise<ApiResponse<unknown>> {
    // Original executeQuery returned the whole ApiResponse, let's adjust if only data is needed
    const response = await this.apiGateway.post<unknown>('/api/query', { query });
    if (!response.success || response.data === undefined) {
      logger.error('Failed to execute query', { error: response.error });
      throw new Error(`Failed to execute query: ${response.error?.message || 'Unknown API error'}`);
    }
    return response; // Returning the full ApiResponse as original, can be changed to response.data
  }

  public async getCompanies(limit: number = 20, offset: number = 0): Promise<Company[]> {
    return this.handleResponse(
      this.apiGateway.get<Company[]>('/api/companies', { params: { limit, offset } }),
      'Failed to get companies'
    );
  }

  public async getCompanyById(id: string): Promise<Company> {
    return this.handleResponse(this.apiGateway.get<Company>(`/api/companies/${id}`), `Failed to get company ${id}`);
  }

  public async getCompaniesByCategory(categoryId: string, limit: number = 20, offset: number = 0): Promise<Company[]> {
    return this.handleResponse(
      this.apiGateway.get<Company[]>(`/api/companies/category/${categoryId}`, { params: { limit, offset } }),
      `Failed to get companies for category ${categoryId}`
    );
  }
}

// Export a default singleton instance
const apiClient = MarketInsightsApiClient.getInstance(); // This will now use the setupEnv derived baseURL

export default apiClient;
