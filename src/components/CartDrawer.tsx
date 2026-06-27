import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { translations } from '../data';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  lang,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const t = translations[lang];

  // Calculate prices
  const calculateItemPrice = (item: CartItem) => {
    const basePrice = item.fragrance.price;
    // 50ml is 75% of 100ml base price (rounded)
    const sizePrice = item.size === '50ml' ? Math.round((basePrice * 0.75) / 5) * 5 : basePrice;
    return sizePrice * item.quantity;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + calculateItemPrice(item), 0);

  const handleCheckout = () => {
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setIsCheckoutSuccess(false);
      onClearCart();
      onClose();
    }, 4500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-luxury-black/70 backdrop-blur-sm"
              id="cart-backdrop"
            />

            {/* Sidebar content */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-luxury-gray border-l border-gold/15 flex flex-col shadow-2xl"
                id="cart-drawer-panel"
              >
                {/* Header */}
                <div className="p-6 border-b border-gold/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <h3 className="font-serif text-lg font-medium tracking-wide text-ivory">
                      {t.cartTitle}
                    </h3>
                    <span className="rounded-full bg-gold/10 border border-gold/20 py-0.5 px-2.5 text-xs text-gold font-sans font-medium">
                      {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-beige/60 hover:text-gold transition-colors"
                    aria-label="Close Bag"
                    id="close-cart-btn"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Main list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                      <div className="h-16 w-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/50">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <p className="text-sm text-beige/50 font-serif italic">
                        {t.cartEmpty}
                      </p>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div
                        key={`${item.fragrance.id}-${item.size}-${index}`}
                        className="rounded-2xl border border-gold/10 bg-luxury-black/40 p-4 flex gap-4 items-center relative group hover:border-gold/20 transition-all duration-300"
                        id={`cart-item-${index}`}
                      >
                        {/* Thumbnail */}
                        <div className="h-20 w-16 shrink-0 rounded-lg overflow-hidden border border-gold/10 bg-luxury-black flex items-center justify-center">
                          <img
                            src={item.fragrance.image}
                            alt={item.fragrance.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-serif text-sm font-medium tracking-wide text-ivory">
                                {lang === 'en' ? item.fragrance.name : item.fragrance.arabicName}
                              </h4>
                              <p className="text-[10px] text-gold font-serif tracking-widest uppercase">
                                {item.size === '50ml' ? (lang === 'en' ? '50ml' : '٥٠ مل') : (lang === 'en' ? '100ml' : '١٠٠ مل')}
                              </p>
                            </div>
                            <span className="font-sans text-xs font-semibold text-gold">
                              {calculateItemPrice(item)} {t.aed}
                            </span>
                          </div>

                          {/* Qty and Remove */}
                          <div className="flex items-center justify-between pt-1.5">
                            <div className="flex items-center justify-between rounded-lg border border-gold/10 bg-luxury-black/50 px-2.5 py-1 w-24 h-7">
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                className="text-beige/50 hover:text-gold transition-colors"
                                id={`cart-qty-dec-${index}`}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-semibold font-sans text-ivory">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                className="text-beige/50 hover:text-gold transition-colors"
                                id={`cart-qty-inc-${index}`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(index)}
                              className="text-beige/40 hover:text-red-500 transition-colors"
                              aria-label="Remove from bag"
                              id={`cart-item-remove-${index}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer and summary */}
                {cartItems.length > 0 && (
                  <div className="p-6 border-t border-gold/10 bg-luxury-black/60 space-y-5">
                    {/* GCC Express shipping message */}
                    <div className="flex gap-2.5 items-center rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <ShieldCheck className="h-4.5 w-4.5 text-gold shrink-0" />
                      <p className="text-[10px] text-beige leading-relaxed">
                        {t.freeShipping}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-baseline text-xs text-beige/70">
                        <span>{t.subtotal}</span>
                        <span className="font-sans">{subtotal} {t.aed}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-gold/10 pt-3">
                        <span className="font-serif font-medium text-sm tracking-wide text-ivory">{t.total}</span>
                        <span className="font-sans text-lg font-bold text-gold text-gold-glow-subtle">
                          {subtotal} {t.aed}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-xl bg-gold py-3.5 px-6 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-xl shadow-gold/5 flex items-center justify-center gap-2"
                      id="cart-checkout-btn"
                    >
                      <span>{t.checkout}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Success Modal */}
      <AnimatePresence>
        {isCheckoutSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/95 backdrop-blur-md font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full border border-gold/20 bg-luxury-gray rounded-3xl p-8 text-center space-y-5 shadow-2xl relative"
              id="checkout-success-modal"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-gold via-amber-gold to-gold absolute top-0 left-0 rounded-t-3xl" />
              
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-emerald-600/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>

              <h3 className="font-serif text-2xl font-semibold tracking-wide text-ivory text-gold-glow">
                {lang === 'en' ? 'Order Received' : 'تم استلام طلبكم بنجاح'}
              </h3>

              <p className="text-xs text-beige/80 leading-relaxed font-sans">
                {lang === 'en' 
                  ? 'Thank you for choosing the House of AL FAISAL Perfumes. Our luxury courier is preparing your exquisite scent selection. A confirmation has been sent to your email.'
                  : 'نشكركم على اختيار دار عطور آل فيصل الفاخرة. مندوب التوصيل الفاخر لدينا يقوم الآن بتجهيز طلبكم الفاتن. تم إرسال رسالة تأكيد إلى بريدكم الإلكتروني.'}
              </p>

              <div className="rounded-xl bg-luxury-black/40 p-4 border border-gold/5 text-xs text-gold font-mono tracking-widest">
                {lang === 'en' ? 'BOOKING ID: #AF-2026-9831' : 'رقم الطلب: #AF-2026-9831'}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
