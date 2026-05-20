import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import ProductCard from '../Products/ProductCard';
import FloatingBackButton from '../common/FloatingBackButton';

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured'          },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A–Z'          },
];

const CATEGORY_META = {
  'iphone-cases':   { label: 'iPhone Cases',   subtitle: 'Premium protection for Apple\'s finest.' },
  'android-cases':  { label: 'Android Cases',  subtitle: 'Engineered for every Android flagship.'  },
  'accessories':    { label: 'Accessories',    subtitle: 'Complete your setup with premium add-ons.' },
};

function parsePrice(str) { return parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0; }

const EASE_OUT = [0.16, 1, 0.3, 1];

const gridContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } };
const gridItem = { hidden: { opacity: 0, y: 32, scale: 0.96, filter: 'blur(4px)' }, visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: EASE_OUT } } };

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { categoriesHook, productsHook } = useOutletContext();
  const onBack = () => navigate(-1);

  const [search, setSearch]             = useState('');
  const [sort, setSort]                 = useState('default');
  const [page, setPage]                 = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 400], ['0%', '20%']);

  const catData = categoriesHook?.activeCategories?.find(c => c.slug === slug);
  const bannerImage = catData?.image || '';

  const meta = {
    label:    catData?.name || slug?.replace(/-/g, ' '),
    subtitle: catData?.description || catData?.subtitle || 'Explore our collection.',
  };
  const themeColor = catData?.theme_color || '#7c3aed';
  
  const hexToRgbA = (hex, alpha) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length === 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return `rgba(124,58,237,${alpha})`;
  };

  const rawProducts = useMemo(() => productsHook.productsByCategory(slug), [productsHook.products, slug]);

  const filtered = useMemo(() => {
    let list = rawProducts;
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q)); }
    if (sort === 'price-asc')  list = [...list].sort((a, b) => parsePrice(a.discount_price || a.price) - parsePrice(b.discount_price || b.price));
    if (sort === 'price-desc') list = [...list].sort((a, b) => parsePrice(b.discount_price || b.price) - parsePrice(a.discount_price || a.price));
    if (sort === 'name-asc')   list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [rawProducts, search, sort]);

  const visible  = filtered.slice(0, page * PAGE_SIZE);
  const hasMore  = visible.length < filtered.length;
  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-h-screen font-sans" style={{ background: '#050505', touchAction: 'pan-y' }}>

      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(280px, 40vw, 480px)' }}>
        <motion.div className="absolute inset-0 w-full" style={{ y: bannerY, scale: 1.12, transformOrigin: 'center top', willChange: 'transform' }}>
          {bannerImage ? (
            <img src={bannerImage} alt={meta.label} className="w-full h-full object-cover" style={{ filter: 'brightness(0.55)' }} />
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #030008 0%, #0d0520 60%, #050508 100%)' }}>
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `linear-gradient(${hexToRgbA(themeColor, 0.22)} 1px,transparent 1px),linear-gradient(90deg,${hexToRgbA(themeColor, 0.22)} 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 30%, ${hexToRgbA(themeColor, 0.20)} 0%, transparent 70%)` }} />
            </div>
          )}
        </motion.div>

        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE_OUT }}
          style={{ background: 'linear-gradient(to top, rgba(5,0,10,0.98) 0%, rgba(5,0,10,0.42) 55%, rgba(5,0,10,0.12) 100%)' }} />

        <FloatingBackButton themeColor={themeColor} />

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 lg:px-20 pb-10 sm:pb-16">
          <motion.p className="text-xs font-medium uppercase mb-2" style={{ color: hexToRgbA(themeColor, 0.55), letterSpacing: '0.28em' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: EASE_OUT }}>
            Collection
          </motion.p>
          <motion.h1 className="font-serif text-white font-semibold leading-none tracking-tight text-glow" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)' }} initial={{ opacity: 0, y: 48, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.85, delay: 0.18, ease: EASE_OUT }}>
            {meta.label}
          </motion.h1>
          <motion.p className="font-light text-sm sm:text-base max-w-md mt-3" style={{ color: 'rgba(255,255,255,0.35)' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.32, ease: EASE_OUT }}>
            {meta.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Toolbar */}
      <motion.div className="max-w-[90rem] mx-auto px-4 sm:px-10 lg:px-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.45, ease: EASE_OUT }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-6" style={{ borderBottom: `1px solid ${hexToRgbA(themeColor, 0.15)}` }}>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(168,85,247,0.50)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl glass-input" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium whitespace-nowrap hidden sm:block" style={{ color: 'rgba(192,132,252,0.40)' }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="relative">
              <button onClick={() => setShowSortMenu(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm glass-btn">
                <SlidersHorizontal size={13} style={{ color: 'rgba(168,85,247,0.55)' }} />
                {sortLabel}
                <ChevronDown size={13} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} style={{ color: 'rgba(168,85,247,0.55)' }} />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-30"
                    style={{ background: 'rgba(8,4,18,0.96)', backdropFilter: 'blur(24px)', border: `1px solid ${hexToRgbA(themeColor, 0.25)}`, boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 40px ${hexToRgbA(themeColor, 0.12)}` }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setSort(opt.value); setShowSortMenu(false); setPage(1); }} className="w-full px-4 py-2.5 text-left text-sm transition-all"
                        style={sort === opt.value ? { background: 'rgba(124,58,237,0.18)', color: '#C084FC', fontWeight: 600 } : { color: 'rgba(255,255,255,0.45)' }}>
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-10 lg:px-16 py-10">
        {filtered.length === 0 ? (
          <motion.div className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <p className="text-sm tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.28)' }}>No products found</p>
            {search && <button onClick={() => setSearch('')} className="mt-4 text-xs underline transition-colors" style={{ color: 'rgba(168,85,247,0.45)' }}>Clear search</button>}
          </motion.div>
        ) : (
          <>
            <motion.div key={`${slug}-${search}-${sort}-${page}`} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" variants={gridContainer} initial="hidden" animate="visible">
              {visible.map((product, i) => (
                <motion.div key={product.id} variants={gridItem}><ProductCard product={product} index={i} /></motion.div>
              ))}
            </motion.div>

            {hasMore && (
              <motion.div className="mt-12 flex justify-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPage(p => p + 1)} className="px-10 py-3.5 rounded-full text-sm font-medium tracking-wide glass-btn">
                  Load More ({filtered.length - visible.length} remaining)
                </motion.button>
              </motion.div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <motion.p className="mt-10 text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.25)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                All {filtered.length} products shown
              </motion.p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
