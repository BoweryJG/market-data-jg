import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ActionableSalesDashboard from './components/Dashboard/ActionableSalesDashboard';
import { QuantumMarketDashboard, EnhancedMarketDashboard, MarketCommandCenter } from './components/Dashboard';
import DashboardUpdated from './components/Dashboard/DashboardUpdated';
import SimpleLogin from './pages/SimpleLogin';
import AuthCallback from './pages/AuthCallback';
import ManualAuthHandler from './pages/ManualAuthHandler';
import { PublicProceduresList } from './components/procedures/PublicProceduresList';
import { OrbContextProvider } from './assets/OrbContextProvider';
import { RepSpheresNavBar } from './components/ui/nav';
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
import ErrorBoundary from './components/Dashboard/ErrorBoundary';
import { Box, useMediaQuery, useTheme, CssBaseline } from '@mui/material';

const App: React.FC = () => {
  const [salesMode, setSalesMode] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <OrbContextProvider>
              <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', paddingTop: '120px' }}>
                <RepSpheresNavBar 
                  customLinks={[
                    { href: '/', label: 'Market Data', icon: 'market' },
                    { href: '/procedures', label: 'Procedures', icon: 'canvas' },
                    { href: '/dashboard', label: 'Dashboard', icon: 'pipeline' },
                    { href: '/workspace', label: 'Workspace', icon: 'sphere' }
                  ]}
                  logoHref="/"
                />
                <Routes>
                  {/* Public Routes - No Auth Required */}
                  <Route path="/" element={<MarketCommandCenter />} />
                  <Route path="/procedures" element={<PublicProceduresList />} />
                  <Route path="/login" element={<SimpleLogin />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/manual" element={<ManualAuthHandler />} />
                  <Route path="/magic-link/:token" element={<MagicLinkHandler />} />
                  
                  {/* Protected Routes - Auth Required */}
                  <Route path="/dashboard" element={
                    <AuthGuard redirectTo="/login">
                      <MarketCommandCenter />
                    </AuthGuard>
                  } />
                  <Route path="/enhanced" element={
                    <AuthGuard redirectTo="/login">
                      <EnhancedMarketDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/updated" element={
                    <AuthGuard redirectTo="/login">
                      <DashboardUpdated />
                    </AuthGuard>
                  } />
                  <Route path="/actionable" element={
                    <AuthGuard redirectTo="/login">
                      <ActionableSalesDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/quantum" element={
                    <AuthGuard redirectTo="/login">
                      <QuantumMarketDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/workspace" element={
                    <AuthGuard redirectTo="/login">
                      <SalesWorkspace />
                    </AuthGuard>
                  } />
                  <Route path="/premium-content" element={
                    <AuthGuard redirectTo="/login">
                      <PremiumContentGenerator />
                    </AuthGuard>
                  } />
                  <Route path="/sales-dashboard" element={
                    <AuthGuard redirectTo="/login">
                      <SalesDashboard />
                    </AuthGuard>
                  } />
                  <Route path="/field-tools" element={
                    <AuthGuard redirectTo="/login">
                      <FieldTools />
                    </AuthGuard>
                  } />
                  <Route path="/industry-tools" element={
                    <AuthGuard redirectTo="/login">
                      <IndustrySpecificTools />
                    </AuthGuard>
                  } />
                  <Route path="/intelligence" element={
                    <AuthGuard redirectTo="/login">
                      <SalesIntelligenceHub />
                    </AuthGuard>
                  } />
                  <Route path="/test" element={<SupabaseTest />} />
                  
                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </OrbContextProvider>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;