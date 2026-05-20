import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cf_admin_token') || sessionStorage.getItem('cf_admin_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('cf_admin_refresh') || sessionStorage.getItem('cf_admin_refresh'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      if (token && refreshToken) {
        await fetch('/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
      }
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('cf_admin_token');
      localStorage.removeItem('cf_admin_refresh');
      sessionStorage.removeItem('cf_admin_token');
      sessionStorage.removeItem('cf_admin_refresh');
    }
  }, [token, refreshToken]);

  useEffect(() => {
    if (token) {
      // Verify token and load user
      fetch('/api/auth/me/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid token');
        }
        return res.json();
      })
      .then(data => {
        if (data.is_superuser) {
          setUser(data);
        } else {
          logout();
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  const login = async (username, password, rememberMe) => {
    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      if (!res.ok) {
        throw new Error('Could not connect to the backend server. Please ensure the Django server is running.');
      }
      throw new Error('Unexpected response format from server.');
    }
    
    if (!res.ok) {
      throw new Error(data?.error || 'Login failed');
    }

    if (!data.user.is_superuser) {
      throw new Error('Unauthorized. Admin access requires superuser privileges.');
    }

    setToken(data.access);
    setRefreshToken(data.refresh);
    setUser(data.user);

    if (rememberMe) {
      localStorage.setItem('cf_admin_token', data.access);
      localStorage.setItem('cf_admin_refresh', data.refresh);
    } else {
      sessionStorage.setItem('cf_admin_token', data.access);
      sessionStorage.setItem('cf_admin_refresh', data.refresh);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isSuperuser = !!user?.is_superuser;

  return (
    <AdminAuthContext.Provider value={{
      token,
      user,
      isLoading,
      login,
      logout,
      isAuthenticated,
      isSuperuser
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
