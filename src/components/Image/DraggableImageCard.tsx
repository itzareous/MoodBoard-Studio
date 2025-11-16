import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import { ImageData } from '@/context/BoardContext';

interface DraggableImageCardProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
  pan: { x: number; y: number };
}

export default function DraggableImageCard({ image, isSelected, onSelect, zoom, pan }: DraggableImageCardProps) {
  const { updateImagePosition, updateImageSize, deleteImage } = useBoards();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleDragEnd = (_: any, info: any) => {
    // Transform the drag offset by inverse of zoom
    const scaledOffsetX = info.offset.x / zoom;
    const scaledOffsetY = info.offset.y / zoom;
    
    const newX = image.x + scaledOffsetX;
    const newY = image.y + scaledOffsetY;
    
    updateImagePosition(image.id, newX, newY);
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = image.width;
    const startHeight = image.height;
    const aspectRatio = image.width / image.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner === 'se') {
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (corner === 'sw') {
        newWidth = Math.max(100, startWidth - deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (corner === 'ne') {
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (corner === 'nw') {
        newWidth = Math.max(100, startWidth - deltaX);
        newHeight = newWidth / aspectRatio;
      }

      updateImageSize(image.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cleanupRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Store cleanup function
    cleanupRef.current = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Keyboard shortcut for delete
  useEffect(() => {
    if (!isSelected) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteImage(image.id);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, image.id, deleteImage]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteImage(image.id);
  };

  return (
    <motion.div
      ref={imageRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        setIsDragging(true);
        onSelect();
      }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isDragging ? 1 : 1.01 }}
      style={{
        position: 'absolute',
        left: image.x,
        top: image.y,
        width: image.width,
        height: image.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
        isSelected ? 'border-2 border-blue-500 dark:border-blue-400' : 'border border-zinc-200 dark:border-zinc-700'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <img
        src={image.src}
        alt="Mood board item"
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Selection border and handles */}
      {isSelected && !isDragging && (
        <>
          {/* Delete button - top right with better visibility */}
          <button
            onClick={handleDelete}
            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-white dark:border-zinc-950 z-20 shadow-lg"
          >
            <X size={16} />
          </button>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-zinc-950 rounded-full cursor-nw-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-zinc-950 rounded-full cursor-ne-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-zinc-950 rounded-full cursor-sw-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-zinc-950 rounded-full cursor-se-resize"
          />
        </>
      )}
    </motion.div>
  );
}