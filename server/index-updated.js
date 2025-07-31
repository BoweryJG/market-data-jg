import { logger } from '@/services/logging/logger';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const { createHealthCheckMiddleware } = require('./health-check');
const {
  generalLimiter,
  authLimiter,
  aiLimiter,
  validateInput,
  corsOptions,
  securityHeaders,
  sanitizeRequest,
  errorHandler,
  helmet,
  mongoSanitize,
  xssFilter,
  hpp
} = require('./middleware/security');

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Apply security middleware first
app.use(helmet);
app.use(securityHeaders);

// CORS with security configuration
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize);
app.use(xssFilter);
app.use(hpp);
app.use(sanitizeRequest);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Setup comprehensive health checks
const healthCheckService = createHealthCheckMiddleware(app);

// Setup logging handler
const LoggingHandler = require('./logging-handler');
const loggingHandler = new LoggingHandler();
app.use(loggingHandler.createMiddleware());

// Schedule cleanup of old logs daily
setInterval(() => {
  loggingHandler.cleanupOldLogs(30); // Keep logs for 30 days
}, 24 * 60 * 60 * 1000);

// Log server startup
logger.info('Starting news proxy service with enhanced security...');
logger.info('Environment:', process.env.NODE_ENV || 'development');
logger.info('Port:', port);

// Apply auth rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Apply AI rate limiting to AI/search routes
app.use('/api/ai', aiLimiter);
app.use('/api/search', aiLimiter);

// Endpoint to fetch news by procedure category
app.get('/api/news/procedure-category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 4 } = req.query;
    
    const cacheKey = `news-procedure-${categoryId}-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Procedure categories mapping
    const categoryQueries = {
      // Aesthetic categories
      '1': 'botox cosmetic injections trends market',
      '2': 'dermal fillers hyaluronic acid market trends',
      '3': 'laser skin resurfacing treatments innovations',
      '4': 'chemical peels skincare treatments trends',
      '5': 'microneedling skin rejuvenation market',
      '6': 'IPL photofacial treatments innovations',
      '7': 'body contouring coolsculpting market trends',
      '8': 'hair removal laser treatments market',
      // Add more mappings as needed
    };
    
    const query = categoryQueries[categoryId] || 'aesthetic medical procedures market trends';
    
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    
    if (!BRAVE_API_KEY) {
      logger.error('BRAVE_API_KEY is not configured');
      return res.status(500).json({ error: 'News service not configured' });
    }
    
    logger.info(`Fetching news for category ${categoryId} with query: ${query}`);
    
    const response = await axios.get('https://api.search.brave.com/res/v1/news/search', {
      params: {
        q: query,
        count: parseInt(limit),
        freshness: 'pw', // Past week
        text_decorations: false,
        spellcheck: false
      },
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });
    
    const newsData = response.data.results || [];
    
    // Transform the data to match expected format
    const transformedData = newsData.map(item => ({
      title: item.title,
      description: item.description || item.extra_snippets?.[0] || '',
      url: item.url,
      source: item.meta_url?.hostname || new URL(item.url).hostname,
      publishedAt: item.age || 'Recently',
      thumbnail: item.thumbnail?.src || null,
      category: `Category ${categoryId}`,
      relevance: item.relevance_score || 0.8
    }));
    
    // Cache the results
    cache.set(cacheKey, transformedData);
    
    res.json(transformedData);
  } catch (error) {
    logger.error('Error fetching news:', error.message);
    if (error.response) {
      logger.error('API Response:', error.response.status, error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch news', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Endpoint to fetch top news by multiple procedure categories
app.get('/api/news/top-by-procedure-categories', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const categories = ['1', '2', '3', '4', '5']; // Top aesthetic categories
    
    const cacheKey = `news-top-categories-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const newsPromises = categories.map(async (categoryId) => {
      try {
        const response = await axios.get(`http://localhost:${port}/api/news/procedure-category/${categoryId}`, {
          params: { limit: 2 } // Get 2 articles per category
        });
        return response.data;
      } catch (error) {
        logger.error(`Failed to fetch news for category ${categoryId}:`, error.message);
        return [];
      }
    });
    
    const allNews = await Promise.all(newsPromises);
    const flattenedNews = allNews.flat();
    
    // Sort by relevance and take top items
    const topNews = flattenedNews
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, parseInt(limit) * categories.length);
    
    // Cache the results
    cache.set(cacheKey, topNews);
    
    res.json(topNews);
  } catch (error) {
    logger.error('Error fetching top news:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch top news',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generic news endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { q = 'medical aesthetic procedures market trends 2025', limit = 10 } = req.query;
    
    const cacheKey = `news-generic-${q}-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    
    if (!BRAVE_API_KEY) {
      logger.error('BRAVE_API_KEY is not configured');
      return res.status(500).json({ error: 'News service not configured' });
    }
    
    const response = await axios.get('https://api.search.brave.com/res/v1/news/search', {
      params: {
        q,
        count: parseInt(limit),
        freshness: 'pm', // Past month
        text_decorations: false,
        spellcheck: false
      },
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });
    
    const newsData = response.data.results || [];
    
    // Transform the data
    const transformedData = newsData.map(item => ({
      title: item.title,
      description: item.description || item.extra_snippets?.[0] || '',
      url: item.url,
      source: item.meta_url?.hostname || new URL(item.url).hostname,
      publishedAt: item.age || 'Recently',
      thumbnail: item.thumbnail?.src || null,
      relevance: item.relevance_score || 0.8
    }));
    
    // Cache the results
    cache.set(cacheKey, transformedData);
    
    res.json(transformedData);
  } catch (error) {
    logger.error('Error fetching generic news:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`News proxy service running on port ${port} with enhanced security`);
});