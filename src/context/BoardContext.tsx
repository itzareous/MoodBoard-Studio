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

interface Board {
  id: string;
  name: string;
  images: ImageData[];
  createdAt: Date;
  viewMode: 'grid' | 'freeform';
}

interface BoardContextType {
  boards: Board[];
  activeBoard: Board;
  activeBoardId: string;
  setActiveBoardId: (boardId: string) => void;
  setViewMode: (mode: 'grid' | 'freeform') => void;
  addImage: (imageData: ImageData) => void;
  updateImagePosition: (imageId: string, x: number, y: number) => void;
  updateImageSize: (imageId: string, width: number, height: number) => void;
  deleteImage: (imageId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const defaultBoard: Board = {
  id: '1',
  name: 'Brand Inspiration',
  images: [],
  createdAt: new Date('2024-01-15'),
  viewMode: 'freeform'
};

const sampleBoards: Board[] = [
  defaultBoard,
  {
    id: '2',
    name: 'Color Palette Ideas',
    images: [],
    createdAt: new Date('2024-01-20'),
    viewMode: 'freeform'
  },
  {
    id: '3',
    name: 'UI References',
    images: [],
    createdAt: new Date('2024-01-25'),
    viewMode: 'grid'
  }
];

export function BoardProvider({ children }: { children: ReactNode }) {
  // Load boards from localStorage on mount
  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = localStorage.getItem('curate-boards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        return parsed.map((board: any) => ({
          ...board,
          createdAt: new Date(board.createdAt)
        }));
      } catch (error) {
        console.error('Failed to parse saved boards:', error);
        return sampleBoards;
      }
    }
    return sampleBoards;
  });

  // Load active board ID from localStorage
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const saved = localStorage.getItem('curate-active-board-id');
    return saved || boards[0].id;
  });

  // Derive activeBoard from boards array (no separate state!)
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Save boards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('curate-boards', JSON.stringify(boards));
  }, [boards]);

  // Save active board ID to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('curate-active-board-id', activeBoardId);
  }, [activeBoardId]);

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

  const deleteImage = (imageId: string) => {
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? {
            ...board,
            images: board.images.filter(img => img.id !== imageId)
          }
        : board
    ));
  };

  return (
    <BoardContext.Provider value={{ 
      boards, 
      activeBoard,
      activeBoardId,
      setActiveBoardId,
      setViewMode,
      addImage,
      updateImagePosition,
      updateImageSize,
      deleteImage
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