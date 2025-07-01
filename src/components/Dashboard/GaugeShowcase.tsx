import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Slider } from '@mui/material';
import SimpleGauge from './SimpleGauge';
import HTMLGauge from './HTMLGauge';
import SupremeGauge from './SupremeGauge';
import { MarketCommandCenter } from './index';

const GaugeShowcase: React.FC = () => {
  const [value, setValue] = useState(75);
  const max = 100;

  return (
    <Box sx={{ p: 4, bgcolor: '#0a0a0a', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ mb: 4, color: 'white', textAlign: 'center' }}>
        All RepSpheres Gauge Components
      </Typography>
      
      {/* Value Control */}
      <Paper sx={{ p: 3, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>Test Value Control</Typography>
        <Slider
          value={value}
          onChange={(e, newValue) => setValue(newValue as number)}
          max={max}
          valueLabelDisplay="on"
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Gauge Grid */}
      <Grid container spacing={4}>
        {/* SimpleGauge */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, bgcolor: '#1a1a1a', height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
              SimpleGauge
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <SimpleGauge
                value={value}
                max={max}
                label="Market Size"
                unit="M"
                color="#4bd48e"
                size={200}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
              • Clean, minimalist design<br/>
              • Framer Motion animations<br/>
              • 3 spin initialization<br/>
              • Hover wobble effect<br/>
              • Not connected to Supabase
            </Typography>
          </Paper>
        </Grid>

        {/* HTMLGauge */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, bgcolor: '#1a1a1a', height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
              HTMLGauge
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <HTMLGauge
                value={value}
                max={max}
                label="Growth Rate"
                unit="%"
                color="#9f58fa"
                size={200}
                isLive={true}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
              • Automotive style<br/>
              • Chrome bezel<br/>
              • Digital LED display<br/>
              • Click to spin<br/>
              • Not connected to Supabase
            </Typography>
          </Paper>
        </Grid>

        {/* SupremeGauge */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, bgcolor: '#1a1a1a', height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
              SupremeGauge
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <SupremeGauge
                value={value}
                max={max}
                label="Procedures"
                unit=""
                color="#4B96DC"
                size={200}
                isLive={false}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
              • Luxury watch design<br/>
              • GSAP animations<br/>
              • Precision screws<br/>
              • Audio effects<br/>
              • Currently used in Dashboard
            </Typography>
          </Paper>
        </Grid>

        {/* CockpitGauge from MarketCommandCenter */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, bgcolor: '#1a1a1a', height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
              CockpitGauge (Live)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'orange' }}>
              ⚡ This is the only gauge connected to Supabase!
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              • Automotive cockpit style<br/>
              • Live Supabase data<br/>
              • Industry filtering<br/>
              • Real-time updates<br/>
              • Used in MarketCommandCenter
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'yellow' }}>
              Note: CockpitGauge is embedded in MarketCommandCenter component.
              To see it in action, visit the Market Command Center page.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Full MarketCommandCenter Preview */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: '#1a1a1a' }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
          MarketCommandCenter with Live CockpitGauges
        </Typography>
        <Box sx={{ height: 600, overflow: 'auto' }}>
          <MarketCommandCenter />
        </Box>
      </Paper>
    </Box>
  );
};

export default GaugeShowcase;