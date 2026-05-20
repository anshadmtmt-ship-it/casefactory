import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Upload,
  Edit3,
  Check,
  Link,
  GripVertical,
  LayoutGrid,
} from 'lucide-react';

/* ─── Inline editable field ──────────────────────────────────────────────── */
function InlineEdit({ value, onSave, placeholder = 'Enter value...', className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onSave(draft.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 flex-1">
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={`flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/50 ${className}`}
          placeholder={placeholder}
        />
        <button onClick={commit} className="text-emerald-400 hover:text-emerald-300 p-1 rounded">
          <Check size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`flex items-center gap-1.5 text-left flex-1 group/edit rounded-lg px-2 py-1 hover:bg-white/10 transition-colors ${className}`}
    >
      <span className="text-sm text-white/90 truncate flex-1">{value || <span className="text-white/40 italic">{placeholder}</span>}</span>
      <Edit3 size={12} className="text-white/30 group-hover/edit:text-white/70 flex-shrink-0 transition-colors" />
    </button>
  );
}

/* ─── Image upload cell ───────────────────────────────────────────────────── */
function ImageCell({ image, onImageChange }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImageChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <button
      onClick={() => fileRef.current?.click()}
      title="Click to change image"
      className="relative w-12 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 group/img hover:border-white/30 transition-colors"
    >
      {image ? (
        <img src={image} alt="" className="w-full h-full object-contain p-1" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/30">
          <Upload size={14} />
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
        <Upload size={14} className="text-white" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </button>
  );
}

/* ─── Single model row ───────────────────────────────────────────────────── */
function AdminModelRow({ model, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) {
  const [showLinkEdit, setShowLinkEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
        model.visible
          ? 'bg-white/5 border-white/10 hover:bg-white/8'
          : 'bg-white/2 border-white/5 opacity-60'
      }`}
    >
      {/* Drag handle (visual only) */}
      <GripVertical size={16} className="text-white/20 flex-shrink-0 cursor-grab" />

      {/* Image */}
      <ImageCell
        image={model.image}
        onImageChange={(img) => onUpdate(model.id, { image: img })}
      />

      {/* Name + Link */}
      <div className="flex-1 min-w-0">
        <InlineEdit
          value={model.name}
          onSave={(v) => onUpdate(model.id, { name: v })}
          placeholder="Model name..."
        />
        <div className="flex items-center gap-1 px-2 mt-0.5">
          <Link size={10} className="text-white/30 flex-shrink-0" />
          {showLinkEdit ? (
            <input
              autoFocus
              defaultValue={model.link}
              onBlur={(e) => { onUpdate(model.id, { link: e.target.value }); setShowLinkEdit(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { onUpdate(model.id, { link: e.target.value }); setShowLinkEdit(false); } }}
              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-white/80 text-[11px] focus:outline-none focus:border-white/40"
            />
          ) : (
            <button
              onClick={() => setShowLinkEdit(true)}
              className="text-[11px] text-white/30 hover:text-white/60 truncate max-w-[140px] transition-colors text-left"
              title={model.link}
            >
              {model.link || 'Add link...'}
            </button>
          )}
        </div>
      </div>

      {/* Order # badge */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-white/50">{model.order}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Visibility */}
        <button
          onClick={() => onToggleVisibility(model.id)}
          title={model.visible ? 'Hide from store' : 'Show in store'}
          className={`p-1.5 rounded-lg transition-colors ${
            model.visible ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-white/30 hover:bg-white/10'
          }`}
        >
          {model.visible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>

        {/* Move up */}
        <button
          onClick={() => onMoveUp(model.id)}
          disabled={isFirst}
          title="Move up"
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronUp size={15} />
        </button>

        {/* Move down */}
        <button
          onClick={() => onMoveDown(model.id)}
          disabled={isLast}
          title="Move down"
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronDown size={15} />
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(model.id)}
              className="px-2 py-1 text-[11px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 text-[11px] text-white/50 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete model"
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Add Model Form ────────────────────────────────────────────────────── */
function AddModelForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), link: link.trim() || '#', image });
    setName(''); setLink(''); setImage('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/15 rounded-2xl p-4 flex flex-col gap-3"
    >
      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">New Model</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Name */}
        <div className="col-span-2">
          <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Model Name *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. iPhone 18 Pro Max"
            required
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/50 placeholder:text-white/25"
          />
        </div>

        {/* Link */}
        <div className="col-span-2">
          <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Collection Link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/collections/iphone-18-pro-max"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/50 placeholder:text-white/25"
          />
        </div>

        {/* Image */}
        <div className="col-span-2">
          <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Image</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setImageMode('url')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${imageMode === 'url' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'}`}>
              URL
            </button>
            <button type="button" onClick={() => setImageMode('upload')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${imageMode === 'upload' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'}`}>
              Upload
            </button>
          </div>

          {imageMode === 'url' ? (
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/50 placeholder:text-white/25"
            />
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 hover:border-white/40 transition-colors"
              >
                <Upload size={14} /> Choose File
              </button>
              {image && <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/20"><img src={image} alt="" className="w-full h-full object-contain" /></div>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={15} /> Add Model
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors border border-white/10"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

/* ─── Main Admin Panel ───────────────────────────────────────────────────── */
export default function AdminPanel({ isOpen, onClose, hook }) {
  const { allModelsSorted, addModel, updateModel, deleteModel, moveModelUp, moveModelDown, toggleVisibility } = hook;
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (data) => {
    addModel(data);
    setShowAddForm(false);
  };

  const visibleCount = allModelsSorted.filter((m) => m.visible).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="admin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-[520px] flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #111111 0%, #0d0d0d 100%)',
              boxShadow: '-20px 0 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <LayoutGrid size={16} className="text-white/70" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base tracking-tight">Shop by Model</h2>
                  <p className="text-white/35 text-[11px] tracking-wide mt-0.5">Admin Panel</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Stats badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-white/50">{visibleCount} / {allModelsSorted.length} visible</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

              {/* Add Form or Add Button */}
              <AnimatePresence mode="wait">
                {showAddForm ? (
                  <AddModelForm
                    key="add-form"
                    onAdd={handleAdd}
                    onCancel={() => setShowAddForm(false)}
                  />
                ) : (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl border border-dashed border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add New Phone Model
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Column Headers */}
              {allModelsSorted.length > 0 && (
                <div className="flex items-center gap-3 px-3">
                  <div className="w-4" />
                  <div className="w-12 text-[10px] text-white/25 uppercase tracking-widest">Image</div>
                  <div className="flex-1 text-[10px] text-white/25 uppercase tracking-widest">Name / Link</div>
                  <div className="w-7 text-[10px] text-white/25 uppercase tracking-widest text-center">#</div>
                  <div className="text-[10px] text-white/25 uppercase tracking-widest">Actions</div>
                </div>
              )}

              {/* Model Rows */}
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {allModelsSorted.map((model, idx) => (
                    <AdminModelRow
                      key={model.id}
                      model={model}
                      isFirst={idx === 0}
                      isLast={idx === allModelsSorted.length - 1}
                      onUpdate={updateModel}
                      onDelete={deleteModel}
                      onMoveUp={moveModelUp}
                      onMoveDown={moveModelDown}
                      onToggleVisibility={toggleVisibility}
                    />
                  ))}
                </AnimatePresence>

                {allModelsSorted.length === 0 && !showAddForm && (
                  <div className="text-center py-16 text-white/25 text-sm">
                    No phone models yet.<br />
                    <span className="text-white/40">Click "Add New Phone Model" to get started.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/8">
              <p className="text-[10px] text-white/20 text-center tracking-widest uppercase">
                Changes save automatically
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
