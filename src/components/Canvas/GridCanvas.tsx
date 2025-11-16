import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';

export default function GridCanvas() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200"
    >
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-200">
          <Grid3x3 size={48} className="text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 transition-colors duration-200">
          Grid View
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
          Grid layout coming soon. Switch to Freeform mode to start creating!
        </p>
      </div>
    </motion.div>
  );
}