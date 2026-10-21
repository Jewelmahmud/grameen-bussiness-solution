import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProductDetailWithApi from '../examples/ProductDetailWithApi';
import BazarDetailWithApi from '../examples/BazarDetailWithApi';
import OrdersWithApi from '../examples/OrdersWithApi';
import StoreOwnerDashboardWithApi from '../examples/StoreOwnerDashboardWithApi';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

// Mock the useApiService hook
jest.mock('../hooks/useApiService', () => ({
  useApiService: () => ({
    loading: false,
    error: null,
    useBazars: () => ({
      fetchBazarById: async () => ({
        id: 1,
        name: 'Test Bazar',
        description: 'This is a test bazar',
        location: 'Test Location',
        image_url: 'https://example.com/image.jpg'
      }),
      bazars: []
    }),
    useStores: () => ({
      stores: [
        {
          id: 1,
          name: 'Test Store',
          description: 'This is a test store',
          logo_url: 'https://example.com/logo.jpg'
        }
      ],
      fetchStores: async () => {}
    }),
    useProducts: () => ({
      fetchProductById: async () => ({
        id: 1,
        name: 'Test Product',
        description: 'This is a test product',
        price: 100,
        stock: 10,
        image_url: 'https://example.com/product.jpg',
        store: {
          id: 1,
          name: 'Test Store',
          logo_url: 'https://example.com/logo.jpg'
        }
      }),
      products: []
    }),
    useOrders: () => ({
      orders: [
        {
          id: 1,
          created_at: '2025-03-26T12:00:00Z',
          items: [{ id: 1, name: 'Test Item' }],
          total: 100,
          status: 'Processing'
        }
      ],
      fetchOrders: async () => {}
    }),
    api: {
      stores: {
        getAnalytics: async () => ({})
      }
    }
  })
}));

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'store_owner',
      store_id: 1
    },
    loading: false
  })
}));

describe('Frontend Component Tests', () => {
  test('ProductDetailWithApi renders correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductDetailWithApi />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('This is a test product')).toBeInTheDocument();
      expect(screen.getByText('৳100')).toBeInTheDocument();
    });
  });
  
  test('BazarDetailWithApi renders correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BazarDetailWithApi />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Bazar')).toBeInTheDocument();
      expect(screen.getByText('This is a test bazar')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });
  
  test('OrdersWithApi renders correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <OrdersWithApi />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });
  
  test('StoreOwnerDashboardWithApi renders correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <StoreOwnerDashboardWithApi />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Store Owner Dashboard')).toBeInTheDocument();
    });
  });
  
  test('Add to cart functionality works', async () => {
    // Clear localStorage before test
    localStorage.clear();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductDetailWithApi />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Click add to cart button
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    // Check if item was added to cart in localStorage
    const cart = JSON.parse(localStorage.getItem('cart'));
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Test Product');
    expect(cart[0].quantity).toBe(1);
  });
});
