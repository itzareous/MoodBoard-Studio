import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Palette } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import type { Note } from '@/context/BoardContext';

interface NoteCardProps {
  note: Note;
  zoom: number;
  pan: { x: number; y: number };
  snapToGrid?: boolean;
  gridSize?: number;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: '#FEF3C7', text: '#92400E' },
  { name: 'Blue', value: '#DBEAFE', text: '#1E3A8A' },
  { name: 'Green', value: '#D1FAE5', text: '#065F46' },
  { name: 'Pink', value: '#FCE7F3', text: '#831843' },
  { name: 'Indigo', value: '#E0E7FF', text: '#3730A3' },
  { name: 'Orange', value: '#FED7AA', text: '#92400E' },
];

export default function NoteCard({ note, zoom, pan, snapToGrid = false, gridSize = 20 }: NoteCardProps) {
  const { activeBoard, updateNoteText, updateNotePosition, updateNoteSize, updateNoteColor, deleteNote } = useBoards();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(note.text);
  }, [note.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDragEnd = (event: any, info: any) => {
    const scaledOffsetX = info.offset.x / zoom;
    const scaledOffsetY = info.offset.y / zoom;
    
    let newX = note.x + scaledOffsetX;
    let newY = note.y + scaledOffsetY;
    
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    updateNotePosition(activeBoard.id, note.id, newX, newY);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (text.trim() !== note.text) {
      updateNoteText(activeBoard.id, note.id, text.trim());
    }
  };

  const handleColorChange = (color: string) => {
    updateNoteColor(activeBoard.id, note.id, color);
    setShowColorPicker(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      deleteNote(activeBoard.id, note.id);
    }
  };

  const getTextColor = () => {
    const colorObj = NOTE_COLORS.find(c => c.value === note.color);
    return colorObj?.text || '#000000';
  };

  return (
    <motion.div
      drag={!isEditing && !isResizing}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
      }}
      className="rounded-2xl shadow-lg cursor-move"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-note-id={note.id}
    >
      {/* Note Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
        <div className="flex gap-1">
          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center transition-colors"
              title="Change color"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: getTextColor() }} />
            </button>
            
            {showColorPicker && (
              <div className="absolute top-8 left-0 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-2 flex gap-1 z-50 border border-zinc-200 dark:border-zinc-700">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className="w-7 h-7 rounded-full border-2 border-white hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Delete Button */}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleDelete}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg z-20"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </motion.button>
        )}
      </div>
      
      {/* Note Content */}
      <div className="absolute inset-0 p-3 pt-12 overflow-hidden">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setText(note.text);
                setIsEditing(false);
              }
            }}
            className="w-full h-full bg-transparent border-none resize-none focus:outline-none font-handwriting text-base leading-relaxed"
            style={{ color: getTextColor() }}
            placeholder="Write your note here..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="w-full h-full whitespace-pre-wrap break-words font-handwriting text-base leading-relaxed cursor-text"
            style={{ color: getTextColor() }}
          >
            {note.text || 'Click to add note...'}
          </div>
        )}
      </div>
      
      {/* Resize Handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = note.width;
          const startHeight = note.height;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = (e.clientX - startX) / zoom;
            const deltaY = (e.clientY - startY) / zoom;
            
            let newWidth = Math.max(150, startWidth + deltaX);
            let newHeight = Math.max(100, startHeight + deltaY);
            
            if (snapToGrid) {
              newWidth = Math.round(newWidth / gridSize) * gridSize;
              newHeight = Math.round(newHeight / gridSize) * gridSize;
            }
            
            updateNoteSize(activeBoard.id, note.id, newWidth, newHeight);
          };
          
          const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        className="absolute bottom-2 right-2 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-10"
        style={{ 
          background: `linear-gradient(135deg, transparent 50%, ${getTextColor()} 50%)`,
        }}
      />
    </motion.div>
  );
}