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
}

interface Board {
  id: string;
  name: string;
  images: ImageData[];
  groups: Group[];
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
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const defaultBoard: Board = {
  id: '1',
  name: 'Brand Inspiration',
  images: [],
  groups: [],
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
    createdAt: new Date('2024-01-20'),
    viewMode: 'freeform'
  },
  {
    id: '3',
    name: 'UI References',
    images: [],
    groups: [],
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
        // Convert date strings back to Date objects and ensure groups array exists
        return parsed.map((board: any) => ({
          ...board,
          groups: board.groups || [],
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

  const createGroup = (name: string, imageIds: string[]) => {
    const newGroup: Group = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      imageIds,
      color: undefined,
    };
    
    setBoards(prev => prev.map(board =>
      board.id === activeBoardId
        ? { ...board, groups: [...board.groups, newGroup] }
        : board
    ));
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
      ungroupImages
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