import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PremiumMarketDashboard from './components/Dashboard/PremiumMarketDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import { QuantumMarketDashboard, EnhancedMarketDashboard, MarketCommandCenter, EnhancedMarketCommandCenter, TerritoryIntelligenceDashboard } from './components/Dashboard';
import EnhancedMarketCommandCenterWithWidget from './components/Dashboard/EnhancedMarketCommandCenterWithWidget';
import TestDashboard from './components/Dashboard/TestDashboard';
import GaugeShowcase from './components/Dashboard/GaugeShowcase';
import { OrbContextProvider } from './assets/OrbContextProvider';
import RepSpheresNavbar from './components/Navigation/RepSpheresNavbar';
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
import { usePreventHomeRedirect } from './hooks/usePreventHomeRedirect';


// Main App Content
const AppContent: React.FC = () => {
  const [salesMode, setSalesMode] = useState(false);
  const location = useLocation();
  
  // Prevent authenticated users from being stuck on homepage
  usePreventHomeRedirect();

  return (
    <OrbContextProvider>
      
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
          <RepSpheresNavbar 
            onLogin={() => {/* handled by navbar */}}
            onSignup={() => {/* handled by navbar */}}
            customLinks={[
              { href: '/market-data', label: 'Market Data', icon: 'market' },
              { href: '/canvas', label: 'Canvas', icon: 'canvas' },
              { href: '/pipeline', label: 'Pipeline', icon: 'pipeline' },
              { href: '/sphere-os', label: 'Sphere oS', icon: 'sphere' },
              { href: '/podcasts', label: 'Podcasts', icon: 'podcasts' }
            ]}
            logoHref="/market-data"
          />
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
