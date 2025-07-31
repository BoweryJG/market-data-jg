import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  InputBase,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Drawer,
  Stack,
  Card,
  CardContent,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications,
  Phone,
  Email,
  CalendarToday,
  Note,
  Dashboard,
  Map as MapIcon,
  BusinessCenter,
  Assessment,
  School,
  Settings,
  Logout,
  Close,
  Add,
  Home,
  Explore,
  Person,
  Menu as MenuIcon,
  PlayArrow,
  Mic,
  Warning,
  AttachFile,
  Send,
  CheckCircle,
  Schedule,
  LocationOn,
  CameraAlt,
  FormatQuote,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logger } from '../services/logging/logger';


interface QuickSearchResult {
  type: 'account' | 'contact' | 'product' | 'procedure';
  name: string;
  subtitle: string;
  action: () => void;
}

interface NotificationItem {
  id: string;
  type: 'alert' | 'reminder' | 'update';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const QuickActionsBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [selectedNav, setSelectedNav] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Follow-up Required',
      message: 'Smile Dental Group quote expires in 2 days',
      time: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Meeting in 30 minutes',
      message: 'Product demo with Beverly Hills Aesthetics',
      time: '30 min',
      read: false,
    },
    {
      id: '3',
      type: 'update',
      title: 'New Lead Assigned',
      message: 'Downtown Medical Spa requested information',
      time: '1 hour ago',
      read: true,
    },
  ];

  const quickActions = [
    { icon: <Phone />, name: 'Call', action: () => logger.info('Call') },
    { icon: <Email />, name: 'Email', action: () => logger.info('Email') },
    { icon: <CalendarToday />, name: 'Schedule', action: () => logger.info('Schedule') },
    { icon: <Note />, name: 'Note', action: () => setQuickNoteOpen(true) },
    { icon: <FormatQuote />, name: 'Quote', action: () => logger.info('Quote') },
    { icon: <CameraAlt />, name: 'Photo', action: () => logger.info('Photo') },
  ];

  const searchResults: QuickSearchResult[] = [
    {
      type: 'account',
      name: 'Smile Dental Group',
      subtitle: 'Last visit: 3 days ago',
      action: () => logger.info('Open account'),
    },
    {
      type: 'contact',
      name: 'Dr. Sarah Johnson',
      subtitle: 'Smile Dental Group',
      action: () => logger.info('Open contact'),
    },
    {
      type: 'product',
      name: 'Botox Cosmetic',
      subtitle: '50 units package',
      action: () => logger.info('Open product'),
    },
  ];

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (_event: React.KeyboardEvent) => {
    if (_event.key === 'Enter') {
      logger.info('Searching for:', searchQuery);
      // Implement search logic
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Warning color="error" />;
      case 'reminder':
        return <Schedule color="primary" />;
      case 'update':
        return <CheckCircle color="success" />;
      default:
        return <Notifications />;
    }
  };

  // Desktop Navigation Bar
  const DesktopNav = () => (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.background.paper, 
        color: theme.palette.text.primary, 
        boxShadow: theme.shadows[2], 
      }}
    >
      <Toolbar>
        {/* Logo/Brand */}
        <Box display="flex" alignItems="center" sx={{ mr: 4 }}>
          <Avatar
            sx={{
              backgroundColor: theme.palette.primary.main, 
              mr: 2, 
              width: 36, 
              height: 36, 
            }}
          >
            RS
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            RepSpheres
          </Typography>
        </Box>

        {/* Quick Navigation */}
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          <Button
            startIcon={<Dashboard />}
            onClick={() => navigate('/sales-dashboard')}
            sx={{ color: theme.palette.text.primary }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<MapIcon />}
            onClick={() => navigate('/territory')}
            sx={{ color: theme.palette.text.primary }}
          >
            Territory
          </Button>
          <Button
            startIcon={<BusinessCenter />}
            onClick={() => navigate('/opportunities')}
            sx={{ color: theme.palette.text.primary }}
          >
            Pipeline
          </Button>
          <Button
            startIcon={<Assessment />}
            onClick={() => navigate('/intelligence')}
            sx={{ color: theme.palette.text.primary }}
          >
            Intelligence
          </Button>
        </Stack>

        {/* Search */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0,  opacity: 0 }}
              animate={{ width: 300,  opacity: 1 }}
              exit={{ width: 0,  opacity: 0 }}
            >
              <Paper
                sx={{
                  p: '2px 4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: 300, 
                  mr: 2, 
                }}
              >
                <InputBase
                  sx={{ ml: 1,  flex: 1 }}
                  placeholder="Search accounts,  contacts,  products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  inputRef={searchInputRef}
                />
                <IconButton onClick={() => setSearchOpen(false)}>
                  <Close />
                </IconButton>
              </Paper>
            </motion.div>
          ) : (
            <IconButton onClick={() => setSearchOpen(true)} sx={{ mr: 2 }}>
              <SearchIcon />
            </IconButton>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <IconButton
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => setNotificationAnchor(e.currentTarget)}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={2} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}>
          <Avatar sx={{ width: 32, height: 32 }}>SJ</Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  // Mobile Navigation Bar
  const MobileNav = () => (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: theme.palette.background.paper, 
          color: theme.palette.text.primary, 
          boxShadow: theme.shadows[2], 
        }}
      >
        <Toolbar>
          <IconButton onClick={() => setMobileMenuOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            RepSpheres
          </Typography>
          <IconButton onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon />
          </IconButton>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => setNotificationAnchor(e.currentTarget)}>
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <BottomNavigation
        value={selectedNav}
        onChange={(_: React.SyntheticEvent,  newValue: number) => setSelectedNav(newValue)}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: theme.shadows[8],
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Territory" icon={<MapIcon />} />
        <BottomNavigationAction label="Pipeline" icon={<BusinessCenter />} />
        <BottomNavigationAction label="Tools" icon={<Explore />} />
        <BottomNavigationAction label="Profile" icon={<Person />} />
      </BottomNavigation>
    </>
  );

  // Speed Dial for Quick Actions
  const QuickActionsDial = () => (
    <SpeedDial
      ariaLabel="Quick actions"
      sx={{
        position: 'absolute', 
        bottom: isMobile ? 80 : 16, 
        right: 16, 
      }}
      icon={<SpeedDialIcon />}
    >
      {quickActions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.action}
        />
      ))}
    </SpeedDial>
  );

  // User Menu
  const UserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Sarah Johnson
        </Typography>
        <Typography variant="body2" color="text.secondary">
          sarah.johnson@repspheres.com
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={() => navigate('/profile')}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate('/training')}>
        <ListItemIcon>
          <School fontSize="small" />
        </ListItemIcon>
        <ListItemText>Training</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate('/settings')}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => logger.info('Logout')}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );

  // Notifications Menu
  const NotificationsMenu = () => (
    <Menu
      anchorEl={notificationAnchor}
      open={Boolean(notificationAnchor)}
      onClose={() => setNotificationAnchor(null)}
      PaperProps={{
        sx: { width: 360, maxHeight: 400 },
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="h6">Notifications</Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            button
            sx={{
              backgroundColor: !notification.read ? theme.palette.action.hover : 'transparent',
            }}
          >
            <ListItemIcon>
              {getNotificationIcon(notification.type)}
            </ListItemIcon>
            <ListItemText
              primary={notification.title}
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button fullWidth>View All Notifications</Button>
      </Box>
    </Menu>
  );

  // Quick Note Dialog
  const QuickNoteDialog = () => (
    <Dialog
      open={quickNoteOpen}
      onClose={() => setQuickNoteOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Quick Note
        <IconButton
          onClick={() => setQuickNoteOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Account/Contact"
          fullWidth
          variant="outlined"
          defaultValue="Smile Dental Group"
        />
        <TextField
          margin="dense"
          label="Note"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter your note here..."
        />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <IconButton color="primary">
            <Mic />
          </IconButton>
          <IconButton color="primary">
            <CameraAlt />
          </IconButton>
          <IconButton color="primary">
            <AttachFile />
          </IconButton>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setQuickNoteOpen(false)}>Cancel</Button>
        <Button variant="contained" startIcon={<Send />}>
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Mobile Menu Drawer
  const MobileMenuDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250, pt: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            RepSpheres
          </Typography>
        </Box>
        <List>
          <ListItem button onClick={() => navigate('/sales-dashboard')}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/territory')}>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary="Territory" />
          </ListItem>
          <ListItem button onClick={() => navigate('/opportunities')}>
            <ListItemIcon>
              <BusinessCenter />
            </ListItemIcon>
            <ListItemText primary="Pipeline" />
          </ListItem>
          <ListItem button onClick={() => navigate('/intelligence')}>
            <ListItemIcon>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Intelligence" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <QuickActionsDial />
      <UserMenu />
      <NotificationsMenu />
      <QuickNoteDialog />
      {isMobile && <MobileMenuDrawer />}
      
      {/* Search Results Overlay */}
      <AnimatePresence>
        {searchOpen && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper
              sx={{
                position: 'absolute',
                top: 70,
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? '90%' : 600,
                maxHeight: 400,
                overflow: 'auto',
                zIndex: theme.zIndex.modal,
                boxShadow: theme.shadows[8],
              }}
            >
              <List>
                {searchResults.map((result, _index) => (
                  <ListItem
                    key={_index}
                    button
                    onClick={() => {
                      result.action();
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <ListItemIcon>
                      <Chip
                        label={result.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.name}
                      secondary={result.subtitle}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


QuickActionsBar.displayName = 'QuickActionsBar';export default QuickActionsBar;