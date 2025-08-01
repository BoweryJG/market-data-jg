import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  TextField,
  Slider,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Avatar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Instagram,
  Twitter,
  YouTube,
  TrendingUp,
  Calculate,
  LocalHospital,
  AttachMoney,
  Timer,
  CheckCircle,
  Warning,
  ExpandMore,
  PhotoCamera,
  CompareArrows,
  Psychology,
  Savings,
  Security,
  Groups,
  AutoGraph,
  MedicalServices,
  Description,
  Search,
  FilterList,
  CreditCard,
  AccountBalance,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children,  value, index,  ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`industry-tabpanel-${index}`}
      aria-labelledby={`industry-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Aesthetic Industry Components
const AestheticTools: React.FC = () => {
  const theme = useTheme();
  const [roiInputs, setRoiInputs] = useState({
    procedureType: 'botox',
    pricePerUnit: 12,
    unitsPerTreatment: 50,
    treatmentsPerMonth: 20,
    overhead: 30,
  });
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const revenue = roiInputs.unitsPerTreatment * roiInputs.pricePerUnit * roiInputs.treatmentsPerMonth;
  const profit = revenue * (1 - roiInputs.overhead / 100);
  const annualProfit = profit * 12;

  const trendingTreatments = [
    { name: 'Lip Filler', growth: '+45%', platform: 'TikTok', icon: <Instagram /> },
    { name: 'PDO Threads', growth: '+32%', platform: 'Instagram', icon: <Instagram /> },
    { name: 'PRF Treatment', growth: '+28%', platform: 'YouTube', icon: <YouTube /> },
    { name: 'Body Contouring', growth: '+25%', platform: 'Instagram', icon: <Instagram /> },
  ];

  const influencers = [
    { name: 'Dr. Miami', followers: '5.2M', engagement: '8.2%', specialty: 'Body Sculpting' },
    { name: 'The Lip King', followers: '2.8M', engagement: '12.5%', specialty: 'Lip Enhancement' },
    { name: 'Nurse Jamie', followers: '1.5M', engagement: '10.8%', specialty: 'Non-Surgical' },
  ];

  return (
    <Box>
      {/* ROI Calculator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <Calculate sx={{ mr: 1,  verticalAlign: 'middle' }} />
            Treatment ROI Calculator
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Procedure Type</InputLabel>
                <Select
                  value={roiInputs.procedureType}
                  onChange={(e) => setRoiInputs({ ...roiInputs, procedureType: e.target.value })}
                >
                  <MenuItem value="botox">Botox</MenuItem>
                  <MenuItem value="filler">Dermal Filler</MenuItem>
                  <MenuItem value="pdo">PDO Threads</MenuItem>
                  <MenuItem value="prp">PRP/PRF</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Price per Unit/Syringe"
                type="number"
                value={roiInputs.pricePerUnit}
                onChange={(e) => setRoiInputs({ ...roiInputs, pricePerUnit: Number(e.target.value) })}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              
              <TextField
                fullWidth
                label="Units/Syringes per Treatment"
                type="number"
                value={roiInputs.unitsPerTreatment}
                onChange={(e) => setRoiInputs({ ...roiInputs, unitsPerTreatment: Number(e.target.value) })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Treatments per Month"
                type="number"
                value={roiInputs.treatmentsPerMonth}
                onChange={(e) => setRoiInputs({ ...roiInputs, treatmentsPerMonth: Number(e.target.value) })}
                margin="normal"
              />
              
              <Box mt={2} mb={3}>
                <Typography gutterBottom>Overhead (%)</Typography>
                <Slider
                  value={roiInputs.overhead}
                  onChange={(_event: Event,  value: number | number[]) => setRoiInputs({ ...roiInputs, overhead: value as number })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50}
                />
              </Box>
              
              <Paper sx={{ p: 2, background: theme.palette.success.light + '20' }}>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Monthly Revenue:</Typography>
                    <Typography fontWeight="bold">${revenue.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Monthly Profit:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      ${profit.toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Annual Profit:</Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      ${annualProfit.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Social Media Trends */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
            Trending Treatments on Social Media
          </Typography>
          
          <Grid container spacing={2}>
            {trendingTreatments.map((treatment, _index) => (
              <Grid item xs={12} sm={6} key={_index}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ backgroundColor: theme.palette.primary.light }}>
                      {treatment.icon}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">{treatment.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {treatment.platform}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={treatment.growth}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Before/After Gallery */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
              Before/After Gallery
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CompareArrows />}
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            >
              Toggle Comparison
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Professional before/after photos help increase conversion rates by up to 37%
          </Alert>
          
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} md={3} key={item}>
                <Card>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 150,
                      backgroundColor: theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhotoCamera color="disabled" />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="body2" textAlign="center">
                      Case Study #{item}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Influencer Partnerships */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <Groups sx={{ mr: 1, verticalAlign: 'middle' }} />
            Potential Influencer Partnerships
          </Typography>
          
          <List>
            {influencers.map((influencer, _index) => (
              <React.Fragment key={_index}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ backgroundColor: theme.palette.secondary.main }}>
                      {influencer.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={influencer.name}
                    secondary={`${influencer.followers} followers • ${influencer.engagement} engagement • ${influencer.specialty}`}
                  />
                  <Button variant="outlined" size="small">
                    View Profile
                  </Button>
                </ListItem>
                {_index < influencers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

// Dental Industry Components
const DentalTools: React.FC = () => {
  const theme = useTheme();
  const [selectedProcedure, setSelectedProcedure] = useState('D2740');
  const [patientVolume, setPatientVolume] = useState(100);
  const [financingOption, setFinancingOption] = useState('carecredit');

  const cdtCodes = [
    { code: 'D2740', name: 'Crown - Porcelain/Ceramic', coverage: '50%', avgFee: '$1,200' },
    { code: 'D6010', name: 'Implant - Endosteal', coverage: '0%', avgFee: '$2,500' },
    { code: 'D8090', name: 'Invisalign Treatment', coverage: '0-50%', avgFee: '$5,000' },
    { code: 'D4341', name: 'Scaling & Root Planing', coverage: '80%', avgFee: '$300' },
  ];

  const insuranceProviders = [
    { name: 'Delta Dental', patients: '40%', reimbursement: 'High' },
    { name: 'Cigna Dental', patients: '25%', reimbursement: 'Medium' },
    { name: 'Aetna Dental', patients: '20%', reimbursement: 'Medium' },
    { name: 'Cash/Self-Pay', patients: '15%', reimbursement: 'N/A' },
  ];

  return (
    <Box>
      {/* CDT Code Reference */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <Description sx={{ mr: 1,  verticalAlign: 'middle' }} />
            CDT Code Quick Reference
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search CDT codes..."
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>, 
            }}
          />
          
          <List>
            {cdtCodes.map((code, _index) => (
              <React.Fragment key={code.code}>
                <ListItem
                  button
                  selected={selectedProcedure === code.code}
                  onClick={() => setSelectedProcedure(code.code)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light + '20',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight="bold">{code.code}</Typography>
                        <Typography color="primary" fontWeight="bold">
                          {code.avgFee}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">{code.name}</Typography>
                        <Chip
                          label={`Insurance: ${code.coverage}`}
                          size="small"
                          color={code.coverage === '0%' ? 'error' : 'success'}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Practice Volume Estimator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <AutoGraph sx={{ mr: 1, verticalAlign: 'middle' }} />
            Practice Volume Estimator
          </Typography>
          
          <Box mb={3}>
            <Typography gutterBottom>Average Patients per Month</Typography>
            <Slider
              value={patientVolume}
              onChange={(_event: Event,  value: number | number[]) => setPatientVolume(value as number)}
              valueLabelDisplay="auto"
              min={50}
              max={500}
              step={10}
              marks={[
                { value: 50, label: '50' },
                { value: 250, label: '250' },
                { value: 500, label: '500' },
              ]}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.info.light + '20' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {Math.round(patientVolume * 0.3)}
                </Typography>
                <Typography variant="body2">Hygiene Visits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.warning.light + '20' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {Math.round(patientVolume * 0.15)}
                </Typography>
                <Typography variant="body2">Major Procedures</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Alert severity="success" sx={{ mt: 2 }}>
            Estimated annual revenue potential: ${(patientVolume * 2000 * 12).toLocaleString()}
          </Alert>
        </CardContent>
      </Card>

      {/* Insurance Mix Analysis */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            Insurance Mix Analysis
          </Typography>
          
          {insuranceProviders.map((provider, _index) => (
            <Box key={_index} mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1">{provider.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {provider.patients} of patients
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={parseInt(provider.patients)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Reimbursement Rate: {provider.reimbursement}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Equipment Financing Calculator */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
            Equipment Financing Options
          </Typography>
          
          <ToggleButtonGroup
            value={financingOption}
            exclusive
            onChange={(_,  value) => value && setFinancingOption(value)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="carecredit">CareCredit</ToggleButton>
            <ToggleButton value="wells">Wells Fargo</ToggleButton>
            <ToggleButton value="td">TD Bank</ToggleButton>
          </ToggleButtonGroup>
          
          <Paper sx={{ p: 2, backgroundColor: theme.palette.primary.light + '10' }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Equipment Cost:</Typography>
                <Typography fontWeight="bold">$45,000</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Down Payment:</Typography>
                <Typography>$4,500 (10%)</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Term:</Typography>
                <Typography>60 months</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Interest Rate:</Typography>
                <Typography>5.9% APR</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Monthly Payment:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  $782
                </Typography>
              </Box>
            </Stack>
          </Paper>
          
          <Button variant="contained" fullWidth sx={{ mt: 2 }}>
            Generate Financing Proposal
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

const IndustrySpecificTools: React.FC = () => {
  const [industry, setIndustry] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Industry-Specific Tools
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={industry}
          onChange={(_: React.SyntheticEvent,  value: number) => setIndustry(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontSize: '1rem',
              fontWeight: 'medium',
            },
          }}
        >
          <Tab
            label="Aesthetic Industry"
            icon={<Psychology />}
            iconPosition="start"
          />
          <Tab
            label="Dental Industry"
            icon={<MedicalServices />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      <TabPanel value={industry} index={0}>
        <AestheticTools />
      </TabPanel>
      
      <TabPanel value={industry} index={1}>
        <DentalTools />
      </TabPanel>
    </Box>
  );
};

IndustrySpecificTools.displayName = 'IndustrySpecificTools';export default IndustrySpecificTools;