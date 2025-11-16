import { motion } from 'framer-motion';
import { Grid3x3, Maximize2, Share2, Settings } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import Button from '@/components/shared/Button';

export default function TopBar() {
  const { activeBoard, setViewMode } = useBoards();

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10"
    >
      {/* Left: Board name */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {activeBoard?.name || 'Untitled Board'}
        </h2>
      </div>

      {/* Center: View mode toggle */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            activeBoard?.viewMode === 'grid'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setViewMode('grid')}
        >
          <Grid3x3 size={16} />
          Grid
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
            activeBoard?.viewMode === 'freeform'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
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
        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => console.log('Settings')}
        >
          <Settings size={20} className="text-muted-foreground" />
        </button>
      </div>
    </motion.header>
  );
}