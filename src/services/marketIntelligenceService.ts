import axios from 'axios';
import { supabase } from './supabaseClient';
import env from '../setupEnv'; // Use the centralized env setup
import { logger } from './logging/logger';
import { getErrorMessage } from '../utils/errorUtils';

// Use the API URL from the environment configuration
const NEWS_PROXY_URL = env.VITE_API_URL;

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const searchCache = new Map<string, { data: any; timestamp: number }>();

export interface MarketInsight {
  query: string;
  results: SearchResult[];
  trends: TrendData[];
  categories: CategorySuggestion[];
  sentiment: SentimentAnalysis;
  timestamp: Date;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  relevanceScore: number;
  category?: string;
  tags?: string[];
  publishedDate?: string;
  source?: string;
}

export interface TrendData {
  term: string;
  volume: number;
  growth: number;
  category: string;
  timeframe: string;
}

export interface CategorySuggestion {
  name: string;
  confidence: number;
  parentCategory?: string;
  relatedTerms: string[];
  marketPotential: 'high' | 'medium' | 'low';
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  overall: 'positive' | 'neutral' | 'negative';
}

export interface CompetitiveIntelligence {
  company: string;
  insights: {
    recentNews: SearchResult[];
    productLaunches: SearchResult[];
    marketPosition: string;
    innovations: string[];
    sentiment: SentimentAnalysis;
  };
}

