'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isInitiated?: boolean; // <-- NEW: Tracks if they finished onboarding
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'mystica_token';

// <-- NEW: Helper function to silently check profile completion
async function checkProfileInitiation(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return !!(data.primaryLifeGoal && data.primaryLifeGoal.trim() !== '');
    }
  } catch (error) {
    console.error('Failed to check profile completion status', error);
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem(TOKEN_STORAGE_KEY)
          : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch('/api/auth/me', { headers });
      if (!res.ok) {
        setUser(null);
        return;
      }
      
      const data = await res.json();
      const fetchedUser = data.user;
      
      // <-- NEW: Check profile status seamlessly in the background
      if (token && fetchedUser) {
        fetchedUser.isInitiated = await checkProfileInitiation(token);
      }
      
      setUser(fetchedUser ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchMe();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        // <-- NEW: Check profile status on fresh login
        data.user.isInitiated = await checkProfileInitiation(data.access_token);
      }
      setUser(data.user);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        // <-- NEW: Brand new users are guaranteed to not be initiated
        data.user.isInitiated = false; 
      }
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useAuthedFetch() {
  const { user } = useAuth();
  return useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem(TOKEN_STORAGE_KEY)
          : null;
      const headers = new Headers(init.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
    [user]
  );
}

export { TOKEN_STORAGE_KEY };