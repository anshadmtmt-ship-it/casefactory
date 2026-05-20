import React, { createContext, useContext, useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CustomerAuthContext = createContext();
const API = '/api';

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = (error, token = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    failedQueue.current = [];
  };

  // ── Axios interceptor: auto-refresh on 401 ──────────────────────────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        // Only intercept 401s that haven't been retried yet, and are not auth requests themselves
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/')
        ) {
          if (isRefreshing.current) {
            // Queue up requests while refresh is in progress
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            }).catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          const refreshToken = localStorage.getItem('customer_refresh_token');
          if (!refreshToken) {
            isRefreshing.current = false;
            doLogout();
            return Promise.reject(error);
          }

          try {
            const res = await axios.post(`${API}/auth/customer-refresh/`, { refresh: refreshToken });
            const { access, refresh } = res.data;
            localStorage.setItem('customer_access_token', access);
            if (refresh) localStorage.setItem('customer_refresh_token', refresh);
            processQueue(null, access);
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            doLogout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing.current = false;
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Initialize from local storage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('customer_access_token');
      const savedUser = localStorage.getItem('customer_user');

      if (token && savedUser) {
        try {
          setCustomer(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Failed to parse saved user", e);
          doLogout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/customer-login/`, {
        username,
        password
      });

      const { access, refresh, user } = response.data;
      
      localStorage.setItem('customer_access_token', access);
      localStorage.setItem('customer_refresh_token', refresh);
      localStorage.setItem('customer_user', JSON.stringify(user));

      setCustomer(user);
      setIsAuthenticated(true);
      toast.success('Successfully logged in!');
      return { success: true };
    } catch (error) {
      return { success: false, data: error.response?.data };
    }
  };

  // signup is now handled directly by SignupPage via OTP flow
  const signup = async (userData) => {
    return { success: false, data: { message: 'Please use the signup page.' } };
  };

  const doLogout = () => {
    localStorage.removeItem('customer_access_token');
    localStorage.removeItem('customer_refresh_token');
    localStorage.removeItem('customer_user');
    setCustomer(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    doLogout();
    toast.success('Logged out successfully.');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('customer_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <CustomerAuthContext.Provider value={{ 
      customer, 
      setCustomer,
      isAuthenticated, 
      setIsAuthenticated,
      loading, 
      login, 
      signup, 
      logout,
      getAuthHeaders
    }}>
      {!loading && children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
