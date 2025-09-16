import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  photo?: string;
  role?: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = StorageManager.getAccessToken();
      const userData = StorageManager.getUserData();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback((userData: User, accessToken: string, refreshToken?: string) => {
    console.log('login called to save token in ui');
    StorageManager.setAccessToken(accessToken);
    if (refreshToken) {
      StorageManager.setRefreshToken(refreshToken);
    }
    StorageManager.setUserData(userData);
    
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    StorageManager.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user data
  const updateUser = useCallback((userData: User) => {
    StorageManager.setUserData(userData);
    setUser(userData);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };
}
