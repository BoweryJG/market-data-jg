import React from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Divider,
  Alert,
  useTheme,
  Button
} from '@mui/material';
import NewsCard from './NewsCard';
import { useNewsByProcedureCategory, NewsArticle } from '../../services/newsService';

interface CategoryNewsSectionProps {
  categoryId: number | string;
  categoryName: string;
  industry: 'dental' | 'aesthetic';
  limit?: number;
}

// Mock data for dental news articles
const mockDentalNews: NewsArticle[] = [
  {
    id: 1,
    title: 'New Study Shows Preventive Dental Care Reduces Healthcare Costs',
    summary: 'Research indicates regular dental check-ups can significantly reduce overall healthcare expenses by preventing serious conditions.',
    image_url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-05-15',
    source: 'Dental Health Journal',
    author: 'Dr. Sarah Johnson',
    url: 'https://example.com/dental-care-costs',
    industry: 'dental'
  },
  {
    id: 2,
    title: 'Advances in Preventive Dentistry: New Technologies for Early Detection',
    summary: 'Cutting-edge technologies are revolutionizing how dentists detect and prevent dental issues before they become serious problems.',
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-06-22',
    source: 'Dental Technology Review',
    author: 'Michael Chen',
    url: 'https://example.com/preventive-dentistry-tech',
    industry: 'dental'
  },
  {
    id: 3,
    title: 'The Impact of Preventive Dental Programs in Schools',
    summary: 'School-based dental programs are showing promising results in improving children\'s dental health and establishing lifelong habits.',
    image_url: 'https://images.unsplash.com/photo-1595003500447-88ce9a0c0144?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-04-10',
    source: 'Public Health Today',
    author: 'Lisa Rodriguez',
    url: 'https://example.com/school-dental-programs',
    industry: 'dental'
  }
];

// Mock data for aesthetic news articles
const mockAestheticNews: NewsArticle[] = [
  {
    id: 4,
    title: 'Minimally Invasive Procedures Dominate Aesthetic Market Growth',
    summary: 'Non-surgical treatments continue to see unprecedented growth as patients seek effective results with minimal downtime.',
    image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-07-05',
    source: 'Aesthetic Medicine Today',
    author: 'Dr. Emily Parker',
    url: 'https://example.com/minimally-invasive-growth',
    industry: 'aesthetic'
  },
  {
    id: 5,
    title: 'New Fillers Promise Longer-Lasting Results with Fewer Side Effects',
    summary: 'The latest generation of dermal fillers offers improved longevity and a reduced risk profile, according to clinical trials.',
    image_url: 'https://images.unsplash.com/photo-1571942676516-bcab84649e44?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-08-12',
    source: 'Cosmetic Surgery Journal',
    author: 'Dr. James Wilson',
    url: 'https://example.com/new-fillers-research',
    industry: 'aesthetic'
  },
  {
    id: 6,
    title: 'Consumer Trends: Millennials Drive Demand for Preventative Aesthetic Treatments',
    summary: 'Younger patients are increasingly seeking early intervention treatments to prevent signs of aging rather than correcting them later.',
    image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000&auto=format&fit=crop',
    published_date: '2023-06-30',
    source: 'Beauty Industry Report',
    author: 'Alexandra Kim',
    url: 'https://example.com/millennial-aesthetic-trends',
    industry: 'aesthetic'
  }
];

const CategoryNewsSection: React.FC<CategoryNewsSectionProps> = ({ 
  categoryId, 
  categoryName, 
  industry,
  limit = 3
}) => {
  const theme = useTheme();
  
  // Use the custom hook to fetch news by procedure category
  const { 
    articles, 
    loading, 
    error 
  } = useNewsByProcedureCategory(categoryId, limit);
  
  // Determine which mock data to use if needed
  const mockArticles = industry === 'dental' ? mockDentalNews : mockAestheticNews;
  
  // Use real data if available, otherwise fall back to mock data
  const displayArticles = articles.length > 0 ? articles : mockArticles;
  
  // Use mock data when no real data is available

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          {categoryName}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <NewsCard industry={industry} loading />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <NewsCard
                  {...article}
                  industry={industry}
                />
              </Grid>
            ))}
          </Grid>
          
          {displayArticles.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No news articles found for this category.
              </Typography>
            </Box>
          )}
          {displayArticles.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ borderRadius: theme.shape.borderRadius, mt: 2 }}
                onClick={() => { /* View More button clicked */ }}
              >
                View More {categoryName} News
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

CategoryNewsSection.displayName = 'CategoryNewsSection';

export default CategoryNewsSection;
