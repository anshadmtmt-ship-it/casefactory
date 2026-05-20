import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit3, Image as ImageIcon, Check, Palette, Tag, AlignLeft, Info, Package, Pipette, Wand2, Copy } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import toast from 'react-hot-toast';
import ImageCropper from './ImageCropper';
import { useCategories } from '../Categories/useCategories';

function ColorPickerRow({ colors, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColorHex, setCurrentColorHex] = useState('#ffffff');
  const [currentColorName, setCurrentColorName] = useState('');

  const addColor = () => {
    if (!currentColorName.trim()) return;
    onChange([...colors, { name: currentColorName, hex_code: currentColorHex }]);
    setCurrentColorName('');
    setShowPicker(false);
  };

  const removeColor = (idx) => {
    onChange(colors.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {colors.map((c, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex_code }} />
            <span className="text-white/80">{c.name}</span>
            <button type="button" onClick={() => removeColor(idx)} className="text-white/40 hover:text-red-400">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      
      {showPicker ? (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 w-fit">
          <HexColorPicker color={currentColorHex} onChange={setCurrentColorHex} />
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: currentColorHex }} />
              <input
                type="text"
                value={currentColorHex}
                onChange={(e) => setCurrentColorHex(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white w-24 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Color Name (e.g. Matte Black)"
              value={currentColorName}
              onChange={(e) => setCurrentColorName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            />
            <div className="flex gap-2">
              <button type="button" onClick={addColor} className="flex-1 bg-emerald-500/20 text-emerald-400 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500/30">Add</button>
              <button type="button" onClick={() => setShowPicker(false)} className="flex-1 bg-white/5 text-white/50 py-1.5 rounded-lg text-xs hover:bg-white/10">Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white/80 text-sm hover:bg-white/5 transition-all w-full justify-center">
          <Palette size={14} /> Add Color
        </button>
      )}
    </div>
  );
}

function ProductForm({ initialData, onSubmit, onCancel, categoriesHook }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    discount_price: initialData?.discount_price || '',
    stock: initialData?.stock || 10,
    is_hot: initialData?.is_hot || false,
    is_new: initialData?.is_new || false,
    is_limited: initialData?.is_limited || false,
    is_sold_out: initialData?.is_sold_out || false,
    is_booking_enabled: initialData?.is_booking_enabled || false,
    theme_color: initialData?.theme_color || '#7B2EFF',
    category_slug: initialData?.category_slug || '',
    short_description: initialData?.short_description || '',
    full_description: initialData?.full_description || '',
    features: initialData?.features || '',
    material: initialData?.material || '',
    compatibility: initialData?.compatibility || '',
  });

  const [colors, setColors] = useState(initialData?.colors || []);
  
  // Image states
  const [mainImage, setMainImage] = useState(null); // File
  const [mainImagePreview, setMainImagePreview] = useState(
    initialData?.images?.find(img => img.is_main)?.image || null
  );

  const [relatedImages, setRelatedImages] = useState([null, null, null]); // Array of Files
  const [relatedImagePreviews, setRelatedImagePreviews] = useState([
    initialData?.images?.filter(img => !img.is_main)[0]?.image || null,
    initialData?.images?.filter(img => !img.is_main)[1]?.image || null,
    initialData?.images?.filter(img => !img.is_main)[2]?.image || null,
  ]);

  // Crop states
  const [cropTarget, setCropTarget] = useState(null); // { type: 'main' | 'related', index?: number, src: string }
  const fileInputRef = useRef(null);
  const currentUploadTarget = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updates = { [name]: type === 'checkbox' ? checked : value };
      
      // Mutually exclusive badges
      if (type === 'checkbox' && checked) {
        if (name === 'is_new') {
          updates.is_limited = false;
          updates.is_sold_out = false;
        } else if (name === 'is_limited') {
          updates.is_new = false;
          updates.is_sold_out = false;
        } else if (name === 'is_sold_out') {
          updates.is_new = false;
          updates.is_limited = false;
        }
      }
      
      return { ...prev, ...updates };
    });
  };

  const triggerUpload = (type, index = null) => {
    currentUploadTarget.current = { type, index };
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropTarget({ ...currentUploadTarget.current, src: ev.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const handleCropComplete = (file, previewUrl) => {
    const { type, index } = cropTarget;
    if (type === 'main') {
      setMainImage(file);
      setMainImagePreview(previewUrl);
    } else if (type === 'related' && index !== null) {
      const newFiles = [...relatedImages];
      newFiles[index] = file;
      setRelatedImages(newFiles);

      const newPreviews = [...relatedImagePreviews];
      newPreviews[index] = previewUrl;
      setRelatedImagePreviews(newPreviews);
    }
    setCropTarget(null);
  };

  const handleEyedropper = async () => {
    if (!window.EyeDropper) {
      toast.error("Your browser does not support the EyeDropper API");
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setFormData(prev => ({ ...prev, theme_color: result.sRGBHex }));
    } catch (e) {
      // User canceled
    }
  };

  const handleAutoExtract = () => {
    if (!mainImagePreview) {
      toast.error("Please upload a main image first to auto-detect color.");
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r=0, g=0, b=0, count=0;
        for (let i = 0; i < data.length; i += 4 * 10) { 
          if (data[i+3] > 128) { // Skip transparent pixels
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.floor(r/count);
          g = Math.floor(g/count);
          b = Math.floor(b/count);
          const hex = "#" + [r,g,b].map(x => x.toString(16).padStart(2, '0')).join('');
          setFormData(prev => ({ ...prev, theme_color: hex }));
        }
      } catch(e) {
        toast.error("Could not extract color. Cross-origin restriction or tainted canvas.");
      }
    };
    img.src = mainImagePreview;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append standard fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    // Append colors as JSON string
    data.append('colors', JSON.stringify(colors));
    
    // Append images
    if (mainImage) {
      data.append('main_image', mainImage);
    }
    relatedImages.forEach((file, idx) => {
      if (file) {
        data.append(`related_image_${idx}`, file);
      }
    });

    onSubmit(data);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {cropTarget && (
        <ImageCropper 
          imageSrc={cropTarget.src} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropTarget(null)} 
        />
      )}
      
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-serif">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Save Product</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Media & Colors */}
        <div className="space-y-8">
          
          {/* Images Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50 mb-4"><ImageIcon size={16} /> Media (9:16 Aspect)</h3>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            
            <div className="mb-6">
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Main Product Image</label>
              <button 
                type="button" 
                onClick={() => triggerUpload('main')}
                className="w-full aspect-[9/16] rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors flex flex-col items-center justify-center relative overflow-hidden group"
              >
                {mainImagePreview ? (
                  <>
                    <img src={mainImagePreview} alt="Main" className="absolute inset-0 w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-sm font-medium">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white/30 flex flex-col items-center">
                    <Plus size={24} className="mb-2" />
                    <span className="text-xs uppercase tracking-widest">Upload Main</span>
                  </div>
                )}
              </button>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Related Images (Up to 3)</label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => (
                  <button 
                    key={idx}
                    type="button" 
                    onClick={() => triggerUpload('related', idx)}
                    className="w-full aspect-[9/16] rounded-lg border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors flex flex-col items-center justify-center relative overflow-hidden group"
                  >
                    {relatedImagePreviews[idx] ? (
                      <>
                        <img src={relatedImagePreviews[idx]} alt={`Related ${idx}`} className="absolute inset-0 w-full h-full object-contain p-1" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Edit3 size={14} />
                        </div>
                      </>
                    ) : (
                      <Plus size={16} className="text-white/20" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Theme Color Picker Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">
              <span className="flex items-center gap-2"><Pipette size={16} /> Theme Color</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div 
                  className="w-12 h-12 rounded-lg border border-white/20 shadow-lg" 
                  style={{ backgroundColor: formData.theme_color, boxShadow: `0 4px 20px ${formData.theme_color}40` }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      name="theme_color"
                      value={formData.theme_color} 
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-white/20 focus:border-white/60 text-white font-mono text-sm w-24 outline-none pb-0.5 transition-colors"
                    />
                    <button type="button" onClick={() => navigator.clipboard.writeText(formData.theme_color)} className="text-white/40 hover:text-white transition-colors" title="Copy HEX">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Product Accent Color</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleEyedropper} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all group">
                  <Pipette size={14} className="group-hover:text-emerald-400 transition-colors" /> Pick From Image
                </button>
                <button type="button" onClick={handleAutoExtract} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all group">
                  <Wand2 size={14} className="group-hover:text-purple-400 transition-colors" /> Auto Detect
                </button>
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50 mb-4"><Palette size={16} /> Colors</h3>
            <ColorPickerRow colors={colors} onChange={setColors} />
          </section>

        </div>

        {/* RIGHT COLUMN: Product Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 grid grid-cols-2 gap-5">
            <h3 className="col-span-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50 mb-1"><Info size={16} /> Basic Info</h3>
            
            <div className="col-span-2">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Product Title *</label>
              <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20" placeholder="e.g. Midnight Armor Case" />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Price (₹) *</label>
              <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" placeholder="999.00" />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Discount Price (₹)</label>
              <input type="number" step="0.01" min="0" name="discount_price" value={formData.discount_price} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" placeholder="749.00 (Optional)" />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Category</label>
              <select name="category_slug" value={formData.category_slug} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 [&>option]:bg-[#111]">
                <option value="">Select Category...</option>
                {categoriesHook.activeCategories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Stock Count *</label>
              <input required type="number" min="0" step="1" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>

            <div className="col-span-2 mt-4 space-y-4">
              <label className="block text-xs text-white/40 uppercase tracking-wider">Product Status & Badges</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <input type="checkbox" name="is_booking_enabled" checked={formData.is_booking_enabled} onChange={handleInputChange} className="w-4 h-4 rounded accent-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-400">ENABLE BOOKING</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <input type="checkbox" name="is_hot" checked={formData.is_hot} onChange={handleInputChange} className="w-4 h-4 rounded accent-rose-500" />
                  <span className="text-sm font-semibold text-rose-500">HOT PICK</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleInputChange} className="w-4 h-4 rounded accent-blue-500" />
                  <span className="text-sm font-semibold text-blue-400">NEW</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <input type="checkbox" name="is_limited" checked={formData.is_limited} onChange={handleInputChange} className="w-4 h-4 rounded accent-purple-500" />
                  <span className="text-sm font-semibold text-purple-400">LIMITED</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <input type="checkbox" name="is_sold_out" checked={formData.is_sold_out} onChange={handleInputChange} className="w-4 h-4 rounded accent-gray-500" />
                  <span className="text-sm font-semibold text-gray-400">SOLD OUT</span>
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50 mb-1"><AlignLeft size={16} /> Rich Details</h3>
            
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Short Description (Cards)</label>
              <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Full Description (Product Page)</label>
              <textarea name="full_description" value={formData.full_description} onChange={handleInputChange} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Features (One per line)</label>
              <textarea name="features" value={formData.features} onChange={handleInputChange} rows={3} placeholder="Military Grade Drop Protection&#10;MagSafe Compatible&#10;Scratch Resistant" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Material</label>
                <input name="material" value={formData.material} onChange={handleInputChange} placeholder="e.g. Aramid Fiber" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Compatibility</label>
                <input name="compatibility" value={formData.compatibility} onChange={handleInputChange} placeholder="e.g. iPhone 16 Pro Max" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" />
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

export default function ProductsAdminPanel({ isOpen, onClose, hook }) {
  const { allSorted, addProduct, updateProduct, deleteProduct } = hook;
  const categoriesHook = useCategories();
  const [editingProduct, setEditingProduct] = useState(null); // 'new' | product_obj | null
  const [deletingSlug, setDeletingSlug] = useState(null);

  const handleSave = async (formData) => {
    try {
      if (editingProduct === 'new') {
        await addProduct(formData);
        toast.success("Product created successfully!");
      } else {
        await updateProduct(editingProduct.slug, formData);
        toast.success("Product updated successfully!");
      }
      setEditingProduct(null);
    } catch (e) {
      toast.error("Failed to save product: " + e.message);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.image) return img.image; // from django
    if (typeof img === 'string') return img;
    return '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="products-admin-drawer"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto"
        >
          {editingProduct ? (
            <ProductForm 
              initialData={editingProduct === 'new' ? null : editingProduct} 
              onSubmit={handleSave} 
              onCancel={() => setEditingProduct(null)} 
              categoriesHook={categoriesHook}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-serif text-white mb-2">Product Management</h2>
                  <p className="text-white/40">Manage your store's inventory, pricing, and media.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setEditingProduct('new')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-400 transition-colors">
                    <Plus size={18} /> Add Product
                  </button>
                  <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSorted.map(product => {
                  const mainImg = product.images?.find(i => i.is_main);
                  return (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex">
                      <div className="w-1/3 aspect-[9/16] bg-black/50 relative border-r border-white/10 p-2 flex items-center justify-center">
                        {mainImg ? (
                          <img src={getImageUrl(mainImg)} alt={product.title} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon size={24} className="text-white/20" />
                        )}
                      </div>
                      <div className="w-2/3 p-5 flex flex-col">
                        <h4 className="text-white font-semibold mb-1 line-clamp-1">{product.title}</h4>
                        <p className="text-white/40 text-xs mb-3">{product.category_slug}</p>
                        
                        <div className="flex items-center gap-2 mb-auto">
                          <span className="text-sm font-semibold text-white">₹{product.price}</span>
                          {product.badge_text && <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] uppercase font-bold text-white/60 tracking-wider">{product.badge_text}</span>}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                          {deletingSlug === product.slug ? (
                            <div className="flex flex-1 items-center gap-2">
                              <span className="text-xs text-white/50 flex-1">Are you sure?</span>
                              <button onClick={async () => {
                                try {
                                  await deleteProduct(product.slug);
                                  toast.success("Product deleted");
                                } catch(e) {
                                  toast.error("Failed to delete: " + e.message);
                                } finally {
                                  setDeletingSlug(null);
                                }
                              }} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors">Yes</button>
                              <button onClick={() => setDeletingSlug(null)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/20 transition-colors">No</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => setEditingProduct(product)} className="flex-1 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/20 transition-colors">Edit</button>
                              <button onClick={() => setDeletingSlug(product.slug)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allSorted.length === 0 && (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                    <Package size={48} className="mx-auto text-white/20 mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No products yet</h3>
                    <p className="text-white/40">Click "Add Product" to create your first item.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
