import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Keyboard, MessageCircle, Info, Palette } from 'lucide-react';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onOpenAppearance: () => void;
  onOpenKeyboardShortcuts: () => void;
  onOpenFeedback: () => void;
  onOpenAbout: () => void;
}

export default function SettingsPopover({ 
  isOpen, 
  onClose, 
  buttonRef,
  onOpenAppearance,
  onOpenKeyboardShortcuts,
  onOpenFeedback,
  onOpenAbout
}: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const popoverStyle = buttonRect
    ? {
        position: 'fixed' as const,
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right,
      }
    : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={popoverStyle}
          className="w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 z-50 transition-colors duration-200"
        >
          <div className="space-y-1">
            {/* Appearance Section */}
            <button
              onClick={() => {
                onClose();
                onOpenAppearance();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
            >
              <Palette size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">Appearance</span>
            </button>

            <div className="border-t border-zinc-200 dark:border-zinc-700 my-2" />

            {/* Actions Section */}
            <button
              onClick={() => {
                console.log('Export Board');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
            >
              <Download size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">Export Board</span>
            </button>

            <button
              onClick={() => {
                console.log('Clear Board');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-3"
            >
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">Clear Board</span>
            </button>

            <div className="border-t border-zinc-200 dark:border-zinc-700 my-2" />

            {/* Help Section */}
            <button
              onClick={() => {
                onClose();
                onOpenKeyboardShortcuts();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
            >
              <Keyboard size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">Keyboard Shortcuts</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFeedback();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
            >
              <MessageCircle size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">Send Feedback</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAbout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
            >
              <Info size={16} className="text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-zinc-900 dark:text-zinc-50">About Curate</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}