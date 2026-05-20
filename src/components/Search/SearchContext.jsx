import React, { createContext, useContext, useState, useEffect } from 'react';
import SearchModal from './SearchModal';

const SearchContext = createContext(null);

export const useGlobalSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useGlobalSearch must be used within SearchProvider');
  return context;
};

export function SearchProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global hotkey to open search (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ isSearchOpen, setIsSearchOpen }}>
      {children}
      <SearchModal />
    </SearchContext.Provider>
  );
}
