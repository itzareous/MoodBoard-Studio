import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import { ImageData } from '@/context/BoardContext';

interface DraggableImageCardProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DraggableImageCard({ image, isSelected, onSelect }: DraggableImageCardProps) {
  const { updateImagePosition, updateImageSize, deleteImage } = useBoards();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: any, info: any) => {
    const newX = image.x + info.offset.x;
    const newY = image.y + info.offset.y;
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
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      style={{
        position: 'absolute',
        left: image.x,
        top: image.y,
        width: image.width,
        height: image.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className={`rounded-lg overflow-hidden shadow-lg transition-shadow duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
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
          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-md z-10"
          >
            <X size={14} />
          </button>

          {/* Resize handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 dark:border-blue-400 rounded-sm cursor-nw-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 dark:border-blue-400 rounded-sm cursor-ne-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 dark:border-blue-400 rounded-sm cursor-sw-resize"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 dark:border-blue-400 rounded-sm cursor-se-resize"
          />
        </>
      )}
    </motion.div>
  );
}