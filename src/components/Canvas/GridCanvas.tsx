import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import { ImageData } from '@/context/BoardContext';
import ContextMenu from '@/components/shared/ContextMenu';
import CreateGroupModal from '@/components/modals/CreateGroupModal';
import GridGroupSection from '@/components/Canvas/GridGroupSection';

// Helper for robust ID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or HTTP
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface MasonryGridProps {
  images: ImageData[];
  selectedImageIds: string[];
  columns: number;
  gap: number;
  onSelectImage: (id: string, e: React.MouseEvent) => void;
  onDeleteImage: (id: string) => void;
}

function MasonryGrid({ images, selectedImageIds, columns, gap, onSelectImage, onDeleteImage }: MasonryGridProps) {
  // Distribute images across columns
  const columnArrays = Array.from({ length: columns }, () => [] as ImageData[]);
  
  images.forEach((image, index) => {
    const columnIndex = index % columns;
    columnArrays[columnIndex].push(image);
  });
  
  return (
    <div 
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
    </div>
  );
}

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
          ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'ring-1 ring-zinc-200 dark:ring-zinc-700'}
        `}
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      />
      
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-50 transition-colors shadow-lg pointer-events-auto"
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="max-w-2xl mx-auto mt-32 text-center cursor-pointer"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center transition-colors duration-200">
        <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 transition-colors duration-200">
        Start Your Grid
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6 transition-colors duration-200">
        Upload images to create your mood board in grid layout
      </p>
      <button
        className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200"
      >
        Upload Images
      </button>
    </div>
  );
}

const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(4);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  return columns;
};

export default function GridCanvas() {
  const { activeBoard, addImage, deleteImage, createGroup, updateGroupName, deleteGroup, ungroupImages } = useBoards();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({ isOpen: false, position: { x: 0, y: 0 } });
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const isMountedRef = useRef(true);
  
  const columns = useResponsiveColumns();
  const gap = 16;

  // Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of Array.from(files)) {
      try {
        if (!validTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Only JPG, PNG, GIF, WEBP allowed.`);
          continue;
        }
        
        if (file.size > maxSize) {
          alert(`File too large: ${file.name}. Maximum size is 10MB.`);
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!isMountedRef.current) return;
          if (!e.target?.result) return;
          
          const img = new Image();
          img.onload = () => {
            if (!isMountedRef.current) return;
            
            const imageData: ImageData = {
              id: generateId(),
              src: e.target!.result as string,
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
              rotation: 0,
            };
            
            addImage(imageData);
          };
          img.onerror = () => {
            if (!isMountedRef.current) return;
            alert(`Failed to load: ${file.name}`);
          };
          img.src = e.target.result as string;
        };
        reader.onerror = () => {
          if (!isMountedRef.current) return;
          alert(`Failed to read: ${file.name}`);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}. Please try again.`);
      }
    }
    
    e.target.value = '';
  };

  const handleImageClick = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.metaKey || e.ctrlKey) {
      setSelectedImageIds(prev =>
        prev.includes(imageId)
          ? prev.filter(id => id !== imageId)
          : [...prev, imageId]
      );
    } else if (e.shiftKey) {
      setSelectedImageIds(prev =>
        prev.includes(imageId) ? prev : [...prev, imageId]
      );
    } else {
      setSelectedImageIds([imageId]);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedImageIds([]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (selectedImageIds.length === 0) return;
    
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleGroupSelection = () => {
    setShowCreateGroupModal(true);
  };

  const handleCreateGroup = (name: string) => {
    createGroup(name, selectedImageIds);
    setSelectedImageIds([]);
  };

  const handleDeleteSelected = () => {
    selectedImageIds.forEach(id => {
      deleteImage(id);
    });
    setSelectedImageIds([]);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allIds = activeBoard.images.map(img => img.id);
        setSelectedImageIds(allIds);
      }
      
      if (e.key === 'Escape') {
        setSelectedImageIds([]);
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedImageIds.length > 0) {
          e.preventDefault();
          selectedImageIds.forEach(id => {
            deleteImage(id);
          });
          setSelectedImageIds([]);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIds, activeBoard.images, deleteImage]);
  
  const images = activeBoard?.images || [];
  const groups = activeBoard?.groups || [];

  // Organize images by group
  const groupedImages: { [groupId: string]: ImageData[] } = {};
  const ungroupedImages: ImageData[] = [];

  images.forEach(image => {
    const imageGroup = groups.find(g => g.imageIds.includes(image.id));
    if (imageGroup) {
      if (!groupedImages[imageGroup.id]) {
        groupedImages[imageGroup.id] = [];
      }
      groupedImages[imageGroup.id].push(image);
    } else {
      ungroupedImages.push(image);
    }
  });
  
  return (
    <div 
      className="w-full h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-8 transition-colors duration-200"
      onClick={handleContainerClick}
      onContextMenu={handleContextMenu}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Header with upload button */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
              {activeBoard.name}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium"
          >
            <Upload className="w-5 h-5" />
            Add Images
          </button>
        </div>
      </div>
      
      {/* Grid layout */}
      {images.length > 0 ? (
        <div className="max-w-7xl mx-auto">
          {/* Render Groups */}
          {groups.map(group => {
            const images = groupedImages[group.id] || [];
            if (images.length === 0) return null;
            
            return (
              <GridGroupSection
                key={group.id}
                group={group}
                images={images}
                selectedImageIds={selectedImageIds}
                columns={columns}
                gap={gap}
                onSelectImage={handleImageClick}
                onDeleteImage={(id) => deleteImage(id)}
                onUpdateGroupName={(name) => updateGroupName(group.id, name)}
                onUngroup={() => ungroupImages(group.id)}
                onDeleteGroup={() => {
                  if (confirm(`Delete group "${group.name}" and all its images?`)) {
                    deleteGroup(group.id, true);
                  }
                }}
              />
            );
          })}
          
          {/* Render Ungrouped Images */}
          {ungroupedImages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                Ungrouped Images ({ungroupedImages.length})
              </h2>
              
              <MasonryGrid
                images={ungroupedImages}
                selectedImageIds={selectedImageIds}
                columns={columns}
                gap={gap}
                onSelectImage={handleImageClick}
                onDeleteImage={(id) => deleteImage(id)}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState onClick={() => fileInputRef.current?.click()} />
      )}

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onGroupSelection={handleGroupSelection}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedImageIds.length > 0}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        imageCount={selectedImageIds.length}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}