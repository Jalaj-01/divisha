'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDTO, RegisterCustomerInput, LoginInput } from '@divisha/types';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  signup: (input: RegisterCustomerInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('divisha_customer_token');
      const storedUser = localStorage.getItem('divisha_customer_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load user session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        localStorage.setItem('divisha_customer_user', JSON.stringify(data.data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user profile', e);
    }
  };

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error?.message || 'Invalid email or password'
        };
      }

      const receivedToken = json.data.accessToken;
      const receivedUser = json.data.user;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('divisha_customer_token', receivedToken);
      localStorage.setItem('divisha_customer_user', JSON.stringify(receivedUser));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Connection error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (input: RegisterCustomerInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/auth/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error?.message || 'Registration failed'
        };
      }

      const receivedToken = json.data.accessToken;
      const receivedUser = json.data.user;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('divisha_customer_token', receivedToken);
      localStorage.setItem('divisha_customer_user', JSON.stringify(receivedUser));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Connection error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('divisha_customer_token');
    localStorage.removeItem('divisha_customer_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user && !!token,
        login,
        signup,
        logout,
        refreshUser
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
