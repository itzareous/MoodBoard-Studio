import { motion } from 'framer-motion';

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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-md' 
          : 'bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-600'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Thumbnail placeholder */}
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex-shrink-0 flex items-center justify-center transition-colors duration-200">
          <span className="text-2xl">🎨</span>
        </div>
        
        {/* Board info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate mb-1 transition-colors duration-200">
            {board.name}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
            {board.images.length} images
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 transition-colors duration-200">
            {board.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}