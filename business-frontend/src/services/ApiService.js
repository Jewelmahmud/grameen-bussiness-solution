import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../utils/api';
import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

// Create a service for connecting to the backend API
const ApiService = () => {
  const { get, post, put, delete: del } = useApi();
  const baseUrl = getApiBaseUrl();

  // Authentication endpoints
  const auth = {
    login: (credentials) => post('/auth/login', credentials),
    register: (userData) => post('/auth/register', userData),
    logout: () => post('/auth/logout'),
    getUser: () => get('/auth/user')
  };

  // Bazar endpoints
  const bazars = {
    getAll: (params) => get('/bazars', { params }),
    getById: (id) => get(`/bazars/${id}`),
    getStores: (id, params) => get(`/bazars/${id}/stores`, { params }),
    create: (data) => post('/bazars', data),
    update: (id, data) => put(`/bazars/${id}`, data),
    delete: (id) => del(`/bazars/${id}`)
  };

  // Store endpoints
  const stores = {
    getAll: (params) => get('/stores', { params }),
    getById: (id) => get(`/stores/${id}`),
    getProducts: (id, params) => get(`/stores/${id}/products`, { params }),
    create: (data) => post('/stores', data),
    update: (id, data) => put(`/stores/${id}`, data),
    delete: (id) => del(`/stores/${id}`),
    getAnalytics: (id) => get(`/stores/${id}/analytics`)
  };

  // Product endpoints
  const products = {
    getAll: (params) => get('/products', { params }),
    getById: (id) => get(`/products/${id}`),
    getByCategory: (categoryId, params) => get(`/categories/${categoryId}/products`, { params }),
    create: (data) => post('/products', data),
    update: (id, data) => put(`/products/${id}`, data),
    delete: (id) => del(`/products/${id}`),
    uploadImage: (id, formData) => {
      return axios.post(`${baseUrl}/products/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    }
  };

  // Category endpoints
  const categories = {
    getAll: () => get('/categories'),
    getById: (id) => get(`/categories/${id}`),
    create: (data) => post('/categories', data),
    update: (id, data) => put(`/categories/${id}`, data),
    delete: (id) => del(`/categories/${id}`)
  };

  // Order endpoints
  const orders = {
    getAll: (params) => get('/orders', { params }),
    getById: (id) => get(`/orders/${id}`),
    create: (data) => post('/orders', data),
    update: (id, data) => put(`/orders/${id}`, data),
    cancel: (id) => post(`/orders/${id}/cancel`),
    getCustomerOrders: () => get('/customer/orders'),
    getStoreOrders: (storeId) => get(`/stores/${storeId}/orders`)
  };

  // Review endpoints
  const reviews = {
    getProductReviews: (productId) => get(`/products/${productId}/reviews`),
    getStoreReviews: (storeId) => get(`/stores/${storeId}/reviews`),
    create: (data) => post('/reviews', data),
    update: (id, data) => put(`/reviews/${id}`, data),
    delete: (id) => del(`/reviews/${id}`)
  };

  // Admin endpoints
  const admin = {
    getDashboardStats: () => get('/admin/dashboard'),
    getUsers: (params) => get('/admin/users', { params }),
    updateUser: (id, data) => put(`/admin/users/${id}`, data),
    deleteUser: (id) => del(`/admin/users/${id}`),
    approveStore: (id) => post(`/admin/stores/${id}/approve`),
    rejectStore: (id) => post(`/admin/stores/${id}/reject`)
  };

  // AI generation endpoints
  const ai = {
    generateContent: (prompt) => post('/ai/generate', { prompt })
  };

  return {
    auth,
    bazars,
    stores,
    products,
    categories,
    orders,
    reviews,
    admin,
    ai
  };
};

export default ApiService;
