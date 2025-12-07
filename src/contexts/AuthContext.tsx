import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users in case database is not available
const DEMO_USERS: Record<string, { password: string; role: 'guest' | 'expert' }> = {
  guest: { password: 'guest123', role: 'guest' },
  expert: { password: 'expert123', role: 'expert' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('gidroatlas_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try database first
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('login', username)
        .maybeSingle();

      if (!dbError && dbUser) {
        // Database user found
        if (dbUser.password_hash === password) {
          setUser(dbUser);
          localStorage.setItem('gidroatlas_user', JSON.stringify(dbUser));
          console.log(`✓ Login successful (from DB): ${username}`);
          return { success: true };
        } else {
          console.log(`✗ Wrong password for DB user: ${username}`);
          return { success: false, error: 'Неверный логин или пароль' };
        }
      }

      // Fallback to demo users
      if (DEMO_USERS[username] && DEMO_USERS[username].password === password) {
        const demoUser: User = {
          id: `demo-${username}`,
          login: username,
          password_hash: password,
          role: DEMO_USERS[username].role,
          created_at: new Date().toISOString(),
        };
        setUser(demoUser);
        localStorage.setItem('gidroatlas_user', JSON.stringify(demoUser));
        console.log(`✓ Login successful (DEMO MODE): ${username}`);
        return { success: true };
      }

      console.log(`✗ User not found or wrong password: ${username}`);
      return { success: false, error: 'Неверный логин или пароль' };
    } catch (error) {
      console.error('Login error:', error);
      // Even if database fails, try demo users
      if (DEMO_USERS[username] && DEMO_USERS[username].password === password) {
        const demoUser: User = {
          id: `demo-${username}`,
          login: username,
          password_hash: password,
          role: DEMO_USERS[username].role,
          created_at: new Date().toISOString(),
        };
        setUser(demoUser);
        localStorage.setItem('gidroatlas_user', JSON.stringify(demoUser));
        console.log(`✓ Login successful (DEMO MODE - DB error): ${username}`);
        return { success: true };
      }
      return { success: false, error: 'Ошибка сервера' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('gidroatlas_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
