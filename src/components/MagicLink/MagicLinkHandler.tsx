import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import { MagicLinkAuthService } from '../../services/magicLinkAuth';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export const MagicLinkHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [contentData, setContentData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      verifyAndProcessMagicLink();
    }
  }, [token]);

  const verifyAndProcessMagicLink = async () => {
    try {
      setStatus('verifying');
      
      // Verify the magic link
      const verification = await MagicLinkAuthService.verifyMagicLink(token!);
      
      if (!verification.valid) {
        setStatus('error');
        setError('This link is invalid or has expired.');
        setLoading(false);
        return;
      }

      // Fetch the content based on type and ID
      const content = await fetchPremiumContent(
        verification.contentType!,
        verification.contentId
      );

      // Generate email content
      const emailContent = await MagicLinkAuthService.createPremiumContentEmail(
        verification.contentType!,
        content
      );

      // Generate mailto link
      const mailtoLink = await MagicLinkAuthService.generateMailtoLink(
        verification.email!,
        emailContent
      );

      setContentData({
        ...content,
        email: verification.email,
        contentType: verification.contentType,
        price: verification.price,
        mailtoLink
      });

      setStatus('success');
      
      // Auto-open email client after 2 seconds
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 2000);
      
    } catch (err) {
      console.error('Magic link error:', err);
      setStatus('error');
      setError('An error occurred processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumContent = async (contentType: string, contentId?: string) => {
    // This would fetch the actual content from your database
    // For now, returning mock data based on content type
    
    switch (contentType) {
      case 'market_report':
        return {
          market: 'New York Metro',
          executiveSummary: 'The NYC dental market shows strong growth with aesthetic procedures leading adoption.',
          marketSize: 450,
          growth: 12.5,
          topProcedures: ['Invisalign', 'Dental Implants', 'Teeth Whitening'],
          leadingProviders: '15 key practices identified',
          opportunities: 'Digital dentistry adoption accelerating, particularly in Manhattan practices.',
          competitive: 'Competitive landscape favors tech-forward practices.',
          recommendations: 'Focus on digital workflow solutions and aesthetic procedures.'
        };
      
      case 'provider_intel':
        return {
          providerName: 'Dr. Sarah Chen',
          specialty: 'Cosmetic Dentistry',
          location: 'Manhattan, NY',
          yearsInPractice: 15,
          practiceSize: 'Large (6+ chairs)',
          patientVolume: 450,
          keyProcedures: ['Veneers', 'Invisalign', 'Dental Implants'],
          techAdoption: 'Early adopter - Uses CAD/CAM, 3D imaging, digital impressions',
          purchasingPatterns: 'Quarterly bulk orders, prefers premium brands',
          engagementStrategy: 'Values clinical evidence and ROI data',
          talkingPoints: 'Focus on patient satisfaction metrics and workflow efficiency'
        };
      
      case 'territory_insights':
        return {
          territory: 'Manhattan East',
          period: 'Q1 2025',
          opportunities: [
            { provider: 'Park Avenue Dental', potential: '$125K', reason: 'Expanding to 3rd location' },
            { provider: 'Madison Smiles', potential: '$85K', reason: 'Upgrading imaging equipment' },
            { provider: 'East Side Orthodontics', potential: '$95K', reason: 'Adding clear aligner service' }
          ],
          territoryValue: 12.5,
          penetration: 35,
          growthPotential: 45,
          competitive: 'Primary competitor has 25% share, vulnerable on service',
          actionItems: [
            'Schedule Q1 business reviews with top 5 accounts',
            'Demo new digital workflow at Madison Smiles',
            'Proposal for Park Avenue expansion project'
          ],
          forecast: 'Projected 25% growth based on identified opportunities'
        };
      
      case 'cpt_analysis':
        return {
          procedureCategory: 'Restorative Dentistry',
          procedures: [
            { code: 'D2740', name: 'Crown - Porcelain/Ceramic', avgCost: 1200, insuranceCoverage: 50, volume: 125000, growth: 8 },
            { code: 'D2750', name: 'Crown - Porcelain fused to metal', avgCost: 1000, insuranceCoverage: 50, volume: 98000, growth: -2 },
            { code: 'D2391', name: 'Composite filling - 1 surface', avgCost: 250, insuranceCoverage: 80, volume: 450000, growth: 5 }
          ],
          reimbursementInsights: 'Insurance companies trending toward ceramic crown coverage',
          regionalVariations: 'NYC rates 25% above national average',
          opportunities: 'Ceramic crowns showing strongest growth and margin potential'
        };
      
      default:
        throw new Error('Unknown content type');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} />
          <Typography variant="h5">
            {status === 'verifying' ? 'Verifying your access...' : 'Preparing your content...'}
          </Typography>
        </Box>
      );
    }

    if (status === 'error') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
          <Typography variant="h5" color="error">
            Access Error
          </Typography>
          <Typography color="text.secondary">
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Box>
      );
    }

    if (status === 'success' && contentData) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
          <Typography variant="h5" color="success.main">
            Content Ready!
          </Typography>
          <Typography variant="body1" align="center">
            Your premium {contentData.contentType.replace('_', ' ')} is being opened in your email client.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            The email will be pre-populated with your personalized content.
            Simply review and click send!
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mt: 2, maxWidth: 500 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content Details:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Type: {contentData.contentType.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Recipient: {contentData.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Price Paid: ${contentData.price}
            </Typography>
          </Paper>

          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={() => window.location.href = contentData.mailtoLink}
            >
              Open in Email Client
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            If your email client doesn&apos;t open automatically, click the button above.
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={3}
    >
      <Paper elevation={6} sx={{ p: 6, maxWidth: 600, width: '100%' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Sphere Intelligence Platform
          </Typography>
          {renderContent()}
        </Box>
      </Paper>
    </Box>
  );
};

MagicLinkHandler.displayName = 'MagicLinkHandler';