import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute, RoleRoute } from '../components/ProtectedRoute';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Navigate: jest.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  Outlet: jest.fn(() => <div data-testid="outlet" />)
}));

describe('Role-Based Access Control Tests', () => {
  test('ProtectedRoute redirects to login when not authenticated', async () => {
    // Mock unauthenticated user
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: false,
      user: null,
      loading: false
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check if redirected to login
    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/auth');
    });
  });
  
  test('ProtectedRoute renders children when authenticated', async () => {
    // Mock authenticated user
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', role: 'customer' },
      loading: false
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check if protected content is rendered
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
  
  test('RoleRoute redirects to home when user has wrong role', async () => {
    // Mock authenticated user with wrong role
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', role: 'customer' },
      loading: false
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoleRoute roles={['admin', 'store_owner']}>
            <div>Admin Content</div>
          </RoleRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check if redirected to home
    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toHaveAttribute('data-to', '/');
    });
  });
  
  test('RoleRoute renders children when user has correct role', async () => {
    // Mock authenticated user with correct role
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', role: 'admin' },
      loading: false
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoleRoute roles={['admin', 'store_owner']}>
            <div>Admin Content</div>
          </RoleRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check if admin content is rendered
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
  
  test('RoleRoute shows loading state when authentication is being checked', async () => {
    // Mock loading state
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: false,
      user: null,
      loading: true
    }));
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <RoleRoute roles={['admin']}>
            <div>Admin Content</div>
          </RoleRoute>
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check if loading state is shown
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
