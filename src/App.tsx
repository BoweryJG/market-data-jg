import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ActionableSalesDashboard from './components/Dashboard/ActionableSalesDashboard';
import { QuantumMarketDashboard, EnhancedMarketDashboard, MarketCommandCenter } from './components/Dashboard';
import DashboardUpdated from './components/Dashboard/DashboardUpdated';
import SimpleLogin from './pages/SimpleLogin';
import AuthCallback from './pages/AuthCallback';
import { PublicMarketDashboard } from './components/Dashboard/PublicMarketDashboard';
import { OrbContextProvider } from './assets/OrbContextProvider';
import NavBar from './assets/menubar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthGuard } from './auth';
import { 
  SalesDashboard,
  FieldTools,
  IndustrySpecificTools,
  SalesIntelligenceHub,
  QuickActionsBar
} from './components/Sales';
import { MarketGalaxyMap } from './components/MarketGalaxy';
import { SalesWorkspace } from './components/Workspace';
import SupabaseTest from './components/Test/SupabaseTest';
import { MagicLinkHandler } from './components/MagicLink/MagicLinkHandler';
import { PremiumContentGenerator } from './components/PremiumContent/PremiumContentGenerator';
import { Box, useMediaQuery, useTheme, CssBaseline } from '@mui/material';

const App: React.FC = () => {
  const [salesMode, setSalesMode] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AuthGuard 
            allowPublic={true}
            publicComponent={
              <OrbContextProvider>
                <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
                  <PublicMarketDashboard 
                    onLoginSuccess={() => window.location.reload()}
                  />
                </Box>
              </OrbContextProvider>
            }
            redirectTo="/login"
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Checking authentication...
              </Box>
            }
          >
            <OrbContextProvider>
              {salesMode ? (
                <>
                  <QuickActionsBar />
                  <Box sx={{ pt: 8, pb: { xs: 7, sm: 0 }, minHeight: '100vh' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/sales-dashboard" />} />
                      <Route path="/sales-dashboard" element={<SalesDashboard />} />
                      <Route path="/field-tools" element={<FieldTools />} />
                      <Route path="/industry-tools" element={<IndustrySpecificTools />} />
                      <Route path="/intelligence" element={<SalesIntelligenceHub />} />
                      <Route path="/market-data" element={
                        <Box sx={{ p: 2 }}>
                          <ActionableSalesDashboard />
                        </Box>
                      } />
                    </Routes>
                  </Box>
                </>
              ) : (
                <>
                  <NavBar onSalesModeToggle={() => setSalesMode(true)} />
                  <Routes>
                    <Route path="/" element={<MarketCommandCenter />} />
                    <Route path="/login" element={<SimpleLogin />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/dashboard" element={<MarketCommandCenter />} />
                    <Route path="/enhanced" element={<EnhancedMarketDashboard />} />
                    <Route path="/updated" element={<DashboardUpdated />} />
                    <Route path="/actionable" element={<ActionableSalesDashboard />} />
                    <Route path="/quantum" element={<QuantumMarketDashboard />} />
                    <Route path="/workspace" element={<SalesWorkspace />} />
                    <Route path="/premium-content" element={<PremiumContentGenerator />} />
                    <Route path="/magic-link/:token" element={<MagicLinkHandler />} />
                    <Route path="/test" element={<SupabaseTest />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </>
              )}
            </OrbContextProvider>
          </AuthGuard>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;