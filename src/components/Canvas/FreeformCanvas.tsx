import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Minus, Grid3x3 } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import DraggableImageCard from '@/components/Image/DraggableImageCard';
import ContextMenu from '@/components/shared/ContextMenu';
import CreateGroupModal from '@/components/modals/CreateGroupModal';
import GroupContainer from '@/components/Canvas/GroupContainer';
import AlignmentGuides from '@/components/Canvas/AlignmentGuides';
import AlignmentToolbar from '@/components/Canvas/AlignmentToolbar';

// Helper for robust ID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Grid configuration
const GRID_SIZE = 20;

export default function FreeformCanvas() {
  const { activeBoard, addImage, deleteImage, createGroup, updateGroupName, deleteGroup, ungroupImages, updateImagePosition } = useBoards();
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset zoom and pan when active board changes
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedImageIds([]);
  }, [activeBoard.id]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      try {
        if (!validTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Only JPG, PNG, GIF, WEBP allowed.`);
          return;
        }

        if (file.size > maxSize) {
          alert(`File too large: ${file.name}. Maximum size is 10MB.`);
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (!isMountedRef.current) return;
          if (!e.target?.result) return;
          
          const img = new Image();
          
          img.onload = () => {
            if (!isMountedRef.current) return;
            
            const maxWidth = 400;
            const scale = Math.min(1, maxWidth / img.width);
            
            // Calculate initial position
            let x = 100 + Math.random() * 200;
            let y = 100 + Math.random() * 200;
            
            // Snap to grid if enabled
            if (snapToGrid) {
              x = Math.round(x / GRID_SIZE) * GRID_SIZE;
              y = Math.round(y / GRID_SIZE) * GRID_SIZE;
            }
            
            addImage({
              id: generateId(),
              src: e.target!.result as string,
              x,
              y,
              width: img.width * scale,
              height: img.height * scale,
              rotation: 0
            });
          };
          
          img.onerror = () => {
            if (!isMountedRef.current) return;
            alert(`Failed to load image: ${file.name}`);
          };
          
          img.src = e.target.result as string;
        };
        
        reader.onerror = () => {
          if (!isMountedRef.current) return;
          alert(`Failed to read file: ${file.name}`);
        };
        
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading ${file.name}. Please try again.`);
      }
    });
  }, [addImage, snapToGrid]);

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
      
      const sensitivity = 0.002;
      const delta = -e.deltaY * sensitivity;
      
      const newZoom = Math.max(0.25, Math.min(4, zoom + delta));
      
      if (newZoom === zoom) return;
      
      const zoomPoint = {
        x: (mouseX - panOffset.x) / zoom,
        y: (mouseY - panOffset.y) / zoom
      };
      
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

  const handleImageClick = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.metaKey || e.ctrlKey) {
      // Toggle mode - add or remove from selection
      setSelectedImageIds(prev => 
        prev.includes(imageId)
          ? prev.filter(id => id !== imageId)
          : [...prev, imageId]
      );
    } else if (e.shiftKey) {
      // Add mode - always add to selection
      setSelectedImageIds(prev => 
        prev.includes(imageId) ? prev : [...prev, imageId]
      );
    } else {
      // Replace mode - select only this image
      setSelectedImageIds([imageId]);
    }
  };

  const handleSelectAll = useCallback(() => {
    const allImageIds = activeBoard.images.map(img => img.id);
    setSelectedImageIds(allImageIds);
  }, [activeBoard.images]);

  const handleDeselectAll = useCallback(() => {
    setSelectedImageIds([]);
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start rectangle selection if clicking on canvas background
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = (e.clientX - rect.left - panOffset.x) / zoom;
    const startY = (e.clientY - rect.top - panOffset.y) / zoom;
    
    setIsDraggingSelection(true);
    setSelectionRect({
      startX,
      startY,
      endX: startX,
      endY: startY
    });
    
    // If not holding Cmd/Ctrl, clear existing selection
    if (!e.metaKey && !e.ctrlKey) {
      setSelectedImageIds([]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSelection || !selectionRect) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const endX = (e.clientX - rect.left - panOffset.x) / zoom;
    const endY = (e.clientY - rect.top - panOffset.y) / zoom;
    
    setSelectionRect({
      ...selectionRect,
      endX,
      endY
    });
  };

  const handleCanvasMouseUp = () => {
    if (!isDraggingSelection || !selectionRect) return;
    
    // Calculate rectangle bounds
    const rectLeft = Math.min(selectionRect.startX, selectionRect.endX);
    const rectTop = Math.min(selectionRect.startY, selectionRect.endY);
    const rectRight = Math.max(selectionRect.startX, selectionRect.endX);
    const rectBottom = Math.max(selectionRect.startY, selectionRect.endY);
    
    // Find all images that intersect with rectangle
    const selectedIds = activeBoard.images
      .filter(image => {
        const imgLeft = image.x;
        const imgTop = image.y;
        const imgRight = image.x + image.width;
        const imgBottom = image.y + image.height;
        
        // Check if rectangles intersect
        return !(
          rectRight < imgLeft ||
          rectLeft > imgRight ||
          rectBottom < imgTop ||
          rectTop > imgBottom
        );
      })
      .map(img => img.id);
    
    // Add to existing selection or replace
    setSelectedImageIds(prev => {
      const combined = [...new Set([...prev, ...selectedIds])];
      return combined;
    });
    
    setIsDraggingSelection(false);
    setSelectionRect(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
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

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, isOpen: false });
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

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedImageIds.length < 2) return;
    
    const selectedImages = activeBoard.images.filter(img => 
      selectedImageIds.includes(img.id)
    );
    
    switch (type) {
      case 'left': {
        let minX = Math.min(...selectedImages.map(img => img.x));
        
        if (snapToGrid) {
          minX = Math.round(minX / GRID_SIZE) * GRID_SIZE;
        }
        
        selectedImages.forEach(img => {
          updateImagePosition(img.id, minX, img.y);
        });
        break;
      }
      case 'center': {
        const minX = Math.min(...selectedImages.map(img => img.x));
        const maxX = Math.max(...selectedImages.map(img => img.x + img.width));
        const centerX = (minX + maxX) / 2;
        
        selectedImages.forEach(img => {
          let newX = centerX - img.width / 2;
          
          if (snapToGrid) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          }
          
          updateImagePosition(img.id, newX, img.y);
        });
        break;
      }
      case 'right': {
        let maxX = Math.max(...selectedImages.map(img => img.x + img.width));
        
        selectedImages.forEach(img => {
          let newX = maxX - img.width;
          
          if (snapToGrid) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          }
          
          updateImagePosition(img.id, newX, img.y);
        });
        break;
      }
      case 'top': {
        let minY = Math.min(...selectedImages.map(img => img.y));
        
        if (snapToGrid) {
          minY = Math.round(minY / GRID_SIZE) * GRID_SIZE;
        }
        
        selectedImages.forEach(img => {
          updateImagePosition(img.id, img.x, minY);
        });
        break;
      }
      case 'middle': {
        const minY = Math.min(...selectedImages.map(img => img.y));
        const maxY = Math.max(...selectedImages.map(img => img.y + img.height));
        const centerY = (minY + maxY) / 2;
        
        selectedImages.forEach(img => {
          let newY = centerY - img.height / 2;
          
          if (snapToGrid) {
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
          }
          
          updateImagePosition(img.id, img.x, newY);
        });
        break;
      }
      case 'bottom': {
        let maxY = Math.max(...selectedImages.map(img => img.y + img.height));
        
        selectedImages.forEach(img => {
          let newY = maxY - img.height;
          
          if (snapToGrid) {
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
          }
          
          updateImagePosition(img.id, img.x, newY);
        });
        break;
      }
    }
  };

  const handleDistribute = (axis: 'horizontal' | 'vertical') => {
    if (selectedImageIds.length < 3) return;
    
    const selectedImages = activeBoard.images
      .filter(img => selectedImageIds.includes(img.id))
      .sort((a, b) => axis === 'horizontal' ? a.x - b.x : a.y - b.y);
    
    if (axis === 'horizontal') {
      const first = selectedImages[0];
      const last = selectedImages[selectedImages.length - 1];
      const totalSpace = (last.x + last.width) - first.x;
      const imageWidths = selectedImages.reduce((sum, img) => sum + img.width, 0);
      const gap = (totalSpace - imageWidths) / (selectedImages.length - 1);
      
      let currentX = first.x + first.width + gap;
      for (let i = 1; i < selectedImages.length - 1; i++) {
        updateImagePosition(selectedImages[i].id, currentX, selectedImages[i].y);
        currentX += selectedImages[i].width + gap;
      }
    } else {
      const first = selectedImages[0];
      const last = selectedImages[selectedImages.length - 1];
      const totalSpace = (last.y + last.height) - first.y;
      const imageHeights = selectedImages.reduce((sum, img) => sum + img.height, 0);
      const gap = (totalSpace - imageHeights) / (selectedImages.length - 1);
      
      let currentY = first.y + first.height + gap;
      for (let i = 1; i < selectedImages.length - 1; i++) {
        updateImagePosition(selectedImages[i].id, selectedImages[i].x, currentY);
        currentY += selectedImages[i].height + gap;
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      
      if (e.key === 'Escape') {
        handleDeselectAll();
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
      
      // Arrow key nudging with grid snap
      if (selectedImageIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        // If snap to grid is on, move by grid size
        // If off, move by 1px (or 10px with Shift)
        const step = snapToGrid 
          ? GRID_SIZE 
          : (e.shiftKey ? 10 : 1);
        
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        
        selectedImageIds.forEach(id => {
          const image = activeBoard.images.find(img => img.id === id);
          if (image) {
            let newX = image.x + dx;
            let newY = image.y + dy;
            
            // Snap to grid
            if (snapToGrid) {
              newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
              newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
            }
            
            updateImagePosition(id, newX, newY);
          }
        });
      }
      
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        setSnapToGrid(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIds, handleSelectAll, handleDeselectAll, deleteImage, zoomIn, zoomOut, resetZoom, activeBoard.images, updateImagePosition, snapToGrid]);

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
  const groups = activeBoard?.groups || [];

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200"
      style={{
        cursor: isDraggingSelection ? 'crosshair' : 'grab'
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onContextMenu={handleContextMenu}
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
          {/* Render Groups */}
          {groups.map(group => {
            const groupImages = images.filter(img =>
              group.imageIds.includes(img.id)
            );
            
            if (groupImages.length === 0) return null;
            
            return (
              <GroupContainer
                key={group.id}
                group={group}
                images={groupImages}
                zoom={zoom}
                onUpdateName={(newName) => updateGroupName(group.id, newName)}
                onUngroup={() => ungroupImages(group.id)}
                onDelete={() => {
                  if (confirm(`Delete group "${group.name}" and all its images?`)) {
                    deleteGroup(group.id, true);
                  }
                }}
              />
            );
          })}

          {/* Render Images */}
          {images.map((image) => {
            const imageGroup = groups.find(g => g.imageIds.includes(image.id));
            
            return (
              <DraggableImageCard
                key={image.id}
                image={image}
                isSelected={selectedImageIds.includes(image.id)}
                onSelect={(e) => handleImageClick(image.id, e)}
                zoom={zoom}
                pan={panOffset}
                isDraggingSelection={isDraggingSelection}
                snapToGrid={snapToGrid}
                gridSize={GRID_SIZE}
                onDragStart={() => setDraggingImageId(image.id)}
                onDragEnd={() => setDraggingImageId(null)}
                isInGroup={!!imageGroup}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Alignment Guides */}
      <AlignmentGuides
        draggedImage={activeBoard.images.find(img => img.id === draggingImageId) || null}
        allImages={activeBoard.images.filter(img => img.id !== draggingImageId)}
        zoom={zoom}
        pan={panOffset}
      />

      {/* Selection Rectangle */}
      {selectionRect && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(selectionRect.startX, selectionRect.endX) * zoom + panOffset.x,
            top: Math.min(selectionRect.startY, selectionRect.endY) * zoom + panOffset.y,
            width: Math.abs(selectionRect.endX - selectionRect.startX) * zoom,
            height: Math.abs(selectionRect.endY - selectionRect.startY) * zoom,
            border: '2px dashed #3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}

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

      {/* Top Right Controls */}
      <div className="fixed top-24 right-8 z-10 flex items-center gap-3">
        {/* Snap to Grid - Icon Only */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg
            ${snapToGrid 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
            }
          `}
          title={`Snap to Grid ${snapToGrid ? 'On' : 'Off'} (Cmd+Shift+G)`}
        >
          <Grid3x3 className="w-5 h-5" />
        </button>
        
        {/* Add Images Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium shadow-lg"
        >
          <Upload size={18} />
          Add Images
        </button>
      </div>

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

      {/* Alignment Toolbar */}
      <AlignmentToolbar
        selectedCount={selectedImageIds.length}
        onAlign={handleAlign}
        onDistribute={handleDistribute}
        onGroup={handleGroupSelection}
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
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