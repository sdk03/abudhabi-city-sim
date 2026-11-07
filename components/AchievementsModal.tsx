'use client';

import React from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles, Coins } from 'lucide-react';
import { Achievement } from '@/types/game';
import { formatNumber } from '@/lib/utils';
import { soundSynth } from '@/lib/audioSynth';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onClaimReward: (ach: Achievement) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onClaimReward,
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Abu Dhabi Vision 2030 Trophies
            </h2>
            <p className="text-xs text-slate-400">
              Complete architectural and sustainability milestones to earn treasury grants & NFTs
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                ach.unlocked
                  ? 'bg-slate-950/90 border-amber-500/40 shadow'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    ach.unlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {ach.unlocked ? '🏆' : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {ach.title}
                    {ach.unlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </h4>
                  <span className="text-xs text-amber-300 font-arabic block">
                    {ach.titleAr}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-400 mb-1 justify-end">
                  <Coins className="w-3 h-3" />
                  <span>+{formatNumber(ach.rewardCoins)}</span>
                </div>
                {ach.rewardWeb3NFT && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                    NFT Badge
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
