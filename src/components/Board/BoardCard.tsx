import { motion } from 'framer-motion';
import { DraftingCompass } from 'lucide-react';

interface Board {
  id: string;
  name: string;
  images: any[];
  createdAt: Date;
  viewMode: 'grid' | 'freeform';
}

interface BoardCardProps {
  board: Board;
  isActive: boolean;
  onClick: () => void;
}

export default function BoardCard({ board, isActive, onClick }: BoardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        p-5 rounded-3xl cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-zinc-100 dark:bg-zinc-700 border-2 border-zinc-400 dark:border-zinc-500' 
          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Icon container */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex-shrink-0 flex items-center justify-center transition-colors duration-200">
          <DraftingCompass className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
        </div>
        
        {/* Board info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate mb-1 transition-colors duration-200">
            {board.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
            {board.images.length} images
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 transition-colors duration-200">
            {board.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}