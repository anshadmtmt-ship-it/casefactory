import React from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useReels }      from '../Reels/useReels';
import { useHotPicks }   from '../HotPicks/useHotPicks';
import { useCategories } from '../Categories/useCategories';
import { useProducts }   from '../Products/useProducts';
import { SearchProvider } from '../Search/SearchContext';

import Navbar from '../Navigation/Navbar';

export default function StoreLayout() {
  const location = useLocation();

  // Initialize hooks at the top level
  const reelsHook      = useReels();
  const hotPicksHook   = useHotPicks();
  const categoriesHook = useCategories();
  const productsHook   = useProducts();

  return (
    <div className="relative" style={{ background: '#050505', minHeight: '100vh' }}>
      <ScrollRestoration />
      <SearchProvider>
        <Navbar categoriesHook={categoriesHook} />
        <Outlet context={{ reelsHook, hotPicksHook, categoriesHook, productsHook }} />
      </SearchProvider>
    </div>
  );
}
