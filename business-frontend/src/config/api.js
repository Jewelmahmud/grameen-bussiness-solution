/**
 * API Configuration
 * Centralized API base URL configuration using environment variables
 * 
 * Set REACT_APP_API_ENV to switch:
 * REACT_APP_API_ENV=local | staging
 *
 * Then provide:
 * REACT_APP_API_BASE_URL_LOCAL=http://localhost:3040/api/v1
 * REACT_APP_API_BASE_AUTHSERVER_URL_STAGING=https://business.grameenbazaar.com/api/v1
 */

// Get API base URL from environment variable
// Supports both REACT_APP_API_BASE_URL (correct) and REACT_APP_API_BASE_URL (typo)
// Default to http://localhost:3040/api/v1 if not set
const getEnvApiUrl = () => {
  const apiEnv = process.env.REACT_APP_API_ENV || 'staging';
  const localUrl = process.env.REACT_APP_API_BASE_URL_LOCAL;
  const stagingUrl = process.env.REACT_APP_API_BASE_URL_STAGING;

  if (apiEnv === 'staging' && stagingUrl) return stagingUrl;
  if (apiEnv === 'local' && localUrl) return localUrl;

  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3040/api/v1';
};

// Ensure the URL doesn't have a trailing slash
export const getApiBaseUrl = () => {
  const url = getEnvApiUrl();
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Auth server base URL (always uses auth server env var when available)
export const getAuthApiBaseUrl = () => {
  const url =
    process.env.REACT_APP_API_BASE_AUTHSERVER_URL_STAGING ||
    getEnvApiUrl();
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Export the default API base URL for direct use
export default getApiBaseUrl();

