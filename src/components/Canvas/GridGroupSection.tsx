import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Ungroup, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Group, ImageData } from '@/context/BoardContext';

interface GridImageCardProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

function GridImageCard({ image, isSelected, onSelect, onDelete }: GridImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <img
        src={image.src}
        alt="Mood board item"
        className={`
          w-full h-auto rounded-2xl transition-all duration-200
          ${isSelected 
            ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
            : 'ring-1 ring-zinc-200 dark:ring-zinc-700'
          }
        `}
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      />
      
      {(isHovered || isSelected) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-50 transition-colors shadow-lg"
        >
          <X className="w-4 h-4 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
}

interface GridGroupSectionProps {
  group: Group;
  images: ImageData[];
  selectedImageIds: string[];
  columns: number;
  gap: number;
  onSelectImage: (id: string, e: React.MouseEvent) => void;
  onDeleteImage: (id: string) => void;
  onUpdateGroupName: (newName: string) => void;
  onUngroup: () => void;
  onDeleteGroup: () => void;
}

export default function GridGroupSection({
  group,
  images,
  selectedImageIds,
  columns,
  gap,
  onSelectImage,
  onDeleteImage,
  onUpdateGroupName,
  onUngroup,
  onDeleteGroup
}: GridGroupSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.name);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Distribute images across columns
  const columnArrays = Array.from({ length: columns }, () => [] as ImageData[]);
  images.forEach((image, index) => {
    const columnIndex = index % columns;
    columnArrays[columnIndex].push(image);
  });

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateGroupName(editValue.trim());
    } else {
      setEditValue(group.name);
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-12">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          {/* Collapse/Expand */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>
          
          {/* Group Name */}
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
              className="px-3 py-1.5 text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-zinc-900 dark:text-zinc-50"
            />
          ) : (
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {group.name}
            </h2>
          )}
          
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            ({images.length} {images.length === 1 ? 'image' : 'images'})
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
            title="Rename group"
          >
            <Pencil className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <button
            onClick={onUngroup}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
            title="Ungroup images"
          >
            <Ungroup className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <button
            onClick={onDeleteGroup}
            className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            title="Delete group and images"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      {/* Grid of Images */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid auto-rows-max"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {columnArrays.map((columnImages, columnIndex) => (
              <div
                key={columnIndex}
                className="flex flex-col"
                style={{ gap: `${gap}px` }}
              >
                {columnImages.map((image) => (
                  <GridImageCard
                    key={image.id}
                    image={image}
                    isSelected={selectedImageIds.includes(image.id)}
                    onSelect={(e) => onSelectImage(image.id, e)}
                    onDelete={() => onDeleteImage(image.id)}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
