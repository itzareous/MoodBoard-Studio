import { motion } from 'framer-motion';
import { useBoards } from '@/context/BoardContext';
import FreeformCanvas from '@/components/Canvas/FreeformCanvas';
import GridCanvas from '@/components/Canvas/GridCanvas';

export default function Canvas() {
  const { activeBoard } = useBoards();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex-1 bg-gray-50 overflow-hidden"
    >
      {activeBoard?.viewMode === 'freeform' ? (
        <FreeformCanvas />
      ) : (
        <GridCanvas />
      )}
    </motion.main>
  );
}