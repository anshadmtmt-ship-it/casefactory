import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RotateCcw, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function OTPVerificationPage({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(15);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  // Start the cooldown timer on mount
  useEffect(() => {
    startCooldown();
    inputRefs.current[0]?.focus();
    return () => clearInterval(cooldownRef.current);
  }, []);

  const startCooldown = () => {
    setResendCooldown(15);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    // Accept only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    setError('');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { if (i < 6) newOtp[i] = ch; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => d === '');
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onSuccess(data), 1200);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        // Shake and clear on error
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        startCooldown();
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpFilled = otp.every(d => d !== '');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: 'rgba(10,5,20,0.92)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 0 80px rgba(124,58,237,0.15), 0 32px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(192,132,252,0.9), transparent)' }} />

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                <CheckCircle size={64} className="text-emerald-400" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-2xl font-serif text-white">Account Created!</h2>
              <p className="text-white/50 text-sm">Redirecting you...</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Icon */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)' }}>
                  <ShieldCheck size={32} className="text-violet-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-serif text-white mb-1">Verify Your Email</h2>
                <p className="text-white/50 text-sm text-center">
                  We sent a 6-digit code to
                </p>
                <p className="text-violet-300 text-sm font-medium mt-1 flex items-center gap-2">
                  <Mail size={14} /> {email}
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    whileFocus={{ scale: 1.08 }}
                    className="w-11 h-14 text-center text-xl font-bold text-white rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: digit ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${error ? 'rgba(239,68,68,0.6)' : digit ? 'rgba(168,85,247,0.7)' : 'rgba(124,58,237,0.25)'}`,
                      boxShadow: digit && !error ? '0 0 12px rgba(168,85,247,0.2)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 justify-center text-red-400 text-sm mb-4"
                  >
                    <XCircle size={15} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <motion.button
                onClick={handleVerify}
                disabled={isVerifying || !isOtpFilled}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 mb-6"
                style={{
                  background: isOtpFilled && !isVerifying
                    ? 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)'
                    : 'rgba(124,58,237,0.25)',
                  boxShadow: isOtpFilled && !isVerifying ? '0 0 24px rgba(124,58,237,0.4)' : 'none',
                  cursor: isOtpFilled && !isVerifying ? 'pointer' : 'not-allowed',
                  color: '#fff'
                }}
              >
                {isVerifying ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Create Account'}
              </motion.button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-white/40 text-sm mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="flex items-center gap-2 mx-auto text-sm font-medium transition-all duration-200"
                  style={{ color: resendCooldown > 0 ? 'rgba(255,255,255,0.3)' : '#C084FC', cursor: resendCooldown > 0 ? 'default' : 'pointer' }}
                >
                  {isResending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} className={resendCooldown === 0 ? 'animate-none' : ''} />}
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Back */}
              <button
                onClick={onBack}
                className="w-full mt-6 text-white/30 text-xs hover:text-white/60 transition-colors text-center"
              >
                ← Back to signup
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
      </div>
    </motion.div>
  );
}
