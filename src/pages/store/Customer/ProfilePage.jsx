import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerAuth } from '../../../context/CustomerAuthContext';
import { User, MapPin, Lock, Camera, CheckCircle, Plus, Trash2, Edit2, Key, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import ImageCropper from '../../../components/AdminPanel/ImageCropper';

export default function ProfilePage() {
  const { customer, getAuthHeaders, setCustomer } = useCustomerAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (location.hash === '#address') {
      setActiveTab('address');
    } else if (location.hash === '#security') {
      setActiveTab('security');
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white" style={{ background: '#050508' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="p-6 rounded-3xl sticky top-28" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-violet-600/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <User size={18} /> My Profile
              </button>
              <button onClick={() => setActiveTab('address')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'address' ? 'bg-violet-600/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <MapPin size={18} /> Saved Addresses
              </button>
              <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-violet-600/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <Lock size={18} /> Security
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && <ProfileTab key="profile" />}
            {activeTab === 'address' && <AddressTab key="address" />}
            {activeTab === 'security' && <SecurityTab key="security" />}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function ProfileTab() {
  const { customer, getAuthHeaders, setCustomer } = useCustomerAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ username: '', email: '', phone_number: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  // Image Crop
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile/', { headers: getAuthHeaders() });
      setProfile(res.data);
      setFormData({
        username: res.data.username || '',
        email: res.data.email || '',
        phone_number: res.data.phone_number || ''
      });
      setPreviewImage(res.data.profile_image);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (file, previewUrl) => {
    setSelectedFile(file);
    setPreviewImage(previewUrl);
    setCropImageSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      payload.append('phone_number', formData.phone_number);
      if (selectedFile) {
        payload.append('profile_image', selectedFile);
      }

      const res = await axios.put('/api/profile/', payload, { 
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } 
      });
      
      toast.success('Profile updated successfully!');
      setProfile(res.data);
      // Update global context username if needed
      setCustomer(prev => ({ ...prev, username: res.data.username }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          aspectRatio={1} 
          onCancel={() => setCropImageSrc(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}

      <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <h2 className="text-2xl font-serif mb-8">Personal Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-black border-2 border-violet-500/30 flex-shrink-0"
                   style={{ boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-900/20 text-violet-400">
                    <User size={40} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-violet-500 transition-colors">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input required pattern="[A-Za-z0-9_]+" title="Only letters, numbers, and underscores"
                    type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input required pattern="^\+?[0-9]{10,15}$" title="Valid phone number required"
                  type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl font-bold tracking-widest uppercase transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function AddressTab() {
  const { getAuthHeaders } = useCustomerAuth();
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get('/api/addresses/', { headers: getAuthHeaders() });
      setAddresses(res.data);
    } catch (err) {
      toast.error('Failed to load addresses');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`/api/addresses/${id}/`, { headers: getAuthHeaders() });
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingAddress) {
        await axios.put(`/api/addresses/${editingAddress.id}/`, data, { headers: getAuthHeaders() });
        toast.success('Address updated');
      } else {
        await axios.post('/api/addresses/', data, { headers: getAuthHeaders() });
        toast.success('Address added');
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Saved Addresses</h2>
          <button onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 text-violet-400 rounded-xl hover:bg-violet-600/30 transition-colors text-sm font-medium">
            <Plus size={16} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 && <p className="text-white/40 italic">No addresses saved yet.</p>}
          {addresses.map(addr => (
            <div key={addr.id} className="p-5 rounded-2xl relative border transition-colors group"
                 style={{ 
                   background: addr.is_default ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
                   borderColor: addr.is_default ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'
                 }}>
              {addr.is_default && (
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-400/10 px-2 py-1 rounded-md">
                  Default
                </span>
              )}
              <h3 className="font-medium text-white mb-1">{addr.full_name}</h3>
              <p className="text-sm text-white/50 mb-3">{addr.phone}</p>
              <p className="text-sm text-white/70 line-clamp-2">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
              
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingAddress(addr); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <AddressModal 
          address={editingAddress} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </motion.div>
  );
}

function AddressModal({ address, onClose, onSave }) {
  const [formData, setFormData] = useState(address || {
    full_name: '', phone: '', address: '', city: '', state: '', pincode: '', is_default: false
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0510] border border-violet-500/30 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-serif mb-6">{address ? 'Edit Address' : 'Add New Address'}</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase mb-1">Full Name</label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase mb-1">Phone Number</label>
              <input required pattern="[0-9]+" type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/50 uppercase mb-1">Full Address</label>
            <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase mb-1">City</label>
              <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase mb-1">State</label>
              <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase mb-1">Pincode</label>
              <input required pattern="[0-9]+" type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="accent-violet-500" />
            <span className="text-sm text-white/70">Set as default address</span>
          </label>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">Save Address</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab() {
  const { getAuthHeaders } = useCustomerAuth();
  const [formData, setFormData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      await axios.post('/api/change_password/', formData, { headers: getAuthHeaders() });
      toast.success('Password changed successfully');
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : (errorMsg || 'Failed to change password'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
          <Key className="text-violet-400" /> Change Password
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Current Password</label>
            <input required type="password" value={formData.current_password} onChange={e => setFormData({...formData, current_password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">New Password</label>
            <input required type="password" minLength={8} value={formData.new_password} onChange={e => setFormData({...formData, new_password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Confirm New Password</label>
            <input required type="password" minLength={8} value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSaving} className="w-full py-3 rounded-xl font-bold tracking-widest uppercase transition-all duration-300"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#fff' }}>
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
