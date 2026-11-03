import React from 'react';
import { X, Copy, Check, Terminal, Activity } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-canvas/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface border-l border-[#232B3B] h-full flex flex-col shadow-modal-elevation animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#232B3B] flex items-center justify-between bg-surface-low">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface border border-petronas-primary/40 text-petronas-secondary flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-silver-platinum uppercase tracking-wider">
                  LIVE TELEMETRY // USER_STATE_JSON
                </h3>
              </div>
              <p className="font-mono text-[10px] text-petronas-secondary">
                COMPACT STATE REDUCTION LAYER
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-silver-graphite hover:text-white hover:bg-surface-high transition"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Architecture Explainer */}
          <div className="bg-surface-low border border-[#232B3B] rounded p-3 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-petronas-secondary font-bold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>TOKEN OPTIMIZATION // &lt;$0.001 PER TURN</span>
            </div>
            <p className="text-[11px] text-silver-aero leading-relaxed">
              به جای ارسال کل تاریخچه چت، این آبجکت فشرده برای هر فراخوانی فرستاده می‌شود. این امر هزینه و تأخیر مدل را تا ۹۵٪ کاهش می‌دهد.
            </p>
          </div>

          {/* Book Info */}
          {book && (
            <div className="bg-surface-low border border-[#232B3B] rounded p-3 text-xs">
              <span className="font-mono text-[10px] text-silver-graphite block uppercase">ACTIVE STREAM:</span>
              <span className="font-bold text-silver-platinum text-xs">{book.titleFa}</span>
              <span className="font-mono text-[10px] text-petronas-secondary block mt-0.5">
                MODEL: {book.frameworkNameFa}
              </span>
            </div>
          )}

          {/* Summary Badges */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] text-silver-graphite block uppercase">
              REGISTERED TELEMETRY KEYS ({filledKeys.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filledKeys.length === 0 ? (
                <span className="font-mono text-xs text-silver-graphite italic">
                  NO TELEMETRY RECORDED YET.
                </span>
              ) : (
                filledKeys.map((key) => (
                  <span
                    key={key}
                    className="font-mono text-[10px] bg-petronas-dark border border-petronas-primary/40 text-petronas-secondary px-2 py-0.5 rounded-sm"
                  >
                    ✓ {key}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Live JSON Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-silver-graphite mb-1.5 font-mono">
              <span className="text-[10px] uppercase">JSON PAYLOAD</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-silver-aero hover:text-petronas-secondary bg-surface-low px-2 py-0.5 rounded border border-[#232B3B] transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-petronas-tertiary" />
                    <span className="text-petronas-tertiary">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPY JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-canvas border border-[#232B3B] rounded p-3 text-[11px] text-petronas-secondary font-mono overflow-x-auto max-h-96 leading-relaxed dir-ltr text-left">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#232B3B] text-center font-mono text-[10px] text-silver-graphite bg-surface-low uppercase">
          PERSISTED IN LOCALSTORAGE // SESSION SYNC OK
        </div>
      </div>
    </div>
  );
};
