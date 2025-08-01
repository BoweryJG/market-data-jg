import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FeaturedProcedures } from '../components/procedures/FeaturedProcedures';
import { CategoriesList } from '../components/procedures/CategoriesList';
import { Category, Procedure } from '../types';
import { supabase } from '../services/supabaseClient';
import { logger } from '../services/logging/logger';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProcedures, setFeaturedProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('marketSize', { ascending: false })
          .limit(6);

        if (categoriesError) throw categoriesError;
        
        // Fetch featured procedures
        const { data: proceduresData, error: proceduresError } = await supabase
          .from('procedures')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(4);

        if (proceduresError) throw proceduresError;

        setCategories(categoriesData || []);
        setFeaturedProcedures(proceduresData || []);
      } catch (error) {
        logger.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" gutterBottom>
          Market Insights
        </Typography>
        <Typography variant={isMobile ? 'body1' : 'h5'} color="textSecondary" paragraph>
          Explore market trends, procedures, and industry data
        </Typography>
      </Box>

      <Box my={6}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h2" gutterBottom>
          Featured Procedures
        </Typography>
        <FeaturedProcedures procedures={featuredProcedures} />
      </Box>

      <Box my={6}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h2" gutterBottom>
          Browse by Category
        </Typography>
        <CategoriesList categories={categories} />
      </Box>
    </Container>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
