import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Added setIsAuthenticated state to properly track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check server auth only
      const response = await apiRequest('GET', '/api/auth/user');
      if (response && response.id) {
        // Ensure we have the proper user structure
        const userData = {
          id: response.id.toString(),
          firstName: response.firstName || response.first_name || '',
          lastName: response.lastName || response.last_name || '',
          email: response.email || '',
          userType: response.userType || response.user_type || response.role || 'member',
          role: response.role || response.userType || response.user_type || 'member'
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      // Only log actual errors, not 401s which are expected when not logged in
      if (!error?.message?.includes('401')) {
        console.error('Auth check error:', error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing localStorage first
      localStorage.removeItem('user');

      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password,
      });

      if (response && response.success && response.user) {
        // Handle the user data from response
        const userFromResponse = response.user;
        
        // Ensure we have the proper user structure
        const userData = {
          id: userFromResponse.id.toString(),
          firstName: userFromResponse.firstName || userFromResponse.first_name || '',
          lastName: userFromResponse.lastName || userFromResponse.last_name || '',
          email: userFromResponse.email || '',
          userType: userFromResponse.userType || userFromResponse.user_type || userFromResponse.role || 'member',
          role: userFromResponse.role || userFromResponse.userType || userFromResponse.user_type || 'member'
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { ...response, user: userData };
      } else {
        throw new Error(response?.message || 'Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Extract meaningful error message
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('user');

      // Attempt server logout
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      // Ignore logout errors but ensure localStorage is cleared
      console.log("Logout error (ignored):", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false); // Ensure isAuthenticated is false after logout
      // Redirect to login page instead of home
      window.location.href = '/login';
    }
  };

  return {
    user,
    isAuthenticated, // Return isAuthenticated state
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};