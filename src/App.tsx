import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Flower, 
  Trees, 
  Heart, 
  Star, 
  Award, 
  ShieldCheck, 
  Mail, 
  Compass, 
  Compass as CompassIcon,
  ChevronRight,
  Instagram,
  Facebook,
  MessageSquare,
  Gift,
  Search,
  Check,
  X
} from 'lucide-react';

import { fragrances, ingredients, giftSets, testimonials, translations } from './data';
import { Fragrance, CartItem } from './types';

// Modular interactive components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import ScentQuizModal from './components/ScentQuizModal';
import WhatsAppButton from './components/WhatsAppButton';
import SplashCursor from './components/SplashCursor';

// Image-matched color profiles for each perfume card to tint text, glow, and button styles
const fragranceColors: Record<string, {
  accent: string;
  glow: string;
  badgeBorder: string;
  badgeBg: string;
  btnBorder: string;
  btnHoverBg: string;
  btnHoverText: string;
  btnBg: string;
  btnText: string;
  starColor: string;
  textShadow: string;
}> = {
  'oud-noir': {
    accent: '#c9a66b', // Deep Amber / Oud Gold
    glow: 'rgba(201, 166, 107, 0.16)',
    badgeBorder: 'rgba(201, 166, 107, 0.25)',
    badgeBg: 'rgba(201, 166, 107, 0.05)',
    btnBorder: 'rgba(201, 166, 107, 0.5)',
    btnHoverBg: '#c9a66b',
    btnHoverText: '#0a0a0a',
    btnBg: '#c9a66b',
    btnText: '#0a0a0a',
    starColor: '#c9a66b',
    textShadow: '0 0 12px rgba(201, 166, 107, 0.45)'
  },
  'lavande-de-nuit': {
    accent: '#a78bfa', // Nocturnal Lavender Purple
    glow: 'rgba(167, 139, 250, 0.18)',
    badgeBorder: 'rgba(167, 139, 250, 0.25)',
    badgeBg: 'rgba(167, 139, 250, 0.05)',
    btnBorder: 'rgba(167, 139, 250, 0.5)',
    btnHoverBg: '#a78bfa',
    btnHoverText: '#0a0a0a',
    btnBg: '#a78bfa',
    btnText: '#0a0a0a',
    starColor: '#a78bfa',
    textShadow: '0 0 12px rgba(167, 139, 250, 0.45)'
  },
  'rose-eternelle': {
    accent: '#f43f5e', // Damask Rose Crimson / Pink
    glow: 'rgba(244, 63, 94, 0.18)',
    badgeBorder: 'rgba(244, 63, 94, 0.25)',
    badgeBg: 'rgba(244, 63, 94, 0.05)',
    btnBorder: 'rgba(244, 63, 94, 0.5)',
    btnHoverBg: '#f43f5e',
    btnHoverText: '#0a0a0a',
    btnBg: '#f43f5e',
    btnText: '#0a0a0a',
    starColor: '#f43f5e',
    textShadow: '0 0 12px rgba(244, 63, 94, 0.45)'
  },
  'jasmin-blanc': {
    accent: '#34d399', // Royal Jasmine Emerald / Soft Mint
    glow: 'rgba(52, 211, 153, 0.18)',
    badgeBorder: 'rgba(52, 211, 153, 0.25)',
    badgeBg: 'rgba(52, 211, 153, 0.05)',
    btnBorder: 'rgba(52, 211, 153, 0.5)',
    btnHoverBg: '#34d399',
    btnHoverText: '#0a0a0a',
    btnBg: '#34d399',
    btnText: '#0a0a0a',
    starColor: '#34d399',
    textShadow: '0 0 12px rgba(52, 211, 153, 0.45)'
  },
  'safran-dor': {
    accent: '#fb923c', // Spicy Saffron Red-Orange
    glow: 'rgba(251, 146, 60, 0.18)',
    badgeBorder: 'rgba(251, 146, 60, 0.25)',
    badgeBg: 'rgba(251, 146, 60, 0.05)',
    btnBorder: 'rgba(251, 146, 60, 0.5)',
    btnHoverBg: '#fb923c',
    btnHoverText: '#0a0a0a',
    btnBg: '#fb923c',
    btnText: '#0a0a0a',
    starColor: '#fb923c',
    textShadow: '0 0 12px rgba(251, 146, 60, 0.45)'
  },
  'encens-royal': {
    accent: '#facc15', // Frankincense Warm Golden Yellow
    glow: 'rgba(250, 204, 21, 0.18)',
    badgeBorder: 'rgba(250, 204, 21, 0.25)',
    badgeBg: 'rgba(250, 204, 21, 0.05)',
    btnBorder: 'rgba(250, 204, 21, 0.5)',
    btnHoverBg: '#facc15',
    btnHoverText: '#0a0a0a',
    btnBg: '#facc15',
    btnText: '#0a0a0a',
    starColor: '#facc15',
    textShadow: '0 0 12px rgba(250, 204, 21, 0.45)'
  },
  'santal-ambre': {
    accent: '#eab308', // Creamy Mysore Sandalwood Honey-Amber
    glow: 'rgba(234, 179, 8, 0.18)',
    badgeBorder: 'rgba(234, 179, 8, 0.25)',
    badgeBg: 'rgba(234, 179, 8, 0.05)',
    btnBorder: 'rgba(234, 179, 8, 0.5)',
    btnHoverBg: '#eab308',
    btnHoverText: '#0a0a0a',
    btnBg: '#eab308',
    btnText: '#0a0a0a',
    starColor: '#eab308',
    textShadow: '0 0 12px rgba(234, 179, 8, 0.45)'
  }
};

