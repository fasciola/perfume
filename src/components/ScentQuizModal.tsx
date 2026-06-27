import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
import { Fragrance } from '../types';
import { fragrances, translations } from '../data';

interface ScentQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddToCart: (fragrance: Fragrance) => void;
  onQuickView: (fragrance: Fragrance) => void;
}

interface Question {
  id: number;
  question: string;
  questionAr: string;
  options: {
    value: string;
    text: string;
    textAr: string;
    scores: string[]; // List of fragrance IDs that get points
  }[];
}

export default function ScentQuizModal({ isOpen, onClose, lang, onAddToCart, onQuickView }: ScentQuizModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendedFragrance, setRecommendedFragrance] = useState<Fragrance | null>(null);

  const t = translations[lang];

  const questions: Question[] = [
    {
      id: 1,
      question: "Which environment resonates most with your spirit?",
      questionAr: "أي الأجواء والبيئات تعكس روحك وتلهمك أكثر؟",
      options: [
        {
          value: 'desert',
          text: "Golden desert dunes at dusk, with dry warm winds and incense smoke.",
          textAr: "كثبان الصحراء الذهبية وقت الغسق، مع نسيم دافئ وعبق البخور الفاخر.",
          scores: ['oud-noir', 'encens-royal', 'safran-dor']
        },
        {
          value: 'oasis',
          text: "A cool, serene oasis garden under a sky filled with bright desert stars.",
          textAr: "واحة هادئة ومنعشة تحت سماء صافية مرصعة بنجوم الصحراء المضيئة.",
          scores: ['lavande-de-nuit', 'jasmin-blanc', 'rose-soft', 'rose-eternelle']
        },
        {
          value: 'palace',
          text: "Majestic palace chambers detailed with carved cedar, luxury silk, and warm resins.",
          textAr: "مجالس القصور المهيبة المصنوعة من خشب الأرز والحرير الفاخر والراتنجات الدافئة.",
          scores: ['santal-ambre', 'safran-dor', 'oud-noir']
        }
      ]
    },
    {
      id: 2,
      question: "How would you describe the aura you wish to project?",
      questionAr: "كيف تصف الهالة أو الطابع الذي تود تركه في الأذهان؟",
      options: [
        {
          value: 'mystical',
          text: "Mysterious, profound, and commanding deep respect in every room.",
          textAr: "غامض، مهيب، وعميق يفرض احترامه وهيبته في كل مجلس.",
          scores: ['oud-noir', 'encens-royal']
        },
        {
          value: 'radiant',
          text: "Radiantly warm, elegant, charismatic, and memorable.",
          textAr: "متوهج بالدفء، أنيق، ساحر الحضور، ويبقى طويلاً في الذاكرة.",
          scores: ['safran-dor', 'santal-ambre', 'rose-eternelle']
        },
        {
          value: 'serene',
          text: "Clean, peaceful, sophisticated, and perfectly balanced.",
          textAr: "نقي، هادئ، بالغ الأناقة ومتوازن النقاء والجاذبية.",
          scores: ['lavande-de-nuit', 'jasmin-blanc']
        }
      ]
    },
    {
      id: 3,
      question: "Which sacred ingredient holds the key to your memory?",
      questionAr: "أي النفحات العطرية تلامس ذاكرتك وتجذبك بشدة؟",
      options: [
        {
          value: 'agarwood',
          text: "Rare aged agarwood (oud) and mystical frankincense smoke.",
          textAr: "أخشاب العود النادرة والمعتقة ودخان اللبان العربي الفاخر.",
          scores: ['oud-noir', 'encens-royal']
        },
        {
          value: 'flowers',
          text: "Rich Damask rose petals and luminous night-blooming jasmine.",
          textAr: "بتلات الورد الدمشقي المخملية والياسمين الملكي فواح العبير.",
          scores: ['rose-eternelle', 'jasmin-blanc']
        },
        {
          value: 'woods',
          text: "Creamy warm sandalwood, dry cedarwood, and spicy saffron threads.",
          textAr: "خشب الصندل الكريمي الدافئ، خشب الأرز، وتوابل الزعفران المتقدة.",
          scores: ['santal-ambre', 'safran-dor', 'lavande-de-nuit']
        }
      ]
    }
  ];

  const handleOptionSelect = (optionValue: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = optionValue;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResult = () => {
    // Score map
    const scores: Record<string, number> = {};
    fragrances.forEach(f => { scores[f.id] = 0; });

    // Loop selected options
    answers.forEach((ansValue, index) => {
      const question = questions[index];
      const selectedOpt = question.options.find(o => o.value === ansValue);
      if (selectedOpt) {
        selectedOpt.scores.forEach(fid => {
          if (scores[fid] !== undefined) {
            scores[fid] += 1;
          }
        });
      }
    });

    // Find fragrance with highest score
    let highestScore = -1;
    let winnerId = fragrances[0].id;

    Object.entries(scores).forEach(([fid, score]) => {
      if (score > highestScore) {
        highestScore = score;
        winnerId = fid;
      }
    });

    const winner = fragrances.find(f => f.id === winnerId) || fragrances[0];
    setRecommendedFragrance(winner);
    setCurrentStep(questions.length); // Result step
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setRecommendedFragrance(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-md font-sans" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gold/20 bg-luxury-gray text-ivory shadow-2xl"
        id="scent-quiz-modal"
      >
        {/* Top Gold Bar Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-amber-gold to-gold" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 rounded-full border border-gold/10 bg-luxury-black/40 p-2 text-beige hover:text-gold hover:border-gold/30 transition-colors"
          aria-label="Close Quiz"
          id="close-quiz-modal-btn"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            {currentStep < questions.length ? (
              // Active Question Step
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: lang === 'ar' ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step indicator */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-serif text-xs uppercase tracking-widest text-gold">
                    {lang === 'en' ? `Question ${currentStep + 1} of ${questions.length}` : `السؤال ${currentStep + 1} من ${questions.length}`}
                  </span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-6 rounded-full transition-all duration-300 ${
                          i === currentStep ? 'bg-gold w-10' : 'bg-gold/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question title */}
                <h3 className="mb-6 font-serif text-xl font-medium tracking-wide text-ivory md:text-2xl">
                  {lang === 'en' ? questions[currentStep].question : questions[currentStep].questionAr}
                </h3>

                {/* Options list */}
                <div className="space-y-3.5 mb-8">
                  {questions[currentStep].options.map((opt) => {
                    const isSelected = answers[currentStep] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionSelect(opt.value)}
                        className={`w-full rounded-2xl border text-start p-4 md:p-5 transition-all duration-300 flex items-center justify-between group relative ${
                          isSelected
                            ? 'border-gold bg-gold/5 text-gold text-gold-glow-subtle'
                            : 'border-gold/10 bg-luxury-black/40 hover:border-gold/30 hover:bg-luxury-black/60 text-beige hover:text-ivory'
                        }`}
                        id={`quiz-option-${opt.value}`}
                      >
                        <span className="text-sm md:text-base leading-relaxed pr-4">
                          {lang === 'en' ? opt.text : opt.textAr}
                        </span>
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected ? 'border-gold bg-gold text-luxury-black' : 'border-gold/20'
                        }`}>
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between border-t border-gold/10 pt-6">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      currentStep === 0 ? 'text-beige/20 cursor-not-allowed' : 'text-beige hover:text-gold'
                    }`}
                    id="quiz-back-btn"
                  >
                    <ArrowLeft className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                    <span>{lang === 'en' ? 'Back' : 'السابق'}</span>
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!answers[currentStep]}
                    className={`flex items-center gap-2 rounded-xl py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                      answers[currentStep]
                        ? 'bg-gold text-luxury-black hover:bg-gold-dark cursor-pointer'
                        : 'bg-gold/10 text-gold/40 cursor-not-allowed border border-gold/5'
                    }`}
                    id="quiz-next-btn"
                  >
                    <span>{currentStep === questions.length - 1 ? (lang === 'en' ? 'Reveal Signature' : 'اكشف عن عطري') : (lang === 'en' ? 'Next' : 'التالي')}</span>
                    <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Result Step
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <span className="inline-block font-serif text-xs uppercase tracking-widest text-gold mb-2">
                  {lang === 'en' ? 'Your Olfactory Signature' : 'بصمتك العطرية الخاصة'}
                </span>
                
                <h3 className="font-serif text-3xl font-medium tracking-wide text-ivory mb-6 text-gold-glow">
                  {lang === 'en' ? recommendedFragrance?.name : recommendedFragrance?.arabicName}
                </h3>

                {recommendedFragrance && (
                  <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-gold/15 bg-luxury-black/40 p-4 md:p-6 text-start flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative h-44 w-36 overflow-visible shrink-0 bg-transparent flex items-center justify-center">
                      <img
                        src={recommendedFragrance.image}
                        alt={recommendedFragrance.name}
                        className="h-full w-full object-cover floating-island-mask floating-island-glow"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-serif text-xs uppercase tracking-widest text-gold">
                            {lang === 'en' ? recommendedFragrance.type : recommendedFragrance.typeAr}
                          </p>
                          <p className="text-[11px] text-beige mt-0.5">
                            {lang === 'en' ? recommendedFragrance.volume : '١٠٠ مل'}
                          </p>
                        </div>
                        <span className="font-sans text-sm font-semibold text-gold">
                          {recommendedFragrance.price} {t.aed}
                        </span>
                      </div>

                      <p className="text-xs text-beige/90 leading-relaxed line-clamp-3">
                        {lang === 'en' ? recommendedFragrance.description : recommendedFragrance.descriptionAr}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {(lang === 'en' ? recommendedFragrance.notes : recommendedFragrance.notesAr).map((note, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gold/5 border border-gold/10 py-0.5 px-2.5 text-[10px] text-gold tracking-wide"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (recommendedFragrance) {
                        onAddToCart(recommendedFragrance);
                        onClose();
                      }
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold py-3 px-8 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-gold-dark transition-all duration-300 shadow-xl shadow-gold/5"
                    id="quiz-add-to-bag-btn"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t.addToBag}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (recommendedFragrance) {
                        onQuickView(recommendedFragrance);
                      }
                    }}
                    className="w-full sm:w-auto rounded-xl border border-gold/20 bg-luxury-black/30 py-3 px-8 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
                    id="quiz-view-scent-btn"
                  >
                    {t.viewFragrance}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold text-beige/60 hover:text-gold transition-colors"
                    id="quiz-restart-btn"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'Retake Quiz' : 'إعادة الاختبار'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
