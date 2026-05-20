import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Image as ImageIcon, Sliders, RefreshCw } from 'lucide-react';

// Helper to center the crop area
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropperModal({ isOpen, imageSrc, rawFile, aspect = 1, onCropComplete, onClose }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(aspect);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState('preview');
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset states on image change
    setZoom(1);
    setRotate(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setMode('preview');
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setImgSize({ width, height });
    if (aspectRatio) {
      setCrop(centerAspectCrop(width, height, aspectRatio));
    } else {
      setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
    }
  }

  const handleZoomChange = (val) => {
    setZoom(Math.max(1, Math.min(3, val)));
  };

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleOriginal = () => {
    if (rawFile && imageSrc) {
      onCropComplete(rawFile, imageSrc);
    } else {
      setMode('crop');
    }
  };

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Canvas size should match cropped region * scaling factor
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Size limit for compression & performance
    const maxDimension = 800;
    let finalWidth = cropWidth;
    let finalHeight = cropHeight;

    if (cropWidth > maxDimension || cropHeight > maxDimension) {
      if (cropWidth > cropHeight) {
        finalWidth = maxDimension;
        finalHeight = (cropHeight / cropWidth) * maxDimension;
      } else {
        finalHeight = maxDimension;
        finalWidth = (cropWidth / cropHeight) * maxDimension;
      }
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply rotation & translation
    ctx.save();
    ctx.translate(finalWidth / 2, finalHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    
    // Draw image slice on canvas
    const drawX = -(finalWidth / 2);
    const drawY = -(finalHeight / 2);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      drawX,
      drawY,
      finalWidth,
      finalHeight
    );

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'cropped_image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onCropComplete(croppedFile, URL.createObjectURL(blob));
        }
      },
      'image/jpeg',
      0.85 // Compression quality
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Dialog container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-[#0c0816] border border-violet-500/25 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {mode === 'preview' ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-violet-400" />
                  <h3 className="text-white font-semibold text-base">Image Preview</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview Area */}
              <div className="flex-1 min-h-[250px] bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative mb-6 p-2">
                <img 
                  src={imageSrc} 
                  alt="Original preview" 
                  className="max-h-[50vh] object-contain"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => setMode('crop')}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Sliders size={14} /> Open Crop Editor
                </button>
                <button
                  onClick={handleOriginal}
                  className="flex-1 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  <Check size={14} /> Upload Original
                </button>
              </div>
            </>
          ) : (
            <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-violet-400" />
              <h3 className="text-white font-semibold text-base">Crop & Adjust Image</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Crop Workspace */}
          <div className="flex-1 min-h-[250px] bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative mb-5 p-2">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${zoom}) rotate(${rotate}deg)`,
                  transition: 'transform 0.1s ease',
                  maxHeight: '45vh',
                  objectFit: 'contain',
                }}
              />
            </ReactCrop>
          </div>

          {/* Adjustments Tool Box */}
          <div className="space-y-4 mb-6 flex-shrink-0 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            {/* Zoom Slider */}
            <div className="flex items-center gap-4">
              <ZoomOut size={16} className="text-white/40" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 accent-violet-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <ZoomIn size={16} className="text-white/40" />
              <span className="text-[10px] font-mono text-white/50 w-8 text-right">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-between items-center pt-2">
              {/* Rotate Action */}
              <button
                onClick={handleRotate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-widest transition-all"
              >
                <RotateCw size={14} className="text-violet-400" /> Rotate 90°
              </button>

              {/* Aspect Ratio Lock toggle options */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAspectRatio(1);
                    if (imgSize.width) setCrop(centerAspectCrop(imgSize.width, imgSize.height, 1));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    aspectRatio === 1
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  1:1 (Square)
                </button>
                <button
                  onClick={() => {
                    setAspectRatio(undefined);
                    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    aspectRatio === undefined
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  Free Crop
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => setMode('preview')}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-gray-100 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <Check size={14} /> Apply Crop
            </button>
          </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
