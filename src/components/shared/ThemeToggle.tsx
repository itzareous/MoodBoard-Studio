import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-12 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
    >
      <motion.div
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 rounded-full flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: isDark ? 180 : 0,
            opacity: 1
          }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={12} className="text-zinc-400" />
          ) : (
            <Sun size={12} className="text-zinc-600" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}