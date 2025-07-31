import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Stack,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome,
  Schedule,
  Email,
  Campaign,
  TrendingUp,
  Warning,
  CheckCircle,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Settings,
  NotificationsActive,
  Timer,
  Speed
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { logger } from '../../services/logging/logger';


interface Automation {
  id: string;
  name: string;
  type: 'market-trigger' | 'time-based' | 'event-based' | 'threshold';
  status: 'active' | 'paused' | 'draft';
  trigger: {
    condition: string;
    value?: number;
    comparison?: 'greater' | 'less' | 'equals';
  };
  actions: string[];
  lastRun?: Date;
  nextRun?: Date;
  successRate?: number;
  notificationsSent?: number;
}

const AutomationPanel: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'High Growth Alert',
      type: 'market-trigger',
      status: 'active',
      trigger: {
        condition: 'Category growth rate exceeds',
        value: 15,
        comparison: 'greater'
      },
      actions: [
        'Email top 10 prospects in category',
        'Schedule follow-up calls',
        'Generate market report'
      ],
      lastRun: new Date('2024-01-18'),
      nextRun: new Date('2024-01-25'),
      successRate: 82,
      notificationsSent: 47
    },
    {
      id: '2',
      name: 'Competitor Activity Monitor',
      type: 'event-based',
      status: 'active',
      trigger: {
        condition: 'Competitor launches new product'
      },
      actions: [
        'Alert sales team',
        'Update battle cards',
        'Prepare counter-offer templates'
      ],
      lastRun: new Date('2024-01-15'),
      successRate: 95,
      notificationsSent: 12
    },
    {
      id: '3',
      name: 'Quarterly Business Review',
      type: 'time-based',
      status: 'active',
      trigger: {
        condition: 'Every 3 months'
      },
      actions: [
        'Generate QBR deck',
        'Schedule customer meetings',
        'Send pre-meeting surveys'
      ],
      nextRun: new Date('2024-02-01'),
      successRate: 100,
      notificationsSent: 28
    },
    {
      id: '4',
      name: 'At-Risk Account Alert',
      type: 'threshold',
      status: 'paused',
      trigger: {
        condition: 'No activity for',
        value: 60,
        comparison: 'greater'
      },
      actions: [
        'Flag account as at-risk',
        'Assign to retention specialist',
        'Offer special promotion'
      ],
      successRate: 71,
      notificationsSent: 8
    }
  ]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const getTypeIcon = (type: Automation['type']) => {
    switch (type) {
      case 'market-trigger': return <TrendingUp />;
      case 'time-based': return <Schedule />;
      case 'event-based': return <NotificationsActive />;
      case 'threshold': return <Warning />;
    }
  };

  const getStatusColor = (status: Automation['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'default';
    }
  };

  const handleToggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
        : auto
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Sales Automations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          size="small"
        >
          New Automation
        </Button>
      </Box>

      {/* Summary Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4">{automations.filter(a => a.status === 'active').length}</Typography>
            <Typography variant="caption" color="text.secondary">Active</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4">
              {automations.reduce((sum, a) => sum + (a.notificationsSent || 0), 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Actions Taken</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h4">
              {Math.round(automations.reduce((sum, a) => sum + (a.successRate || 0), 0) / automations.length)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">Success Rate</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Automations List */}
      <Stack spacing={2}>
        {automations.map((automation) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card elevation={automation.status === 'active' ? 2 : 1}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ListItemIcon>
                    {getTypeIcon(automation.type)}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {automation.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {automation.trigger.condition} {automation.trigger.value && 
                        `${automation.trigger.value}${automation.trigger.condition.includes('days') ? ' days' : '%'}`
                      }
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={automation.status} 
                      size="small"
                      color={getStatusColor(automation.status)}
                    />
                    <Switch
                      checked={automation.status === 'active'}
                      onChange={() => handleToggleAutomation(automation.id)}
                      size="small"
                    />
                    <IconButton size="small">
                      <Settings />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Actions */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Actions:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                    {automation.actions.map((action, idx) => (
                      <Chip 
                        key={idx}
                        label={action} 
                        size="small" 
                        variant="outlined"
                        icon={
                          action.includes('Email') ? <Email /> : 
                          action.includes('Schedule') ? <Schedule /> :
                          <Campaign />
                        }
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Metrics */}
                {automation.successRate && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Success Rate</Typography>
                      <Typography variant="caption">{automation.successRate}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={automation.successRate}
                      color={automation.successRate > 80 ? 'success' : 'warning'}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )}

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={2}>
                    {automation.lastRun && (
                      <Typography variant="caption" color="text.secondary">
                        Last run: {automation.lastRun.toLocaleDateString()}
                      </Typography>
                    )}
                    {automation.nextRun && (
                      <Typography variant="caption" color="primary">
                        Next run: {automation.nextRun.toLocaleDateString()}
                      </Typography>
                    )}
                  </Stack>
                  <Button size="small" startIcon={<PlayArrow />}>
                    Run Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>

      {/* Quick Templates */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quick Templates
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip 
            label="New Product Launch" 
            onClick={() => logger.info('Create from template')}
            icon={<AutoAwesome />}
          />
          <Chip 
            label="Win-Back Campaign" 
            onClick={() => logger.info('Create from template')}
            icon={<Campaign />}
          />
          <Chip 
            label="Seasonal Promotion" 
            onClick={() => logger.info('Create from template')}
            icon={<Timer />}
          />
          <Chip 
            label="Competition Alert" 
            onClick={() => logger.info('Create from template')}
            icon={<Warning />}
          />
        </Stack>
      </Box>

      {/* Create Automation Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Automation</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Automation Name"
              fullWidth
              placeholder="e.g., High Growth Category Alert"
            />
            
            <FormControl fullWidth>
              <InputLabel>Trigger Type</InputLabel>
              <Select defaultValue="market-trigger">
                <MenuItem value="market-trigger">Market Trigger</MenuItem>
                <MenuItem value="time-based">Time Based</MenuItem>
                <MenuItem value="event-based">Event Based</MenuItem>
                <MenuItem value="threshold">Threshold</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Trigger Condition"
              fullWidth
              placeholder="e.g., When category growth exceeds 15%"
              multiline
              rows={2}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Actions to Perform
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel 
                  control={<Checkbox defaultChecked />} 
                  label="Send email to relevant accounts"
                />
                <FormControlLabel 
                  control={<Checkbox defaultChecked />} 
                  label="Create tasks in CRM"
                />
                <FormControlLabel 
                  control={<Checkbox />} 
                  label="Generate market report"
                />
                <FormControlLabel 
                  control={<Checkbox />} 
                  label="Schedule follow-up calls"
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
            Create Automation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


AutomationPanel.displayName = 'AutomationPanel';export default AutomationPanel;