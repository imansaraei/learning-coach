import React from 'react';
import { Settings, ArrowRight, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
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
}) => {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-3 min-w-0">
          {currentBook ? (
            <button
              onClick={onBackToBooks}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-on-surface-variant hover:text-primary bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0"
              title="بازگشت به قفسه کتاب‌ها"
            >
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
              <span>بازگشت به کتابخانه</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-primary/30 text-primary shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-garamond text-base sm:text-lg font-bold text-on-surface leading-tight truncate">
                  کتاب‌های جادویی
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] text-secondary truncate">
                  مربی یادگیری و بازطراحی رفتار
                </span>
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
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudioMute}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              isAudioMuted
                ? 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface'
                : 'bg-surface-container-high border-primary/40 text-primary'
            }`}
            title={isAudioMuted ? 'فعال‌سازی صوت خوانش' : 'بی‌صدا کردن خوانش صوتی'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Live Framework State Drawer Toggle (Only in reading mode) */}
          {currentBook && (
            <button
              onClick={onToggleStateDrawer}
              className="flex items-center gap-1.5 text-xs font-sans bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface px-3 py-1.5 rounded-full transition-all active:scale-95"
              title="مشاهده وضعیت بلوپرینت"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline font-medium">سند زنده</span>
              {userStateKeyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {userStateKeyCount}
                </span>
              )}
            </button>
          )}

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-all active:scale-95"
            title="تنظیمات هوش مصنوعی و کلید API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
