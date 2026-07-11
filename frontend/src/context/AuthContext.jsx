import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('eduflow_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('eduflow_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('eduflow_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('eduflow_token');
          localStorage.removeItem('eduflow_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('eduflow_token', res.data.token);
    localStorage.setItem('eduflow_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('eduflow_token', res.data.token);
    localStorage.setItem('eduflow_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    toast.success(`Welcome to EduFlow, ${res.data.user.name}!`);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserLocal = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('eduflow_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};
