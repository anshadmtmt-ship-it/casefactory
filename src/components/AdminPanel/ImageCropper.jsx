import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 9 / 16 }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }

  async function handleComplete() {
    if (!completedCrop || !imgRef.current) {
      onCancel();
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onCancel();
          return;
        }
        // Convert Blob to File
        const file = new File([blob], 'cropped_image.webp', { type: 'image/webp', lastModified: Date.now() });
        // Also provide a preview URL
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(file, previewUrl);
      },
      'image/webp',
      1.0
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-3xl w-full flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold tracking-wide">Crop Image</h3>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50 rounded-xl mb-6 relative min-h-[50vh]">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[60vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop me"
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', width: 'auto' }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-all"
          >
            <Check size={16} /> Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}
