import React from 'react';
import { useModules } from '../contexts/ModuleContext';
import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getModuleById } from '../config/modules';

const ModuleProtectedRoute = ({ children, moduleId, required = false }) => {
  const { isModuleEnabled, loading } = useModules();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading modules...
        </Typography>
      </Box>
    );
  }

  // If no module ID specified or module is required, allow access
  if (!moduleId || required) {
    return children;
  }

  if (!isModuleEnabled(moduleId)) {
    const module = getModuleById(moduleId);
    const moduleName = module ? module.nameBn : moduleId;

    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? theme.palette.grey[50] 
          : theme.palette.grey[900]
      }}>
        <Card sx={{ maxWidth: 600, textAlign: 'center', p: 3 }}>
          <CardContent>
            <LockIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Module Not Enabled
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {moduleName} মডিউলটি আপনার অ্যাকাউন্টে সক্রিয় নয়।
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              এই ফিচারটি ব্যবহার করতে, অনুগ্রহ করে Module Settings পেজ থেকে এই মডিউলটি সক্রিয় করুন।
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={Link}
                to="/business/dashboard/settings/business"
                state={{ settingsTab: 3 }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                  },
                }}
              >
                Module Settings এ যান
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/business/dashboard"
              >
                Dashboard এ ফিরে যান
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return children;
};

export default ModuleProtectedRoute;

