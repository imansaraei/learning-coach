import React from 'react';
import { Settings, ArrowRight, Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
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
  isCandlelit: boolean;
  onToggleCandlelight: () => void;
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
  isCandlelit,
  onToggleCandlelight,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/40 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand or Back */}
        <div className="flex items-center gap-3">
          {currentBook ? (
            <button
              onClick={onBackToBooks}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-on-surface-variant hover:text-primary bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 px-3 py-1.5 rounded-full transition-all active:scale-95"
              title="بازگشت به کتابخانه"
            >
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
              <span>کتابخانه</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Magic Books Candlelight Emblem */}
              <div className="relative w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center p-1 shadow-[0_2px_12px_rgba(212,175,55,0.3)] border border-primary/40">
                <span className="material-symbols-outlined text-[20px] text-primary drop-shadow-[0_0_8px_rgba(242,202,80,0.6)]">
                  auto_stories
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(242,202,80,0.8)]" />
                  <span className="font-sans text-[10px] text-primary tracking-widest uppercase font-semibold">
                    SANCTUM CODEX VAULT
                  </span>
                </div>
                <h1 className="text-base font-bold text-on-surface font-garamond tracking-wide leading-none">
                  مربی یادگیری و بازطراحی رفتار
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Center: Module Progress in reading mode */}
        {currentBook && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-serif font-bold text-primary line-clamp-1">
              {currentBook.titleFa}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-sans text-secondary font-medium">
              <span>گام {currentModuleIndex + 1} از {currentBook.modules.length}</span>
              <div className="flex items-center gap-1">
                {currentBook.modules.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentModuleIndex
                        ? 'w-5 bg-primary shadow-[0_0_8px_rgba(242,202,80,0.8)]'
                        : idx < currentModuleIndex
                        ? 'w-2 bg-primary-container'
                        : 'w-2 bg-outline-variant/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Candlelight Toggle */}
          <button
            onClick={onToggleCandlelight}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              isCandlelit
                ? 'bg-surface-container-high border-primary/60 text-primary shadow-[0_0_12px_rgba(242,202,80,0.3)]'
                : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
            }`}
            title={isCandlelit ? 'خاموش کردن نور شمع' : 'روشن کردن نور شمع'}
          >
            <Flame className={`w-4 h-4 ${isCandlelit ? 'text-primary fill-primary animate-pulse' : ''}`} />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudioMute}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              isAudioMuted
                ? 'bg-surface-container border-outline-variant/40 text-outline hover:text-on-surface'
                : 'bg-surface-container-high border-primary/50 text-primary shadow-[0_0_10px_rgba(242,202,80,0.2)]'
            }`}
            title={isAudioMuted ? 'فعال‌سازی صوت خوانش' : 'بی‌صدا کردن خوانش صوتی'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Live Framework State Drawer Toggle */}
          <button
            onClick={onToggleStateDrawer}
            className="flex items-center gap-1.5 text-xs font-sans bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 hover:border-primary/50 text-on-surface px-3 py-1.5 rounded-full transition-all active:scale-95"
            title="مشاهده وضعیت بلوپرینت در قالب سند فشرده"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline font-medium">سند زنده</span>
            {userStateKeyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {userStateKeyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface-variant hover:text-primary transition"
            title="تنظیمات هوش مصنوعی و کلید API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
