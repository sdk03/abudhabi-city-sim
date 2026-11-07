'use client';

import React from 'react';
import { X, MapPin, Sparkles, Check } from 'lucide-react';
import { AbuDhabiDistrict } from '@/types/game';
import { DISTRICTS } from '@/lib/buildingsData';

interface DistrictSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: AbuDhabiDistrict;
  onSelect: (d: AbuDhabiDistrict) => void;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Select Abu Dhabi District</h2>
            <p className="text-xs text-slate-400">
              Each district has unique geographical traits, building layouts, and Web3 bonuses
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {(Object.keys(DISTRICTS) as AbuDhabiDistrict[]).map((dKey) => {
            const d = DISTRICTS[dKey];
            const isSelected = selectedDistrict === dKey;

            return (
              <div
                key={dKey}
                onClick={() => {
                  onSelect(dKey);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition select-none flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{d.name}</h3>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-xs text-amber-300 font-arabic block">{d.nameAr}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.tagline}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] font-medium border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{d.bonus}</span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0 font-mono">
                  {d.gridSize.width}x{d.gridSize.height}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
