import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emojis = ['😡', '😐', '😊', '😎', '😍'];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

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

  const handleSubmit = () => {
    console.log('Feedback submitted:', { emoji: selectedEmoji, feedback });
    setSelectedEmoji(null);
    setFeedback('');
    onClose();
  };

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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Send feedback,</h2>
                  <p className="text-base text-zinc-400">We read them all!</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors duration-200"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              {/* Emoji Reactions */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEmoji(index)}
                    className={`text-4xl p-2 rounded-2xl transition-all duration-200 ${
                      selectedEmoji === index
                        ? 'bg-zinc-800 scale-110'
                        : 'hover:bg-zinc-800/50 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Text Area */}
              <div className="mb-6">
                <label className="block text-sm text-zinc-300 mb-2">
                  How can we improve your experience?
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback..."
                  rows={6}
                  className="w-full bg-zinc-800 dark:bg-zinc-700 border border-zinc-700 rounded-2xl p-4 text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white rounded-full py-3 font-medium transition-colors duration-200"
              >
                Send Feedback
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
