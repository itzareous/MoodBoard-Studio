import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onGroupSelection: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export default function ContextMenu({
  isOpen,
  position,
  onClose,
  onGroupSelection,
  onDeleteSelected,
  hasSelection
}: ContextMenuProps) {
  if (!hasSelection) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible overlay to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Context Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 50,
            }}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-2 shadow-lg min-w-[200px]"
          >
            {/* Group Selection */}
            <button
              onClick={() => {
                onGroupSelection();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Group Selection
            </button>
            
            <div className="border-t border-zinc-200 dark:border-zinc-700 my-1" />
            
            {/* Delete Selected */}
            <button
              onClick={() => {
                onDeleteSelected();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
