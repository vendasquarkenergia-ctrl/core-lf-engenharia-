import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Consistente com a migração 202604170002_phase1_auth_roles.sql
export type Role = 'ADMIN' | 'ENGENHEIRO' | 'MESTRE' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca o perfil público para pegar o nome e a role baseada no ID do auth.user
  const fetchProfile = async (sessionUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', sessionUser.id)
        .single();
        
      const sessionEmail = sessionUser.email || '';
      const isSuperAdmin = sessionEmail.toLowerCase() === 'admin.frazao@lfengenharia.com';

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        // Fallback básico caso o perfil não exista ainda mas o user exista no auth
        setUser({
          id: sessionUser.id,
          name: sessionEmail ? sessionEmail.split('@')[0] : 'Usuário',
          email: sessionEmail,
          role: isSuperAdmin ? 'ADMIN' : 'MESTRE', // Garante ADMIN para superuser
          avatarUrl: ''
        });
        return;
      }

      setUser({
        id: sessionUser.id,
        name: data.full_name || (sessionEmail ? sessionEmail.split('@')[0] : 'Usuário'),
        email: sessionEmail,
        role: isSuperAdmin ? 'ADMIN' : (data.role as Role), // Garante ADMIN independente do DB
        avatarUrl: data.avatar_url || ''
      });
    } catch (err) {
      console.error('Falha inesperada ao configurar usuário:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Safety timeout to prevent infinite loading in case of network issues
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Autenticação demorou muito. Forçando renderização...');
            setIsLoading(false);
          }
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (error) throw error;

        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error("Falha ao inicializar sessão:", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
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
