import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BookCurriculum } from '../types/curriculum';
import {
  Download,
  Share2,
  CheckCircle,
  Clock,
  Check,
  BookOpen,
  RotateCcw,
  Sparkles,
  Award
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
    <div className="py-6 px-3 sm:px-6 max-w-4xl mx-auto space-y-6 text-on-surface">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/40 px-3.5 py-1 rounded-full text-xs font-garamond font-bold text-primary">
          <Sparkles className="w-4 h-4" />
          <span>سند با موفقیت در اسکریپتوریوم مهر و موم شد</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-garamond">
          طومار زرین بلوپرینت فردی (The Living Codex Blueprint)
        </h2>
        <p className="text-xs sm:text-sm text-secondary font-sans max-w-md mx-auto">
          مدل ذهنی این اثر به یک دستورالعمل عملیاتی و تغییر رفتار قطعی در زندگی و محیط شما تبدیل شد.
        </p>
      </div>

      {/* THE ILLUMINATED MANUSCRIPT BLUEPRINT SHEET */}
      <div
        id="blueprint-card"
        className="relative w-full rounded-2xl bg-[#f4eee0] text-[#1c2430] p-6 sm:p-9 shadow-[0_18px_50px_rgba(0,0,0,0.65),inset_0_0_40px_rgba(42,26,16,0.18)] overflow-hidden border border-[#d5c3aa]/40"
      >
        {/* Simulated deckled edges, cotton paper tooth, and spine gutter shadow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#20140c]/25 via-[#20140c]/10 to-transparent" />
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/15 to-transparent" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_3px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.2)]" />

        {/* Top Page Rubric & Chapter Head */}
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <span className="font-garamond text-xs tracking-[0.22em] text-[#785b30] uppercase mb-1 font-bold">
            CHARTA AUREA · CODEX BLUEPRINT · {book.titleEn || book.titleFa}
          </span>
          <h3 className="font-garamond text-2xl sm:text-3xl font-extrabold text-[#22180f] tracking-tight">
            {book.titleFa}
          </h3>
          <p className="font-garamond text-xs text-[#846b4b] uppercase mt-1 font-bold">
            مدل رفتاری: {book.frameworkNameFa} • اثر {book.authorFa}
          </p>

          {/* Vintage Ornamental Flourish SVG Divider */}
          <svg aria-hidden="true" className="w-36 h-4 my-3 text-[#9d7d49]" fill="currentColor" viewBox="0 0 160 16">
            <path
              d="M80 0 C74 5 62 8 48 8 C38 8 20 4 12 1 C6 -1 0 5 0 8 C0 11 6 17 12 15 C20 12 38 8 48 8 C62 8 74 11 80 16 C86 11 98 8 112 8 C122 8 140 12 148 15 C154 17 160 11 160 8 C160 5 154 -1 148 1 C140 4 122 8 112 8 C98 8 86 5 80 0 Z"
              opacity="0.8"
            />
            <circle cx="80" cy="8" fill="#694b20" r="2.5" />
          </svg>
        </div>

        {/* Dual Tablets: Old Pattern vs New Redesigned System */}
        <div className="relative z-10 my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Pattern (Faded Iron-Gall Ink) */}
          <div className="bg-[#ede2cb]/85 border border-[#c4b192] rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2 font-garamond text-xs font-bold text-rose-900 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-700" />
                <span>الگوی قدیمی (متکی بر اراده شکننده در پایین‌دست)</span>
              </div>
              <p className="text-sm text-[#443828] leading-relaxed font-vazir">
                {blueprint.oldPattern}
              </p>
            </div>
            <span className="font-garamond text-xs text-rose-800/80 block mt-4 pt-2 border-t border-[#c4b192]/60">
              ⚠️ در اولین نشانه خستگی یا استرس متوقف می‌شد.
            </span>
          </div>

          {/* New System (Illuminated Golden Ink) */}
          <div className="bg-[#fcfaf3] border-2 border-[#b28b3c] rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 font-garamond text-xs font-bold text-[#5c4013] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                <span>سیستم بازطراحی‌شده نوین (معماری موقعیت و هویت)</span>
              </div>
              <p className="text-sm text-[#1f1911] leading-relaxed font-vazir font-bold">
                {blueprint.newSystem}
              </p>
            </div>
            <span className="font-garamond text-xs text-[#6e4e19] block mt-4 pt-2 border-t border-[#b28b3c]/30 font-semibold">
              ✓ ریشه‌دار در چیدمان فیزیکی، حذف اصطکاک و لنگر عادتی.
            </span>
          </div>
        </div>

        {/* 48-Hour Experiment in Brass Cartouche */}
        <div className="relative z-10 mb-6 bg-[#eee4d0]/90 border border-[#8c6a35] rounded-xl p-4 sm:p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 font-garamond text-sm sm:text-base font-bold text-[#3c2a12] mb-1.5">
            <Clock className="w-4 h-4 text-[#8c6a35]" />
            <span>پروتکل آزمایش عملیاتی ۴۸ ساعته (The 48-Hour Experiment)</span>
          </div>
          <p className="text-sm text-[#22180f] font-vazir font-medium leading-relaxed">
            {blueprint.experiment48h}
          </p>
        </div>

        {/* Key Execution Rules */}
        <div className="relative z-10 space-y-2.5">
          <span className="font-garamond text-xs font-bold text-[#574236] uppercase tracking-wider block">
            قواعد پایداری حکمت سیستم (Execution Axioms):
          </span>
          <div className="space-y-2">
            {blueprint.keyRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-[#2b241c] bg-[#fbf8f0] p-3 rounded-lg border border-[#d5c3aa] shadow-2xs"
              >
                <CheckCircle className="w-4 h-4 text-[#7a5b28] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-vazir">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Scriptorium Sign-Off & Wax Seal Embellishment */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#7d6542]/25 flex items-center justify-between text-[#7d6542] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#8c2a1e] text-[#ffd2cc] flex items-center justify-center font-bold text-[10px] shadow-sm">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="font-garamond text-xs font-semibold">
              اسکریپتوریوم مربی یادگیری • Magic Books Scriptorium
            </span>
          </div>
          <span className="font-garamond text-[11px] italic">
            تاریخ صدور: {new Date().toLocaleDateString('fa-IR')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToBooks}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-garamond font-bold text-on-surface-variant hover:text-primary bg-surface-container border border-outline-variant/50 px-4 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>کتابخانه مجلدات</span>
          </button>

          <button
            onClick={onRestartBook}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-garamond font-bold text-on-surface-variant hover:text-secondary bg-surface-container border border-outline-variant/50 px-3.5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
            title="تکرار جلسه و بازنویسی بلوپرینت"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">اجرای دوباره</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 text-xs sm:text-sm font-garamond font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-full border border-outline-variant/60 transition-all active:scale-95 shadow-sm"
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
            className="flex items-center gap-2 text-xs sm:text-sm font-garamond font-bold bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-full shadow-gold-glow transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
