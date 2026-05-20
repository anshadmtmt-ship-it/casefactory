import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API = '/api/auth';
const OTP_RESEND_SECONDS = 15;

// ─── Shared slide animation ───────────────────────────────────────────────────
const slide = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -40 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

// ─── Background shell ─────────────────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #050508 60%)', backgroundAttachment: 'fixed' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #7C3AED 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
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
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Email Entry ──────────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/forgot-password/`, { email });
      toast.success('Verification code sent successfully.\nPlease check Inbox, Promotions, or Spam folder.', { duration: 5000 });
      onNext(email);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="email" {...slide}>
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-2">
          <span className="font-sans text-2xl font-bold uppercase text-white" style={{ letterSpacing: '0.22em' }}>
            CASE <span style={{ color: '#C084FC', textShadow: '0 0 20px rgba(192,132,252,0.5)' }}>FACTORY</span>
          </span>
        </Link>
        <p className="text-white/40 text-sm tracking-widest uppercase">Reset Your Password</p>
        <p className="text-white/30 text-xs mt-2">Enter your email and we'll send you a 6-digit OTP.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(124,58,237,0.25)'}` }}
              onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
              onBlur={e =>  { if (!error) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
            />
          </div>
          {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1">{error}</motion.p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group mt-2"
          style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)', boxShadow: loading ? 'none' : '0 0 30px rgba(124,58,237,0.4)' }}
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><span>Send Reset Code</span><ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold transition-colors duration-200" style={{ color: '#C084FC' }}>Sign in</Link>
      </p>
    </motion.div>
  );
}

// ─── Step 2: OTP Verification ─────────────────────────────────────────────────
function StepOTP({ email, onNext, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSecs, setResendSecs] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const timer = setInterval(() => setResendSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) handleVerify(next.join(''));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const arr = paste.split('');
      setOtp(arr);
      refs.current[5]?.focus();
      handleVerify(paste);
    }
  };

  const handleVerify = async (code) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/verify-reset-otp/`, { email, otp: code });
      toast.success('OTP verified!');
      onNext();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0) return;
    setResending(true);
    try {
      await axios.post(`${API}/forgot-password/`, { email });
      toast.success('New OTP sent!');
      setResendSecs(OTP_RESEND_SECONDS);
      setOtp(['', '', '', '', '', '']);
      setError('');
      refs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div key="otp" {...slide}>
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <Mail size={28} style={{ color: '#C084FC' }} />
        </div>
        <h2 className="text-xl font-serif text-white mb-1">Check Your Email</h2>
        <p className="text-white/40 text-sm">We sent a 6-digit code to</p>
        <p className="text-violet-400 text-sm font-medium mt-1">{email}</p>
      </div>

      <div className="flex gap-2 justify-center mb-2" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1}
            value={digit}
            onChange={e => handleChange(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            className="w-12 h-14 text-center text-2xl font-bold text-white rounded-xl outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `2px solid ${error ? 'rgba(239,68,68,0.6)' : digit ? 'rgba(168,85,247,0.7)' : 'rgba(124,58,237,0.3)'}`,
              boxShadow: digit ? '0 0 16px rgba(124,58,237,0.25)' : 'none',
            }}
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs text-center mt-2">{error}</motion.p>
      )}

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin" />
        </div>
      )}

      <div className="text-center mt-6">
        {resendSecs > 0 ? (
          <p className="text-white/30 text-sm">Resend code in <span className="text-violet-400 font-medium">{resendSecs}s</span></p>
        ) : (
          <button onClick={handleResend} disabled={resending}
            className="flex items-center gap-2 mx-auto text-sm font-medium transition-colors"
            style={{ color: '#C084FC' }}>
            {resending ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin" /> : <RotateCcw size={14} />}
            Resend Code
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Step 3: New Password ─────────────────────────────────────────────────────
function StepNewPassword({ email, onDone }) {
  const [form, setForm] = useState({ password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (form.password.length < 4) e.password = 'Password must be at least 4 characters.';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/reset-password/`, { email, ...form });
      onDone();
    } catch (err) {
      const data = err.response?.data;
      if (data?.error === 'password_mismatch') setErrors({ confirm_password: data.message });
      else if (data?.error === 'weak_password')  setErrors({ password: data.message });
      else toast.error(data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'password',         label: 'New Password',     show: showPw, setShow: setShowPw, placeholder: 'Min. 4 characters' },
    { name: 'confirm_password', label: 'Confirm Password', show: showCf, setShow: setShowCf, placeholder: 'Repeat new password' },
  ];

  return (
    <motion.div key="newpw" {...slide}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <Lock size={28} style={{ color: '#C084FC' }} />
        </div>
        <h2 className="text-xl font-serif text-white mb-1">Create New Password</h2>
        <p className="text-white/40 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{field.label}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type={field.show ? 'text' : 'password'}
                value={form[field.name]}
                placeholder={field.placeholder}
                onChange={e => { setForm(p => ({ ...p, [field.name]: e.target.value })); setErrors(p => ({ ...p, [field.name]: null })); }}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors[field.name] ? 'rgba(239,68,68,0.6)' : 'rgba(124,58,237,0.25)'}` }}
                onFocus={e => { if (!errors[field.name]) e.target.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                onBlur={e =>  { if (!errors[field.name]) e.target.style.borderColor = 'rgba(124,58,237,0.25)'; }}
              />
              <button type="button" onClick={() => field.setShow(!field.show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors[field.name] && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1">{errors[field.name]}</motion.p>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group mt-2"
          style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)', boxShadow: loading ? 'none' : '0 0 30px rgba(124,58,237,0.4)' }}
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function StepSuccess() {
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => navigate('/login'), 3500); return () => clearTimeout(t); }, [navigate]);

  return (
    <motion.div key="success" {...slide} className="text-center py-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}
      >
        <CheckCircle size={40} style={{ color: '#22C55E' }} />
      </motion.div>
      <h2 className="text-2xl font-serif text-white mb-2">Password Changed!</h2>
      <p className="text-white/40 text-sm mb-6">Your password has been updated successfully. Redirecting to login…</p>
      <Link to="/login" className="text-sm font-medium" style={{ color: '#C084FC' }}>Go to Login →</Link>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');   // 'email' | 'otp' | 'newpw' | 'success'
  const [email, setEmail] = useState('');

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {step === 'email'   && <StepEmail  key="email"   onNext={em => { setEmail(em); setStep('otp');    }} />}
        {step === 'otp'     && <StepOTP    key="otp"     email={email} onNext={() => setStep('newpw')} onBack={() => setStep('email')} />}
        {step === 'newpw'   && <StepNewPassword key="newpw" email={email} onDone={() => setStep('success')} />}
        {step === 'success' && <StepSuccess key="success" />}
      </AnimatePresence>
    </AuthShell>
  );
}
