import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check localStorage for demo credentials
      const localUser = localStorage.getItem('user');
      if (localUser) {
        setUser(JSON.parse(localUser));
        setIsLoading(false);
        return;
      }

      // Then check server auth
      const response = await apiRequest('GET', '/api/auth/user');
      setUser(response);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      password,
    });
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('user');
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      // Ignore logout errors but still clear localStorage
      localStorage.removeItem('user');
    } finally {
      setUser(null);
      // Force a page reload to clear any cached state
      window.location.href = '/';
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};