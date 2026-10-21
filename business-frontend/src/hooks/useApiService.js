import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

// Custom hook for connecting components to the API
export const useApiService = () => {
  const { isAuthenticated, user } = useAuth();
  const api = ApiService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic fetch function with loading and error handling
  const fetchData = async (apiCall, params = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(params);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hooks for different entities
  const useBazars = () => {
    const [bazars, setBazars] = useState([]);
    
    const fetchBazars = async (params) => {
      try {
        const data = await fetchData(() => api.bazars.getAll(params));
        setBazars(data);
        return data;
      } catch (error) {
        console.error('Error fetching bazars:', error);
        return [];
      }
    };
    
    const fetchBazarById = async (id) => {
      try {
        return await fetchData(() => api.bazars.getById(id));
      } catch (error) {
        console.error(`Error fetching bazar ${id}:`, error);
        return null;
      }
    };
    
    return {
      bazars,
      fetchBazars,
      fetchBazarById
    };
  };
  
  const useStores = () => {
    const [stores, setStores] = useState([]);
    
    const fetchStores = async (params) => {
      try {
        const data = await fetchData(() => api.stores.getAll(params));
        setStores(data);
        return data;
      } catch (error) {
        console.error('Error fetching stores:', error);
        return [];
      }
    };
    
    const fetchStoreById = async (id) => {
      try {
        return await fetchData(() => api.stores.getById(id));
      } catch (error) {
        console.error(`Error fetching store ${id}:`, error);
        return null;
      }
    };
    
    const fetchStoreProducts = async (storeId, params) => {
      try {
        return await fetchData(() => api.stores.getProducts(storeId, params));
      } catch (error) {
        console.error(`Error fetching products for store ${storeId}:`, error);
        return [];
      }
    };
    
    return {
      stores,
      fetchStores,
      fetchStoreById,
      fetchStoreProducts
    };
  };
  
  const useProducts = () => {
    const [products, setProducts] = useState([]);
    
    const fetchProducts = async (params) => {
      try {
        const data = await fetchData(() => api.products.getAll(params));
        setProducts(data);
        return data;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    };
    
    const fetchProductById = async (id) => {
      try {
        return await fetchData(() => api.products.getById(id));
      } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
      }
    };
    
    return {
      products,
      fetchProducts,
      fetchProductById
    };
  };
  
  const useOrders = () => {
    const [orders, setOrders] = useState([]);
    
    const fetchOrders = async () => {
      if (!isAuthenticated) return [];
      
      try {
        let data;
        if (user.role === 'customer') {
          data = await fetchData(() => api.orders.getCustomerOrders());
        } else if (user.role === 'store_owner') {
          data = await fetchData(() => api.orders.getStoreOrders(user.store_id));
        } else if (user.role === 'admin') {
          data = await fetchData(() => api.orders.getAll());
        }
        
        setOrders(data || []);
        return data || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    };
    
    const createOrder = async (orderData) => {
      try {
        return await fetchData(() => api.orders.create(orderData));
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    };
    
    return {
      orders,
      fetchOrders,
      createOrder
    };
  };
  
  // AI generation hook
  const useAi = () => {
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    const generateContent = async (prompt) => {
      setIsGenerating(true);
      try {
        const response = await fetchData(() => api.ai.generateContent(prompt));
        if (response && response.content) {
          setContent(response.content.trim());
          return response.content.trim();
        }
        throw new Error('Invalid response format');
      } catch (error) {
        console.error('Error generating content:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    };
    
    return {
      content,
      isGenerating,
      generateContent
    };
  };
  
  return {
    loading,
    error,
    useBazars,
    useStores,
    useProducts,
    useOrders,
    useAi,
    api
  };
};
