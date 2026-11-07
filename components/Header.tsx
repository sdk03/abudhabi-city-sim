'use client';

import React from 'react';
import {
  Wallet,
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  Award,
  Coins,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { AbuDhabiDistrict, Web3State } from '@/types/game';
import { DISTRICTS } from '@/lib/buildingsData';
import { formatAddress } from '@/lib/utils';
import { soundSynth } from '@/lib/audioSynth';

interface HeaderProps {
  district: AbuDhabiDistrict;
  onSelectDistrict: (d: AbuDhabiDistrict) => void;
  web3State: Web3State;
  onOpenWeb3Modal: () => void;
  onOpenAchievements: () => void;
  onOpenFaucet: () => void;
  timeOfDay: 'day' | 'sunset' | 'night';
  onChangeTimeOfDay: (time: 'day' | 'sunset' | 'night') => void;
  unlockedAchievementsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  district,
  onSelectDistrict,
  web3State,
  onOpenWeb3Modal,
  onOpenAchievements,
  onOpenFaucet,
  timeOfDay,
  onChangeTimeOfDay,
  unlockedAchievementsCount,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundSynth.getMuted());

  const handleToggleMute = () => {
    const muted = soundSynth.toggleMute();
    setIsMuted(muted);
  };

  const cycleTime = () => {
    if (timeOfDay === 'day') onChangeTimeOfDay('sunset');
    else if (timeOfDay === 'sunset') onChangeTimeOfDay('night');
    else onChangeTimeOfDay('day');
  };

  return (
    <header className="h-16 px-4 bg-slate-950/80 backdrop-blur-md border-b border-amber-500/20 flex items-center justify-between z-20 shrink-0">
      {/* Brand & City Crest */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/40">
          <span className="text-xl">🦅</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-base md:text-lg tracking-wide leading-tight">
              ABU DHABI
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Web3 Sim
            </span>
          </div>
          <p className="text-xs text-slate-400 font-arabic hidden sm:block">
            عاصمة المستقبل المستدام والرقمي
          </p>
        </div>
      </div>

      {/* District Dropdown Selector */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {(Object.keys(DISTRICTS) as AbuDhabiDistrict[]).map((dKey) => {
          const d = DISTRICTS[dKey];
          const isSelected = district === dKey;
          return (
            <button
              key={dKey}
              onClick={() => onSelectDistrict(dKey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Action Controls & Web3 Badge */}
      <div className="flex items-center gap-2">
        {/* Faucet Button */}
        <button
          onClick={onOpenFaucet}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition active:scale-95"
          title="Claim free test $ADX tokens"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>Faucet</span>
        </button>

        {/* Time of Day Cycle */}
        <button
          onClick={cycleTime}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          title={`Current: ${timeOfDay.toUpperCase()}. Click to cycle time of day.`}
        >
          {timeOfDay === 'day' && <Sun className="w-4 h-4 text-amber-400" />}
          {timeOfDay === 'sunset' && <Sunset className="w-4 h-4 text-orange-400" />}
          {timeOfDay === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Mute Toggle */}
        <button
          onClick={handleToggleMute}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Achievements Badge */}
        <button
          onClick={onOpenAchievements}
          className="relative p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-amber-400 transition"
          title="Trophies & Vision 2030 Achievements"
        >
          <Award className="w-4 h-4" />
          {unlockedAchievementsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded-full flex items-center justify-center">
              {unlockedAchievementsCount}
            </span>
          )}
        </button>

        {/* Web3 Wallet Connect */}
        <button
          onClick={onOpenWeb3Modal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 shadow-md ${
            web3State.isConnected
              ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400'
              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 hover:brightness-110'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          {web3State.isConnected ? (
            <div className="flex items-center gap-1.5">
              <span>{formatAddress(web3State.account)}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-mono">
                {web3State.adxTokenBalance} $ADX
              </span>
            </div>
          ) : (
            <span>Connect Web3</span>
          )}
        </button>
      </div>
    </header>
  );
};
