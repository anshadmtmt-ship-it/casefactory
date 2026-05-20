import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/');
      if (res.ok) {
        const data = await res.json();
        // The API returns a list with a single item because it's a ModelViewSet list override returning the single object, 
        // wait, I overrode `list` to return `serializer.data` which is an object!
        // Let's handle both in case:
        if (Array.isArray(data)) {
          setSettings(data[0] || {});
        } else {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch store settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a SettingsProvider');
  }
  return context;
}
