import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppButtonProps {
  lang: 'en' | 'ar';
}

export default function WhatsAppButton({ lang }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '971500000000'; // dummy UAE premium number
  const message = lang === 'en' 
    ? 'Hello AL FAISAL Perfumes, I would like to inquire about your luxury fragrance collection and seek recommendation.'
    : 'مرحباً عطور آل فيصل، أود الاستفسار عن مجموعة عطوركم الحصرية والحصول على استشارة عطرية خاصة.';

  const handleChatStart = () => {
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 rounded-2xl border border-gold/20 bg-luxury-gray p-5 shadow-2xl backdrop-blur-xl"
            id="whatsapp-panel"
          >
            <div className="flex items-center justify-between border-b border-gold/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-500">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-luxury-gray animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-ivory tracking-wide">
                    {lang === 'en' ? 'Fragrance Advisor' : 'مستشار عطور آل فيصل'}
                  </h4>
                  <p className="text-[11px] text-emerald-500">
                    {lang === 'en' ? 'Online' : 'متصل بالإنترنت'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-beige/60 hover:text-gold transition-colors"
                aria-label="Close Advisor"
                id="close-whatsapp-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 rounded-xl bg-luxury-black/60 p-3.5 border border-gold/5">
              <p className="text-xs text-beige leading-relaxed">
                {lang === 'en' 
                  ? "Welcome to the Maison. I am here to assist you in discovering your signature scent, choosing a royal gift, or completing your custom order."
                  : "مرحباً بك في دار آل فيصل. أنا هنا لمساعدتك في اكتشاف بصمتك العطرية الخاصة، أو اختيار هدية فاخرة تليق بك."}
              </p>
            </div>

            <button
              onClick={handleChatStart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-xs font-semibold text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-lg shadow-gold/10"
              id="start-whatsapp-chat-btn"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'Begin Private Consultation' : 'بدء المحادثة الخاصة'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-luxury-gray text-gold shadow-2xl hover:bg-gold hover:text-luxury-black transition-all duration-500 relative group"
        id="whatsapp-floating-btn"
      >
        <span className="absolute inset-0 rounded-full border border-gold/60 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
