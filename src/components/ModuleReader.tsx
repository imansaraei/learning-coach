import React, { useState, useEffect } from 'react';
import { BookCurriculum, ModuleData, DynamicCoachingResult } from '../types/curriculum';
import { speechService } from '../services/speechService';
import { getDynamicCoachingTurn } from '../services/geminiService';
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Feather,
  Sparkles,
  Flame
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

  const targetKey = currentModule.interactivePrompt.stateTargetKey;
  const initialAnswer = (userState && userState[targetKey]) ? String(userState[targetKey]) : '';

  const [userInput, setUserInput] = useState<string>(initialAnswer);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<DynamicCoachingResult | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

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
    <div className="py-6 px-3 sm:px-4 max-w-3xl mx-auto space-y-6">
      {/* Chapter Indicator Ribbon */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-garamond text-sm text-primary font-bold tracking-wide">
            فصل {currentModule.id} از {book.modules.length}
          </span>
        </div>
        <span className="font-sans text-xs bg-surface-container-high border border-outline-variant/40 text-secondary px-3 py-1 rounded-full">
          {currentModule.frameworkStep}
        </span>
      </div>

      {/* SECTION 1: [STATIC CORE LESSON] (The Illuminated Manuscript Folio) */}
      <section className="relative rounded-2xl bg-surface-container border border-primary/30 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Subtle Ambient Gold Glow in Corner */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
                درس اصلی و مدل ذهنی [STATIC CORE LESSON]
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-garamond leading-snug">
              {currentModule.title}
            </h2>
          </div>

          <button
            onClick={() =>
              handleToggleReadAloud(
                `${currentModule.title}. ${currentModule.staticCoreLesson.headline} ${currentModule.staticCoreLesson.concept}`
              )
            }
            className="p-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface-variant hover:text-primary transition flex-shrink-0"
            title={isReadingAloud ? 'توقف صوت' : 'شنیدن صوتی درس'}
          >
            {isReadingAloud ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>

        {/* Headline Quote Box */}
        <div className="mb-5 bg-surface-container-lowest/80 border-r-3 border-primary pr-4 py-2.5 rounded-l-lg shadow-inner">
          <p className="text-base sm:text-lg font-garamond font-semibold text-primary leading-relaxed">
            «{currentModule.staticCoreLesson.headline}»
          </p>
        </div>

        {/* Concept Text */}
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6 font-vazir font-normal">
          {currentModule.staticCoreLesson.concept}
        </p>

        {/* Illuminated Diagram Steps */}
        {currentModule.staticCoreLesson.diagramSteps && (
          <div className="mb-6 bg-surface-container-lowest/60 border border-outline-variant/40 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-3 font-sans text-xs text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">schema</span>
              <span>سیر منطقی مدل ذهنی:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentModule.staticCoreLesson.diagramSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container border border-outline-variant/40 rounded-lg p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 font-garamond text-sm text-primary font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-vazir">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaway Box */}
        <div className="flex items-start gap-3 bg-surface-container-high/80 border border-primary/40 rounded-xl p-4 text-xs text-on-surface">
          <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-garamond text-sm font-bold text-primary block mb-0.5">
              نکته زرین (Key Takeaway):
            </span>
            <span className="text-on-surface-variant leading-relaxed">
              {currentModule.staticCoreLesson.keyTakeaway}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: [INTERACTIVE CHECKPOINT] (The Floating Quill Input Dock) */}
      <section className="relative rounded-2xl bg-surface-container border border-outline-variant/60 p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <span className="font-sans text-[11px] text-primary font-bold uppercase tracking-wider block">
                نگارش شخصی در اسکریپتوریوم [INTERACTIVE CHECKPOINT]
              </span>
              <span className="font-sans text-[10px] text-on-surface-variant">
                ورودی شما در وضعیت زنده سند ذخیره می‌شود
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-on-surface mb-2 font-garamond leading-relaxed">
          {currentModule.interactivePrompt.question}
        </h3>

        {currentModule.interactivePrompt.contextHint && (
          <p className="text-xs text-secondary mb-4 bg-surface-container-lowest/60 p-3 rounded-lg border border-outline-variant/30 font-vazir">
            💡 راهنما: {currentModule.interactivePrompt.contextHint}
          </p>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={currentModule.interactivePrompt.placeholder}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-sm text-on-surface placeholder:text-outline focus:outline-none transition resize-none leading-relaxed font-vazir shadow-inner"
            />

            {/* Voice Dictation (Quill Mic) */}
            <div className="absolute bottom-3 left-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-1.5 text-xs font-sans rounded-full border transition flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-surface-container border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/50'
                }`}
                title={isListening ? 'توقف ضبط صدا' : 'ورودی صوتی (رایگان)'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>در حال شنیدن...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>قلم صوتی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {speechError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-sans">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>خطای تشخیص صوت: {speechError}</span>
            </div>
          )}

          {/* Submit Gilded Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-sans text-outline hidden sm:inline">
              ردیابی کمینه‌گر وضعیت فعال است (&lt;$0.001 هزینه)
            </span>

            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-garamond font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(242,202,80,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:shadow-gold-glow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-on-primary" />
                  <span>تحلیل روان‌شناختی مربی...</span>
                </>
              ) : (
                <>
                  <span>ارزیابی و تحلیل مربی</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: [DYNAMIC AI COACHING BRIDGE] (Living Scholar Margin Annotation) */}
      {coachingResult && (
        <section className="relative rounded-2xl bg-surface-container-high border-2 border-primary/50 p-6 sm:p-8 shadow-gold-glow animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Flame className="w-4 h-4 fill-primary" />
              </div>
              <div>
                <span className="font-garamond text-base font-bold text-primary block leading-none">
                  حکمت مربی هوش مصنوعی [SCHOLAR ANNOTATION]
                </span>
                <span className="font-sans text-[10px] text-on-surface-variant">
                  تحلیل مبتنی بر علوم رفتاری (صریح و فاقد تملق، زیر ۱۵۰ کلمه)
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

          {/* Response Text */}
          <div className="bg-surface-container-lowest/80 border border-outline-variant/40 rounded-xl p-4 mb-4">
            <p className="text-sm sm:text-base text-on-surface leading-relaxed font-vazir">
              {coachingResult.coaching_response}
            </p>
          </div>

          {/* Next Guided Question */}
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
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-garamond font-bold text-sm px-6 py-2.5 rounded-xl shadow-gold-glow transition-all active:scale-95"
              >
                <span>مشاهده و دریافت سند زرین بلوپرینت</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToNextModule}
                className="flex items-center gap-2 bg-primary text-on-primary font-garamond font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
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
