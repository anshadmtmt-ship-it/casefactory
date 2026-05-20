import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, QrCode, Landmark, User, MessageCircle, RefreshCw, Upload, Check, Trash2 } from 'lucide-react';
import { useAdminAuth } from '../../router/AdminAuthContext';
import ImageCropperModal from '../common/ImageCropperModal';
import UPIAppsAdminSection from './UPIAppsAdminSection';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = '/api';

export default function PaymentSettingsAdminPanel({ isOpen, onClose }) {
  const { token } = useAdminAuth();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [formData, setFormData] = useState({
    upi_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    instructions: 'Please share the exact amount. Upload the screenshot after payment.',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // QR Image cropping state
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [croppedQRFile, setCroppedQRFile] = useState(null);
  const [croppedQRPreview, setCroppedQRPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethod();
    }
  }, [isOpen]);

  const fetchPaymentMethod = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/payment-methods/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        // Grab the first payment method (standard active setting)
        const pm = res.data[0];
        setPaymentMethod(pm);
        setFormData({
          upi_id: pm.upi_id || '',
          bank_name: pm.bank_name || '',
          account_number: pm.account_number || '',
          ifsc_code: pm.ifsc_code || '',
          account_holder_name: pm.account_holder_name || '',
          instructions: pm.instructions || '',
          is_active: pm.is_active ?? true
        });
        if (pm.qr_code) {
          setCroppedQRPreview(pm.qr_code);
        }
      } else {
        setPaymentMethod(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch payment settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file only.');
        return;
      }
      // Validate file size limit: 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Max size is 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setRawImageSrc(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile, previewUrl) => {
    setCroppedQRFile(croppedFile);
    setCroppedQRPreview(previewUrl);
    setIsCropOpen(false);
    toast.success('QR image cropped and ready to save!');
  };

  const handleDeleteQR = () => {
    setCroppedQRFile(null);
    setCroppedQRPreview(null);
    setRawImageSrc(null);
    toast.success('QR image pending removal. Click Save to apply.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('upi_id', formData.upi_id);
      payload.append('bank_name', formData.bank_name);
      payload.append('account_number', formData.account_number);
      payload.append('ifsc_code', formData.ifsc_code);
      payload.append('account_holder_name', formData.account_holder_name);
      payload.append('instructions', formData.instructions);
      payload.append('is_active', formData.is_active);

      if (croppedQRFile) {
        payload.append('qr_code', croppedQRFile);
      } else if (croppedQRPreview === null) {
        // QR was deleted explicitly
        payload.append('qr_code', '');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      if (paymentMethod) {
        // Update existing ManualPaymentMethod
        const res = await axios.patch(`${API}/payment-methods/${paymentMethod.id}/`, payload, { headers });
        setPaymentMethod(res.data);
        toast.success('Payment settings updated successfully!');
      } else {
        // Create new ManualPaymentMethod
        const res = await axios.post(`${API}/payment-methods/`, payload, { headers });
        setPaymentMethod(res.data);
        toast.success('Payment settings created successfully!');
      }
      fetchPaymentMethod();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  const FormField = ({ label, name, icon: Icon, placeholder, type = 'text', multiline = false }) => (
    <div className="mb-5">
      <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
        <Icon size={14} className="text-white/40" /> {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors resize-none placeholder:text-white/20"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors placeholder:text-white/20"
        />
      )}
    </div>
  );

  return (
    <>
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
                <h2 className="text-xl font-serif text-white">Payment Settings</h2>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Manage Scanner & Bank Details</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
              
              {/* Dynamic UPI Apps Section */}
              <UPIAppsAdminSection />

              <div className="w-full h-px bg-white/10 my-8" />
              <h3 className="text-white text-lg font-serif mb-4">Fallback Payment Method (QR & Bank)</h3>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw size={24} className="text-violet-500 animate-spin" />
                </div>
              ) : (
                <form id="payment-settings-form" onSubmit={handleSave} className="space-y-6">
                  
                  {/* QR Image Scanner Workspace */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <QrCode size={16} className="text-violet-400" /> QR Code Scanner Image
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                      {/* Image Preview Box */}
                      <div className="w-40 h-40 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative">
                        {croppedQRPreview ? (
                          <img src={croppedQRPreview} alt="QR Scanner Preview" className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center text-white/20">
                            <QrCode size={40} className="mb-2" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">No QR Code</span>
                          </div>
                        )}
                      </div>

                      {/* Controls Area */}
                      <div className="flex-1 space-y-3 w-full">
                        <p className="text-xs text-white/45">Upload your payment store QR Code scanner (GPay, PhonePe, Paytm, etc.). Image will be custom-cropped and compressed to a fast square format.</p>
                        
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-gray-200 cursor-pointer transition-colors">
                            <Upload size={14} /> Upload QR
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                          </label>
                          {croppedQRPreview && (
                            <button
                              type="button"
                              onClick={handleDeleteQR}
                              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/35 hover:bg-red-500/20 text-red-400 font-semibold text-xs rounded-xl transition-all"
                            >
                              <Trash2 size={14} /> Remove Code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UPI Info Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                      <QrCode size={16} className="text-violet-400" /> UPI Details
                    </h3>
                    <FormField label="UPI ID" name="upi_id" icon={QrCode} placeholder="merchant@upi" />
                  </div>

                  {/* Bank Info Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                      <Landmark size={16} className="text-violet-400" /> Bank Details
                    </h3>
                    <FormField label="Bank Account Holder Name" name="account_holder_name" icon={User} placeholder="e.g. Case Factory Private Ltd." />
                    <FormField label="Bank Name" name="bank_name" icon={Landmark} placeholder="e.g. HDFC Bank" />
                    <FormField label="Account Number" name="account_number" icon={Landmark} placeholder="e.g. 50100234567890" />
                    <FormField label="IFSC Code" name="ifsc_code" icon={Landmark} placeholder="e.g. HDFC0000123" />
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                      <MessageCircle size={16} className="text-violet-400" /> Instructions
                    </h3>
                    <FormField label="Payment Instructions" name="instructions" icon={MessageCircle} multiline placeholder="Enter step-by-step custom instructions for checkout..." />
                  </div>

                  {/* Is Active Status checkbox */}
                  <div className="flex items-center gap-3 px-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-white/60 text-xs font-semibold uppercase tracking-widest cursor-pointer select-none">
                      Enable payment method at checkout
                    </label>
                  </div>

                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end">
              <button
                type="submit"
                form="payment-settings-form"
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Save Settings
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>

      {/* Image Cropper Workspace Modal */}
      <ImageCropperModal
        isOpen={isCropOpen}
        imageSrc={rawImageSrc}
        aspect={1} // Lock aspect ratio to 1:1 for clean square QR Codes
        onCropComplete={handleCropComplete}
        onClose={() => setIsCropOpen(false)}
      />
    </>
  );
}
