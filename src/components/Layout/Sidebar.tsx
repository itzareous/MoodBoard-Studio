import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import { useTheme } from '@/context/ThemeContext';
import BoardCard from '@/components/Board/BoardCard';
import Button from '@/components/shared/Button';

export default function Sidebar() {
  const { boards, activeBoard, setActiveBoard } = useBoards();
  const { theme } = useTheme();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-[280px] h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 flex flex-col transition-colors duration-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
        <div className="mb-6">
          <img 
            src={theme === 'dark' ? '/images/curate logo dark.svg' : '/images/curate logo.svg'}
            alt="Curate" 
            className="h-10 w-auto mb-2"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
            A moodboard studio
          </p>
        </div>
        <Button 
          variant="primary" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => console.log('Create new board')}
        >
          <Plus size={18} />
          New Board
        </Button>
      </div>

      {/* Board list */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-6 space-y-3"
      >
        {boards.map((board) => (
          <motion.div key={board.id} variants={item}>
            <BoardCard
              board={board}
              isActive={activeBoard?.id === board.id}
              onClick={() => {
                console.log('Switching to board:', board.name);
                setActiveBoard(board);
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.aside>
  );
}