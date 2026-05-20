import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function FloatingBackButton({ themeColor = '#7C3AED' }) {
  const navigate = useNavigate();

  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(124, 58, 237, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16) || 124;
    const g = parseInt(hex.slice(3, 5), 16) || 58;
    const b = parseInt(hex.slice(5, 7), 16) || 237;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const buttonContent = (
    <>
      {/* Desktop Button */}
      <div className="hidden md:flex fixed z-[9999]" style={{ top: 'clamp(90px, 12vh, 120px)', left: 'clamp(20px, 5vw, 40px)' }}>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 group cursor-pointer transition-colors duration-300"
          style={{
            padding: '8px 16px',
            borderRadius: '100px', // pill shape
            background: 'rgba(15, 10, 25, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${hexToRgba(themeColor, 0.2)}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(25, 15, 40, 0.6)';
            e.currentTarget.style.border = `1px solid ${hexToRgba(themeColor, 0.4)}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 10, 25, 0.4)';
            e.currentTarget.style.border = `1px solid ${hexToRgba(themeColor, 0.2)}`;
          }}
        >
          <ArrowLeft size={16} style={{ color: '#e5e7eb', transition: 'color 0.3s ease' }} className="group-hover:text-white" />
          <span className="text-sm font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            Back
          </span>
        </motion.button>
      </div>

      {/* Mobile Special Back Button */}
      <div className="md:hidden fixed z-[9999]" style={{ top: '90px', left: '16px' }}>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center justify-center cursor-pointer transition-all duration-300"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(15, 10, 25, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${hexToRgba(themeColor, 0.4)}`,
            boxShadow: `0 4px 16px ${hexToRgba(themeColor, 0.2)}`,
          }}
        >
          <ArrowLeft size={20} style={{ color: '#ffffff' }} />
        </motion.button>
      </div>
    </>
  );

  return createPortal(buttonContent, document.body);
}
