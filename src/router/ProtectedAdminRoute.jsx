import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading, isSuperuser } = useAdminAuth();

  useEffect(() => {
    // Prevent caching of admin panels on client browser
    const metaCache = document.createElement('meta');
    metaCache.httpEquiv = 'Cache-Control';
    metaCache.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaCache);

    const metaPragma = document.createElement('meta');
    metaPragma.httpEquiv = 'Pragma';
    metaPragma.content = 'no-cache';
    document.head.appendChild(metaPragma);

    const metaExpires = document.createElement('meta');
    metaExpires.httpEquiv = 'Expires';
    metaExpires.content = '0';
    document.head.appendChild(metaExpires);

    return () => {
      document.head.removeChild(metaCache);
      document.head.removeChild(metaPragma);
      document.head.removeChild(metaExpires);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin_panel/login" replace />;
  }

  if (!isSuperuser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="text-white/50 mb-6">Admin access requires superuser privileges.</p>
        <Navigate to="/admin_panel/login" replace />
      </div>
    );
  }

  return <Outlet />;
}
