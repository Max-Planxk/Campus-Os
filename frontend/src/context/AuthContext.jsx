import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const initAuth = async () => {
    const existingToken = getToken();
    if (existingToken) {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.warn('Existing token invalid or expired:', err);
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data);
    addToast(`Welcome back, ${data.name}!`);
    return data;
  };

  const studentRegister = async (registrationData) => {
    const data = await api.studentRegister(registrationData);
    setToken(data.token);
    setUser(data);
    addToast(`🎉 Registration successful! Welcome to CampusOS, ${data.name}.`, 'success');
    return data;
  };

  const studentLogin = async (loginData) => {
    const data = await api.studentLogin(loginData);
    setToken(data.token);
    setUser(data);
    addToast(`Welcome back, ${data.name}!`, 'success');
    return data;
  };

  const staffLogin = async (credentials) => {
    const data = await api.staffLogin(credentials);
    setToken(data.token);
    setUser(data);
    addToast(`Faculty Session Authorized: Welcome, ${data.name}!`, 'success');
    return data;
  };

  const staffRegister = async (registrationData) => {
    const data = await api.staffRegister(registrationData);
    setToken(data.token);
    setUser(data);
    addToast(`🎉 Faculty record saved to database! Welcome, ${data.name}.`, 'success');
    return data;
  };

  const adminLogin = async (credentials) => {
    const data = await api.adminLogin(credentials);
    setToken(data.token);
    setUser(data);
    addToast(`Administrator Session Authorized: ${data.name}`, 'success');
    return data;
  };

  const adminRegister = async (registrationData) => {
    const data = await api.adminRegister(registrationData);
    setToken(data.token);
    setUser(data);
    addToast(`🛡️ Administrator account persisted to database! Welcome, ${data.name}.`, 'success');
    return data;
  };

  const loginWithDemo = async (role, email) => {
    try {
      const data = await api.demoSwitch(role, email);
      setToken(data.token);
      setUser(data);
      addToast(`Switched active view to ${data.role}: ${data.name}`, 'success');
      return data;
    } catch (err) {
      console.error('Demo switch failed', err);
      addToast(err.message || 'Failed to switch role', 'error');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    addToast('Logged out of CampusOS', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      role: user?.role,
      login,
      studentRegister,
      studentLogin,
      staffLogin,
      staffRegister,
      adminLogin,
      adminRegister,
      logout,
      switchRole: loginWithDemo,
      addToast,
    }}>
      {children}
      {/* Toast notifications container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
            <span>{t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✓'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
