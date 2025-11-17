import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ClearBoardModalProps {
  isOpen: boolean;
  boardName: string;
  imageCount: number;
  groupCount: number;
  noteCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearBoardModal({
  isOpen,
  boardName,
  imageCount,
  groupCount,
  noteCount,
  onClose,
  onConfirm
}: ClearBoardModalProps) {
  const totalItems = imageCount + groupCount + noteCount;

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
            className="fixed inset-0 bg-black/50 z-[80]"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      Clear Board?
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
              
              {/* Content */}
              <div className="mb-6">
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Are you sure you want to clear all content from <span className="font-semibold">"{boardName}"</span>?
                </p>
                
                {totalItems > 0 && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                      {imageCount > 0 && (
                        <li>• {imageCount} {imageCount === 1 ? 'image' : 'images'}</li>
                      )}
                      {groupCount > 0 && (
                        <li>• {groupCount} {groupCount === 1 ? 'group' : 'groups'}</li>
                      )}
                      {noteCount > 0 && (
                        <li>• {noteCount} {noteCount === 1 ? 'note' : 'notes'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
                >
                  Clear Board
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
