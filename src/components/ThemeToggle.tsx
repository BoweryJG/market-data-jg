import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode
import { useThemeContext } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        className={className}
        sx={{
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(30deg)'
          },
        }}
        aria-label="toggle theme"
      >
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};


ThemeToggle.displayName = 'ThemeToggle';export default ThemeToggle;
