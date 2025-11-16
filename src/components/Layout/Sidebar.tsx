import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useBoards } from '@/context/BoardContext';
import BoardCard from '@/components/Board/BoardCard';
import SettingsPopover from '@/components/shared/SettingsPopover';

export default function Sidebar() {
  const { boards, activeBoardId, setActiveBoardId } = useBoards();

  return (
    <div className="w-80 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors duration-200">
      {/* Logo Section - NO BUTTON */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center transition-colors duration-200">
            <span className="text-white dark:text-zinc-900 text-xl font-bold">C</span>
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

      {/* Boards Section */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Section Header */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider transition-colors duration-200">
            Boards
          </h3>
        </div>
        
        {/* New Board Button - MOVED HERE */}
        <button
          onClick={() => {
            // TODO: Implement new board creation
            console.log('Create new board');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full border border-zinc-900 dark:border-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          New Board
        </button>
        
        {/* Board Cards List */}
        <div className="space-y-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              isActive={board.id === activeBoardId}
              onClick={() => setActiveBoardId(board.id)}
            />
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
        <SettingsPopover />
      </div>
    </div>
  );
}