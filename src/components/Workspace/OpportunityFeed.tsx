import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Avatar,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Speed,
  NewReleases,
  Groups,
  AutoAwesome,
  CheckCircle,
  AccessTime,
  Bookmark,
  BookmarkBorder,
  Share,
  MoreVert,
  FilterList,
  SortRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { galaxyDataService, SalesOpportunity } from '../../services/galaxyDataService';

interface EnhancedOpportunity extends SalesOpportunity {
  account?: string;
  daysRemaining?: number;
  competitors?: string[];
  keyContacts?: string[];
  nextStep?: string;
  saved?: boolean;
}

const OpportunityFeed: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [opportunities, setOpportunities] = useState<EnhancedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high-value' | 'closing-soon' | 'new'>('all');

  // Mock enhanced opportunities
  const mockOpportunities: EnhancedOpportunity[] = [
    {
      id: 'opp1',
      type: 'NEW_ACCOUNT',
      title: 'Digital Dentistry Expansion - Elite Dental',
      description: 'Elite Dental Partners looking to upgrade to full digital workflow. High interest in CAD/CAM systems and intraoral scanners.',
      potential_revenue: 285000,
      probability: 0.75,
      urgency_score: 90,
      recommended_actions: [
        'Schedule in-person demo of latest scanner',
        'Prepare ROI analysis for digital workflow',
        'Invite to upcoming digital dentistry workshop'
      ],
      account: 'Elite Dental Partners',
      daysRemaining: 12,
      competitors: ['CompetitorX', 'TechDent Solutions'],
      keyContacts: ['Dr. Sarah Johnson', 'Mark Chen (CFO)'],
      nextStep: 'Demo scheduled for next Tuesday',
      saved: true
    },
    {
      id: 'opp2',
      type: 'CROSS_SELL',
      title: 'Injectable Bundle Opportunity - Aesthetic Excellence',
      description: 'Current Botox customer interested in expanding to full injectable portfolio including fillers and biostimulators.',
      potential_revenue: 156000,
      probability: 0.85,
      urgency_score: 75,
      recommended_actions: [
        'Present new product portfolio',
        'Offer training package',
        'Discuss volume discounts'
      ],
      account: 'Aesthetic Excellence Group',
      daysRemaining: 8,
      keyContacts: ['Dr. Maria Rodriguez'],
      nextStep: 'Waiting for approval from practice manager'
    },
    {
      id: 'opp3',
      type: 'COMPETITIVE_DISPLACEMENT',
      title: 'Competitor Vulnerability - Miami Beach Aesthetics',
      description: 'Customer unhappy with current vendor support. Opportunity to switch their entire laser equipment line.',
      potential_revenue: 425000,
      probability: 0.60,
      urgency_score: 95,
      recommended_actions: [
        'Emphasize our 24/7 support',
        'Offer equipment trade-in program',
        'Provide comparison chart vs competitor'
      ],
      account: 'Miami Beach Aesthetics',
      daysRemaining: 5,
      competitors: ['Current: LaserCorp'],
      keyContacts: ['Dr. James Wilson', 'Lisa Park (Operations)'],
      nextStep: 'Emergency meeting requested by customer'
    },
    {
      id: 'opp4',
      type: 'UPSELL',
      title: 'Clear Aligner System Upgrade - Smile Innovations',
      description: 'Existing aligner customer ready to upgrade to premium tier with advanced features and better margins.',
      potential_revenue: 98000,
      probability: 0.90,
      urgency_score: 65,
      recommended_actions: [
        'Demo new AI treatment planning',
        'Show case success stories',
        'Calculate increased revenue potential'
      ],
      account: 'Smile Innovations',
      daysRemaining: 20,
      keyContacts: ['Dr. Kevin Lee'],
      nextStep: 'Contract review in progress'
    }
  ];

  useEffect(() => {
    // Simulate loading real opportunities
    setTimeout(() => {
      setOpportunities(mockOpportunities);
      setLoading(false);
    }, 1000);
  }, []);

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'NEW_ACCOUNT': return <Groups color="primary" />;
      case 'CROSS_SELL': return <AutoAwesome color="secondary" />;
      case 'UPSELL': return <TrendingUp color="success" />;
      case 'COMPETITIVE_DISPLACEMENT': return <NewReleases color="error" />;
      default: return <AttachMoney />;
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    return 'info';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    switch (filter) {
      case 'high-value':
        return opp.potential_revenue > 200000;
      case 'closing-soon':
        return (opp.daysRemaining || 30) <= 10;
      case 'new':
        return opp.type === 'NEW_ACCOUNT';
      default:
        return true;
    }
  });

  const totalPipeline = opportunities.reduce((sum, opp) => sum + opp.potential_revenue, 0);
  const weightedPipeline = opportunities.reduce((sum, opp) => 
    sum + (opp.potential_revenue * opp.probability), 0
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Opportunity Pipeline
        </Typography>
        
        {/* Pipeline Summary */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Pipeline
              </Typography>
              <Typography variant="h4">
                ${(totalPipeline / 1000000).toFixed(2)}M
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Weighted Value
              </Typography>
              <Typography variant="h4">
                ${(weightedPipeline / 1000000).toFixed(2)}M
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Opportunities
              </Typography>
              <Typography variant="h4">
                {opportunities.length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Filters */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterList sx={{ color: 'text.secondary' }} />
          <Chip
            label="All"
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label="High Value"
            onClick={() => setFilter('high-value')}
            color={filter === 'high-value' ? 'primary' : 'default'}
            size="small"
            icon={<AttachMoney />}
          />
          <Chip
            label="Closing Soon"
            onClick={() => setFilter('closing-soon')}
            color={filter === 'closing-soon' ? 'primary' : 'default'}
            size="small"
            icon={<AccessTime />}
          />
          <Chip
            label="New Accounts"
            onClick={() => setFilter('new')}
            color={filter === 'new' ? 'primary' : 'default'}
            size="small"
            icon={<Groups />}
          />
        </Stack>
      </Box>

      {/* Opportunities List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence>
          <Stack spacing={2}>
            {filteredOpportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  elevation={opp.urgency_score > 80 ? 4 : 1}
                  sx={{
                    position: 'relative',
                    borderLeft: `4px solid ${theme.palette[getUrgencyColor(opp.urgency_score)].main}`,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'background.paper', mr: 2 }}>
                        {getOpportunityIcon(opp.type)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {opp.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {opp.description}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const updatedOpp = { ...opp, saved: !opp.saved };
                            setOpportunities(prev => 
                              prev.map(o => o.id === opp.id ? updatedOpp : o)
                            );
                          }}
                        >
                          {opp.saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
                        </IconButton>
                        <IconButton size="small">
                          <Share />
                        </IconButton>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Stack>
                    </Box>

                    {/* Metrics */}
                    <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="h5" color="primary">
                          ${(opp.potential_revenue / 1000).toFixed(0)}k
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Potential Revenue
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="h5">
                          {(opp.probability * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Probability
                        </Typography>
                      </Box>

                      {opp.daysRemaining && (
                        <Box>
                          <Typography 
                            variant="h5" 
                            color={opp.daysRemaining <= 7 ? 'error' : 'text.primary'}
                          >
                            {opp.daysRemaining}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Days Left
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">Progress</Typography>
                        <Typography variant="caption">
                          {Math.round(opp.probability * 100)}% Complete
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={opp.probability * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Key Info Chips */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      {opp.account && (
                        <Chip 
                          label={opp.account} 
                          size="small" 
                          icon={<Business />}
                        />
                      )}
                      {opp.keyContacts?.map(contact => (
                        <Chip 
                          key={contact}
                          label={contact} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {opp.competitors?.map(comp => (
                        <Chip 
                          key={comp}
                          label={comp} 
                          size="small" 
                          color="error"
                          variant="outlined"
                        />
                      ))}
                    </Stack>

                    {/* Next Step Alert */}
                    {opp.nextStep && (
                      <Alert 
                        severity="info" 
                        icon={<Speed />}
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2">
                          <strong>Next:</strong> {opp.nextStep}
                        </Typography>
                      </Alert>
                    )}

                    {/* Recommended Actions */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommended Actions
                      </Typography>
                      <Stack spacing={1}>
                        {opp.recommended_actions.slice(0, 2).map((action, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle 
                              sx={{ 
                                fontSize: 16, 
                                color: 'text.secondary',
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2">
                              {action}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" size="small">
                        View Details
                      </Button>
                      <Button variant="outlined" size="small">
                        Update Status
                      </Button>
                      <Button variant="text" size="small">
                        Add Note
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Stack>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default OpportunityFeed;