import React from 'react';
import { BookOpen, Settings, Database, ArrowRight, Volume2, VolumeX } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back or Brand */}
        <div className="flex items-center gap-3">
          {currentBook ? (
            <button
              onClick={onBackToBooks}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition"
              title="بازگشت به فهرست کتاب‌ها"
            >
              <ArrowRight className="w-4 h-4" />
              <span>فهرست کتاب‌ها</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  مربی یادگیری و بازطراحی رفتار
                </h1>
                <p className="text-[10px] text-teal-400 hidden sm:block">
                  Applied Nonfiction Learning & Behavioral Coaching
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Module Progress in reading mode */}
        {currentBook && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-200 line-clamp-1">
              {currentBook.titleFa}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-teal-400 font-medium">
              <span>گام {currentModuleIndex + 1} از {currentBook.modules.length}</span>
              <div className="flex items-center gap-0.5 mr-1">
                {currentBook.modules.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentModuleIndex
                        ? 'w-5 bg-teal-400'
                        : idx < currentModuleIndex
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-700'
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
            className={`p-2 rounded-xl border transition ${
              isAudioMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-teal-950/40 border-teal-800/60 text-teal-400 hover:bg-teal-900/40'
            }`}
            title={isAudioMuted ? 'فعال‌سازی صوت خوانش' : 'بی‌صدا کردن خوانش صوتی'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Live Framework State Drawer Toggle */}
          <button
            onClick={onToggleStateDrawer}
            className="relative flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition"
            title="مشاهده وضعیت بلوپرینت در قالب JSON فشرده"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">بلوپرینت زنده</span>
            {userStateKeyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {userStateKeyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="تنظیمات مدل هوش مصنوعی و کلید API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
