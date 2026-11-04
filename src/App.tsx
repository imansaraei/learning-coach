import React, { useState, useEffect } from 'react';
import { BOOKS_CURRICULUM } from './data/booksCurriculum';
import { BookCurriculum, DynamicCoachingResult } from './types/curriculum';
import { Header } from './components/Header';
import { BookSelector } from './components/BookSelector';
import { ModuleReader } from './components/ModuleReader';
import { LiveStateDrawer } from './components/LiveStateDrawer';
import { BlueprintArtifactCard } from './components/BlueprintArtifactCard';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_STATES_KEY = 'learning_coach_saved_user_states';

export const App: React.FC = () => {
  const [currentBook, setCurrentBook] = useState<BookCurriculum | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'catalog' | 'module' | 'blueprint'>('catalog');
  const [isStateDrawerOpen, setIsStateDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isCandlelit, setIsCandlelit] = useState<boolean>(true); // default warm candlelight ambiance
  const [savedStates, setSavedStates] = useState<Record<string, Record<string, any>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_STATES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATES_KEY, JSON.stringify(savedStates));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [savedStates]);

  const activeUserState = currentBook
    ? savedStates[currentBook.id] || currentBook.initialUserState
    : {};

  const handleSelectBook = (book: BookCurriculum) => {
    setCurrentBook(book);
    const existingState = savedStates[book.id];
    if (existingState?.status === 'completed_blueprint') {
      setViewMode('blueprint');
    } else {
      let firstUnfinished = 0;
      for (let i = 0; i < book.modules.length; i++) {
        const key = book.modules[i].interactivePrompt.stateTargetKey;
        if (!existingState || !existingState[key]) {
          firstUnfinished = i;
          break;
        }
      }
      setCurrentModuleIndex(firstUnfinished);
      setViewMode('module');
    }
  };

  const handleBackToBooks = () => {
    setCurrentBook(null);
    setViewMode('catalog');
  };

  const handleCompleteModuleTurn = (result: DynamicCoachingResult) => {
    if (!currentBook) return;

    setSavedStates((prev) => ({
      ...prev,
      [currentBook.id]: {
        ...(prev[currentBook.id] || currentBook.initialUserState),
        ...result.updated_user_state,
        ...(result.is_final_blueprint ? { status: 'completed_blueprint' } : {})
      }
    }));
  };

  const handleGoToNextModule = () => {
    if (!currentBook) return;
    if (currentModuleIndex < currentBook.modules.length - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
    } else {
      setViewMode('blueprint');
    }
  };

  const handleShowBlueprint = () => {
    if (currentBook) {
      setSavedStates((prev) => ({
        ...prev,
        [currentBook.id]: {
          ...(prev[currentBook.id] || currentBook.initialUserState),
          status: 'completed_blueprint'
        }
      }));
    }
    setViewMode('blueprint');
  };

  const handleRestartBook = () => {
    if (!currentBook) return;
    setSavedStates((prev) => {
      const copy = { ...prev };
      delete copy[currentBook.id];
      return copy;
    });
    setCurrentModuleIndex(0);
    setViewMode('module');
  };

  return (
    <div
      className={`min-h-screen bg-surface text-on-surface flex flex-col font-vazir selection:bg-primary selection:text-on-primary transition-all duration-700 ${
        isCandlelit ? 'candle-glow' : ''
      }`}
    >
      {/* Header (Only displayed in catalog mode to keep the opened book pure and uncluttered) */}
      {viewMode === 'catalog' && (
        <Header
          currentBook={currentBook}
          currentModuleIndex={currentModuleIndex}
          onBackToBooks={handleBackToBooks}
          onToggleStateDrawer={() => setIsStateDrawerOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          userStateKeyCount={
            Object.keys(activeUserState).filter(
              (k) => activeUserState[k] && k !== 'status'
            ).length
          }
          isAudioMuted={isAudioMuted}
          onToggleAudioMute={() => setIsAudioMuted((prev) => !prev)}
          isCandlelit={isCandlelit}
          onToggleCandlelight={() => setIsCandlelit((prev) => !prev)}
        />
      )}

      {/* Main View Area */}
      <main className={`flex-1 ${viewMode === 'catalog' ? 'pb-16' : 'overflow-hidden'}`}>
        {viewMode === 'catalog' && (
          <BookSelector
            books={BOOKS_CURRICULUM}
            onSelectBook={handleSelectBook}
            savedStates={savedStates}
            isCandlelit={isCandlelit}
            onToggleCandlelight={() => setIsCandlelit((prev) => !prev)}
          />
        )}

        {viewMode === 'module' && currentBook && (
          <ModuleReader
            book={currentBook}
            moduleIndex={currentModuleIndex}
            userState={activeUserState}
            onCompleteModuleTurn={handleCompleteModuleTurn}
            onGoToNextModule={handleGoToNextModule}
            onShowBlueprint={handleShowBlueprint}
            onCloseBook={handleBackToBooks}
            isAudioMuted={isAudioMuted}
            onToggleAudioMute={() => setIsAudioMuted((prev) => !prev)}
          />
        )}

        {viewMode === 'blueprint' && currentBook && (
          <BlueprintArtifactCard
            book={currentBook}
            userState={activeUserState}
            onBackToBooks={handleBackToBooks}
            onRestartBook={handleRestartBook}
          />
        )}
      </main>

      {/* Live Framework State Drawer */}
      <LiveStateDrawer
        isOpen={isStateDrawerOpen}
        onClose={() => setIsStateDrawerOpen(false)}
        book={currentBook}
        userState={activeUserState}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
