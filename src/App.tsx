import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PremiumMarketDashboard from './components/Dashboard/PremiumMarketDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import { QuantumMarketDashboard, EnhancedMarketDashboard, MarketCommandCenter, EnhancedMarketCommandCenter, TerritoryIntelligenceDashboard } from './components/Dashboard';
import EnhancedMarketCommandCenterWithWidget from './components/Dashboard/EnhancedMarketCommandCenterWithWidget';
import TestDashboard from './components/Dashboard/TestDashboard';
import GaugeShowcase from './components/Dashboard/GaugeShowcase';
import { OrbContextProvider } from './assets/OrbContextProvider';
import PremiumNavbar from './components/Navigation/PremiumNavbar';
import NavBar from './assets/menubar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  SalesDashboard,
  FieldTools,
  IndustrySpecificTools,
  SalesIntelligenceHub,
  QuickActionsBar
} from './components/Sales';
import { MarketGalaxyMap } from './components/MarketGalaxy';
import { SalesWorkspace } from './components/Workspace';
import { Box, useMediaQuery, useTheme } from '@mui/material';

// OAuth Callback Handler Component
const OAuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check for OAuth tokens once and only if we have hash params
    if (!hasChecked && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/', { replace: true });
        setHasChecked(true);
        return;
      }

      if (accessToken) {
        // We have a new token from OAuth callback
        console.log('OAuth callback detected, current path:', location.pathname);
        // Clear the hash to prevent infinite loop
        window.history.replaceState({}, document.title, location.pathname);
        // Stay on the current page (should be /market-data from the OAuth redirect)
        setHasChecked(true);
        
        // If we're not already on market-data, navigate there
        if (location.pathname !== '/market-data') {
          navigate('/market-data', { replace: true });
        }
      }
    }
  }, [location, navigate, hasChecked]);

  return null;
};

// Main App Content
const AppContent: React.FC = () => {
  const [salesMode, setSalesMode] = useState(false);
  const location = useLocation();

  return (
    <OrbContextProvider>
      {/* Handle OAuth callbacks only on specific routes */}
      {(location.pathname === '/market-data' || location.pathname === '/') && <OAuthHandler />}
      
      {salesMode ? (
        <>
          <QuickActionsBar />
          <Box sx={{ pt: 8, pb: { xs: 7, sm: 0 } }}>
            <Routes>
              <Route path="/" element={<Navigate to="/sales-dashboard" />} />
              <Route path="/sales-dashboard" element={<SalesDashboard />} />
              <Route path="/field-tools" element={<FieldTools />} />
              <Route path="/industry-tools" element={<IndustrySpecificTools />} />
              <Route path="/intelligence" element={<SalesIntelligenceHub />} />
              <Route path="/market-data" element={
                <Box sx={{ p: 2 }}>
                  <Dashboard />
                </Box>
              } />
            </Routes>
          </Box>
        </>
      ) : (
        <>
          <PremiumNavbar />
          <Routes>
            <Route path="/" element={<PremiumMarketDashboard />} />
            <Route path="/market-data" element={<PremiumMarketDashboard />} />
            <Route path="/territory-intelligence" element={<TerritoryIntelligenceDashboard />} />
            <Route path="/canvas" element={<div style={{ padding: '2rem', textAlign: 'center', marginTop: '140px' }}><h2>Canvas - Coming Soon</h2></div>} />
            <Route path="/podcasts" element={<div style={{ padding: '2rem', textAlign: 'center', marginTop: '140px' }}><h2>Podcasts - Coming Soon</h2></div>} />
            <Route path="/sphere-os" element={<div style={{ padding: '2rem', textAlign: 'center', marginTop: '140px' }}><h2>Sphere oS - Coming Soon</h2></div>} />
            <Route path="/test" element={<TestDashboard />} />
            <Route path="/gauges" element={<GaugeShowcase />} />
            <Route path="/old-dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </OrbContextProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
