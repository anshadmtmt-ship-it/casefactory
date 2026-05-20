import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '../../../context/CustomerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OTPVerificationPage from './OTPVerificationPage';
import axios from 'axios';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', phone_number: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('');

  const { setCustomer, setIsAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = 'Username is required.';
    else if (!/^[A-Za-z0-9_]+$/.test(form.username)) errs.username = 'Only letters, numbers, and underscores.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required.';
    if (!form.phone_number || !/^\+?\d{9,15}$/.test(form.phone_number)) errs.phone_number = 'Enter a valid phone number.';
    if (form.password.length < 4) errs.password = 'Password must be at least 4 characters.';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/request-otp/', form);
      setPendingEmail(form.email);
      setStep('otp');
      toast.success('Verification code sent successfully.\nPlease check Inbox, Promotions, or Spam folder.', { duration: 5000 });
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) {
        const newErrs = {};
        const fieldMap = {
          username_exists: 'username', email_exists: 'email', phone_exists: 'phone_number',
          password_mismatch: 'confirm_password', weak_password: 'password', invalid_phone: 'phone_number',
          invalid_username: 'username',
        };
        const field = fieldMap[data.error];
        if (field) newErrs[field] = data.message;
        else toast.error(data.message || 'Request failed.');
        if (Object.keys(newErrs).length) setErrors(newErrs);
      } else {
        toast.error('Server connection failed. Try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = (responseData) => {
    const { access, refresh, user } = responseData;
    localStorage.setItem('customer_access_token', access);
    localStorage.setItem('customer_refresh_token', refresh);
    localStorage.setItem('customer_user', JSON.stringify(user));
    setCustomer(user);
    setIsAuthenticated(true);
    toast.success('Account created successfully! Welcome 🎉');
    navigate('/');
  };

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', icon: <User size={16} /> },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', icon: <Mail size={16} /> },
    { name: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210', icon: <Phone size={16} /> },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #050508 60%)', backgroundAttachment: 'fixed' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 'otp' ? (
          <OTPVerificationPage
            key="otp"
            email={pendingEmail}
            onSuccess={handleOTPSuccess}
            onBack={() => setStep('form')}
          />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
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
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(192,132,252,0.8), transparent)' }} />

              <div className="text-center mb-8">
                <Link to="/" className="inline-block">
                  <span className="font-sans text-2xl font-bold uppercase text-white" style={{ letterSpacing: '0.22em' }}>
                    CASE <span style={{ color: '#C084FC', textShadow: '0 0 20px rgba(192,132,252,0.5)' }}>FACTORY</span>
                  </span>
                </Link>
                <p className="text-white/40 text-sm mt-2 tracking-widest uppercase">Create Your Account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field, i) => (
                  <motion.div key={field.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{field.label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{field.icon}</span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${errors[field.name] ? 'rgba(239,68,68,0.6)' : 'rgba(124,58,237,0.25)'}`,
                        }}
                        onFocus={e => { if (!errors[field.name]) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                        onBlur={e => { if (!errors[field.name]) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
                      />
                    </div>
                    {errors[field.name] && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1">
                        {errors[field.name]}
                      </motion.p>
                    )}
                  </motion.div>
                ))}

                {[
                  { name: 'password', label: 'Password', show: showPassword, setShow: setShowPassword, placeholder: 'Min. 4 characters' },
                  { name: 'confirm_password', label: 'Confirm Password', show: showConfirm, setShow: setShowConfirm, placeholder: 'Repeat your password' },
                ].map((field, i) => (
                  <motion.div key={field.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.25 }}>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{field.label}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input
                        type={field.show ? 'text' : 'password'}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${errors[field.name] ? 'rgba(239,68,68,0.6)' : 'rgba(124,58,237,0.25)'}`,
                        }}
                        onFocus={e => { if (!errors[field.name]) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                        onBlur={e => { if (!errors[field.name]) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
                      />
                      <button type="button" onClick={() => field.setShow(!field.show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                        {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors[field.name] && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1">
                        {errors[field.name]}
                      </motion.p>
                    )}
                  </motion.div>
                ))}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group mt-2"
                    style={{
                      background: isLoading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                      boxShadow: isLoading ? 'none' : '0 0 30px rgba(124,58,237,0.4)',
                    }}
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isLoading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>Send Verification Code <ArrowRight size={16} /></>
                    )}
                  </button>
                </motion.div>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-white/25 text-xs">OR</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <p className="text-center text-sm text-white/40">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold transition-colors duration-200" style={{ color: '#C084FC' }}>
                  Sign in
                </Link>
              </p>

              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
