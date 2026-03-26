import React from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  return (
    <div className="flex h-full flex-col bg-black font-mono text-[10px] md:text-xs text-green-500">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 md:px-4 py-1 text-zinc-400 shrink-0">
        <TerminalIcon size={12} />
        <span>Terminal</span>
      </div>
      <div className="flex-1 overflow-auto p-3 md:p-4 space-y-1">
        {logs.length === 0 ? (
          <div className="text-zinc-600">No logs to display.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap">
              <span className="text-zinc-500 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
