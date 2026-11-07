'use client';

import React from 'react';
import { Sparkles, Trophy, Sun, Flame, Zap, X } from 'lucide-react';
import { GameEvent } from '@/types/game';

interface EventsBannerProps {
  currentEvent: GameEvent | null;
  onDismiss: () => void;
}

export const EventsBanner: React.FC<EventsBannerProps> = ({ currentEvent, onDismiss }) => {
  if (!currentEvent) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md z-20 shrink-0">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="p-1 rounded-md bg-slate-950/20 shrink-0">
          {currentEvent.type === 'boost' && <Zap className="w-3.5 h-3.5 fill-current" />}
          {currentEvent.type === 'visitor' && <Trophy className="w-3.5 h-3.5 fill-current" />}
          {currentEvent.type === 'weather' && <Sun className="w-3.5 h-3.5 fill-current" />}
          {currentEvent.type === 'web3' && <Sparkles className="w-3.5 h-3.5 fill-current" />}
        </span>

        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold uppercase tracking-wide">
            {currentEvent.title}:
          </span>
          <span className="opacity-90 truncate">{currentEvent.description}</span>
          <span className="bg-slate-950/20 px-2 py-0.5 rounded-full font-mono text-[11px] shrink-0">
            {currentEvent.effectText}
          </span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="ml-2 p-1 hover:bg-slate-950/20 rounded-md transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
