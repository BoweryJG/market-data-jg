import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { logger } from './logging/logger';
import { handleUnknownError } from '../types/errors';
import { getErrorMessage } from '../utils/errorUtils';

// Types
export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content?: string;
  image_url?: string;
  published_date: string;
  source: string;
  author?: string;
  url?: string;
  industry: 'dental' | 'aesthetic';
  featured?: boolean;
}

export interface NewsCategory {
  id: number;
  name: string;
  industry: 'dental' | 'aesthetic';
}

export interface ProcedureCategory {
  id: number;
  category_name: string;
  applicable_to: 'dental' | 'aesthetic' | 'both';
  market_size_usd_millions: number;
  avg_growth_rate: number;
}

export interface NewsByProcedureCategory {
  procedure_category: ProcedureCategory;
  articles: NewsArticle[];
}

// Hook to fetch news articles by industry
export const useNewsByIndustry = (industry: 'dental' | 'aesthetic', limit: number = 10) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('industry', industry)
          .order('published_date', { ascending: false })
          .limit(limit);
        
        if (fetchError) throw fetchError;
        
        setArticles(data || []);
      } catch (err: unknown) {
        const error = handleUnknownError(err);
        logger.error('Error fetching industry news', { industry, error: getErrorMessage(error) });
        setError(error.message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [industry, limit]);

  return { articles, loading, error };
};

// Helper function to return a placeholder image for an article
export const getPlaceholderImage = (title: string): string => {
  // Array of placeholder images
  const placeholderImages = [
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595003500447-88ce9a0c0144?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571942676516-bcab84649e44?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1000&auto=format&fit=crop'
  ];
  
  // Use a hash of the title to select a consistent image for the same title
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % placeholderImages.length;
  
  return placeholderImages[index];
};

// Hook to fetch real-time news for a specific procedure
export const useRealtimeNewsByProcedure = (
  procedureId: string,
  limit: number = 5
) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtimeNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const NEWS_PROXY_URL = process.env.NODE_ENV === 'production'
          ? 'https://repspheres-news-proxy.onrender.com'
          : 'http://localhost:3001';

        const response = await axios.get(
          `${NEWS_PROXY_URL}/api/news/realtime/${procedureId}?limit=${limit}`
        );

        const items = response.data?.results || [];
        const formatted = items.map((item: any, idx: number) => ({
          id: idx,
          title: item.title,
          summary: item.description || '',
          image_url: item.image_url || getPlaceholderImage(item.title),
          published_date: item.published || new Date().toISOString(),
          source: item.source?.title || item.source || 'Brave',
          author: item.author,
          url: item.url,
          industry: 'dental'
        }));

        setArticles(formatted);
      } catch (err: unknown) {
        const error = handleUnknownError(err);
        logger.error('Error fetching real-time news for procedure', { procedureId, error: getErrorMessage(err) });
        setError((err as Error).message || 'Failed to fetch real-time news');
      } finally {
        setLoading(false);
      }
    };

    fetchRealtimeNews();
  }, [procedureId, limit]);

  return { articles, loading, error };
};

// Hook to fetch news by procedure category
export const useNewsByProcedureCategory = (
  procedureCategoryId: number | string,
  limit: number = 5
) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsByProcedureCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the procedure category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('standardized_procedure_categories')
          .select('*')
          .eq('id', procedureCategoryId)
          .single();
        
        if (categoryError) throw categoryError;
        
        // Get the most recent articles for this industry
        // Instead of using the view, we'll directly query the news_articles table
        const { data: newsData, error: newsError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('industry', categoryData.applicable_to)
          .order('published_date', { ascending: false })
          .limit(limit);
        
        if (newsError) throw newsError;
        
        // Process the articles to ensure they have images and valid URLs
        const articlesWithImages = (newsData || []).map((article: NewsArticle) => {
          // Ensure image URL
          if (!article.image_url) {
            article.image_url = getPlaceholderImage(article.title);
          }
          
          // Ensure valid URL
          if (!article.url || !article.url.startsWith('http')) {
            if (article.industry === 'dental') {
              article.url = 'https://www.dentistrytoday.com/news/';
            } else {
              article.url = 'https://www.plasticsurgery.org/news/';
            }
          }
          
          return article;
        });
        
        setArticles(articlesWithImages);
      } catch (err: unknown) {
        const error = handleUnknownError(err);
        logger.error('Error fetching news for procedure category', { procedureCategoryId, error: getErrorMessage(err) });
        setError((err as Error).message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsByProcedureCategory();
  }, [procedureCategoryId, limit]);

  return { articles, loading, error };
};

// Hook to fetch top procedure categories with news
export const useTopProcedureCategoriesWithNews = (
  industry: 'dental' | 'aesthetic',
  limit: number = 3
) => {
  const [categories, setCategories] = useState<ProcedureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const NEWS_PROXY_URL = process.env.NODE_ENV === 'production' 
          ? 'https://repspheres-news-proxy.onrender.com' 
          : 'http://localhost:3001';

        // Get top procedure categories by market size
        const { data: categoryData, error: categoryError } = await supabase
          .from('standardized_procedure_categories')
          .select('*')
          .eq('applicable_to', industry)
          .order('market_size_usd_millions', { ascending: false })
          .limit(limit);
        
        if (categoryError) throw categoryError;
        
        setCategories(categoryData || []);
      } catch (err: unknown) {
        const error = handleUnknownError(err);
        logger.error('Error fetching top industry categories', { industry, error: getErrorMessage(err) });
        setError((err as Error).message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, [industry, limit]);

  return { categories, loading, error };
};

// Function to fetch featured news
export const fetchFeaturedNews = async (limit: number = 5): Promise<NewsArticle[]> => {
  try {
    // Get the most recent articles, prioritizing featured ones
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(limit * 2); // Get more than needed to ensure we have enough after filtering
    
    if (error) throw error;
    
    // Process the articles to ensure they have images and valid URLs
    const articlesWithImages = (data || []).map((article: NewsArticle) => {
      // Ensure image URL
      if (!article.image_url) {
        article.image_url = getPlaceholderImage(article.title);
      }
      
      // Ensure valid URL
      if (!article.url || !article.url.startsWith('http')) {
        if (article.industry === 'dental') {
          article.url = 'https://www.dentistrytoday.com/news/';
        } else {
          article.url = 'https://www.plasticsurgery.org/news/';
        }
      }
      
      return article;
    }).slice(0, limit); // Limit to the requested number
    
    return articlesWithImages;
  } catch (err) {
    logger.error('Error fetching featured news', { error: getErrorMessage(err) });
    return [];
  }
};
