import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type UserRole = 'buyer' | 'seller' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('electra_user');
      const token = localStorage.getItem('electra_token');

      if (storedUser && token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data as User);
        } catch (error) {
          localStorage.removeItem('electra_user');
          localStorage.removeItem('electra_token');
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('electra_token', token);
      localStorage.setItem('electra_user', JSON.stringify(user));
      setUser(user);
      setIsLoading(false);
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      localStorage.setItem('electra_token', token);
      localStorage.setItem('electra_user', JSON.stringify(user));
      setUser(user);
      setIsLoading(false);
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('electra_user');
    localStorage.removeItem('electra_token');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};