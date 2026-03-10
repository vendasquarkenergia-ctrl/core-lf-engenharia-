import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fallback: If no supabase URL is configured, we bypass and stop loading
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('sua-url-aqui')) {
      const session = localStorage.getItem('core_session_mock');
      if (session) setUser(JSON.parse(session));
      setIsLoading(false);
      return;
    }

    // Initialize session from real Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Tenta buscar o perfil na tabela users_profiles
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as Role,
          avatarUrl: data.avatar_url || `https://i.pravatar.cc/150?u=${email}`
        });
      } else {
        setUser({
          id: userId,
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'COLABORADOR', // Default fallback
          avatarUrl: `https://i.pravatar.cc/150?u=${email}`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    // MOCK FALLBACK (Se o usuario rodar localmente sem configurar as chaves .env)
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('sua-url-aqui')) {
      console.warn("Atenção: Usando Fake Auth local pois o Supabase não está configurado.");
      let mockRole: Role = 'COLABORADOR';
      if (email.includes('admin')) mockRole = 'ADMIN';
      if (email.includes('cliente')) mockRole = 'CLIENTE';

      const fakeUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0].toUpperCase(),
        email,
        role: mockRole,
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`
      };
      setUser(fakeUser);
      localStorage.setItem('core_session_mock', JSON.stringify(fakeUser));
      return;
    }

    // AUTH REAL DO SUPABASE (PRODUCAO)
    if (!password) throw new Error("Senha obrigatória");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('sua-url-aqui')) {
      setUser(null);
      localStorage.removeItem('core_session_mock');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
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
