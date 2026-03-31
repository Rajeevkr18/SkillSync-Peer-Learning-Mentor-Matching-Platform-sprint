import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('skillsync_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenStr) => {
    const authUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
    };
    setUser(authUser);
    setToken(tokenStr);
    localStorage.setItem('skillsync_auth', JSON.stringify({ user: authUser, token: tokenStr }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillsync_auth');
  };

  const hasRole = (role) => user?.roles?.includes(role) || user?.roles?.has?.(role) || false;
  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isMentor = () => hasRole('ROLE_MENTOR');
  const isLearner = () => hasRole('ROLE_LEARNER');

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAdmin, isMentor, isLearner }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
