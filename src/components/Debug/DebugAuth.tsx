import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const DebugAuth: React.FC = () => {
  const { user, userProfile, subscriptionLevel, isAuthenticated } = useAuth();

  const checkSupabaseProfile = async () => {
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }

    console.log('🔍 Checking Supabase profile for user:', user.id);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id);
    
    console.log('📊 Supabase query result:', { data, error });
    
    if (data && data.length > 0) {
      console.log('✅ Profile found:', data[0]);
      console.log('🎫 Subscription level in DB:', data[0].subscription_level);
    } else {
      console.log('❌ No profile found in user_profiles table');
    }
  };

  const updateSubscription = async (level: string) => {
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }

    console.log(`🔄 Updating subscription to: ${level}`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ subscription_level: level })
      .eq('id', user.id)
      .select();
    
    if (error) {
      console.error('❌ Error updating subscription:', error);
    } else {
      console.log('✅ Subscription updated:', data);
      window.location.reload(); // Reload to pick up new subscription
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        p: 3,
        maxWidth: 400,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid #9f58fa',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#9f58fa' }}>
        🐛 Auth Debug Panel
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>User:</strong> {user?.email || 'None'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>Profile:</strong> {userProfile?.email || 'None'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>Subscription:</strong> {subscriptionLevel}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={checkSupabaseProfile}
          sx={{ backgroundColor: '#9f58fa' }}
        >
          Check Supabase Profile
        </Button>
        
        <Typography variant="caption" sx={{ color: '#fff', mt: 1 }}>
          Quick Fix Subscription:
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => updateSubscription('free')}
            sx={{ flex: 1 }}
          >
            Free
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => updateSubscription('basic')}
            sx={{ flex: 1 }}
          >
            Basic
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => updateSubscription('professional')}
            sx={{ flex: 1 }}
          >
            Pro
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DebugAuth;