import React from 'react';
import { BookCurriculum } from '../types/curriculum';
import { Compass, RotateCcw, Zap, Brain, MessageSquare, ArrowLeft, ShieldCheck, BookOpen, Terminal } from 'lucide-react';

interface BookSelectorProps {
  books: BookCurriculum[];
  onSelectBook: (book: BookCurriculum) => void;
  savedStates: Record<string, Record<string, any>>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-5 h-5 text-petronas-secondary" />,
  RotateCcw: <RotateCcw className="w-5 h-5 text-petronas-secondary" />,
  Zap: <Zap className="w-5 h-5 text-petronas-secondary" />,
  Brain: <Brain className="w-5 h-5 text-petronas-secondary" />,
  MessageSquare: <MessageSquare className="w-5 h-5 text-petronas-secondary" />,
};

export const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  onSelectBook,
  savedStates,
}) => {
  return (
    <div className="py-6 sm:py-8 px-4 max-w-4xl mx-auto space-y-6">
      {/* Precision Hero Banner */}
      <div className="relative rounded bg-surface border border-[#232B3B] p-6 sm:p-8 overflow-hidden shadow-sm">
        {/* Ambient subtle glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-petronas-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-2 bg-petronas-dark border border-petronas-primary/40 px-2.5 py-1 rounded-sm text-[11px] font-mono font-semibold text-petronas-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-petronas-secondary animate-ping" />
            <span>APPLIED TRANSFORMATION // BEHAVIORAL ARCHITECTURE</span>
          </div>

          <span className="font-mono text-[11px] text-silver-graphite uppercase tracking-wider hidden sm:inline">
            CORE PLATFORM v2.5
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-silver-platinum mb-3 font-heading tracking-tight leading-snug">
          خلاصه‌خوانی منفعل را کنار بگذارید؛ مدل‌های ذهنی را در زندگی واقعی مهندسی کنید.
        </h2>

        <p className="text-sm text-silver-aero leading-relaxed max-w-2xl mb-6">
          به جای نقل‌قول مستقیم، سازوکار عصب‌شناختی و روان‌شناختی ۵ کتاب برجسته را گام‌به‌گام تحلیل کرده و همراه با هوش مصنوعی (Gemini 2.5 Flash)، برای عادات و چالش‌های خود «بلوپرینت ۴۸ ساعته» طراحی کنید.
        </p>

        {/* Technical Spec Badges */}
        <div className="flex flex-wrap gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-surface-low border border-[#232B3B] px-2.5 py-1 rounded-sm text-silver-aero">
            <ShieldCheck className="w-3.5 h-3.5 text-petronas-tertiary" />
            <span>COPYRIGHT-SAFE SYNTHESIS</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-low border border-[#232B3B] px-2.5 py-1 rounded-sm text-silver-aero">
            <span className="w-2 h-2 rounded-full bg-petronas-secondary" />
            <span>ZERO-COST ARCHITECTURE (&lt;$0.001)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-low border border-[#232B3B] px-2.5 py-1 rounded-sm text-silver-aero">
            <span>WEB SPEECH API // DUAL VOICE</span>
          </div>
        </div>
      </div>

      {/* Catalog Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-petronas-primary" />
          <h3 className="text-sm sm:text-base font-bold text-silver-platinum font-heading">
            کاتالوگ ۵ کتاب پرچمدار
          </h3>
        </div>
        <span className="font-mono text-[11px] text-petronas-secondary bg-petronas-dark border border-petronas-primary/40 px-2.5 py-0.5 rounded-sm">
          5 ACTIVE TRACKS
        </span>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {books.map((book, index) => {
          const userState = savedStates[book.id];
          const hasProgress = userState && Object.keys(userState).some((k) => Boolean(userState[k]));
          const isCompleted = userState?.status === 'completed_blueprint';

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group relative bg-surface hover:bg-surface-high border border-[#232B3B] hover:border-petronas-secondary/50 rounded p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-telemetry-glow"
            >
              <div>
                {/* Header Row: Sector ID & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded bg-surface-low border border-[#232B3B] flex items-center justify-center group-hover:border-petronas-primary/60 transition">
                      {ICON_MAP[book.iconName] || <BookOpen className="w-5 h-5 text-petronas-secondary" />}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-petronas-secondary tracking-widest block uppercase">
                        SECTOR-0{index + 1}
                      </span>
                      <h4 className="text-base font-bold text-silver-platinum group-hover:text-petronas-secondary transition-colors leading-snug">
                        {book.titleFa}
                      </h4>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isCompleted ? (
                      <span className="font-mono text-[10px] text-petronas-tertiary bg-surface-low border border-petronas-tertiary/40 px-2 py-0.5 rounded-sm font-semibold">
                        ✓ BLUEPRINT COMPLETE
                      </span>
                    ) : hasProgress ? (
                      <span className="font-mono text-[10px] text-amber-400 bg-surface-low border border-amber-500/40 px-2 py-0.5 rounded-sm font-semibold">
                        RUNNING
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-silver-graphite bg-surface-low border border-[#232B3B] px-2 py-0.5 rounded-sm">
                        STANDBY
                      </span>
                    )}
                  </div>
                </div>

                {/* Author Info */}
                <div className="text-xs text-silver-aero mb-3">
                  نویسنده: <span className="text-silver-platinum font-medium">{book.authorFa}</span> ({book.authorEn})
                </div>

                {/* Mental Model Pill */}
                <div className="bg-surface-low border border-[#232B3B] text-[11px] text-petronas-secondary px-2.5 py-1 rounded-sm mb-3 font-mono inline-block">
                  MODEL: {book.frameworkNameFa}
                </div>

                {/* Tagline */}
                <p className="text-xs text-silver-aero line-clamp-2 leading-relaxed mb-4">
                  {book.taglineFa}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#232B3B] flex items-center justify-between text-xs">
                <div className="font-mono text-[11px] text-silver-graphite">
                  {book.modules.length} ماژول (~۱۵ دقیقه)
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-petronas-secondary group-hover:translate-x-[-3px] transition-transform">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{hasProgress ? 'ادامه جلسه' : 'شروع یادگیری'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