class MarketIntelligenceService {
  // Enhanced search with intelligent categorization
  async searchWithIntelligence(
    query: string,
    options: {
      industry?: 'dental' | 'aesthetic';
      searchType?: 'general' | 'news' | 'research' | 'competitive';
      limit?: number;
      includeAnalytics?: boolean;
    } = {}
  ): Promise<MarketInsight> {
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Enhance query based on industry context
      const enhancedQuery = this.enhanceQuery(query, options.industry);
      
      // Perform search
      const searchResults = await this.performSearch(enhancedQuery, options.limit || 20);
      
      // Analyze results
      const categorizedResults = await this.categorizeResults(searchResults, options.industry);
      const trends = await this.extractTrends(searchResults, query);
      const categories = await this.suggestCategories(searchResults, options.industry);
      const sentiment = this.analyzeSentiment(searchResults);

      const insight: MarketInsight = {
        query,
        results: categorizedResults,
        trends,
        categories,
        sentiment,
        timestamp: new Date()
      };

      // Cache the result
      this.setCache(cacheKey, insight);

      // Store analytics if requested
      if (options.includeAnalytics) {
        await this.storeSearchAnalytics(query, insight);
      }

      return insight;
    } catch (error) {
      logger.error('Market intelligence search failed', { error: getErrorMessage(error) });
      throw error;
    }
  }

  // Search for emerging categories and trends
  async discoverEmergingCategories(
    industry: 'dental' | 'aesthetic',
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<CategorySuggestion[]> {
    const queries = this.getIndustryTrendQueries(industry);
    const allCategories: CategorySuggestion[] = [];

    for (const query of queries) {
      try {
        const results = await this.performSearch(query, 50);
        const categories = await this.suggestCategories(results, industry);
        allCategories.push(...categories);
      } catch (error) {
        logger.error('Failed to discover categories for query', { query, error: getErrorMessage(error) });
      }
    }

    // Deduplicate and rank categories
    return this.rankCategories(allCategories);
  }

  // Get competitive intelligence for a company
  async getCompetitiveIntelligence(
    companyName: string,
    industry: 'dental' | 'aesthetic'
  ): Promise<CompetitiveIntelligence> {
    const queries = [
      `${companyName} latest news ${industry}`,
      `${companyName} product launch announcement`,
      `${companyName} innovation technology ${industry}`,
      `${companyName} market share revenue`
    ];

    const allResults: SearchResult[] = [];
    
    for (const query of queries) {
      try {
        const results = await this.performSearch(query, 10);
        allResults.push(...results);
      } catch (error) {
        logger.error('Failed to get intelligence for query', { query, error: getErrorMessage(error) });
      }
    }

    return this.analyzeCompetitiveData(companyName, allResults);
  }

  // Get market trends for a specific procedure or category
  async getProcedureTrends(
    procedureName: string,
    industry: 'dental' | 'aesthetic'
  ): Promise<{
    trends: TrendData[];
    relatedProcedures: string[];
    marketOutlook: string;
    innovations: string[];
  }> {
    const queries = [
      `${procedureName} market growth trends ${new Date().getFullYear()}`,
      `${procedureName} innovations technology advances`,
      `${procedureName} patient demand statistics`,
      `${procedureName} clinical studies research`
    ];

    const allResults: SearchResult[] = [];
    
    for (const query of queries) {
      try {
        const results = await this.performSearch(query, 15);
        allResults.push(...results);
      } catch (error) {
        logger.error('Failed to get trends for query', { query, error: getErrorMessage(error) });
      }
    }

    return this.analyzeProcedureTrends(procedureName, allResults);
  }

  // Private helper methods
  private async performSearch(query: string, limit: number): Promise<SearchResult[]> {
    const response = await axios.get(`${NEWS_PROXY_URL}/api/search/brave`, {
      params: { query, limit }
    });

    // Brave Search API returns results in web.results
    const results = response.data.web?.results || response.data.results || [];
    
    return results.map((item: any) => ({
      title: item.title,
      url: item.url,
      description: item.description || item.snippet || '',
      relevanceScore: item.relevance_score || 0.5,
      publishedDate: item.page_age || item.published_date,
      source: item.profile?.name || item.source || this.extractDomain(item.url)
    }));
  }

  private enhanceQuery(query: string, industry?: 'dental' | 'aesthetic'): string {
    const industryTerms = {
      dental: ['dentistry', 'dental practice', 'oral health', 'dental technology'],
      aesthetic: ['aesthetic medicine', 'cosmetic procedures', 'medical aesthetics', 'beauty technology']
    };

    if (industry && industryTerms[industry]) {
      const terms = industryTerms[industry];
      const randomTerm = terms[Math.floor(Math.random() * terms.length)];
      return `${query} ${randomTerm}`;
    }

    return query;
  }

  private async categorizeResults(
    results: SearchResult[],
    industry?: 'dental' | 'aesthetic'
  ): Promise<SearchResult[]> {
    // Load categories from database
    const tableName = industry === 'dental' 
      ? 'dental_procedure_categories' 
      : 'aesthetic_categories';
    
    const { data: categories } = await supabase
      .from(tableName)
      .select('name');

    const categoryNames = categories?.map(c => c.name.toLowerCase()) || [];

    return results.map(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      const matchedCategory = categoryNames.find(cat => text.includes(cat));
      
      return {
        ...result,
        category: matchedCategory,
        tags: this.extractTags(text)
      };
    });
  }

  private async suggestCategories(
    results: SearchResult[],
    industry?: 'dental' | 'aesthetic'
  ): Promise<CategorySuggestion[]> {
    const termFrequency = new Map<string, number>();
    const categoryKeywords = this.getCategoryKeywords(industry);

    // Analyze term frequency
    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      categoryKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          termFrequency.set(keyword, (termFrequency.get(keyword) || 0) + 1);
        }
      });
    });

    // Convert to suggestions
    const suggestions: CategorySuggestion[] = [];
    termFrequency.forEach((count, term) => {
      if (count >= 2) { // Minimum threshold
        suggestions.push({
          name: this.formatCategoryName(term),
          confidence: Math.min(count / results.length, 1),
          relatedTerms: this.findRelatedTerms(term, results),
          marketPotential: count > 5 ? 'high' : count > 3 ? 'medium' : 'low'
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  private extractTrends(results: SearchResult[], originalQuery: string): TrendData[] {
    const trends: TrendData[] = [];
    const trendKeywords = ['growth', 'increase', 'surge', 'rise', 'demand', 'popular', 'emerging'];
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      trendKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const growthMatch = text.match(/(\d+)%?\s*(growth|increase|surge)/);
          if (growthMatch) {
            trends.push({
              term: originalQuery,
              volume: results.length,
              growth: parseFloat(growthMatch[1]),
              category: result.category || 'general',
              timeframe: this.extractTimeframe(text)
            });
          }
        }
      });
    });

    return trends;
  }

  private analyzeSentiment(results: SearchResult[]): SentimentAnalysis {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const positiveWords = ['success', 'growth', 'innovative', 'breakthrough', 'advanced', 'improved', 'effective'];
    const negativeWords = ['challenge', 'decline', 'risk', 'concern', 'problem', 'issue', 'difficult'];

    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      if (positiveCount > negativeCount) positive++;
      else if (negativeCount > positiveCount) negative++;
      else neutral++;
    });

    const total = results.length || 1;
    return {
      positive: positive / total,
      neutral: neutral / total,
      negative: negative / total,
      overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
    };
  }

  private async storeSearchAnalytics(query: string, insight: MarketInsight) {
    try {
      // Analytics tracking is disabled - no table available
      logger.debug('Search analytics tracking skipped', { query, resultCount: insight.results.length });
    } catch (error) {
      logger.error('Failed to store search analytics', { error: getErrorMessage(error) });
    }
  }

  private getCached(key: string): MarketInsight | null {
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: MarketInsight) {
    searchCache.set(key, { data, timestamp: Date.now() });
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private extractTags(text: string): string[] {
    const commonTags = [
      'technology', 'innovation', 'research', 'clinical', 'patient care',
      'market growth', 'regulation', 'safety', 'efficacy', 'cost-effective'
    ];
    
    return commonTags.filter(tag => text.includes(tag));
  }

  private getCategoryKeywords(industry?: 'dental' | 'aesthetic'): string[] {
    const baseKeywords = ['technology', 'procedure', 'treatment', 'therapy', 'solution'];
    
    if (industry === 'dental') {
      return [...baseKeywords, 'implant', 'orthodontic', 'endodontic', 'periodontal', 'restorative', 'cosmetic dentistry', 'oral surgery', 'digital dentistry'];
    } else if (industry === 'aesthetic') {
      return [...baseKeywords, 'injectable', 'laser', 'skin', 'body contouring', 'facial', 'minimally invasive', 'regenerative', 'anti-aging'];
    }
    
    return baseKeywords;
  }

  private formatCategoryName(term: string): string {
    return term
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private findRelatedTerms(term: string, results: SearchResult[]): string[] {
    const related = new Set<string>();
    const termLower = term.toLowerCase();
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      if (text.includes(termLower)) {
        // Extract nearby words as related terms
        const words = text.split(/\s+/);
        const index = words.findIndex(w => w.includes(termLower));
        if (index !== -1) {
          for (let i = Math.max(0, index - 3); i < Math.min(words.length, index + 4); i++) {
            if (i !== index && words[i].length > 4) {
              related.add(words[i]);
            }
          }
        }
      }
    });
    
    return Array.from(related).slice(0, 5);
  }

  private extractTimeframe(text: string): string {
    const timeframes = ['2025', '2024', '2023', 'this year', 'last year', 'quarterly', 'monthly'];
    const found = timeframes.find(tf => text.includes(tf));
    return found || 'recent';
  }

  private getIndustryTrendQueries(industry: 'dental' | 'aesthetic'): string[] {
    const year = new Date().getFullYear();
    
    if (industry === 'dental') {
      return [
        `emerging dental technologies ${year}`,
        `new dental procedures innovations`,
        `dental market trends growth areas`,
        `digital dentistry advancements`,
        `AI in dentistry applications`
      ];
    } else {
      return [
        `emerging aesthetic procedures ${year}`,
        `new cosmetic treatments innovations`,
        `aesthetic medicine trends growth`,
        `non-invasive beauty technologies`,
        `regenerative aesthetics advances`
      ];
    }
  }

  private rankCategories(categories: CategorySuggestion[]): CategorySuggestion[] {
    const categoryMap = new Map<string, CategorySuggestion>();
    
    categories.forEach(cat => {
      const existing = categoryMap.get(cat.name);
      if (existing) {
        existing.confidence = Math.max(existing.confidence, cat.confidence);
        existing.relatedTerms = [...new Set([...existing.relatedTerms, ...cat.relatedTerms])];
      } else {
        categoryMap.set(cat.name, cat);
      }
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  private analyzeCompetitiveData(company: string, results: SearchResult[]): CompetitiveIntelligence {
    const recentNews = results.filter(r => 
      r.title.toLowerCase().includes('news') || 
      r.description.toLowerCase().includes('announce')
    );
    
    const productLaunches = results.filter(r => 
      r.title.toLowerCase().includes('launch') || 
      r.description.toLowerCase().includes('introduce')
    );
    
    const innovations = this.extractInnovations(results);
    const sentiment = this.analyzeSentiment(results);
    
    return {
      company,
      insights: {
        recentNews: recentNews.slice(0, 5),
        productLaunches: productLaunches.slice(0, 3),
        marketPosition: this.determineMarketPosition(results),
        innovations,
        sentiment
      }
    };
  }

  private extractInnovations(results: SearchResult[]): string[] {
    const innovations = new Set<string>();
    const innovationKeywords = ['AI', 'machine learning', 'automation', 'digital', 'smart', 'advanced'];
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`;
      innovationKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const sentence = text.split('.').find(s => s.includes(keyword));
          if (sentence) {
            innovations.add(sentence.trim());
          }
        }
      });
    });
    
    return Array.from(innovations).slice(0, 5);
  }

  private determineMarketPosition(results: SearchResult[]): string {
    const positionKeywords = {
      leader: ['leader', 'leading', 'top', 'best', 'premier'],
      challenger: ['growing', 'emerging', 'innovative', 'disruptive'],
      niche: ['specialized', 'focused', 'unique', 'specific']
    };
    
    let leaderCount = 0;
    let challengerCount = 0;
    let nicheCount = 0;
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      positionKeywords.leader.forEach(kw => { if (text.includes(kw)) leaderCount++; });
      positionKeywords.challenger.forEach(kw => { if (text.includes(kw)) challengerCount++; });
      positionKeywords.niche.forEach(kw => { if (text.includes(kw)) nicheCount++; });
    });
    
    if (leaderCount > challengerCount && leaderCount > nicheCount) return 'Market Leader';
    if (challengerCount > nicheCount) return 'Market Challenger';
    return 'Niche Player';
  }

  private analyzeProcedureTrends(
    procedureName: string,
    results: SearchResult[]
  ): {
    trends: TrendData[];
    relatedProcedures: string[];
    marketOutlook: string;
    innovations: string[];
  } {
    const trends = this.extractTrends(results, procedureName);
    const innovations = this.extractInnovations(results);
    
    // Extract related procedures
    const relatedProcedures = new Set<string>();
    const procedureKeywords = ['procedure', 'treatment', 'therapy', 'technique'];
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`;
      procedureKeywords.forEach(keyword => {
        const regex = new RegExp(`(\\w+\\s+)?${keyword}`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.trim().toLowerCase();
            if (cleaned !== procedureName.toLowerCase() && cleaned.length > 5) {
              relatedProcedures.add(this.formatCategoryName(cleaned));
            }
          });
        }
      });
    });
    
    // Determine market outlook
    const sentiment = this.analyzeSentiment(results);
    const avgGrowth = trends.reduce((sum, t) => sum + t.growth, 0) / (trends.length || 1);
    
    let marketOutlook = 'Stable';
    if (sentiment.overall === 'positive' && avgGrowth > 5) {
      marketOutlook = 'Strong Growth Expected';
    } else if (sentiment.overall === 'positive') {
      marketOutlook = 'Moderate Growth Expected';
    } else if (sentiment.overall === 'negative') {
      marketOutlook = 'Challenging Market Conditions';
    }
    
    return {
      trends,
      relatedProcedures: Array.from(relatedProcedures).slice(0, 5),
      marketOutlook,
      innovations
    };
  }
}

export const marketIntelligenceService = new MarketIntelligenceService();
