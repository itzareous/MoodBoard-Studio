import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Minus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import DraggableImageCard from '@/components/Image/DraggableImageCard';

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export default function FreeformCanvas() {
  const { activeBoard, addImage } = useBoards();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 400;
          const scale = Math.min(1, maxWidth / img.width);
          
          addImage({
            id: `img-${Date.now()}-${Math.random()}`,
            src: e.target?.result as string,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            width: img.width * scale,
            height: img.height * scale,
            rotation: 0
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, [addImage]);

  const zoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level >= zoom);
    const nextIndex = Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1);
    setZoom(ZOOM_LEVELS[nextIndex]);
  }, [zoom]);

  const zoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setZoom(ZOOM_LEVELS[prevIndex]);
  }, [zoom]);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom mode
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(4, zoom + delta));
      setZoom(newZoom);
    } else {
      // Pan mode - trackpad scroll
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedImageId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const canZoomIn = zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const canZoomOut = zoom > ZOOM_LEVELS[0];

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200"
      style={{
        backgroundImage: `radial-gradient(circle, rgb(212 212 216) 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        cursor: 'grab'
      }}
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
        }}
      >
        <motion.div
          ref={contentRef}
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformOrigin: 'center center' }}
          className="relative w-[3000px] h-[3000px]"
        >
          {activeBoard?.images.map((image) => (
            <DraggableImageCard
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onSelect={() => setSelectedImageId(image.id)}
            />
          ))}
        </motion.div>
      </div>

      {/* Empty state */}
      {(!activeBoard?.images || activeBoard.images.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 flex items-center justify-center transition-colors duration-200">
              <Upload size={40} className="text-primary transition-colors duration-200" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors duration-200">
              Click to upload or drag images here
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm transition-colors duration-200">
              Start building your mood board in freeform mode
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 pointer-events-auto"
            >
              Upload Images
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload button */}
      {activeBoard?.images && activeBoard.images.length > 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-6 right-32 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 flex items-center gap-2 z-10"
        >
          <Upload size={18} />
          Add Images
        </button>
      )}

      {/* Zoom controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 right-6 bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-600 rounded-lg shadow-lg flex items-center gap-2 px-3 py-2 z-10 transition-colors duration-200"
      >
        <button
          onClick={zoomOut}
          disabled={!canZoomOut}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-700 dark:hover:bg-zinc-700 transition-colors duration-200 ${
            !canZoomOut ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Minus size={16} className="text-white dark:text-zinc-50" />
        </button>
        
        <button
          onClick={resetZoom}
          className="px-3 py-1 text-sm font-medium text-white dark:text-zinc-50 hover:bg-zinc-700 dark:hover:bg-zinc-700 rounded transition-colors duration-200 min-w-[60px]"
        >
          {Math.round(zoom * 100)}%
        </button>
        
        <button
          onClick={zoomIn}
          disabled={!canZoomIn}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-700 dark:hover:bg-zinc-700 transition-colors duration-200 ${
            !canZoomIn ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Plus size={16} className="text-white dark:text-zinc-50" />
        </button>
      </motion.div>
    </div>
  );
}