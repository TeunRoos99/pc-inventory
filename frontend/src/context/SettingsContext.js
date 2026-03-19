import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState('dark');
  const [customCategories, setCustomCategories] = useState([]);

  // Load settings when user logs in
  useEffect(() => {
    if (!user) return;
    axios.get('/api/settings').then(r => {
      applyTheme(r.data.theme || 'dark');
    }).catch(() => {});
    loadCustomCategories();
  }, [user]);

  const applyTheme = (t) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const setTheme = async (t) => {
    applyTheme(t);
    try { await axios.put('/api/settings', { theme: t }); } catch {}
  };

  const loadCustomCategories = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/custom-categories');
      setCustomCategories(data);
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, customCategories, loadCustomCategories }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
