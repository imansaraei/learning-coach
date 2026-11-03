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
  Terminal
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
      colors: ['#00A19B', '#00F5D4', '#05D5AA', '#E2E8F0']
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
🎯 بلوپرینت مهندسی رفتار و اقدام عملیاتی
کتاب: ${book.titleFa} | مدل: ${book.frameworkNameFa}
----------------------------------------
❌ الگوی قدیمی:
${blueprint.oldPattern}

✅ سیستم بازطراحی‌شده نوین:
${blueprint.newSystem}

⏱️ آزمایش عملیاتی ۴۸ ساعته:
${blueprint.experiment48h}

📌 قواعد طلایی:
${blueprint.keyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
----------------------------------------
سیستم مربی یادگیری و بازطراحی رفتار
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-5">
      {/* Top Telemetry Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-surface-low border border-petronas-secondary/40 px-2.5 py-1 rounded-sm text-[11px] font-mono text-petronas-secondary">
          <Terminal className="w-3.5 h-3.5" />
          <span>SESSION COMPLETE // BLUEPRINT TELEMETRY LOCKED</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-silver-platinum font-heading">
          سند نهایی بلوپرینت رفتاری شما
        </h2>
        <p className="text-xs text-silver-aero">
          این کارت، مدل ذهنی کتاب را مستقیماً روی داده‌ها و موقعیت واقعی شما نگاشت کرده است.
        </p>
      </div>

      {/* THE BLUEPRINT SHEET (Screenshot / Print Ready) */}
      <div
        id="blueprint-card"
        className="bg-surface border-2 border-petronas-primary rounded p-6 sm:p-8 shadow-telemetry-glow relative overflow-hidden"
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-petronas-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#232B3B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] text-petronas-secondary bg-surface-low border border-petronas-primary/40 px-2 py-0.5 rounded-sm">
                MODEL: {book.frameworkNameFa}
              </span>
              <span className="font-mono text-[10px] text-silver-graphite">
                {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-bold text-silver-platinum font-heading">
              {book.titleFa}
            </h3>
            <p className="text-xs text-silver-aero">
              تحلیل کاربردی بر پایه نظریات {book.authorFa} ({book.authorEn})
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center font-mono text-[11px] text-petronas-tertiary bg-surface-low border border-petronas-tertiary/40 px-2.5 py-1 rounded-sm font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPERATIONAL STATUS: READY</span>
          </div>
        </div>

        {/* Side-by-Side Contrast */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Old Pattern */}
          <div className="bg-canvas border border-rose-950/80 rounded p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-rose-400 mb-2 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>// OLD PATTERN (FRAGILE / WILLPOWER)</span>
              </div>
              <p className="text-xs sm:text-sm text-silver-aero leading-relaxed font-normal">
                {blueprint.oldPattern}
              </p>
            </div>
            <span className="font-mono text-[10px] text-rose-400/80 block mt-3 pt-2 border-t border-rose-950/60 uppercase">
              CRITICAL: COLLAPSES UNDER COGNITIVE FATIGUE
            </span>
          </div>

          {/* New Redesigned System */}
          <div className="bg-canvas border border-petronas-secondary/50 rounded p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-petronas-secondary mb-2 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-petronas-secondary animate-pulse" />
                <span>// NEW REDESIGNED SYSTEM (BEHAVIORAL SPEC)</span>
              </div>
              <p className="text-xs sm:text-sm text-silver-platinum leading-relaxed font-semibold">
                {blueprint.newSystem}
              </p>
            </div>
            <span className="font-mono text-[10px] text-petronas-secondary block mt-3 pt-2 border-t border-petronas-primary/30 uppercase">
              ACTIVE: FRICTION-FREE UPSTREAM ARCHITECTURE
            </span>
          </div>
        </div>

        {/* 48-Hour Experiment Box */}
        <div className="mb-5 bg-canvas border border-amber-500/40 rounded p-4 sm:p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>// 48-HOUR EXPERIMENTAL PROTOCOL</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-200 font-semibold leading-relaxed">
            {blueprint.experiment48h}
          </p>
        </div>

        {/* Key Golden Rules */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] text-silver-graphite uppercase tracking-wider block">
            SYSTEM EXECUTION RULES:
          </span>
          <div className="space-y-1.5">
            {blueprint.keyRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-silver-aero bg-canvas p-2.5 rounded border border-[#232B3B]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-petronas-secondary flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-5 pt-4 border-t border-[#232B3B] flex items-center justify-between font-mono text-[10px] text-silver-graphite">
          <span>APPLIED LEARNING COACH // PETRONAS TELEMETRY</span>
          <span>UNIT COST: &lt;$0.001</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToBooks}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-silver-aero hover:text-white bg-surface-low border border-[#232B3B] px-3.5 py-2 rounded transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-petronas-secondary" />
            <span>فهرست کتاب‌ها</span>
          </button>

          <button
            onClick={onRestartBook}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-silver-aero hover:text-amber-400 bg-surface-low border border-[#232B3B] px-3 py-2 rounded transition"
            title="تکرار جلسه و بازنویسی بلوپرینت"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESTART</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs font-mono font-bold bg-surface-low hover:bg-surface-high text-silver-platinum px-3.5 py-2 rounded border border-[#232B3B] transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-petronas-tertiary" />
                <span className="text-petronas-tertiary">COPIED!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>کپی خلاصه کارت</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-mono font-bold bg-petronas-primary hover:bg-petronas-secondary text-canvas px-4 py-2 rounded border border-petronas-secondary shadow-petronas-btn transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
