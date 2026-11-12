import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, ApiError, SESSION_ENDED_EVENT, tokenStore } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  /** true while the stored session is being validated on first load */
  loading: boolean;
  /** shown on the login page, e.g. after a session expires */
  notice: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(tokenStore.get()));
  const [notice, setNotice] = useState<string | null>(null);

  // Restore the session on page load / refresh.
  useEffect(() => {
    try {
      localStorage.removeItem('user'); // legacy unauthenticated user cache
    } catch {
      /* ignore */
    }
    if (!tokenStore.get()) return;

    let cancelled = false;
    apiFetch<{ user: AuthUser }>('/api/auth/me')
      .then(({ user }) => !cancelled && setUser(user))
      .catch((err: ApiError) => {
        // Network/server errors: keep the token so a temporary outage doesn't log people out.
        if (!cancelled && err.status !== 401) {
          setNotice(err.message);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call that comes back 401 ends the session.
  useEffect(() => {
    const onEnded = (e: Event) => {
      setUser(null);
      setNotice((e as CustomEvent<string | undefined>).detail || 'Your session has ended. Please log in again.');
    };
    window.addEventListener(SESSION_ENDED_EVENT, onEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded);
  }, []);

  const authenticate = useCallback(async (path: string, email: string, password: string) => {
    const data = await apiFetch<AuthResponse>(path, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    tokenStore.set(data.token);
    setNotice(null);
    setUser(data.user);
  }, []);

  const login = useCallback(
    (email: string, password: string) => authenticate('/api/auth/login', email, password),
    [authenticate]
  );
  const signup = useCallback(
    (email: string, password: string) => authenticate('/api/auth/register', email, password),
    [authenticate]
  );

  const logout = useCallback(async () => {
    try {
      if (tokenStore.get()) await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* the session is cleared locally regardless */
    }
    tokenStore.clear();
    setNotice(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, notice, login, signup, logout }}>
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
