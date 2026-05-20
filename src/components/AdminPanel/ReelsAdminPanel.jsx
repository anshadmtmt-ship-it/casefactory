import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, Upload,
  Film, Image, GripVertical, Clapperboard,
} from 'lucide-react';

/* ─── Media thumbnail cell ────────────────────────────────────────────────── */
function MediaCell({ reel, onVideoChange, onThumbnailChange }) {
  const videoRef = useRef(null);
  const thumbRef = useRef(null);

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onVideoChange(file);
  };

  const handleThumb = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onThumbnailChange(file);
  };

  const videoPreview = reel.video;
  const thumbPreview = reel.thumbnail;

  return (
    <div className="flex gap-2 flex-shrink-0">
      {/* Video preview */}
      <div className="flex flex-col gap-1 items-center">
        <span className="text-[8px] text-white/30 uppercase tracking-widest">Video</span>
        <button
          onClick={() => videoRef.current?.click()}
          title="Upload Video (mp4, webm)"
          className="relative w-12 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 group/mc hover:border-white/30 transition-colors flex-shrink-0"
        >
          {videoPreview ? (
            <video src={videoPreview} className="w-full h-full object-cover" muted />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film size={14} className="text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/mc:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={14} className="text-white" />
          </div>
          <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideo} className="hidden" />
        </button>
      </div>

      {/* Thumbnail preview */}
      <div className="flex flex-col gap-1 items-center">
        <span className="text-[8px] text-white/30 uppercase tracking-widest">Thumb</span>
        <button
          onClick={() => thumbRef.current?.click()}
          title="Upload Thumbnail (optional)"
          className="relative w-12 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 group/mc hover:border-white/30 transition-colors flex-shrink-0"
        >
          {thumbPreview ? (
            <img src={thumbPreview} alt="thumb" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image size={14} className="text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/mc:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={14} className="text-white" />
          </div>
          <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
        </button>
      </div>
    </div>
  );
}

/* ─── Single reel admin row ───────────────────────────────────────────────── */
function AdminReelRow({ reel, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown, onToggleActive }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleVideoChange = (file) => {
    const fd = new FormData();
    fd.append('video', file);
    onUpdate(reel.id, fd);
  };

  const handleThumbChange = (file) => {
    const fd = new FormData();
    fd.append('thumbnail', file);
    onUpdate(reel.id, fd);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
        reel.is_active
          ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
          : 'bg-white/[0.02] border-white/5 opacity-55'
      }`}
    >
      <GripVertical size={16} className="text-white/15 flex-shrink-0" />

      {/* Media cell */}
      <MediaCell
        reel={reel}
        onVideoChange={handleVideoChange}
        onThumbnailChange={handleThumbChange}
      />

      <div className="flex-1 min-w-0" />

      {/* Order badge */}
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-white/40">{reel.display_order}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0 ml-2 border-l border-white/5 pl-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleActive(reel.id)}
            title={reel.is_active ? 'Disable' : 'Enable'}
            className={`p-2 rounded-lg transition-colors ${reel.is_active ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-white/25 hover:bg-white/10'}`}
          >
            {reel.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => onMoveUp(reel.id)} disabled={isFirst}
            className="p-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/10 disabled:opacity-15 disabled:cursor-not-allowed transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMoveDown(reel.id)} disabled={isLast}
            className="p-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/10 disabled:opacity-15 disabled:cursor-not-allowed transition-colors">
            <ChevronDown size={14} />
          </button>
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => onDelete(reel.id)} className="flex-1 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
              Confirm Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="py-1 px-2 text-xs text-white/40 hover:text-white/70 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="mt-1 flex items-center justify-center gap-1 py-1 w-full rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-colors text-xs">
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Add Reel Form ─────────────────────────────────────────────────────────── */
function AddReelForm({ onAdd, onCancel }) {
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoFile) return;

    const fd = new FormData();
    fd.append('video', videoFile);
    fd.append('is_active', 'true');
    onAdd(fd);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/15 rounded-2xl p-5 flex flex-col gap-4"
    >
      <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Upload New Reel</p>

      {/* Video */}
      <div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => videoRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 text-xs hover:bg-white/10 hover:border-white/40 transition-colors">
            <Upload size={14} /> Choose Video
          </button>
          {videoFile && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80">{videoFile.name}</span>
            </div>
          )}
          <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setVideoFile(e.target.files?.[0])} className="hidden" />
        </div>
        <p className="text-[10px] text-white/30 italic mt-2">
          Only MP4, WEBM, and MOV are supported. Optimal aspect ratio: 9:16.
        </p>
      </div>

      <div className="flex gap-2 mt-2 border-t border-white/10 pt-4">
        <button type="submit" disabled={!videoFile}
          className="flex-1 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={14} /> Upload Reel
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/10 transition-colors">
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

/* ─── Main Reels Admin Panel ────────────────────────────────────────────────── */
export default function ReelsAdminPanel({ isOpen, onClose, hook }) {
  const { allReelsSorted, addReel, updateReel, deleteReel, toggleActive, moveReelUp, moveReelDown } = hook;
  const [showAddForm, setShowAddForm] = useState(false);

  const activeCount = allReelsSorted.filter((r) => r.is_active).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="reels-admin-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            key="reels-admin-panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-lg flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0e0e0e 0%, #0a0a0a 100%)',
              boxShadow: '-20px 0 80px rgba(0,0,0,0.8)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                  <Clapperboard size={18} className="text-white/60" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base tracking-tight">Reels Manager</h2>
                  <p className="text-white/30 text-xs mt-0.5">Find Your Fit Cinematic Viewer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-white/40">{activeCount} / {allReelsSorted.length} active</span>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full border border-white/12 flex items-center justify-center text-white/40 hover:text-white hover:border-white/35 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

              {/* Add form / button */}
              <AnimatePresence mode="wait">
                {showAddForm ? (
                  <AddReelForm
                    key="form"
                    onAdd={(data) => { addReel(data); setShowAddForm(false); }}
                    onCancel={() => setShowAddForm(false)}
                  />
                ) : (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 hover:bg-white/5 transition-all text-sm font-semibold"
                  >
                    <Plus size={16} /> Upload New Cinematic Reel
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Rows */}
              <div className="flex flex-col gap-3 mt-2">
                <AnimatePresence>
                  {allReelsSorted.map((reel, idx) => (
                    <AdminReelRow
                      key={reel.id}
                      reel={reel}
                      isFirst={idx === 0}
                      isLast={idx === allReelsSorted.length - 1}
                      onUpdate={updateReel}
                      onDelete={deleteReel}
                      onMoveUp={moveReelUp}
                      onMoveDown={moveReelDown}
                      onToggleActive={toggleActive}
                    />
                  ))}
                </AnimatePresence>

                {allReelsSorted.length === 0 && !showAddForm && (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Clapperboard size={32} className="mx-auto text-white/10 mb-3" />
                    <p className="text-white/30 text-sm font-medium">No reels uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/6 bg-black/40">
              <p className="text-[10px] text-white/20 text-center tracking-widest uppercase">
                Videos autoplay without UI overlays for a clean aesthetic.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
