/* global JSX */

import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from './OrbContextProvider';

export default function ThemeToggle(): JSX.Element {
  const theme = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <IconButton 
      onClick={toggleColorMode} 
      color="inherit"
      aria-label="toggle dark/light mode"
      sx={{ 
        opacity: 0.8,
        '&:hover': { opacity: 1 }
      }}
    >
      {theme.palette.mode === 'dark' ? (
        <Brightness7Icon fontSize="small" />
      ) : (
        <Brightness4Icon fontSize="small" />
      )}
    </IconButton>
  );
}
