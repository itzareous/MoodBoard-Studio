import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center px-2 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <img src="/images/dark theme.svg" alt="Dark mode" className="w-6 h-6" />
        ) : (
          <img src="/images/light theme.svg" alt="Light mode" className="w-6 h-6" />
        )}
      </motion.div>
    </motion.button>
  );
}