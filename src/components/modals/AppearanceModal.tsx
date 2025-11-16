import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ThemeOption = 'system' | 'light' | 'dark';

interface ThemeCardProps {
  theme: ThemeOption;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, label, description, selected, onClick }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Preload images
  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      const restImg = new Image();
      const activeImg = new Image();
      restImg.src = `/images/${theme} theme - rest.png`;
      activeImg.src = `/images/${theme} theme.png`;
    }
  }, [theme]);

  const showActive = isHovered || selected;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer ${
        selected
          ? 'border-blue-500 bg-zinc-800/50'
          : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/50'
      }`}
    >
      {/* Radio Button & Label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'
        }`}>
          {selected && <Check size={14} className="text-white" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      
      {/* Image Preview */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800">
        {theme === 'system' ? (
          <div className="h-32 flex">
            {/* Light half */}
            <div className="w-1/2 bg-white flex items-center justify-center">
              <div className="w-12 h-12 bg-zinc-100 rounded-lg border border-zinc-200" />
            </div>
            {/* Dark half */}
            <div className="w-1/2 bg-zinc-900 flex items-center justify-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg border border-zinc-700" />
            </div>
          </div>
        ) : (
          <>
            {/* Rest state image */}
            <img 
              src={`/images/${theme} theme - rest.png`}
              alt={`${label} theme`}
              className="w-full h-32 object-cover transition-opacity duration-300"
              style={{ opacity: showActive ? 0 : 1 }}
            />
            {/* Active state image */}
            <img 
              src={`/images/${theme} theme.png`}
              alt={`${label} theme active`}
              className="absolute inset-0 w-full h-32 object-cover transition-opacity duration-300"
              style={{ opacity: showActive ? 1 : 0 }}
            />
          </>
        )}
      </div>
    </button>
  );
}

export default function AppearanceModal({ isOpen, onClose }: AppearanceModalProps) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-zinc-950 rounded-3xl p-8 border border-zinc-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Appearance</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
                >
                  <X size={20} className="text-zinc-200" />
                </button>
              </div>

              {/* Theme Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ThemeCard
                  theme="system"
                  label="System"
                  description="Adapts to your device"
                  selected={theme === 'system'}
                  onClick={() => setTheme('system')}
                />
                
                <ThemeCard
                  theme="light"
                  label="Light"
                  description="Bright and clear"
                  selected={theme === 'light'}
                  onClick={() => setTheme('light')}
                />
                
                <ThemeCard
                  theme="dark"
                  label="Dark"
                  description="Easy on the eyes"
                  selected={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}