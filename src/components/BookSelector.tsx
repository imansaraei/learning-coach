import React, { useState, useRef, useEffect } from 'react';
import { BookCurriculum } from '../types/curriculum';
import { Sparkles, ArrowLeft, BookOpen, Flame, CloudRain } from 'lucide-react';
import { playPageTurnSound } from '../services/soundService';

interface BookSelectorProps {
  books: BookCurriculum[];
  onSelectBook: (book: BookCurriculum) => void;
  savedStates: Record<string, Record<string, any>>;
  isCandlelit: boolean;
  onToggleCandlelight: () => void;
}

export const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  onSelectBook,
  savedStates,
  isCandlelit,
  onToggleCandlelight,
}) => {
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isRainPlaying, setIsRainPlaying] = useState<boolean>(false);
  const [openingState, setOpeningState] = useState<{
    book: BookCurriculum;
    phase: 'lifting' | 'opening';
  } | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleBookClick = (book: BookCurriculum) => {
    if (openingState) return;
    setOpeningState({ book, phase: 'lifting' });
    playPageTurnSound();

    const t1 = window.setTimeout(() => {
      setOpeningState({ book, phase: 'opening' });
    }, 280);

    const t2 = window.setTimeout(() => {
      onSelectBook(book);
      setOpeningState(null);
    }, 780);

    timeoutsRef.current.push(t1, t2);
  };

  // Book Spines physical styling mapping (matching Magic Books Scriptorium)
  const SPINE_STYLES: Record<string, {
    bg: string;
    text: string;
    authorColor: string;
    height: string;
    width: string;
    ribbonColor?: string;
    hasGildedRibs?: boolean;
    emblem: string;
    texture?: string;
  }> = {
    'power-of-habit': {
      bg: 'bg-[#d39e24]',
      text: 'text-[#241a00]',
      authorColor: 'text-[#3d2c02]',
      height: 'h-[250px]',
      width: 'w-[54px] sm:w-[58px]',
      ribbonColor: 'bg-[#93000a]',
      hasGildedRibs: true,
      emblem: 'cyclone',
    },
    'atomic-habits': {
      bg: 'bg-[#ede5d0]',
      text: 'text-[#423a2f]',
      authorColor: 'text-[#6b5f4d]',
      height: 'h-[242px]',
      width: 'w-[50px] sm:w-[54px]',
      emblem: 'flare',
    },
    'situated': {
      bg: 'bg-[#1a2e20]',
      text: 'text-[#f2ca50]',
      authorColor: 'text-[#9eb5a1]',
      height: 'h-[256px]',
      width: 'w-[52px] sm:w-[56px]',
      hasGildedRibs: true,
      emblem: 'compass_rose',
    },
    'thinking-fast-slow': {
      bg: 'bg-[#42151c]',
      text: 'text-[#ffe088]',
      authorColor: 'text-[#dec1b1]',
      height: 'h-[250px]',
      width: 'w-[56px] sm:w-[60px]',
      hasGildedRibs: true,
      emblem: 'neurology',
    },
    'crucial-conversations': {
      bg: 'bg-[#162740]',
      text: 'text-[#f2ca50]',
      authorColor: 'text-[#90a8cb]',
      height: 'h-[238px]',
      width: 'w-[50px] sm:w-[54px]',
      ribbonColor: 'bg-[#b7d1f2]',
      emblem: 'forum',
    },
  };

  const completedCount = Object.keys(savedStates).filter(
    (id) => savedStates[id]?.status === 'completed_blueprint'
  ).length;

  return (
    <div className="py-6 sm:py-8 px-3 sm:px-4 max-w-4xl mx-auto space-y-7">
      {/* Sanctum Vault Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center p-1 shadow-[0_2px_12px_rgba(212,175,55,0.25)] border border-primary/30">
            <span className="material-symbols-outlined text-[22px] text-primary drop-shadow-[0_0_8px_rgba(242,202,80,0.6)]">
              local_library
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(242,202,80,0.8)]" />
              <span className="font-sans text-[11px] text-primary tracking-widest uppercase font-semibold">
                Sanctum Codex Vault
              </span>
            </div>
            <h2 className="font-garamond text-xl sm:text-2xl font-bold text-on-surface leading-tight">
              کتابخانه مدل‌های ذهنی کاربردی (The Grand Scriptorium)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] border border-outline-variant/30">
          <span className="material-symbols-outlined text-[16px] text-primary">
            local_fire_department
          </span>
          <span className="font-sans text-xs text-secondary font-semibold">
            {completedCount} بلوپرینت کامل‌شده
          </span>
        </div>
      </div>

      {/* Filter Arcana Scrolls (Horizontal Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-nowrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`font-sans text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
            activeCategory === 'all'
              ? 'bg-primary text-on-primary font-bold shadow-[0_2px_10px_rgba(242,202,80,0.35)]'
              : 'bg-surface-container text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">auto_stories</span>
          <span>تمام کتاب‌ها (All Codices)</span>
        </button>

        <button
          onClick={() => setActiveCategory('habits')}
          className={`font-sans text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
            activeCategory === 'habits'
              ? 'bg-primary text-on-primary font-bold shadow-[0_2px_10px_rgba(242,202,80,0.35)]'
              : 'bg-surface-container text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">flare</span>
          <span>کیمیای عادت (Habit Alchemy)</span>
        </button>

        <button
          onClick={() => setActiveCategory('cognition')}
          className={`font-sans text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
            activeCategory === 'cognition'
              ? 'bg-primary text-on-primary font-bold shadow-[0_2px_10px_rgba(242,202,80,0.35)]'
              : 'bg-surface-container text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">psychology</span>
          <span>علوم شناختی و گفتگو</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3D PHYSICAL BOOKSHELF SECTION (The Folio Shelf) */}
      {/* ========================================================= */}
      <div className="relative w-full flex flex-col pt-2">
        {/* Shelf Upper Shadow Cavity (Deep Bookcase Recess) */}
        <div className="relative w-full h-[300px] bg-gradient-to-b from-[#090b0e] via-[#12100d] to-[#1d1712] rounded-t-2xl px-4 pt-6 flex items-end justify-around sm:justify-center sm:gap-6 overflow-visible shadow-shelf-recess border-t border-x border-[#2a1a10]">
          {/* Ambient Candlelight Radial Halo */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(242,202,80,0.2)_0%,transparent_65%)]" />

          {/* Interactive Spines */}
          {books.map((book) => {
            const style = SPINE_STYLES[book.id] || {
              bg: 'bg-[#d39e24]',
              text: 'text-[#241a00]',
              authorColor: 'text-[#3d2c02]',
              height: 'h-[246px]',
              width: 'w-[54px]',
              emblem: 'menu_book',
            };

            const isHovered = hoveredBookId === book.id;
            const userState = savedStates[book.id];
            const isCompleted = userState?.status === 'completed_blueprint';

            return (
              <div
                key={book.id}
                onMouseEnter={() => setHoveredBookId(book.id)}
                onMouseLeave={() => setHoveredBookId(null)}
                onClick={() => handleBookClick(book)}
                className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 z-20 ${
                  isHovered ? '-translate-y-5 scale-[1.03]' : 'hover:-translate-y-2'
                }`}
              >
                {/* Glowing Aura Behind Drawn Tome */}
                {isHovered && (
                  <div className="absolute -inset-2 bg-primary/30 blur-md rounded-md pointer-events-none" />
                )}

                {/* Pulled Tome Tooltip */}
                {isHovered && (
                  <div className="absolute -top-11 z-40 whitespace-nowrap bg-surface-container-lowest/95 text-primary border border-primary/50 px-2.5 py-1 rounded-full shadow-[0_4px_16px_rgba(242,202,80,0.4)] backdrop-blur-md flex items-center gap-1.5 animate-bounce">
                    <span className="material-symbols-outlined text-[13px]">touch_app</span>
                    <span className="font-sans text-[10px] font-bold tracking-wide">
                      کلیک برای مطالعه
                    </span>
                  </div>
                )}

                {/* Hanging Ribbon Bookmark */}
                {style.ribbonColor && (
                  <div
                    className={`absolute -top-3.5 right-2 w-2.5 h-10 ${style.ribbonColor} rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-end justify-center pb-0.5 z-30`}
                  >
                    <div className="w-1 h-1 rounded-full bg-primary-fixed" />
                  </div>
                )}

                {/* Spine Body */}
                <div
                  className={`relative ${style.width} ${style.height} ${style.bg} rounded-t-sm flex flex-col justify-between items-center py-3 shadow-spine-depth transition-shadow duration-300`}
                >
                  {/* Top Fabric Headband */}
                  <div className="w-full h-1.5 bg-black/30 shadow-inner mb-1" />

                  {/* Raised Ribs & Vertical Title */}
                  <div className="w-full flex flex-col gap-6 items-center px-1">
                    {style.hasGildedRibs && (
                      <div className="w-full h-1 bg-black/25 shadow-[0_1px_1px_rgba(255,255,255,0.3)] rounded-full" />
                    )}

                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[15px] opacity-80 mb-1.5">
                        {style.emblem}
                      </span>
                      <span
                        className={`font-garamond text-[12px] sm:text-[13px] ${style.text} font-bold tracking-wide uppercase [writing-mode:vertical-rl] rotate-180 drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]`}
                      >
                        {book.titleEn.split(':')[0]}
                      </span>
                    </div>

                    {style.hasGildedRibs && (
                      <div className="w-full h-1 bg-black/25 shadow-[0_1px_1px_rgba(255,255,255,0.3)] rounded-full" />
                    )}
                  </div>

                  {/* Bottom Author & Stamp */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`font-sans text-[8px] ${style.authorColor} tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 font-bold`}
                    >
                      {book.authorEn.split(' ')[book.authorEn.split(' ').length - 1]}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-black/20 flex items-center justify-center text-[8px] font-garamond font-bold">
                      {isCompleted ? '✓' : '✦'}
                    </div>
                  </div>

                  {/* Bottom Headband */}
                  <div className="w-full h-1 bg-black/30 shadow-inner mt-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* SHELF WOOD PLANK (3D Thick Aged Mahogany) */}
        <div className="relative w-full">
          {/* Beveled Top Edge (Catches Candlelight) */}
          <div className="w-full h-3 bg-gradient-to-r from-[#59341c] via-[#85502c] to-[#59341c] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]" />

          {/* Main Wood Face with Brass Nameplate */}
          <div className="w-full h-8 bg-gradient-to-b from-[#382012] to-[#211209] flex items-center justify-between px-4 sm:px-6 shadow-shelf-plank">
            {/* Vintage Brass Bracket Left */}
            <div className="w-3 h-3 rounded-full bg-[#826932] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#3d2e11]" />
            </div>

            {/* Brass Center Label Holder */}
            <div className="bg-gradient-to-b from-[#8f753c] via-[#bba15a] to-[#735c2d] px-4 py-0.5 rounded-xs flex items-center gap-2 shadow-[0_2px_5px_rgba(0,0,0,0.6)]">
              <span className="material-symbols-outlined text-[13px] text-[#261c06]">
                auto_stories
              </span>
              <span className="font-sans text-[10px] sm:text-[11px] text-[#241a00] font-bold tracking-widest uppercase">
                Tier I • Primus Arcana // ۵ جلد حکمت عملی
              </span>
            </div>

            {/* Vintage Brass Bracket Right */}
            <div className="w-3 h-3 rounded-full bg-[#826932] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#3d2e11]" />
            </div>
          </div>

          {/* Underside Drop Shadow */}
          <div className="w-full h-5 bg-gradient-to-b from-[#110905] to-transparent" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* DETAILED CODICES LIST (Modern Manuscript Cards) */}
      {/* ========================================================= */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
            <h3 className="text-base font-bold text-on-surface font-garamond">
              فهرست تفصیلی مجلدات (The Codices)
            </h3>
          </div>
          <span className="text-xs text-secondary font-sans">
            انتخاب مستقیم برای شروع جلسه
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => {
            const userState = savedStates[book.id];
            const hasProgress = userState && Object.keys(userState).some((k) => Boolean(userState[k]));
            const isCompleted = userState?.status === 'completed_blueprint';

            return (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="group relative bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 hover:border-primary/60 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-gold-glow"
              >
                <div>
                  {/* Top Row: Icon & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-primary/30 text-primary flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="text-[11px] font-sans font-bold text-primary bg-primary/10 border border-primary/40 px-2.5 py-0.5 rounded-full">
                          ✓ بلوپرینت تکمیل شد
                        </span>
                      ) : hasProgress ? (
                        <span className="text-[11px] font-sans font-semibold text-secondary bg-surface-container-highest border border-secondary/40 px-2.5 py-0.5 rounded-full">
                          در جریان
                        </span>
                      ) : (
                        <span className="text-[11px] font-sans text-on-surface-variant bg-surface-container-lowest px-2.5 py-0.5 rounded-full">
                          آماده شروع
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h4 className="text-base sm:text-lg font-bold text-on-surface font-garamond group-hover:text-primary transition-colors leading-tight mb-1">
                    {book.titleFa}
                  </h4>
                  <p className="text-xs text-secondary font-sans mb-3">
                    نویسنده: <span className="text-on-surface font-medium">{book.authorFa}</span> ({book.authorEn})
                  </p>

                  {/* Framework Badge */}
                  <div className="bg-surface-container-lowest/80 border border-outline-variant/40 text-[11px] text-primary px-3 py-1 rounded-md mb-3 font-sans inline-block">
                    مدل: {book.frameworkNameFa}
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                    {book.taglineFa}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-sans">
                  <span className="text-on-surface-variant">
                    {book.modules.length} ماژول (~۱۵ دقیقه)
                  </span>

                  <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-[-3px] transition-transform">
                    <span>{hasProgress ? 'ادامه جلسه' : 'ورود به اسکریپتوریوم'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING SANCTUM AMBIANCE HUD */}
      {/* ========================================================= */}
      <div className="sticky bottom-3 w-full z-40">
        <div className="relative w-full bg-surface-container-high/90 backdrop-blur-xl p-2.5 rounded-2xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-outline-variant/50">
          <div className="flex items-center gap-2">
            {/* Candle Toggle */}
            <button
              onClick={onToggleCandlelight}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans transition-all active:scale-95 ${
                isCandlelit
                  ? 'bg-surface-container-highest text-primary border border-primary/50 shadow-[0_0_10px_rgba(242,202,80,0.3)]'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              <Flame className={`w-4 h-4 ${isCandlelit ? 'text-primary fill-primary animate-pulse' : ''}`} />
              <span className="hidden sm:inline">نور شمع</span>
            </button>

            {/* Rain Sound Toggle */}
            <button
              onClick={() => setIsRainPlaying((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans transition-all active:scale-95 ${
                isRainPlaying
                  ? 'bg-surface-container-highest text-tertiary border border-tertiary/50'
                  : 'bg-surface-container text-on-surface-variant hover:text-tertiary'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>باران آرام: {isRainPlaying ? 'روشن' : 'خاموش'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-sans text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>اتاق مطالعه زنده</span>
          </div>
        </div>
      </div>

      {/* 3D Book Drag Out and Opening Animation Overlay */}
      {openingState && (() => {
        const book = openingState.book;
        const style = SPINE_STYLES[book.id];
        const isOpening = openingState.phase === 'opening';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
              {/* 3D Book Stage with Perspective */}
              <div className="relative w-64 h-88 sm:w-72 sm:h-96 [perspective:1200px]">
                {/* Book Body (elevates during phase 1) */}
                <div className="relative w-full h-full preserve-3d animate-book-elevation">
                  {/* Underlying Parchment Interior (Revealed when front cover swings open) */}
                  <div className="absolute inset-0 bg-[#f8f3e6] rounded-r-lg rounded-l-sm shadow-2xl p-6 sm:p-7 flex flex-col justify-between border border-[#d5c3aa] overflow-hidden">
                    {/* Shadow cast over the page during cover swing */}
                    <div
                      className={`absolute inset-0 bg-black/50 pointer-events-none transition-opacity ${
                        isOpening ? 'animate-page-shadow' : 'opacity-70'
                      }`}
                    />

                    {/* Subtle Top Filigree & English Title */}
                    <div className="relative z-10 flex flex-col items-center text-center pt-4">
                      <div className="w-10 h-10 rounded-full bg-[#eee5d3] border border-[#d4af37]/50 flex items-center justify-center text-[#996515] mb-3 shadow-inner">
                        <span className="material-symbols-outlined text-[20px]">
                          {style?.emblem || 'auto_stories'}
                        </span>
                      </div>
                      <span className="font-garamond text-[11px] text-[#785b30] uppercase tracking-widest font-bold mb-1">
                        {book.titleEn}
                      </span>
                      <h3 className="font-garamond text-xl sm:text-2xl font-bold text-[#22180f] leading-snug">
                        {book.titleFa}
                      </h3>
                      <div className="w-16 h-0.5 bg-[#d4af37] my-3" />
                      <p className="font-sans text-xs text-[#694e24] leading-relaxed max-w-[220px]">
                        {book.taglineFa}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative z-10 flex items-center justify-between text-xs font-sans text-[#846b4b] border-t border-[#d5c3aa]/60 pt-3">
                      <span>{book.authorFa}</span>
                      <span className="font-garamond text-[#996515] font-bold">
                        ✦ {book.frameworkNameFa}
                      </span>
                    </div>
                  </div>

                  {/* Front Cover Flipping Open (Hinged at Right Edge for RTL) */}
                  <div
                    className={`absolute inset-0 origin-right preserve-3d ${
                      isOpening ? 'animate-book-cover-swing' : ''
                    }`}
                  >
                    {/* Front Face of Cover (Visible during closed / lifting phase) */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-l from-[#1d120a] via-[#331c10] to-[#20120a] rounded-r-lg rounded-l-sm shadow-2xl p-6 sm:p-7 flex flex-col justify-between border-2 border-[#d4af37]/70">
                      {/* Spine Leather Binding Accent (Right Edge) */}
                      <div className="absolute top-0 right-0 bottom-0 w-3 bg-gradient-to-l from-black/50 to-transparent border-l border-[#d4af37]/30 pointer-events-none" />

                      {/* Header Badge */}
                      <div className="w-full flex justify-between items-center text-[#d4af37]">
                        <span className="material-symbols-outlined text-[20px]">
                          {style?.emblem || 'auto_stories'}
                        </span>
                        <span className="font-garamond text-xs font-bold tracking-widest uppercase text-[#d4af37]/90">
                          {book.authorEn.split(' ').pop()}
                        </span>
                      </div>

                      {/* Center Emblem & Title */}
                      <div className="text-center my-auto py-2">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-[#d4af37]/50 flex items-center justify-center bg-black/25 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                          <span className="material-symbols-outlined text-[24px] text-[#f2ca50]">
                            {style?.emblem || 'auto_stories'}
                          </span>
                        </div>
                        <h3 className="font-garamond text-2xl font-extrabold text-[#f2ca50] mb-2 drop-shadow-md leading-tight">
                          {book.titleFa}
                        </h3>
                        <p className="font-sans text-xs sm:text-sm text-[#dec1b1] font-medium">
                          {book.authorFa}
                        </p>
                      </div>

                      {/* Footer Badge */}
                      <div className="w-full text-center text-[#d4af37] text-xs font-garamond border-t border-[#d4af37]/30 pt-2.5">
                        ✦ {book.frameworkNameFa} ✦
                      </div>
                    </div>

                    {/* Back Face of Cover (Inside Lining, visible after -160deg swing) */}
                    <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-gradient-to-r from-[#24170f] to-[#352115] rounded-l-lg rounded-r-sm p-6 flex flex-col justify-between border-2 border-[#a6822c]/50 shadow-inner">
                      <div className="w-full h-full border border-[#a6822c]/30 rounded p-4 flex flex-col items-center justify-center text-center bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)]">
                        <span className="material-symbols-outlined text-[26px] text-[#a6822c]/60 mb-2">
                          auto_stories
                        </span>
                        <span className="font-garamond text-xs text-[#d4af37]/70 tracking-widest uppercase">
                          {book.titleEn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <p className="mt-8 text-primary font-garamond text-sm sm:text-base font-bold animate-pulse">
                {isOpening
                  ? 'در حال گشودن صفحات...'
                  : 'در حال بیرون کشیدن کتاب از قفسه...'}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
