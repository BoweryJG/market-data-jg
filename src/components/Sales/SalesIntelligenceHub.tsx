import React, { useState, useMemo } from 'react';
import { categorizeProcedure } from '../Dashboard/CategoryMapping';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
  Avatar,
  Divider,
  Rating,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Shield,
  EmojiEvents,
  Warning,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  Psychology,
  Lightbulb,
  AttachMoney,
  Speed,
  Group,
  Star,
  ThumbUp,
  ThumbDown,
  CompareArrows,
  LocalOffer,
  Timeline,
  Assessment,
  QuestionAnswer,
  BookmarkBorder,
  Bookmark,
  Share,
  Edit,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface BattlecardProps {
  competitor: string;
  product: string;
  category?: 'dental' | 'aesthetic';
  ourStrengths: string[];
  theirStrengths: string[];
  objections: { question: string; response: string }[];
  winRate: number;
  saved?: boolean;
}

const Battlecard: React.FC<BattlecardProps> = ({
  competitor,
  product,
  category,
  ourStrengths,
  theirStrengths,
  objections,
  winRate,
  saved = false,
}) => {
  const theme = useTheme();
  const [isSaved, setIsSaved] = useState(saved);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {competitor} - {product}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              {category && (
                <Chip
                  size="small"
                  label={category.charAt(0).toUpperCase() + category.slice(1)}
                  color={category === 'dental' ? 'info' : 'secondary'}
                  variant="outlined"
                />
              )}
              <Chip
                size="small"
                label={`Win Rate: ${winRate}%`}
                color={winRate >= 60 ? 'success' : winRate >= 40 ? 'warning' : 'error'}
                icon={<EmojiEvents />}
              />
              <Chip
                size="small"
                label={`${objections.length} Objections`}
                icon={<QuestionAnswer />}
              />
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => {}}>
              {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.success.light + '10' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                <ThumbUp sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                Our Advantages
              </Typography>
              <List dense>
                {ourStrengths.map((strength, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.error.light + '10' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                <ThumbDown sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                Their Advantages
              </Typography>
              <List dense>
                {theirStrengths.map((strength, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Cancel color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight="medium">
              Common Objections & Responses
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {objections.map((obj, index) => (
              <Box key={index} mb={2}>
                <Alert severity="warning" icon={<Psychology />} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    "{obj.question}"
                  </Typography>
                </Alert>
                <Alert severity="success" icon={<Lightbulb />}>
                  <Typography variant="body2">{obj.response}</Typography>
                </Alert>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

interface WinLossData {
  reason: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  count: number;
}

const WinLossAnalysis: React.FC = () => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('quarter');

  const winReasons: WinLossData[] = [
    { reason: 'Superior Technology', percentage: 35, trend: 'up', count: 42 },
    { reason: 'Better Pricing', percentage: 28, trend: 'stable', count: 34 },
    { reason: 'Customer Service', percentage: 22, trend: 'up', count: 26 },
    { reason: 'Existing Relationship', percentage: 15, trend: 'down', count: 18 },
  ];

  const lossReasons: WinLossData[] = [
    { reason: 'Price Too High', percentage: 40, trend: 'up', count: 28 },
    { reason: 'Missing Features', percentage: 25, trend: 'stable', count: 18 },
    { reason: 'Competitor Relationship', percentage: 20, trend: 'down', count: 14 },
    { reason: 'Poor Timing', percentage: 15, trend: 'stable', count: 11 },
  ];

  const renderReasonsList = (reasons: WinLossData[], type: 'win' | 'loss') => {
    return reasons.map((reason, index) => (
      <Box key={index} mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1">{reason.reason}</Typography>
            {reason.trend === 'up' && <TrendingUp color="success" fontSize="small" />}
            {reason.trend === 'down' && <TrendingDown color="error" fontSize="small" />}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={`${reason.count} deals`} size="small" />
            <Typography variant="body2" fontWeight="bold">
              {reason.percentage}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={reason.percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: type === 'win' ? theme.palette.success.main : theme.palette.error.main,
            },
          }}
        />
      </Box>
    ));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Win/Loss Analysis
        </Typography>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={(_, value) => value && setTimeframe(value)}
          size="small"
        >
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="quarter">Quarter</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h6">Win Reasons</Typography>
                  <Typography variant="body2" color="text.secondary">
                    120 wins this {timeframe}
                  </Typography>
                </Box>
              </Box>
              {renderReasonsList(winReasons, 'win')}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Avatar sx={{ backgroundColor: theme.palette.error.main }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6">Loss Reasons</Typography>
                  <Typography variant="body2" color="text.secondary">
                    71 losses this {timeframe}
                  </Typography>
                </Box>
              </Box>
              {renderReasonsList(lossReasons, 'loss')}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }} icon={<Lightbulb />}>
        <Typography variant="subtitle2" fontWeight="bold">
          Key Insight: Price objections increased 15% this quarter
        </Typography>
        <Typography variant="body2">
          Consider offering flexible payment terms or emphasizing ROI in your pitch
        </Typography>
      </Alert>
    </Box>
  );
};

const CompetitivePricing: React.FC = () => {
  const theme = useTheme();

  const pricingData = [
    {
      product: 'Botox (50 units)',
      ourPrice: '$500',
      competitor1: { name: 'Allergan', price: '$550', diff: '+10%' },
      competitor2: { name: 'Merz', price: '$480', diff: '-4%' },
      competitor3: { name: 'Revance', price: '$520', diff: '+4%' },
    },
    {
      product: 'Dermal Filler (1ml)',
      ourPrice: '$600',
      competitor1: { name: 'Juvederm', price: '$650', diff: '+8%' },
      competitor2: { name: 'Restylane', price: '$580', diff: '-3%' },
      competitor3: { name: 'RHA', price: '$620', diff: '+3%' },
    },
    {
      product: 'Digital X-Ray System',
      ourPrice: '$45,000',
      competitor1: { name: 'Dexis', price: '$48,000', diff: '+7%' },
      competitor2: { name: 'Schick', price: '$43,000', diff: '-4%' },
      competitor3: { name: 'Carestream', price: '$46,000', diff: '+2%' },
    },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Competitive Pricing Matrix
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="center">Our Price</TableCell>
              <TableCell align="center">Allergan/Dexis</TableCell>
              <TableCell align="center">Merz/Schick</TableCell>
              <TableCell align="center">Revance/Carestream</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricingData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography fontWeight="medium">{row.product}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="primary">
                    {row.ourPrice}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography>{row.competitor1.price}</Typography>
                    <Chip
                      label={row.competitor1.diff}
                      size="small"
                      color={row.competitor1.diff.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography>{row.competitor2.price}</Typography>
                    <Chip
                      label={row.competitor2.diff}
                      size="small"
                      color={row.competitor2.diff.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography>{row.competitor3.price}</Typography>
                    <Chip
                      label={row.competitor3.diff}
                      size="small"
                      color={row.competitor3.diff.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={2} mt={3}>
        <Alert severity="success">
          <Typography variant="body2">
            <strong>Pricing Advantage:</strong> We're competitively priced for most products with room for negotiation
          </Typography>
        </Alert>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Watch Out:</strong> Merz/Schick consistently undercuts on price - emphasize quality and service
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};

const SalesIntelligenceHub: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<'all' | 'dental' | 'aesthetic'>('all');

  const battlecards: BattlecardProps[] = [
    {
      competitor: 'Allergan',
      product: 'Botox Cosmetic',
      category: 'aesthetic',
      ourStrengths: [
        'Lower price point',
        'Faster onset of action',
        'Longer shelf life',
        'Better customer support',
      ],
      theirStrengths: [
        'Market leader brand recognition',
        'Extensive clinical data',
        'Established provider network',
      ],
      objections: [
        {
          question: "Why should I switch from the market leader?",
          response: "While Allergan has strong brand recognition, our product offers faster onset (3-5 days vs 7-10 days) at a 10% lower cost. Plus, our dedicated support team provides 24/7 assistance and training.",
        },
        {
          question: "Is your product FDA approved?",
          response: "Yes, our product has full FDA approval with over 5 years of safety data. We also offer additional clinical studies showing comparable efficacy with improved patient satisfaction scores.",
        },
      ],
      winRate: 45,
    },
    {
      competitor: 'Invisalign',
      product: 'Clear Aligners',
      category: 'dental',
      ourStrengths: [
        '30% lower cost',
        'Faster treatment time',
        'No exclusive provider requirements',
        'Better margin for practices',
      ],
      theirStrengths: [
        'First mover advantage',
        'Consumer brand awareness',
        'Extensive case database',
      ],
      objections: [
        {
          question: "Patients specifically ask for Invisalign by name",
          response: "That's great brand awareness! We help practices educate patients that clear aligner technology has evolved. Our system offers the same results in 20% less time, and the cost savings allow practices to treat more patients.",
        },
        {
          question: "What about complex cases?",
          response: "Our AI-powered treatment planning handles complex cases with a 95% first-fit accuracy rate. Plus, unlimited refinements are included at no extra cost.",
        },
      ],
      winRate: 62,
    },
    {
      competitor: 'Juvederm',
      product: 'Dermal Fillers',
      category: 'aesthetic',
      ourStrengths: [
        '15% longer lasting results',
        'Lower injection force required',
        'Better patient comfort',
        'Competitive pricing',
      ],
      theirStrengths: [
        'Strong brand recognition',
        'Wide product portfolio',
        'Established training programs',
      ],
      objections: [
        {
          question: "Juvederm has been around longer, is it safer?",
          response: "Both products have excellent safety profiles. Our hyaluronic acid technology actually provides smoother injection and longer-lasting results, backed by 3+ years of clinical data.",
        },
        {
          question: "What about the learning curve?",
          response: "We provide comprehensive training and our product has similar injection techniques. Most practitioners are comfortable after just 2-3 cases.",
        },
      ],
      winRate: 58,
    },
    {
      competitor: 'Nobel Biocare',
      product: 'Dental Implants',
      category: 'dental',
      ourStrengths: [
        '25% better osseointegration',
        'Simplified surgical protocol',
        'Lower cost per unit',
        'Comprehensive prosthetic options',
      ],
      theirStrengths: [
        'Premium brand reputation',
        'Extensive research backing',
        'Global market presence',
      ],
      objections: [
        {
          question: "Nobel has the gold standard reputation",
          response: "While Nobel has a strong reputation, our latest surface technology shows 25% faster healing times in clinical studies. We offer the same quality at a better value proposition.",
        },
        {
          question: "What about compatibility with my current system?",
          response: "Our implants are compatible with most major prosthetic platforms, and we provide conversion guides for seamless integration.",
        },
      ],
      winRate: 52,
    },
  ];

  // Filter battlecards based on industry and search
  const filteredBattlecards = useMemo(() => {
    return battlecards.filter(card => {
      // Industry filter
      const matchesIndustry = industryFilter === 'all' || card.category === industryFilter;
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        card.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.competitor.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesIndustry && matchesSearch;
    });
  }, [battlecards, industryFilter, searchQuery]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Sales Intelligence Hub
        </Typography>
        <TextField
          placeholder="Search battlecards, competitors, products..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_: React.SyntheticEvent, value: number) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Battlecards" icon={<Shield />} iconPosition="start" />
          <Tab label="Win/Loss Analysis" icon={<Assessment />} iconPosition="start" />
          <Tab label="Competitive Pricing" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Market Trends" icon={<Timeline />} iconPosition="start" />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <Box mb={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1">Filter by:</Typography>
            <Chip 
              label={`All Products (${battlecards.length})`} 
              clickable 
              color={industryFilter === 'all' ? 'primary' : 'default'}
              onClick={() => setIndustryFilter('all')}
            />
            <Chip 
              label={`Dental (${battlecards.filter(c => c.category === 'dental').length})`} 
              clickable 
              color={industryFilter === 'dental' ? 'primary' : 'default'}
              onClick={() => setIndustryFilter('dental')}
            />
            <Chip 
              label={`Aesthetic (${battlecards.filter(c => c.category === 'aesthetic').length})`} 
              clickable 
              color={industryFilter === 'aesthetic' ? 'primary' : 'default'}
              onClick={() => setIndustryFilter('aesthetic')}
            />
          </Stack>
        </Box>
        
        {filteredBattlecards.length > 0 ? (
          filteredBattlecards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Battlecard {...card} />
            </motion.div>
          ))
        ) : (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No battlecards found for the selected filter
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Card>
        )}
        
        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
          Load More Battlecards
        </Button>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <WinLossAnalysis />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CompetitivePricing />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Market Trends & Insights
          </Typography>
          <Card>
            <CardContent>
              <Typography color="text.secondary" textAlign="center">
                Market trend analysis coming soon...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default SalesIntelligenceHub;