import React from 'react';
import { Box, Typography } from '@mui/material';

const TestDashboard: React.FC = () => {
  console.log('TestDashboard component loaded');
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h2">Test Dashboard - Working!</Typography>
      <Typography variant="h4">If you see this, React routing is working.</Typography>
    </Box>
  );
};

export default TestDashboard;