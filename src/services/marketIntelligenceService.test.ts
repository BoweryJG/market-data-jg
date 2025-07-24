import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { marketIntelligenceService } from './marketIntelligenceService';
import { supabase } from './supabaseClient';

// Mock dependencies
vi.mock('axios');
vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}));
vi.mock('./logging/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('MarketIntelligenceService', () => {
  const mockSearchResults = {
    web: {
      results: [
        {
          title: 'Dental Technology Innovation 2025',
          url: 'https://example.com/dental-tech',
          description: 'Latest breakthrough in dental implant technology shows 20% growth',
          relevance_score: 0.9,
          page_age: '2025-01-20',
          profile: { name: 'DentalNews' }
        },
        {
          title: 'AI in Dentistry Success Story',
          url: 'https://example.com/ai-dental',
          description: 'Artificial intelligence improving patient care and treatment outcomes',
          relevance_score: 0.85,
          page_age: '2025-01-19'
        }
      ]
    }
  };

  const mockCategories = [
    { name: 'Dental Implants' },
    { name: 'Digital Dentistry' },
    { name: 'Orthodontics' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache by accessing private property
    (marketIntelligenceService as any).searchCache?.clear();
    
    // Default mocks
    (axios.get as any).mockResolvedValue({ data: mockSearchResults });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockCategories })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchWithIntelligence', () => {
    it('should perform search and return market insights', async () => {
      const result = await marketIntelligenceService.searchWithIntelligence('dental technology', {
        industry: 'dental',
        limit: 10
      });

      expect(result).toMatchObject({
        query: 'dental technology',
        results: expect.any(Array),
        trends: expect.any(Array),
        categories: expect.any(Array),
        sentiment: expect.objectContaining({
          positive: expect.any(Number),
          neutral: expect.any(Number),
          negative: expect.any(Number),
          overall: expect.stringMatching(/positive|neutral|negative/)
        }),
        timestamp: expect.any(Date)
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/search/brave'),
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.stringContaining('dental technology'),
            limit: 10
          })
        })
      );
    });

    it('should enhance query based on industry', async () => {
      await marketIntelligenceService.searchWithIntelligence('implants', {
        industry: 'dental',
        limit: 5
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.stringMatching(/implants.*(dentistry|dental practice|oral health|dental technology)/)
          })
        })
      );
    });

    it('should categorize results based on industry categories', async () => {
      const result = await marketIntelligenceService.searchWithIntelligence('procedures', {
        industry: 'dental'
      });

      expect(supabase.from).toHaveBeenCalledWith('dental_procedure_categories');
      expect(result.results[0]).toHaveProperty('category');
      expect(result.results[0]).toHaveProperty('tags');
    });

    it('should extract trends from search results', async () => {
      const result = await marketIntelligenceService.searchWithIntelligence('market growth', {
        industry: 'dental'
      });

      expect(result.trends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            term: 'market growth',
            volume: expect.any(Number),
            growth: 20, // From mock data "20% growth"
            category: expect.any(String),
            timeframe: expect.any(String)
          })
        ])
      );
    });

    it('should analyze sentiment of results', async () => {
      const result = await marketIntelligenceService.searchWithIntelligence('innovations', {
        industry: 'dental'
      });

      expect(result.sentiment.overall).toBe('positive'); // Based on positive words in mock data
      expect(result.sentiment.positive).toBeGreaterThan(0);
    });

    it('should cache results for repeated queries', async () => {
      const query = 'dental tech';
      const options = { industry: 'dental' as const, limit: 5 };

      // First call
      const result1 = await marketIntelligenceService.searchWithIntelligence(query, options);
      
      // Second call with same parameters
      const result2 = await marketIntelligenceService.searchWithIntelligence(query, options);

      // Should only call axios once due to caching
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should handle search errors gracefully', async () => {
      (axios.get as any).mockRejectedValue(new Error('Network error'));

      await expect(
        marketIntelligenceService.searchWithIntelligence('test query')
      ).rejects.toThrow('Network error');
    });
  });

  describe('discoverEmergingCategories', () => {
    it('should discover emerging categories for dental industry', async () => {
      // Mock search results that will generate categories
      const mockTrendResults = {
        web: {
          results: [
            {
              title: 'Emerging dental implant technology trends',
              url: 'https://example.com/trends',
              description: 'New digital dentistry innovations in implant procedures show strong growth',
              relevance_score: 0.9
            },
            {
              title: 'AI orthodontic solutions gaining traction',
              url: 'https://example.com/ai-ortho',
              description: 'Artificial intelligence in orthodontic treatment planning',
              relevance_score: 0.85
            },
            {
              title: 'Digital dentistry transformation',
              url: 'https://example.com/digital',
              description: 'Digital dentistry adoption increasing rapidly',
              relevance_score: 0.8
            }
          ]
        }
      };
      
      (axios.get as any).mockResolvedValue({ data: mockTrendResults });
      
      const categories = await marketIntelligenceService.discoverEmergingCategories('dental');

      expect(categories.length).toBeGreaterThan(0);
      if (categories.length > 0) {
        expect(categories[0]).toMatchObject({
          name: expect.any(String),
          confidence: expect.any(Number),
          relatedTerms: expect.any(Array),
          marketPotential: expect.stringMatching(/high|medium|low/)
        });
      }

      // Should make multiple search queries
      expect(axios.get).toHaveBeenCalledTimes(5); // Based on getIndustryTrendQueries
    });

    it('should rank and deduplicate categories', async () => {
      // Mock multiple searches returning overlapping categories
      (axios.get as any)
        .mockResolvedValueOnce({ data: mockSearchResults })
        .mockResolvedValueOnce({ data: mockSearchResults })
        .mockResolvedValue({ data: { web: { results: [] } } });

      const categories = await marketIntelligenceService.discoverEmergingCategories('aesthetic');

      // Should deduplicate and rank by confidence
      const categoryNames = categories.map(c => c.name);
      const uniqueNames = new Set(categoryNames);
      expect(categoryNames.length).toBe(uniqueNames.size);

      // Should be sorted by confidence
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i - 1].confidence).toBeGreaterThanOrEqual(categories[i].confidence);
      }
    });
  });

  describe('getCompetitiveIntelligence', () => {
    it('should gather competitive intelligence for a company', async () => {
      const companyName = 'DentalCorp';
      const result = await marketIntelligenceService.getCompetitiveIntelligence(
        companyName,
        'dental'
      );

      expect(result).toMatchObject({
        company: companyName,
        insights: {
          recentNews: expect.any(Array),
          productLaunches: expect.any(Array),
          marketPosition: expect.stringMatching(/Market Leader|Market Challenger|Niche Player/),
          innovations: expect.any(Array),
          sentiment: expect.objectContaining({
            overall: expect.stringMatching(/positive|neutral|negative/)
          })
        }
      });

      // Should make multiple queries for different aspects
      expect(axios.get).toHaveBeenCalledTimes(4);
    });

    it('should extract innovations from competitive data', async () => {
      const result = await marketIntelligenceService.getCompetitiveIntelligence(
        'TechDental',
        'dental'
      );

      // Based on mock data mentioning "AI" and "intelligence"
      expect(result.insights.innovations.length).toBeGreaterThan(0);
      expect(result.insights.innovations.some(innovation => 
        innovation.toLowerCase().includes('artificial intelligence') || 
        innovation.toLowerCase().includes('ai')
      )).toBe(true);
    });
  });

  describe('getProcedureTrends', () => {
    it('should analyze trends for a specific procedure', async () => {
      const result = await marketIntelligenceService.getProcedureTrends(
        'dental implants',
        'dental'
      );

      expect(result).toMatchObject({
        trends: expect.any(Array),
        relatedProcedures: expect.any(Array),
        marketOutlook: expect.any(String),
        innovations: expect.any(Array)
      });

      // Should make queries for different trend aspects
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.stringContaining('dental implants')
          })
        })
      );
    });

    it('should determine market outlook based on sentiment and growth', async () => {
      // Mock positive results with high growth
      (axios.get as any).mockResolvedValue({
        data: {
          web: {
            results: [
              {
                title: 'Procedure shows 25% growth',
                description: 'Breakthrough success in treatment outcomes',
                url: 'https://example.com'
              }
            ]
          }
        }
      });

      const result = await marketIntelligenceService.getProcedureTrends(
        'laser therapy',
        'aesthetic'
      );

      expect(result.marketOutlook).toBe('Strong Growth Expected');
    });
  });

  describe('Helper Methods', () => {
    it('should extract domain from URL correctly', () => {
      const service = marketIntelligenceService as any;
      
      expect(service.extractDomain('https://www.example.com/page')).toBe('example.com');
      expect(service.extractDomain('http://subdomain.example.co.uk')).toBe('subdomain.example.co.uk');
      expect(service.extractDomain('invalid-url')).toBe('unknown');
    });

    it('should format category names correctly', () => {
      const service = marketIntelligenceService as any;
      
      expect(service.formatCategoryName('dental implants')).toBe('Dental Implants');
      expect(service.formatCategoryName('ai technology')).toBe('Ai Technology');
    });

    it('should extract timeframe from text', () => {
      const service = marketIntelligenceService as any;
      
      expect(service.extractTimeframe('growth in 2025')).toBe('2025');
      expect(service.extractTimeframe('last year trends')).toBe('last year');
      expect(service.extractTimeframe('no timeframe mentioned')).toBe('recent');
    });
  });
});