const defaultColor = {
  accent: '#c9a66b',
  glow: 'rgba(201, 166, 107, 0.15)',
  badgeBorder: 'rgba(201, 166, 107, 0.25)',
  badgeBg: 'rgba(201, 166, 107, 0.05)',
  btnBorder: 'rgba(201, 166, 107, 0.5)',
  btnHoverBg: '#c9a66b',
  btnHoverText: '#0a0a0a',
  btnBg: '#c9a66b',
  btnText: '#0a0a0a',
  starColor: '#c9a66b',
  textShadow: '0 0 12px rgba(201, 166, 107, 0.45)'
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    // Initialize with 1 luxury item to show cart drawer design immediately
    {
      fragrance: fragrances[0], // Oud Noir
      quantity: 1,
      size: '100ml'
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [giftModalSet, setGiftModalSet] = useState<any | null>(null);

  const t = translations[lang];

  // Cart Handlers
  const handleAddToCart = (fragrance: Fragrance, quantity: number = 1, size: '50ml' | '100ml' = '100ml') => {
    const existingIndex = cartItems.findIndex(
      item => item.fragrance.id === fragrance.id && item.size === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { fragrance, quantity, size }]);
    }
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      handleRemoveCartItem(index);
    } else {
      const updated = [...cartItems];
      updated[index].quantity = newQty;
      setCartItems(updated);
    }
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Quick View Trigger
  const triggerQuickView = (fragrance: Fragrance) => {
    setSelectedFragrance(fragrance);
    setIsQuickViewOpen(true);
  };

  // Newsletter Submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() !== '') {
      setNewsletterSubscribed(true);
      setEmailInput('');
      setTimeout(() => {
        setNewsletterSubscribed(false);
      }, 5000);
    }
  };

  // Get Ingredient Lucide Icon
  const getIngredientIcon = (id: string) => {
    switch (id) {
      case 'oud': return <Flame className="h-6 w-6 text-gold" />;
      case 'saffron': return <Sparkles className="h-6 w-6 text-gold" />;
      case 'rose': return <Flower className="h-6 w-6 text-gold" />;
      case 'jasmine': return <Flower className="h-6 w-6 text-gold animate-pulse" />;
      case 'frankincense': return <Flame className="h-6 w-6 text-gold" />;
      case 'sandalwood': return <Trees className="h-6 w-6 text-gold" />;
      case 'musk': return <Sparkles className="h-6 w-6 text-gold" />;
      default: return <Sparkles className="h-6 w-6 text-gold" />;
    }
  };

  const totalCartItemsCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-luxury-black text-ivory relative selection:bg-gold selection:text-luxury-black">
      
      {/* 0. Ambient Fluid Physics Cursor */}
      <SplashCursor />
      
      {/* 1. Header & Navigation */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        cartItemsCount={totalCartItemsCount}
        onQuickView={triggerQuickView}
      />

      {/* 2. Hero Section */}
      <header id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        
        {/* Subtle Ambient smoke / moving layers */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-luxury-black to-luxury-black z-10 pointer-events-none" />
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-amber-gold/20 to-gold/5 blur-[120px] -top-96 -left-96 animate-smoke" />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-gold/15 to-transparent blur-[100px] -bottom-48 -right-48" />
        </div>

        {/* Floating Gold Dust Particles */}
        <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gold/40 animate-gold-dust"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `10%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 8}s`,
              }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 relative py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gold/15 bg-gold/5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="font-serif text-[10px] md:text-xs uppercase tracking-[0.25em] text-gold font-medium">
                  {t.tagline}
                </span>
              </div>

              <div className="space-y-3.5">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6.5xl font-bold tracking-wide text-ivory leading-tight text-gold-glow">
                  {t.slogan}
                </h1>
                <p className="font-sans text-xs sm:text-sm md:text-base text-beige/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#collection"
                  className="w-full sm:w-auto text-center rounded-xl bg-gold py-3.5 px-8 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-xl shadow-gold/10"
                >
                  {t.explore}
                </a>
                <button
                  onClick={() => triggerQuickView(fragrances[0])}
                  className="w-full sm:w-auto text-center rounded-xl border border-gold/20 bg-luxury-black/30 py-3.5 px-8 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
                >
                  {t.discoverOud}
                </button>
              </div>
            </div>

            {/* Right Perfume Hero Visual Column */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              
              {/* Radial backdrop light */}
              <div className="absolute h-80 w-80 rounded-full bg-amber-gold/20 blur-[100px] z-0" />

              {/* Parallax Roots/Scent Floating Island Frame */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full max-w-[340px] aspect-[4/5] overflow-visible flex items-center justify-center cursor-pointer group"
                onClick={() => triggerQuickView(fragrances[0])}
                id="hero-perfume-visual"
              >
                <img
                  src={fragrances[0].image} // Oud Noir Image
                  alt="Oud Noir Hero Fragrance"
                  className="h-full w-full object-cover transition-all duration-[2.5s] group-hover:scale-115 floating-island-mask floating-island-glow"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating details overlay on image */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border border-gold/10 bg-luxury-gray/70 backdrop-blur-md flex justify-between items-center transform translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-gold font-serif block">
                      {lang === 'en' ? fragrances[0].type : fragrances[0].typeAr}
                    </span>
                    <span className="text-sm font-serif font-medium text-ivory block mt-0.5">
                      {lang === 'en' ? fragrances[0].name : fragrances[0].arabicName}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gold group-hover:translate-x-1.5 transition-transform" />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile CTA Sticky Action */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-30" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <a
          href="#collection"
          className="block w-full text-center rounded-xl bg-gold py-3 px-6 text-xs font-bold uppercase tracking-widest text-luxury-black shadow-2xl shadow-gold/20 border border-gold/40"
        >
          {lang === 'en' ? 'Shop the Collection' : 'تسوق المجموعة الفاخرة'}
        </a>
      </div>

      {/* 3. Signature Collection Grid Section */}
      <section id="collection" className="mx-auto max-w-7xl px-6 py-24 md:px-10 border-t border-gold/10 bg-luxury-black relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        
        {/* Subtle radial light backdrops */}
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-1/4 h-96 w-96 rounded-full bg-amber-gold/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ivory text-gold-glow">
              {t.signatureCollection}
            </h2>
            <p className="font-serif text-xs md:text-sm text-beige/65 italic uppercase tracking-wider">
              {t.signatureSubtitle}
            </p>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
          </div>

          <div className="space-y-28 md:space-y-36">
            {fragrances.map((f, index) => {
              const reverse = index % 2 !== 0;
              const colors = fragranceColors[f.id] || defaultColor;
              
              // Editorial varied alignment
              const alignClass = index % 3 === 0 
                ? "lg:items-center" 
                : index % 3 === 1 
                  ? "lg:items-start lg:pt-12" 
                  : "lg:items-end lg:pb-12";

              return (
                <article
                  key={f.id}
                  className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${alignClass} colored-perfume-card`}
                  id={`fragrance-row-${f.id}`}
                  style={{
                    '--perfume-accent': colors.accent,
                    '--perfume-glow': colors.textShadow,
                    '--perfume-badge-border': colors.badgeBorder,
                    '--perfume-badge-bg': colors.badgeBg,
                    '--perfume-bg-glow': colors.glow
                  } as React.CSSProperties}
                >
                  {/* Floating image - Row 1 is left, Row 2 is right on desktop */}
                  <div className={`relative flex min-h-[350px] md:min-h-[480px] items-center justify-center overflow-visible ${
                    reverse ? "lg:order-2" : "lg:order-1"
                  }`}>
                    {/* Soft gold glow behind every floating perfume bottle */}
                    <div className="perfume-glow" />

                    <motion.div
                      animate={{ y: [0, -14, 0] }}
                      transition={{
                        duration: 6 + (index % 3) * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                      className="relative z-10 w-full flex items-center justify-center overflow-visible"
                    >
                      <img
                        src={f.image}
                        alt={lang === 'en' ? f.name : f.arabicName}
                        className="relative z-10 h-auto w-[115%] max-w-[650px] object-contain floating-island-mask floating-island-glow"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>

                  {/* Separate glass content card - Row 1 is right, Row 2 is left on desktop */}
                  <div
                    className={`relative z-20 w-full max-w-md ${
                      reverse 
                        ? "lg:order-1 lg:justify-self-start" 
                        : "lg:order-2 lg:justify-self-end"
                    }`}
                  >
                    <div className="glass-perfume-card p-8 md:p-10 rounded-3xl relative">
                      {f.isNew && (
                        <div 
                          className="absolute top-4 right-4 z-10 px-2.5 py-0.5 text-luxury-black text-[9px] font-bold uppercase tracking-widest rounded shadow-md border"
                          style={{
                            backgroundColor: colors.accent,
                            borderColor: colors.badgeBorder
                          }}
                        >
                          {lang === 'en' ? 'NEW' : 'جديد'}
                        </div>
                      )}

                      <p className="mb-4 text-[10px] uppercase tracking-[0.32em] font-serif colored-perfume-accent-text">
                        {lang === 'en' ? f.type : f.typeAr}
                      </p>

                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-serif text-3xl md:text-4.5xl text-ivory colored-perfume-accent-glow">
                          {lang === 'en' ? f.name : f.arabicName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs colored-perfume-accent-text">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-sans font-medium text-beige">{f.rating}</span>
                        </div>
                      </div>

                      <p className="mt-5 text-xs sm:text-sm leading-7 text-beige/85 font-sans">
                        {lang === 'en' ? f.description : f.descriptionAr}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {(lang === 'en' ? f.notes : f.notesAr).map((note) => (
                          <span
                            key={note}
                            className="rounded-full border px-3.5 py-1 text-xs text-beige/85 font-sans colored-perfume-badge"
                          >
                            {note}
                          </span>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-gold/10 pt-6">
                        <span className="font-sans text-lg md:text-xl font-bold colored-perfume-accent-text">
                          {f.price} {t.aed}
                        </span>

                        <div className="flex gap-3">
                          <button
                            onClick={() => triggerQuickView(f)}
                            className="border rounded-xl px-5 py-3 text-xs uppercase tracking-[0.18em] text-ivory transition duration-300 colored-perfume-btn"
                            id={`discover-btn-${f.id}`}
                          >
                            {t.viewFragrance}
                          </button>
                          
                          <button
                            onClick={() => {
                              handleAddToCart(f);
                              setIsCartOpen(true);
                            }}
                            className="rounded-xl p-3.5 text-luxury-black transition-colors flex items-center justify-center shrink-0 colored-perfume-bag-btn"
                            aria-label="Add to bag"
                            id={`add-to-bag-row-${f.id}`}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Ingredient Story Section */}
      <section id="ingredients" className="py-24 border-t border-gold/10 bg-luxury-gray/30 relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ivory text-gold-glow">
              {t.fromNature}
            </h2>
            <div className="h-0.5 w-16 bg-gold mx-auto mt-4" />
          </div>

          {/* Luxury Showcase list */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5">
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className="rounded-2xl border border-gold/10 bg-luxury-black/40 p-5 text-center flex flex-col items-center justify-center space-y-3.5 hover:border-gold/30 hover:bg-luxury-black/80 transition-all duration-500 group"
                id={`ingredient-card-${ing.id}`}
              >
                <div className="h-12 w-12 rounded-full border border-gold/15 bg-luxury-gray/40 flex items-center justify-center group-hover:scale-110 group-hover:border-gold/45 transition-all duration-500">
                  {getIngredientIcon(ing.id)}
                </div>
                <div>
                  <h4 className="font-serif text-sm font-medium tracking-wide text-ivory group-hover:text-gold transition-colors">
                    {lang === 'en' ? ing.name : ing.nameAr}
                  </h4>
                  <p className="text-[10px] text-beige/55 mt-1 leading-relaxed font-sans font-normal">
                    {lang === 'en' ? ing.description : ing.descriptionAr}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Craftsmanship & Brand Story Section */}
      <section id="story" className="py-24 border-t border-gold/10 bg-luxury-black relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
              <span className="font-serif text-xs uppercase tracking-[0.2em] text-gold font-medium">
                {t.craftedInUae}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ivory text-gold-glow">
                {lang === 'en' ? 'Maison Al Faisal' : 'دار آل فيصل للعطور'}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-beige/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.brandStoryText}
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => triggerQuickView(fragrances[0])}
                  className="rounded-xl border border-gold/20 bg-luxury-black/40 py-3 px-8 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
                >
                  {t.ourStoryBtn}
                </button>
              </div>
            </div>

            {/* Right Column Cinematic Visual Frame */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[16/10] overflow-hidden rounded-3xl border border-gold/15 bg-luxury-gray flex items-center justify-center shadow-2xl">
                {/* Custom animation lines simulating perfume mist, lights, smoke */}
                <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent to-luxury-black" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-gold/5 blur-[70px] pointer-events-none" />
                
                {/* Moving smoky/dust lines */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(201,166,107,0.03)_25%,transparent_25%)] bg-[size:20px_20px] opacity-20" />
                
                <div className="text-center z-10 p-6 space-y-3">
                  <Award className="h-10 w-10 text-gold mx-auto animate-float" />
                  <p className="font-serif text-xs uppercase tracking-widest text-gold">
                    {lang === 'en' ? 'OLFACTORY EXCELLENCE' : 'تميز عطري استثنائي'}
                  </p>
                  <p className="font-sans text-[11px] text-beige/50 max-w-xs mx-auto leading-relaxed">
                    {lang === 'en' 
                      ? 'Compounded using the finest botanicals in Ajman, UAE, certified for world-class persistence.'
                      : 'تم تركيبه وتعبئته باستخدام أرقى الزيوت الطبيعية في عجمان، الإمارات العربية المتحدة، لضمان أعلى ثبات.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Scent Discovery Quiz Banner */}
      <section className="py-20 border-t border-gold/10 bg-gradient-to-b from-luxury-black to-luxury-gray relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="absolute inset-0 bg-radial-gradient from-amber-gold/5 to-transparent blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6 relative z-10">
          <CompassIcon className="h-8 w-8 text-gold mx-auto animate-spin" style={{ animationDuration: '30s' }} />
          <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-ivory text-gold-glow">
            {t.findSignature}
          </h2>
          <p className="font-sans text-xs md:text-sm text-beige/75 max-w-md mx-auto leading-relaxed">
            {t.quizText}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="rounded-xl bg-gold py-3.5 px-8 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-xl shadow-gold/5"
              id="start-quiz-banner-btn"
            >
              {t.startQuizBtn}
            </button>
          </div>
        </div>
      </section>

      {/* 8. Gift Set Section */}
      <section id="gift-sets" className="py-24 border-t border-gold/10 bg-luxury-black relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ivory text-gold-glow">
              {t.artOfGifting}
            </h2>
            <div className="h-0.5 w-16 bg-gold mx-auto mt-4" />
          </div>

          {/* Cards list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {giftSets.map((gs) => (
              <div
                key={gs.id}
                className="rounded-3xl border border-gold/10 bg-luxury-gray/40 overflow-hidden flex flex-col justify-between hover:border-gold/30 hover:bg-luxury-gray transition-all duration-500 group"
                id={`gift-card-${gs.id}`}
              >
                <div>
                  <div className="relative h-56 overflow-hidden border-b border-gold/10">
                    <img
                      src={gs.image}
                      alt={gs.name}
                      className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/75 to-transparent pointer-events-none" />
                  </div>

                  <div className="p-5 space-y-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-serif text-base md:text-lg font-medium tracking-wide text-ivory">
                        {lang === 'en' ? gs.name : gs.nameAr}
                      </h3>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-gold shrink-0">
                        {gs.price} {t.aed}
                      </span>
                    </div>

                    <p className="text-xs text-beige/70 leading-relaxed font-sans line-clamp-2">
                      {lang === 'en' ? gs.description : gs.descriptionAr}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-serif uppercase tracking-widest text-gold block">
                        {t.giftSetIncludes}
                      </span>
                      <ul className="text-xs text-beige/50 space-y-1">
                        {(lang === 'en' ? gs.items : gs.itemsAr).map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-gold" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-gold/5 bg-luxury-black/20">
                  <button
                    onClick={() => setGiftModalSet(gs)}
                    className="w-full rounded-xl bg-gold/5 border border-gold/15 py-2.5 px-4 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-luxury-black transition-all duration-500"
                    id={`view-gift-btn-${gs.id}`}
                  >
                    {t.exploreGiftSets}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. Testimonials Section */}
      <section className="py-24 border-t border-gold/10 bg-luxury-gray/10 relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-ivory text-gold-glow">
              {t.wornRemembered}
            </h2>
            <div className="h-0.5 w-16 bg-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="rounded-3xl border border-gold/10 bg-luxury-black/40 p-6 md:p-8 flex flex-col justify-between space-y-6"
                id={`testimonial-card-${test.id}`}
              >
                <div className="space-y-4">
                  <div className="flex text-gold">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif text-xs sm:text-sm text-beige leading-relaxed italic">
                    “{lang === 'en' ? test.quote : test.quoteAr}”
                  </p>
                </div>

                <div className="border-t border-gold/10 pt-4 flex justify-between items-center text-xs">
                  <span className="font-serif font-medium text-ivory tracking-wide">
                    {lang === 'en' ? test.author : test.authorAr}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gold">
                    {lang === 'en' ? test.location : test.locationAr}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. Newsletter Section */}
      <section className="py-24 border-t border-gold/10 bg-luxury-black relative" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="absolute inset-0 bg-radial-gradient from-amber-gold/5 to-transparent blur-[120px]" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 relative z-10">
          <div className="glass-perfume-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            
            {/* Ambient amber glow inside card */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-amber-gold/5" />

            <div className="relative z-10 space-y-5">
              <Mail className="h-8 w-8 text-gold mx-auto animate-float" />
              
              <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-ivory text-gold-glow">
                {t.enterHouse}
              </h2>
              
              <p className="font-sans text-xs md:text-sm text-beige/70 max-w-md mx-auto leading-relaxed">
                {t.newsletterText}
              </p>

              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto pt-4 relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder={t.emailPlaceholder}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 rounded-xl border border-gold/15 bg-luxury-black/60 px-4 py-3 text-xs text-ivory placeholder-beige/30 focus:border-gold outline-none transition-colors"
                    id="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gold py-3 px-6 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-lg shadow-gold/5 shrink-0"
                    id="newsletter-submit-btn"
                  >
                    {t.joinMaison}
                  </button>
                </div>
              </form>

              {/* Newsletter success feedback */}
              <AnimatePresence>
                {newsletterSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-xs text-emerald-500 font-medium font-sans mt-4"
                  >
                    {t.successSubscribe}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer Section */}
      <footer id="contact" className="py-16 border-t border-gold/10 bg-luxury-black relative text-xs text-beige/60" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-12 border-b border-gold/10">
            
            {/* Column 1 Logo */}
            <div className="space-y-4">
              <a href="#home" className="flex flex-col select-none" id="footer-logo">
                <span className="font-serif text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-gold text-gold-glow-subtle">
                  {t.brand}
                </span>
                <span className="text-[8px] tracking-[0.45em] text-beige block mt-0.5 font-sans">
                  {t.brandSubtitle}
                </span>
              </a>
              <p className="leading-relaxed font-sans">
                {lang === 'en' 
                  ? 'Luxury Arabic perfume house capturing the mysterious elegance of Middle Eastern scent traditions.'
                  : 'دار عطور عربية فاخرة تجسد الأناقة والغموض وعراقة التقاليد العطرية للشرق الأوسط.'}
              </p>
            </div>

            {/* Column 2 Navigation Sitemap */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold">
                {lang === 'en' ? 'Collection' : 'المجموعة'}
              </h4>
              <ul className="space-y-2 font-sans text-beige/80">
                {fragrances.map((f) => (
                  <li key={f.id}>
                    <button onClick={() => triggerQuickView(f)} className="hover:text-gold transition-colors">
                      {lang === 'en' ? f.name : f.arabicName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 Information */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold">
                {lang === 'en' ? 'Customer Care' : 'خدمة العملاء'}
              </h4>
              <ul className="space-y-2 font-sans text-beige/80">
                <li><a href="#story" className="hover:text-gold transition-colors">{lang === 'en' ? 'Shipping & Returns' : 'الشحن والإرجاع'}</a></li>
                <li><a href="#story" className="hover:text-gold transition-colors">{lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}</a></li>
                <li><a href="#story" className="hover:text-gold transition-colors">{lang === 'en' ? 'Terms of Service' : 'شروط الخدمة'}</a></li>
                <li><a href="#story" className="hover:text-gold transition-colors">{lang === 'en' ? 'Store Locations' : 'فروعنا في الإمارات'}</a></li>
              </ul>
            </div>

            {/* Column 4 Social Media */}
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-gold">
                {lang === 'en' ? 'Connect' : 'تواصل معنا'}
              </h4>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-beige/60 hover:text-gold transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-beige/60 hover:text-gold transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://wa.me/971500000000" target="_blank" rel="noreferrer" className="text-beige/60 hover:text-gold transition-colors" aria-label="WhatsApp">
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
              <p className="font-sans">
                {lang === 'en' ? 'Maison Al Faisal Perfumes, Dubai Marina Mall, UAE' : 'عطور آل فيصل الفاخرة، دبي مارينا مول، دولة الإمارات'}
              </p>
            </div>

          </div>

          {/* Bottom Copyright and Credits */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-beige/40">
            <p className="font-sans">
              © 2026 AL FAISAL Perfumes. All Rights Reserved.
            </p>
            <p className="font-serif italic mt-2 sm:mt-0 tracking-widest text-gold">
              Crafted in the UAE.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Advisory Widget */}
      <WhatsAppButton lang={lang} />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lang={lang}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Quick View / Scent Story modal */}
      <QuickViewModal 
        fragrance={selectedFragrance}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        lang={lang}
        onAddToCart={(f, q, s) => {
          handleAddToCart(f, q, s);
          setIsCartOpen(true);
        }}
      />

      {/* Scent Discovery Quiz Modal */}
      <ScentQuizModal 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lang={lang}
        onAddToCart={(f) => {
          handleAddToCart(f, 1, '100ml');
          setIsCartOpen(true);
        }}
        onQuickView={(f) => {
          setSelectedFragrance(f);
          setIsQuickViewOpen(true);
        }}
      />

      {/* Optional Custom Gift Set Modal */}
      <AnimatePresence>
        {giftModalSet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-md font-sans" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full bg-luxury-gray border border-gold/20 rounded-3xl p-6 md:p-8 space-y-6 text-ivory shadow-2xl"
              id="gift-details-modal"
            >
              <button
                onClick={() => setGiftModalSet(null)}
                className="absolute top-5 right-5 text-beige hover:text-gold transition-colors"
                id="close-gift-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-48 rounded-2xl overflow-hidden border border-gold/10">
                <img
                  src={giftModalSet.image}
                  alt={giftModalSet.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-xl font-semibold tracking-wide text-ivory text-gold-glow-subtle">
                    {lang === 'en' ? giftModalSet.name : giftModalSet.nameAr}
                  </h3>
                  <span className="font-sans text-base font-semibold text-gold">
                    {giftModalSet.price} {t.aed}
                  </span>
                </div>
                
                <p className="text-xs text-beige/80 leading-relaxed leading-6 font-sans">
                  {lang === 'en' ? giftModalSet.description : giftModalSet.descriptionAr}
                </p>

                <div className="space-y-2 border-t border-gold/10 pt-4">
                  <span className="text-[11px] font-serif uppercase tracking-widest text-gold block">
                    {t.giftSetIncludes}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-beige/65">
                    {(lang === 'en' ? giftModalSet.items : giftModalSet.itemsAr).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  // Treat gift set as custom item or allow directly adding to cart.
                  // We simulate by showing support prompt or closing for elegant experience.
                  setGiftModalSet(null);
                  setIsCartOpen(true);
                }}
                className="w-full rounded-xl bg-gold py-3 px-6 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300"
                id="gift-add-to-bag-cta"
              >
                {lang === 'en' ? 'Reserve Gift Set' : 'حجز طقم الهدايا'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
