import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X, Smartphone, CheckCircle, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../router/AdminAuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = '/api';

const APP_TYPES = [
  { id: 'gpay', label: 'Google Pay', color: '#16A34A' },
  { id: 'paytm', label: 'Paytm', color: '#002970' },
  { id: 'phonepe', label: 'PhonePe', color: '#5E17EB' },
  { id: 'bhim', label: 'BHIM UPI', color: '#F97316' },
  { id: 'other', label: 'Other UPI', color: '#6B7280' },
];

export default function UPIAppsAdminSection() {
  const { token } = useAdminAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    app_type: 'gpay',
    display_name: 'Pay with Google Pay',
    upi_id: '',
    merchant_name: 'Case Factory',
    is_enabled: true,
    display_order: 0,
    instructions: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  const fetchApps = async () => {
    try {
      const res = await axios.get(`${API}/upi-apps/`, { headers: { Authorization: `Bearer ${token}` } });
      setApps(res.data);
    } catch (err) {
      toast.error('Failed to fetch UPI apps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [token]);

  const handleOpenForm = (app = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        app_type: app.app_type,
        display_name: app.display_name,
        upi_id: app.upi_id,
        merchant_name: app.merchant_name,
        is_enabled: app.is_enabled,
        display_order: app.display_order,
        instructions: app.instructions || ''
      });
    } else {
      setEditingApp(null);
      setFormData(defaultForm);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingApp(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTypeChange = (e) => {
    const t = e.target.value;
    const matched = APP_TYPES.find(a => a.id === t);
    setFormData(prev => ({ ...prev, app_type: t, display_name: `Pay with ${matched?.label || 'UPI'}` }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.upi_id || !formData.display_name) {
      toast.error('UPI ID and Display Name are required.');
      return;
    }
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingApp) {
        await axios.patch(`${API}/upi-apps/${editingApp.id}/`, formData, { headers });
        toast.success('UPI App updated.');
      } else {
        await axios.post(`${API}/upi-apps/`, formData, { headers });
        toast.success('UPI App created.');
      }
      fetchApps();
      handleCloseForm();
    } catch (err) {
      toast.error('Failed to save UPI App.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnable = async (app) => {
    try {
      await axios.patch(`${API}/upi-apps/${app.id}/`, { is_enabled: !app.is_enabled }, { headers: { Authorization: `Bearer ${token}` } });
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, is_enabled: !a.is_enabled } : a));
      toast.success(app.is_enabled ? 'App disabled.' : 'App enabled.');
    } catch {
      toast.error('Failed to toggle status.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this UPI app?')) return;
    try {
      await axios.delete(`${API}/upi-apps/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setApps(prev => prev.filter(a => a.id !== id));
      toast.success('App deleted.');
    } catch {
      toast.error('Failed to delete app.');
    }
  };

  const getAppColor = (type) => APP_TYPES.find(a => a.id === type)?.color || '#6B7280';

  if (loading) return <div className="py-10 flex justify-center"><RefreshCw className="animate-spin text-white/50" /></div>;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-serif">Dynamic UPI Apps</h3>
        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all">
          <Plus size={14} /> Add UPI App
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {apps.length === 0 ? (
          <div className="col-span-full p-8 border border-dashed border-white/20 rounded-2xl text-center">
            <p className="text-white/40 text-sm">No dynamic UPI apps configured yet.</p>
          </div>
        ) : (
          apps.map(app => (
            <div key={app.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative group transition-colors hover:bg-white/10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${getAppColor(app.app_type)}20`, border: `1px solid ${getAppColor(app.app_type)}50` }}>
                    <Smartphone size={18} style={{ color: getAppColor(app.app_type) }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{app.display_name}</p>
                    <p className="text-white/50 text-xs font-mono">{app.upi_id}</p>
                  </div>
                </div>
                <button onClick={() => handleToggleEnable(app)} className={`w-10 h-6 rounded-full relative transition-colors ${app.is_enabled ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${app.is_enabled ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">{app.app_type} • Order: {app.display_order}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenForm(app)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(app.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="w-full max-w-md bg-[#0D0518] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
              <button onClick={handleCloseForm} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white"><X size={16} /></button>
              <h3 className="text-xl font-serif text-white mb-6">{editingApp ? 'Edit UPI App' : 'Add UPI App'}</h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 font-semibold">App Type</label>
                  <select name="app_type" value={formData.app_type} onChange={handleTypeChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
                    {APP_TYPES.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 font-semibold">Display Name</label>
                  <input type="text" name="display_name" value={formData.display_name} onChange={handleChange} placeholder="e.g. Pay with Google Pay" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" required />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 font-semibold">UPI ID</label>
                  <input type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} placeholder="e.g. merchant@okhdfc" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" required />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 font-semibold">Merchant Name</label>
                  <input type="text" name="merchant_name" value={formData.merchant_name} onChange={handleChange} placeholder="e.g. Case Factory" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" required />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-1 font-semibold">Display Order</label>
                    <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none" />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" id="is_enabled" name="is_enabled" checked={formData.is_enabled} onChange={handleChange} className="w-4 h-4 accent-violet-500" />
                    <label htmlFor="is_enabled" className="text-white/80 text-sm">Enabled</label>
                  </div>
                </div>

                <button type="submit" disabled={saving} className="w-full py-3.5 mt-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <><Check size={18} /> Save UPI App</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
