import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Phone, MessageCircle, Mail, Clock, Store } from 'lucide-react';

const Instagram = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
import { useAdminAuth } from '../../router/AdminAuthContext';
import { useStoreSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

export default function ContactSettingsAdminPanel({ isOpen, onClose }) {
  const { token } = useAdminAuth();
  const { settings, refreshSettings } = useStoreSettings();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && isOpen) {
      setFormData(settings);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/settings/1/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save settings');
      
      await refreshSettings();
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ icon: Icon, label, name, type = "text", placeholder, multiline = false }) => (
    <div className="mb-5">
      <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
        <Icon size={14} className="text-white/40" /> {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors resize-none placeholder:text-white/20"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors placeholder:text-white/20"
        />
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
            <div>
              <h2 className="text-xl font-serif text-white">Contact Settings</h2>
              <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Manage Store Info</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">

            <form id="contact-form" onSubmit={handleSave} className="space-y-8">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Store size={16} /> General Info
                </h3>
                <InputField icon={Store} label="Store Name" name="store_name" placeholder="Case Factory" />
                <InputField icon={Mail} label="Email Address" name="email" type="email" placeholder="casefactorycpy@gmail.com" />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Phone size={16} /> Phone & Social
                </h3>
                <InputField icon={Phone} label="Phone Number" name="phone" placeholder="+91 9876543210" />
                <InputField icon={MessageCircle} label="WhatsApp Number" name="whatsapp" placeholder="+919876543210" />
                <InputField icon={MessageCircle} label="WhatsApp Enquiry Template" name="whatsapp_enquiry_template" multiline placeholder="Hello, I'm interested in..." />
                <InputField icon={Instagram} label="Instagram Link" name="instagram" type="url" placeholder="https://instagram.com/..." />
                <InputField icon={Facebook} label="Facebook Link" name="facebook" type="url" placeholder="https://facebook.com/..." />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MapPin size={16} /> Location & Hours
                </h3>
                <InputField icon={Clock} label="Business Hours" name="business_hours" multiline placeholder="Mon - Sat, 10:00 AM - 8:00 PM" />
                <InputField icon={MapPin} label="Physical Address" name="address" multiline placeholder="123 Luxury Street..." />
                <InputField icon={MapPin} label="Google Maps Embed (HTML iframe)" name="google_maps_embed" multiline placeholder='<iframe src="..."></iframe>' />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end">
            <button
              type="submit"
              form="contact-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
