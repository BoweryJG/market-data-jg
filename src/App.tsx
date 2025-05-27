import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
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
                        <EnhancedDashboard />
                      </Box>
                    } />
                  </Routes>
                </Box>
              </>
            ) : (
              <>
                <NavBar onSalesModeToggle={() => setSalesMode(true)} />
                <Routes>
                  <Route path="/" element={<MarketGalaxyMap />} />
                  <Route path="/dashboard" element={<EnhancedDashboard />} />
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
