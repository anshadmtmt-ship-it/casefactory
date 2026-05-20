import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function AdminTriggerButton({ isOpen, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      title="Open Admin Panel"
      aria-label="Open admin panel"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[80] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300"
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, #374151, #1f2937)'
          : 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
        boxShadow: isOpen
          ? '0 0 0 2px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isOpen ? 'open' : 'closed'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Settings
            size={20}
            strokeWidth={1.5}
            className={`transition-colors ${isOpen ? 'text-white' : 'text-white/70'}`}
            style={{ animation: isOpen ? 'none' : undefined }}
          />
        </motion.span>
      </AnimatePresence>

      {/* Subtle pulse ring when closed */}
      {!isOpen && (
        <span
          className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-30"
          style={{ animationDuration: '3s' }}
        />
      )}
    </motion.button>
  );
}
