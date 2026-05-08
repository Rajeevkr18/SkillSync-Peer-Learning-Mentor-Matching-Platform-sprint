import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('skillsync_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.user) {
        parsed.user.roles = Array.isArray(parsed.user.roles) ? parsed.user.roles : [];
      }
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
      roles: Array.isArray(userData.roles) ? userData.roles : [],
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
  const refreshUser = async () => {
    if (!user || !token) return false;
    try {
      console.log('Refreshing user data for:', user.id);
      const latestUser = await api.getUserInfo(user.id, token);
      console.log('Latest roles from server:', latestUser.roles);
      
      const updatedUser = { 
        id: latestUser.id, 
        name: latestUser.name, 
        email: latestUser.email, 
        roles: Array.isArray(latestUser.roles) ? latestUser.roles : [] 
      };
      
      setUser(updatedUser);
      if (latestUser.token) {
        setToken(latestUser.token);
        localStorage.setItem('skillsync_auth', JSON.stringify({ user: updatedUser, token: latestUser.token }));
      } else {
        const stored = JSON.parse(localStorage.getItem('skillsync_auth') || '{}');
        localStorage.setItem('skillsync_auth', JSON.stringify({ ...stored, user: updatedUser }));
      }
      return true;
    } catch (e) {
      console.error('Failed to refresh user info:', e);
      return false;
    }
  };

  const hasRole = (role) => {
    const has = user?.roles?.includes(role) || user?.roles?.has?.(role) || false;
    return has;
  };

  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isMentor = () => hasRole('ROLE_MENTOR');
  const isLearner = () => hasRole('ROLE_LEARNER');

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, hasRole, isAdmin, isMentor, isLearner }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
