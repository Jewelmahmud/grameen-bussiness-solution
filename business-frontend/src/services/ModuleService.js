import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

/**
 * Module Service
 * Handles API calls for module management
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get all available modules
 */
export const getAllModules = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.get(`${apiBaseUrl}/modules/list`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all modules:', error);
    throw error;
  }
};

/**
 * Get enabled modules for current tenant/user
 */
export const getEnabledModules = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.get(`${apiBaseUrl}/modules/enabled`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching enabled modules:', error);
    // Return fallback data if API is not available
    return {
      success: true,
      modules: ['inventory'], // Core module always enabled
      subscription: null
    };
  }
};

/**
 * Enable a module
 */
export const enableModule = async (moduleId) => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.post(
      `${apiBaseUrl}/modules/enable`,
      { moduleId },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error enabling module:', error);
    throw error;
  }
};

/**
 * Disable a module
 */
export const disableModule = async (moduleId) => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.post(
      `${apiBaseUrl}/modules/disable`,
      { moduleId },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error disabling module:', error);
    throw error;
  }
};

/**
 * Get subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.get(`${apiBaseUrl}/subscription/plans`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Get current subscription
 */
export const getCurrentSubscription = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.get(`${apiBaseUrl}/subscription/current`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    throw error;
  }
};

/**
 * Upgrade subscription
 */
export const upgradeSubscription = async (planId) => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await axios.post(
      `${apiBaseUrl}/subscription/upgrade`,
      { planId },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
};

