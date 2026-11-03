import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BookCurriculum } from '../types/curriculum';
import {
  Download,
  Share2,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  BookOpen,
  RotateCcw
} from 'lucide-react';

interface BlueprintArtifactCardProps {
  book: BookCurriculum;
  userState: Record<string, any>;
  onBackToBooks: () => void;
  onRestartBook: () => void;
}

export const BlueprintArtifactCard: React.FC<BlueprintArtifactCardProps> = ({
  book,
  userState,
  onBackToBooks,
  onRestartBook,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14b8a6', '#10b981', '#3b82f6', '#f59e0b']
    });
  }, []);

  // Derive Old Pattern vs New System dynamically based on the book framework and user state
  const deriveBlueprintContent = () => {
    switch (book.id) {
      case 'situated':
        return {
          oldPattern:
            userState.target_behavior_box3 ||
            'جنگ فرسایشی با نیروی اراده در پایین‌دست و تسلیم شدن مکرر در برابر وسوسه در جعبه ۳',
          newSystem:
            userState.upstream_redesign_strategy ||
            'مهندسی بالادست در جعبه ۱ (ایجاد مانع فیزیکی غیرقابل برگشت و حذف اصطکاک رفتارهای خوب)',
          experiment48h:
            userState.objective_environment_box1 ||
            'تغییر فیزیکی موقعیت در جعبه ۱ و قطع دسترسی به محرک ظرف ۴۸ ساعت آینده بدون اتکا به اراده',
          keyRules: [
            'رفتار در جعبه ۳ انتخاب اراده نیست؛ حاصل معماری فیزیکی جعبه ۱ است.',
            `اهرم اجتماعی فعال‌شده: ${userState.applied_situational_levers?.[0] || 'پاسخگویی به شریک تعهد'}`,
            'هرگز تعهد به اراده ندهید؛ تعهد به چیدمان فیزیکی و اهرم همتایان بدهید.'
          ]
        };

      case 'power-of-habit':
        return {
          oldPattern: `اجرای روتین خودکار "${userState.undesirable_routine || 'رفتار مخرب'}" در پاسخ به نشانه بدون توجه به پاداش واقعی`,
          newSystem:
            userState.golden_rule_replacement_routine ||
            `حفظ نشانه (${userState.specific_cue || 'نشانه شناسایی‌شده'}) و جایگزینی روتین سالم برای دریافت پاداش "${userState.real_craving_and_reward || 'تسکین و آرامش'}"`,
          experiment48h:
            'اجرای روتین طلایی جایگزین در لحظه وقوع نشانه مشخص در دو روز آینده با ثبت فوری در چک‌لیست',
          keyRules: [
            'عادت‌ها ریشه‌کن نمی‌شوند؛ فقط روتین میانی بازنویسی می‌شود.',
            `اشتیاق عصبی (Craving) شناسایی‌شده: ${userState.real_craving_and_reward || 'آرامش و وقفه شناختی'}`,
            'قانون طلایی: نشانه ثابت + پاداش ثابت + روتین نوین.'
          ]
        };

      case 'atomic-habits':
        return {
          oldPattern: `تمرکز سطحی بر نتایج موقت (${userState.current_outcome_focus || 'کارهای پراکنده و سنگین'}) بدون تغییر هویت درونی`,
          newSystem: `هویت‌محوری: "${userState.target_identity || 'انسان منضبط و یادگیرنده'}" با لنگر انداختن (${userState.habit_stacking_rule || 'انباشت عادات'}) و نسخه ۲ دقیقه‌ای (${userState.two_minute_version || 'نسخه اتمی'})`,
          experiment48h: `اجرای ۲ روز متوالی نسخه ۲ دقیقه‌ای بلافاصله پس از لنگر عادتی با نشانه آشکار (${userState.law_environment_design || 'نشانه محیطی'})`,
          keyRules: [
            'هر بار اجرای نسخه ۲ دقیقه‌ای، یک رأی مثبت به نفع هویت جدید است.',
            'عادت باید قبل از بزرگ شدن، آسان و خودکار شود.',
            'سیستم‌ها تعیین‌کننده برندگان هستند، نه اهداف.'
          ]
        };

      case 'thinking-fast-slow':
        return {
          oldPattern: `تصمیم‌گیری تکانه‌ای و شتاب‌زده بر پایه ادراکات سریع سیستم ۱ در موقعیت (${userState.impulsive_decision_context || 'تنش کاری یا شخصی'})`,
          newSystem: `پروتکل فعال‌سازی سیستم ۲: رصد نقاط کور (${userState.wysiati_blindspots || 'شواهد مفقوده WYSIATI'}) و مهار سوگیری (${userState.system1_triggers_and_heuristics || 'خطای شناختی'})`,
          experiment48h:
            userState.system2_interception_protocol ||
            'اجرای قانون وقفه فیزیکی ۱۰ دقیقه‌ای و چک‌لیست معکوس پیش از هرگونه پاسخ در موقعیت‌های پرریسک',
          keyRules: [
            'آنچه می‌بینید تمام واقعیت نیست (WYSIATI).',
            'سیستم ۱ شهودی و بدون راستی‌آزمایی است؛ ترمز سیستم ۲ را با پروتکل فعال کنید.',
            'خطاهای شناختی را نمی‌توان حس کرد؛ باید با خط‌کش بیرونی اندازه گرفت.'
          ]
        };

      case 'crucial-conversations':
        return {
          oldPattern: `پناه بردن به لاک سکوت، پنهان‌کاری یا پرخاشگری تهاجمی در شرایط پرفشار (${userState.high_stakes_situation || 'گفتگوی حیاتی معوق'})`,
          newSystem: `آغاز با انگیزه قلبی (${userState.mutual_purpose_definition || 'هدف مشترک'}) + ایجاد امنیت با بیانیه کنتراست (${userState.contrasting_statement_ready || 'رفع سوءتفاهم'})`,
          experiment48h:
            userState.silence_or_violence_pattern ||
            'برگزاری گفتگوی حیاتی در زمان و مکان معین با شروع از حقایق عینی (STATE) ظرف ۴۸ ساعت آینده',
          keyRules: [
            'امنیت روان‌شناختی پیش‌شرط شنیده شدن محتواست.',
            'تکنیک کنتراست سوءتفاهم را قبل از دفاعی شدن طرف مقابل خنثی می‌کند.',
            'با فکت‌های غیرقابل انکار شروع کنید، نه با برداشت‌ها و قضاوت‌های درونی.'
          ]
        };

      default:
        return {
          oldPattern: 'الگوی واکنشی گذشته',
          newSystem: 'سیستم بازطراحی‌شده نوین بر پایه مدل‌های ذهنی',
          experiment48h: 'آزمایش عملیاتی در دو روز آینده',
          keyRules: ['تمرکز بر ساختار به جای اراده', 'بازخورد سریع', 'تکرار پایدار']
        };
    }
  };

  const blueprint = deriveBlueprintContent();

  const handleCopyText = () => {
    const text = `
🎯 بلوپرینت تغییر رفتار و اقدام عملیاتی
کتاب: ${book.titleFa} | مدل ذهنی: ${book.frameworkNameFa}
----------------------------------------
❌ الگوی قدیمی:
${blueprint.oldPattern}

✅ سیستم بازطراحی‌شده نوین:
${blueprint.newSystem}

⏱️ آزمایش عملیاتی ۴۸ ساعته:
${blueprint.experiment48h}

📌 قواعد طلایی سیستم:
${blueprint.keyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
----------------------------------------
تولید شده توسط مربی یادگیری و بازطراحی رفتار
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>جلسه با موفقیت تکمیل شد!</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          سند نهایی بلوپرینت شخصی شما (Blueprint Artifact)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          این کارت اختصاصی، مدل ذهنی کتاب را مستقیماً روی چالش و محیط واقعی شما نگاشت کرده است.
        </p>
      </div>

      {/* THE ARTIFACT CARD (Screenshot / Export Ready) */}
      <div
        id="blueprint-card"
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2.5 py-0.5 rounded-md">
                {book.frameworkNameFa}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {book.titleFa}
            </h3>
            <p className="text-xs text-slate-400">
              بر پایه تحلیل‌های {book.authorFa} ({book.authorEn})
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>سیستم بازطراحی‌شده آماده اجرا</span>
          </div>
        </div>

        {/* Body: Side-by-Side Contrast (Old Pattern vs New Redesigned System) */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Pattern */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>الگوی قدیمی (ناکارآمد / وابسته به اراده خام)</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {blueprint.oldPattern}
              </p>
            </div>
            <span className="text-[10px] text-rose-400/80 block mt-3 pt-2 border-t border-rose-900/30">
              ⚠️ در شرایط خستگی روانی فرو می‌پاشد.
            </span>
          </div>

          {/* New Redesigned System */}
          <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>سیستم بازطراحی‌شده نوین (معماری رفتاری)</span>
              </div>
              <p className="text-sm text-teal-100 leading-relaxed font-semibold">
                {blueprint.newSystem}
              </p>
            </div>
            <span className="text-[10px] text-teal-400/80 block mt-3 pt-2 border-t border-teal-800/30">
              ✓ متکی بر علم موقعیت، لنگر عصبی و اصطکاک بیرونی.
            </span>
          </div>
        </div>

        {/* 48-Hour Experiment Box */}
        <div className="mb-6 bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>آزمایش عملیاتی ۴۸ ساعته (The 48-Hour Experiment)</span>
          </div>
          <p className="text-sm text-amber-100 font-semibold leading-relaxed">
            {blueprint.experiment48h}
          </p>
        </div>

        {/* Key Golden Rules / Levers */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 block">
            قواعد طلایی پایداری سیستم:
          </span>
          <div className="space-y-1.5">
            {blueprint.keyRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80"
              >
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Watermark / Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>مربی یادگیری و بازطراحی رفتار | Applied Learning Coach</span>
          <span>Zero-Cost Cognitive Architecture</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToBooks}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>فهرست کتاب‌ها</span>
          </button>

          <button
            onClick={onRestartBook}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-xl transition"
            title="تکرار جلسه و بازنویسی بلوپرینت"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">اجرای دوباره</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">متن کپی شد!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>کپی خلاصه کارت</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
