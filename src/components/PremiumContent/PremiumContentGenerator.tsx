import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import { MagicLinkAuthService } from '../../services/magicLinkAuth';

interface ContentOption {
  type: 'market_report' | 'provider_intel' | 'territory_insights' | 'cpt_analysis';
  title: string;
  description: string;
  icon: JSX.Element;
  basePrice: number;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
    required?: boolean;
  }>;
}

const contentOptions: ContentOption[] = [
  {
    type: 'market_report',
    title: 'Market Intelligence Report',
    description: 'Comprehensive market analysis with trends, opportunities, and competitive insights',
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    basePrice: 99,
    fields: [
      { name: 'market', label: 'Market Location', type: 'select', options: ['New York Metro', 'Miami-Dade', 'Los Angeles', 'Chicago', 'Houston'], required: true },
      { name: 'specialty', label: 'Specialty Focus', type: 'select', options: ['All Specialties', 'Dental', 'Aesthetic', 'Orthodontic', 'Oral Surgery'] },
      { name: 'depth', label: 'Analysis Depth', type: 'select', options: ['Executive Summary', 'Standard Report', 'Deep Dive Analysis'] }
    ]
  },
  {
    type: 'provider_intel',
    title: 'Provider Intelligence Brief',
    description: 'Detailed provider profile with purchasing patterns and engagement strategies',
    icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
    basePrice: 49,
    fields: [
      { name: 'providerName', label: 'Provider Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'includeCompetitive', label: 'Include Competitive Intel', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    type: 'territory_insights',
    title: 'Territory Insights Report',
    description: 'Territory performance metrics with opportunities and action items',
    icon: <MapIcon sx={{ fontSize: 40 }} />,
    basePrice: 149,
    fields: [
      { name: 'territory', label: 'Territory', type: 'text', required: true },
      { name: 'period', label: 'Time Period', type: 'select', options: ['Last 30 Days', 'Last Quarter', 'YTD', 'Custom'], required: true },
      { name: 'focusArea', label: 'Focus Area', type: 'select', options: ['All Products', 'New Launches', 'Growth Opportunities', 'At-Risk Accounts'] }
    ]
  },
  {
    type: 'cpt_analysis',
    title: 'CPT Code Analysis',
    description: 'Procedure economics with reimbursement rates and regional variations',
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
    basePrice: 79,
    fields: [
      { name: 'category', label: 'Procedure Category', type: 'select', options: ['Restorative', 'Cosmetic', 'Surgical', 'Diagnostic', 'Preventive'], required: true },
      { name: 'region', label: 'Region', type: 'select', options: ['National Average', 'Northeast', 'Southeast', 'Midwest', 'West Coast'] },
      { name: 'includeForecasting', label: 'Include Forecasting', type: 'select', options: ['Yes', 'No'] }
    ]
  }
];

const pricingTiers = {
  basic: { multiplier: 1, name: 'Basic', features: ['Standard content', 'Email delivery'] },
  pro: { multiplier: 1.5, name: 'Professional', features: ['Enhanced analytics', 'Priority delivery', 'Custom branding'] },
  enterprise: { multiplier: 2, name: 'Enterprise', features: ['White-label content', 'API access', 'Bulk pricing', 'Custom data'] }
};

export const PremiumContentGenerator: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ContentOption | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [recipientEmail, setRecipientEmail] = useState('');
  const [pricingTier, setPricingTier] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleContentSelect = (content: ContentOption) => {
    setSelectedContent(content);
    setFormData({});
    setSuccess(false);
    setError('');
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const calculatePrice = () => {
    if (!selectedContent) return 0;
    return selectedContent.basePrice * pricingTiers[pricingTier].multiplier;
  };

  const handleGenerateContent = () => {
    // Validate required fields
    const missingFields = selectedContent?.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields?.length) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmAndSend = async () => {
    setLoading(true);
    setShowConfirmDialog(false);
    setError('');

    try {
      // Create magic link
      const { token, url } = await MagicLinkAuthService.createMagicLink({
        email: recipientEmail,
        contentType: selectedContent!.type,
        contentId: JSON.stringify(formData),
        priceTier,
        price: calculatePrice(),
        expiryHours: 48
      });

      // Send email with magic link
      await MagicLinkAuthService.sendMagicLinkEmail(
        recipientEmail,
        url,
        selectedContent!.type,
        calculatePrice()
      );

      setSuccess(true);
      setFormData({});
      setRecipientEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Premium Content Generator
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Generate and deliver premium market intelligence directly to email
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Content generated successfully! Magic link sent to {recipientEmail}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Content Type Selection */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {contentOptions.map((option) => (
          <Grid item xs={12} sm={6} md={3} key={option.type}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedContent?.type === option.type ? 2 : 1,
                borderColor: selectedContent?.type === option.type ? 'primary.main' : 'divider',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
              }}
              onClick={() => handleContentSelect(option)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {option.description}
                </Typography>
                <Chip
                  label={`From $${option.basePrice}`}
                  color="primary"
                  size="small"
                  icon={<AttachMoneyIcon />}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content Configuration */}
      {selectedContent && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configure {selectedContent.title}
            </Typography>
            
            <Grid container spacing={3}>
              {selectedContent.fields.map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  {field.type === 'select' ? (
                    <FormControl fullWidth required={field.required}>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        label={field.label}
                      >
                        {field.options?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </Grid>
              ))}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient Email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  helperText="Email address to receive the content"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Pricing Tier</InputLabel>
                  <Select
                    value={pricingTier}
                    onChange={(e) => setPricingTier(e.target.value as any)}
                    label="Pricing Tier"
                  >
                    {Object.entries(pricingTiers).map(([key, tier]) => (
                      <MenuItem key={key} value={key}>
                        {tier.name} - ${(selectedContent.basePrice * tier.multiplier).toFixed(0)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Pricing Tier Features */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {pricingTiers[pricingTier].name} Features:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {pricingTiers[pricingTier].features.map((feature) => (
                  <Chip key={feature} label={feature} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>

            {/* Generate Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Total: ${calculatePrice()}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                onClick={handleGenerateContent}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate & Send'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Premium Content Generation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You are about to generate and send:
          </Typography>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2">
              • Content Type: {selectedContent?.title}
            </Typography>
            <Typography variant="subtitle2">
              • Recipient: {recipientEmail}
            </Typography>
            <Typography variant="subtitle2">
              • Pricing Tier: {pricingTiers[pricingTier].name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
              • Total Price: ${calculatePrice()}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            A magic link will be sent to the recipient's email. The link will be valid for 48 hours.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmAndSend} variant="contained" autoFocus>
            Confirm & Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};