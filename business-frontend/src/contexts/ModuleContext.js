import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { getApiBaseUrl } from '../config/api';
import { MODULES } from '../config/modules';

const ModuleContext = createContext(null);

export const ModuleProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [enabledModules, setEnabledModules] = useState(['inventory']); // Core module always enabled
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  // Fetch enabled modules for the tenant/user
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEnabledModules();
    } else {
      setEnabledModules(['inventory']); // Core module always enabled
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchEnabledModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBaseUrl = getApiBaseUrl();
      const accessToken = localStorage.getItem('accessToken');
      
      // Try to fetch from API
      try {
        const response = await axios.get(`${apiBaseUrl}/modules/enabled`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.data.success) {
          const modules = response.data.modules || [];
          // Always include inventory (core module)
          const allModules = modules.includes('inventory') 
            ? modules 
            : ['inventory', ...modules];
          setEnabledModules(allModules);
          setSubscription(response.data.subscription || null);
        }
      } catch (apiError) {
        // If API fails, use localStorage as fallback
        console.warn('Module API not available, using localStorage:', apiError);
        const storedModules = localStorage.getItem('enabledModules');
        if (storedModules) {
          try {
            const modules = JSON.parse(storedModules);
            setEnabledModules(modules.includes('inventory') ? modules : ['inventory', ...modules]);
          } catch (e) {
            setEnabledModules(['inventory']);
          }
        } else {
          setEnabledModules(['inventory']);
        }
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError(error.message);
      // Fallback to default modules if API fails
      setEnabledModules(['inventory']);
    } finally {
      setLoading(false);
    }
  };

  // Check if a module is enabled
  const isModuleEnabled = (moduleId) => {
    if (!moduleId) return true; // If no module specified, allow access
    return enabledModules.includes(moduleId);
  };

  // Check if user can enable a module (has subscription/permission)
  const canEnableModule = (moduleId) => {
    const module = Object.values(MODULES).find(m => m.id === moduleId);
    if (!module) return false;
    
    // Check dependencies
    if (module.dependencies && module.dependencies.length > 0) {
      const allDependenciesMet = module.dependencies.every(dep => enabledModules.includes(dep));
      if (!allDependenciesMet) return false;
    }
    
    // Core modules are always enabled
    if (module.required) return false;
    
    // In a real implementation, check subscription limits here
    return true;
  };

  // Enable a module
  const enableModule = async (moduleId) => {
    try {
      const module = Object.values(MODULES).find(m => m.id === moduleId);
      if (!module) {
        throw new Error('Module not found');
      }

      // Check dependencies
      if (module.dependencies && module.dependencies.length > 0) {
        const missingDeps = module.dependencies.filter(dep => !enabledModules.includes(dep));
        if (missingDeps.length > 0) {
          throw new Error(`Please enable dependencies first: ${missingDeps.join(', ')}`);
        }
      }

      const apiBaseUrl = getApiBaseUrl();
      const accessToken = localStorage.getItem('accessToken');
      
      // Try API first
      try {
        const response = await axios.post(
          `${apiBaseUrl}/modules/enable`,
          { moduleId },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (response.data.success) {
          const updatedModules = [...enabledModules, moduleId];
          setEnabledModules(updatedModules);
          localStorage.setItem('enabledModules', JSON.stringify(updatedModules));
          return true;
        }
      } catch (apiError) {
        // Fallback to localStorage if API not available
        console.warn('Module API not available, using localStorage:', apiError);
        if (!enabledModules.includes(moduleId)) {
          const updatedModules = [...enabledModules, moduleId];
          setEnabledModules(updatedModules);
          localStorage.setItem('enabledModules', JSON.stringify(updatedModules));
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error enabling module:', error);
      setError(error.message);
      throw error;
    }
  };

  // Disable a module
  const disableModule = async (moduleId) => {
    try {
      const module = Object.values(MODULES).find(m => m.id === moduleId);
      if (!module) {
        throw new Error('Module not found');
      }

      // Prevent disabling core/required modules
      if (module.required || moduleId === 'inventory') {
        throw new Error('Cannot disable core module');
      }

      // Check if other modules depend on this one
      const dependentModules = Object.values(MODULES).filter(m => 
        m.dependencies && m.dependencies.includes(moduleId) && enabledModules.includes(m.id)
      );
      
      if (dependentModules.length > 0) {
        throw new Error(`Cannot disable module. The following modules depend on it: ${dependentModules.map(m => m.nameBn).join(', ')}`);
      }

      const apiBaseUrl = getApiBaseUrl();
      const accessToken = localStorage.getItem('accessToken');
      
      // Try API first
      try {
        const response = await axios.post(
          `${apiBaseUrl}/modules/disable`,
          { moduleId },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (response.data.success) {
          const updatedModules = enabledModules.filter(id => id !== moduleId);
          setEnabledModules(updatedModules);
          localStorage.setItem('enabledModules', JSON.stringify(updatedModules));
          return true;
        }
      } catch (apiError) {
        // Fallback to localStorage if API not available
        console.warn('Module API not available, using localStorage:', apiError);
        const updatedModules = enabledModules.filter(id => id !== moduleId);
        setEnabledModules(updatedModules);
        localStorage.setItem('enabledModules', JSON.stringify(updatedModules));
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error disabling module:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get enabled module details
  const getEnabledModuleDetails = () => {
    return enabledModules.map(id => Object.values(MODULES).find(m => m.id === id)).filter(Boolean);
  };

  const value = {
    enabledModules,
    subscription,
    loading,
    error,
    isModuleEnabled,
    canEnableModule,
    enableModule,
    disableModule,
    refreshModules: fetchEnabledModules,
    getEnabledModuleDetails
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within ModuleProvider');
  }
  return context;
};

