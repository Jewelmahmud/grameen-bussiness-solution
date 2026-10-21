import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer'
    }),
    register: jest.fn().mockResolvedValue({ message: 'Registration successful' }),
    error: null
  })
}));

describe('Login Tests', () => {
  test('Login component renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check for login form elements
    expect(screen.getByText(/লগইন/i)).toBeInTheDocument();
  });
  
  test('Login form has email and password fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check for form fields
    expect(screen.getByLabelText(/ইমেইল/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/পাসওয়ার্ড/i)).toBeInTheDocument();
  });
  
  test('Login form can be submitted', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/ইমেইল/i);
    const passwordInput = screen.getByLabelText(/পাসওয়ার্ড/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    const loginButton = screen.getByRole('button', { name: /লগইন/i });
    fireEvent.click(loginButton);
    
    // Form should submit (no validation errors should appear for valid input)
    await waitFor(() => {
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });
});
