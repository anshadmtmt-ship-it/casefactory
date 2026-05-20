import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Eye, EyeOff, Upload, Plus, Layers, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Image cell ──────────────────────────────────────────────────────────── */
function ImageCell({ image, onImageChange }) {
  const ref = useRef(null);
  return (
    <button onClick={() => ref.current?.click()} title="Change image"
      className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 group/ic"
      style={{ background: image ? undefined : '#1a1a1a' }}>
      {image
        ? <img src={image} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-white/20"><Layers size={16} /></div>
      }
      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/ic:opacity-100 flex items-center justify-center transition-opacity">
        <Upload size={14} className="text-white" />
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0]; if (!f) return;
        onImageChange(f);
      }} className="hidden" />
    </button>
  );
}

/* ─── Single category row ─────────────────────────────────────────────────── */
function CategoryRow({ cat, onUpdate, onToggle, onDelete, onImageSelect }) {
  const handleImageChange = (file) => {
    if (onImageSelect) {
      onImageSelect(cat.slug, file);
    }
  };

  const handleFieldChange = (field, value) => {
    const fd = new FormData();
    fd.append(field, value);
    toast.promise(onUpdate(cat.slug, fd), {
      loading: 'Saving...',
      success: 'Category updated!',
      error: (err) => `Update failed: ${err.message}`
    });
  };

  return (
    <motion.div layout
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
        cat.is_active ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-55'
      }`}
    >
      <ImageCell image={cat.image} onImageChange={handleImageChange} />

      <div className="flex-1 min-w-0 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Display Name</label>
            <input 
              defaultValue={cat.name}
              onBlur={(e) => { if (e.target.value !== cat.name) handleFieldChange('name', e.target.value) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Slug (URL)</label>
            <input 
              defaultValue={cat.slug}
              onBlur={(e) => { if (e.target.value !== cat.slug && e.target.value) handleFieldChange('slug', e.target.value) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/50"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Description</label>
          <input 
            defaultValue={cat.description || cat.subtitle || ''}
            onBlur={(e) => { if (e.target.value !== (cat.description || cat.subtitle)) handleFieldChange('description', e.target.value) }}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
             <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Theme Color</label>
             <div className="flex items-center gap-2">
               <input type="color" defaultValue={cat.theme_color || '#ffffff'}
                 onBlur={(e) => { if (e.target.value !== cat.theme_color) handleFieldChange('theme_color', e.target.value) }}
                 className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
               <input defaultValue={cat.theme_color || '#ffffff'}
                 onBlur={(e) => { if (e.target.value !== cat.theme_color) handleFieldChange('theme_color', e.target.value) }}
                 className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none" />
             </div>
          </div>
          <div>
             <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Display Order</label>
             <input type="number" defaultValue={cat.display_order}
                onBlur={(e) => { if (e.target.value !== String(cat.display_order)) handleFieldChange('display_order', e.target.value) }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/50" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <button onClick={() => onToggle(cat.slug, cat.is_active)} title={cat.is_active ? 'Hide' : 'Show'}
          className={`p-2 rounded-xl transition-colors border ${cat.is_active ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-white/25 border-white/10 hover:bg-white/10'}`}>
          {cat.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={() => { if(window.confirm('Delete category?')) onDelete(cat.slug); }} title="Delete"
          className="p-2 rounded-xl transition-colors border text-red-400 border-red-400/20 bg-red-400/10 hover:bg-red-400/20">
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main panel ──────────────────────────────────────────────────────────── */
import ImageCropper from './ImageCropper';

export default function CategoriesAdminPanel({ isOpen, onClose, hook }) {
  const { allSorted, updateCategory, toggleActive, addCategory, deleteCategory } = hook;
  const activeCount = allSorted.filter((c) => c.is_active).length;

  const [cropTarget, setCropTarget] = useState(null);

  const handleAddCategory = () => {
    const name = prompt("Enter new category name:");
    if (!name) return;
    const fd = new FormData();
    fd.append('name', name);
    fd.append('slug', name.toLowerCase().replace(/\s+/g, '-'));
    fd.append('display_order', allSorted.length + 1);
    toast.promise(addCategory(fd), {
      loading: 'Creating...',
      success: 'Category created!',
      error: 'Failed to create category'
    });
  };

  const handleImageSelectForCrop = (slug, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropTarget({ slug, src: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (file, previewUrl) => {
    if (!cropTarget) return;
    const fd = new FormData();
    fd.append('image', file);
    toast.promise(updateCategory(cropTarget.slug, fd), {
      loading: 'Uploading cropped image...',
      success: 'Image updated!',
      error: 'Failed to upload image'
    });
    setCropTarget(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="cat-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm" />

          <motion.div key="cat-panel"
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-[500px] flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0e0e0e 0%, #080808 100%)',
              boxShadow: '-20px 0 80px rgba(0,0,0,0.8)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center">
                  <Layers size={15} className="text-white/60" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm tracking-tight">Categories</h2>
                  <p className="text-white/30 text-[10px] mt-0.5">Manage store categories</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/40">{activeCount}/{allSorted.length} active</span>
                </div>
                <button onClick={handleAddCategory} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">
                  <Plus size={12} /> Add
                </button>
                <button onClick={onClose}
                  className="w-7 h-7 rounded-full border border-white/12 flex items-center justify-center text-white/40 hover:text-white hover:border-white/35 transition-all ml-1">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>

              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {allSorted.map((cat) => (
                    <CategoryRow key={cat.slug} cat={cat} onUpdate={updateCategory} onToggle={toggleActive} onDelete={deleteCategory} onImageSelect={handleImageSelectForCrop} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-white/6">
              <p className="text-[9px] text-white/15 text-center tracking-widest uppercase">
                Auto-saves · Dynamic category system
              </p>
            </div>
          </motion.div>
          {cropTarget && (
            <ImageCropper 
              imageSrc={cropTarget.src} 
              aspectRatio={4 / 5}
              onCropComplete={handleCropComplete} 
              onCancel={() => setCropTarget(null)} 
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
