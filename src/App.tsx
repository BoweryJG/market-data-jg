import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import { QuantumMarketDashboard, EnhancedMarketDashboard, MarketCommandCenter, EnhancedMarketCommandCenter, TerritoryIntelligenceDashboard } from './components/Dashboard';
import EnhancedMarketCommandCenterWithWidget from './components/Dashboard/EnhancedMarketCommandCenterWithWidget';
import TestDashboard from './components/Dashboard/TestDashboard';
import { OrbContextProvider } from './assets/OrbContextProvider';
import NavBar from './assets/menubar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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

const App: React.FC = () => {
  const [salesMode, setSalesMode] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
                <NavBar onSalesModeToggle={() => setSalesMode(true)} />
                <Routes>
                  <Route path="/" element={<EnhancedMarketCommandCenterWithWidget />} />
                  <Route path="/enhanced-command" element={<EnhancedMarketCommandCenterWithWidget />} />
                  <Route path="/territory-intelligence" element={<TerritoryIntelligenceDashboard />} />
                  <Route path="/test" element={<TestDashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/enhanced" element={<EnhancedMarketDashboard />} />
                  <Route path="/actionable" element={<Dashboard />} />
                  <Route path="/quantum" element={<QuantumMarketDashboard />} />
                  <Route path="/workspace" element={<SalesWorkspace />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </>
            )}
          </OrbContextProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
