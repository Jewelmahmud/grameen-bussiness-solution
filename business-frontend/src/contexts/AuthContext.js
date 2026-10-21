import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (accessToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    
    setIsInitializing(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { user, tokens, tenant_uuid, business_type_uuid } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store tenant_uuid and business_type_uuid if provided
        if (tenant_uuid) {
          localStorage.setItem('tenant_uuid', tenant_uuid);
        }
        if (business_type_uuid) {
          localStorage.setItem('business_type_uuid', business_type_uuid);
        }
        
        // Update state
        setUser(user);
        
        return { user, tokens, tenant_uuid, business_type_uuid };
      } else {
        const errorMessage =
          response.data?.error?.message || response.data?.message || 'Login failed';
        const errorCode = response.data?.error?.code;
        const errorStatus = response.data?.error?.statusCode;
        const errorPayload = new Error(errorMessage);
        errorPayload.code = errorCode;
        errorPayload.statusCode = errorStatus;
        throw errorPayload;
      }
    } catch (err) {
      const responseData = err.response?.data;
      const errorMessage =
        responseData?.error?.message || responseData?.message || err.message || 'Login failed';
      const errorCode = responseData?.error?.code;
      const errorStatus = responseData?.error?.statusCode;
      const errorPayload = new Error(errorMessage);
      errorPayload.code = errorCode;
      errorPayload.statusCode = errorStatus;
      setError(errorMessage);
      throw errorPayload;
    } finally {
      setLoading(false);
    }
  };

  // Register function - auto-login after registration
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.post(`${apiBaseUrl}/auth/register`, userData);
      
      // Handle successful registration (200/201 status)
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        
        // Auto-login after registration if tokens are provided
        if (responseData.user && responseData.tokens) {
          const { user, tokens, tenant_uuid, business_type_uuid } = responseData;
          
          // Store tokens and user data
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Store tenant_uuid and business_type_uuid if provided
          if (tenant_uuid) {
            localStorage.setItem('tenant_uuid', tenant_uuid);
          }
          if (business_type_uuid) {
            localStorage.setItem('business_type_uuid', business_type_uuid);
          }
          
          // Update state
          setUser(user);
          
          return { user, ...responseData };
        }
        
        return responseData;
      } else if (response.data && !response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiBaseUrl = getApiBaseUrl();
      
      // Call logout API endpoint with bearer token
      if (accessToken) {
        try {
          await axios.post(
            `${apiBaseUrl}/auth/logout`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
        } catch (err) {
          // Even if the API call fails, we should still clear local storage
          // Log the error but don't block the logout process
          console.error('Logout API call failed:', err);
        }
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear local storage and user state, regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_uuid');
      localStorage.removeItem('business_type_uuid');
      setUser(null);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.permissions && role.permissions.includes(permission)
    );
  };

  // Get access token
  const getAccessToken = () => {
    return localStorage.getItem('accessToken');
  };

  const applyAuthSession = (responseData) => {
    if (!responseData?.user || !responseData?.tokens) return false;

    const { user, tokens, tenant_uuid, business_type_uuid } = responseData;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    if (tenant_uuid) {
      localStorage.setItem('tenant_uuid', tenant_uuid);
    }
    if (business_type_uuid) {
      localStorage.setItem('business_type_uuid', business_type_uuid);
    }
    setUser(user);
    return true;
  };

  const refreshUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;
    try {
      setUser(JSON.parse(storedUser));
      return true;
    } catch (e) {
      return false;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    isInitializing,
    error,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
    getAccessToken,
    applyAuthSession,
    refreshUserFromStorage,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
