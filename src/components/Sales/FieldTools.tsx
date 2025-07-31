import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Paper,
  Button,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Mic,
  CameraAlt,
  Description,
  Calculate,
  LocationOn,
  CloudDownload,
  CloudUpload,
  WifiOff,
  Wifi,
  ExpandMore,
  FormatQuote,
  AttachMoney,
  Timer,
  BusinessCenter,
  Phone,
  Email,
  Note,
  PresentToAll,
  Close,
  Check,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../services/logging/logger';


interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon,  label,  color,  onClick }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderTop: `3px solid ${color}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
          transition: 'all 0.3s ease',
        }}
        onClick={onClick}
      >
        <Avatar
          sx={{
            backgroundColor: color,
            width: 48,
            height: 48,
            margin: '0 auto',
            mb: 1,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
      </Card>
    </motion.div>
  );
};

interface VoiceNoteProps {
  isRecording: boolean;
  onToggle: () => void;
}

const VoiceNote: React.FC<VoiceNoteProps> = ({ isRecording,  onToggle }) => {
  const theme = useTheme();
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      sx={{
        p: 2,
        background: isRecording 
          ? `linear-gradient(135deg, ${theme.palette.error.light}20 0%, ${theme.palette.error.light}10 100%)`
          : theme.palette.background.paper,
        border: isRecording ? `2px solid ${theme.palette.error.main}` : 'none',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={onToggle}
            sx={{
              backgroundColor: isRecording ? theme.palette.error.main : theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: isRecording ? theme.palette.error.dark : theme.palette.primary.dark,
              },
            }}
          >
            <Mic />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {isRecording ? 'Recording...' : 'Voice Note'}
            </Typography>
            {isRecording && (
              <Typography variant="body2" color="error">
                {formatDuration(duration)}
              </Typography>
            )}
          </Box>
        </Box>
        {isRecording && (
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.error.main,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="caption" color="error">
              REC
            </Typography>
          </Box>
        )}
      </Box>
      {!isRecording && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Tap to record meeting notes
        </Typography>
      )}
    </Paper>
  );
};

interface QuoteItem {
  procedure: string;
  quantity: number;
  price: number;
}

const QuoteGenerator: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<QuoteItem[]>([
    { procedure: 'Botox (50 units)', quantity: 1, price: 500 },
    { procedure: 'Dermal Filler', quantity: 2, price: 600 },
  ]);

  const total = items.reduce((sum,  item) => sum + item.quantity * item.price, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Quick Quote Generator
        </Typography>
        
        <List>
          {items.map((item, _index) => (
            <ListItem key={_index} sx={{ px: 0 }}>
              <ListItemText
                primary={item.procedure}
                secondary={`Qty: ${item.quantity}`}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                ${(item.quantity * item.price).toLocaleString()}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ${total.toLocaleString()}
          </Typography>
        </Box>
        
        <Stack spacing={1}>
          <Button variant="contained" fullWidth startIcon={<Email />}>
            Email Quote
          </Button>
          <Button variant="outlined" fullWidth startIcon={<Description />}>
            Generate PDF
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const FieldTools: React.FC = () => {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const speedDialActions = [
    { icon: <Mic />, name: 'Voice Note', color: theme.palette.error.main },
    { icon: <CameraAlt />, name: 'Photo', color: theme.palette.info.main },
    { icon: <FormatQuote />, name: 'Quote', color: theme.palette.success.main },
    { icon: <Calculate />, name: 'Calculator', color: theme.palette.warning.main },
    { icon: <LocationOn />, name: 'Check-in', color: theme.palette.primary.main },
  ];

  const quickActions = [
    {
      icon: <Phone />,
      label: 'Call Client',
      color: theme.palette.primary.main,
      onClick: () => logger.info('Call'),
    },
    {
      icon: <PresentToAll />,
      label: 'Demo Mode',
      color: theme.palette.success.main,
      onClick: () => setPresentationMode(true),
    },
    {
      icon: <CloudDownload />,
      label: 'Sync Data',
      color: theme.palette.info.main,
      onClick: () => logger.info('Sync'),
    },
    {
      icon: <BusinessCenter />,
      label: 'Briefcase',
      color: theme.palette.warning.main,
      onClick: () => setDrawerOpen(true),
    },
  ];

  return (
    <>
      <Box sx={{ p: 2,  pb: 10 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Field Tools
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Everything you need on the go
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={isOffline ? <WifiOff /> : <Wifi />}
              label={isOffline ? 'Offline' : 'Online'}
              size="small"
              color={isOffline ? 'error' : 'success'}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isOffline}
                  onChange={(e) => setIsOffline(e.target.checked)}
                  size="small"
                />
              }
              label=""
            />
          </Stack>
        </Box>

        {/* Voice Note Section */}
        <Box mb={3}>
          <VoiceNote isRecording={isRecording} onToggle={() => setIsRecording(!isRecording)} />
        </Box>

        {/* Quick Actions Grid */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Quick Actions
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap={2}
          >
            {quickActions.map((action, _index) => (
              <QuickAction key={_index} {...action} />
            ))}
          </Box>
        </Box>

        {/* Today's Schedule */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Today&apos;s Schedule
          </Typography>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Smile Dental Group
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    10:00 AM - Product Demo
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" color="primary">
                    <LocationOn />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Note />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Beverly Hills Aesthetics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2:00 PM - Follow-up Visit
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" color="primary">
                    <LocationOn />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Note />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Box>

        {/* Quote Generator */}
        <QuoteGenerator />
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            sx={{
              backgroundColor: action.color,
              color: 'white',
              '&:hover': {
                backgroundColor: action.color,
              },
            }}
          />
        ))}
      </SpeedDial>

      {/* Digital Briefcase Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          },
        }}
      >
        <Box p={3}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Digital Briefcase
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
                  <Description />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Product Catalogs"
                secondary="15 documents"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: theme.palette.success.main }}>
                  <AttachMoney />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Price Lists"
                secondary="Updated 2 days ago"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: theme.palette.warning.main }}>
                  <Timer />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Demo Videos"
                secondary="5 videos available offline"
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Presentation Mode */}
      <AnimatePresence>
        {presentationMode && (
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
              backgroundColor: theme.palette.background.default, 
              zIndex: 9999, 
            }}
          >
            <AppBar position="static" color="transparent" elevation={0}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Presentation Mode
                </Typography>
                <IconButton onClick={() => setPresentationMode(false)}>
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="calc(100vh - 64px)"
              p={3}
            >
              <Typography variant="h4" textAlign="center">
                Your presentation content here
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


FieldTools.displayName = 'FieldTools';export default FieldTools;