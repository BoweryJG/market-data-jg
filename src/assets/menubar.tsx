import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MemoryIcon from '@mui/icons-material/Memory';
import { useOrbContext, useColorMode } from './OrbContextProvider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import LoginModal from '../components/Auth/LoginModal';
import SignupModal from '../components/Auth/SignupModal';
import LogoutModal from '../components/Auth/LogoutModal';
import { useAuth } from '../auth';
import SettingsModal from '../components/Settings/SettingsModal';
import SettingsIcon from '@mui/icons-material/Settings';

const ACCENT_COLOR = '#00ffc6';

// Main navigation links
const getNavLinks = (currentUrl: string) => {
  const links = [
    { 
      key: 'canvas',
      label: 'Canvas', 
      href: 'https://canvas.repspheres.com/',
      icon: <InsightsIcon fontSize="small" sx={{ color: ACCENT_COLOR }} />
    },
    { 
      key: 'sphereos',
      label: 'Sphere oS', 
      href: 'https://crm.repspheres.com/',
      icon: <MemoryIcon fontSize="small" sx={{ color: ACCENT_COLOR }} />
    },
    { 
      key: 'podcast',
      label: 'Podcast', 
      href: 'https://workshop-homepage.netlify.app/?page=podcast',
      icon: <PodcastsIcon fontSize="small" sx={{ color: ACCENT_COLOR }} />
    },
  ];
  
  return links;
};

// More menu items
const moreMenuItems = [
  { label: 'About RepSpheres', href: 'https://repspheres.com/about' },
  { label: 'Contact', href: 'https://repspheres.com/contact' },
  { label: 'Careers', href: 'https://repspheres.com/careers' },
  { label: 'Legal', href: 'https://repspheres.com/legal' }
];


interface NavBarProps {
  onSalesModeToggle?: () => void;
}

