import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Maximize2, Share2, Settings } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import SettingsPopover from '@/components/shared/SettingsPopover';
import FeedbackModal from '@/components/modals/FeedbackModal';
import KeyboardShortcutsModal from '@/components/modals/KeyboardShortcutsModal';
import AboutModal from '@/components/modals/AboutModal';
import AppearanceModal from '@/components/modals/AppearanceModal';

export default function TopBar() {
  const { activeBoard, setViewMode } = useBoards();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-8 py-4 sticky top-0 z-10 transition-colors duration-200"
      >
        {/* Left: Board name */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
            {activeBoard?.name || 'Untitled Board'}
          </h2>
        </div>

        {/* Center: View mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 transition-colors duration-200">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
              activeBoard?.viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 size={16} />
            Grid
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
              activeBoard?.viewMode === 'freeform'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
            onClick={() => setViewMode('freeform')}
          >
            <Maximize2 size={16} />
            Freeform
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
            onClick={() => console.log('Share board')}
          >
            <Share2 size={16} />
            Share
          </button>
          <button
            ref={settingsButtonRef}
            className="w-10 h-10 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings
              size={20}
              className="text-zinc-600 dark:text-zinc-400 transition-colors duration-200"
            />
          </button>
        </div>

        <SettingsPopover
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          buttonRef={settingsButtonRef}
          onOpenAppearance={() => setShowAppearance(true)}
          onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
          onOpenFeedback={() => setShowFeedback(true)}
          onOpenAbout={() => setShowAbout(true)}
        />
      </motion.header>

      {/* Modals */}
      <AppearanceModal isOpen={showAppearance} onClose={() => setShowAppearance(false)} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}