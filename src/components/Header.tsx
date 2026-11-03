import React from 'react';
import { BookOpen, Settings, ArrowRight, Volume2, VolumeX, Activity } from 'lucide-react';
import { BookCurriculum } from '../types/curriculum';

interface HeaderProps {
  currentBook: BookCurriculum | null;
  currentModuleIndex: number;
  onBackToBooks: () => void;
  onToggleStateDrawer: () => void;
  onOpenSettings: () => void;
  userStateKeyCount: number;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBook,
  currentModuleIndex,
  onBackToBooks,
  onToggleStateDrawer,
  onOpenSettings,
  userStateKeyCount,
  isAudioMuted,
  onToggleAudioMute,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-xl border-b border-[#232B3B] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand or Back */}
        <div className="flex items-center gap-3">
          {currentBook ? (
            <button
              onClick={onBackToBooks}
              className="flex items-center gap-2 text-xs font-mono font-medium text-silver-aero hover:text-white bg-surface-low hover:bg-surface-high border border-[#232B3B] hover:border-petronas-primary px-3 py-1.5 rounded transition"
              title="بازگشت به فهرست کتاب‌ها"
            >
              <ArrowRight className="w-3.5 h-3.5 text-petronas-secondary" />
              <span>فهرست کتاب‌ها</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-surface border border-petronas-primary/40 flex items-center justify-center text-petronas-secondary shadow-[0_0_12px_rgba(0,245,212,0.2)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-silver-platinum tracking-tight font-heading">
                    مربی یادگیری و بازطراحی رفتار
                  </h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-petronas-secondary animate-pulse" />
                  <span className="font-mono text-[10px] text-silver-graphite uppercase tracking-wider">
                    APPLIED TELEMETRY · 99.8% EFFICIENCY
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Module Progress in reading mode */}
        {currentBook && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-silver-platinum line-clamp-1">
              {currentBook.titleFa}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-petronas-secondary">
              <span className="tabular-nums">ماژول {currentModuleIndex + 1} / {currentBook.modules.length}</span>
              <div className="flex items-center gap-1">
                {currentBook.modules.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-sm transition-all duration-300 ${
                      idx === currentModuleIndex
                        ? 'w-6 bg-petronas-secondary shadow-[0_0_8px_rgba(0,245,212,0.6)]'
                        : idx < currentModuleIndex
                        ? 'w-2 bg-petronas-primary'
                        : 'w-2 bg-[#232B3B]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudioMute}
            className={`p-2 rounded border transition ${
              isAudioMuted
                ? 'bg-surface-low border-[#232B3B] text-silver-graphite hover:text-silver-aero'
                : 'bg-petronas-dark border-petronas-primary/50 text-petronas-secondary shadow-[0_0_8px_rgba(0,245,212,0.2)]'
            }`}
            title={isAudioMuted ? 'فعال‌سازی صوت خوانش' : 'بی‌صدا کردن خوانش صوتی'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Live Framework State Drawer Toggle */}
          <button
            onClick={onToggleStateDrawer}
            className="flex items-center gap-1.5 text-xs font-mono bg-surface-low hover:bg-surface-high border border-[#232B3B] hover:border-petronas-secondary/50 text-silver-aero hover:text-white px-2.5 py-1.5 rounded transition"
            title="مشاهده وضعیت بلوپرینت در قالب JSON فشرده"
          >
            <Activity className="w-3.5 h-3.5 text-petronas-secondary" />
            <span className="hidden sm:inline">STATE</span>
            {userStateKeyCount > 0 && (
              <span className="text-[10px] font-mono bg-petronas-primary text-canvas px-1 rounded-sm font-bold tabular-nums">
                {userStateKeyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded bg-surface-low hover:bg-surface-high border border-[#232B3B] hover:border-silver-aero text-silver-aero hover:text-white transition"
            title="تنظیمات مدل هوش مصنوعی و کلید API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
