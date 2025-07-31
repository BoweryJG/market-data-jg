import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
  Skeleton
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { logger } from '../services/logging/logger';


interface NewsCardProps {
  id?: number;
  title?: string;
  summary?: string;
  image_url?: string;
  published_date?: string;
  source?: string;
  author?: string;
  url?: string;
  industry: 'dental' | 'aesthetic';
  loading?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  summary,
  image_url,
  source,
  published_date,
  url,
  industry,
  author,
  loading = false
}) => {
  // Format the date
  const formattedDate = published_date ? 
    (typeof published_date === 'string' ? 
      format(parseISO(published_date), 'MMM d, yyyy') : 
      format(published_date, 'MMM d, yyyy')
    ) : '';

  const defaultImage = industry === 'dental' 
    ? 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop' 
    : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop';

  // Function to validate URL
  const isValidUrl = (urlString: string | undefined): boolean => {
    if (!urlString) return false;
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Only use URL if it's valid, otherwise prevent navigation
  const handleCardClick = (e: React.MouseEvent) => {
    if (!isValidUrl(url)) {
      e.preventDefault();
      logger.info('Invalid or missing URL');
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(4px)', animation: 'fadeIn 0.3s ease forwards', '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1, transform: 'none' } }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
      {loading ? (
        <>
          <Skeleton variant="rectangular" height={140} animation="wave" />
          <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" />
          </CardContent>
        </>
      ) : (
        <CardActionArea
          component="a"
          href={isValidUrl(url) ? url : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCardClick}
        >
          <CardMedia
            component="img"
            height="140"
            image={image_url || defaultImage}
            alt={title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {summary}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                {source} • {formattedDate}
              </Typography>
              <Chip
                label={industry === 'dental' ? 'Dental' : 'Aesthetic'}
                size="small"
                color={industry === 'dental' ? 'primary' : 'secondary'}
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
          </CardContent>
        </CardActionArea>
      )}
    </Card>
  );
};

NewsCard.displayName = 'NewsCard';

export default NewsCard;
