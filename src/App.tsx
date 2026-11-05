import React, { useState, useEffect } from 'react';
import { BOOKS_CURRICULUM } from './data/booksCurriculum';
import { BookCurriculum, DynamicCoachingResult } from './types/curriculum';
import { User } from './types/auth';
import { authService } from './services/authService';
import { Header } from './components/Header';
import { BookSelector } from './components/BookSelector';
import { ModuleReader } from './components/ModuleReader';
import { LiveStateDrawer } from './components/LiveStateDrawer';
import { BlueprintArtifactCard } from './components/BlueprintArtifactCard';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { AdminModal } from './components/AdminModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const [currentBook, setCurrentBook] = useState<BookCurriculum | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'catalog' | 'module' | 'blueprint'>('catalog');
  const [isStateDrawerOpen, setIsStateDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isCandlelit, setIsCandlelit] = useState<boolean>(true); // default warm candlelight ambiance

  // Isolate state per user account
  const storageKey = currentUser
    ? `learning_coach_saved_user_states_${currentUser.username}`
    : 'learning_coach_saved_user_states_guest';

  const [savedStates, setSavedStates] = useState<Record<string, Record<string, any>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Re-load savedStates when active user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(storageKey);
      setSavedStates(stored ? JSON.parse(stored) : {});
    } catch {
      setSavedStates({});
    }
  }, [currentUser?.username, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedStates));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [savedStates, storageKey]);

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

    setSavedStates((prev) => {
      const bookState = prev[currentBook.id] || currentBook.initialUserState;
      const existingAuthored = bookState.authoredModules || {};
      const nextIdx = currentModuleIndex + 1;
      const updatedAuthored = result.generated_next_module
        ? { ...existingAuthored, [nextIdx]: result.generated_next_module }
        : existingAuthored;

      return {
        ...prev,
        [currentBook.id]: {
          ...bookState,
          ...result.updated_user_state,
          authoredModules: updatedAuthored,
          status: result.is_final_blueprint ? 'completed_blueprint' : 'in_progress'
        }
      };
    });
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
    setViewMode('blueprint');
  };

  const handleRestartBook = () => {
    if (!currentBook) return;
    setSavedStates((prev) => {
      return {
        ...prev,
        [currentBook.id]: {
          ...currentBook.initialUserState,
          authoredModules: {}
        }
      };
    });
    setCurrentModuleIndex(0);
    setViewMode('module');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentBook(null);
    setViewMode('catalog');
  };

  // If not logged in, show AuthScreen (with link to AdminModal)
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onLoginSuccess={(user) => setCurrentUser(user)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-vazir selection:bg-primary selection:text-on-primary transition-all duration-700 relative overflow-hidden">
      {/* Background Ambient Candlelight Orbs */}
      {isCandlelit && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full">
          <div className="desk-ambient-glow absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[720px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(242,202,80,0.12)_0%,transparent_70%)]" />
          <div className="desk-ambient-glow absolute -bottom-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-[600px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,143,56,0.08)_0%,transparent_70%)]" />
        </div>
      )}

      {/* Header */}
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
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />
      )}

      {/* Main View Area */}
      <main className={`relative z-10 flex-1 ${viewMode === 'catalog' ? 'pb-16' : 'overflow-hidden'}`}>
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
            authoredModules={activeUserState.authoredModules || {}}
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

      {/* Admin Portal Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
