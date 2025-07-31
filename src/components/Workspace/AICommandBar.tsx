import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  Stack,
  Button,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Business,
  AttachMoney,
  LocationOn,
  Analytics,
  Campaign,
  AutoAwesome,
  Psychology,
  Send,
  Clear,
  History,
  Lightbulb,
  Timer
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import * as braveSearchService from '../../services/braveSearchService';
import { useAgentTimeLimit, useRepXTier } from '../../unified-auth';
import { RepXTier, TIER_NAMES } from '../../unified-auth/src/constants';

import { supabase } from '../../services/supabaseClient';
import { logger } from '../../services/logging/logger';

interface CommandResult {
  id: string;
  type: 'procedure' | 'company' | 'insight' | 'action' | 'data';
  title: string;
  description: string;
  data?: any;
  action?: () => void;
  icon: React.ReactNode;
  relevance?: number;
}

interface AICommandBarProps {
  onResultSelect?: (_result: CommandResult) => void;
  onClose?: () => void;
}

const AICommandBar: React.FC<AICommandBarProps> = ({ onResultSelect,  onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeUsed, setTimeUsed] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [queriesCount, setQueriesCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Unified auth hooks
  const { tier } = useRepXTier();
  const { timeLimit, isUnlimited } = useAgentTimeLimit();

  // Load recent queries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_command_recent');
    if (saved) {
      setRecentQueries(JSON.parse(saved));
    }
    
    // Start session timer on mount
    setSessionStartTime(Date.now());
  }, []);
  
  // Update timer every second
  useEffect(() => {
    if (sessionStartTime && !isUnlimited && !sessionExpired) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setTimeUsed(elapsed);
        
        if (elapsed >= timeLimit) {
          setSessionExpired(true);
          clearInterval(timerRef.current!);
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [sessionStartTime, timeLimit, isUnlimited, sessionExpired]);
  
  const formatTime = (seconds: number) => {
    if (seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getRemainingTime = () => {
    if (isUnlimited) return null;
    return Math.max(0, timeLimit - timeUsed);
  };

  // Natural language query parser
  const parseQuery = async (input: string) => {
    if (sessionExpired) return [];
    const lower = input.toLowerCase();
    const queryResults: CommandResult[] = [];

    // Pattern matching for different query types
    if (lower.includes('show') || lower.includes('find') || lower.includes('search')) {
      // Search queries
      if (lower.includes('practice') || lower.includes('account') || lower.includes('clinic')) {
        // Search for practices/accounts
        const location = extractLocation(input);
        const procedure = extractProcedure(input);
        const revenue = extractRevenue(input);
        
        queryResults.push(...await searchPractices(location, procedure, revenue));
      } else if (lower.includes('procedure') || lower.includes('treatment')) {
        // Search for procedures
        const industry = lower.includes('dental') ? 'dental' : lower.includes('aesthetic') ? 'aesthetic' : undefined;
        queryResults.push(...await searchProcedures(input, industry));
      } else if (lower.includes('trend') || lower.includes('growing')) {
        // Search for trends
        queryResults.push(...await searchTrends(input));
      }
    } else if (lower.includes('generate') || lower.includes('create')) {
      // Generation queries
      if (lower.includes('pitch') || lower.includes('deck')) {
        queryResults.push(createPitchDeckAction(input));
      } else if (lower.includes('report') || lower.includes('analysis')) {
        queryResults.push(createReportAction(input));
      } else if (lower.includes('campaign')) {
        queryResults.push(createCampaignAction(input));
      }
    } else if (lower.includes('compare')) {
      // Comparison queries
      queryResults.push(...await compareProducts(input));
    } else if (lower.includes('schedule') || lower.includes('automate')) {
      // Automation queries
      queryResults.push(createAutomationAction(input));
    } else {
      // General search fallback
      queryResults.push(...await generalSearch(input));
    }

    // Add AI insights
    const insights = await generateInsights(input, queryResults);
    queryResults.unshift(...insights);

    return queryResults;
  };

  // Search procedures in database
  const searchProcedures = async (query: string,  industry?: string): Promise<CommandResult[]> => {
    try {
      let dbQuery = supabase
        .from('procedures')
        .select('*')
        .ilike('procedure_name', `%${query}%`)
        .order('market_size_2025_usd_millions', { ascending: false })
        .limit(5);

      if (industry) {
        dbQuery = dbQuery.or(`industry.eq.${industry},industry.eq.both`);
      }

      const { data, error } = await dbQuery;

      if (error || !data) return [];

      return data.map(proc => ({
        id: proc.id,
        type: 'procedure' as const,
        title: proc.procedure_name,
        description: `${proc.industry} • $${(proc.market_size_2025_usd_millions / 1000).toFixed(1)}B market • +${proc.yoy_growth_2024_to_2025_percent}% growth`,
        data: proc,
        icon: <TrendingUp color="primary" />,
        relevance: proc.trending_score_1_to_100 / 100
      }));
    } catch (error) {
      logger.error('Error searching procedures:', error);
      return [];
    }
  };

  // Search practices (mock for now)
  const searchPractices = async (location?: string,  procedure?: string,  revenue?: number): Promise<CommandResult[]> => {
    // In a real implementation, this would query a practices/accounts table
    const mockResults: CommandResult[] = [
      {
        id: 'practice1',
        type: 'company',
        title: 'Elite Dental Partners',
        description: `Miami, FL • 12 locations • $8.5M revenue • Specializes in implants`,
        icon: <Business color="secondary" />,
        data: { 
          name: 'Elite Dental Partners',
          locations: 12,
          revenue: 8500000,
          specialties: ['implants', 'orthodontics']
        }
      },
      {
        id: 'practice2',
        type: 'company',
        title: 'Aesthetic Excellence Group',
        description: `Los Angeles, CA • 5 locations • $4.2M revenue • Leading in injectables`,
        icon: <Business color="secondary" />,
        data: {
          name: 'Aesthetic Excellence Group',
          locations: 5,
          revenue: 4200000,
          specialties: ['injectables', 'body contouring']
        }
      }
    ];

    return mockResults.filter(result => {
      if (location && !result.description.toLowerCase().includes(location.toLowerCase())) return false;
      if (procedure && !result.description.toLowerCase().includes(procedure.toLowerCase())) return false;
      if (revenue && result.data.revenue < revenue) return false;
      return true;
    });
  };

  // Search market trends
  const searchTrends = async (query: string): Promise<CommandResult[]> => {
    try {
      const searchResults = await braveSearchService.search(
        `${query} market trends healthcare dental aesthetic`,
        5
      );

      return searchResults.map((result: any,  idx: number) => ({
        id: `trend_${idx}`,
        type: 'insight' as const,
        title: result.title,
        description: result.description,
        icon: <Analytics color="info" />,
        data: result,
        relevance: result.intelligence_score || 0.5
      }));
    } catch (error) {
      logger.error('Error searching trends:', error);
      return [];
    }
  };

  // Generate AI insights
  const generateInsights = async (query: string,  existingResults: CommandResult[]): Promise<CommandResult[]> => {
    const insights: CommandResult[] = [];

    // Analyze query intent
    const lower = query.toLowerCase();
    
    if (lower.includes('opportunity') || lower.includes('potential')) {
      insights.push({
        id: 'insight_opp', 
        type: 'insight', 
        title: 'AI Insight: Market Opportunity Analysis', 
        description: 'Based on your query,  I found 3 high-growth categories with low market penetration in your territory', 
        icon: <Psychology color="warning" />, 
        action: () => logger.info('Show opportunity analysis')
      });
    }

    if (existingResults.length > 0) {
      const avgGrowth = existingResults
        .filter(r => r.type === 'procedure' && r.data?.yoy_growth_2024_to_2025_percent)
        .reduce((sum,  r) => sum + r.data.yoy_growth_2024_to_2025_percent, 0) / existingResults.length;

      if (avgGrowth > 10) {
        insights.push({
          id: 'insight_growth',
          type: 'insight',
          title: 'AI Insight: High Growth Alert',
          description: `These procedures show ${avgGrowth.toFixed(1)}% average growth - significantly above market average`,
          icon: <AutoAwesome color="success" />
        });
      }
    }

    return insights;
  };

  // General search fallback
  const generalSearch = async (query: string): Promise<CommandResult[]> => {
    const results: CommandResult[] = [];
    
    // Search procedures
    results.push(...await searchProcedures(query));
    
    // Search market intelligence
    results.push(...await searchTrends(query));
    
    return results;
  };

  // Create action results
  const createPitchDeckAction = (query: string): CommandResult => ({
    id: 'action_pitch', 
    type: 'action', 
    title: 'Generate Pitch Deck', 
    description: 'Create a customized pitch deck based on market data and your query', 
    icon: <Campaign color="primary" />, 
    action: () => logger.info('Generating pitch deck for:', query)
  });

  const createReportAction = (query: string): CommandResult => ({
    id: 'action_report', 
    type: 'action', 
    title: 'Generate Market Report', 
    description: 'Create comprehensive market analysis report with charts and insights', 
    icon: <Analytics color="primary" />, 
    action: () => logger.info('Generating report for:', query)
  });

  const createCampaignAction = (query: string): CommandResult => ({
    id: 'action_campaign', 
    type: 'action', 
    title: 'Create Marketing Campaign', 
    description: 'Design targeted campaign based on market intelligence', 
    icon: <Campaign color="primary" />, 
    action: () => logger.info('Creating campaign for:', query)
  });

  const createAutomationAction = (query: string): CommandResult => ({
    id: 'action_automation', 
    type: 'action', 
    title: 'Schedule Automation', 
    description: 'Set up automated workflows based on market triggers', 
    icon: <AutoAwesome color="primary" />, 
    action: () => logger.info('Creating automation for:', query)
  });

  // Compare products/procedures
  const compareProducts = async (query: string): Promise<CommandResult[]> => {
    // Extract items to compare from query
    const vsIndex = query.toLowerCase().indexOf('vs');
    if (vsIndex === -1) return [];

    const item1 = query.substring(0, vsIndex).trim();
    const item2 = query.substring(vsIndex + 2).trim();

    return [{
      id: 'compare_result',
      type: 'data',
      title: `Comparison: ${item1} vs ${item2}`,
      description: 'Side-by-side market analysis and competitive positioning',
      icon: <Analytics color="info" />,
      action: () => logger.info('Showing comparison:', item1, 'vs', item2)
    }];
  };

  // Extract entities from query
  const extractLocation = (query: string): string | undefined => {
    const locationPattern = /(?:in|at|near)\s+([A-Za-z\s]+(?:,\s*[A-Z]{2})?)/i;
    const match = query.match(locationPattern);
    return match ? match[1].trim() : undefined;
  };

  const extractProcedure = (query: string): string | undefined => {
    const procedures = [
      // Dental procedures
      'implants', 'dental implants', 'aligners', 'invisalign', 'veneers', 'whitening', 
      'crowns', 'braces', 'orthodontics', 'root canal', 'fillings',
      // Aesthetic procedures  
      'botox', 'fillers', 'dermal fillers', 'lip filler', 'pdo threads', 'prp', 
      'prf', 'body contouring', 'liposuction', 'laser treatments', 'injectables'
    ];
    const lower = query.toLowerCase();
    return procedures.find(proc => lower.includes(proc));
  };

  const extractRevenue = (query: string): number | undefined => {
    const revenuePattern = /\$?([\d.]+)\s*(m|million|k|thousand)/i;
    const match = query.match(revenuePattern);
    if (match) {
      const value = parseFloat(match[1]);
      const multiplier = match[2].toLowerCase().startsWith('m') ? 1000000 : 1000;
      return value * multiplier;
    }
    return undefined;
  };

  // Handle search
  const handleSearch = async () => {
    if (!query.trim() || sessionExpired) return;
    
    // Increment query count
    setQueriesCount(prev => prev + 1);

    setLoading(true);
    try {
      const searchResults = await parseQuery(query);
      setResults(searchResults);
      
      // Save to recent queries
      const updated = [query, ...recentQueries.filter(q => q !== query)].slice(0, 5);
      setRecentQueries(updated);
      localStorage.setItem('ai_command_recent', JSON.stringify(updated));
    } catch (error) {
      logger.error('Search error:', error);
      setResults([{
        id: 'error',
        type: 'data',
        title: 'Search Error',
        description: 'Unable to process your query. Please try again.',
        icon: <Clear color="error" />
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions based on input
  useEffect(() => {
    if (query.length > 2) {
      const suggestions = [
        'Show me all practices in Miami doing over $2M in implants',
        'Which aesthetic procedures are growing fastest?',
        'Compare our products vs competitors',
        'Generate pitch deck for body contouring',
        'Find decision makers at aesthetic clinics',
        'Schedule follow-ups with interested accounts'
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      
      setSuggestions(suggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'relative', 
        width: '100%', 
        maxWidth: 800, 
        mx: 'auto', 
        overflow: 'hidden'
      }}
    >
      {/* Timer Display */}
      {!isUnlimited && sessionStartTime && (
        <Box sx={{ 
          p: 1, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: sessionExpired ? 'error.main' : getRemainingTime()! < 60 ? 'warning.main' : 'background.paper',
          color: sessionExpired ? 'error.contrastText' : getRemainingTime()! < 60 ? 'warning.contrastText' : 'text.primary'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer sx={{ fontSize: '1.2rem' }} />
              <Typography variant="body2" fontWeight="medium">
                {formatTime(getRemainingTime()!)} remaining
              </Typography>
              <Chip 
                label={TIER_NAMES[tier]} 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Box>
            {getRemainingTime()! < 300 && getRemainingTime()! > 0 && (
              <LinearProgress 
                variant="determinate" 
                value={(getRemainingTime()! / timeLimit) * 100}
                sx={{ 
                  width: 100, 
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getRemainingTime()! < 60 ? 'error.light' : 'warning.light'
                  }
                }}
              />
            )}
          </Box>
        </Box>
      )}
      
      {/* Session Expired Alert */}
      {sessionExpired && (
        <Alert 
          severity="warning" 
          sx={{ m: 2 }}
          action={
            <Button 
              size="small" 
              color="inherit"
              onClick={() => window.location.href = '/account'}
            >
              Upgrade
            </Button>
          }
        >
          Your {TIER_NAMES[tier]} AI session has ended ({queriesCount} queries used). Upgrade for longer sessions.
        </Alert>
      )}

      {/* Search Input */}
      <Box sx={{ p: 3,  borderBottom: 1,  borderColor: 'divider' }}>
        <Box sx={{ display: 'flex',  alignItems: 'center',  gap: 2 }}>
          <Psychology color="primary" sx={{ fontSize: 32 }} />
          <TextField
            ref={inputRef}
            fullWidth
            variant="outlined"
            placeholder="Ask me anything: 'Show practices in Miami doing $2M+ in implants' or 'Generate pitch for aligners'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <>
                  {query && (
                    <IconButton size="small" onClick={() => setQuery('')}>
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton 
                    color="primary" 
                    onClick={handleSearch}
                    disabled={!query.trim() || loading || sessionExpired}
                  >
                    {loading ? <CircularProgress size={24} /> : <Send />}
                  </IconButton>
                </>
              )
            }}
          />
        </Box>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Suggestions:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1,  flexWrap: 'wrap' }}>
              {suggestions.map((suggestion,  idx) => (
                <Chip
                  key={idx}
                  label={suggestion}
                  size="small"
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch();
                  }}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Results */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {results.length > 0 ? (
          <List>
            <AnimatePresence>
              {results.map((result,  idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0,  x: -20 }}
                  animate={{ opacity: 1,  x: 0 }}
                  exit={{ opacity: 0,  x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ListItem
                    button
                    onClick={() => {
                      if (result.action) {
                        result.action();
                      }
                      if (onResultSelect) {
                        onResultSelect(result);
                      }
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>{result.icon}</ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.description}
                    />
                    {result.relevance && (
                      <Chip
                        label={`${(result.relevance * 100).toFixed(0)}%`}
                        size="small"
                        color={result.relevance > 0.7 ? 'success' : 'default'}
                      />
                    )}
                  </ListItem>
                  {idx < results.length - 1 && <Divider />}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        ) : !loading && query && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No results found. Try rephrasing your query.
            </Typography>
          </Box>
        )}

        {/* Recent Queries */}
        {!query && recentQueries.length > 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <History fontSize="small" sx={{ verticalAlign: 'middle',  mr: 1 }} />
              Recent Searches
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {recentQueries.map((recentQuery,  idx) => (
                <Chip
                  key={idx}
                  label={recentQuery}
                  variant="outlined"
                  onClick={() => {
                    setQuery(recentQuery);
                    handleSearch();
                  }}
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      {!query && !loading && (
        <Box sx={{ p: 3,  borderTop: 1,  borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2,  flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<Lightbulb />}
              onClick={() => {
                setQuery('Show me high growth opportunities in my territory');
                handleSearch();
              }}
            >
              Find Opportunities
            </Button>
            <Button
              size="small"
              startIcon={<Campaign />}
              onClick={() => {
                setQuery('Generate pitch deck for top trending procedures');
                handleSearch();
              }}
            >
              Create Pitch
            </Button>
            <Button
              size="small"
              startIcon={<Analytics />}
              onClick={() => {
                setQuery('Compare dental implants vs clear aligners market');
                handleSearch();
              }}
            >
              Market Analysis
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

AICommandBar.displayName = 'AICommandBar';export default AICommandBar;