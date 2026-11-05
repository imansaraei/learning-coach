import React, { useState, useEffect, useRef } from 'react';
import {
  BookCurriculum,
  ModuleData,
  DynamicCoachingResult,
  GeneratedModuleContent
} from '../types/curriculum';
import { speechService } from '../services/speechService';
import { generateCoachingResponse } from '../services/geminiService';
import { playPageTurnSound } from '../services/soundService';
import { LivingInkText } from './LivingInkText';
import {
  Mic,
  MicOff,
  Volume2,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Feather
} from 'lucide-react';

interface ModuleReaderProps {
  book: BookCurriculum;
  moduleIndex: number;
  userState: Record<string, any>;
  authoredModules?: Record<number, GeneratedModuleContent>;
  onCompleteModuleTurn: (result: DynamicCoachingResult) => void;
  onGoToNextModule: () => void;
  onShowBlueprint: () => void;
  onCloseBook: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Pre-crafted reflection sparks tailored for each book
const getPreCraftedSparks = (bookId: string, moduleIdx: number): string[] => {
  switch (bookId) {
    case 'situated':
      if (moduleIdx === 0) return ['حذف گوشی از اتاق خواب', 'بستن تب‌های مرورگر قبل از خواب', 'تغییر محل نشستن در اتاق'];
      if (moduleIdx === 1) return ['گفت‌وگوی درونی منفی حین شکست', 'احساس نیاز به انجام همه‌چیز', 'تفسیر چالش به عنوان ناتوانی'];
      return ['بستن قرارداد تعهد با دوستم', 'پیوستن به گروه مطالعه عمیق', 'تعیین مربی و ناظر هفتگی'];
    case 'power-of-habit':
      if (moduleIdx === 0) return ['احساس خستگی در ساعت ۳ عصر', 'نوتیفیکیشن برنامه‌های پیام‌رسان', 'ورود به منزل بعد از کار'];
      if (moduleIdx === 1) return ['گشت‌وگذار ناخودآگاه در گوشی', 'خوردن شیرینی با چای عصرانه', 'به تعویق انداختن شروع پروژه'];
      return ['نیاز به وقفه ذهنی ۵ دقیقه‌ای', 'تسکین اضطراب قبل از جلسه', 'نیاز به ارتباط اجتماعی با همکار'];
    case 'atomic-habits':
      if (moduleIdx === 0) return ['من نویسنده‌ای منظم هستم', 'من فردی سالم و پرانرژی هستم', 'من یادگیرنده‌ای متمرکز هستم'];
      if (moduleIdx === 1) return ['قرار دادن کتاب روی بالش صبحگاهی', 'پنهان کردن کنترل تلویزیون در کمد', 'آماده کردن قمقمه آب روی میز'];
      return ['بعد از نوشیدن چای صبح، ۲ صفحه بخوانم', 'بعد از نشستن پشت میز، برنامه روز را بنویسم', 'فقط ۱ پاراگراف نوشتن'];
    case 'thinking-fast-slow':
      if (moduleIdx === 0) return ['قضاوت شتاب‌زده درباره پیام همکار', 'تصمیم آنی برای خرید آنلاین', 'پاسخ دادن هیجانی در بحث'];
      if (moduleIdx === 1) return ['فراموش کردن نرخ پایه آماری', 'تمرکز فقط بر شواهد در دسترس (WYSIATI)', 'اطمینان کاذب بر اساس حس اولیه'];
      return ['قانون ۱۰ دقیقه توقف اجباری', 'نوشتن شواهد مخالف روی کاغذ', 'پروتکل بررسی ۵ سؤال معکوس'];
    case 'crucial-conversations':
      if (moduleIdx === 0) return ['میل به برنده شدن در بحث', 'ترس از به هم خوردن رابطه', 'دفاع از موضع شخصی به‌جای کشف حقیقت'];
      if (moduleIdx === 1) return ['سکوت گزنده و طعنه زدن', 'حمله کلامی و برچسب زدن', 'عقب‌نشینی منفعلانه'];
      return ['بیان هدف مشترک در آغاز گفت‌وگو', 'تأکید بر احترام و امنیت روانی', 'شفاف کردن نیت مثبت پنهان'];
    case 'creative-confidence':
      if (moduleIdx === 0) return ['ترس از قضاوت و تمسخر همکاران', 'وسواس کامل بودن قبل از شروع', 'حس این که من ذاتاً خلاق نیستم'];
      if (moduleIdx === 1) return ['اشتراک وویس ۳ دقیقه‌ای با دوستم', 'نوشتن پیش‌نویس بدون ویرایش', 'نشان دادن طرح به یک مخاطب امن'];
      return ['ساخت ماک‌آپ کاغذی در ۳۰ دقیقه', 'طراحی تست ۱ صفحه‌ای ایده', 'گرفتن بازخورد از ۳ کاربر تا فردا'];
    default:
      return ['تأمل در موقعیت واقعی', 'شناسایی نشانه آغازین', 'طراحی اقدام جایگزین'];
  }
};

// Helper to extract personalized user context for diagram steps
const getUserContextForStep = (
  stepLabel: string,
  userState: Record<string, any>
): string | null => {
  if (!userState || Object.keys(userState).length === 0) return null;

  const normalized = stepLabel.toLowerCase();

  const getVal = (keys: string[]): string | null => {
    for (const key of keys) {
      const val = userState[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
    return null;
  };

  let matched: string | null = null;

  if (normalized.includes('نشانه') || normalized.includes('cue')) {
    matched = getVal(['specific_cue', 'cue', 'cue_category']);
  } else if (normalized.includes('روتین') || normalized.includes('routine') || normalized.includes('پاسخ رفتاری')) {
    if (normalized.includes('جدید') || normalized.includes('سازنده') || normalized.includes('جایگزین')) {
      matched = getVal(['golden_rule_replacement_routine', 'action', 'new_routine']);
    } else {
      matched = getVal(['undesirable_routine', 'routine', 'target_behavior_box3']);
    }
  } else if (normalized.includes('پاداش') || normalized.includes('reward') || normalized.includes('اشتیاق') || normalized.includes('craving')) {
    matched = getVal(['real_craving_and_reward', 'reward', 'craving']);
  } else if (normalized.includes('هویت') || normalized.includes('identity')) {
    matched = getVal(['target_identity', 'identity']);
  } else if (normalized.includes('نتایج') || normalized.includes('outcomes')) {
    matched = getVal(['current_outcome_focus', 'outcome']);
  } else if (normalized.includes('لنگر') || normalized.includes('عادت فعلی') || normalized.includes('anchor')) {
    matched = getVal(['habit_stacking_rule', 'anchor']);
  } else if (normalized.includes('الحاق') || normalized.includes('عادت جدید') || normalized.includes('۲ دقیقه') || normalized.includes('2 دقیقه')) {
    matched = getVal(['two_minute_version', 'action']);
  } else if (normalized.includes('جعبه ۱') || normalized.includes('جعبه 1') || normalized.includes('عینی') || normalized.includes('بالادست') || normalized.includes('فضای شخصی')) {
    matched = getVal(['upstream_redesign_strategy', 'objective_environment_box1']);
  } else if (normalized.includes('جعبه ۲') || normalized.includes('جعبه 2') || normalized.includes('تفسیر')) {
    matched = getVal(['internal_interpretations_box2']);
  } else if (normalized.includes('جعبه ۳') || normalized.includes('جعبه 3') || normalized.includes('پایین‌دست')) {
    matched = getVal(['target_behavior_box3', 'undesirable_routine']);
  } else if (normalized.includes('سیستم ۱') || normalized.includes('سیستم 1')) {
    matched = getVal(['impulsive_decision_context', 'system1_triggers_and_heuristics']);
  } else if (normalized.includes('سیستم ۲') || normalized.includes('سیستم 2') || normalized.includes('وقفه')) {
    matched = getVal(['system2_interception_protocol']);
  } else if (normalized.includes('منافع بالا') || normalized.includes('گفتگو') || normalized.includes('high stakes')) {
    matched = getVal(['high_stakes_situation']);
  } else if (normalized.includes('انگیزه') || normalized.includes('هدف مشترک')) {
    matched = getVal(['mutual_purpose_definition']);
  } else if (normalized.includes('کنتراست') || normalized.includes('شفاف‌سازی')) {
    matched = getVal(['contrasting_statement_ready']);
  } else if (normalized.includes('همتا') || normalized.includes('پیرامون') || normalized.includes('مربی')) {
    const val = userState['applied_situational_levers'];
    if (Array.isArray(val) && val.length > 0) return val.join('، ');
    if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  }

  if (!matched) return null;

  const clean = matched.replace(/^["'«]+|["'»]+$/g, '').trim();
  return clean.length > 36 ? `${clean.slice(0, 33)}...` : clean;
};

export const ModuleReader: React.FC<ModuleReaderProps> = ({
  book,
  moduleIndex,
  userState,
  authoredModules,
  onCompleteModuleTurn,
  onGoToNextModule,
  onShowBlueprint,
  onCloseBook,
  isAudioMuted,
  onToggleAudioMute,
}) => {
  const currentModule: ModuleData = book.modules[moduleIndex];
  const isLastModule = moduleIndex === book.modules.length - 1;
  const romanNumeral = ROMAN_NUMERALS[moduleIndex] || `No. ${moduleIndex + 1}`;

  const generatedContent = authoredModules?.[moduleIndex];
  const effectiveLesson = generatedContent
    ? {
        headline: generatedContent.headline,
        concept: generatedContent.concept,
        keyTakeaway: generatedContent.keyTakeaway,
        diagramSteps: generatedContent.diagramSteps?.map((s) => ({
          label: s.label,
          description: s.desc,
        })) || currentModule.staticCoreLesson.diagramSteps,
      }
    : currentModule.staticCoreLesson;

  const effectivePrompt = generatedContent
    ? {
        question: generatedContent.question,
        placeholder: generatedContent.placeholder || currentModule.interactivePrompt.placeholder,
        stateTargetKey: currentModule.interactivePrompt.stateTargetKey,
      }
    : currentModule.interactivePrompt;

  const targetKey = effectivePrompt.stateTargetKey;
  const initialAnswer = (userState && userState[targetKey]) ? String(userState[targetKey]) : '';

  const [userInput, setUserInput] = useState<string>(initialAnswer);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<DynamicCoachingResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Responsive book spread state (Double-page horizontal vs single-page vertical)
  const [isDoublePage, setIsDoublePage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768 && window.innerWidth > window.innerHeight;
  });

  // Mobile/Single page sub-leaf: 0 = Lesson & Diagram, 1 = Living Inscription & Response
  const [mobileLeaf, setMobileLeaf] = useState<0 | 1>(0);

  // Page turn flip state & direction
  const [isTurningPage, setIsTurningPage] = useState<boolean>(false);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');

  const reflectionSparks = getPreCraftedSparks(book.id, moduleIndex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth >= 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsDoublePage(wide || (landscape && window.innerWidth >= 640));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    const existingAnswer = (userState && userState[effectivePrompt.stateTargetKey])
      ? String(userState[effectivePrompt.stateTargetKey])
      : '';
    setUserInput(existingAnswer);
    setCoachingResult(null);
    setMobileLeaf(0);
    speechService.stop();

    if (!isAudioMuted) {
      const textToRead = `${currentModule.title}. ${effectiveLesson.headline} ${effectiveLesson.concept}`;
      speechService.speak(textToRead);
    }

    return () => {
      speechService.stop();
      if (stopListeningFn) stopListeningFn();
    };
  }, [moduleIndex, book.id]);

  const triggerPageTurn = (action: () => void, direction: 'forward' | 'backward' = 'forward') => {
    setTurnDirection(direction);
    setIsTurningPage(true);
    playPageTurnSound();
    setTimeout(() => {
      action();
      setTimeout(() => {
        setIsTurningPage(false);
      }, 40);
    }, 360);
  };

  const toggleListening = () => {
    if (isListening) {
      if (stopListeningFn) stopListeningFn();
      setIsListening(false);
      setStopListeningFn(null);
    } else {
      setSpeechError(null);
      const stop = speechService.startListening(
        (transcript) => {
          setUserInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (listeningState) => setIsListening(listeningState),
        (err) => {
          setSpeechError(err);
          setIsListening(false);
        }
      );
      setStopListeningFn(() => stop);
    }
  };

  const handleSparkClick = (sparkText: string) => {
    setUserInput((prev) => {
      if (!prev) return `در موقعیت من: ${sparkText}، `;
      return `${prev} (تمرکز بر: ${sparkText})`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmitInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    if (isListening && stopListeningFn) {
      stopListeningFn();
      setIsListening(false);
    }

    setIsLoading(true);
    setSpeechError(null);

    try {
      const nextModule = book.modules[moduleIndex + 1] || null;
      const result = await generateCoachingResponse(
        book,
        currentModule,
        userInput.trim(),
        userState,
        nextModule
      );

      setCoachingResult(result);
      onCompleteModuleTurn(result);

      if (!isAudioMuted && result.coaching_response) {
        speechService.speak(result.coaching_response);
      }
    } catch (err) {
      console.error('Inscription coaching turn failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // RIGHT PAGE CONTENT (Lesson & Schematicus Mentis)
  // =========================================================================
  const renderRightPage = () => (
    <div className="w-full h-full flex flex-col justify-between select-text p-6 sm:p-9 relative">
      {/* Top Folio Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#aa936d]/30 pb-2 mb-4">
          <span className="font-garamond text-xs tracking-[0.2em] text-[#785b30] uppercase font-bold">
            LIBER {romanNumeral} · {book.titleEn.split(':')[0]}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (speechService.isSpeaking()) {
                  speechService.stop();
                } else {
                  speechService.speak(`${currentModule.title}. ${effectiveLesson.headline} ${effectiveLesson.concept}`);
                }
              }}
              className="text-[#785b30] hover:text-[#996515] px-2 py-0.5 rounded-full hover:bg-[#aa936d]/20 border border-[#aa936d]/30 transition-all cursor-pointer flex items-center gap-1"
              title="پخش/توقف صوت طبیعی فارسی"
            >
              <Volume2 className="w-3 h-3" />
              <span className="text-[10px] font-sans font-medium">صوت طبیعی</span>
            </button>
            <span className="font-garamond text-xs text-[#846b4b] italic">
              فصل {romanNumeral}: {currentModule.frameworkStep}
            </span>
          </div>
        </div>

        {/* Chapter Title */}
        <h2 className="font-garamond text-2xl sm:text-3xl font-extrabold text-[#22180f] tracking-tight leading-snug mb-2">
          {currentModule.title}
        </h2>

        {/* Vintage Ornamental Flourish */}
        <svg aria-hidden="true" className="w-28 h-3 text-[#9d7d49] mb-3" fill="currentColor" viewBox="0 0 160 16">
          <path
            d="M80 0 C74 5 62 8 48 8 C38 8 20 4 12 1 C6 -1 0 5 0 8 C0 11 6 17 12 15 C20 12 38 8 48 8 C62 8 74 11 80 16 C86 11 98 8 112 8 C122 8 140 12 148 15 C154 17 160 11 160 8 C160 5 154 -1 148 1 C140 4 122 8 112 8 C98 8 86 5 80 0 Z"
            opacity="0.8"
          />
          <circle cx="80" cy="8" fill="#694b20" r="2.5" />
        </svg>

        {/* Headline Quote (Iron-Gall Ink) */}
        <div className="mb-4 pr-3 border-r-3 border-[#8c6a35]">
          <p className="font-garamond text-base sm:text-lg font-bold text-[#2a1d0f] leading-relaxed">
            «{effectiveLesson.headline}»
          </p>
        </div>

        {/* Core Lesson Concept (Tom Riddle's Diary Living Ink Effect) */}
        <div className="font-vazir text-xs sm:text-sm text-[#222933] leading-relaxed mb-4">
          <LivingInkText
            key={`concept-${book.id}-${moduleIndex}`}
            text={effectiveLesson.concept}
            speedMs={25}
            inkColor="#222933"
          />
        </div>
      </div>

      {/* Classical Manuscript Engraving: Diagram of Behavioral Structure */}
      {effectiveLesson.diagramSteps && (
        <div className="my-auto bg-[#eee4d0]/90 rounded-xl p-3 sm:p-4 border border-[#aa936d]/40 shadow-[inset_0_1px_3px_rgba(42,26,16,0.12)]">
          <div className="flex items-center justify-between border-b border-[#aa936d]/30 pb-1.5 mb-2">
            <span className="font-garamond text-xs font-bold text-[#694e24] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] opacity-80">account_tree</span>
              <span>طرح‌وارهٔ ساختار رفتار</span>
            </span>
            <span className="font-garamond text-[11px] text-[#846b4b] italic">
              {currentModule.frameworkStep.split(':')[0]}
            </span>
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(effectiveLesson.diagramSteps.length, 4)}, minmax(0, 1fr))`,
            }}
          >
            {effectiveLesson.diagramSteps.map((step, idx) => {
              const userAnnotation = getUserContextForStep(step.label, userState);
              return (
                <div
                  key={idx}
                  className="bg-[#fcfaf3] border border-[#d5c3aa] rounded-md p-2 flex flex-col justify-between shadow-2xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1 font-garamond text-xs text-[#574236] font-bold mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-[#d4af37]/30 text-[#3c2f00] text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>

                    {userAnnotation && (
                      <div
                        className="my-1 px-1.5 py-0.5 rounded bg-[#e8dbc3]/70 border border-[#c4ae8f]/50 text-[10px] text-[#1c2430] font-vazir font-semibold leading-tight line-clamp-1"
                        title={userAnnotation}
                      >
                        «{userAnnotation}»
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#3f382f] leading-snug font-vazir line-clamp-2 mt-0.5">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-center font-garamond text-[11px] text-[#4f3c21] italic bg-[#fbf8f0]/95 px-2 py-1 rounded border border-[#aa936d]/20">
            « {effectiveLesson.keyTakeaway} »
          </div>
        </div>
      )}

      {/* Bottom Folio Marking */}
      <div className="flex items-center justify-between pt-2 border-t border-[#aa936d]/25 text-xs text-[#7d6542] font-garamond">
        <span>صحیفه {moduleIndex * 2 + 1}</span>
        {!isDoublePage && (
          <button
            onClick={() => triggerPageTurn(() => setMobileLeaf(1), 'forward')}
            className="flex items-center gap-1 text-xs font-bold text-[#694e24] hover:text-[#22180f] transition-colors"
          >
            <span>ورق زدن به صفحه تحریر</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // LEFT PAGE CONTENT (Inscribed Diary & Living Scribe Dialogue - No Dialog Box)
  // =========================================================================
  const renderLeftPage = () => (
    <div className="w-full h-full flex flex-col justify-between select-text p-6 sm:p-9 relative">
      {/* Top Header of Inscription Page */}
      <div>
        <div className="flex items-center justify-between border-b border-[#aa936d]/30 pb-2 mb-3">
          <span className="font-garamond text-xs tracking-[0.15em] text-[#785b30] font-bold">
            {book.titleFa}
          </span>
          <span className="font-garamond text-xs text-[#846b4b] italic">
            صحیفهٔ تحریر و تأمل
          </span>
        </div>

        {/* The Living Book Inquires: Inscribed directly in iron-gall ink */}
        <div className="mb-3">
          <h3 className="font-garamond text-base sm:text-lg font-bold text-[#1c2430] leading-snug">
            <LivingInkText
              key={`question-${book.id}-${moduleIndex}`}
              text={effectivePrompt.question}
              speedMs={20}
              inkColor="#1c2430"
            />
          </h3>
        </div>

        {/* Quick Inspiration Sparks (appear like faint pencil notes) */}
        {!coachingResult && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {reflectionSparks.map((spark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSparkClick(spark)}
                  className="px-2.5 py-1 rounded-full bg-[#eee4d0]/80 hover:bg-[#e4d7bf] border border-[#d5c3aa] text-[#694e24] hover:text-[#22180f] font-garamond text-xs flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[11px]">draw</span>
                  <span>{spark}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ruled Parchment Notebook Lines (User writes directly on the paper) */}
        <form onSubmit={handleSubmitInscription} className="space-y-3">
          <div className="relative w-full rounded-lg bg-[#eee4d0]/30 border border-[#d5c3aa]/70 p-3 shadow-inner">
            <textarea
              ref={textareaRef}
              rows={coachingResult ? 2 : 4}
              value={userInput}
              disabled={isLoading || Boolean(coachingResult)}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={effectivePrompt.placeholder}
              className="w-full bg-transparent border-0 p-0 text-[#1c2430] font-vazir text-xs sm:text-sm leading-relaxed outline-none resize-none placeholder:text-[#9d7d49]/70 disabled:opacity-85"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(170, 147, 109, 0.25) 27px, rgba(170, 147, 109, 0.25) 28px)',
                lineHeight: '28px',
              }}
            />

            {/* Inline Action Tools on the Page */}
            {!coachingResult && (
              <div className="flex items-center justify-between pt-2 border-t border-[#d5c3aa]/40">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-full border transition-all ${
                    isListening
                      ? 'bg-rose-900 text-rose-100 border-rose-600 animate-pulse'
                      : 'bg-[#fcfaf3] border-[#d5c3aa] text-[#785b30] hover:text-[#22180f]'
                  }`}
                  title={isListening ? 'توقف ضبط' : 'نگارش با قلم صوتی'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="submit"
                  disabled={!userInput.trim() || isLoading}
                  className="px-4 py-1.5 rounded-full bg-[#20140c] text-[#f2ca50] font-garamond font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#342014] transition-all active:scale-95 disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      <span>نفوذ جوهر در الیاف کاغذ...</span>
                    </>
                  ) : (
                    <>
                      <Feather className="w-3.5 h-3.5" />
                      <span>ثبت بر صفحه</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {speechError && (
            <p className="text-[11px] text-rose-700 font-sans">{speechError}</p>
          )}
        </form>

        {/* Scholar Living Ink Annotation (bleeds naturally into paper) */}
        {coachingResult && (
          <div className="mt-3 pt-2.5 border-t border-[#aa936d]/40 animate-in fade-in duration-500">
            <div className="bg-[#eee4d0]/60 border-r-3 border-[#785b30] pr-3 py-2 rounded-l-md font-vazir text-xs sm:text-sm text-[#162744] leading-relaxed mb-1.5">
              <LivingInkText
                text={coachingResult.coaching_response}
                speedMs={20}
                inkColor="#162744"
              />
            </div>

            {coachingResult.next_question && (
              <p className="font-garamond text-xs text-[#5c4738] italic pr-2 mt-1 font-semibold">
                « {coachingResult.next_question} »
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation of Left Page */}
      <div className="flex items-center justify-between pt-2 border-t border-[#aa936d]/25 text-xs text-[#7d6542] font-garamond">
        <span>صحیفه {moduleIndex * 2 + 2}</span>

        {coachingResult ? (
          isLastModule ? (
            <button
              onClick={() => triggerPageTurn(onShowBlueprint, 'forward')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#8c2a1e] text-[#ffe088] font-bold text-xs shadow-md hover:bg-[#a63325] transition-all active:scale-95"
            >
              <span>ورق زدن به طومار زرین بلوپرینت</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => triggerPageTurn(onGoToNextModule, 'forward')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#20140c] text-[#f2ca50] font-bold text-xs shadow-md hover:bg-[#342014] transition-all active:scale-95"
            >
              <span>ورق زدن به فصل بعد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )
        ) : !isDoublePage ? (
          <button
            onClick={() => triggerPageTurn(() => setMobileLeaf(0), 'backward')}
            className="flex items-center gap-1 text-xs font-bold text-[#694e24] hover:text-[#22180f] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>برگ قبلی درس</span>
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center relative bg-[#0e1013] select-none p-2 sm:p-5">
      {/* Warm Ambient Candlelight & Mahogany Desk Halo */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#574236]/15 blur-[100px]" />

      {/* Discreet Silk Bookmark Ribbon to Close Book (at top corner outside the page) */}
      <div className="absolute top-0 right-6 z-40 flex items-center gap-3">
        {/* Subtle Audio Mute/Unmute toggle */}
        <button
          onClick={onToggleAudioMute}
          className="mt-2 p-2 rounded-full bg-[#1e2023]/80 backdrop-blur-md text-[#d5c3aa] hover:text-[#f2ca50] border border-[#4d4635]/40 transition-colors shadow-md"
          title={isAudioMuted ? 'فعال‌سازی خوانش صوتی' : 'بی‌صدا کردن خوانش'}
        >
          <Volume2 className={`w-4 h-4 ${isAudioMuted ? 'opacity-40' : 'text-primary'}`} />
        </button>

        {/* Hanging Bookmark Ribbon */}
        <button
          onClick={onCloseBook}
          className="group relative flex flex-col items-center pt-0 transition-transform active:translate-y-1"
          title="بستن کتاب و بازگشت به قفسه کتابخانه"
        >
          <div className="w-6 h-12 sm:h-14 bg-[#93000a] text-white rounded-b-sm shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center pb-1 border-x border-[#ffdad6]/20">
            <Bookmark className="w-3.5 h-3.5 text-[#ffe088] mt-1" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffe088]" />
          </div>
          <span className="font-garamond text-[10px] text-[#dec1b1] group-hover:text-primary mt-1 font-bold">
            بستن کتاب
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* THE PHYSICAL NON-SCROLLABLE CODEX (Double-Page vs Single-Page)             */}
      {/* ========================================================================= */}
      <div
        className={`relative preserve-3d transition-all duration-300 ${
          isDoublePage
            ? 'w-full max-w-5xl h-[88vh] max-h-[720px] flex shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_90px_rgba(25,16,10,0.5)] rounded-2xl overflow-hidden border border-[#523e2b]/60'
            : 'w-full max-w-md h-[92vh] flex shadow-2xl rounded-xl overflow-hidden border border-[#523e2b]/60'
        }`}
        style={{ perspective: '1200px' }}
      >
        {isDoublePage ? (
          <>
            {/* RIGHT PAGE (In RTL: Leaf A - Classical Chapter Lesson) */}
            <div
              className={`w-1/2 h-full bg-[#f4eee0] relative overflow-hidden rounded-r-xl border-r border-[#d5c3aa] transition-transform ${
                isTurningPage && turnDirection === 'backward' ? 'page-turn-curl-right' : ''
              }`}
            >
              {/* Paper Tooth Texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
              {/* Spine Gutter Shadow (Left edge of Right Page) */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#20140c]/25 via-[#20140c]/10 to-transparent z-10" />
              {/* Outer Deckle Shadow */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#20140c]/15 to-transparent z-10" />
              {isTurningPage && turnDirection === 'backward' && (
                <div className="page-curl-shadow-overlay-right" />
              )}
              {renderRightPage()}
            </div>

            {/* CENTER SPINE CREASE (Binding Valley) */}
            <div className="w-6 h-full bg-gradient-to-r from-[#20140c]/20 via-[#120a05]/45 to-[#20140c]/20 absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" />

            {/* LEFT PAGE (In RTL: Leaf B - Inscription & Living Scholar Commentary) */}
            <div
              className={`w-1/2 h-full bg-[#f4eee0] relative overflow-hidden rounded-l-xl border-l border-[#d5c3aa] transition-transform ${
                isTurningPage && turnDirection === 'forward' ? 'page-turn-curl-left' : ''
              }`}
            >
              {/* Paper Tooth Texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
              {/* Spine Gutter Shadow (Right edge of Left Page) */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#20140c]/25 via-[#20140c]/10 to-transparent z-10" />
              {/* Outer Deckle Shadow */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/15 to-transparent z-10" />
              {isTurningPage && turnDirection === 'forward' && (
                <div className="page-curl-shadow-overlay-left" />
              )}
              {renderLeftPage()}
            </div>
          </>
        ) : (
          /* SINGLE PAGE (Mobile / Vertical View) */
          <div
            className={`w-full h-full bg-[#f4eee0] relative overflow-hidden rounded-xl border border-[#d5c3aa] transition-transform ${
              isTurningPage
                ? turnDirection === 'forward'
                  ? 'page-turn-curl-left'
                  : 'page-turn-curl-right'
                : ''
            }`}
          >
            {/* Paper Tooth Texture */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
            {/* Right Spine Gutter */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-7 bg-gradient-to-l from-[#20140c]/20 via-[#20140c]/10 to-transparent z-10" />
            {/* Left Edge Shadow */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/12 to-transparent z-10" />
            {isTurningPage && (
              <div
                className={
                  turnDirection === 'forward'
                    ? 'page-curl-shadow-overlay-left'
                    : 'page-curl-shadow-overlay-right'
                }
              />
            )}
            {mobileLeaf === 0 ? renderRightPage() : renderLeftPage()}
          </div>
        )}
      </div>
    </div>
  );
};
