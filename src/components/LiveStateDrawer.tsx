import React from 'react';
import { X, Copy, Check, Sparkles, Feather } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-surface-dim/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface-container border-l border-outline-variant/60 h-full flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/40">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-garamond font-bold text-on-surface">
                وضعیت زنده چهارچوب (USER_STATE_JSON)
              </h3>
              <p className="font-sans text-[10px] text-primary">
                SANCTUM STATE ARCHIVE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-vazir">
          {/* Architecture Explainer */}
          <div className="bg-surface-container-lowest/80 border border-outline-variant/40 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-garamond text-sm text-primary font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>معماری ردیابی فشرده (Compact State Reduction)</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              این سند به جای تاریخچه‌های سنگین چت نگهداری می‌شود و در هر دور تنها داده‌های خالص روان‌شناختی به مدل ارسال می‌شود (هزینه زیر ۰.۰۰۱ دلار).
            </p>
          </div>

          {/* Book Info */}
          {book && (
            <div className="bg-surface-container-high/60 border border-outline-variant/40 rounded-xl p-3 text-xs">
              <span className="font-sans text-[10px] text-secondary block uppercase">کتاب فعال:</span>
              <span className="font-bold text-on-surface text-sm font-garamond">{book.titleFa}</span>
              <span className="font-sans text-[11px] text-primary block mt-0.5">
                مدل ذهنی: {book.frameworkNameFa}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="space-y-1.5">
            <span className="font-sans text-[11px] text-on-surface-variant block font-semibold">
              متغیرهای ثبت‌شده در اسکریپتوریوم ({filledKeys.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filledKeys.length === 0 ? (
                <span className="font-sans text-xs text-outline italic">
                  هنوز پاسخی در این جلسه ثبت نشده است.
                </span>
              ) : (
                filledKeys.map((key) => (
                  <span
                    key={key}
                    className="font-sans text-[10px] bg-primary/10 border border-primary/30 text-primary px-2.5 py-0.5 rounded-full font-medium"
                  >
                    ✓ {key}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* JSON Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5 font-sans">
              <span className="text-[11px]">ساختار فنی داده‌ها</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-primary bg-surface-container-high px-2.5 py-1 rounded-md border border-outline-variant/40 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-primary" />
                    <span className="text-primary">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3.5 text-[11px] text-primary font-mono overflow-x-auto max-h-96 leading-relaxed dir-ltr text-left">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-outline-variant/40 text-center font-sans text-[10px] text-outline bg-surface-container-high">
          ذخیره‌شده در حافظه محلی مرورگر (Session Sync OK)
        </div>
      </div>
    </div>
  );
};
