import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Paper, Button, alpha, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Favorite, AutoAwesome, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FeaturedProcedures } from '../components/procedures/FeaturedProcedures';
import { CategoriesList } from '../components/procedures/CategoriesList';
import { Category, Procedure } from '../types';
import { supabase } from '../services/supabaseClient';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProcedures, setFeaturedProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();
  const navigate = useNavigate();
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
        console.error('Error fetching data:', error);
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

      {/* Market Pulse Engine Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 4,
            mb: 6,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Favorite sx={{ fontSize: 40, color: theme.palette.error.main }} />
              </motion.div>
              <Typography variant="overline" color="primary" fontWeight="bold">
                NEW: Revolutionary Market Intelligence
              </Typography>
            </Box>
            
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
              Market Pulse Engine™
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px' }}>
              Experience market data like never before. Live body heatmaps, revenue-per-minute calculations, 
              and opportunity detection powered by exclusive Florida market analysis.
            </Typography>
            
            <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2} flexWrap="wrap">
              <Chip
                icon={<AutoAwesome />}
                label="Market Velocity Score"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUp />}
                label="Florida Effect™ Analysis"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label="Revenue/Minute Calculator"
                variant="outlined"
              />
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/pulse')}
              sx={{ mt: 3 }}
              endIcon={<AutoAwesome />}
            >
              Launch Market Pulse Engine
            </Button>
          </Box>
          
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              filter: 'blur(40px)'
            }}
          />
        </Paper>
      </motion.div>

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

export default HomePage;
