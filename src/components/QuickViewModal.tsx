import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { Fragrance } from '../types';
import { translations } from '../data';

interface QuickViewModalProps {
  fragrance: Fragrance | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddToCart: (fragrance: Fragrance, quantity: number, size: '50ml' | '100ml') => void;
}

export default function QuickViewModal({ fragrance, isOpen, onClose, lang, onAddToCart }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('100ml');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setSelectedSize('100ml');
      setQuantity(1);
      setIsAdded(false);
    }
  }, [isOpen, fragrance]);

  if (!isOpen || !fragrance) return null;

  // Calculate price based on selected size: 50ml is 75% of 100ml price (rounded to nearest 5)
  const basePrice = fragrance.price;
  const displayPrice = selectedSize === '50ml' ? Math.round((basePrice * 0.75) / 5) * 5 : basePrice;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToBag = () => {
    onAddToCart(fragrance, quantity, selectedSize);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/95 backdrop-blur-md font-sans" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-gold/25 bg-luxury-gray text-ivory shadow-2xl"
        id="quick-view-modal"
      >
        {/* Top Gold Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-amber-gold to-gold" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 rounded-full border border-gold/15 bg-luxury-black/40 p-2.5 text-beige hover:text-gold hover:border-gold/40 transition-colors"
          aria-label="Close details"
          id="close-quickview-btn"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto md:max-h-none">
          {/* Left: Perfume Cinematic Image & Glow */}
          <div className="relative flex items-center justify-center bg-luxury-black p-8 md:p-12 border-b md:border-b-0 md:border-r border-gold/10 overflow-hidden min-h-[300px] md:min-h-[480px]">
            {/* Ambient Background Glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-gold/10 blur-[80px]" />
            
            {/* Roots/Plants floating island frame */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-full max-w-[280px] aspect-[3/4] overflow-visible"
            >
              <img
                src={fragrance.image}
                alt={fragrance.name}
                className="h-full w-full object-cover transition-all duration-[2s] hover:scale-110 floating-island-mask floating-island-glow"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Right: Scent details */}
          <div className="p-6 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Scent Title / Type */}
              <div className="space-y-1.5">
                <span className="text-[10px] md:text-xs font-serif uppercase tracking-[0.25em] text-gold">
                  {lang === 'en' ? fragrance.type : fragrance.typeAr}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-ivory text-gold-glow-subtle">
                    {lang === 'en' ? fragrance.name : fragrance.arabicName}
                  </h2>
                  <span className="font-sans text-lg md:text-xl font-semibold text-gold">
                    {displayPrice} {t.aed}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-beige">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span>{fragrance.rating}</span>
                <span className="text-gold/20">•</span>
                <span className="text-[11px] text-beige/50">
                  {lang === 'en' ? `(${fragrance.reviewsCount} verified reviews)` : `(${fragrance.reviewsCount} تقييم موثق)`}
                </span>
              </div>

              {/* Short Scent Description */}
              <p className="text-xs md:text-sm text-beige/80 leading-relaxed font-sans">
                {lang === 'en' ? fragrance.description : fragrance.descriptionAr}
              </p>

              {/* Olfactory Notes Grid */}
              <div className="space-y-2">
                <h4 className="font-serif text-[11px] uppercase tracking-widest text-gold">
                  {t.notes}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(lang === 'en' ? fragrance.notes : fragrance.notesAr).map((note, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gold/5 border border-gold/15 py-1 px-3.5 text-xs text-gold font-sans font-medium hover:bg-gold/10 transition-colors"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scent Story */}
              <div className="space-y-2 border-t border-gold/10 pt-4">
                <h4 className="font-serif text-[11px] uppercase tracking-widest text-gold">
                  {t.storyTitle}
                </h4>
                <p className="text-xs text-beige/60 leading-relaxed italic font-serif">
                  “{lang === 'en' ? fragrance.story : fragrance.storyAr}”
                </p>
              </div>

              {/* Size Selector */}
              <div className="grid grid-cols-2 gap-4 border-t border-gold/10 pt-4">
                <div>
                  <label className="mb-2 block font-serif text-[11px] uppercase tracking-widest text-gold">
                    {t.size}
                  </label>
                  <div className="flex gap-2">
                    {['50ml', '100ml'].map((sz) => {
                      const active = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz as any)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                            active
                              ? 'border-gold bg-gold/5 text-gold text-gold-glow-subtle'
                              : 'border-gold/10 bg-luxury-black/30 text-beige hover:border-gold/30'
                          }`}
                          id={`size-btn-${sz}`}
                        >
                          {sz === '50ml' ? (lang === 'en' ? '50ml' : '٥٠ مل') : (lang === 'en' ? '100ml' : '١٠٠ مل')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-2 block font-serif text-[11px] uppercase tracking-widest text-gold">
                    {t.quantity}
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-gold/10 bg-luxury-black/30 px-3 py-1.5 h-9">
                    <button
                      onClick={handleDecrement}
                      className="text-beige/60 hover:text-gold transition-colors"
                      id="qty-decrement"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-semibold font-sans">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="text-beige/60 hover:text-gold transition-colors"
                      id="qty-increment"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Bag CTA */}
            <div className="mt-8">
              <button
                onClick={handleAddToBag}
                className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 px-6 text-xs font-semibold uppercase tracking-widest transition-all duration-500 shadow-lg ${
                  isAdded
                    ? 'bg-emerald-600 text-ivory scale-98 shadow-emerald-900/10'
                    : 'bg-gold text-luxury-black hover:bg-gold-dark hover:shadow-gold/15'
                }`}
                id="modal-add-to-bag"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3px]" />
                    <span>{t.addedToBag}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t.addToBag}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
