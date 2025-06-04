import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip, alpha } from '@mui/material';
import { TrendingUp, Storefront, Search } from '@mui/icons-material';

interface ModeToggleProps {
  mode: 'market' | 'sales' | 'seo';
  onChange: (mode: 'market' | 'sales' | 'seo') => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode) {
      onChange(newMode as 'market' | 'sales' | 'seo');
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1200,
        background: (theme) => alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        p: 0.5
      }}
    >
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        aria-label="view mode"
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 1,
            border: 'none',
            borderRadius: 1.5,
            mx: 0.5,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              }
            },
            '&:hover': {
              transform: 'scale(1.02)',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }
          }
        }}
      >
        <Tooltip title="Market Intelligence - Trends, Growth, Demographics" placement="bottom">
          <ToggleButton value="market" aria-label="market mode">
            <TrendingUp sx={{ mr: 1, fontSize: 18 }} />
            Market
          </ToggleButton>
        </Tooltip>
        
        <Tooltip title="Sales Intelligence - Talk Tracks, ROI, Objections" placement="bottom">
          <ToggleButton value="sales" aria-label="sales mode">
            <Storefront sx={{ mr: 1, fontSize: 18 }} />
            Sales
          </ToggleButton>
        </Tooltip>
        
        <Tooltip title="SEO Intelligence - Keywords, Content, Rankings" placement="bottom">
          <ToggleButton value="seo" aria-label="seo mode">
            <Search sx={{ mr: 1, fontSize: 18 }} />
            SEO
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      
      {/* Mode indicator dot */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 40,
          height: 3,
          borderRadius: 1.5,
          background: (theme) => theme.palette.primary.main,
          opacity: 0.8,
          transition: 'all 0.3s ease',
          ...(mode === 'market' && { left: '16.67%' }),
          ...(mode === 'sales' && { left: '50%' }),
          ...(mode === 'seo' && { left: '83.33%' }),
        }}
      />
    </Box>
  );
};

export default ModeToggle;