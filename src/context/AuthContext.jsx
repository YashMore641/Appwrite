import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../appwrite/auth';
import { isAppwriteConfigured } from '../appwrite/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isAppwriteConfigured());
  const [authError, setAuthError] = useState(null);

  const checkUserSession = useCallback(async () => {
    const configured = isAppwriteConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setAuthError(null);
    } catch (err) {
      console.warn('Session check warning:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      await authService.register(name, email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return { success: true, user: currentUser };
    } catch (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const refreshConfig = () => {
    checkUserSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        authError,
        login,
        register,
        logout,
        refreshConfig,
        checkUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
