import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  Public,
  Search,
  Notifications,
  Schedule,
  Analytics,
  Campaign,
  People,
  TrendingUp,
  AttachMoney,
  Psychology,
  Close,
  Menu as MenuIcon,
  AutoAwesome,
  Speed,
  Map,
  Timeline
} from '@mui/icons-material';
import { MarketGalaxyMap } from '../MarketGalaxy';
import AICommandBar from './AICommandBar';
import TerritoryMap from './TerritoryMap';
import OpportunityFeed from './OpportunityFeed';
import AutomationPanel from './AutomationPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box hidden={value !== index} sx={{ height: '100%' }}>
      {value === index && children}
    </Box>
  );
};

const SalesWorkspace: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeView, setActiveView] = useState<'galaxy' | 'territory' | 'opportunities'>('galaxy');
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [showAICommand, setShowAICommand] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock data for quick stats
  const quickStats = {
    totalOpportunities: 47,
    activeLeads: 23,
    scheduledMeetings: 8,
    monthlyTarget: 85,
    topTrendingCategory: 'Digital Dentistry',
    alertCount: 3
  };

  const renderMainView = () => {
    switch (activeView) {
      case 'galaxy':
        return <MarketGalaxyMap />;
      case 'territory':
        return <TerritoryMap />;
      case 'opportunities':
        return <OpportunityFeed />;
      default:
        return <MarketGalaxyMap />;
    }
  };

  const navigationItems = [
    { id: 'galaxy', label: 'Market Galaxy', icon: <Public />, view: 'galaxy' as const },
    { id: 'territory', label: 'Territory Map', icon: <Map />, view: 'territory' as const },
    { id: 'opportunities', label: 'Opportunities', icon: <TrendingUp />, view: 'opportunities' as const }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', position: 'relative' }}>
      {/* Left Sidebar - Navigation */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Sales Workspace
          </Typography>

          {/* Quick Stats */}
          <Card sx={{ mb: 3, backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Monthly Progress
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {quickStats.monthlyTarget}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                ${(quickStats.monthlyTarget * 1200).toLocaleString()} of $120,000
              </Typography>
            </CardContent>
          </Card>

          {/* Navigation */}
          <List>
            {navigationItems.map((item) => (
              <ListItem
                key={item.id}
                button
                selected={activeView === item.view}
                onClick={() => setActiveView(item.view)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.id === 'opportunities' && (
                  <Chip label={quickStats.totalOpportunities} size="small" />
                )}
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Quick Actions */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Psychology />}
              onClick={() => setShowAICommand(true)}
              sx={{ justifyContent: 'flex-start' }}
            >
              AI Assistant
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Campaign />}
              sx={{ justifyContent: 'flex-start' }}
            >
              New Campaign
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Schedule />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Schedule Demo
            </Button>
          </Stack>

          {/* Alerts */}
          {quickStats.alertCount > 0 && (
            <Card sx={{ mt: 3, backgroundColor: theme.palette.error.light }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed /> {quickStats.alertCount} Urgent Actions
                </Typography>
                <Typography variant="caption">
                  New competitor activity detected
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {navigationItems.find(item => item.view === activeView)?.label}
            </Typography>
            <Chip
              icon={<TrendingUp />}
              label={`Trending: ${quickStats.topTrendingCategory}`}
              color="success"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="AI Command Center">
              <IconButton onClick={() => setShowAICommand(true)} color="primary">
                <Psychology />
              </IconButton>
            </Tooltip>
            <Badge badgeContent={notifications} color="error">
              <IconButton>
                <Notifications />
              </IconButton>
            </Badge>
          </Box>
        </Paper>

        {/* Split View Container */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Main View */}
          <Box sx={{ flex: isMobile ? 1 : 0.65, position: 'relative' }}>
            {renderMainView()}
          </Box>

          {/* Right Panel - Context Panel */}
          {!isMobile && (
            <Paper
              elevation={3}
              sx={{
                flex: 0.35,
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={rightPanelTab}
                onChange={(_, value: number) => setRightPanelTab(value)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Insights" icon={<Analytics />} iconPosition="start" />
                <Tab label="Actions" icon={<AutoAwesome />} iconPosition="start" />
                <Tab label="Timeline" icon={<Timeline />} iconPosition="start" />
              </Tabs>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <TabPanel value={rightPanelTab} index={0}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Market Insights
                    </Typography>
                    
                    {/* Top Opportunities */}
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          🎯 Top Opportunity
                        </Typography>
                        <Typography variant="body2">
                          Body contouring showing 22.3% growth in your territory with only 15% market penetration
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }}>
                          View Details
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Market Alerts */}
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                          ⚡ Market Alert
                        </Typography>
                        <Typography variant="body2">
                          Competitor launched new clear aligner product with aggressive pricing
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }}>
                          Prepare Response
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Performance
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Leads Generated</Typography>
                            <Chip label="23" size="small" color="success" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Demos Scheduled</Typography>
                            <Chip label="8" size="small" color="info" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Pipeline Value</Typography>
                            <Chip label="$450K" size="small" color="primary" />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </TabPanel>

                <TabPanel value={rightPanelTab} index={1}>
                  <AutomationPanel />
                </TabPanel>

                <TabPanel value={rightPanelTab} index={2}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Activity Timeline
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        { time: '10:30 AM', event: 'Demo with Elite Dental', type: 'meeting' },
                        { time: '2:00 PM', event: 'Follow-up: Aesthetic Excellence', type: 'call' },
                        { time: '3:30 PM', event: 'Proposal deadline: Miami Smiles', type: 'deadline' },
                        { time: 'Tomorrow', event: 'Quarterly review', type: 'important' }
                      ].map((item, idx) => (
                        <Card key={idx} variant="outlined">
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {item.time}
                            </Typography>
                            <Typography variant="body2">
                              {item.event}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                </TabPanel>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* AI Command Bar Modal */}
      <AnimatePresence>
        {showAICommand && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300
            }}
            onClick={() => setShowAICommand(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%',
                maxWidth: 800
              }}
            >
              <AICommandBar
                onClose={() => setShowAICommand(false)}
                onResultSelect={(result) => {
                  console.log('Selected:', result);
                  setShowAICommand(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SalesWorkspace;