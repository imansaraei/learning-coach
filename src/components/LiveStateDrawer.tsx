import React from 'react';
import { X, Database, Copy, Check, Sparkles } from 'lucide-react';
import { BookCurriculum } from '../types/curriculum';

interface LiveStateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookCurriculum | null;
  userState: Record<string, any>;
}

export const LiveStateDrawer: React.FC<LiveStateDrawerProps> = ({
  isOpen,
  onClose,
  book,
  userState,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(userState || {}, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filledKeys = Object.keys(userState || {}).filter(
    (k) => userState[k] !== '' && userState[k] !== null && userState[k] !== undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                وضعیت زنده چهارچوب (USER_STATE_JSON)
              </h3>
              <p className="text-[10px] text-teal-400">
                ردگیری فشرده و بدون افزونگی متغیرهای کاربر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Architecture Concept Explainer */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-teal-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>معماری ردیابی کمینه‌گر (Compact State)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              به جای ارسال کل تاریخچه چت در هر نوبت، فقط این شیء ساختاریافته به مدل ارسال می‌شود. این کار هزینه مصرف توکن را تا ۹۵٪ کاهش داده و زیر ۰.۰۰۱ دلار نگه می‌دارد.
            </p>
          </div>

          {/* Book Info */}
          {book && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs">
              <span className="text-slate-400 block text-[11px]">کتاب فعال:</span>
              <span className="font-bold text-white text-xs">{book.titleFa}</span>
              <span className="text-[10px] text-teal-400 block mt-0.5">
                مدل: {book.frameworkNameFa}
              </span>
            </div>
          )}

          {/* Summary Badges */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block">
              متغیرهای ثبت‌شده ({filledKeys.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filledKeys.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  هنوز پاسخی ثبت نشده است.
                </span>
              ) : (
                filledKeys.map((key) => (
                  <span
                    key={key}
                    className="text-[10px] bg-teal-950/60 border border-teal-800/60 text-teal-300 px-2 py-0.5 rounded-md font-mono"
                  >
                    ✓ {key}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Live JSON Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-mono text-[11px]">JSON Payload</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 text-[11px] text-teal-300 font-mono overflow-x-auto max-h-96 leading-relaxed dir-ltr text-left">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800 text-center text-[10px] text-slate-500 bg-slate-950">
          وضعیت در حافظه مرورگر ذخیره می‌شود.
        </div>
      </div>
    </div>
  );
};
