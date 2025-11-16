import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';

export default function GridCanvas() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200"
    >
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex items-center justify-center transition-colors duration-200">
          <Grid3x3 size={40} className="text-primary transition-colors duration-200" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors duration-200">
          Grid View
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-sm transition-colors duration-200">
          Grid layout coming soon. Switch to Freeform mode to start creating!
        </p>
      </div>
    </motion.div>
  );
}