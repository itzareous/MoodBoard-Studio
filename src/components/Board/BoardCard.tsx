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
        p-3 rounded-lg cursor-pointer transition-all
        ${isActive 
          ? 'bg-primary/10 border-2 border-primary shadow-md' 
          : 'bg-white border border-border hover:shadow-md'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Thumbnail placeholder */}
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0 flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        
        {/* Board info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate mb-1">
            {board.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {board.images.length} images
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {board.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
