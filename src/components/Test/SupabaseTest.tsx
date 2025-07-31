import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

import { ProceduresService } from '../../services/proceduresService';
import { logger } from '../services/logging/logger';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [testResults, setTestResults] = useState<any>(null);

  const testConnection = async () => {
    setConnectionStatus('Testing connection...');
    
    try {
      // Test 1: Use new procedures service
      logger.info('🔍 Testing procedures service connection...');
      const serviceTest = await ProceduresService.testConnection();
      
      // Test 2: Get actual data using the service
      const [dentalProcedures, aestheticProcedures] = await Promise.all([
        ProceduresService.getAllDentalProcedures(),
        ProceduresService.getAllAestheticProcedures(),
      ]);

      logger.info('🦷 Dental procedures from service:', dentalProcedures);
      logger.info('💄 Aesthetic procedures from service:', aestheticProcedures);

      setTestResults({
        dental: { 
          count: dentalProcedures.length, 
          sample: dentalProcedures.slice(0, 3),
          categories: [...new Set(dentalProcedures.map(p => p.category))],
        },
        aesthetic: { 
          count: aestheticProcedures.length, 
          sample: aestheticProcedures.slice(0, 3),
          categories: [...new Set(aestheticProcedures.map(p => p.category))],
        },
        serviceTest
      });

      if (dentalProcedures.length === 0 && aestheticProcedures.length === 0) {
        setConnectionStatus('⚠️ Connection works but no data found in tables');
      } else {
        setConnectionStatus(`✅ Service working! Found ${dentalProcedures.length} dental and ${aestheticProcedures.length} aesthetic procedures`);
      }

    } catch (error) {
      logger.error('❌ Connection test failed:', error);
      setConnectionStatus(`Test failed: ${error}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        Supabase Connection Test
      </Typography>
      
      <Alert severity={connectionStatus.includes('✅') ? 'success' : 'warning'} sx={{ mb: 2 }}>
        {connectionStatus}
      </Alert>

      <Button variant="contained" onClick={testConnection} sx={{ mb: 2 }}>
        Retest Connection
      </Button>

      {testResults && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Test Results:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

SupabaseTest.displayName = 'SupabaseTest';export default SupabaseTest;