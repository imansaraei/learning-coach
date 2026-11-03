import React from 'react';
import { BookCurriculum } from '../types/curriculum';
import { Compass, RotateCcw, Zap, Brain, MessageSquare, Clock, ArrowLeft, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';

interface BookSelectorProps {
  books: BookCurriculum[];
  onSelectBook: (book: BookCurriculum) => void;
  savedStates: Record<string, Record<string, any>>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-6 h-6" />,
  RotateCcw: <RotateCcw className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
};

export const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  onSelectBook,
  savedStates,
}) => {
  return (
    <div className="py-6 sm:py-8 px-4 max-w-4xl mx-auto">
      {/* Hero Banner */}
      <div className="mb-8 text-center sm:text-right bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-teal-950/30 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>رویکرد تحول کاربردی (Applied Transformation)</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          خلاصه‌خوانی منفعل را فراموش کنید؛ مدل‌های ذهنی را در زندگی واقعی پیاده کنید.
        </h2>
        
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          به جای نقل‌قول مستقیم از کتاب‌ها، مدل‌های رفتارشناسی ۵ کتاب شاهکار را به صورت گام‌به‌گام بیاموزید و همراه با هوش مصنوعی، برای عادات و چالش‌های واقعی خود «بلوپرینت اختصاصی» بسازید.
        </p>

        {/* Feature Badges */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>مدل ایمن از حق نشر (تالیف تحلیلی)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>معماری بهینه هزینه صفر ($0 Gemini API)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span>🗣️ پشتیبانی صوتی Web Speech دوطرفه</span>
          </div>
        </div>
      </div>

      {/* Book Catalog Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">کاتالوگ ۵ کتاب پرچمدار</h3>
          <p className="text-xs text-slate-400">یک کتاب را برای شروع جلسه مربی‌گری انتخاب کنید</p>
        </div>
        <span className="text-xs text-teal-400 bg-teal-950/50 border border-teal-800/50 px-2.5 py-1 rounded-full font-medium">
          ۵ دوره آماده اجرا
        </span>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book) => {
          const userState = savedStates[book.id];
          const hasProgress = userState && Object.keys(userState).some(k => Boolean(userState[k]));
          const isCompleted = userState?.status === 'completed_blueprint';

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Icon & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${book.accentColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                  >
                    {ICON_MAP[book.iconName] || <BookOpen className="w-6 h-6" />}
                  </div>

                  <div className="flex flex-col items-end">
                    {isCompleted ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                        ✓ بلوپرینت نهایی تکمیل شد
                      </span>
                    ) : hasProgress ? (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                        در حال پیشرفت
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800/70 px-2.5 py-0.5 rounded-full">
                        شروع نشده
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Author */}
                <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors mb-1">
                  {book.titleFa}
                </h4>
                <div className="text-xs text-slate-400 mb-2 font-medium">
                  نویسنده: <span className="text-slate-300">{book.authorFa}</span> ({book.authorEn})
                </div>

                {/* Framework Pill */}
                <div className="inline-block bg-slate-950/80 border border-slate-800 text-[11px] text-teal-400 font-semibold px-2.5 py-1 rounded-lg mb-3">
                  مدل ذهنی: {book.frameworkNameFa}
                </div>

                {/* Tagline */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {book.taglineFa}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{book.modules.length} ماژول (~۱۵ دقیقه)</span>
                </div>

                <div className="flex items-center gap-1 text-teal-400 font-semibold group-hover:translate-x-[-4px] transition-transform">
                  <span>{hasProgress ? 'ادامه جلسه' : 'شروع یادگیری'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