export default function NavBar({ onSalesModeToggle }: NavBarProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [signupOpen, setSignupOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get current URL to determine which page we're on
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Get navigation links based on current page
  const navLinks = getNavLinks(currentUrl);
  
  // Get the gradient colors from context
  const { gradientColors } = useOrbContext();

  // Orb SVG for brand logo with gradient colors
  const orb = (
    <svg width="100%" height="100%" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(0 0 6px #7B42F6AA)' }}>
      <defs>
        <radialGradient id="orbGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={gradientColors.start} />
          <stop offset="100%" stopColor={gradientColors.end} />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#orbGrad)" opacity="0.85" />
      <circle cx="16" cy="16" r="8" fill="#fff" opacity="0.08" />
    </svg>
  );
  
  // Handle drawer toggle
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent<Element> | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Handle more menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Styles for different button types
  const buttonBaseStyles = {
    fontWeight: 500,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    minWidth: 'auto',
    textTransform: 'none',
    borderRadius: 0,
    transition: 'all 0.2s',
  };
  
  const navButtonStyles = {
    ...buttonBaseStyles,
    fontSize: { xs: '0.9rem', sm: '0.95rem' },
    px: { xs: 0.5, sm: 1 },
    py: 0.5,
    mx: { xs: 0.5, sm: 1 },
    color: '#fff',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  };
  
  const loginButtonStyles = {
    ...buttonBaseStyles,
    fontSize: { xs: '0.85rem', sm: '0.9rem' },
    fontWeight: 500,
    px: { xs: 1.2, sm: 1.5 },
    py: 0.5,
    border: '1px solid #fff',
    borderRadius: '16px',
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      borderColor: '#3a86ff',
    },
  };
  
  const signupButtonStyles = {
    ...buttonBaseStyles,
    fontSize: { xs: '0.85rem', sm: '0.9rem' },
    fontWeight: 600,
    px: { xs: 1.2, sm: 1.5 },
    py: 0.5,
    ml: { xs: 0.5, sm: 1 },
    borderRadius: '16px',
    color: '#fff',
    background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
    '&:hover': {
      background: 'linear-gradient(90deg, #5B3CFF 0%, #00ffc6 100%)',
      transform: 'scale(1.03)',
    },
  };
  
  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ 
        width: '260px', 
        p: 2, 
        background: 'rgba(20,14,38,0.96)',
        borderLeft: '2px solid',
        borderImage: 'linear-gradient(180deg, #7B42F6 0%, #00ffc6 100%) 1',
        height: '100%',
        color: '#fff',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {/* RepSpheres Logo in Drawer */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4, 
        mt: 2,
        cursor: 'pointer'
      }} onClick={() => typeof window !== 'undefined' && (window.location.href = 'https://repspheres.com')}>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          mr: 1.5 
        }}>
          {orb}
        </Box>
        <Box sx={{ 
          fontSize: '1.2rem', 
          fontWeight: 800,
          display: 'flex'
        }}>
          <span>Rep</span>
          <Box component="span" sx={{
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Spheres</Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ mb: 2 }}>
        {navLinks.map((link) => (
          <ListItem key={link.key} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component="a"
              href={link.href}
              sx={{
                py: 1,
                borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {link.icon}
              </Box>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
      
      {/* More Menu Items */}
      <List>
        {moreMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component="a"
              href={item.href}
              sx={{ 
                py: 0.75,
                px: 2,
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            >
              {item.label}
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Theme Toggle in mobile */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              toggleColorMode();
            }}
            sx={{ 
              py: 0.75,
              px: 2,
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {theme.palette.mode === 'dark' ? (
              <Brightness7Icon fontSize="small" sx={{ mr: 1.5 }} />
            ) : (
              <Brightness4Icon fontSize="small" sx={{ mr: 1.5 }} />
            )}
            {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </ListItemButton>
        </ListItem>
        
        {/* Settings in mobile */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              toggleDrawer(false)({ type: 'click' } as any);
              setSettingsOpen(true);
            }}
            sx={{ 
              py: 0.75,
              px: 2,
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
            Settings
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* Auth Buttons */}
      <Box sx={{ mt: 4, px: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setLoginOpen(true)}
          sx={{
            ...loginButtonStyles,
            mb: 2,
            justifyContent: 'center',
          }}
        >
          Log In
        </Button>
        
        <Button
          fullWidth
          variant="contained"
          onClick={() => setSignupOpen(true)}
          sx={{
            ...signupButtonStyles,
            ml: 0,
            justifyContent: 'center',
          }}
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
    <AppBar position="sticky" elevation={0} sx={{
      background: 'rgba(24,24,43,0.52)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 6px 24px 0 rgba(123,66,246,0.15)',
      border: '1px solid rgba(123,66,246,0.13)',
      borderBottom: '1px solid rgba(123,66,246,0.10)',
      borderRadius: { xs: '0 0 16px 16px', md: '0 0 24px 24px' },
      mx: 'auto',
      mt: { xs: 0.5, md: 1 },
      width: { xs: 'calc(100% - 10px)', sm: 'calc(100% - 20px)', md: 'calc(100% - 40px)' },
      maxWidth: '1800px',
      overflow: 'hidden', // Ensures nothing extends outside the AppBar
      zIndex: 1200,
    }}>
      <Toolbar sx={{ 
        px: { xs: 1, sm: 2 },
        height: { xs: '60px', sm: '64px' },
        minHeight: { xs: '60px', sm: '64px' }, // Override default Toolbar minHeight
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo Section */}
        <Box 
          component="a" 
          href="https://repspheres.com" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 }
          }}>
            {orb}
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            fontWeight: 800,
            letterSpacing: '0.03em',
          }}>
            <Box component="span">Rep</Box>
            <Box component="span" sx={{
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Spheres</Box>
          </Box>
          
          {/* Hidden 'g' intelligence link */}
          <Box
            component="span"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSalesModeToggle) onSalesModeToggle();
            }}
            sx={{
              ml: 0.5,
              cursor: 'pointer',
              color: 'transparent',
              userSelect: 'none',
              fontSize: '1rem',
              '&:hover': {
                color: 'transparent', // Keep it hidden even on hover
              }
            }}
          >
            g
          </Box>
        </Box>

        {/* Middle Section - Navigation (only on desktop) */}
        {!isMobile && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              px: { sm: 1, md: 2 },
              maxWidth: { sm: '65vw', md: '70vw' },
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}>
              {navLinks.map((link) => (
                <Button
                  key={link.key}
                  component="a"
                  href={link.href}
                  sx={{
                    ...navButtonStyles,
                    // Hide text on smaller screens
                    '& .buttonText': {
                      display: { xs: 'none', sm: 'inline' }
                    }
                  }}
                >
                  <Box sx={{ 
                    mr: { xs: 0, sm: 1 },
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {link.icon}
                  </Box>
                  <Box component="span" className="buttonText">{link.label}</Box>
                </Button>
              ))}
              
            </Box>
          </Box>
        )}

        {/* Right Section - Auth Buttons & Menu Button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 'auto',
          gap: { xs: 0.5, sm: 1 },
        }}>
          
          {/* Auth Buttons - Always visible except on very small screens */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
          }}>
            {!user ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setLoginOpen(true)}
                  sx={loginButtonStyles}
                >
                  Log In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setSignupOpen(true)}
                  sx={signupButtonStyles}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setLogoutOpen(true)}
                sx={loginButtonStyles}
              >
                Log Out
              </Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton 
              edge="end" 
              color="inherit" 
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* More Menu - Only on desktop */}
          {!isMobile && (
            <IconButton
              aria-label="more options"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{ 
                ml: 0.5, 
                color: '#fff',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          )}

          {/* More Menu Dropdown */}
          <Menu
            id="menu-appbar"
            anchorEl={menuAnchorEl}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                background: 'rgba(20,14,38,0.96)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                borderRadius: 2,
                border: '1px solid rgba(123,66,246,0.15)',
                minWidth: 180,
              }
            }}
          >
            {/* Theme Toggle */}
            <MenuItem
              onClick={() => {
                toggleColorMode();
                handleMenuClose();
              }}
              sx={{ 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
              {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
            
            {/* Settings Option */}
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setSettingsOpen(true);
              }}
              sx={{ 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <SettingsIcon fontSize="small" />
              Settings
            </MenuItem>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

            {/* More Menu Items */}
            {moreMenuItems.map((item, index) => (
              <MenuItem 
                key={index} 
                component="a"
                href={item.href}
                onClick={handleMenuClose}
                sx={{ color: '#fff' }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {drawerContent}
        </Drawer>
      </Toolbar>
    </AppBar>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />
    <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    <SettingsModal 
      open={settingsOpen} 
      onClose={() => setSettingsOpen(false)} 
    />
    </>
  );
}
