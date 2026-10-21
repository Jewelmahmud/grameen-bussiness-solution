import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModuleProvider } from './contexts/ModuleContext';
import { CartProvider } from './contexts/CartContext';
import { LocationProvider } from './contexts/LocationContext';
import ProtectedRoute from './components/ProtectedRoute';
import { setupAxiosInterceptors } from './utils/api';

// Existing pages
import Login from './pages/auth/Login';
import Registration from './pages/auth/Registration';
import VerifyAccount from './pages/auth/VerifyAccount';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import BusinessSetupForm from './pages/inventory/BusinessSetupForm';
import BusinessSetupBlankPage from './pages/inventory/BusinessSetupBlankPage';

// Import styles
import theme from './styles/theme';
import { ThemeProvider } from '@mui/material/styles';
import { getPageTitle } from './utils/pageTitles';

// Component to handle login redirect
const LoginRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  if (isInitializing) {
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
  
  if (isAuthenticated) {
    return <Navigate to="/business/dashboard" replace />;
  }
  
  return <Login />;
};

// Component to handle registration redirect
const RegistrationRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  if (isInitializing) {
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
  
  if (isAuthenticated) {
    return <Navigate to="/business/dashboard" replace />;
  }
  
  return <Registration />;
};

// Create a separate component for the app content to use the location context
const AppContent = () => {
  const routerLocation = useRouterLocation();
  const [currentLanguage, setCurrentLanguage] = useState((typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn');

  // Update page title on route or language change
  useEffect(() => {
    const title = getPageTitle(routerLocation.pathname, currentLanguage);
    if (title && typeof document !== 'undefined') {
      document.title = title;
    }
  }, [routerLocation.pathname, currentLanguage]);

  // Listen for language change events to update page title without reload
  useEffect(() => {
    const updateLang = () => {
      const lang = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
      setCurrentLanguage(lang);
    };
    const storageHandler = (e) => {
      if (e.key === 'preferredLanguage') updateLang();
    };
    window.addEventListener('preferredLanguageChanged', updateLang);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('preferredLanguageChanged', updateLang);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegistrationRoute />} />
        <Route path="/verify" element={<VerifyAccount />} />
        
        {/* Business Setup Route - Standalone without dashboard layout */}
        <Route 
          path="/business/dashboard/setup" 
          element={
            <ProtectedRoute>
              <BusinessSetupForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/setup" 
          element={
            <ProtectedRoute>
              <BusinessSetupBlankPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Inventory Routes */}
        <Route 
          path="/business/dashboard/*" 
          element={
            <ProtectedRoute>
              <InventoryDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected POS Routes - still uses InventoryDashboard but with different URL */}
        <Route 
          path="/business/pos-system/*" 
          element={
            <ProtectedRoute>
              <InventoryDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route redirects to login or dashboard based on auth status */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

function App() {
  // Setup axios interceptors on app mount
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ModuleProvider>
          <CartProvider>
            <LocationProvider>
              <Router>
                <AppContent />
              </Router>
            </LocationProvider>
          </CartProvider>
        </ModuleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
