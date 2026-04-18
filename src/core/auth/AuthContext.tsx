import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'ADMIN' | 'COLABORADOR' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role, email?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const session = localStorage.getItem('core_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setIsLoading(false);
  }, []);

  const login = (role: Role, email: string = `${role.toLowerCase()}@lfengenharia.com`) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role,
      avatarUrl: `https://i.pravatar.cc/150?u=${email}`
    };
    setUser(newUser);
    localStorage.setItem('core_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('core_session');
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
