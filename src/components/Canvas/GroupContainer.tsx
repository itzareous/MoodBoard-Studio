import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Ungroup, Trash2, ArrowRightLeft, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import type { Group, ImageData } from '@/context/BoardContext';

interface GroupContainerProps {
  group: Group;
  images: ImageData[];
  zoom: number;
  onUpdateName: (newName: string) => void;
  onUngroup: () => void;
  onDelete: () => void;
}

export default function GroupContainer({
  group,
  images,
  zoom,
  onUpdateName,
  onUngroup,
  onDelete
}: GroupContainerProps) {
  const { updateGroupPosition, updateGroupLayout, updateGroupGap } = useBoards();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const bounds = images.reduce(
    (acc, img) => ({
      minX: Math.min(acc.minX, img.x),
      minY: Math.min(acc.minY, img.y),
      maxX: Math.max(acc.maxX, img.x + img.width),
      maxY: Math.max(acc.maxY, img.y + img.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const padding = group.padding || 20;
  const left = bounds.minX - padding;
  const top = bounds.minY - padding - 50;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2 + 50;

  const handleDragEnd = (event: any, info: any) => {
    const deltaX = info.offset.x / zoom;
    const deltaY = info.offset.y / zoom;
    
    updateGroupPosition(group.id, deltaX, deltaY);
    setIsDragging(false);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateName(editValue.trim());
    } else {
      setEditValue(group.name);
    }
    setIsEditing(false);
  };

  const toggleDirection = () => {
    const newDirection = group.layoutDirection === 'horizontal' ? 'vertical' : 'horizontal';
    updateGroupLayout(group.id, newDirection);
  };

  const increaseGap = () => {
    updateGroupGap(group.id, group.gap + 10);
  };

  const decreaseGap = () => {
    updateGroupGap(group.id, Math.max(0, group.gap - 10));
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="z-10"
    >
      <div className="absolute inset-0 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-3xl pointer-events-none" />
      
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-3xl pointer-events-none" />
      
      <div className="absolute -top-12 left-0 right-0 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setEditValue(group.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg border-2 border-blue-600 focus:outline-none"
            />
          ) : (
            <div className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg">
              {group.name}
            </div>
          )}
          
          <div className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
            {images.length} {images.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        {isHovered && !isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleDirection}
              className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg flex items-center justify-center transition-colors"
              title={`Switch to ${group.layoutDirection === 'horizontal' ? 'vertical' : 'horizontal'}`}
            >
              {group.layoutDirection === 'horizontal' ? (
                <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
            
            <button
              onClick={decreaseGap}
              className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg flex items-center justify-center transition-colors"
              title="Decrease spacing"
            >
              <Minus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
            
            <div className="px-2 flex items-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {group.gap}px
            </div>
            
            <button
              onClick={increaseGap}
              className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg flex items-center justify-center transition-colors"
              title="Increase spacing"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
            
            <div className="w-px h-7 bg-zinc-200 dark:bg-zinc-600" />
            
            <button
              onClick={() => setIsEditing(true)}
              className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg flex items-center justify-center transition-colors"
              title="Rename group"
            >
              <Pencil className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUngroup();
              }}
              className="w-7 h-7 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg flex items-center justify-center transition-colors"
              title="Ungroup"
            >
              <Ungroup className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              title="Delete group"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}