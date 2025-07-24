import React from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import NewsCard from './NewsCard';
import { useRealtimeNewsByProcedure } from '../../services/newsService';

interface RealtimeNewsSectionProps {
  procedureId: string;
  procedureName: string;
  industry: 'dental' | 'aesthetic';
  limit?: number;
}

const RealtimeNewsSection: React.FC<RealtimeNewsSectionProps> = ({
  procedureId,
  procedureName,
  industry,
  limit = 5
}) => {
  const { articles, loading, error } = useRealtimeNewsByProcedure(procedureId, limit);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Latest News on {procedureName}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <NewsCard {...article} industry={industry} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

RealtimeNewsSection.displayName = 'RealtimeNewsSection';

export default RealtimeNewsSection;
