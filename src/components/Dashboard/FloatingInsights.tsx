import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, IconButton, Chip, useTheme, alpha } from '@mui/material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  TipsAndUpdates, 
  AutoAwesome, 
  TrendingUp,
  Warning,
  Lightbulb,
  Close,
  Speed
} from '@mui/icons-material';

interface Insight {
  id: string;
  type: 'opportunity' | 'trend' | 'warning' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FloatingInsightsProps {
  insights: Insight[];
  onDismiss?: (id: string) => void;
}

const FloatingInsights: React.FC<FloatingInsightsProps> = ({ insights, onDismiss }) => {
  const theme = useTheme();
  const [visibleInsights, setVisibleInsights] = useState<Insight[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Stagger the appearance of insights
    insights.forEach((insight, index) => {
      setTimeout(() => {
        setVisibleInsights(prev => [...prev, insight]);
      }, index * 200);
    });

    return () => setVisibleInsights([]);
  }, [insights]);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp />;
      case 'trend':
        return <Speed />;
      case 'warning':
        return <Warning />;
      case 'tip':
        return <Lightbulb />;
    }
  };

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return theme.palette.success.main;
      case 'trend':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'tip':
        return theme.palette.secondary.main;
    }
  };

  const getPriority = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return { order: 0, pulse: true };
      case 'medium':
        return { order: 1, pulse: false };
      case 'low':
        return { order: 2, pulse: false };
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleInsights(prev => prev.filter(i => i.id !== id));
    onDismiss?.(id);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 320,
        maxHeight: '80vh',
        overflowY: 'auto',
        pointerEvents: 'none',
        '&::-webkit-scrollbar': {
          width: 0,
        },
      }}
    >
      <AnimatePresence>
        {visibleInsights
          .sort((a, b) => getPriority(a.priority).order - getPriority(b.priority).order)
          .map((insight, index) => {
            const { pulse } = getPriority(insight.priority);
            const color = getColor(insight.type);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ x: 100, opacity: 0, scale: 0.8 }}
                animate={{ 
                  x: 0, 
                  opacity: 1, 
                  scale: hoveredId === insight.id ? 1.05 : 1,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }
                }}
                exit={{ 
                  x: 100, 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                style={{ 
                  marginBottom: 16,
                  pointerEvents: 'all',
                }}
                onHoverStart={() => setHoveredId(insight.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                <Card
                  sx={{
                    position: 'relative',
                    p: 2,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(color, 0.3)}`,
                    boxShadow: `0 8px 32px ${alpha(color, 0.1)}`,
                    overflow: 'visible',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: color,
                      boxShadow: `0 12px 48px ${alpha(color, 0.2)}`,
                    },
                  }}
                >
                  {/* Pulse Animation for High Priority */}
                  {pulse && (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: color,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: color,
                        }}
                      />
                    </>
                  )}

                  {/* Close Button */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(insight.id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      opacity: 0.5,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon with glow effect */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: alpha(color, 0.1),
                        color: color,
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      {hoveredId === insight.id && (
                        <motion.div
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 1 }}
                          exit={{ scale: 1, opacity: 0 }}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px',
                            background: alpha(color, 0.2),
                            filter: 'blur(8px)',
                          }}
                        />
                      )}
                      {getIcon(insight.type)}
                    </Box>

                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          mb: 0.5,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {insight.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: insight.action ? 1.5 : 0,
                        }}
                      >
                        {insight.description}
                      </Typography>

                      {insight.action && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            insight.action?.onClick();
                          }}
                          style={{
                            padding: '6px 16px',
                            borderRadius: 20,
                            border: 'none',
                            background: alpha(color, 0.1),
                            color: color,
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.background = alpha(color, 0.2);
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.background = alpha(color, 0.1);
                          }}
                        >
                          {insight.action.label}
                        </motion.button>
                      )}
                    </Box>
                  </Box>

                  {/* AI Sparkle Effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === insight.id ? 1 : 0 }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      pointerEvents: 'none',
                    }}
                  >
                    <AutoAwesome
                      sx={{
                        fontSize: 16,
                        color: theme.palette.warning.main,
                        filter: 'drop-shadow(0 0 4px rgba(255, 193, 7, 0.5))',
                      }}
                    />
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* AI Assistant Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'all',
        }}
      >
        <Chip
          icon={<AutoAwesome />}
          label="AI Insights Active"
          size="small"
          sx={{
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            '& .MuiChip-icon': {
              color: theme.palette.warning.main,
            },
          }}
        />
      </motion.div>
    </Box>
  );
};

export default FloatingInsights;