import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  language: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  language: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const TOKEN_KEY = 'agrishield_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify the stored token with the server
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.ok) {
          try {
            setUser(await res.json());
          } catch {
            // Couldn't parse user — treat as invalid session
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
          }
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        // Network error or server down — keep token, don't force logout
        // (user can still use the app; backend may just be temporarily down)
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSession = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Cannot reach server. Run: npm run dev:all');
    }
    let data: { token?: string; user?: AuthUser; error?: string } = {};
    try { data = await res.json(); } catch { throw new Error('Server returned an invalid response.'); }
    if (!res.ok) throw new Error(data.error || 'Login failed.');
    saveSession(data.token!, data.user!);
  }, []);

  const register = useCallback(async (formData: RegisterData) => {
    let res: Response;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      throw new Error('Cannot reach server. Run: npm run dev:all');
    }
    let data: { token?: string; user?: AuthUser; error?: string } = {};
    try { data = await res.json(); } catch { throw new Error('Server returned an invalid response.'); }
    if (!res.ok) throw new Error(data.error || 'Registration failed.');
    saveSession(data.token!, data.user!);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
