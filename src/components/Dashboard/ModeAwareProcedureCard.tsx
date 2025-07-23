import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Grid,
  Fade,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Psychology,
  Search,
  ExpandMore,
  LocalOffer,
  Speed,
  EmojiEvents,
  ContentCopy,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface ProcedureData {
  id: string;
  procedure_name: string;
  category: string;
  average_cost_usd: number;
  patient_satisfaction_score: number;
  market_size_us: number;
  yearly_growth_percentage: number;
  complexity: string;
  expanded_description?: any;
  robotics_ai_used?: boolean;
}

interface ModeAwareProcedureCardProps {
  procedure: ProcedureData;
  mode: 'market' | 'sales' | 'seo';
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const ModeAwareProcedureCard: React.FC<ModeAwareProcedureCardProps> = ({
  procedure,
  mode,
  expanded = false,
  onToggleExpand,
}) => {
  const [showTalkTrack, setShowTalkTrack] = React.useState(false);

  const modeData = useMemo(() => {
    try {
      const desc = typeof procedure.expanded_description === 'string' 
        ? JSON.parse(procedure.expanded_description) 
        : procedure.expanded_description;
      return desc?.modes?.[mode] || {};
    } catch {
      return {};
    }
  }, [procedure.expanded_description, mode]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a snackbar notification here
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
        ...(mode === 'sales' && {
          borderTop: '3px solid #2196f3',
        }),
        ...(mode === 'seo' && {
          borderTop: '3px solid #4caf50',
        }),
      }}
    >
      {/* Innovation Badge */}
      {procedure.robotics_ai_used && (
        <Chip
          label="AI/Robotics"
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            top: -10,
            right: 10,
            fontSize: '0.7rem',
            height: 20,
          }}
        />
      )}

      <CardContent>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {procedure.procedure_name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={procedure.category} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip
                label={procedure.complexity}
                size="small"
                sx={{
                  backgroundColor: alpha(getComplexityColor(procedure.complexity), 0.1),
                  color: getComplexityColor(procedure.complexity),
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Stack>
          </Box>
          
          <Box textAlign="right">
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatCurrency(procedure.average_cost_usd)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              per procedure
            </Typography>
          </Box>
        </Box>

        {/* Satisfaction Score */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              Patient Satisfaction
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {procedure.patient_satisfaction_score}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={procedure.patient_satisfaction_score} 
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha('#4caf50', 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: procedure.patient_satisfaction_score > 90 ? '#4caf50' : '#ff9800',
              }
            }}
          />
        </Box>

        {/* Mode-Specific Content */}
        <Fade in timeout={300}>
          <Box>
            {mode === 'market' && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Market Size (US)
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      ${(procedure.market_size_us / 1000).toFixed(1)}B
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Growth Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="600" color="primary">
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {procedure.yearly_growth_percentage}%
                    </Typography>
                  </Box>
                </Grid>
                {modeData.demographics && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Target Demographics
                    </Typography>
                    <Typography variant="body2">
                      {modeData.demographics.primary_age || 'All ages'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}

            {mode === 'sales' && (
              <Box>
                {modeData.elevator_pitch && (
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: alpha('#2196f3', 0.05), 
                      borderRadius: 1,
                      mb: 2,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      &quot;{modeData.elevator_pitch}&quot;
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(modeData.elevator_pitch)}
                      sx={{ position: 'absolute', top: 4, right: 4 }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {modeData.talk_tracks && (
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                      }}
                      onClick={() => setShowTalkTrack(!showTalkTrack)}
                    >
                      <Psychology sx={{ fontSize: 16, mr: 0.5 }} />
                      Talk Tracks
                      <ExpandMore 
                        sx={{ 
                          fontSize: 16, 
                          ml: 'auto',
                          transform: showTalkTrack ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }} 
                      />
                    </Typography>
                    <Collapse in={showTalkTrack}>
                      <Box sx={{ pl: 2 }}>
                        {modeData.talk_tracks.map((track: string, idx: number) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                            • {track}
                          </Typography>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                )}

                {modeData.roi_calculator && (
                  <Chip
                    icon={<AttachMoney />}
                    label={modeData.roi_calculator.roi_multiplier || 'High ROI'}
                    size="small"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            )}

            {mode === 'seo' && (
              <Box>
                {modeData.primary_keywords && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Top Keywords
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Object.entries(modeData.primary_keywords).slice(0, 3).map(([keyword, volume]) => (
                        <Chip
                          key={keyword}
                          label={`${keyword} (${volume?.toLocaleString()}/mo)`}
                          size="small"
                          icon={<Search sx={{ fontSize: 14 }} />}
                          sx={{ 
                            mb: 1,
                            backgroundColor: alpha('#4caf50', 0.1),
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {modeData.content_strategy && (
                  <Box 
                    sx={{ 
                      p: 1, 
                      bgcolor: alpha('#4caf50', 0.05), 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <EmojiEvents sx={{ fontSize: 16, mr: 1, color: '#4caf50' }} />
                    <Typography variant="caption">
                      Quick Win: {modeData.content_strategy.quick_wins?.[0] || modeData.competitive_advantage}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Fade>

        {/* Expand Button */}
        {onToggleExpand && (
          <Box display="flex" justifyContent="center" mt={2}>
            <IconButton size="small" onClick={onToggleExpand}>
              <ExpandMore 
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }} 
              />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ModeAwareProcedureCard;