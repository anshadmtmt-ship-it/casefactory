import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '../../../context/CustomerAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    const res = await login(username, password);
    setIsLoading(false);
    
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      if (res.data?.error) {
        const backendError = res.data.error;
        const newErrs = {};
        if (backendError === 'account_not_found') newErrs.username = res.data.message;
        else if (backendError === 'invalid_password') newErrs.password = res.data.message;
        else if (backendError === 'account_disabled') newErrs.username = res.data.message;
        else toast.error(res.data.message || 'Login failed.');
        
        if (Object.keys(newErrs).length > 0) setErrors(newErrs);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #050508 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(10, 5, 20, 0.85)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(124,58,237,0.25)',
            boxShadow: '0 0 80px rgba(124,58,237,0.12), 0 32px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Shimmer top border */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(192,132,252,0.8), transparent)' }} />

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/" className="inline-block">
                <span className="font-sans text-2xl font-bold uppercase text-white" style={{ letterSpacing: '0.22em' }}>
                  CASE <span style={{ color: '#C084FC', textShadow: '0 0 20px rgba(192,132,252,0.5)' }}>FACTORY</span>
                </span>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-white/40 text-sm mt-2 tracking-widest uppercase">Sign in to your account</p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); if (errors.username) setErrors(prev => ({ ...prev, username: null })); }}
                  required
                  placeholder="Enter username or email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.username ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.25)'}`,
                  }}
                  onFocus={e => { if (!errors.username) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                  onBlur={e => { if (!errors.username) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: null })); }}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.25)'}`,
                  }}
                  onFocus={e => { if (!errors.password) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                  onBlur={e => { if (!errors.password) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {/* Forgot Password link */}
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-all duration-200 hover:underline"
                  style={{ color: 'rgba(192,132,252,0.7)' }}
                  onMouseEnter={e => e.target.style.color = '#C084FC'}
                  onMouseLeave={e => e.target.style.color = 'rgba(192,132,252,0.7)'}
                >
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                style={{
                  background: isLoading
                    ? 'rgba(124,58,237,0.4)'
                    : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                  boxShadow: isLoading ? 'none' : '0 0 30px rgba(124,58,237,0.4)',
                }}
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-white/25 text-xs">OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Signup link */}
          <p className="text-center text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold transition-colors duration-200" style={{ color: '#C084FC' }}>
              Create account
            </Link>
          </p>

          {/* Bottom border shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
        </div>
      </motion.div>
    </div>
  );
}
