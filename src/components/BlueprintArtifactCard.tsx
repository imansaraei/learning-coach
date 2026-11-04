import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { BookCurriculum } from '../types/curriculum';
import {
  Download,
  Share2,
  CheckCircle,
  Clock,
  Check,
  Bookmark,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { playPageTurnSound } from '../services/soundService';

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
  const [copied, setCopied] = useState(false);
  const [isDoublePage, setIsDoublePage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768 && window.innerWidth > window.innerHeight;
  });
  const [mobileLeaf, setMobileLeaf] = useState<0 | 1>(0);

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#F2CA50', '#D4AF37', '#B7D1F2', '#DEC1B1', '#FFFFFF']
    });

    const handleResize = () => {
      const wide = window.innerWidth >= 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsDoublePage(wide || (landscape && window.innerWidth >= 640));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
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

  // =========================================================================
  // RIGHT PAGE: Dual Tablets (Old Pattern vs New Redesigned System)
  // =========================================================================
  const renderRightPage = () => (
    <div className="w-full h-full flex flex-col justify-between select-text p-6 sm:p-9 relative">
      <div>
        {/* Top Rubric */}
        <div className="flex items-center justify-between border-b border-[#aa936d]/30 pb-2 mb-3">
          <span className="font-garamond text-xs tracking-[0.2em] text-[#785b30] uppercase font-bold">
            CHARTA AUREA · CODEX BLUEPRINT
          </span>
          <span className="font-garamond text-xs text-[#846b4b] italic">
            طومار زرین تغییر رفتار
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <h3 className="font-garamond text-xl sm:text-2xl font-extrabold text-[#22180f] tracking-tight">
            {book.titleFa}
          </h3>
        </div>
        <p className="font-garamond text-xs text-[#846b4b] mb-4">
          مدل رفتاری: {book.frameworkNameFa} • اثر {book.authorFa}
        </p>

        {/* Dual Tablets */}
        <div className="space-y-3">
          {/* Old Pattern */}
          <div className="bg-[#ede2cb]/90 border border-[#c4b192] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-garamond text-xs font-bold text-rose-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-700" />
              <span>الگوی قدیمی (متکی بر اراده شکننده):</span>
            </div>
            <p className="text-xs text-[#443828] leading-relaxed font-vazir">
              {blueprint.oldPattern}
            </p>
          </div>

          {/* New System */}
          <div className="bg-[#fcfaf3] border-2 border-[#b28b3c] rounded-xl p-3.5 shadow-md">
            <div className="flex items-center gap-1.5 font-garamond text-xs font-bold text-[#5c4013] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span>سیستم بازطراحی‌شده نوین (معماری بالادست):</span>
            </div>
            <p className="text-xs text-[#1f1911] leading-relaxed font-vazir font-bold">
              {blueprint.newSystem}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Folio */}
      <div className="flex items-center justify-between pt-2 border-t border-[#aa936d]/25 text-xs text-[#7d6542] font-garamond">
        <span>لوح نخست بلوپرینت</span>
        {!isDoublePage && (
          <button
            onClick={() => {
              playPageTurnSound();
              setMobileLeaf(1);
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#694e24] hover:text-[#22180f]"
          >
            <span>ورق زدن به لوح اقدام</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // LEFT PAGE: 48-Hour Experiment, Key Rules & Scriptorium Seal
  // =========================================================================
  const renderLeftPage = () => (
    <div className="w-full h-full flex flex-col justify-between select-text p-6 sm:p-9 relative">
      <div>
        {/* 48-Hour Experiment */}
        <div className="mb-4 bg-[#eee4d0]/90 border border-[#8c6a35] rounded-xl p-3.5 shadow-inner">
          <div className="flex items-center gap-1.5 font-garamond text-xs font-bold text-[#3c2a12] mb-1">
            <Clock className="w-4 h-4 text-[#8c6a35]" />
            <span>پروتکل آزمایش عملیاتی ۴۸ ساعته (The 48-Hour Experiment):</span>
          </div>
          <p className="text-xs text-[#22180f] font-vazir font-semibold leading-relaxed">
            {blueprint.experiment48h}
          </p>
        </div>

        {/* Execution Axioms */}
        <div className="space-y-2 mb-4">
          <span className="font-garamond text-xs font-bold text-[#574236] uppercase tracking-wider block">
            قواعد پایداری حکمت سیستم (Execution Axioms):
          </span>
          {blueprint.keyRules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-[#2b241c] bg-[#fbf8f0] p-2 rounded-lg border border-[#d5c3aa] shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#7a5b28] flex-shrink-0 mt-0.5" />
              <span className="leading-snug font-vazir text-[11px]">{rule}</span>
            </div>
          ))}
        </div>

        {/* Royal Wax Seal & Sign-off */}
        <div className="flex items-center justify-between pt-2 border-t border-[#7d6542]/25 text-[#7d6542] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#8c2a1e] text-[#ffd2cc] flex items-center justify-center font-bold text-[10px] shadow-sm">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="font-garamond text-xs font-semibold">
              مهر و موم در اسکریپتوریوم
            </span>
          </div>
          <span className="font-garamond text-[10px] italic">
            {new Date().toLocaleDateString('fa-IR')}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#aa936d]/25">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRestartBook}
            className="p-1.5 rounded-full bg-[#eee4d0] hover:bg-[#e4d7bf] text-[#694e24] border border-[#d5c3aa] transition-colors"
            title="تکرار جلسه"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-1 rounded-full bg-[#eee4d0] hover:bg-[#e4d7bf] text-[#694e24] border border-[#d5c3aa] font-garamond text-xs font-bold flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-[#2a1d0f]" /> : <Share2 className="w-3 h-3" />}
            <span>{copied ? 'کپی شد' : 'کپی طومار'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isDoublePage && (
            <button
              onClick={() => {
                playPageTurnSound();
                setMobileLeaf(0);
              }}
              className="text-xs font-garamond text-[#694e24] flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3" />
              <span>لوح نخست</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-full bg-[#20140c] text-[#f2ca50] font-garamond font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#342014] transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>چاپ / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center relative bg-[#0e1013] select-none p-2 sm:p-5">
      {/* Candlelight Ambience */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-80 rounded-full bg-primary/10 blur-[100px]" />

      {/* Discreet Silk Bookmark Ribbon to Return to Shelf */}
      <div className="absolute top-0 right-6 z-40">
        <button
          onClick={onBackToBooks}
          className="group relative flex flex-col items-center pt-0 transition-transform active:translate-y-1"
          title="بستن کتاب و بازگشت به کتابخانه"
        >
          <div className="w-6 h-12 sm:h-14 bg-[#93000a] text-white rounded-b-sm shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center pb-1 border-x border-[#ffdad6]/20">
            <Bookmark className="w-3.5 h-3.5 text-[#ffe088] mt-1" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffe088]" />
          </div>
          <span className="font-garamond text-[10px] text-[#dec1b1] group-hover:text-primary mt-1 font-bold">
            بستن کتاب
          </span>
        </button>
      </div>

      {/* The Physical Double / Single Page Spread */}
      <div
        className={`relative ${
          isDoublePage
            ? 'w-full max-w-5xl h-[88vh] max-h-[720px] flex shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_90px_rgba(25,16,10,0.5)] rounded-2xl overflow-hidden border border-[#523e2b]/60'
            : 'w-full max-w-md h-[92vh] flex shadow-2xl rounded-xl overflow-hidden border border-[#523e2b]/60'
        }`}
      >
        {isDoublePage ? (
          <>
            {/* RIGHT PAGE */}
            <div className="w-1/2 h-full bg-[#f4eee0] relative overflow-hidden rounded-r-xl border-r border-[#d5c3aa]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#20140c]/25 via-[#20140c]/10 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#20140c]/15 to-transparent z-10" />
              {renderRightPage()}
            </div>

            {/* CENTER SPINE CREASE */}
            <div className="w-6 h-full bg-gradient-to-r from-[#20140c]/20 via-[#120a05]/45 to-[#20140c]/20 absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" />

            {/* LEFT PAGE */}
            <div className="w-1/2 h-full bg-[#f4eee0] relative overflow-hidden rounded-l-xl border-l border-[#d5c3aa]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#20140c]/25 via-[#20140c]/10 to-transparent z-10" />
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/15 to-transparent z-10" />
              {renderLeftPage()}
            </div>
          </>
        ) : (
          /* MOBILE SINGLE PAGE */
          <div className="w-full h-full bg-[#f4eee0] relative overflow-hidden rounded-xl border border-[#d5c3aa]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-7 bg-gradient-to-l from-[#20140c]/20 via-[#20140c]/10 to-transparent z-10" />
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#20140c]/12 to-transparent z-10" />
            {mobileLeaf === 0 ? renderRightPage() : renderLeftPage()}
          </div>
        )}
      </div>
    </div>
  );
};
