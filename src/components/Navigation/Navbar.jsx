import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, Package, MapPin, LogIn, UserPlus, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar({ categoriesHook }) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, customer, logout } = useCustomerAuth();
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isHome = location.pathname === '/';

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigateHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/categories/${slug}`);
    setIsCategoriesOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const profileMenuItems = [
    { icon: <User size={15} />, label: 'My Profile', path: '/profile' },
    { icon: <Package size={15} />, label: 'My Orders', path: '/orders' },
    { icon: <MapPin size={15} />, label: 'Saved Address', path: '/profile#address' },
  ];

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(5,5,5,0.75)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        borderBottom: '1px solid rgba(124,58,237,0.25)',
        boxShadow: '0 1px 0 rgba(124,58,237,0.10), 0 4px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent 0%, rgba(124,58,237,0.50) 30%, rgba(168,85,247,0.70) 50%, rgba(124,58,237,0.50) 70%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" onClick={(e) => { if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="flex items-center group">
              <span
                className="font-sans text-2xl font-bold uppercase text-white transition-all duration-500"
                style={{ letterSpacing: '0.22em' }}
              >
                CASE{' '}
                <span style={{ color: '#C084FC', textShadow: '0 0 20px rgba(192,132,252,0.50), 0 0 40px rgba(168,85,247,0.25)' }}>
                  FACTORY
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
            <Link
              to="/"
              onClick={(e) => { if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              className={`text-sm font-medium transition-all duration-300 relative group ${isHome ? 'text-white' : 'text-white/50 hover:text-white'}`}
              style={{ letterSpacing: '0.06em' }}
            >
              Home
              <span className={`absolute -bottom-1 left-0 h-px transition-all duration-400 ${isHome ? 'w-full' : 'w-0 group-hover:w-full'}`} style={{ background: 'linear-gradient(to right, #7C3AED, #C084FC)', boxShadow: '0 0 8px rgba(168,85,247,0.60)' }} />
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                className="text-sm font-medium text-white/50 hover:text-white transition-all duration-300 flex items-center gap-1 cursor-pointer"
                style={{ letterSpacing: '0.06em' }}
              >
                Categories
                <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-400" style={{ background: 'linear-gradient(to right, #7C3AED, #C084FC)', boxShadow: '0 0 8px rgba(168,85,247,0.60)' }} />
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{ background: 'rgba(8,3,16,0.95)', backdropFilter: 'blur(32px)', border: '1px solid rgba(124,58,237,0.3)' }}
                  >
                    <div className="py-2">
                      {categoriesHook?.activeCategories?.map(cat => (
                        <button
                          key={cat.slug}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="w-full text-left px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                        >
                          {cat.image ? (
                            <img src={cat.image} alt="" className="w-6 h-6 rounded-md object-cover border border-white/10" />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10" style={{ backgroundColor: cat.theme_color }} />
                          )}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="#contact-section"
              onClick={(e) => {
                e.preventDefault();
                if (isHome) {
                  document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#contact-section');
                  setTimeout(() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }}
              className="text-sm font-medium text-white/50 hover:text-white transition-all duration-300 relative group"
              style={{ letterSpacing: '0.06em' }}
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-400" style={{ background: 'linear-gradient(to right, #7C3AED, #C084FC)', boxShadow: '0 0 8px rgba(168,85,247,0.60)' }} />
            </a>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-white/50 hover:text-white transition-all duration-300 group"
            >
              <div className="absolute inset-0 rounded-full group-hover:bg-violet-500/10 transition-colors" />
              <ShoppingCart size={20} className="relative z-10 group-hover:text-violet-400 transition-colors" />
              {cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-20"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                    boxShadow: '0 0 10px rgba(124,58,237,0.5)'
                  }}
                >
                  {cartItemCount}
                </motion.div>
              )}
            </Link>

            {/* Auth Button / Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-300 group"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.35)',
                  }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}>
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden lg:block max-w-[100px] truncate">{customer?.username || 'Account'}</span>
                  <ChevronDown size={13} className={`text-white/50 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-3 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{
                        background: 'rgba(8,3,20,0.97)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.1)',
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-white text-sm font-semibold truncate">{customer?.username}</p>
                        <p className="text-white/40 text-xs truncate">{customer?.email}</p>
                      </div>

                      <div className="py-2">
                        {profileMenuItems.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors flex items-center gap-3"
                            style={{ display: 'flex' }}
                          >
                            <span className="text-violet-400">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-white/5 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                        >
                          <LogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  letterSpacing: '0.05em',
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(124,58,237,0.25)' }}
                />
                <LogIn size={15} className="text-violet-400" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile: Auth icon + Hamburger -> Changed to Auth icon/Profile + Cart */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 text-white/60 hover:text-white transition-all duration-300"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <div
                  className="absolute -top-0 -right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
                  }}
                >
                  {cartItemCount}
                </div>
              )}
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                style={{ 
                  background: isAuthenticated ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(192,132,252,0.4))' : 'rgba(124,58,237,0.12)', 
                  border: '1px solid rgba(124,58,237,0.4)',
                  boxShadow: isAuthenticated ? '0 0 15px rgba(124,58,237,0.3)' : 'none'
                }}
              >
                {isAuthenticated ? <User size={15} className="text-white" /> : <LogIn size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Profile Dropdown */}
      <AnimatePresence>
        {isMobileProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-[72px] right-4 w-64 rounded-2xl overflow-hidden shadow-2xl z-50 border border-violet-500/20"
            style={{
              background: 'rgba(8,3,20,0.95)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.15)',
            }}
          >
            {isAuthenticated ? (
              <>
                {/* User Info Header */}
                <div className="px-4 py-4 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, transparent 100%)' }}>
                  <p className="text-white text-sm font-bold truncate">{customer?.username}</p>
                  <p className="text-white/40 text-xs truncate mt-0.5">{customer?.email}</p>
                </div>

                {/* Actions */}
                <div className="py-2 px-2 space-y-1">
                  <Link to="/profile" onClick={() => setIsMobileProfileOpen(false)}
                    className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3">
                    <User size={15} className="text-violet-400" /> <span className="font-medium">My Profile</span>
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileProfileOpen(false)}
                    className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3">
                    <Package size={15} className="text-violet-400" /> <span className="font-medium">My Orders</span>
                  </Link>
                  <Link to="/profile#address" onClick={() => setIsMobileProfileOpen(false)}
                    className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3">
                    <MapPin size={15} className="text-violet-400" /> <span className="font-medium">Saved Address</span>
                  </Link>
                </div>
                
                <div className="border-t border-white/5 p-2">
                  <button onClick={() => { setIsMobileProfileOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3 font-medium">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMobileProfileOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white text-center transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <LogIn size={15} className="text-violet-400" /> Sign In
                </Link>
                <Link to="/signup" onClick={() => setIsMobileProfileOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white text-center transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}>
                  <UserPlus size={15} /> Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
