import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Package, Grid, Flame, Clapperboard, Settings, ChevronRight, ExternalLink, ShoppingBag, CreditCard } from 'lucide-react';
import { useAdminAuth } from '../../router/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

import ReelsAdminPanel from '../../components/AdminPanel/ReelsAdminPanel';
import CategoriesAdminPanel from '../../components/AdminPanel/CategoriesAdminPanel';
import ProductsAdminPanel from '../../components/AdminPanel/ProductsAdminPanel';
import ContactSettingsAdminPanel from '../../components/AdminPanel/ContactSettingsAdminPanel';
import AdminOrdersPanel from '../../components/AdminPanel/AdminOrdersPanel';
import PaymentSettingsAdminPanel from '../../components/AdminPanel/PaymentSettingsAdminPanel';
import BookingsAdminPanel from '../../components/AdminPanel/BookingsAdminPanel';

import { useReels } from '../../components/Reels/useReels';
import { useCategories } from '../../components/Categories/useCategories';
import { useProducts } from '../../components/Products/useProducts';

export default function AdminDashboardPage() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState(null);

  const reelsHook = useReels();
  const categoriesHook = useCategories();
  const productsHook = useProducts();

  const handleLogout = () => {
    logout();
    navigate('/admin_panel/login');
  };

  const sections = [
    {
      id: 'products',
      title: 'Products',
      description: 'Add, edit, and manage all store products and inventory.',
      icon: <Package size={24} className="text-blue-400" />,
      stats: `${productsHook.products.length} total`,
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage product categories and category page banners.',
      icon: <Grid size={24} className="text-purple-400" />,
      stats: `${categoriesHook.categories.length} total`,
    },

    {
      id: 'reels',
      title: 'Reels / Videos',
      description: 'Manage homepage video reels and shoppable links.',
      icon: <Clapperboard size={24} className="text-rose-400" />,
      stats: `${reelsHook.reels.length} total`,
    },
    {
      id: 'contact',
      title: 'Contact Settings',
      description: 'Manage global store contact info, address, and social links.',
      icon: <Settings size={24} className="text-gray-400" />,
      stats: 'Global',
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View, track, and manage all customer orders. Approve, ship, and deliver.',
      icon: <ShoppingBag size={24} className="text-emerald-400" />,
      stats: 'Live',
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Manage UPI QR scanners, bank transfer details, and checkout instruction sets.',
      icon: <CreditCard size={24} className="text-amber-400" />,
      stats: 'UPI/QR',
    },
    {
      id: 'bookings',
      title: 'Booking Requests',
      description: 'View and manage custom product bookings and inquiries.',
      icon: <Package size={24} className="text-yellow-400" />,
      stats: 'Requests',
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-white/20">
      
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-serif font-bold text-sm">
                CF
              </div>
              <span className="text-white font-bold tracking-widest uppercase text-sm">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white/40 text-xs uppercase tracking-widest font-medium mr-4">
                  {user?.username} (Superuser)
                </span>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="group relative flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 text-white/80 hover:text-white transition-all duration-300 shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 text-sm font-medium"
              >
                <ExternalLink size={15} className="group-hover:rotate-12 transition-transform" />
                View Website
              </button>

              <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-white/50 hover:text-white transition-all duration-300 text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-white mb-2">Welcome back, {user?.first_name || user?.username}</h1>
          <p className="text-white/40 font-light">Manage your store's content, products, and featured sections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => setActivePanel(section.id)}
              className="bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] rounded-2xl p-6 cursor-pointer group transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {section.icon}
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 font-medium uppercase tracking-widest">
                  {section.stats}
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors flex items-center gap-2">
                  {section.title}
                </h3>
                <p className="text-white/40 text-sm font-light leading-relaxed mb-6">
                  {section.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/30 group-hover:text-white/80 uppercase tracking-widest transition-colors">
                  Manage Module <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Admin Panels ────────────────────────────────────────────────────── */}
      <ProductsAdminPanel
        isOpen={activePanel === 'products'}
        onClose={() => setActivePanel(null)}
        hook={productsHook}
      />
      
      <CategoriesAdminPanel
        isOpen={activePanel === 'categories'}
        onClose={() => setActivePanel(null)}
        hook={categoriesHook}
      />



      <ReelsAdminPanel
        isOpen={activePanel === 'reels'}
        onClose={() => setActivePanel(null)}
        hook={reelsHook}
      />

      <ContactSettingsAdminPanel
        isOpen={activePanel === 'contact'}
        onClose={() => setActivePanel(null)}
      />

      <AdminOrdersPanel
        isOpen={activePanel === 'orders'}
        onClose={() => setActivePanel(null)}
      />

      <PaymentSettingsAdminPanel
        isOpen={activePanel === 'payment'}
        onClose={() => setActivePanel(null)}
      />

      <BookingsAdminPanel
        isOpen={activePanel === 'bookings'}
        onClose={() => setActivePanel(null)}
      />

    </div>
  );
}
