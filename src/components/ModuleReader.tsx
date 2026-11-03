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
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  AlertCircle
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

  // Local state
  const targetKey = currentModule.interactivePrompt.stateTargetKey;
  const initialAnswer = (userState && userState[targetKey]) ? String(userState[targetKey]) : '';

  const [userInput, setUserInput] = useState<string>(initialAnswer);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<DynamicCoachingResult | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Sync state when module index changes
  useEffect(() => {
    const existingAnswer = (userState && userState[currentModule.interactivePrompt.stateTargetKey])
      ? String(userState[currentModule.interactivePrompt.stateTargetKey])
      : '';
    setUserInput(existingAnswer);
    setCoachingResult(null);
    speechService.stop();
    setIsReadingAloud(false);

    // If audio not muted, read core lesson summary
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

  // Voice Input Toggle
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

  // Read aloud toggle for lesson or coach
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

  // Submit Answer to Dynamic AI Coaching Bridge
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

      // Optionally auto-speak coach response
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
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-6">
      {/* Module Navigation & Framework Step Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
        <span className="font-semibold text-teal-400">
          ماژول {currentModule.id} از {book.modules.length}
        </span>
        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
          {currentModule.frameworkStep}
        </span>
      </div>

      {/* SECTION 1: [STATIC CORE LESSON] */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-teal-400 tracking-wider uppercase">
              درس اصلی و مدل ذهنی [STATIC CORE LESSON]
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentModule.title}
            </h2>
          </div>

          <button
            onClick={() =>
              handleToggleReadAloud(
                `${currentModule.title}. ${currentModule.staticCoreLesson.headline} ${currentModule.staticCoreLesson.concept}`
              )
            }
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-teal-300 transition flex-shrink-0"
            title={isReadingAloud ? 'توقف صوت' : 'شنیدن صوتی درس'}
          >
            {isReadingAloud ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-400" />
            )}
          </button>
        </div>

        {/* Headline */}
        <p className="text-sm sm:text-base font-semibold text-teal-200 mb-4 bg-teal-950/30 border-r-2 border-teal-400 pr-3 py-1 rounded-l">
          {currentModule.staticCoreLesson.headline}
        </p>

        {/* Concept Text */}
        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {currentModule.staticCoreLesson.concept}
        </p>

        {/* Mental Model Diagram Steps */}
        {currentModule.staticCoreLesson.diagramSteps && (
          <div className="mb-5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] font-bold text-slate-400 mb-2.5 block">
              سازوکار مدل ذهنی:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentModule.staticCoreLesson.diagramSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 font-bold text-teal-400 text-xs mb-1">
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaway Box */}
        <div className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-200">
          <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300 block mb-0.5">نکته کلیدی:</span>
            <span>{currentModule.staticCoreLesson.keyTakeaway}</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: [INTERACTIVE CHECKPOINT & USER INPUT] */}
      <section className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-bold text-teal-400">
            گام تعاملی شخصی‌سازی [INTERACTIVE CHECKPOINT]
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-relaxed">
          {currentModule.interactivePrompt.question}
        </h3>

        {currentModule.interactivePrompt.contextHint && (
          <p className="text-xs text-slate-400 mb-4 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            💡 راهنما: {currentModule.interactivePrompt.contextHint}
          </p>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={currentModule.interactivePrompt.placeholder}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition resize-none leading-relaxed"
            />

            {/* Voice Input Button inside textarea container */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-teal-300 hover:bg-slate-800'
                }`}
                title={isListening ? 'توقف ضبط صدا' : 'ورودی صوتی با میکروفون (رایگان)'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span className="text-[11px]">در حال شنیدن...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">ورودی صوتی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {speechError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>خطای تشخیص صوت: {speechError}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              پاسخ شما به طور فشرده در وضعیت شخصی (USER_STATE_JSON) ثبت می‌شود.
            </span>

            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تحلیل مربی...</span>
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

      {/* SECTION 3: [DYNAMIC AI COACHING BRIDGE] */}
      {coachingResult && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border-2 border-teal-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-300">
                  تحلیل مربی هوش مصنوعی [DYNAMIC AI COACHING]
                </span>
                <span className="text-[10px] text-slate-400 block">
                  طراحی‌شده بر پایه علوم رفتاری (بدون تملق، حداکثر ۱۵۰ کلمه)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleReadAloud(coachingResult.coaching_response)}
              className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-teal-400 hover:text-teal-300 transition"
              title="شنیدن تحلیل صوتی مربی"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Coaching Response Body */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-100 leading-relaxed font-normal">
              {coachingResult.coaching_response}
            </p>
          </div>

          {/* Next Question / Strategy Hint */}
          {coachingResult.next_question && (
            <div className="flex items-start gap-2 bg-slate-950/40 border border-teal-500/20 rounded-xl p-3 text-xs text-teal-300 mb-5">
              <span className="font-bold text-teal-400 flex-shrink-0">سؤال هدایت‌کننده:</span>
              <span>{coachingResult.next_question}</span>
            </div>
          )}

          {/* Proceed Button */}
          <div className="flex justify-end">
            {isLastModule ? (
              <button
                onClick={onShowBlueprint}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-xl transition"
              >
                <span>مشاهده و دانلود بلوپرینت نهایی</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToNextModule}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg transition"
              >
                <span>ادامه به ماژول بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
