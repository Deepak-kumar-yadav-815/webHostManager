import React, { createContext, useState, useEffect } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  const [user, setUser] = useState(null); // This is our backend DB User
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add Axios interceptor to always fetch fresh token
    const reqInterceptor = api.interceptors.request.use(async (config) => {
      const localAdminToken = localStorage.getItem('adminToken');
      if (localAdminToken) {
        config.headers.Authorization = `Bearer ${localAdminToken}`;
        return config;
      }
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          console.error("Clerk getToken failed:", e);
        }
      }
      return config;
    }, (error) => Promise.reject(error));

    return () => {
      api.interceptors.request.eject(reqInterceptor);
    };
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Try local admin token first (Singleton Admin bypass)
      const localAdminToken = localStorage.getItem('adminToken');
      if (localAdminToken) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
          setLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem('adminToken');
        }
      }

      // 2. If no local admin, check Clerk
      if (authLoaded && userLoaded) {
        if (isSignedIn) {
          try {
            // Sync with backend to get MongoDB user
            const res = await api.post('/auth/sync', {
              email: clerkUser?.primaryEmailAddress?.emailAddress,
              name: clerkUser?.fullName,
              avatar: clerkUser?.imageUrl
            });
            
            setUser(res.data);
          } catch (err) {
            console.error('Failed to sync Clerk user with backend:', err);
            // If backend rejects the sync, clear local state
            setUser(null);
          }
        } else {
          // Not signed into Clerk
          setUser(null);
        }
        setLoading(false);
      }
    };

    initializeAuth();
  }, [authLoaded, userLoaded, isSignedIn, clerkUser, getToken]);

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    localStorage.setItem('adminToken', res.data.token);
    setUser(res.data);
  };

  const logout = async () => {
    localStorage.removeItem('adminToken');
    if (isSignedIn) {
      await clerkSignOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, adminLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
