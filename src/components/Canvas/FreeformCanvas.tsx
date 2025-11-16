import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import DraggableImageCard from '@/components/Image/DraggableImageCard';

export default function FreeformCanvas() {
  const { activeBoard, addImage } = useBoards();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-[#FAFAFA]"
      style={{
        backgroundImage: `radial-gradient(circle, #D1D5DB 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        cursor: isPanning ? 'grabbing' : 'grab'
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

      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsPanning(true)}
        onDragEnd={() => setIsPanning(false)}
        className="absolute inset-0"
        style={{ x: panOffset.x, y: panOffset.y }}
      >
        {/* Canvas content area */}
        <div className="relative w-[3000px] h-[3000px]">
          {activeBoard?.images.map((image) => (
            <DraggableImageCard
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onSelect={() => setSelectedImageId(image.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Empty state */}
      {(!activeBoard?.images || activeBoard.images.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <Upload size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Click to upload or drag images here
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Start building your mood board in freeform mode
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors pointer-events-auto"
            >
              Upload Images
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload button (always visible) */}
      {activeBoard?.images && activeBoard.images.length > 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-6 right-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 z-10"
        >
          <Upload size={18} />
          Add Images
        </button>
      )}
    </div>
  );
}
