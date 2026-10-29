import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  };

  const login = async (username, password, recaptchaToken) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        recaptcha_token: recaptchaToken
      });

      const { access_token, user } = response.data;

      // Validate token is string
      if (typeof access_token !== 'string') {
        throw new Error('Invalid token received from server');
      }

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Login SSO Portal Kaltara: tukar kode serah-terima dari callback menjadi JWT.
  // withCredentials agar cookie pengikat ikut terkirim bila SPA dan API beda origin.
  const loginSso = async (kode) => {
    const response = await api.post('/auth/sso/selesai', { kode }, { withCredentials: true });
    const { access_token, user } = response.data;
    if (typeof access_token !== 'string') {
      throw new Error('Invalid token received from server');
    }
    localStorage.setItem('token', access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Ability check based on the user's role abilities returned by /auth/me
  const can = (ability) => {
    const abilities = user?.abilities || [];
    return abilities.includes('*') || abilities.includes(ability);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginSso, logout, loading, can }}>
      {children}
    </AuthContext.Provider>
  );
};
