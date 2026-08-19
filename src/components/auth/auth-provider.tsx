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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem(TOKEN_STORAGE_KEY)
          : null;

      if (!token) {
        setUser(null);
        return;
      }

      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/auth/me', { headers });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
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
      // FastAPI strictly expects x-www-form-urlencoded and 'username'
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        throw new Error(data.detail || `Authentication failed (${res.status})`);
      }

      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
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

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        throw new Error(data.detail || `Registration failed (${res.status})`);
      }

      // Use the consistent storage key
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      }
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    // JWT is stateless, so we just destroy it locally
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

/** Helper for authenticated fetch — auto-attaches Bearer token */
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