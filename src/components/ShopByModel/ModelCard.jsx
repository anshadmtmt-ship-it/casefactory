import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ModelCard({ model, index }) {
  return (
    <motion.a
      href={model.link || '#'}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group flex-shrink-0 flex flex-col items-center cursor-pointer"
      style={{ scrollSnapAlign: 'start', textDecoration: 'none' }}
      aria-label={`Shop cases for ${model.name}`}
    >
      {/* Card Shell */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] bg-white border border-gray-100/80"
        style={{
          width: '180px',
          height: '240px',
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(0,0,0,0)',
          transition: 'box-shadow 0.35s ease',
        }}
      >
        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-400 rounded-[1.75rem]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Product image */}
        {model.image ? (
          <img
            src={model.image}
            alt={model.name}
            className="w-full h-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback placeholder */}
        <div
          className="absolute inset-0 flex items-center justify-center text-gray-300"
          style={{ display: model.image ? 'none' : 'flex' }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
            <circle cx="12" cy="17" r="1" />
          </svg>
        </div>

        {/* Subtle bottom shimmer line on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent)',
          }}
        />
      </div>

      {/* Model Name */}
      <div className="mt-4 text-center px-2">
        <p
          className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-800 group-hover:text-black transition-colors duration-200"
          style={{ letterSpacing: '0.13em' }}
        >
          {model.name}
        </p>
        <p
          className="mt-1 text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
          style={{ letterSpacing: '0.08em' }}
        >
          Shop Cases →
        </p>
      </div>
    </motion.a>
  );
}
