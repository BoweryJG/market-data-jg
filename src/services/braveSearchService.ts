import axios from 'axios';

const NEWS_PROXY_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BRAVE_API_KEY = import.meta.env.VITE_BRAVE_API_KEY;

interface BraveSearchOptions {
  count?: number;
  freshness?: 'pd' | 'pw' | 'pm' | 'py'; // past day, week, month, year
  language?: string;
  country?: string;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  source?: string;
  relevance_score?: number;
}

export async function search(query: string, limit: number = 10): Promise<any> {
  try {
    console.log('Brave Search Request:', {
      url: `${NEWS_PROXY_URL}/api/search/brave`,
      query,
      limit
    });
    
    const response = await axios.get(`${NEWS_PROXY_URL}/api/search/brave`, {
      params: { query, limit },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Brave Search Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Brave Search Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${NEWS_PROXY_URL}/api/search/brave`
    });
    
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to search service. Please ensure the server is running on port 3001.');
    } else if (error.response?.status === 500) {
      throw new Error('Search service error. Please check if BRAVE_SEARCH_API_KEY is configured in server/.env');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid search query');
    } else {
      throw new Error(error.message || 'Failed to perform search');
    }
  }
}

export async function searchNews(query: string, options: BraveSearchOptions = {}): Promise<BraveSearchResult[]> {
  try {
    // For now, use the general search endpoint until we have a dedicated news endpoint
    const results = await search(query, options.count || 5);
    
    // Transform results to match expected format
    if (Array.isArray(results)) {
      return results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        description: result.description || result.snippet || '',
        age: result.age,
        source: result.source || result.publisher,
        relevance_score: result.relevance_score || 0.5
      }));
    }
    
    // If results is an object with a results array
    if (results && results.results && Array.isArray(results.results)) {
      return results.results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        description: result.description || result.snippet || '',
        age: result.age,
        source: result.source || result.publisher,
        relevance_score: result.relevance_score || 0.5
      }));
    }
    
    // Fallback to empty array
    return [];
  } catch (error) {
    console.error('Brave Search News Error:', error);
    // Return empty array instead of throwing to prevent breaking the app
    return [];
  }
}

export async function searchWithIntelligence(query: string, options: any = {}): Promise<any> {
  try {
    // Enhanced search for market intelligence
    const enhancedQuery = `${query} market analysis trends statistics data ${new Date().getFullYear()}`;
    const results = await search(enhancedQuery, options.count || 10);
    
    // Process and enhance results with intelligence scoring
    if (Array.isArray(results)) {
      return results.map((result: any) => ({
        ...result,
        intelligence_score: calculateIntelligenceScore(result),
        market_relevance: calculateMarketRelevance(result, query),
        actionable_insights: extractActionableInsights(result)
      }));
    }
    
    return results;
  } catch (error) {
    console.error('Brave Search Intelligence Error:', error);
    return [];
  }
}

function calculateIntelligenceScore(result: any): number {
  let score = 0.5; // Base score
  
  // Boost for recent content
  if (result.age && result.age.includes('hour')) score += 0.2;
  if (result.age && result.age.includes('day')) score += 0.1;
  
  // Boost for market-related keywords
  const marketKeywords = ['market', 'growth', 'trend', 'forecast', 'analysis', 'report'];
  const content = (result.title + ' ' + result.description).toLowerCase();
  marketKeywords.forEach(keyword => {
    if (content.includes(keyword)) score += 0.05;
  });
  
  return Math.min(score, 1.0);
}

function calculateMarketRelevance(result: any, originalQuery: string): number {
  const queryTerms = originalQuery.toLowerCase().split(' ');
  const content = (result.title + ' ' + result.description).toLowerCase();
  
  let matches = 0;
  queryTerms.forEach(term => {
    if (content.includes(term)) matches++;
  });
  
  return matches / queryTerms.length;
}

function extractActionableInsights(result: any): string[] {
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