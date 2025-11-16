import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Minus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import DraggableImageCard from '@/components/Image/DraggableImageCard';

export default function FreeformCanvas() {
  const { activeBoard, addImage } = useBoards();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach((file) => {
      try {
        // Validate file type
        if (!validTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Only JPG, PNG, GIF, WEBP allowed.`);
          return;
        }

        // Validate file size
        if (file.size > maxSize) {
          alert(`File too large: ${file.name}. Maximum size is 10MB.`);
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (!e.target?.result) return;
          
          const img = new Image();
          
          img.onload = () => {
            const maxWidth = 400;
            const scale = Math.min(1, maxWidth / img.width);
            
            addImage({
              id: `img-${Date.now()}-${Math.random()}`,
              src: e.target!.result as string,
              x: 100 + Math.random() * 200,
              y: 100 + Math.random() * 200,
              width: img.width * scale,
              height: img.height * scale,
              rotation: 0
            });
          };
          
          img.onerror = () => {
            alert(`Failed to load image: ${file.name}`);
          };
          
          img.src = e.target.result as string;
        };
        
        reader.onerror = () => {
          alert(`Failed to read file: ${file.name}`);
        };
        
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}. Please try again.`);
      }
    });
  }, [addImage]);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(4, prev + 0.1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.25, prev - 0.1));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom mode with mouse cursor as anchor point
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(4, zoom + delta));
      
      // Calculate the point in the canvas that's under the mouse
      const zoomPoint = {
        x: (mouseX - panOffset.x) / zoom,
        y: (mouseY - panOffset.y) / zoom
      };
      
      // Calculate new pan to keep that point under the mouse
      const newPan = {
        x: mouseX - zoomPoint.x * newZoom,
        y: mouseY - zoomPoint.y * newZoom
      };
      
      setZoom(newZoom);
      setPanOffset(newPan);
    } else {
      // Pan mode - trackpad scroll
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [zoom, panOffset]);

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

  const canZoomIn = zoom < 4;
  const canZoomOut = zoom > 0.25;

  const images = activeBoard?.images || [];

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200"
      style={{
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
          className="relative w-[3000px] h-[3000px]"
        >
          {images.map((image) => (
            <DraggableImageCard
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onSelect={() => setSelectedImageId(image.id)}
              zoom={zoom}
              pan={panOffset}
            />
          ))}
        </motion.div>
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-200">
              <Upload size={48} className="text-zinc-400 dark:text-zinc-500 transition-colors duration-200" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 transition-colors duration-200">
              Click to upload or drag images here
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 transition-colors duration-200">
              Start building your mood board in freeform mode
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border border-zinc-900 dark:border-zinc-50 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 pointer-events-auto font-medium"
            >
              Upload Images
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Images button - Fixed top right, below TopBar */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed top-24 right-8 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border border-zinc-900 dark:border-zinc-50 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 flex items-center gap-2 z-10 font-medium shadow-lg"
      >
        <Upload size={18} />
        Add Images
      </button>

      {/* Zoom controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 right-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center gap-2 px-3 py-2 z-10 transition-colors duration-200"
      >
        <button
          onClick={zoomOut}
          disabled={!canZoomOut}
          className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200 ${
            !canZoomOut ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Minus size={16} className="text-zinc-900 dark:text-zinc-50" />
        </button>
        
        <button
          onClick={resetZoom}
          className="px-4 py-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors duration-200 min-w-[60px]"
        >
          {Math.round(zoom * 100)}%
        </button>
        
        <button
          onClick={zoomIn}
          disabled={!canZoomIn}
          className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200 ${
            !canZoomIn ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Plus size={16} className="text-zinc-900 dark:text-zinc-50" />
        </button>
      </motion.div>
    </div>
  );
}