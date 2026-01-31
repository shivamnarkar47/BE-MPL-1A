import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCookie, deleteCookie, setAuthCookies, getAccessToken } from '@/lib/getUser';
import { requestUrl } from '@/lib/requestUrl';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const cookieUser = getCookie();
    const token = getAccessToken();
    if (cookieUser && token) {
      setUser(cookieUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const interval = setInterval(() => {
      const token = getAccessToken();
      if (token) {
        refreshUser();
      }
    }, 60000);

    window.addEventListener('focus', refreshUser);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshUser);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await requestUrl({
      method: "POST",
      endpoint: "login",
      data: { email, password }
    });

    const { access_token, refresh_token, user: userData } = response.data;
    setAuthCookies(access_token, refresh_token, userData);
    setUser(userData);
  };

  const register = async (data: { email: string; password: string; full_name?: string }) => {
    const response = await requestUrl({
      method: "POST",
      endpoint: "createUser",
      data
    });

    setUser(response.data);
  };

  const logout = () => {
    deleteCookie();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
