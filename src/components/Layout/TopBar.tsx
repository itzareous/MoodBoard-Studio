import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Maximize2, Share2, Settings, Pencil } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import SettingsPopover from '@/components/shared/SettingsPopover';
import FeedbackModal from '@/components/modals/FeedbackModal';
import KeyboardShortcutsModal from '@/components/modals/KeyboardShortcutsModal';
import AppearanceModal from '@/components/modals/AppearanceModal';

export default function TopBar() {
  const { activeBoard, setViewMode, updateBoardName } = useBoards();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(activeBoard?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update edit value when active board changes
  useEffect(() => {
    setEditValue(activeBoard?.name || '');
  }, [activeBoard?.name]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(activeBoard?.name || '');
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== activeBoard?.name && activeBoard) {
      updateBoardName(activeBoard.id, trimmed);
    } else {
      setEditValue(activeBoard?.name || ''); // Reset if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(activeBoard?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-8 py-4 sticky top-0 z-50 transition-colors duration-200"
      >
        {/* Left: Board name */}
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 bg-transparent border-b-2 border-blue-500 focus:outline-none px-1 transition-colors duration-200"
              style={{ minWidth: '200px' }}
            />
          ) : (
            <>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
                {activeBoard?.name || 'Untitled Board'}
              </h2>
              
              {isHovered && (
                <button
                  onClick={handleStartEdit}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              )}
            </>
          )}
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
          onOpenAbout={() => {}}
        />
      </motion.header>

      {/* Modals */}
      <AppearanceModal isOpen={showAppearance} onClose={() => setShowAppearance(false)} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </>
  );
}