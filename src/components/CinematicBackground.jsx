import React, { useEffect, useRef } from 'react';
import heroVideo from '../video/IMG_0250.MP4';

const CinematicBackground = React.memo(function CinematicBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.play().catch(() => {});
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#0a0a0a',
        transform: 'translateZ(0)',
      }}
    >
      {/* ── Video — full cover, perfectly centered ────────────────────────── */}
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover object-center md:object-[40%_center] z-[1]"
        style={{
          opacity: 1,
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      />

      {/* ── Minimal overlay — soft violet tint only, very low opacity ─────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: [
            /* Subtle bottom fade so button sits cleanly */
            'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.45) 100%)',
            /* Very light violet colour grade */
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(88,28,220,0.08) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
    </div>
  );
});

export default CinematicBackground;
