import React, { useState, useEffect } from 'react';
import { BookCurriculum, ModuleData, DynamicCoachingResult } from '../types/curriculum';
import { speechService } from '../services/speechService';
import { getDynamicCoachingTurn } from '../services/geminiService';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Flame,
  Feather,
  Radio
} from 'lucide-react';

interface ModuleReaderProps {
  book: BookCurriculum;
  moduleIndex: number;
  userState: Record<string, any>;
  onCompleteModuleTurn: (result: DynamicCoachingResult) => void;
  onGoToNextModule: () => void;
  onShowBlueprint: () => void;
  isAudioMuted: boolean;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Helper to provide pre-crafted reflection chips per book
const getPreCraftedChips = (bookId: string, moduleIdx: number): string[] => {
  switch (bookId) {
    case 'situated':
      if (moduleIdx === 0) return ['حذف گوشی از اتاق خواب', 'بستن تب‌های مرورگر قبل از خواب', 'تغییر محل نشستن در اتاق'];
      if (moduleIdx === 1) return ['گفت‌وگوی درونی منفی حین شکست', 'احساس نیاز به انجام همه کارها', 'تفسیر چالش به عنوان ناتوانی'];
      if (moduleIdx === 2) return ['بستن قرارداد تعهد با دوستم', 'پیوستن به گروه مطالعه عمیق', 'تعیین مربی و ناظر هفتگی'];
      return ['حذف محرک‌های وسوسه‌انگیز', 'ایجاد مانع فیزیکی غیرقابل بازگشت', 'تغییر آرایش میز کار'];

    case 'power-of-habit':
      if (moduleIdx === 0) return ['احساس خستگی در ساعت ۳ عصر', 'نوتیفیکیشن برنامه‌های پیام‌رسان', 'ورود به منزل بعد از کار'];
      if (moduleIdx === 1) return ['گشت‌وگذار ناخودآگاه در اینستاگرام', 'خوردن شیرینی با چای عصرانه', 'به تعویق انداختن شروع پروژه'];
      if (moduleIdx === 2) return ['نیاز به وقفه ذهنی ۵ دقیقه‌ای', 'تسکین اضطراب قبل از جلسه', 'نیاز به ارتباط اجتماعی با همکار'];
      return ['پیاده‌روی ۵ دقیقه‌ای به‌جای گوشی', 'نوشیدن یک لیوان آب خنک', '۳ تنفس عمیق شکمی'];

    case 'atomic-habits':
      if (moduleIdx === 0) return ['من نویسنده‌ای منظم هستم', 'من فردی سالم و پرانرژی هستم', 'من یادگیرنده‌ای متمرکز هستم'];
      if (moduleIdx === 1) return ['قرار دادن کتاب روی بالش صبحگاهی', 'پنهان کردن کنترل تلویزیون در کمد', 'آماده کردن قمقمه آب روی میز'];
      if (moduleIdx === 2) return ['بعد از نوشیدن چای صبح، ۲ صفحه بخوانم', 'بعد از نشستن پشت میز، برنامه روز را بنویسم', 'بعد از مسواک زدن، ۱ دقیقه حرکات کششی'];
      return ['فقط ۱ پاراگراف نوشتن', 'فقط ۲ دقیقه طناب زدن', 'فقط مرتب کردن میز'];

    case 'thinking-fast-slow':
      if (moduleIdx === 0) return ['قضاوت شتاب‌زده درباره پیام همکار', 'تصمیم آنی برای خرید آنلاین', 'پاسخ دادن هیجانی در بحث خانوادگی'];
      if (moduleIdx === 1) return ['فراموش کردن نرخ پایه آماری', 'تمرکز فقط بر اخبار و شواهد در دسترس', 'اطمینان کاذب بر اساس حس اولیه'];
      if (moduleIdx === 2) return ['قانون ۱۰ دقیقه توقف اجباری', 'نوشتن شواهد مخالف روی کاغذ', 'مشورت با یک ناظر بی‌طرف'];
      return ['پروتکل ۵ سؤال معکوس', 'بررسی نرخ مبنا قبل از تصمیم', 'تنفس عمیق و به تعویق انداختن ارسال'];

    case 'crucial-conversations':
      if (moduleIdx === 0) return ['میل به برنده شدن در بحث', 'ترس از به هم خوردن رابطه', 'دفاع از موضع شخصی به‌جای کشف حقیقت'];
      if (moduleIdx === 1) return ['سکوت گزنده و طعنه زدن', 'حمله کلامی و برچسب زدن', 'عقب‌نشینی منفعلانه'];
      if (moduleIdx === 2) return ['بیان هدف مشترک در آغاز گفت‌وگو', 'تأکید بر احترام و امنیت روانی', 'شفاف کردن نیت مثبت پنهان'];
      return ['طرح پرسش‌های باز و کنجکاوانه', 'ابراز درک احساسات طرف مقابل', 'تعیین مسئولیت‌ها و زمان‌بندی شفاف'];

    default:
      return ['تأمل در موقعیت واقعی', 'شناسایی نشانه آغازین', 'طراحی اقدام جایگزین'];
  }
};

export const ModuleReader: React.FC<ModuleReaderProps> = ({
  book,
  moduleIndex,
  userState,
  onCompleteModuleTurn,
  onGoToNextModule,
  onShowBlueprint,
  isAudioMuted,
}) => {
  const currentModule: ModuleData = book.modules[moduleIndex];
  const isLastModule = moduleIndex === book.modules.length - 1;
  const romanNumeral = ROMAN_NUMERALS[moduleIndex] || `No. ${moduleIndex + 1}`;

  const targetKey = currentModule.interactivePrompt.stateTargetKey;
  const initialAnswer = (userState && userState[targetKey]) ? String(userState[targetKey]) : '';

  const [userInput, setUserInput] = useState<string>(initialAnswer);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<DynamicCoachingResult | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showInscribeToast, setShowInscribeToast] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.5x' | 'flow'>('1x');

