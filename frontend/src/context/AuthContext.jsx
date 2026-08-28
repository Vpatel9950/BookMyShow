import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'cine_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const authUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'USER',
      isLoggedIn: true,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', authUser.email);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cine_user_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
