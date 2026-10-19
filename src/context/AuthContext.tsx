import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../types/user';

interface AuthContextValue {
  schoolId: string | null;
  token: string | null;
  user: AuthUser | null;
  role: 'parent' | 'driver' | null;
  setSchoolId: (schoolId: string | null) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolId, setSchoolIdState] = useState<string | null>(() => localStorage.getItem('schoolbus_school_id'));
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('schoolbus_token'));
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem('schoolbus_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setSchoolId = useCallback((nextSchoolId: string | null) => {
    setSchoolIdState(nextSchoolId);
    if (nextSchoolId) {
      localStorage.setItem('schoolbus_school_id', nextSchoolId);
      return;
    }

    localStorage.removeItem('schoolbus_school_id');
  }, []);

  const setToken = useCallback((nextToken: string | null) => {
    setTokenState(nextToken);
    if (nextToken) {
      localStorage.setItem('schoolbus_token', nextToken);
      return;
    }

    localStorage.removeItem('schoolbus_token');
  }, []);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser);
    if (nextUser) {
      localStorage.setItem('schoolbus_user', JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem('schoolbus_user');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  useEffect(() => {
    if (user?.school_id) {
      setSchoolId(String(user.school_id));
    }
  }, [setSchoolId, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      schoolId,
      token,
      user,
      role: user?.role ?? null,
      setSchoolId,
      setToken,
      setUser,
      logout,
    }),
    [schoolId, token, user, setSchoolId, setToken, setUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
