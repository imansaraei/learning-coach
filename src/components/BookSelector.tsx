import React, { useState, useRef, useEffect } from 'react';
import { BookCurriculum } from '../types/curriculum';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
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
}) => {
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || 'situated');
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
    setSelectedBookId(book.id);
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

  // Physical Book Spine Styling & Proportions
  const SPINE_STYLES: Record<string, {
    bg: string;
    text: string;
    authorColor: string;
    height: string;
    width: string;
    ribbonColor?: string;
    emblem: string;
    spineTitle: string;
    authorLastName: string;
  }> = {
    'situated': {
      bg: 'bg-[#183020]',
      text: 'text-[#e5bf4c]',
      authorColor: 'text-[#8da390]',
      height: 'h-[252px]',
      width: 'w-[52px] sm:w-[58px]',
      emblem: 'explore',
      spineTitle: 'SITUATED',
      authorLastName: 'DUCKWORTH',
    },
    'power-of-habit': {
      bg: 'bg-[#b8861b]',
      text: 'text-[#211600]',
      authorColor: 'text-[#3d2c02]',
      height: 'h-[246px]',
      width: 'w-[54px] sm:w-[60px]',
      ribbonColor: 'bg-[#8a141b]',
      emblem: 'cyclone',
      spineTitle: 'POWER OF HABIT',
      authorLastName: 'DUHIGG',
    },
    'atomic-habits': {
      bg: 'bg-[#ded6c2]',
      text: 'text-[#363027]',
      authorColor: 'text-[#5e5343]',
      height: 'h-[238px]',
      width: 'w-[50px] sm:w-[56px]',
      emblem: 'flare',
      spineTitle: 'ATOMIC HABITS',
      authorLastName: 'CLEAR',
    },
    'thinking-fast-slow': {
      bg: 'bg-[#3b1219]',
      text: 'text-[#f5d989]',
      authorColor: 'text-[#dec1b1]',
      height: 'h-[248px]',
      width: 'w-[56px] sm:w-[62px]',
      emblem: 'psychology',
      spineTitle: 'FAST & SLOW',
      authorLastName: 'KAHNEMAN',
    },
    'crucial-conversations': {
      bg: 'bg-[#142338]',
      text: 'text-[#eec54d]',
      authorColor: 'text-[#8ba2c4]',
      height: 'h-[240px]',
      width: 'w-[50px] sm:w-[56px]',
      ribbonColor: 'bg-[#8cb1dd]',
      emblem: 'forum',
      spineTitle: 'CRUCIAL TALKS',
      authorLastName: 'PATTERSON',
    },
  };

  const activeBookId = hoveredBookId || selectedBookId;
  const activeBook = books.find((b) => b.id === activeBookId) || books[0];
  const activeState = savedStates[activeBook.id];
  const hasProgress = activeState && Object.keys(activeState).some((k) => Boolean(activeState[k]) && k !== 'status');
  const isCompleted = activeState?.status === 'completed_blueprint';

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto flex flex-col items-center space-y-8 animate-in fade-in duration-500">
      {/* Minimal Header */}
      <div className="text-center space-y-1.5">
        <h2 className="font-garamond text-2xl sm:text-3xl font-bold text-on-surface tracking-wide">
          قفسهٔ کتاب‌ها
        </h2>
        <p className="font-sans text-xs sm:text-sm text-secondary">
          برای گشودن هر کتاب، روی عطف آن کلیک کنید.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3D PHYSICAL BOOKSHELF (Hero Centered)                      */}
      {/* ========================================================= */}
      <div className="w-full flex flex-col items-center">
        {/* Bookshelf Cavity (Recess) */}
        <div className="relative w-full h-[290px] sm:h-[305px] bg-gradient-to-b from-[#090b0e] via-[#13100d] to-[#1c1611] rounded-t-2xl px-4 sm:px-8 flex items-end justify-center gap-3 sm:gap-6 border-t border-x border-[#2d1d13]/50 shadow-[inset_0_8px_30px_rgba(0,0,0,0.85)]">
          {/* Subtle Warm Amber Glow Behind Spines */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(242,202,80,0.12)_0%,transparent_60%)]" />

          {/* Interactive Spines */}
          {books.map((book) => {
            const style = SPINE_STYLES[book.id] || {
              bg: 'bg-[#183020]',
              text: 'text-[#e5bf4c]',
              authorColor: 'text-[#8da390]',
              height: 'h-[246px]',
              width: 'w-[52px]',
              emblem: 'menu_book',
              spineTitle: book.titleEn.slice(0, 14),
              authorLastName: book.authorEn.split(' ').pop() || '',
            };

            const isSelected = activeBookId === book.id;
            const userState = savedStates[book.id];
            const bookCompleted = userState?.status === 'completed_blueprint';
            const isBeingOpened = openingState?.book.id === book.id;

            return (
              <div
                key={book.id}
                onMouseEnter={() => {
                  setHoveredBookId(book.id);
                  setSelectedBookId(book.id);
                }}
                onMouseLeave={() => setHoveredBookId(null)}
                onClick={() => handleBookClick(book)}
                className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 z-20 sm:hover:-translate-y-3 ${
                  isBeingOpened ? '-translate-y-6 scale-105' : 'translate-y-0'
                }`}
              >
                {/* Ribbon Bookmark */}
                {style.ribbonColor && (
                  <div
                    className={`absolute -top-3.5 right-2 w-2.5 h-8 ${style.ribbonColor} rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-30`}
                  />
                )}

                {/* Spine Body — Strictly overflow-hidden so zero text can dangle */}
                <div
                  className={`relative ${style.width} ${style.height} ${style.bg} rounded-t-sm flex flex-col justify-between items-center py-2.5 overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300 border-x border-black/25 ${
                    isSelected ? 'ring-1 ring-primary/60' : ''
                  }`}
                >
                  {/* Top Fabric Headband */}
                  <div className="w-full h-1 bg-black/40 mb-1 shrink-0" />

                  {/* Top Emblem */}
                  <span className="material-symbols-outlined text-[13px] opacity-75 shrink-0 mb-1 select-none">
                    {style.emblem}
                  </span>

                  {/* Top Gilded Rib */}
                  <div className="w-full h-0.5 bg-black/30 shadow-[0_1px_1px_rgba(255,255,255,0.2)] shrink-0 mb-1.5" />

                  {/* Spine Title (Vertical Foil Stamp, strictly centered and bound) */}
                  <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden w-full px-1">
                    <span
                      className={`font-garamond text-[11px] sm:text-[12px] ${style.text} font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 select-none whitespace-nowrap`}
                    >
                      {style.spineTitle}
                    </span>
                  </div>

                  {/* Bottom Gilded Rib */}
                  <div className="w-full h-0.5 bg-black/30 shadow-[0_1px_1px_rgba(255,255,255,0.2)] shrink-0 mt-1.5" />

                  {/* Bottom Author Stamp */}
                  <div className="shrink-0 flex flex-col items-center gap-0.5 mt-1">
                    <span
                      className={`font-sans text-[8px] sm:text-[9px] ${style.authorColor} font-bold tracking-wider uppercase select-none`}
                    >
                      {style.authorLastName}
                    </span>
                    {bookCompleted && (
                      <span className="text-[9px] text-[#f2ca50] leading-none">✓</span>
                    )}
                  </div>

                  {/* Bottom Fabric Headband */}
                  <div className="w-full h-1 bg-black/40 mt-1 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* SHELF SOLID WOOD PLANK (Clean Aged Mahogany, No Tacky Brass Plate) */}
        <div className="w-full">
          {/* Beveled Top Edge Catching Light */}
          <div className="w-full h-2.5 bg-gradient-to-r from-[#4d2c17] via-[#754425] to-[#4d2c17] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />
          {/* Main Plank Face */}
          <div className="w-full h-5 bg-gradient-to-b from-[#2e180d] to-[#1a0d07] shadow-lg" />
          {/* Soft Shadow Cast Downward */}
          <div className="w-full h-4 bg-gradient-to-b from-[#100804]/80 to-transparent" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* FOCUSED BOOK DETAIL CARD (Minimal, Clean & Replaces 7 Cards) */}
      {/* ========================================================= */}
      <div className="w-full max-w-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/35 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-md text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-xs text-secondary font-medium">
                {activeBook.authorFa}
              </span>
              {isCompleted ? (
                <span className="text-[10px] font-sans font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تکمیل‌شده</span>
                </span>
              ) : hasProgress ? (
                <span className="text-[10px] font-sans text-secondary bg-surface-container-high border border-outline-variant/50 px-2 py-0.5 rounded-full">
                  در جریان مطالعه
                </span>
              ) : null}
            </div>

            <h3 className="font-garamond text-xl sm:text-2xl font-bold text-on-surface leading-tight break-words">
              {activeBook.titleFa}
            </h3>

            <div className="font-sans text-xs text-primary font-medium">
              مدل: {activeBook.frameworkNameFa}
            </div>

            <p className="font-sans text-xs text-on-surface-variant leading-relaxed max-w-md pt-1">
              {activeBook.taglineFa}
            </p>
          </div>

          {/* Open Book Action Button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => handleBookClick(activeBook)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-primary text-on-primary font-garamond font-bold text-sm flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(242,202,80,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>گشودن کتاب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3D BOOK DRAG OUT AND OPENING ANIMATION OVERLAY           */}
      {/* ========================================================= */}
      {openingState && (() => {
        const book = openingState.book;
        const isOpening = openingState.phase === 'opening';
        const style = SPINE_STYLES[book.id];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
              {/* 3D Book Container — Explicit pixel dimensions on all mobile & desktop screens */}
              <div className="relative w-[240px] h-[340px] sm:w-[280px] sm:h-[400px] [perspective:1400px]">
                <div className="relative w-full h-full preserve-3d animate-book-elevation">
                  {/* Inside Page (Right Page) */}
                  <div className="absolute inset-0 bg-[#f4eee0] rounded-r-lg rounded-l-sm shadow-2xl p-6 flex flex-col justify-between border border-[#d5c3aa] overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-black/50 pointer-events-none transition-opacity ${
                        isOpening ? 'animate-page-shadow' : 'opacity-70'
                      }`}
                    />

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

                    <div className="relative z-10 flex items-center justify-between text-xs font-sans text-[#846b4b] border-t border-[#d5c3aa]/60 pt-3">
                      <span>{book.authorFa}</span>
                      <span className="font-garamond text-[#996515] font-bold">
                        ✦ {book.frameworkNameFa}
                      </span>
                    </div>
                  </div>

                  {/* Front Cover Flipping Open */}
                  <div
                    className={`absolute inset-0 origin-right preserve-3d ${
                      isOpening ? 'animate-book-cover-swing' : ''
                    }`}
                  >
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-l from-[#1d120a] via-[#331c10] to-[#20120a] rounded-r-lg rounded-l-sm shadow-2xl p-6 sm:p-7 flex flex-col justify-between border-2 border-[#d4af37]/70">
                      <div className="w-full flex justify-between items-center text-[#d4af37]">
                        <span className="material-symbols-outlined text-[20px]">
                          {style?.emblem || 'auto_stories'}
                        </span>
                        <span className="font-garamond text-xs font-bold tracking-widest uppercase text-[#d4af37]/90">
                          {book.authorEn.split(' ').pop()}
                        </span>
                      </div>

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

                      <div className="w-full text-center text-[#d4af37] text-xs font-garamond border-t border-[#d4af37]/30 pt-2.5">
                        ✦ {book.frameworkNameFa} ✦
                      </div>
                    </div>

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
