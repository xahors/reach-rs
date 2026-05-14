import { X, Minus, Square, Copy } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect } from 'react';

export default function Titlebar() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri((window as any).__TAURI_INTERNALS__ !== undefined);
  }, []);

  if (!isTauri) return null;

  return (
    <div 
      data-tauri-drag-region 
      className="flex h-8 w-full items-center justify-between bg-discord-nav select-none border-b border-black/20"
    >
      <div className="flex items-center px-3 pointer-events-none">
        <span className="text-xs font-bold text-discord-text-muted uppercase tracking-wider">Reach</span>
      </div>
      
      <div className="flex h-full">
        <button 
          onClick={() => invoke('minimize_window')}
          className="flex w-12 items-center justify-center transition-colors hover:bg-white/10"
        >
          <Minus className="h-4 w-4 text-discord-text-muted" />
        </button>
        <button 
          onClick={() => invoke('maximize_window')}
          className="flex w-12 items-center justify-center transition-colors hover:bg-white/10"
        >
          <Square className="h-3 w-3 text-discord-text-muted" />
        </button>
        <button 
          onClick={() => invoke('close_window')}
          className="flex w-12 items-center justify-center transition-colors hover:bg-red-500 hover:text-white group"
        >
          <X className="h-4 w-4 text-discord-text-muted group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
