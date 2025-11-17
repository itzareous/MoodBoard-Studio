import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical, 
  AlignCenterVertical, 
  AlignEndVertical,
  Maximize2,
  FolderPlus
} from 'lucide-react';

interface AlignmentToolbarProps {
  selectedCount: number;
  onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (axis: 'horizontal' | 'vertical') => void;
  onGroup: () => void;
}

export default function AlignmentToolbar({ 
  selectedCount, 
  onAlign, 
  onDistribute,
  onGroup
}: AlignmentToolbarProps) {
  if (selectedCount < 2) return null;
  
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-2 shadow-lg flex items-center gap-1">
      {/* Horizontal Alignment */}
      <div className="flex gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => onAlign('left')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align left"
        >
          <AlignLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={() => onAlign('center')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align center"
        >
          <AlignCenter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={() => onAlign('right')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align right"
        >
          <AlignRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
      
      {/* Vertical Alignment */}
      <div className="flex gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => onAlign('top')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align top"
        >
          <AlignStartVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={() => onAlign('middle')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align middle"
        >
          <AlignCenterVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={() => onAlign('bottom')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Align bottom"
        >
          <AlignEndVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
      
      {/* Distribute */}
      <div className="flex gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => onDistribute('horizontal')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Distribute horizontally"
        >
          <Maximize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 rotate-90" />
        </button>
        <button
          onClick={() => onDistribute('vertical')}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Distribute vertically"
        >
          <Maximize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
      
      {/* Group button */}
      <div className="flex gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-700">
        <button
          onClick={onGroup}
          className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          title="Group selection"
        >
          <FolderPlus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
      
      {/* Selected count */}
      <div className="pl-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2">
          {selectedCount} selected
        </span>
      </div>
    </div>
  );
}