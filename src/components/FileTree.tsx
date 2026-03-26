import React from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileTreeProps {
  files: { path: string }[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, selectedPath, onSelect }) => {
  // Simple flat tree for now, can be expanded to nested
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="flex flex-1 flex-col py-2 overflow-y-auto">
      <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        Files
      </div>
      <div className="flex flex-col">
        {sortedFiles.map((file) => {
          const isSelected = selectedPath === file.path;
          return (
            <button
              key={file.path}
              onClick={() => onSelect(file.path)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 md:py-1.5 text-sm transition-colors hover:bg-zinc-800 text-left",
                isSelected ? "bg-zinc-800 text-white" : "text-zinc-400"
              )}
            >
              <File size={16} className={cn("shrink-0", isSelected ? "text-blue-400" : "text-zinc-500")} />
              <span className="truncate flex-1">{file.path}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
