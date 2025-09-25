import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/lib/api';

// Define the shape of the user object based on your backend spec
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'researcher' | 'hospital_admin';
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Get user profile to validate token
          const userData = await api.get('/users/me');
          setUser(userData);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('authToken', token);
    const userData = await api.get('/users/me');
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};