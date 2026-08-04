import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = authService.getStoredUser();
      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await authService.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              localStorage.setItem('user', JSON.stringify(response.user));
              setUser(response.user);
              setIsAuthenticated(true);
            } else {
              handleLogout();
            }
          } catch (refreshError) {
            handleLogout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const handleRegister = useCallback(async (userData) => {
    const data = await authService.register(userData);
    return data;
  }, []);

  const handleOAuthLogin = useCallback(async (provider, code, redirectUri) => {
    const data = await authService.oauthLogin(provider, code, redirectUri);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    authService.logout();
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  }, [user]);

  const value = { user, loading, isAuthenticated, login: handleLogin, register: handleRegister, oauthLogin: handleOAuthLogin, logout: handleLogout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};