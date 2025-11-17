import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import BoardCard from '@/components/Board/BoardCard';
import SettingsPopover from '@/components/shared/SettingsPopover';
import NewBoardModal from '@/components/modals/NewBoardModal';
import DeleteBoardModal from '@/components/modals/DeleteBoardModal';
import iconLogoDark from '/images/icon logo dark.svg';
import iconLogoLight from '/images/icon logo light.svg';

export default function Sidebar() {
  const { boards, activeBoardId, setActiveBoardId, createBoard, deleteBoard } = useBoards();
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, boardId: string, boardName: string) => {
    e.stopPropagation();
    setBoardToDelete({ id: boardId, name: boardName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (boardToDelete) {
      deleteBoard(boardToDelete.id);
      setBoardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setBoardToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="w-80 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors duration-200">
        {/* Logo Section - Fixed Top */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200">
              <img 
                src={iconLogoLight} 
                alt="Curate Logo" 
                className="w-10 h-10 dark:hidden"
              />
              <img 
                src={iconLogoDark} 
                alt="Curate Logo" 
                className="w-10 h-10 hidden dark:block"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
                Curate
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
                A moodboard studio
              </p>
            </div>
          </div>
        </div>

        {/* Boards Section - Scrollable Middle */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Section Header */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider transition-colors duration-200">
              Boards
            </h3>
          </div>
          
          {/* Board Cards List - This scrolls */}
          <div className="space-y-3">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isActive={board.id === activeBoardId}
                onClick={() => setActiveBoardId(board.id)}
                onDelete={(e) => handleDeleteClick(e, board.id, board.name)}
              />
            ))}
          </div>
        </div>
        
        {/* Footer - Fixed Bottom */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200 flex-shrink-0 space-y-3">
          <button
            onClick={() => setShowNewBoardModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full border border-zinc-900 dark:border-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Board
          </button>
          
          <SettingsPopover />
        </div>
      </div>
      
      {/* Modals */}
      <NewBoardModal
        isOpen={showNewBoardModal}
        onClose={() => setShowNewBoardModal(false)}
        onCreateBoard={createBoard}
      />
      
      <DeleteBoardModal
        isOpen={showDeleteModal}
        boardName={boardToDelete?.name || ''}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}