  const reflectionChips = getPreCraftedChips(book.id, moduleIndex);

  useEffect(() => {
    const existingAnswer = (userState && userState[currentModule.interactivePrompt.stateTargetKey])
      ? String(userState[currentModule.interactivePrompt.stateTargetKey])
      : '';
    setUserInput(existingAnswer);
    setCoachingResult(null);
    speechService.stop();
    setIsReadingAloud(false);

    if (!isAudioMuted) {
      const textToRead = `${currentModule.title}. ${currentModule.staticCoreLesson.headline} ${currentModule.staticCoreLesson.concept}`;
      speechService.speak(
        textToRead,
        () => setIsReadingAloud(false),
        () => setIsReadingAloud(false)
      );
      setIsReadingAloud(true);
    }

    return () => {
      speechService.stop();
      if (stopListeningFn) stopListeningFn();
    };
  }, [moduleIndex, book.id]);

  const handleSpeedChange = (speed: '1x' | '1.5x' | 'flow') => {
    setPlaybackSpeed(speed);
    if (speed === '1x') speechService.setRate(0.95);
    if (speed === '1.5x') speechService.setRate(1.35);
    if (speed === 'flow') speechService.setRate(1.75);
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

  const handleToggleReadAloud = (text: string) => {
    if (isReadingAloud) {
      speechService.stop();
      setIsReadingAloud(false);
    } else {
      setIsReadingAloud(true);
      speechService.speak(
        text,
        () => setIsReadingAloud(false),
        () => setIsReadingAloud(false)
      );
    }
  };

  const handleChipClick = (chipText: string) => {
    setUserInput((prev) => {
      if (!prev) return `در موقعیت من: ${chipText}، `;
      return `${prev} (تمرکز بر: ${chipText})`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    if (isListening && stopListeningFn) {
      stopListeningFn();
      setIsListening(false);
    }

    setIsLoading(true);
    setSpeechError(null);

    try {
      const result = await getDynamicCoachingTurn(
        book,
        currentModule,
        userInput.trim(),
        userState
      );

      setCoachingResult(result);
      onCompleteModuleTurn(result);

      setShowInscribeToast(true);
      setTimeout(() => setShowInscribeToast(false), 4000);

      if (!isAudioMuted && result.coaching_response) {
        speechService.speak(
          result.coaching_response,
          () => setIsReadingAloud(false),
          () => setIsReadingAloud(false)
        );
        setIsReadingAloud(true);
      }
    } catch (err) {
      console.error('Coaching turn failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative py-4 px-3 sm:px-6 max-w-4xl mx-auto space-y-6 pb-24 text-on-surface">
      {/* Candlelight Ambient Gradient Orbs */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-72 rounded-full bg-primary/10 blur-[80px]" />
      <div className="pointer-events-none absolute top-96 -right-20 w-72 h-72 rounded-full bg-secondary-container/20 blur-[90px]" />

      {/* Codex Sub-Navigation & Reading Telemetry */}
      <div className="w-full flex items-center justify-between z-10 pt-1 pb-2">
        {/* Folio Step Badge */}
        <div className="flex items-center gap-2 bg-surface-container-low/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-outline-variant/40 shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">auto_stories</span>
          <span className="font-garamond text-xs text-secondary font-bold tracking-wider">
            نسخه خطی {moduleIndex + 1} از {book.modules.length}
          </span>
          <span className="text-outline text-xs">·</span>
          <span className="font-sans text-[11px] text-primary-fixed-dim font-medium">
            {currentModule.frameworkStep}
          </span>
        </div>

        {/* Living Ink Speed & Atmosphere Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-surface-container-low/90 backdrop-blur-md p-0.5 rounded-full border border-outline-variant/40 shadow-sm">
            <button
              onClick={() => handleSpeedChange('1x')}
              className={`px-2.5 py-1 rounded-full text-xs font-garamond font-bold transition-all ${
                playbackSpeed === '1x'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="سرعت خوانش عادی"
            >
              1x
            </button>
            <button
              onClick={() => handleSpeedChange('1.5x')}
              className={`px-2.5 py-1 rounded-full text-xs font-garamond font-bold transition-all ${
                playbackSpeed === '1.5x'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="سرعت خوانش ۱.۵ برابر"
            >
              1.5x
            </button>
            <button
              onClick={() => handleSpeedChange('flow')}
              className={`px-2 py-1 rounded-full text-xs font-garamond font-bold flex items-center gap-0.5 transition-all ${
                playbackSpeed === 'flow'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="سرعت سریع (Flow)"
            >
              <span className="material-symbols-outlined text-[13px]">cyclone</span>
            </button>
          </div>

          {/* Atmosphere / TTS Audio Button */}
          <button
            onClick={() =>
              handleToggleReadAloud(
                `${currentModule.title}. ${currentModule.staticCoreLesson.headline} ${currentModule.staticCoreLesson.concept}`
              )
            }
            className="w-8 h-8 rounded-full bg-surface-container-low/90 backdrop-blur-md flex items-center justify-center text-primary border border-outline-variant/40 hover:bg-surface-container-high transition-all shadow-sm"
            title={isReadingAloud ? 'توقف صوت' : 'شنیدن صدای کتاب'}
          >
            {isReadingAloud ? (
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: THE LIVING PARCHMENT SHEET (Inside-of-the-Book Folio)          */}
      {/* ========================================================================= */}
      <article className="relative w-full rounded-2xl bg-[#f4eee0] text-[#1c2430] p-6 sm:p-9 shadow-[0_18px_50px_rgba(0,0,0,0.65),inset_0_0_40px_rgba(42,26,16,0.18)] overflow-hidden border border-[#d5c3aa]/40">
        {/* Simulated deckled edges, cotton paper tooth, and spine gutter shadow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
        
        {/* Right Spine Gutter Gradient (for RTL book reading experience) */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#20140c]/25 via-[#20140c]/10 to-transparent" />
        {/* Left Turning Edge Shadow */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/15 to-transparent" />
        {/* Inset Parchment Bevel Shadow */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.2)]" />

        {/* Top Page Rubric & Chapter Head */}
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <span className="font-garamond text-xs tracking-[0.22em] text-[#785b30] uppercase mb-1 font-bold">
            LIBER {romanNumeral} · TRACTATUS ANIMI · {book.titleEn || book.titleFa}
          </span>
          <h2 className="font-garamond text-2xl sm:text-3xl font-extrabold text-[#22180f] tracking-tight leading-snug">
            فصل {romanNumeral}: {currentModule.title}
          </h2>
          <div className="font-garamond text-xs tracking-[0.14em] text-[#846b4b] uppercase mt-1 font-bold">
            {currentModule.frameworkStep}
          </div>

          {/* Vintage Ornamental Flourish SVG Divider */}
          <svg aria-hidden="true" className="w-36 h-4 my-3 text-[#9d7d49]" fill="currentColor" viewBox="0 0 160 16">
            <path
              d="M80 0 C74 5 62 8 48 8 C38 8 20 4 12 1 C6 -1 0 5 0 8 C0 11 6 17 12 15 C20 12 38 8 48 8 C62 8 74 11 80 16 C86 11 98 8 112 8 C122 8 140 12 148 15 C154 17 160 11 160 8 C160 5 154 -1 148 1 C140 4 122 8 112 8 C98 8 86 5 80 0 Z"
              opacity="0.8"
            />
            <circle cx="80" cy="8" fill="#694b20" r="2.5" />
          </svg>
        </div>

        {/* Headline Quote Box (Iron-Gall Ink & Parchment Highlight) */}
        <div className="relative z-10 mb-6 bg-[#eee4d0]/90 border-r-4 border-[#8c6a35] pr-4 pl-3 py-3 rounded-l-lg shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="font-garamond text-lg sm:text-xl font-bold text-[#2a1d0f] leading-relaxed">
            «{currentModule.staticCoreLesson.headline}»
          </p>
        </div>

        {/* Concept Text with Historical Manuscript Layout */}
        <div className="relative z-10 space-y-4 font-vazir text-sm sm:text-base text-[#222933] leading-relaxed">
          <p className="first-letter:font-garamond first-letter:text-[34px] first-letter:font-bold first-letter:text-[#7d5c28] first-letter:ml-1.5 first-letter:float-right">
            {currentModule.staticCoreLesson.concept}
          </p>

          {/* Ink Bleed / Living Quill Dynamic Passage */}
          <div className="relative text-[#1e2e42] bg-[#364f6b]/5 border border-[#364f6b]/15 p-3.5 rounded-lg shadow-sm font-vazir">
            <span className="font-medium text-[#162744]">
              سیر مدل ذهنی در این بخش جاری است. مدل رفتاری زیر، ستون فقرات بازنویسی تصمیمات شماست:
            </span>
            {/* Living Golden Pulsing Quill Cursor */}
            <span className="inline-block relative w-4 h-5 mr-1.5 align-baseline text-primary">
              <span className="absolute bottom-0.5 right-0 w-[2.5px] h-4 bg-[#d4af37] animate-pulse rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <Feather className="w-3.5 h-3.5 absolute -top-1.5 -right-0.5 text-[#d4af37] animate-bounce" />
            </span>
          </div>
        </div>

        {/* Conceptual Illustration: Schematicus Mentis (The Arcane Schematic Canvas) */}
        {currentModule.staticCoreLesson.diagramSteps && (
          <div className="relative z-10 my-6 bg-[#eee4d0]/85 rounded-xl p-4 sm:p-5 border border-[#aa936d]/40 shadow-[inset_0_1px_4px_rgba(42,26,16,0.12)]">
            <div className="flex items-center justify-between mb-3 border-b border-[#aa936d]/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#7a5b28]">schema</span>
                <span className="font-garamond text-xs font-bold tracking-wider uppercase text-[#694e24]">
                  Schematicus Mentis: سیر منطقی مدل ذهنی
                </span>
              </div>
              <span className="font-garamond text-[11px] italic text-[#846b4b]">
                Anno Domini · فریم‌ورک علمی
              </span>
            </div>

            {/* Arcane Schematic SVG Visualizer */}
            <div className="relative w-full aspect-[21/9] max-h-48 flex items-center justify-center my-2">
              <svg className="w-full h-full max-w-md" fill="none" viewBox="0 0 340 120">
                {/* Circulating Alchemy Loop Background Path */}
                <path
                  d="M 30 60 C 90 20, 150 20, 170 60 C 190 100, 250 100, 310 60"
                  stroke="#796241"
                  strokeDasharray="4 4"
                  strokeOpacity="0.75"
                  strokeWidth="1.8"
                />
                <path
                  d="M 310 60 C 250 20, 190 20, 170 60 C 150 100, 90 100, 30 60"
                  stroke="#382914"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />

                {/* Dynamic Steps Rendered as Alchemical Nodes */}
                {currentModule.staticCoreLesson.diagramSteps.map((step, idx) => {
                  const xPos = 45 + idx * (250 / Math.max(1, currentModule.staticCoreLesson.diagramSteps!.length - 1));
                  const yPos = idx % 2 === 0 ? 55 : 65;
                  const nodeRoman = ROMAN_NUMERALS[idx] || `${idx + 1}`;

                  return (
                    <g key={idx} transform={`translate(${xPos}, ${yPos})`}>
                      {/* Outer Astrolabe Rings */}
                      <circle cx="0" cy="0" r="18" fill="#f8f4ea" stroke="#684e26" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="13" fill="#eee4d0" stroke="#8c6a35" strokeDasharray="2 2" strokeWidth="1" />
                      {/* Center Point */}
                      <circle cx="0" cy="0" r="2.5" fill="#d4af37" />
                      {/* Node Label Text */}
                      <text
                        x="0"
                        y={idx % 2 === 0 ? -22 : 28}
                        fill="#3f2c14"
                        fontFamily="'EB Garamond', serif"
                        fontSize="10"
                        fontWeight="bold"
                        letterSpacing="1"
                        textAnchor="middle"
                      >
                        {nodeRoman}. {step.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Step Descriptions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-[#aa936d]/20">
              {currentModule.staticCoreLesson.diagramSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#fcfaf3] border border-[#d5c3aa] rounded-lg p-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-center gap-1.5 font-garamond text-xs text-[#574236] font-bold mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#d4af37]/25 text-[#3c2f00] text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  <p className="text-xs text-[#3f382f] leading-relaxed font-vazir">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Annotative Callout Tag */}
            <div className="mt-3 text-center font-garamond text-xs sm:text-sm text-[#4f3c21] italic bg-[#fbf8f0]/95 border border-[#aa936d]/30 px-3 py-1.5 rounded-lg shadow-2xs">
              « نکته زرین: {currentModule.staticCoreLesson.keyTakeaway} »
            </div>
          </div>
        )}

        {/* Historical Scribe Notes & Micro-Marginalia */}
        <div className="relative z-10 pt-3 mt-4 border-t border-[#7d6542]/20 flex items-center justify-between text-[#7d6542] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">history_edu</span>
            <span className="font-garamond text-xs italic">
              ثبت‌شده در اسکریپتوریوم دانش‌پژوهان (Living Codex Ledger)
            </span>
          </div>
          <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
            <div className="w-5 h-5 rounded-full bg-[#1b263b] flex items-center justify-center text-[10px] text-primary shadow-xs font-semibold">
              A
            </div>
            <div className="w-5 h-5 rounded-full bg-[#3c2a1a] flex items-center justify-center text-[10px] text-[#dec1b1] shadow-xs font-semibold">
              M
            </div>
            <div className="w-5 h-5 rounded-full bg-[#203628] flex items-center justify-center text-[10px] text-[#a4d4b4] shadow-xs font-semibold">
              E
            </div>
            <div className="w-5 h-5 rounded-full bg-[#4a2e1e] flex items-center justify-center text-[10px] text-[#ffe088] shadow-xs font-semibold">
              I
            </div>
          </div>
        </div>
      </article>

      {/* ========================================================================= */}
      {/* SECTION 2: CO-WRITING HAND-OFF (Floating Translucent Scriptorium Dock)     */}
      {/* ========================================================================= */}
      <section className="relative w-full rounded-2xl bg-surface-container-high/90 backdrop-blur-xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] border border-primary/25">
        {/* Living Codex Question Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 border border-primary/30 text-primary">
            <span className="material-symbols-outlined text-[15px]">magic_button</span>
            <span className="font-garamond text-xs font-bold uppercase tracking-wider">
              The Living Book Asks · پرسش زندهٔ کتاب:
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-garamond text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-primary font-bold">Ink Wet · آمادهٔ تحریر</span>
          </div>
        </div>

        {/* Question Prompt */}
        <h3 className="font-garamond text-lg sm:text-xl text-on-surface mb-2 font-bold leading-relaxed">
          {currentModule.interactivePrompt.question}
        </h3>

        {currentModule.interactivePrompt.contextHint && (
          <p className="text-xs text-secondary mb-3 bg-surface-container-lowest/70 p-3 rounded-lg border border-outline-variant/30 font-vazir leading-relaxed">
            💡 راهنمای تفکر: {currentModule.interactivePrompt.contextHint}
          </p>
        )}

        {/* Pre-Crafted Reflection Chips (Instant Low-Friction Inspiration) */}
        <div className="mb-3">
          <div className="text-[11px] font-garamond text-outline font-semibold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>الهام‌بخش‌های سریع (برای درج کلیک کنید):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reflectionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors font-garamond text-xs flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[12px] text-primary">draw</span>
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Active Manuscript Input Area */}
          <div className="relative w-full rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary p-3.5 shadow-inner transition-all">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-primary mt-1">stylus</span>
              <div className="flex-1">
                <label className="block font-garamond text-xs text-outline uppercase tracking-wider mb-1 font-bold">
                  نگارش دست‌نویس شما در کالبد کتاب (Your Handwritten Inscription)
                </label>
                <textarea
                  rows={3}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={currentModule.interactivePrompt.placeholder}
                  className="w-full bg-transparent border-0 p-0 text-on-surface focus:outline-none resize-none font-vazir text-sm leading-relaxed placeholder:text-outline-variant"
                />
              </div>
            </div>
          </div>

          {speechError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-sans">
              <span className="material-symbols-outlined text-[15px]">error</span>
              <span>خطای تشخیص صوت: {speechError}</span>
            </div>
          )}

          {/* Action Button & Voice Scribe Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Free Speech Recognition Mic */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-sm ${
                isListening
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-surface-container border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/50'
              }`}
              title={isListening ? 'توقف ضبط صدا' : 'نگارش با قلم صوتی (رایگان)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Inscribe into Codex Primary Button */}
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-garamond font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(242,202,80,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] hover:shadow-gold-glow"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>در حال تحریر و ارزیابی مربی...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">ink_pen</span>
                  <span>ثبت در نسخه خطی (Inscribe into Codex)</span>
                </>
              )}
            </button>
          </div>

          {/* Toast Notification for Codex Merge */}
          {showInscribeToast && (
            <div className="p-2.5 rounded-lg bg-surface-container-highest border border-primary/40 text-primary font-garamond text-xs flex items-center justify-center gap-1.5 shadow-md animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>جوهر زنده در کالبد کتاب جاری و وضعیت شخصی شما به‌روز شد.</span>
            </div>
          )}
        </form>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: LIVING SCHOLAR MARGIN ANNOTATION (Dynamic AI Coaching Bridge) */}
      {/* ========================================================================= */}
      {coachingResult && (
        <section className="relative rounded-2xl bg-surface-container-high border-2 border-primary/50 p-6 sm:p-7 shadow-gold-glow animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/40">
                <Flame className="w-4 h-4 fill-primary" />
              </div>
              <div>
                <span className="font-garamond text-base font-bold text-primary block leading-none">
                  حکمت مربی هوش مصنوعی [SCHOLAR MARGIN ANNOTATION]
                </span>
                <span className="font-sans text-[10px] text-on-surface-variant">
                  تحلیل صریح و دقیق مبتنی بر علوم رفتاری (&lt;۱۵۰ کلمه)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleReadAloud(coachingResult.coaching_response)}
              className="p-2 rounded-full bg-surface-container border border-outline-variant/40 text-primary hover:text-white transition"
              title="شنیدن تحلیل صوتی مربی"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Coaching Response Body */}
          <div className="bg-surface-container-lowest/80 border border-outline-variant/40 rounded-xl p-4 mb-4">
            <p className="text-sm sm:text-base text-on-surface leading-relaxed font-vazir">
              {coachingResult.coaching_response}
            </p>
          </div>

          {/* Next Strategic Question / Action */}
          {coachingResult.next_question && (
            <div className="flex items-start gap-2 bg-primary/10 border border-primary/30 rounded-xl p-3.5 text-xs text-primary mb-5 font-vazir">
              <span className="font-bold font-garamond text-sm flex-shrink-0">گام راهبردی بعدی:</span>
              <span className="leading-relaxed">{coachingResult.next_question}</span>
            </div>
          )}

          {/* Proceed Button */}
          <div className="flex justify-end">
            {isLastModule ? (
              <button
                onClick={onShowBlueprint}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-garamond font-bold text-sm px-6 py-2.5 rounded-full shadow-gold-glow transition-all active:scale-95"
              >
                <span>مشاهده و دریافت سند زرین بلوپرینت</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToNextModule}
                className="flex items-center gap-2 bg-primary text-on-primary font-garamond font-bold text-sm px-5 py-2.5 rounded-full shadow-md transition-all active:scale-95 hover:bg-primary-container"
              >
                <span>گام بعدی در کتاب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
