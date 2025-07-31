import axios from 'axios';
import type { SearchResult } from '../types/api';
import { logger } from './logging/logger';
import { getErrorMessage } from '../utils/errorUtils';

const NEWS_PROXY_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BRAVE_API_KEY = import.meta.env.VITE_BRAVE_API_KEY;

interface BraveSearchOptions {
  count?: number;
  freshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day, week, month, year
  language?: string;
  country?: string;
}

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  source?: string;
  relevance_score?: number;
}

export async function search(query: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    logger.debug('Brave Search Request', {
      url: `${NEWS_PROXY_URL}/api/search/brave`,
      query,
      limit
    });
    
    const response = await axios.get(`${NEWS_PROXY_URL}/api/search/brave`, {
      params: { query, limit },
      timeout: 10000 // 10 second timeout
    });
    
    logger.debug('Brave Search Response received', { resultCount: response.data?.length });
    return response.data as SearchResult[];
  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { data?: unknown; status?: number }; code?: string };
    logger.error('Brave Search Error', {
      message: axiosError.message,
      status: axiosError.response?.status,
      url: `${NEWS_PROXY_URL}/api/search/brave`
    });
    
    // Provide more specific error messages
    if (axiosError.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to search service. Please ensure the server is running on port 3001.');
    } else if (axiosError.response?.status === 500) {
      throw new Error('Search service error. Please check if BRAVE_SEARCH_API_KEY is configured in server/.env');
    } else if (axiosError.response?.status === 400) {
      throw new Error('Invalid search query');
    } else {
      throw new Error(axiosError.message || 'Failed to perform search');
    }
  }
}

export async function searchNews(query: string, options: BraveSearchOptions = {}): Promise<BraveSearchResult[]> {
  try {
    // For now, use the general search endpoint until we have a dedicated news endpoint
    const results = await search(query, options.count || 5);
    
    // Transform SearchResult[] to BraveSearchResult[]
    return results.map((result: SearchResult) => ({
      title: result.title,
      url: result.url,
      description: result.snippet || '',
      age: (result as any).published || undefined,
      source: (result as any).source || undefined,
      relevance_score: 0.5 // Default relevance score
    }));
  } catch (error) {
    logger.error('Brave Search News Error', { error: getErrorMessage(error) });
    // Return empty array instead of throwing to prevent breaking the app
    return [];
  }
}

export async function searchWithIntelligence(query: string, options: Record<string, unknown> = {}): Promise<SearchResult[]> {
  try {
    // Enhanced search for market intelligence
    const enhancedQuery = `${query} market analysis trends statistics data ${new Date().getFullYear()}`;
    const results = await search(enhancedQuery, Number(options.count || 10));
    
    // Return the results as-is since SearchResult doesn't have intelligence fields
    return results;
  } catch (error) {
    logger.error('Brave Search Intelligence Error', { error: getErrorMessage(error) });
    return [];
  }
}

function calculateIntelligenceScore(result: Record<string, unknown>): number {
  let score = 0.5; // Base score
  
  // Boost for recent content
  const age = String(result.age || '');
  if (age.includes('hour')) score += 0.2;
  if (age.includes('day')) score += 0.1;
  
  // Boost for market-related keywords
  const marketKeywords = ['market', 'growth', 'trend', 'forecast', 'analysis', 'report'];
  const content = (String(result.title || '') + ' ' + String(result.description || '')).toLowerCase();
  marketKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 0.05;
  });
  
  return Math.min(score, 1.0);
}

function calculateMarketRelevance(result: Record<string, unknown>, originalQuery: string): number {
  const queryTerms = originalQuery.toLowerCase().split(' ');
  const content = (String(result.title || '') + ' ' + String(result.description || '')).toLowerCase();
  
  let matches = 0;
  queryTerms.forEach(term => {
    if (content.includes(term)) matches++;
  });
  
  return matches / queryTerms.length;
}

function extractActionableInsights(result: Record<string, unknown>): string[] {
  const insights: string[] = [];
  const content = (result.title + ' ' + result.description).toLowerCase();
  
  // Extract percentage mentions
  const percentRegex = /(\d+(?:\.\d+)?)\s*%/g;
  const percentMatches = content.match(percentRegex);
  if (percentMatches) {
    insights.push(`Growth/change metrics: ${percentMatches.join(', ')}`);
  }
  
  // Extract dollar amounts
  const dollarRegex = /\$\s*(\d+(?:\.\d+)?)\s*(billion|million|thousand|b|m|k)?/gi;
  const dollarMatches = content.match(dollarRegex);
  if (dollarMatches) {
    insights.push(`Market values: ${dollarMatches.join(', ')}`);
  }
  
  // Look for action keywords
  if (content.includes('opportunity')) insights.push('Market opportunity identified');
  if (content.includes('growth') || content.includes('growing')) insights.push('Growth trend detected');
  if (content.includes('decline') || content.includes('decreasing')) insights.push('Declining trend warning');
  
  return insights;
}

export const braveSearchService = {
  search,
  searchNews,
  searchWithIntelligence
};

export default braveSearchService;