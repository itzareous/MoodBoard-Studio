import { useState } from 'react';
import { Pencil, Ungroup, Trash2 } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.name);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate group bounds from images
  const bounds = images.reduce(
    (acc, img) => ({
      minX: Math.min(acc.minX, img.x),
      minY: Math.min(acc.minY, img.y),
      maxX: Math.max(acc.maxX, img.x + img.width),
      maxY: Math.max(acc.maxY, img.y + img.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const padding = 20;
  const left = bounds.minX - padding;
  const top = bounds.minY - padding - 40;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2 + 40;

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateName(editValue.trim());
    } else {
      setEditValue(group.name);
    }
    setIsEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        pointerEvents: 'none',
      }}
    >
      {/* Dashed Border */}
      <div
        className="absolute inset-0 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-2xl"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Background tint */}
      <div
        className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-2xl"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Label */}
      <div
        className="absolute -top-10 left-0 flex items-center gap-2"
        style={{ pointerEvents: 'auto' }}
      >
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
            autoFocus
            className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg border-2 border-blue-600 focus:outline-none"
          />
        ) : (
          <>
            <div className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg">
              {group.name}
            </div>
            
            {isHovered && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-7 h-7 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
                </button>
                
                <button
                  onClick={onUngroup}
                  className="w-7 h-7 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Ungroup className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
                </button>
                
                <button
                  onClick={onDelete}
                  className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
