import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BookCurriculum } from '../types/curriculum';
import {
  Download,
  Share2,
  CheckCircle,
  Clock,
  ShieldCheck,
  Check,
  BookOpen,
  RotateCcw,
  Sparkles
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

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F2CA50', '#D4AF37', '#B7D1F2', '#DEC1B1', '#FFFFFF']
    });
  }, []);

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
📜 سند زرین بلوپرینت تغییر رفتار و اقدام عملیاتی
کتابخانه: ${book.titleFa} | مدل ذهنی: ${book.frameworkNameFa}
----------------------------------------
❌ الگوی گذشته (The Old Pattern):
${blueprint.oldPattern}

✅ سیستم بازطراحی‌شده نوین (The Living System):
${blueprint.newSystem}

⏱️ آزمایش عملیاتی ۴۸ ساعته (The 48-Hour Experiment):
${blueprint.experiment48h}

📌 قواعد طلایی حکمت سیستم:
${blueprint.keyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
----------------------------------------
تولید شده در اسکریپتوریوم مربی یادگیری و بازطراحی رفتار
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-6 px-3 sm:px-4 max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/40 px-3 py-1 rounded-full text-xs font-garamond font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span>سند با موفقیت مهر و موم شد!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-on-surface font-garamond">
          طومار بلوپرینت فردی (The Living Blueprint)
        </h2>
        <p className="text-xs sm:text-sm text-secondary font-sans max-w-md mx-auto">
          مدل ذهنی این کتاب به یک دستورالعمل عملیاتی و دقیق برای زندگی و محیط شخصی شما تبدیل شد.
        </p>
      </div>

      {/* THE ILLUMINATED MANUSCRIPT BLUEPRINT SHEET */}
      <div
        id="blueprint-card"
        className="relative bg-surface-container border-2 border-primary/60 rounded-3xl p-6 sm:p-9 shadow-gold-glow overflow-hidden"
      >
        {/* Corner Ambient Halo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[11px] font-bold text-on-primary bg-primary px-3 py-0.5 rounded-full">
                مدل: {book.frameworkNameFa}
              </span>
              <span className="font-sans text-xs text-secondary">
                {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface font-garamond">
              {book.titleFa}
            </h3>
            <p className="text-xs text-on-surface-variant font-sans">
              بر پایه آموزه‌های روان‌شناختی {book.authorFa} ({book.authorEn})
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center font-sans text-xs text-primary bg-surface-container-high border border-primary/40 px-3.5 py-1.5 rounded-full font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4" />
            <span>سند مربی‌گری معتبر و آماده اجرا</span>
          </div>
        </div>

        {/* Side-by-Side Dual Tablets */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Pattern (Faded Ink) */}
          <div className="bg-surface-container-lowest/90 border border-outline-variant/50 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-sans text-xs font-bold text-rose-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>الگوی قدیمی (متکی بر اراده شکننده)</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed font-vazir">
                {blueprint.oldPattern}
              </p>
            </div>
            <span className="font-sans text-[10px] text-rose-300/80 block mt-4 pt-2 border-t border-outline-variant/30">
              ⚠️ در زمان خستگی اراده فوراً متوقف می‌شود.
            </span>
          </div>

          {/* New System (Gilded Ink) */}
          <div className="bg-surface-container-high/90 border border-primary/50 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 font-sans text-xs font-bold text-primary mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>سیستم بازطراحی‌شده نوین (معماری بالادست)</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed font-vazir font-semibold">
                {blueprint.newSystem}
              </p>
            </div>
            <span className="font-sans text-[10px] text-primary block mt-4 pt-2 border-t border-primary/20">
              ✓ مبتنی بر اصطکاک فیزیکی، لنگر عادتی و محیط هوشمند.
            </span>
          </div>
        </div>

        {/* 48-Hour Experiment in Brass Plaque */}
        <div className="mb-6 bg-gradient-to-r from-surface-container-lowest via-surface-container-high to-surface-container-lowest border border-primary/40 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center gap-2 font-garamond text-base font-bold text-primary mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>پروتکل آزمایش عملیاتی ۴۸ ساعته (The 48-Hour Experiment)</span>
          </div>
          <p className="text-sm text-on-surface font-vazir font-semibold leading-relaxed">
            {blueprint.experiment48h}
          </p>
        </div>

        {/* Key Execution Rules */}
        <div className="space-y-2.5">
          <span className="font-sans text-xs font-bold text-secondary uppercase tracking-wider block">
            قواعد پایداری حکمت سیستم:
          </span>
          <div className="space-y-2">
            {blueprint.keyRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-on-surface-variant bg-surface-container-lowest/60 p-3 rounded-xl border border-outline-variant/30"
              >
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Seal */}
        <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between font-sans text-[11px] text-outline">
          <span>مربی یادگیری و بازطراحی رفتار • Magic Books Scriptorium</span>
          <span>هزینه پردازش: کمتر از ۰.۰۰۱ دلار</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToBooks}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-semibold text-on-surface-variant hover:text-primary bg-surface-container border border-outline-variant/50 px-4 py-2.5 rounded-full transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>کتابخانه مجلدات</span>
          </button>

          <button
            onClick={onRestartBook}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-semibold text-on-surface-variant hover:text-secondary bg-surface-container border border-outline-variant/50 px-3.5 py-2.5 rounded-full transition-all active:scale-95"
            title="تکرار جلسه و بازنویسی بلوپرینت"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">اجرای دوباره</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 text-xs sm:text-sm font-sans font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/60 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary" />
                <span className="text-primary">طومار کپی شد!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>کپی متن طومار</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs sm:text-sm font-sans font-bold bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-full shadow-gold-glow transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
