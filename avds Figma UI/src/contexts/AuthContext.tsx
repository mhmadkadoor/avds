import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (name: string, email: string, password: string) => void;
  toggleFavorite: (vehicleId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const mapUser = (userData: any): User => ({
    id: userData.id.toString(),
    name: userData.first_name ? `${userData.first_name} ${userData.last_name}`.trim() : userData.username,
    email: userData.email,
    favorites: userData.favorites ? userData.favorites.map((id: any) => id.toString()) : [],
    isAdmin: userData.is_staff || false
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await api.me(token);
          setUser(mapUser(userData));
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Fetch user details
      const userData = await api.me(data.access);
      setUser(mapUser(userData));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const data = await api.register(name, email, password);
      // Auto login after register or just redirect? 
      // For now let's assume register returns tokens or we just redirect to login.
      // If register returns tokens:
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        const userData = await api.me(data.access);
        setUser(mapUser(userData));
      }
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  };

  const toggleFavorite = async (vehicleId: string) => {
    if (!user) return;

    try {
      await api.toggleFavorite(vehicleId);

      const isFavorite = user.favorites.includes(vehicleId);
      const newFavorites = isFavorite
        ? user.favorites.filter(id => id !== vehicleId)
        : [...user.favorites, vehicleId];

      setUser({ ...user, favorites: newFavorites });
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, toggleFavorite }}>
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
