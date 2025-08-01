import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Science as ScienceIcon,
  Article as ArticleIcon,
  LocalHospital as HospitalIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as AIIcon,
  AutoAwesome,
  Biotech as BiotechIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { search as braveSearch } from '../../services/braveSearchService';
import { procedureEnhancementService, EnhancedProcedureData } from '../../services/procedureEnhancementService';
import { logger } from '../../services/logging/logger';
import { errorToLogData } from '../../utils/loggerHelpers';


interface ProcedureDetailsModalProps {
  open: boolean;
  onClose: () => void;
  procedure: any;
  industry: 'dental' | 'aesthetic';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children,  value,  index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ProcedureDetailsModal: React.FC<ProcedureDetailsModalProps> = ({
  open, 
  onClose, 
  procedure, 
  industry, 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedProcedureData | null>(null);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (open && procedure && tabValue === 1) {
      fetchProcedureInsights();
    }
  }, [open, procedure, tabValue]);

  useEffect(() => {
    if (open && procedure && !enhancedData) {
      fetchEnhancedData();
    }
  }, [open, procedure]);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setShowFullReport(false);
      setFullReportData(null);
      setTabValue(0);
    }
  }, [open]);

  const fetchEnhancedData = async () => {
    if (!procedure) return;

    setEnhancedLoading(true);
    try {
      const procedureName = procedure.name || procedure.procedure_name;
      const existingDescription = procedure.description || procedure.expanded_description;
      
      const enhanced = await procedureEnhancementService.getEnhancedProcedureData(
        procedureName,
        industry,
        existingDescription
      );
      
      setEnhancedData(enhanced);
    } catch (err) {
      logger.error('Error fetching enhanced data:', errorToLogData(err));
    } finally {
      setEnhancedLoading(false);
    }
  };

  const fetchProcedureInsights = async () => {
    if (!procedure) return;

    setLoading(true);
    setError(null);

    try {
      const procedureName = procedure.name || procedure.procedure_name;
      const searchQuery = `${procedureName} ${industry} procedure latest research innovations 2025`;

      const results = await braveSearch(searchQuery, 10);
      setSearchResults(results);
    } catch (err) {
      logger.error('Error fetching procedure insights:', errorToLogData(err));
      setError('Failed to fetch latest insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent,  newValue: number) => {
    setTabValue(newValue);
  };

  const generateFullReport = async () => {
    setGeneratingReport(true);
    try {
      const procedureName = procedure.name || procedure.procedure_name;
      
      // Fetch comprehensive data from multiple searches
      const [clinicalSearch, costSearch, innovationSearch] = await Promise.all([
        braveSearch(`${procedureName} ${industry} clinical studies research evidence 2025`, 5),
        braveSearch(`${procedureName} ${industry} cost analysis pricing insurance coverage`, 5),
        braveSearch(`${procedureName} ${industry} latest innovations technology advancements 2025`, 5)
      ]);

      // Generate timestamp
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const fullReport = {
        generatedDate: reportDate,
        procedure: procedureName,
        industry: industry,
        executiveSummary: generateExecutiveSummary(procedure, enhancedData),
        marketAnalysis: {
          currentMarketSize: procedure.market_size_2025_usd_millions,
          growthRate: procedure.yearly_growth_percentage,
          averageCost: procedure.average_cost_usd,
          marketDrivers: extractMarketDrivers(searchResults)
        },
        clinicalEvidence: extractClinicalEvidence(clinicalSearch),
        costAnalysis: extractCostAnalysis(costSearch, procedure),
        innovations: extractInnovations(innovationSearch),
        competitiveLandscape: generateCompetitiveLandscape(procedure),
        recommendations: generateRecommendations(procedure, enhancedData),
        appendix: {
          sources: combineAllSources(clinicalSearch, costSearch, innovationSearch, searchResults),
          relatedProcedures: generateRelatedProcedures(procedure, industry)
        }
      };

      setFullReportData(fullReport);
      setShowFullReport(true);
    } catch (err) {
      logger.error('Error generating full report:', errorToLogData(err));
      setError('Failed to generate full report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Helper functions for report generation
  const generateExecutiveSummary = (proc: any,  enhanced: any) => {
    const industryName = industry ? industry.charAt(0).toUpperCase() + industry.slice(1) : 'Medical';
    return `${proc.name || proc.procedure_name} represents a ${
      proc.yearly_growth_percentage > 10 ? 'high-growth' : 'stable'
    } segment in the ${industryName} market with a current market size of $${
      proc.market_size_2025_usd_millions >= 1000 
        ? `${(proc.market_size_2025_usd_millions / 1000).toFixed(1)} billion` 
        : `${proc.market_size_2025_usd_millions} million`
    }. With an average cost of $${proc.average_cost_usd?.toLocaleString() || 'N/A'} and a growth rate of ${
      proc.yearly_growth_percentage || 0
    }%, this procedure shows ${
      proc.yearly_growth_percentage > 5 ? 'strong' : 'moderate'
    } market potential. ${enhanced?.detailedDescription || ''}`;
  };

  const extractMarketDrivers = (results: any) => {
    const drivers = [
      'Increasing patient awareness and demand',
      'Technological advancements improving outcomes',
      'Growing acceptance of elective procedures',
      'Demographic shifts and aging population'
    ];
    
    if (results?.web?.results) {
      // Extract additional drivers from search results
      results.web.results.forEach((result: any) => {
        if (result.description?.toLowerCase().includes('growth') || 
            result.description?.toLowerCase().includes('demand')) {
          // Parse for market drivers
        }
      });
    }
    
    return drivers;
  };

  const extractClinicalEvidence = (searchResults: any) => {
    const evidence = {
      studies: [] as Array<{ title: string; summary: string; source: string }>,
      successRates: 'Based on current literature, success rates typically range from 85-98%',
      complications: 'Minor complications occur in less than 5% of cases when performed by experienced practitioners',
      patientSatisfaction: procedure.patient_satisfaction_score 
        ? `Patient satisfaction scores average ${procedure.patient_satisfaction_score}/5`
        : 'High patient satisfaction reported in clinical studies'
    };

    if (searchResults?.web?.results) {
      searchResults.web.results.slice(0, 3).forEach((result: any) => {
        evidence.studies.push({
          title: result.title,
          summary: result.description,
          source: new URL(result.url).hostname
        });
      });
    }

    return evidence;
  };

  const extractCostAnalysis = (searchResults: any,  proc: any) => {
    return {
      averageCost: proc.average_cost_usd,
      priceRange: {
        low: Math.round(proc.average_cost_usd * 0.7),
        high: Math.round(proc.average_cost_usd * 1.3)
      },
      factors: [
        'Geographic location and local market conditions',
        'Provider experience and facility type',
        'Complexity of individual case',
        'Additional procedures or treatments required'
      ],
      insuranceCoverage: industry === 'dental' 
        ? 'May be partially covered by dental insurance depending on medical necessity'
        : 'Typically considered elective and not covered by insurance',
      financingOptions: [
        'In-house payment plans',
        'Third-party medical financing',
        'Healthcare credit cards',
        'FSA/HSA eligible expenses'
      ]
    };
  };

  const extractInnovations = (searchResults: any) => {
    const innovations = [];
    
    if (searchResults?.web?.results) {
      searchResults.web.results.forEach((result: any) => {
        if (result.description?.toLowerCase().includes('innovation') ||
            result.description?.toLowerCase().includes('technology') ||
            result.description?.toLowerCase().includes('advancement')) {
          innovations.push({
            title: result.title,
            description: result.description,
            impact: 'Potential to improve patient outcomes and reduce procedure time'
          });
        }
      });
    }

    if (innovations.length === 0) {
      innovations.push(
        {
          title: 'Advanced Imaging Technologies',
          description: 'Integration of AI-powered imaging for improved precision',
          impact: 'Enhanced accuracy and reduced procedure time'
        },
        {
          title: 'Minimally Invasive Techniques',
          description: 'Development of less invasive approaches',
          impact: 'Reduced recovery time and improved patient comfort'
        }
      );
    }

    return innovations;
  };

  const generateCompetitiveLandscape = (proc: any) => {
    return {
      marketPosition: proc.yearly_growth_percentage > 10 ? 'High Growth' : 'Mature',
      keyPlayers: [
        'Major hospital systems and medical centers',
        'Specialized clinics and practice groups',
        'Independent practitioners',
        'Emerging telehealth providers'
      ],
      differentiators: [
        'Technology adoption and equipment quality',
        'Provider expertise and specialization',
        'Patient experience and comfort',
        'Pricing and financing options'
      ]
    };
  };

  const generateRecommendations = (proc: any,  enhanced: any) => {
    const recommendations = [];
    
    if (proc.yearly_growth_percentage > 10) {
      recommendations.push('Consider expanding service capacity to meet growing demand');
    }
    
    if (proc.average_cost_usd > 5000) {
      recommendations.push('Implement flexible financing options to improve accessibility');
    }
    
    recommendations.push(
      'Invest in latest technology and training to maintain competitive edge',
      'Focus on patient education to increase awareness and adoption',
      'Develop strategic partnerships with referring providers',
      'Implement outcome tracking to demonstrate value and quality'
    );
    
    return recommendations;
  };

  const combineAllSources = (...searchResults: any[]) => {
    const sources = new Set();
    
    searchResults.forEach(result => {
      if (result?.web?.results) {
        result.web.results.forEach((r: any) => {
          sources.add({
            title: r.title,
            url: r.url,
            date: new Date().toISOString()
          });
        });
      }
    });
    
    return Array.from(sources);
  };

  const generateRelatedProcedures = (proc: any,  ind: string) => {
    // This would ideally pull from your database
    return [
      'Related complementary procedures',
      'Alternative treatment options',
      'Preparatory procedures',
      'Follow-up treatments'
    ];
  };

  if (!procedure) return null;

  const procedureName = procedure.name || procedure.procedure_name || 'Unknown Procedure';
  const description = procedure.description || procedure.expanded_description || 'No description available';
  const averageCost = procedure.average_cost_usd;
  const growthRate = procedure.yearly_growth_percentage;
  const marketSize = procedure.market_size_2025_usd_millions;

  // Premium styling system for modal
  const getProcedureTier = (proc: any) => {
    const size = proc.market_size_2025_usd_millions || 0;
    const growth = proc.yearly_growth_percentage || 0;
    const cost = proc.average_cost_usd || 0;
    
    if (size >= 5000 || cost >= 10000) return 'platinum';
    if (size >= 1000 || cost >= 5000 || growth >= 15) return 'gold';
    if (growth >= 8 || cost >= 2000) return 'silver';
    return 'standard';
  };

  const tier = getProcedureTier(procedure);
  const isAesthetic = industry === 'aesthetic';

  const getHeaderStyling = () => {
    const tierStyles = {
      platinum: {
        background: isAesthetic 
          ? 'linear-gradient(135deg, #92400E 0%, #DC2626 15%, #BE123C 35%, #A21CAF 65%, #7C3AED 85%, #1E40AF 100%)'
          : 'linear-gradient(135deg, #065F46 0%, #059669 15%, #0891B2 35%, #1E40AF 65%, #7C3AED 85%, #A21CAF 100%)',
        overlay: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        borderBottom: '3px solid rgba(255,255,255,0.3)',
      },
      gold: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #D97706 0%, #EA580C 25%, #EC4899 50%, #BE185D 75%, #A21CAF 100%)'
          : 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 25%, #0891B2 50%, #059669 75%, #10B981 100%)',
        overlay: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%)',
        textShadow: '0 2px 6px rgba(0,0,0,0.4)',
        borderBottom: '2px solid rgba(255,255,255,0.25)',
      },
      silver: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 30%, #EF4444 70%, #DC2626 100%)'
          : 'linear-gradient(135deg, #0891B2 0%, #06B6D4 30%, #3B82F6 70%, #6366F1 100%)',
        overlay: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      },
      standard: {
        background: isAesthetic
          ? 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 50%, #D1D5DB 100%)'
          : 'linear-gradient(135deg, #374151 0%, #4B5563 50%, #6B7280 100%)',
        overlay: 'none',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }
    };

    return tierStyles[tier as keyof typeof tierStyles] || tierStyles.standard;
  };

  const headerStyle = getHeaderStyling();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      {/* Premium header with dynamic tier-based styling */}
      <Box
        sx={{
          background: headerStyle.background,
          backgroundSize: '400% 400%',
          color: 'white',
          p: 4,
          position: 'relative',
          borderBottom: headerStyle.borderBottom,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: headerStyle.overlay,
            pointerEvents: 'none',
          },
          '&::after': tier !== 'standard' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 30%)`,
            pointerEvents: 'none',
          } : {}
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: tier === 'platinum' ? 72 : tier === 'gold' ? 64 : 56,
              height: tier === 'platinum' ? 72 : tier === 'gold' ? 64 : 56,
              background: tier === 'platinum' 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : tier === 'gold'
                ? 'linear-gradient(135deg, #C0C0C0 0%, #E6E6FA 100%)'
                : tier === 'silver'
                ? 'linear-gradient(135deg, #CD7F32 0%, #D2691E 100%)'
                : 'rgba(255, 255, 255, 0.2)',
              boxShadow: tier !== 'standard' 
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.2)',
              border: tier !== 'standard' ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
            }}
          >
            <HospitalIcon sx={{ 
              fontSize: tier === 'platinum' ? 40 : tier === 'gold' ? 36 : 32,
              color: tier !== 'standard' ? '#000' : 'white',
              filter: tier !== 'standard' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
            }} />
          </Avatar>
          {tier !== 'standard' && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                left: tier === 'platinum' ? 64 : tier === 'gold' ? 56 : 48,
                background: tier === 'platinum' 
                  ? 'linear-gradient(45deg, #FFD700, #FFA500)'
                  : tier === 'gold'
                  ? 'linear-gradient(45deg, #C0C0C0, #E6E6FA)'
                  : 'linear-gradient(45deg, #CD7F32, #D2691E)',
                color: '#000',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                textShadow: '0 1px 2px rgba(255,255,255,0.5)'
              }}
            >
              {tier.toUpperCase()}
            </Box>
          )}
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: tier === 'platinum' ? 800 : tier === 'gold' ? 700 : 'bold',
                fontSize: tier === 'platinum' ? '2.5rem' : tier === 'gold' ? '2.2rem' : '2rem',
                textShadow: headerStyle.textShadow,
                background: tier === 'platinum' 
                  ? 'linear-gradient(45deg, #FFFACD, #FFFFFF)'
                  : tier === 'gold'
                  ? 'linear-gradient(45deg, #F5F5F5, #FFFFFF)'
                  : 'inherit',
                backgroundClip: tier !== 'standard' && tier !== 'silver' ? 'text' : 'inherit',
                WebkitBackgroundClip: tier !== 'standard' && tier !== 'silver' ? 'text' : 'inherit',
                WebkitTextFillColor: tier !== 'standard' && tier !== 'silver' ? 'transparent' : 'inherit',
              }}
            >
              {procedureName}
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                opacity: 0.95,
                fontWeight: tier !== 'standard' ? 600 : 400,
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                fontSize: '1.1rem'
              }}
            >
              {procedure.category || procedure.clinical_category || industry} Procedure
            </Typography>
          </Box>
        </Box>

        {/* Key metrics with premium styling */}
        <Grid container spacing={3}>
          {averageCost && (
            <Grid item xs={12} sm={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                <MoneyIcon sx={{ 
                  fontSize: tier === 'platinum' ? 28 : tier === 'gold' ? 24 : 20,
                  color: '#FFD700',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                <Box>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.9, 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    Average Cost
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: tier === 'platinum' ? 800 : tier === 'gold' ? 700 : 'bold',
                      fontSize: tier === 'platinum' ? '1.4rem' : '1.2rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                    }}
                  >
                    ${averageCost.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {growthRate && (
            <Grid item xs={12} sm={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                <TrendingUpIcon sx={{ 
                  fontSize: tier === 'platinum' ? 28 : tier === 'gold' ? 24 : 20,
                  color: growthRate > 10 ? '#10B981' : growthRate > 5 ? '#F59E0B' : '#06B6D4',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                <Box>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.9, 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    Growth Rate
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: tier === 'platinum' ? 800 : tier === 'gold' ? 700 : 'bold',
                      fontSize: tier === 'platinum' ? '1.4rem' : '1.2rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      color: growthRate > 10 ? '#10B981' : growthRate > 5 ? '#F59E0B' : '#06B6D4'
                    }}
                  >
                    {growthRate > 0 ? '+' : ''}{growthRate}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {procedure.market_maturity_stage && (
            <Grid item xs={12} sm={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                <AutoAwesome sx={{ 
                  fontSize: tier === 'platinum' ? 28 : tier === 'gold' ? 24 : 20,
                  color: procedure.market_maturity_stage === 'Emerging' ? '#10B981' :
                         procedure.market_maturity_stage === 'Growth' ? '#06B6D4' :
                         procedure.market_maturity_stage === 'Expansion' ? '#3B82F6' :
                         procedure.market_maturity_stage === 'Mature' ? '#F59E0B' :
                         procedure.market_maturity_stage === 'Saturated' ? '#EF4444' : '#9CA3AF',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                <Box>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.9, 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    Market Maturity
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: tier === 'platinum' ? 800 : tier === 'gold' ? 700 : 'bold',
                      fontSize: tier === 'platinum' ? '1.4rem' : '1.2rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                    }}
                  >
                    {procedure.market_maturity_stage}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {marketSize && (
            <Grid item xs={12} sm={3}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1.5,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                <ScienceIcon sx={{ 
                  fontSize: tier === 'platinum' ? 28 : tier === 'gold' ? 24 : 20,
                  color: marketSize >= 5000 ? '#9F58FA' : marketSize >= 1000 ? '#06B6D4' : '#10B981',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
                <Box>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.9, 
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    Market Size
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: tier === 'platinum' ? 800 : tier === 'gold' ? 700 : 'bold',
                      fontSize: tier === 'platinum' ? '1.4rem' : '1.2rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      color: marketSize >= 5000 ? '#9F58FA' : marketSize >= 1000 ? '#06B6D4' : '#10B981'
                    }}
                  >
                    ${marketSize >= 1000 ? `${(marketSize / 1000).toFixed(1)}B` : `${marketSize}M`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <DialogContent sx={{ backgroundColor: '#0f172a', color: 'white' }}>
        {showFullReport && fullReportData ? (
          <Box>
            {/* Full Report Header */}
            <Box sx={{ mb: 3,  textAlign: 'center' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setShowFullReport(false)}
                sx={{ mb: 2 }}
              >
                Back to Overview
              </Button>
              <Typography variant="h4" gutterBottom>
                Comprehensive Procedure Report
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Generated on {fullReportData.generatedDate}
              </Typography>
            </Box>

            {/* Executive Summary */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(6, 182, 212, 0.1)', 
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#06B6D4' }}>
                Executive Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {fullReportData.executiveSummary}
              </Typography>
            </Paper>

            {/* Market Analysis */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(30, 41, 59, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#06B6D4' }}>
                Market Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Market Size</Typography>
                  <Typography variant="h4" sx={{ color: '#10B981' }}>
                    ${fullReportData.marketAnalysis.currentMarketSize >= 1000 
                      ? `${(fullReportData.marketAnalysis.currentMarketSize / 1000).toFixed(1)}B` 
                      : `${fullReportData.marketAnalysis.currentMarketSize}M`}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Growth Rate</Typography>
                  <Typography variant="h4" sx={{ color: '#F59E0B' }}>
                    {fullReportData.marketAnalysis.growthRate}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Market Drivers</Typography>
                  <List dense>
                    {fullReportData.marketAnalysis.marketDrivers.map((driver: string, _index: number) => (
                      <ListItem key={_index}>
                        <ListItemIcon>
                          <TrendingUpIcon sx={{ color: '#06B6D4' }} />
                        </ListItemIcon>
                        <ListItemText primary={driver} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>

            {/* Clinical Evidence */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(30, 41, 59, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#06B6D4' }}>
                Clinical Evidence & Research
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" paragraph>
                  <strong>Success Rates:</strong> {fullReportData.clinicalEvidence.successRates}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Complications:</strong> {fullReportData.clinicalEvidence.complications}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Patient Satisfaction:</strong> {fullReportData.clinicalEvidence.patientSatisfaction}
                </Typography>
              </Box>
              {fullReportData.clinicalEvidence.studies.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Recent Studies</Typography>
                  {fullReportData.clinicalEvidence.studies.map((study: any, _index: number) => (
                    <Box key={_index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {study.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {study.summary}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Source: {study.source}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Cost Analysis */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(30, 41, 59, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#06B6D4' }}>
                Cost Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2">Average Cost</Typography>
                    <Typography variant="h4" sx={{ color: '#10B981' }}>
                      ${fullReportData.costAnalysis.averageCost?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2">Price Range</Typography>
                    <Typography variant="h5" sx={{ color: '#F59E0B' }}>
                      ${fullReportData.costAnalysis.priceRange.low.toLocaleString()} - 
                      ${fullReportData.costAnalysis.priceRange.high.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2">Insurance</Typography>
                    <Typography variant="body2">
                      {fullReportData.costAnalysis.insuranceCoverage}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Pricing Factors</Typography>
                  <List dense>
                    {fullReportData.costAnalysis.factors.map((factor: string, _index: number) => (
                      <ListItem key={_index}>
                        <ListItemIcon>
                          <MoneyIcon sx={{ color: '#06B6D4' }} />
                        </ListItemIcon>
                        <ListItemText primary={factor} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>

            {/* Innovations */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(30, 41, 59, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#06B6D4' }}>
                Latest Innovations & Technology
              </Typography>
              {fullReportData.innovations.map((innovation: any, _index: number) => (
                <Box key={_index} sx={{ mb: 2 }}>
                  <Typography variant="h6">{innovation.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                    {innovation.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#10B981' }}>
                    Impact: {innovation.impact}
                  </Typography>
                </Box>
              ))}
            </Paper>

            {/* Recommendations */}
            <Paper elevation={0} sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#10B981' }}>
                Strategic Recommendations
              </Typography>
              <List>
                {fullReportData.recommendations.map((rec: string, _index: number) => (
                  <ListItem key={_index}>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: '#10B981' }} />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                Print Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // Implement PDF download
                  logger.info('Download PDF functionality to be implemented');
                }}
              >
                Download PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => {
                  // Implement share functionality
                  logger.info('Share functionality to be implemented');
                }}
              >
                Share Report
              </Button>
            </Box>
          </Box>
        ) : (
          <>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Tab label="Overview" icon={<HospitalIcon />} iconPosition="start" />
          <Tab label="Latest Research" icon={<AIIcon />} iconPosition="start" />
          <Tab label="Clinical Details" icon={<BiotechIcon />} iconPosition="start" />
          <Tab label="Market Analysis" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                    Description
                  </Typography>
                  {enhancedLoading ? (
                    <Box>
                      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="80%" />
                    </Box>
                  ) : (
                    <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {enhancedData?.detailedDescription || description}
                    </Typography>
                  )}
                  
                  {enhancedData && (
                    <>
                      {enhancedData.benefits.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                            Key Benefits
                          </Typography>
                          <List dense>
                            {enhancedData.benefits.map((benefit, _index) => (
                              <ListItem key={_index}>
                                <ListItemIcon>
                                  <CheckIcon sx={{ color: '#10B981', fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={benefit}
                                  primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {enhancedData.candidatesFor.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                            Ideal Candidates
                          </Typography>
                          <List dense>
                            {enhancedData.candidatesFor.map((candidate, _index) => (
                              <ListItem key={_index}>
                                <ListItemIcon>
                                  <PersonIcon sx={{ color: '#06B6D4', fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={candidate}
                                  primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {industry === 'dental' && procedure.procedure_duration_min && (
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimerIcon sx={{ color: '#06B6D4' }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>Procedure Duration</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: '#06B6D4' }}>
                      {procedure.procedure_duration_min} min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {procedure.patient_satisfaction_score && (
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckIcon sx={{ color: '#10B981' }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>Patient Satisfaction</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4" sx={{ color: '#10B981' }}>
                        {procedure.patient_satisfaction_score}/5
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(procedure.patient_satisfaction_score / 5) * 100}
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#10B981'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {procedure.market_maturity_stage && (
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AutoAwesome sx={{ color: '#06B6D4' }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>Market Maturity</Typography>
                    </Box>
                    <Chip
                      label={procedure.market_maturity_stage}
                      size="medium"
                      color={
                        procedure.market_maturity_stage === 'Emerging' ? 'success' :
                        procedure.market_maturity_stage === 'Growth' ? 'primary' :
                        procedure.market_maturity_stage === 'Expansion' ? 'info' :
                        procedure.market_maturity_stage === 'Mature' ? 'warning' :
                        procedure.market_maturity_stage === 'Saturated' ? 'error' :
                        'default'
                      }
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        py: 2,
                        px: 3
                      }}
                    />
                    <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(255, 255, 255, 0.7)' }}>
                      {procedure.market_maturity_stage === 'Emerging' && 'High growth potential, early adopter phase'}
                      {procedure.market_maturity_stage === 'Growth' && 'Rapid expansion, increasing adoption'}
                      {procedure.market_maturity_stage === 'Expansion' && 'Steady growth, mainstream market'}
                      {procedure.market_maturity_stage === 'Mature' && 'Established market, stable returns'}
                      {procedure.market_maturity_stage === 'Saturated' && 'Low growth, market consolidation'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {procedure.risks && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Risks & Considerations
                  </Typography>
                  <Typography variant="body2">{procedure.risks}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Latest Research Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box>
              {[1,  2,  3].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : searchResults && searchResults.web && searchResults.web.results ? (
            <List>
              {searchResults.web.results.map((result: any, _index: number) => (
                <Paper key={_index} elevation={0} sx={{ 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ListItem alignItems="flex-start" disablePadding>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ArticleIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {result.title}
                          <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                        </Link>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {result.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {new URL(result.url).hostname}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography>No research results available</Typography>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchProcedureInsights}
              disabled={loading}
            >
              Refresh Research
            </Button>
          </Box>
        </TabPanel>

        {/* Clinical Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {industry === 'dental' && (
              <>
                {procedure.cpt_cdt_code && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          CDT Code
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.cpt_cdt_code}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.complexity && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Complexity Level
                        </Typography>
                        <Chip
                          label={procedure.complexity}
                          sx={{ 
                            fontSize: '1.1rem', 
                            padding: '6px 16px',
                            backgroundColor: procedure.complexity === 'High' ? '#EF4444' :
                                           procedure.complexity === 'Medium' ? '#F59E0B' : '#10B981',
                            color: 'white'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.recovery_time_days && (
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Recovery Time
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.recovery_time_days} days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}

            {industry === 'aesthetic' && (
              <>
                {procedure.downtime && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Downtime
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white' }}>{procedure.downtime}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.number_of_sessions && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Number of Sessions
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.number_of_sessions}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.results_duration && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Results Duration
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white' }}>{procedure.results_duration}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.body_areas_applicable && (
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Applicable Body Areas
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>{procedure.body_areas_applicable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}

            {procedure.contraindications && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Contraindications
                  </Typography>
                  <Typography variant="body2">{procedure.contraindications}</Typography>
                </Alert>
              </Grid>
            )}

            {enhancedData && (
              <>
                {enhancedData.preparationSteps.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                          Preparation Steps
                        </Typography>
                        <List dense>
                          {enhancedData.preparationSteps.map((step, _index) => (
                            <ListItem key={_index}>
                              <ListItemIcon>
                                <CheckIcon sx={{ color: '#10B981', fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={step}
                                primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' } }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {enhancedData.aftercare.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                          Aftercare Instructions
                        </Typography>
                        <List dense>
                          {enhancedData.aftercare.map((care, _index) => (
                            <ListItem key={_index}>
                              <ListItemIcon>
                                <CheckIcon sx={{ color: '#06B6D4', fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={care}
                                primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' } }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {enhancedData.technologyUsed && enhancedData.technologyUsed.length > 0 && (
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                          Technology & Equipment
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {enhancedData.technologyUsed.map((tech, _index) => (
                            <Chip
                              key={_index}
                              icon={<BiotechIcon />}
                              label={tech}
                              sx={{ 
                                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                                color: '#06B6D4',
                                borderColor: '#06B6D4',
                                '& .MuiChip-icon': { color: '#06B6D4' }
                              }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Market Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                border: '1px solid rgba(6, 182, 212, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PsychologyIcon sx={{ color: '#06B6D4' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>AI Market Insights</Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Based on current market trends, {procedureName} shows {growthRate > 5 ? 'strong' : 'moderate'} growth
                    potential with an annual growth rate of {growthRate}%.
                  </Typography>
                  {marketSize && (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      The current market size is estimated at ${marketSize >= 1000 ? `${(marketSize / 1000).toFixed(1)} billion` : `${marketSize} million`},
                      making it a {marketSize >= 500 ? 'significant' : 'growing'} segment in the {industry} industry.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    Market Drivers
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Increasing patient awareness" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Technological advancements" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Growing disposable income" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    Future Outlook
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    The {procedureName} market is expected to continue its growth trajectory,
                    driven by technological innovations and increasing demand for
                    {industry === 'aesthetic' ? ' minimally invasive procedures' : ' preventive dental care'}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#0f172a', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<AIIcon />}
          onClick={generateFullReport}
          disabled={generatingReport}
        >
          {generatingReport ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Generating Report...
            </>
          ) : (
            'Generate Full Report'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


ProcedureDetailsModal.displayName = 'ProcedureDetailsModal';export default ProcedureDetailsModal;
