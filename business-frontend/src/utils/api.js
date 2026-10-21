import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Axios interceptor to add auth token to requests
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle 401 Unauthorized - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Custom hook to handle API requests
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Base API URL from environment variable
  const baseUrl = getApiBaseUrl();

  // Setup axios interceptors on mount
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  // Generic request function
  const request = async (method, endpoint, data = null, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}${endpoint}`;
      let response;

      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(url, config);
          break;
        case 'post':
          response = await axios.post(url, data, config);
          break;
        case 'put':
          response = await axios.put(url, data, config);
          break;
        case 'delete':
          response = await axios.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convenience methods
  const get = (endpoint, config = {}) => request('get', endpoint, null, config);
  const post = (endpoint, data, config = {}) => request('post', endpoint, data, config);
  const put = (endpoint, data, config = {}) => request('put', endpoint, data, config);
  const del = (endpoint, config = {}) => request('delete', endpoint, config);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del
  };
};
