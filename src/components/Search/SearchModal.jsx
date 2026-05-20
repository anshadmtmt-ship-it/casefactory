import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from './SearchContext';
import { useProducts } from '../Products/useProducts';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useGlobalSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Use the global products cache to prevent slow API calls
  const { products } = useProducts();

  // Perform search locally instantly
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      return;
    }

    const filtered = products.filter(product => {
      const matchTitle = product.title?.toLowerCase().includes(q);
      const matchCategory = product.category?.toLowerCase().includes(q);
      const matchBadge = product.badge_text?.toLowerCase().includes(q);
      return matchTitle || matchCategory || matchBadge;
    });

    // Take top 5 results
    setResults(filtered.slice(0, 5));
  }, [query, products]);

  // Lock scroll and auto-focus
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      // Small timeout ensures the element is mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  const handleResultClick = (slug) => {
    setIsSearchOpen(false);
    navigate(`/product_details/${slug}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-[10vh] sm:pt-[15vh] px-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsSearchOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Input Area */}
            <div className="relative flex items-center px-6 py-5 border-b border-gray-100">
              <Search size={26} className="text-gray-400 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for cases, accessories..."
                className="flex-1 bg-transparent border-none outline-none text-xl sm:text-2xl text-gray-900 placeholder-gray-300 font-medium tracking-tight"
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors mr-2"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-sm font-semibold text-gray-500 hover:text-black uppercase tracking-widest px-3 py-2 transition-colors border-l border-gray-200"
              >
                Esc
              </button>
            </div>

            {/* Results Area */}
            {query.trim().length > 0 && (
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2 sm:p-4 bg-gray-50/50">
                {results.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.04 } },
                    }}
                    className="space-y-2"
                  >
                    {results.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                        }}
                        onClick={() => handleResultClick(product.slug)}
                        className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] cursor-pointer transition-all border border-transparent hover:border-gray-100"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                          {product.images?.length > 0 && (
                            <img
                              src={product.images.find(img => img.is_main)?.image || product.images[0].image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 truncate">
                            {product.category || 'Category'}
                          </p>
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate group-hover:text-casemark-dark transition-colors">
                            {product.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            {product.discount_price ? (
                              <>
                                <span className="font-bold text-casemark-dark text-sm sm:text-base">{product.discount_price}</span>
                                <span className="text-xs text-gray-400 line-through">{product.price}</span>
                              </>
                            ) : (
                              <span className="font-bold text-casemark-dark text-sm sm:text-base">{product.price}</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="pr-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 flex flex-col items-center justify-center text-center px-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <Search size={28} />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">No matching products found.</h3>
                    <p className="text-gray-500 text-sm max-w-sm mb-6">
                      We couldn't find anything matching "{query}". Try adjusting your search or browse our collection.
                    </p>
                    <button
                      onClick={() => { setIsSearchOpen(false); navigate('/'); }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-casemark-dark text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black transition-colors group"
                    >
                      Explore Collection
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
            
            {/* Quick Links (Shown when empty query) */}
            {query.trim().length === 0 && (
              <div className="p-6 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['iPhone 15 Pro Max', 'Magsafe', 'Leather', 'Clear Case'].map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-full hover:border-black hover:text-black transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
