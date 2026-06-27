import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, fragrances } from '../data';
import { Fragrance } from '../types';

interface NavbarProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  onCartToggle: () => void;
  cartItemsCount: number;
  onQuickView: (f: Fragrance) => void;
}

export default function Navbar({
  lang,
  setLang,
  onCartToggle,
  cartItemsCount,
  onQuickView
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<Fragrance[]>([]);

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResults([]);
    } else {
      const query = searchQuery.toLowerCase();
      const results = fragrances.filter(f => {
        const nameMatch = f.name.toLowerCase().includes(query) || f.arabicName.includes(query);
        const notesMatch = f.notes.some(n => n.toLowerCase().includes(query)) || f.notesAr.some(n => n.includes(query));
        return nameMatch || notesMatch;
      });
      setFilteredResults(results);
    }
  }, [searchQuery]);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { name: lang === 'en' ? 'Home' : 'الرئيسية', href: '#home' },
    { name: lang === 'en' ? 'Collection' : 'المجموعة', href: '#collection' },
    { name: lang === 'en' ? 'Ingredients' : 'المكونات', href: '#ingredients' },
    { name: lang === 'en' ? 'Our Story' : 'قصتنا', href: '#story' },
    { name: lang === 'en' ? 'Gift Sets' : 'الهدايا', href: '#gift-sets' },
    { name: lang === 'en' ? 'Contact' : 'اتصل بنا', href: '#contact' },
  ];

  return (
    <>
      <nav
        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 font-sans ${
          isScrolled
            ? 'bg-luxury-black/90 backdrop-blur-md py-4 border-b border-gold/15 shadow-2xl'
            : 'bg-transparent py-6'
        }`}
        id="luxury-navbar"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo Left */}
            <div className="flex-shrink-0">
              <a href="#home" className="flex flex-col select-none group" id="nav-logo">
                <span className="font-serif text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-gold text-gold-glow-subtle group-hover:text-ivory transition-colors duration-500">
                  {t.brand}
                </span>
                <span className="text-[8px] tracking-[0.45em] text-beige text-center block mt-0.5 font-sans">
                  {t.brandSubtitle}
                </span>
              </a>
            </div>

            {/* Navigation Links Center */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-beige/80 hover:text-gold transition-colors duration-300 relative group"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold group-hover:w-2/3 transition-all duration-500" />
                </a>
              ))}
            </div>

            {/* Utility Icons Right */}
            <div className="flex items-center gap-1.5 sm:gap-3.5">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-beige hover:text-gold hover:text-gold-glow-subtle transition-all duration-300 rounded-full hover:bg-gold/5"
                aria-label="Search Catalog"
                id="search-toggle-btn"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gold/10 bg-luxury-black/40 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-beige hover:text-gold hover:border-gold/30 transition-all duration-300"
                id="lang-switcher-btn"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>

              {/* Shopping Bag Button */}
              <button
                onClick={onCartToggle}
                className="relative p-2 text-beige hover:text-gold hover:text-gold-glow-subtle transition-all duration-300 rounded-full hover:bg-gold/5"
                aria-label="Open Cart"
                id="cart-toggle-btn"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 h-4.5 w-4.5 rounded-full bg-gold text-[9px] font-bold text-luxury-black flex items-center justify-center border border-luxury-gray animate-bounce font-sans">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-Screen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-luxury-black/95 backdrop-blur-md p-6 font-sans flex flex-col items-center justify-start pt-24" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute top-6 right-6 rounded-full border border-gold/15 bg-luxury-gray p-2.5 text-beige hover:text-gold transition-colors"
              id="close-search-overlay-btn"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-full max-w-2xl text-center space-y-6">
              <h3 className="font-serif text-lg tracking-widest text-gold uppercase">
                {lang === 'en' ? 'House of Al Faisal' : 'دار آل فيصل'}
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gold/25 focus:border-gold py-4 px-2 text-lg sm:text-2xl text-ivory placeholder-beige/30 outline-none transition-all duration-500 font-serif"
                  autoFocus
                  id="search-input-field"
                />
                <Search className="absolute right-3 top-4 text-gold/35 h-6 w-6" />
              </div>

              {/* Search Results Dropdown */}
              <div className="overflow-y-auto max-h-[55vh] w-full text-start space-y-3.5 pr-2">
                {searchQuery && filteredResults.length > 0 && (
                  <p className="text-xs text-gold/60 uppercase tracking-widest border-b border-gold/10 pb-2">
                    {t.resultsFound}
                  </p>
                )}

                {searchQuery && filteredResults.length === 0 && (
                  <p className="text-sm text-beige/50 italic text-center py-8 font-serif">
                    {t.noResults}
                  </p>
                )}

                {filteredResults.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onQuickView(f);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-gold/5 bg-luxury-gray/40 hover:border-gold/25 hover:bg-luxury-gray/80 transition-all duration-300 cursor-pointer group"
                    id={`search-result-${f.id}`}
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/10 bg-luxury-black flex items-center justify-center">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-medium text-ivory tracking-wide group-hover:text-gold transition-colors">
                        {lang === 'en' ? f.name : f.arabicName}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wider text-gold mt-0.5">
                        {lang === 'en' ? f.type : f.typeAr} • {f.price} {t.aed}
                      </p>
                      <p className="text-xs text-beige/50 truncate max-w-md mt-1 font-sans">
                        {lang === 'en' ? f.description : f.descriptionAr}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
