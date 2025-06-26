import React from 'react';
import { Box, Button, ButtonGroup, useTheme } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

interface YearSelectorProps {
  selectedYear: number;
  onChange: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, onChange }) => {
  const theme = useTheme();
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CalendarToday sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
      <ButtonGroup size="small" variant="outlined">
        {years.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'contained' : 'outlined'}
            onClick={() => onChange(year)}
            sx={{
              minWidth: 60,
              fontSize: '0.75rem',
              py: 0.5,
            }}
          >
            {year}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default YearSelector;