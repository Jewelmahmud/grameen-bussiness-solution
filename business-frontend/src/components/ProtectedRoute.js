import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isInitializing, user } = useAuth();
  const location = useLocation();

  if (loading || isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isVendorOrTenant = roles.some(
    (r) => r.name === 'grameen_bazaar_vendor' || r.name === 'grameen_bazaar_tenant'
  );

  if (isVendorOrTenant) {
    const hasBusinessFlag = localStorage.getItem('hasBusiness');
    const hasBusiness = hasBusinessFlag === 'true';
    const path = location.pathname;
    const isSetupPath =
      path === '/business/setup' ||
      path === '/business/dashboard/setup';

    if (!hasBusiness && !isSetupPath) {
      return <Navigate to="/business/setup" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
