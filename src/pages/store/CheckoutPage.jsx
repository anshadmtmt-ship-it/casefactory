import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Trash2, ArrowLeft, Upload, CheckCircle, CreditCard, Landmark, MapPin, Copy, Check, QrCode, MessageCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import ImageCropperModal from '../../components/common/ImageCropperModal';

export default function CheckoutPage() {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const { customer, getAuthHeaders } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const instantItem = location.state?.instantCheckoutItem;
  const displayItems = instantItem ? [instantItem] : cartItems;

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  const [upiApps, setUpiApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  
  const [formData, setFormData] = useState({
    shipping_name: customer?.username || '',
    shipping_phone: customer?.phone_number || '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
  });
  
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [rawScreenshotSrc, setRawScreenshotSrc] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (displayItems.length === 0) {
      toast.error("Your cart is empty.");
      navigate('/');
      return;
    }

    const hasSoldOut = displayItems.some(item => {
      const p = item.product_details;
      return p && (p.is_sold_out || item.quantity > p.stock);
    });

    if (hasSoldOut) {
      toast.error("This product is currently out of stock.");
      if (instantItem) {
        navigate(`/product_details/${instantItem.product_details?.slug || ''}`);
      } else {
        navigate('/cart');
      }
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const res = await axios.get('/api/payment-methods/');
        const activeMethods = res.data.filter(m => m.is_active);
        setPaymentMethods(activeMethods);
        if (activeMethods.length > 0) {
          setSelectedMethod(activeMethods[0]);
        }
      } catch (err) {
        console.error("Failed to load payment methods", err);
      }
    };

    const fetchUpiApps = async () => {
      try {
        const res = await axios.get('/api/upi-apps/');
        const activeApps = res.data.filter(a => a.is_enabled);
        setUpiApps(activeApps);
      } catch (err) {
        console.error("Failed to load UPI apps", err);
      }
    };

    const fetchAddresses = async () => {
      try {
        const res = await axios.get('/api/addresses/', { headers: getAuthHeaders() });
        if (res.data && res.data.length > 0) {
          const defaultAddr = res.data.find(a => a.is_default) || res.data[0];
          if (defaultAddr) {
            setFormData(prev => ({
              ...prev,
              shipping_name: defaultAddr.full_name || prev.shipping_name,
              shipping_phone: defaultAddr.phone || prev.shipping_phone,
              shipping_address: defaultAddr.address || '',
              shipping_city: defaultAddr.city || '',
              shipping_state: defaultAddr.state || '',
              shipping_pincode: defaultAddr.pincode || '',
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    fetchPaymentMethods();
    fetchUpiApps();
    fetchAddresses();
  }, [displayItems.length, navigate, getAuthHeaders]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file only.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB.");
        return;
      }
      setRawFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setRawScreenshotSrc(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile, previewUrl) => {
    // Sanitize the filename to be lowercase with safe characters
    const sanitizedFilename = `payment_proof_${Date.now()}.jpg`;
    const finalFile = new File([croppedFile], sanitizedFilename, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    setProofFile(finalFile);
    setProofPreview(previewUrl);
    setIsCropOpen(false);
    if (errors.proof) setErrors({ ...errors, proof: null });
    toast.success("Screenshot cropped and compressed successfully!");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processSelectedFile(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shipping_name.trim()) newErrors.shipping_name = "Please enter your full name";
    if (!formData.shipping_phone.trim()) newErrors.shipping_phone = "Phone number is required";
    if (!formData.shipping_address.trim()) newErrors.shipping_address = "Please enter shipping address";
    if (!formData.shipping_city.trim()) newErrors.shipping_city = "City is required";
    if (!formData.shipping_state.trim()) newErrors.shipping_state = "State is required";
    if (!formData.shipping_pincode.trim()) newErrors.shipping_pincode = "PIN code is required";
    if (!proofFile) newErrors.proof = "Payment screenshot is required to complete purchase.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      toast.error(newErrors[firstKey]);
      
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Structure the order data exactly as the backend expects
      const orderItems = displayItems.map(item => ({
        product_id: item.product,
        selected_color: item.selected_color || '',
        quantity: item.quantity,
        price: item.product_details.discount_price || item.product_details.price
      }));

      const payload = new FormData();
      payload.append('full_name', formData.shipping_name);
      payload.append('email', customer?.email || '');
      payload.append('phone', formData.shipping_phone);
      payload.append('address', formData.shipping_address);
      payload.append('city', formData.shipping_city);
      payload.append('state', formData.shipping_state);
      payload.append('pincode', formData.shipping_pincode);
      payload.append('total_amount', totalAmount);
      payload.append('items', JSON.stringify(orderItems));
      
      if (selectedApp) {
        payload.append('payment_app_id', selectedApp.id);
      }
      
      // Match the exact backend model image name: 'screenshot'
      payload.append('screenshot', proofFile);

      const headers = getAuthHeaders();
      headers['Content-Type'] = 'multipart/form-data';

      await axios.post('/api/orders/', payload, { headers });
      
      // Auto-save address for future checkouts if not already saved
      try {
        const savedRes = await axios.get('/api/addresses/', { headers: getAuthHeaders() });
        const existingAddresses = savedRes.data || [];
        const alreadySaved = existingAddresses.some(a => 
          a.address?.trim().toLowerCase() === formData.shipping_address?.trim().toLowerCase() &&
          a.city?.toLowerCase() === formData.shipping_city?.toLowerCase()
        );
        if (!alreadySaved) {
          await axios.post('/api/addresses/', {
            full_name: formData.shipping_name,
            phone: formData.shipping_phone,
            address: formData.shipping_address,
            city: formData.shipping_city,
            state: formData.shipping_state,
            pincode: formData.shipping_pincode,
            is_default: existingAddresses.length === 0,
          }, { headers: getAuthHeaders() });
        }
      } catch (addrErr) {
        // Non-critical: don't fail the order if address save fails
        console.warn('Address auto-save failed:', addrErr);
      }
      
      toast.success("Order placed successfully! We'll review your payment shortly.");
      if (!instantItem) {
        clearCart();
      }
      navigate('/orders');
      
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to place order. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = instantItem 
    ? (instantItem.product_details.discount_price || instantItem.product_details.price) * instantItem.quantity
    : getCartTotal();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white" style={{ background: '#050508' }}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Shopping
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: Forms */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* 1. Shipping Details */}
            <div className="p-6 sm:p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                <MapPin className="text-violet-400" /> Shipping Details
              </h2>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div id="field-shipping_name">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" name="shipping_name" value={formData.shipping_name} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_name ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors`} />
                    {errors.shipping_name && <p className="text-red-400 text-xs mt-1">{errors.shipping_name}</p>}
                  </div>
                  <div id="field-shipping_phone">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Phone Number</label>
                    <input type="text" name="shipping_phone" value={formData.shipping_phone} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_phone ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors`} />
                    {errors.shipping_phone && <p className="text-red-400 text-xs mt-1">{errors.shipping_phone}</p>}
                  </div>
                </div>

                <div id="field-shipping_address">
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Full Address</label>
                  <textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} rows="3"
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_address ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors resize-none`} />
                  {errors.shipping_address && <p className="text-red-400 text-xs mt-1">{errors.shipping_address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div id="field-shipping_city">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">City</label>
                    <input type="text" name="shipping_city" value={formData.shipping_city} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_city ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors`} />
                    {errors.shipping_city && <p className="text-red-400 text-xs mt-1">{errors.shipping_city}</p>}
                  </div>
                  <div id="field-shipping_state">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">State</label>
                    <input type="text" name="shipping_state" value={formData.shipping_state} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_state ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors`} />
                    {errors.shipping_state && <p className="text-red-400 text-xs mt-1">{errors.shipping_state}</p>}
                  </div>
                  <div id="field-shipping_pincode">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Pincode</label>
                    <input type="text" name="shipping_pincode" value={formData.shipping_pincode} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.shipping_pincode ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} text-white outline-none focus:border-violet-500 transition-colors`} />
                    {errors.shipping_pincode && <p className="text-red-400 text-xs mt-1">{errors.shipping_pincode}</p>}
                  </div>
                </div>
              </form>
            </div>

            {/* 2. Payment Method */}
            <div className="p-6 sm:p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                <Landmark className="text-violet-400" /> Payment Options
              </h2>

              {/* Dynamic UPI Payment Apps */}
              {upiApps.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-4 font-semibold">Pay via UPI App</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {upiApps.map(app => {
                      const isSelected = selectedApp?.id === app.id;
                      const upiUrl = `upi://pay?pa=${app.upi_id}&pn=${app.merchant_name}&am=${totalAmount}&cu=INR`;
                      
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setSelectedMethod(null);
                            // Only trigger the deep link if we are likely on a mobile device
                            if (window.innerWidth < 768) {
                              window.location.href = upiUrl;
                            }
                          }}
                          className="relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300"
                          style={{
                            background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isSelected ? '#7C3AED' : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: isSelected ? '0 0 20px rgba(124,58,237,0.2)' : 'none'
                          }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <Smartphone size={20} className={isSelected ? 'text-violet-400' : 'text-white/60'} />
                          </div>
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>{app.display_name}</span>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Desktop fallback / instruction when UPI app is clicked */}
                  {selectedApp && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
                      <div className="p-4 rounded-xl flex justify-between items-center" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">UPI ID for {selectedApp.display_name}</p>
                          <p className="font-mono font-medium text-white">{selectedApp.upi_id}</p>
                        </div>
                        <button type="button" onClick={() => handleCopy(selectedApp.upi_id, 'UPI ID')} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          {copiedField === 'UPI ID' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-white/60" />}
                        </button>
                      </div>
                      {selectedApp.instructions && (
                        <p className="text-xs text-white/40 mt-3 flex gap-2"><MessageCircle size={14} className="text-violet-400" /> {selectedApp.instructions}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Fallback Manual Methods */}
              {paymentMethods.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">OR SCAN QR / BANK TRANSFER</p>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethod(method);
                          setSelectedApp(null);
                        }}
                        className="px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300"
                        style={{
                          background: selectedMethod?.id === method.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${selectedMethod?.id === method.id ? '#7C3AED' : 'rgba(255,255,255,0.1)'}`,
                          color: selectedMethod?.id === method.id ? '#fff' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>

                  {selectedMethod && (
                    <motion.div
                      key={selectedMethod.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Premium Glassmorphic Payment Container */}
                      <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          
                          {/* QR Code Section */}
                          {selectedMethod.qr_code && (
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center relative group overflow-hidden border-2 border-violet-500/20">
                                <img src={selectedMethod.qr_code} alt="QR Scanner" className="w-full h-full object-contain" />
                              </div>
                              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-2.5 flex items-center gap-1.5">
                                <QrCode size={10} className="text-violet-400" /> Scan QR to Pay
                              </span>
                            </div>
                          )}

                          {/* Bank & UPI Credentials Info */}
                          <div className="flex-1 space-y-4 w-full">
                            {selectedMethod.upi_id && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center">
                                <div>
                                  <span className="block text-[10px] uppercase font-bold tracking-wider text-violet-400">UPI ID</span>
                                  <span className="text-sm font-mono text-white font-medium">{selectedMethod.upi_id}</span>
                                </div>
                                <button type="button" onClick={() => handleCopy(selectedMethod.upi_id, 'UPI ID')}
                                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all">
                                  {copiedField === 'UPI ID' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                </button>
                              </div>
                            )}

                            {selectedMethod.bank_name && (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                <span className="block text-[10px] uppercase font-bold tracking-wider text-violet-400 mb-1 flex items-center gap-2"><Landmark size={12} /> Bank Transfer details</span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                                  <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                                    <div>
                                      <span className="block text-[9px] text-white/40 uppercase">Bank Name</span>
                                      <span className="text-white font-semibold">{selectedMethod.bank_name}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                                    <div>
                                      <span className="block text-[9px] text-white/40 uppercase">Holder Name</span>
                                      <span className="text-white font-semibold">{selectedMethod.account_holder_name}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg col-span-1 sm:col-span-2">
                                    <div>
                                      <span className="block text-[9px] text-white/40 uppercase">Account Number</span>
                                      <span className="text-white font-semibold">{selectedMethod.account_number}</span>
                                    </div>
                                    <button type="button" onClick={() => handleCopy(selectedMethod.account_number, 'Account Number')}
                                      className="w-7 h-7 rounded hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all ml-2">
                                      {copiedField === 'Account Number' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                  <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg col-span-1 sm:col-span-2">
                                    <div>
                                      <span className="block text-[9px] text-white/40 uppercase">IFSC Code</span>
                                      <span className="text-white font-semibold">{selectedMethod.ifsc_code}</span>
                                    </div>
                                    <button type="button" onClick={() => handleCopy(selectedMethod.ifsc_code, 'IFSC Code')}
                                      className="w-7 h-7 rounded hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all ml-2">
                                      {copiedField === 'IFSC Code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedMethod.instructions && (
                          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-white/70 leading-relaxed flex gap-2">
                            <MessageCircle size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                            <span>{selectedMethod.instructions}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}


              <div className="mt-8" id="field-proof">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-3">Upload Payment Screenshot</h3>
                <p className="text-xs text-white/50 mb-4">Drag and drop or select your cropped payment receipt screenshot below to complete validation.</p>
                
                <motion.div 
                  animate={errors.proof ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="cursor-pointer block relative group"
                >
                  <div className={`w-full h-44 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${errors.proof ? 'border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-red-500/5' : 'border-2 border-dashed'}`}
                    style={{ 
                      borderColor: errors.proof ? '#EF4444' : isDragging ? '#C084FC' : proofFile ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.3)',
                      background: errors.proof ? 'rgba(239,68,68,0.05)' : isDragging ? 'rgba(168,85,247,0.06)' : proofFile ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                      transform: isDragging ? 'scale(1.01)' : 'scale(1)'
                    }}
                  >
                    {proofPreview ? (
                      <div className="absolute inset-0 w-full h-full p-2">
                        <img src={proofPreview} alt="Proof" className="w-full h-full object-contain rounded-xl" />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={24} className="text-white mb-1.5" />
                          <span className="text-white text-xs font-semibold uppercase tracking-wider">Drag or click to replace screenshot</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center text-white/40 group-hover:text-violet-400 transition-colors w-full h-full justify-center cursor-pointer">
                        <Upload size={32} className="mb-3" />
                        <span className="text-sm font-medium">Drag & Drop or click to browse image</span>
                        <span className="text-[10px] text-white/30 uppercase mt-1">JPEG, PNG or WEBP (Max 10MB)</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </motion.div>
                {errors.proof && <p className="text-red-400 text-sm mt-3 font-medium">{errors.proof}</p>}
              </div>

              {/* Crop Modal workspace for User Payment Proof */}
              <ImageCropperModal
                isOpen={isCropOpen}
                imageSrc={rawScreenshotSrc}
                rawFile={rawFile}
                aspect={undefined} // Free aspect ratio crop for screenshots
                onCropComplete={handleCropComplete}
                onClose={() => setIsCropOpen(false)}
              />

            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="p-6 sm:p-8 rounded-3xl sticky top-28" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0 relative">
                      <img src={item.product_details?.images?.[0]?.image || ''} alt="" className="w-full h-full object-cover" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product_details?.title}</p>
                      {item.selected_color && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-white/50">{item.selected_color}</span>
                        </div>
                      )}
                      <p className="text-sm font-semibold mt-1 text-violet-300">
                        ₹{(item.product_details?.discount_price || item.product_details?.price) * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-white/10">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-white/10 mb-6">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-serif text-violet-400">₹{totalAmount}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                style={{
                  background: isSubmitting ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
                  boxShadow: isSubmitting ? 'none' : '0 0 30px rgba(124,58,237,0.4)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Complete Purchase <CheckCircle size={18} /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
