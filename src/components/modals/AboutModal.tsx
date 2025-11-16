import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
              className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1" />
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200"
                >
                  <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <img
                    src="/images/curate logo.svg"
                    alt="Curate"
                    className="h-16 w-auto dark:hidden"
                  />
                  <img
                    src="/images/curate logo dark.svg"
                    alt="Curate"
                    className="h-16 w-auto hidden dark:block"
                  />
                </div>

                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Curate
                </h2>

                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  A moodboard studio
                </p>

                <div className="pt-4 pb-2">
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Version 1.0.0
                  </p>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                  Create beautiful mood boards with ease. Organize your inspiration in grid or freeform layouts.
                </p>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Built with ❤️ using React & Tailwind CSS
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
