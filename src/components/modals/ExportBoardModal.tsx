import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileJson, FolderArchive } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';

interface ExportBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportBoardModal({ isOpen, onClose }: ExportBoardModalProps) {
  const { activeBoard } = useBoards();
  const [exporting, setExporting] = useState(false);

  const exportAsJSON = () => {
    setExporting(true);
    
    try {
      // Create export data
      const exportData = {
        name: activeBoard.name,
        images: activeBoard.images,
        groups: activeBoard.groups,
        notes: activeBoard.notes,
        viewMode: activeBoard.viewMode,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeBoard.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export board. Please try again.');
      setExporting(false);
    }
  };

  const exportImagesAsZip = async () => {
    setExporting(true);
    
    try {
      if (activeBoard.images.length === 0) {
        alert('No images to export!');
        setExporting(false);
        return;
      }
      
      // Download each image
      activeBoard.images.forEach((image, index) => {
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `${activeBoard.name}-image-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export images. Please try again.');
      setExporting(false);
    }
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
            className="fixed inset-0 bg-black/50 z-[80]"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Export Board
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {activeBoard.name}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
              
              {/* Export Options */}
              <div className="space-y-3">
                {/* Export as JSON */}
                <button
                  onClick={exportAsJSON}
                  disabled={exporting}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Export as JSON
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Download board data for backup or sharing
                    </p>
                  </div>
                </button>
                
                {/* Export Images */}
                <button
                  onClick={exportImagesAsZip}
                  disabled={exporting || activeBoard.images.length === 0}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderArchive className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Download Images
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {activeBoard.images.length === 0 
                        ? 'No images to export'
                        : `Download all ${activeBoard.images.length} images`
                      }
                    </p>
                  </div>
                </button>
              </div>
              
              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 px-6 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
