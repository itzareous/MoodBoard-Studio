import { motion } from 'framer-motion';
import { Grid3x3, Maximize2, Share2, Settings } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import Button from '@/components/shared/Button';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function TopBar() {
  const { activeBoard, setViewMode } = useBoards();

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="h-16 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-200"
    >
      {/* Left: Board name */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
          {activeBoard?.name || 'Untitled Board'}
        </h2>
      </div>

      {/* Center: View mode toggle */}
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1 transition-colors duration-200">
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
            activeBoard?.viewMode === 'grid'
              ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
          onClick={() => setViewMode('grid')}
        >
          <Grid3x3 size={16} />
          Grid
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
            activeBoard?.viewMode === 'freeform'
              ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-zinc-50'
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
        <Button 
          variant="secondary" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => console.log('Share board')}
        >
          <Share2 size={16} />
          Share
        </Button>
        <ThemeToggle />
        <button
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200"
          onClick={() => console.log('Settings')}
        >
          <Settings size={20} className="text-zinc-600 dark:text-zinc-400 transition-colors duration-200" />
        </button>
      </div>
    </motion.header>
  );
}