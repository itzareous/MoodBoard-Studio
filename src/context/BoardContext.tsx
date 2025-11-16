import { createContext, useContext, useState, ReactNode } from 'react';

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
  activeBoard: Board | null;
  setActiveBoard: (board: Board) => void;
  setViewMode: (mode: 'grid' | 'freeform') => void;
  addImage: (imageData: ImageData) => void;
  updateImagePosition: (imageId: string, x: number, y: number) => void;
  updateImageSize: (imageId: string, width: number, height: number) => void;
  deleteImage: (imageId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const sampleBoards: Board[] = [
  {
    id: '1',
    name: 'Brand Inspiration',
    images: [],
    createdAt: new Date('2024-01-15'),
    viewMode: 'grid'
  },
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
  const [boards, setBoards] = useState<Board[]>(sampleBoards);
  const [activeBoard, setActiveBoardState] = useState<Board | null>(boards[0]);

  const setActiveBoard = (board: Board) => {
    setActiveBoardState(board);
  };

  const setViewMode = (mode: 'grid' | 'freeform') => {
    if (!activeBoard) return;
    
    const updatedBoards = boards.map(board =>
      board.id === activeBoard.id ? { ...board, viewMode: mode } : board
    );
    setBoards(updatedBoards);
    setActiveBoardState({ ...activeBoard, viewMode: mode });
  };

  const addImage = (imageData: ImageData) => {
    if (!activeBoard) return;

    const updatedBoards = boards.map(board =>
      board.id === activeBoard.id
        ? { ...board, images: [...board.images, imageData] }
        : board
    );
    setBoards(updatedBoards);
    setActiveBoardState({
      ...activeBoard,
      images: [...activeBoard.images, imageData]
    });
  };

  const updateImagePosition = (imageId: string, x: number, y: number) => {
    if (!activeBoard) return;

    const updatedImages = activeBoard.images.map(img =>
      img.id === imageId ? { ...img, x, y } : img
    );
    const updatedBoards = boards.map(board =>
      board.id === activeBoard.id ? { ...board, images: updatedImages } : board
    );
    setBoards(updatedBoards);
    setActiveBoardState({ ...activeBoard, images: updatedImages });
  };

  const updateImageSize = (imageId: string, width: number, height: number) => {
    if (!activeBoard) return;

    const updatedImages = activeBoard.images.map(img =>
      img.id === imageId ? { ...img, width, height } : img
    );
    const updatedBoards = boards.map(board =>
      board.id === activeBoard.id ? { ...board, images: updatedImages } : board
    );
    setBoards(updatedBoards);
    setActiveBoardState({ ...activeBoard, images: updatedImages });
  };

  const deleteImage = (imageId: string) => {
    if (!activeBoard) return;

    const updatedImages = activeBoard.images.filter(img => img.id !== imageId);
    const updatedBoards = boards.map(board =>
      board.id === activeBoard.id ? { ...board, images: updatedImages } : board
    );
    setBoards(updatedBoards);
    setActiveBoardState({ ...activeBoard, images: updatedImages });
  };

  return (
    <BoardContext.Provider value={{ 
      boards, 
      activeBoard, 
      setActiveBoard,
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