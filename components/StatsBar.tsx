'use client';

import React from 'react';
import {
  Coins,
  Users,
  Zap,
  Droplets,
  Smile,
  Leaf,
  Play,
  Pause,
  FastForward,
} from 'lucide-react';
import { GameResources } from '@/types/game';
import { formatNumber } from '@/lib/utils';
import { soundSynth } from '@/lib/audioSynth';

interface StatsBarProps {
  resources: GameResources;
  revenueRate: number;
  simSpeed: number;
  onSetSimSpeed: (speed: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onQuickCollect: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  resources,
  revenueRate,
  simSpeed,
  onSetSimSpeed,
  isPaused,
  onTogglePause,
  onQuickCollect,
}) => {
  const energyNet = resources.energyProduced - resources.energyConsumed;
  const waterNet = resources.waterProduced - resources.waterConsumed;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
      {/* Resource Metrics Grid */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6">
        {/* Treasury (AED / $ADX) */}
        <div
          onClick={() => {
            onQuickCollect();
            soundSynth.playCoins();
          }}
          className="flex items-center gap-2 cursor-pointer group bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
          title="City Treasury ($ADX). Click to collect tax bonus!"
        >
          <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <span>{formatNumber(resources.coins)}</span>
              <span className="text-[10px] text-amber-400/80 font-normal">$ADX</span>
            </div>
            <span className="text-[10px] text-emerald-400 block font-medium">
              +{revenueRate}/tick
            </span>
          </div>
        </div>

        {/* Population */}
        <div
          className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60"
          title="Population / Housing Capacity"
        >
          <div className="w-6 h-6 rounded-md bg-sky-500/20 flex items-center justify-center text-sky-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-100">
              {formatNumber(resources.population)}
              <span className="text-slate-400 text-[10px] font-normal">
                /{formatNumber(resources.maxPopulation)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Residents</span>
          </div>
        </div>

        {/* Clean Energy */}
        <div
          className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60"
          title="Clean Electricity: Produced vs Consumed"
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              energyNet >= 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div
              className={`font-bold ${
                energyNet >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {energyNet >= 0 ? `+${energyNet}` : energyNet}
              <span className="text-[10px] text-slate-400 font-normal"> MW</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {resources.energyProduced} gen / {resources.energyConsumed} used
            </span>
          </div>
        </div>

        {/* Water */}
        <div
          className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60"
          title="Desalinated Water: Produced vs Consumed"
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              waterNet >= 0
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <div
              className={`font-bold ${
                waterNet >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {waterNet >= 0 ? `+${waterNet}` : waterNet}
              <span className="text-[10px] text-slate-400 font-normal"> m³</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {resources.waterProduced} prod / {resources.waterConsumed} used
            </span>
          </div>
        </div>

        {/* Citizen Happiness */}
        <div
          className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60"
          title="Citizen Happiness Index"
        >
          <div className="w-6 h-6 rounded-md bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Smile className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-yellow-300">
              {Math.min(Math.round(resources.happiness), 100)}%
            </div>
            <span className="text-[10px] text-slate-400 block">Happiness</span>
          </div>
        </div>

        {/* Vision 2030 Sustainability Rating */}
        <div
          className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60"
          title="Abu Dhabi Vision 2030 Sustainability Index"
        >
          <div className="w-6 h-6 rounded-md bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-teal-300">
              {Math.min(Math.round(resources.sustainability), 100)}%
            </div>
            <span className="text-[10px] text-slate-400 block">Net-Zero 2030</span>
          </div>
        </div>
      </div>

      {/* Simulation Speed Controls */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 ml-auto">
        <button
          onClick={onTogglePause}
          className={`p-1.5 rounded-md transition ${
            isPaused
              ? 'bg-rose-500/20 text-rose-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => onSetSimSpeed(1)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
            simSpeed === 1 && !isPaused
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1x
        </button>
        <button
          onClick={() => onSetSimSpeed(2)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
            simSpeed === 2 && !isPaused
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2x
        </button>
        <button
          onClick={() => onSetSimSpeed(4)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
            simSpeed === 4 && !isPaused
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FastForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
