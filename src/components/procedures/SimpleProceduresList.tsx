import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Skeleton,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  AttachMoney,
  ExpandMore,
  ExpandLess,
  LocalHospital,
  Category as CategoryIcon,
  Login,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { supabase } from '../../services/supabaseClient';

interface Procedure {
  id: string;
  cpt_code: string;
  description: string;
  category: string;
  subcategory?: string;
  avg_cost?: number;
  volume?: number;
  growth_rate?: number;
}

export const SimpleProceduresList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('category', { ascending: true })
        .order('description', { ascending: true });

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredProcedures = procedures.filter(proc =>
    proc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proc.cpt_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedProcedures = filteredProcedures.reduce((acc, proc) => {
    if (!acc[proc.category]) {
      acc[proc.category] = [];
    }
    acc[proc.category].push(proc);
    return acc;
  }, {} as Record<string, Procedure[]>);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ 
          mb: 2, 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Medical Procedures Market Data
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
          Comprehensive list of 261 medical procedures with market insights
        </Typography>

        {/* CTA for logged out users */}
        {!user && (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Dashboard />}
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 3px 5px 2px rgba(123, 66, 246, .3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 2px rgba(123, 66, 246, .4)',
                },
              }}
            >
              Sign In for Advanced Analytics
            </Button>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Get market trends, growth rates, competitor insights, and more
            </Typography>
          </Box>
        )}

        {/* Welcome message for logged in users */}
        {user && (
          <Alert severity="success" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Welcome back! Access your advanced analytics from the navigation menu above.
          </Alert>
        )}
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 4, background: 'rgba(255,255,255,0.05)' }}>
        <TextField
          fullWidth
          placeholder="Search procedures by name, CPT code, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.03)',
            },
          }}
        />
      </Paper>

      {/* Procedures List */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {Object.entries(groupedProcedures).map(([category, procs]) => (
            <Card
              key={category}
              sx={{
                mb: 3,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleCategory(category)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ color: '#00ffc6' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category}
                    </Typography>
                    <Chip
                      label={`${procs.length} procedures`}
                      size="small"
                      sx={{ background: 'rgba(0,255,198,0.1)' }}
                    />
                  </Box>
                  <IconButton>
                    {expandedCategories.has(category) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={expandedCategories.has(category)} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      {procs.map((proc) => (
                        <Grid item xs={12} md={6} key={proc.id}>
                          <Paper
                            sx={{
                              p: 2,
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.05)',
                                borderColor: 'rgba(0,255,198,0.3)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {proc.description}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  CPT: {proc.cpt_code}
                                </Typography>
                                {proc.subcategory && (
                                  <Chip
                                    label={proc.subcategory}
                                    size="small"
                                    sx={{ mt: 1, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                              {user && (
                                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                  <Chip
                                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                                    label="Analytics"
                                    size="small"
                                    clickable
                                    onClick={() => navigate('/dashboard')}
                                    sx={{
                                      background: 'rgba(123,66,246,0.1)',
                                      '&:hover': { background: 'rgba(123,66,246,0.2)' },
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Bottom CTA */}
      {!user && (
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Paper sx={{ p: 4, background: 'rgba(123,66,246,0.1)', border: '1px solid rgba(123,66,246,0.3)' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to unlock advanced market intelligence?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Get detailed analytics, growth trends, competitor insights, and AI-powered recommendations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
                color: 'white',
                px: 4,
                py: 1.5,
              }}
            >
              Sign In to Get Started
            </Button>
          </Paper>
        </Box>
      )}
    </Container>
  );
};