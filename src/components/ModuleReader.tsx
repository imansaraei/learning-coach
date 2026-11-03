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
  Terminal,
  Activity
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
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-5">
      {/* Telemetry Tracking Header */}
      <div className="flex items-center justify-between font-mono text-[11px] pb-2 border-b border-[#232B3B]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-petronas-secondary animate-pulse" />
          <span className="text-petronas-secondary font-semibold uppercase tracking-wider">
            MODULE 0{currentModule.id} // 0{book.modules.length}
          </span>
        </div>
        <span className="bg-surface-low border border-[#232B3B] text-silver-aero px-2 py-0.5 rounded-sm">
          {currentModule.frameworkStep}
        </span>
      </div>

      {/* SECTION 1: [STATIC CORE LESSON] */}
      <section className="rounded bg-surface border border-[#232B3B] p-5 sm:p-7 relative shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-petronas-primary uppercase tracking-widest block font-semibold">
              // STATIC CORE LESSON // COGNITIVE MODEL
            </span>
            <h2 className="text-base sm:text-lg font-bold text-silver-platinum leading-snug font-heading">
              {currentModule.title}
            </h2>
          </div>

          <button
            onClick={() =>
              handleToggleReadAloud(
                `${currentModule.title}. ${currentModule.staticCoreLesson.headline} ${currentModule.staticCoreLesson.concept}`
              )
            }
            className="p-1.5 rounded bg-surface-low hover:bg-surface-high border border-[#232B3B] text-silver-aero hover:text-petronas-secondary transition flex-shrink-0"
            title={isReadingAloud ? 'توقف صوت' : 'شنیدن صوتی درس'}
          >
            {isReadingAloud ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-petronas-secondary" />
            )}
          </button>
        </div>

        {/* Headline */}
        <div className="mb-4 bg-surface-low border-r-2 border-petronas-secondary pr-3.5 py-2 rounded-l">
          <p className="text-sm font-semibold text-petronas-secondary">
            {currentModule.staticCoreLesson.headline}
          </p>
        </div>

        {/* Concept Text */}
        <p className="text-sm text-silver-aero leading-relaxed mb-5">
          {currentModule.staticCoreLesson.concept}
        </p>

        {/* Precision Diagram Steps */}
        {currentModule.staticCoreLesson.diagramSteps && (
          <div className="mb-5 bg-surface-low border border-[#232B3B] rounded p-4">
            <div className="flex items-center gap-1.5 mb-3 font-mono text-[10px] text-silver-graphite uppercase tracking-wider">
              <Activity className="w-3 h-3 text-petronas-secondary" />
              <span>LOGICAL ARCHITECTURE FLOW:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentModule.staticCoreLesson.diagramSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-[#232B3B] rounded p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 font-mono text-xs text-petronas-secondary mb-1">
                    <span className="text-[10px] bg-surface-low border border-petronas-primary/30 px-1.5 rounded-sm">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold">{step.label}</span>
                  </div>
                  <p className="text-[11px] text-silver-aero leading-tight">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaway Box */}
        <div className="flex items-start gap-2.5 bg-surface-low border border-petronas-primary/30 rounded p-3 text-xs text-silver-platinum">
          <Lightbulb className="w-4 h-4 text-petronas-secondary flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[11px] text-petronas-secondary font-bold block mb-0.5 uppercase tracking-wide">
              KEY TAKEAWAY:
            </span>
            <span className="text-silver-aero">{currentModule.staticCoreLesson.keyTakeaway}</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: [INTERACTIVE CHECKPOINT & USER INPUT] */}
      <section className="rounded bg-surface border border-[#232B3B] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm bg-petronas-secondary animate-pulse" />
            <span className="font-mono text-[10px] text-petronas-secondary uppercase tracking-widest font-semibold">
              // INTERACTIVE CHECKPOINT // PERSONAL TELEMETRY
            </span>
          </div>
          <span className="font-mono text-[10px] text-silver-graphite">TARGET: {currentModule.interactivePrompt.stateTargetKey}</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-silver-platinum mb-2 font-heading leading-relaxed">
          {currentModule.interactivePrompt.question}
        </h3>

        {currentModule.interactivePrompt.contextHint && (
          <p className="text-xs text-silver-graphite mb-4 bg-surface-low p-2.5 rounded border border-[#232B3B]">
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
              className="w-full bg-canvas border border-[#232B3B] focus:border-petronas-secondary focus:ring-1 focus:ring-petronas-secondary rounded p-3 text-xs sm:text-sm text-silver-platinum placeholder:text-silver-graphite focus:outline-none transition resize-none leading-relaxed font-vazir"
            />

            {/* Voice Input Button */}
            <div className="absolute bottom-2.5 left-2.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-surface-low border-[#232B3B] text-silver-aero hover:text-petronas-secondary hover:border-petronas-secondary/50'
                }`}
                title={isListening ? 'توقف ضبط صدا' : 'ورودی صوتی با میکروفون'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase">LISTENING...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase">VOICE IN</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {speechError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>خطای صوت: {speechError}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] text-silver-graphite hidden sm:inline">
              COMPACT STATE REDUCTION ACTIVE
            </span>

            {/* Primary Petronas Button */}
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="flex items-center gap-2 bg-petronas-primary hover:bg-petronas-secondary text-canvas font-mono font-bold text-xs uppercase px-4 py-2 rounded border border-petronas-secondary disabled:opacity-40 disabled:cursor-not-allowed shadow-petronas-btn transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING TURN...</span>
                </>
              ) : (
                <>
                  <span>ارزیابی و تحلیل مربی</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: [DYNAMIC AI COACHING BRIDGE] */}
      {coachingResult && (
        <section className="rounded bg-surface-high border border-petronas-secondary/60 p-5 sm:p-7 shadow-telemetry-glow animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232B3B]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-surface-low border border-petronas-secondary/40 text-petronas-secondary flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-petronas-secondary font-bold uppercase tracking-wider block">
                  AI COACHING SYNTHESIS // GEMINI 2.5 FLASH
                </span>
                <span className="font-mono text-[10px] text-silver-graphite">
                  STRUCTURED JSON · BEHAVIORAL SCIENCE (&lt;150 WORDS)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleReadAloud(coachingResult.coaching_response)}
              className="p-1.5 rounded bg-surface-low border border-[#232B3B] text-petronas-secondary hover:text-white transition"
              title="شنیدن تحلیل صوتی مربی"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Coaching Response Body */}
          <div className="bg-canvas border border-[#232B3B] rounded p-4 mb-4">
            <p className="text-xs sm:text-sm text-silver-platinum leading-relaxed font-normal">
              {coachingResult.coaching_response}
            </p>
          </div>

          {/* Next Question / Strategy Hint */}
          {coachingResult.next_question && (
            <div className="flex items-start gap-2 bg-surface-low border border-petronas-primary/30 rounded p-3 text-xs text-petronas-secondary mb-5 font-mono">
              <span className="font-bold flex-shrink-0">NEXT STEP:</span>
              <span className="text-silver-platinum font-vazir">{coachingResult.next_question}</span>
            </div>
          )}

          {/* Proceed Button */}
          <div className="flex justify-end">
            {isLastModule ? (
              <button
                onClick={onShowBlueprint}
                className="flex items-center gap-2 bg-petronas-secondary hover:bg-white text-canvas font-mono font-bold text-xs uppercase px-4 py-2.5 rounded border border-petronas-secondary shadow-telemetry-glow transition"
              >
                <span>مشاهده و دریافت بلوپرینت نهایی</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoToNextModule}
                className="flex items-center gap-2 bg-petronas-primary hover:bg-petronas-secondary text-canvas font-mono font-bold text-xs uppercase px-4 py-2 rounded border border-petronas-secondary shadow-petronas-btn transition"
              >
                <span>ادامه به ماژول بعد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
