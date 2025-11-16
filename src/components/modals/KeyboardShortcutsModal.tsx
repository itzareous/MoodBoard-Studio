import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { action: 'New Board', keys: ['⌘', 'N'] },
  { action: 'Upload Image', keys: ['⌘', 'U'] },
  { action: 'Delete Image', keys: ['Delete'] },
  { action: 'Zoom In', keys: ['⌘', '+'] },
  { action: 'Zoom Out', keys: ['⌘', '-'] },
  { action: 'Reset Zoom', keys: ['⌘', '0'] },
  { action: 'Pan Canvas', keys: ['Space', '+', 'Drag'] },
  { action: 'Toggle Theme', keys: ['⌘', 'Shift', 'T'] },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200"
                >
                  <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors duration-200"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {shortcut.action}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg px-2 py-1 text-sm font-mono text-zinc-900 dark:text-zinc-50">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && key !== '+' && (
                            <span className="text-zinc-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
