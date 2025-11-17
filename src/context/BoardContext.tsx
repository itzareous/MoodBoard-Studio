import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ImageData {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Group {
  id: string;
  name: string;
  imageIds: string[];
  color?: string;
  layoutDirection: 'horizontal' | 'vertical';
  gap: number;
  padding: number;
  x: number;
  y: number;
}

export interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdAt: string;
}

interface Board {
  id: string;
  name: string;
  images: ImageData[];
  groups: Group[];
  notes: Note[];
  createdAt: Date;
  viewMode: 'grid' | 'freeform';
}

interface BoardContextType {
  boards: Board[];
  activeBoard: Board;
  activeBoardId: string;
  setActiveBoardId: (boardId: string) => void;
  createBoard: (name: string) => void;
  deleteBoard: (boardId: string) => void;
  updateBoardName: (boardId: string, newName: string) => void;
  setViewMode: (mode: 'grid' | 'freeform') => void;
  addImage: (imageData: ImageData) => void;
  updateImagePosition: (imageId: string, x: number, y: number) => void;
  updateImageSize: (imageId: string, width: number, height: number) => void;
  deleteImage: (imageId: string) => void;
  createGroup: (name: string, imageIds: string[]) => void;
  updateGroupName: (groupId: string, newName: string) => void;
  deleteGroup: (groupId: string, deleteImages: boolean) => void;
  ungroupImages: (groupId: string) => void;
  updateGroupPosition: (groupId: string, deltaX: number, deltaY: number) => void;
  updateGroupLayout: (groupId: string, layoutDirection: 'horizontal' | 'vertical') => void;
  updateGroupGap: (groupId: string, gap: number) => void;
  createNote: (boardId: string, text: string, x: number, y: number) => string;
  updateNoteText: (boardId: string, noteId: string, text: string) => void;
  updateNotePosition: (boardId: string, noteId: string, x: number, y: number) => void;
  updateNoteSize: (boardId: string, noteId: string, width: number, height: number) => void;
  updateNoteColor: (boardId: string, noteId: string, color: string) => void;
  deleteNote: (boardId: string, noteId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const NOTE_COLORS = [
  '#FEF3C7', // Yellow
  '#DBEAFE', // Blue
  '#D1FAE5', // Green
  '#FCE7F3', // Pink
  '#E0E7FF', // Indigo
  '#FED7AA', // Orange
];

const defaultBoard: Board = {
  id: '1',
  name: 'Brand Inspiration',
  images: [],
  groups: [],
  notes: [],
  createdAt: new Date('2024-01-15'),
  viewMode: 'freeform'
};

const sampleBoards: Board[] = [
  defaultBoard,
  {
    id: '2',
    name: 'Color Palette Ideas',
    images: [],
    groups: [],
    notes: [],
    createdAt: new Date('2024-01-20'),
    viewMode: 'freeform'
  },
  {
    id: '3',
    name: 'UI References',
    images: [],
    groups: [],
    notes: [],
    createdAt: new Date('2024-01-25'),
    viewMode: 'grid'
  }
];

// Helper function to arrange images in group
const arrangeGroupImages = (images: ImageData[], group: Group): ImageData[] => {
  const groupImages = images.filter(img => group.imageIds.includes(img.id));
  const otherImages = images.filter(img => !group.imageIds.includes(img.id));
  
  let currentX = group.x + group.padding;
  let currentY = group.y + group.padding;
  
  const arrangedImages = groupImages.map(img => {
    const newImg = {
      ...img,
      x: currentX,
      y: currentY,
    };
    
    if (group.layoutDirection === 'horizontal') {
      currentX += img.width + group.gap;
    } else {
      currentY += img.height + group.gap;
    }
    
    return newImg;
  });
  
  return [...otherImages, ...arrangedImages];
};

export function BoardProvider({ children }: { children: ReactNode }) {
  // Load boards from localStorage on mount
  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = localStorage.getItem('curate-boards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects and ensure groups array exists
        return parsed.map((board: any) => ({
          ...board,
          groups: board.groups || [],
          notes: board.notes || [],
          createdAt: new Date(board.createdAt)
        }));
      } catch (error) {
        console.error('Failed to parse saved boards:', error);
        return sampleBoards;
      }
    }
    return sampleBoards;
  });

  // Load active board ID from localStorage with validation
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const savedId = localStorage.getItem('curate-active-board-id');
    const savedBoards = localStorage.getItem('curate-boards');
    
    if (savedId && savedBoards) {
      try {
        const parsedBoards = JSON.parse(savedBoards);
        // Validate that saved ID exists in boards
        if (parsedBoards.some((b: any) => b.id === savedId)) {
          return savedId;
        }
      } catch {
        // Fall through to default
      }
    }
    
    return defaultBoard.id;
  });

  // Derive activeBoard from boards array (no separate state!)
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Validate activeBoardId exists in boards array
  useEffect(() => {
    if (!boards.some(b => b.id === activeBoardId)) {
      setActiveBoardId(boards[0]?.id || defaultBoard.id);
    }
  }, [boards, activeBoardId]);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('curate-boards', JSON.stringify(boards));
  }, [boards]);

  // Save active board ID to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('curate-active-board-id', activeBoardId);
  }, [activeBoardId]);

  const createBoard = (name: string) => {
    const newBoard: Board = {
      id: Date.now().toString(),
      name: name,
      images: [],
      groups: [],
      notes: [],
      createdAt: new Date(),
      viewMode: 'grid',
    };
    
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const deleteBoard = (boardId: string) => {
    // Prevent deleting the last board
    if (boards.length === 1) {
      alert('Cannot delete the last board');
      return;
    }
    
    // Remove the board
    const updatedBoards = boards.filter(board => board.id !== boardId);
    setBoards(updatedBoards);
    
    // If deleted board was active, switch to first board
    if (activeBoardId === boardId) {
      setActiveBoardId(updatedBoards[0].id);
    }
  };

  const updateBoardName = (boardId: string, newName: string) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, name: newName }
        : board
    ));
  };

  const setViewMode = (mode: 'grid' | 'freeform') => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId ? { ...board, viewMode: mode } : board
    ));
  };

  const addImage = (imageData: ImageData) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? { ...board, images: [...board.images, imageData] }
        : board
    ));
  };

  const updateImagePosition = (imageId: string, x: number, y: number) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? {
            ...board,
            images: board.images.map(img =>
              img.id === imageId ? { ...img, x, y } : img
            )
          }
        : board
    ));
  };

  const updateImageSize = (imageId: string, width: number, height: number) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? {
            ...board,
            images: board.images.map(img =>
              img.id === imageId ? { ...img, width, height } : img
            )
          }
        : board
    ));
  };

  const createGroup = (name: string, imageIds: string[]) => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const selectedImages = board.images.filter(img => imageIds.includes(img.id));
      
      if (selectedImages.length === 0) return board;
      
      const minX = Math.min(...selectedImages.map(img => img.x));
      const minY = Math.min(...selectedImages.map(img => img.y));
      
      const newGroup: Group = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        imageIds,
        color: undefined,
        layoutDirection: 'horizontal',
        gap: 20,
        padding: 20,
        x: minX,
        y: minY,
      };
      
      const updatedImages = arrangeGroupImages(board.images, newGroup);
      
      return {
        ...board,
        groups: [...board.groups, newGroup],
        images: updatedImages
      };
    }));
  };

  const updateGroupName = (groupId: string, newName: string) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? {
            ...board,
            groups: board.groups.map(group =>
              group.id === groupId ? { ...group, name: newName } : group
            )
          }
        : board
    ));
  };

  const deleteGroup = (groupId: string, deleteImages: boolean) => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const group = board.groups.find(g => g.id === groupId);
      if (!group) return board;
      
      return {
        ...board,
        groups: board.groups.filter(g => g.id !== groupId),
        images: deleteImages
          ? board.images.filter(img => !group.imageIds.includes(img.id))
          : board.images
      };
    }));
  };

  const ungroupImages = (groupId: string) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? { ...board, groups: board.groups.filter(g => g.id !== groupId) }
        : board
    ));
  };

  const updateGroupPosition = (groupId: string, deltaX: number, deltaY: number) => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const group = board.groups.find(g => g.id === groupId);
      if (!group) return board;
      
      const updatedGroup = {
        ...group,
        x: group.x + deltaX,
        y: group.y + deltaY,
      };
      
      const updatedImages = board.images.map(img => {
        if (group.imageIds.includes(img.id)) {
          return {
            ...img,
            x: img.x + deltaX,
            y: img.y + deltaY,
          };
        }
        return img;
      });
      
      return {
        ...board,
        groups: board.groups.map(g => g.id === groupId ? updatedGroup : g),
        images: updatedImages,
      };
    }));
  };

  const updateGroupLayout = (groupId: string, layoutDirection: 'horizontal' | 'vertical') => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const group = board.groups.find(g => g.id === groupId);
      if (!group) return board;
      
      const updatedGroup = { ...group, layoutDirection };
      const updatedImages = arrangeGroupImages(board.images, updatedGroup);
      
      return {
        ...board,
        groups: board.groups.map(g => g.id === groupId ? updatedGroup : g),
        images: updatedImages,
      };
    }));
  };

  const updateGroupGap = (groupId: string, gap: number) => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const group = board.groups.find(g => g.id === groupId);
      if (!group) return board;
      
      const updatedGroup = { ...group, gap };
      const updatedImages = arrangeGroupImages(board.images, updatedGroup);
      
      return {
        ...board,
        groups: board.groups.map(g => g.id === groupId ? updatedGroup : g),
        images: updatedImages,
      };
    }));
  };

  const deleteImage = (imageId: string) => {
    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;
      
      const imageGroup = board.groups.find(g => g.imageIds.includes(imageId));
      
      const updatedImages = board.images.filter(img => img.id !== imageId);
      
      if (imageGroup) {
        const updatedGroup = {
          ...imageGroup,
          imageIds: imageGroup.imageIds.filter(id => id !== imageId)
        };
        
        const reflowedImages = arrangeGroupImages(updatedImages, updatedGroup);
        
        return {
          ...board,
          images: reflowedImages,
          groups: board.groups.map(g => g.id === imageGroup.id ? updatedGroup : g)
        };
      }
      
      return {
        ...board,
        images: updatedImages
      };
    }));
  };

  const createNote = (boardId: string, text: string, x: number, y: number) => {
    const newNote: Note = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      x,
      y,
      width: 250,
      height: 200,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: new Date().toISOString(),
    };
    
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? { ...board, notes: [...board.notes, newNote] }
        : board
    ));
    
    return newNote.id;
  };

  const updateNoteText = (boardId: string, noteId: string, text: string) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? {
            ...board,
            notes: board.notes.map(note =>
              note.id === noteId ? { ...note, text } : note
            )
          }
        : board
    ));
  };

  const updateNotePosition = (boardId: string, noteId: string, x: number, y: number) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? {
            ...board,
            notes: board.notes.map(note =>
              note.id === noteId ? { ...note, x, y } : note
            )
          }
        : board
    ));
  };

  const updateNoteSize = (boardId: string, noteId: string, width: number, height: number) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? {
            ...board,
            notes: board.notes.map(note =>
              note.id === noteId ? { ...note, width, height } : note
            )
          }
        : board
    ));
  };

  const updateNoteColor = (boardId: string, noteId: string, color: string) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? {
            ...board,
            notes: board.notes.map(note =>
              note.id === noteId ? { ...note, color } : note
            )
          }
        : board
    ));
  };

  const deleteNote = (boardId: string, noteId: string) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId
        ? { ...board, notes: board.notes.filter(note => note.id !== noteId) }
        : board
    ));
  };

  return (
    <BoardContext.Provider value={{ 
      boards, 
      activeBoard,
      activeBoardId,
      setActiveBoardId,
      createBoard,
      deleteBoard,
      updateBoardName,
      setViewMode,
      addImage,
      updateImagePosition,
      updateImageSize,
      deleteImage,
      createGroup,
      updateGroupName,
      deleteGroup,
      ungroupImages,
      updateGroupPosition,
      updateGroupLayout,
      updateGroupGap,
      createNote,
      updateNoteText,
      updateNotePosition,
      updateNoteSize,
      updateNoteColor,
      deleteNote
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoards must be used within a BoardProvider');
  }
  return context;
}