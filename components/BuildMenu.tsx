'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Home,
  Building2,
  SunMedium,
  Trees,
  Trash2,
  X,
  Lock,
  Layers,
  Coins,
} from 'lucide-react';
import { BuildingDefinition, BuildingCategory, PlacedBuilding } from '@/types/game';
import { BUILDINGS_CATALOG } from '@/lib/buildingsData';
import { formatNumber } from '@/lib/utils';
import { soundSynth } from '@/lib/audioSynth';

interface BuildMenuProps {
  currentCoins: number;
  currentPopulation: number;
  selectedBuilding: BuildingDefinition | null;
  onSelectBuilding: (b: BuildingDefinition | null) => void;
  isDemolishMode: boolean;
  onToggleDemolish: () => void;
  selectedPlacedBuilding: PlacedBuilding | null;
  onUpgradeBuilding: (pb: PlacedBuilding) => void;
  onDemolishBuilding: (pb: PlacedBuilding) => void;
  onCloseSelectedPlaced: () => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  currentCoins,
  currentPopulation,
  selectedBuilding,
  onSelectBuilding,
  isDemolishMode,
  onToggleDemolish,
  selectedPlacedBuilding,
  onUpgradeBuilding,
  onDemolishBuilding,
  onCloseSelectedPlaced,
}) => {
  const [activeTab, setActiveTab] = useState<BuildingCategory | 'all'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'landmark', label: 'Landmarks', icon: Sparkles },
    { id: 'commercial', label: 'Commerce', icon: Building2 },
    { id: 'residential', label: 'Living', icon: Home },
    { id: 'energy', label: 'Clean Tech', icon: SunMedium },
    { id: 'eco', label: 'Oasis & Eco', icon: Trees },
  ];

  const filteredBuildings = BUILDINGS_CATALOG.filter((b) => {
    if (activeTab === 'all') return true;
    return b.category === activeTab;
  });

  // Selected Placed Building Detail Inspector
  const placedDef = selectedPlacedBuilding
    ? BUILDINGS_CATALOG.find((b) => b.id === selectedPlacedBuilding.buildingId)
    : null;

  return (
    <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-6 z-20 flex flex-col items-center pointer-events-none">
      {/* Placed Building Inspector Popup */}
      {selectedPlacedBuilding && placedDef && (
        <div className="pointer-events-auto mb-3 bg-slate-950/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-md w-full animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: `${placedDef.color}25`, color: placedDef.color }}
              >
                {placedDef.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                  {placedDef.name}
                  <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 font-mono">
                    ★ Level {selectedPlacedBuilding.level}
                  </span>
                </h3>
                <span className="text-xs text-amber-300 font-arabic">
                  {placedDef.nameAr}
                </span>
              </div>
            </div>
            <button
              onClick={onCloseSelectedPlaced}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 my-2.5 leading-relaxed">
            {placedDef.description}
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center text-xs mb-3">
            <div>
              <span className="text-slate-400 block text-[10px]">Revenue</span>
              <span className="font-bold text-emerald-400">
                +{placedDef.revenuePerTick * selectedPlacedBuilding.level} $ADX
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Happiness</span>
              <span className="font-bold text-yellow-400">
                +{placedDef.happinessBonus}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Sustainability</span>
              <span className="font-bold text-teal-400">
                +{placedDef.sustainabilityBonus}%
              </span>
            </div>
          </div>

          {/* Upgrade & Demolish Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpgradeBuilding(selectedPlacedBuilding)}
              disabled={currentCoins < placedDef.cost * selectedPlacedBuilding.level}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Lv.{selectedPlacedBuilding.level + 1}</span>
              <span className="font-mono text-[10px] ml-1">
                ({formatNumber(placedDef.cost * selectedPlacedBuilding.level)} $ADX)
              </span>
            </button>

            <button
              onClick={() => {
                onDemolishBuilding(selectedPlacedBuilding);
                soundSynth.playDemolish();
              }}
              className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition active:scale-95 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Demolish</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Construction Dock */}
      <div className="pointer-events-auto w-full max-w-4xl bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-2.5 transition-all">
        {/* Category Tabs & Demolish Action */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Demolish & Toggle Dock Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleDemolish}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isDemolishMode
                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-500'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-400/50 hover:text-rose-300'
              }`}
              title="Demolish building"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bulldozer</span>
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs hover:text-white"
            >
              {isCollapsed ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Building Cards Horizontal Carousel */}
        {!isCollapsed && (
          <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-amber-500/30">
            {filteredBuildings.map((building) => {
              const isLocked = currentPopulation < building.unlockedAtPop;
              const canAfford = currentCoins >= building.cost;
              const isSelected = selectedBuilding?.id === building.id;

              return (
                <div
                  key={building.id}
                  onClick={() => {
                    if (!isLocked) {
                      onSelectBuilding(isSelected ? null : building);
                    }
                  }}
                  className={`relative shrink-0 w-44 p-2.5 rounded-xl border text-left cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : isLocked
                      ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                      : canAfford
                      ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 shadow'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-75'
                  }`}
                >
                  {/* Top Bar: Icon & Cost */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">
                      {building.renderModel === 'mosque' && '🕌'}
                      {building.renderModel === 'louvre' && '🏛️'}
                      {building.renderModel === 'circuit' && '🏎️'}
                      {building.renderModel === 'tower' && '🏙️'}
                      {building.renderModel === 'skyscraper' && '🏢'}
                      {building.renderModel === 'solar' && '☀️'}
                      {building.renderModel === 'mangrove' && '🌿'}
                      {building.renderModel === 'oasis' && '🌴'}
                      {building.renderModel === 'villa' && '🏡'}
                      {building.renderModel === 'adgm' && '💎'}
                      {building.renderModel === 'desal' && '💧'}
                      {building.renderModel === 'park' && '🦅'}
                      {building.renderModel === 'road' && '🛣️'}
                    </span>

                    {/* Cost */}
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>{formatNumber(building.cost)}</span>
                    </div>
                  </div>

                  {/* Title & Arabic name */}
                  <div className="font-semibold text-slate-100 text-xs truncate">
                    {building.name}
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-arabic truncate">
                    {building.nameAr}
                  </div>

                  {/* Stat Pills */}
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300">
                    <span className="text-emerald-400 font-medium">
                      +{building.revenuePerTick}/t
                    </span>
                    {building.energyCost < 0 && (
                      <span className="text-teal-400 font-medium">
                        +{Math.abs(building.energyCost)}MW
                      </span>
                    )}
                    {building.waterCost < 0 && (
                      <span className="text-cyan-400 font-medium">
                        +{Math.abs(building.waterCost)}m³
                      </span>
                    )}
                    {building.happinessBonus > 0 && (
                      <span className="text-yellow-400 font-medium">
                        +{building.happinessBonus}%
                      </span>
                    )}
                  </div>

                  {/* Web3 Special Badge */}
                  {building.isWeb3Special && (
                    <div className="mt-1.5 inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Web3 Landmark
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/80 rounded-xl backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
                      <Lock className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-[10px] font-medium text-slate-300">
                        Pop {building.unlockedAtPop}+
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
