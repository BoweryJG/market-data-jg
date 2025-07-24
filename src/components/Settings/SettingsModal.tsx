import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  TextField,
  Chip,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SecurityIcon from '@mui/icons-material/Security';
import MapIcon from '@mui/icons-material/Map';
import SyncIcon from '@mui/icons-material/Sync';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../../auth';
import { useThemeContext } from '../../context/ThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Profile
    displayName: user?.email || '',
    phoneNumber: '',
    territory: 'NY/FL',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    newsletterSubscription: true,
    
    // Appearance
    darkMode: mode === 'dark',
    compactView: false,
    showAnimations: true,
    colorScheme: 'default',
    
    // Data & Privacy
    dataSharing: true,
    anonymousUsage: true,
    autoExport: false,
    dataRetention: '90',
    
    // Territory
    primaryTerritory: 'NY',
    secondaryTerritories: ['FL'],
    autoDetectLocation: true,
    marketRadius: '50',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement save to backend
    console.log('Saving settings:', settings);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.95)' 
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
            <Tab icon={<PaletteIcon />} label="Appearance" iconPosition="start" />
            <Tab icon={<DataUsageIcon />} label="Data & Privacy" iconPosition="start" />
            <Tab icon={<MapIcon />} label="Territory" iconPosition="start" />
            <Tab icon={<SyncIcon />} label="Integrations" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Connected as: {user?.email}
            </Alert>
            
            <TextField
              label="Display Name"
              value={settings.displayName}
              onChange={(e) => handleSettingChange('displayName', e.target.value)}
              fullWidth
              variant="outlined"
            />
            
            <TextField
              label="Phone Number"
              value={settings.phoneNumber}
              onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="+1 (555) 123-4567"
            />
            
            <FormControl fullWidth>
              <InputLabel>Primary Territory</InputLabel>
              <Select
                value={settings.territory}
                onChange={(e) => handleSettingChange('territory', e.target.value)}
                label="Primary Territory"
              >
                <MenuItem value="NY/FL">New York & Florida</MenuItem>
                <MenuItem value="NY">New York Only</MenuItem>
                <MenuItem value="FL">Florida Only</MenuItem>
                <MenuItem value="CA">California</MenuItem>
                <MenuItem value="TX">Texas</MenuItem>
              </Select>
            </FormControl>
            
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Account Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2">Premium Account Active</Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Enable email notifications"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.newsletterSubscription}
                    onChange={(e) => handleSettingChange('newsletterSubscription', e.target.checked)}
                  />
                }
                label="Weekly market insights newsletter"
              />
            </FormGroup>
            
            <Divider />
            
            <Typography variant="h6" gutterBottom>
              Push Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                }
                label="SMS notifications for urgent updates"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.desktopNotifications}
                    onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
                  />
                }
                label="Desktop push notifications"
              />
            </FormGroup>
            
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              SMS notifications require phone number verification
            </Alert>
          </Stack>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.darkMode}
                    onChange={(e) => {
                      handleSettingChange('darkMode', e.target.checked);
                      toggleTheme();
                    }}
                  />
                }
                label="Dark mode"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.compactView}
                    onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                  />
                }
                label="Compact view"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.showAnimations}
                    onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
                  />
                }
                label="Enable animations"
              />
            </FormGroup>
            
            <Divider />
            
            <Typography variant="h6" gutterBottom>
              Color Scheme
            </Typography>
            <Grid container spacing={2}>
              {['default', 'blue', 'purple', 'green'].map(scheme => (
                <Grid item xs={6} key={scheme}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: settings.colorScheme === scheme ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                    onClick={() => handleSettingChange('colorScheme', scheme)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          bgcolor: scheme === 'default' ? '#00ffc6' : 
                                  scheme === 'blue' ? '#2196f3' :
                                  scheme === 'purple' ? '#9c27b0' : '#4caf50',
                          mx: 'auto',
                          mb: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {scheme}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </TabPanel>

        {/* Data & Privacy Tab */}
        <TabPanel value={activeTab} index={3}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Your data is encrypted and stored securely. We never sell your information.
            </Alert>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.dataSharing}
                    onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                  />
                }
                label="Share anonymous usage data to improve the product"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.anonymousUsage}
                    onChange={(e) => handleSettingChange('anonymousUsage', e.target.checked)}
                  />
                }
                label="Contribute to market trends analysis"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.autoExport}
                    onChange={(e) => handleSettingChange('autoExport', e.target.checked)}
                  />
                }
                label="Auto-export data weekly"
              />
            </FormGroup>
            
            <Divider />
            
            <FormControl fullWidth>
              <InputLabel>Data Retention Period</InputLabel>
              <Select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                label="Data Retention Period"
              >
                <MenuItem value="30">30 days</MenuItem>
                <MenuItem value="90">90 days</MenuItem>
                <MenuItem value="180">180 days</MenuItem>
                <MenuItem value="365">1 year</MenuItem>
                <MenuItem value="forever">Forever</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<WarningIcon />}
              fullWidth
            >
              Delete All My Data
            </Button>
          </Stack>
        </TabPanel>

        {/* Territory Tab */}
        <TabPanel value={activeTab} index={4}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Territory Management
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Primary Territory</InputLabel>
              <Select
                value={settings.primaryTerritory}
                onChange={(e) => handleSettingChange('primaryTerritory', e.target.value)}
                label="Primary Territory"
              >
                <MenuItem value="NY">New York</MenuItem>
                <MenuItem value="FL">Florida</MenuItem>
                <MenuItem value="CA">California</MenuItem>
                <MenuItem value="TX">Texas</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Secondary Territories
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {settings.secondaryTerritories.map(territory => (
                  <Chip
                    key={territory}
                    label={territory}
                    onDelete={() => {
                      handleSettingChange(
                        'secondaryTerritories',
                        settings.secondaryTerritories.filter(t => t !== territory)
                      );
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                <Chip
                  label="+ Add Territory"
                  onClick={() => {/* TODO: Add territory dialog */}}
                  variant="outlined"
                  sx={{ borderStyle: 'dashed' }}
                />
              </Stack>
            </Box>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={settings.autoDetectLocation}
                  onChange={(e) => handleSettingChange('autoDetectLocation', e.target.checked)}
                />
              }
              label="Auto-detect my location"
            />
            
            <TextField
              label="Market Radius (miles)"
              value={settings.marketRadius}
              onChange={(e) => handleSettingChange('marketRadius', e.target.value)}
              type="number"
              fullWidth
              InputProps={{
                endAdornment: <Typography variant="caption">miles</Typography>
              }}
            />
            
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Coverage Statistics
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Providers
                    </Typography>
                    <Typography variant="h6">
                      2,847
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Market Value
                    </Typography>
                    <Typography variant="h6">
                      $1.2B
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={activeTab} index={5}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Connected Services
            </Typography>
            
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Salesforce CRM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sync contacts and opportunities
                    </Typography>
                  </Box>
                  <Chip
                    label="Connected"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Google Calendar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sync appointments and scheduling
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Connect
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Slack
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive notifications in Slack
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Connect
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Divider />
            
            <Typography variant="h6" gutterBottom>
              API Access
            </Typography>
            
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  API Key
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  sk_live_****************************7d9f
                </Typography>
                <Button variant="outlined" size="small" fullWidth>
                  Regenerate API Key
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>
      </DialogContent>
      
      <Box sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSaveSettings}
          startIcon={<CloudUploadIcon />}
        >
          Save Changes
        </Button>
      </Box>
    </Dialog>
  );
};


SettingsModal.displayName = 'SettingsModal';export default SettingsModal;