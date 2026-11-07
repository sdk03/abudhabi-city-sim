'use client';

import React, { useState } from 'react';
import { X, Coins, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Web3State } from '@/types/game';
import { Web3GameManager } from '@/lib/web3';
import { soundSynth } from '@/lib/audioSynth';
import { formatAddress } from '@/lib/utils';

interface TokenFaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  web3State: Web3State;
  onRefreshBalance: () => Promise<void>;
  onDepositToGame: (amount: number) => void;
}

export const TokenFaucetModal: React.FC<TokenFaucetModalProps> = ({
  isOpen,
  onClose,
  web3State,
  onRefreshBalance,
  onDepositToGame,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaim = async (amount: number) => {
    if (!web3State.account) {
      alert('Please connect your Web3 wallet first!');
      return;
    }

    try {
      setIsClaiming(true);
      setTxSuccess(null);
      const mgr = Web3GameManager.getInstance();
      const res = await mgr.claimFaucet(web3State.account, amount);
      soundSynth.playWeb3Success();
      setTxSuccess(`Claimed +${amount} $ADX! Hash: ${formatAddress(res.txHash)}`);
      await onRefreshBalance();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleTransferToTreasury = () => {
    const bal = parseFloat(web3State.adxTokenBalance) || 0;
    if (bal <= 0) {
      alert('No $ADX in wallet to transfer. Claim from faucet first!');
      return;
    }
    const transferAmount = Math.min(bal, 100);
    onDepositToGame(transferAmount * 100); // 1 $ADX = 100 AED City Cash
    soundSynth.playCoins();
    alert(`Transferred ${transferAmount} $ADX into your Abu Dhabi City Treasury (+${transferAmount * 100} cash)!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              $ADX Sovereign Faucet
            </h2>
            <p className="text-xs text-slate-400">
              Claim free municipal test tokens for city growth
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Connected Wallet:</span>
            <span className="font-mono text-amber-300">
              {formatAddress(web3State.account) || 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Wallet $ADX Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {web3State.adxTokenBalance} $ADX
            </span>
          </div>
        </div>

        {/* Claim Buttons */}
        <div className="space-y-3 mb-5">
          <button
            onClick={() => handleClaim(100)}
            disabled={isClaiming}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Claim 100 $ADX (Grant)</span>
          </button>

          <button
            onClick={() => handleClaim(500)}
            disabled={isClaiming}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 font-semibold text-xs active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>Claim 500 $ADX (Mega Development Sovereign Fund)</span>
          </button>

          <button
            onClick={handleTransferToTreasury}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>Convert 100 $ADX into City Treasury Cash</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {txSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 mb-4 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{txSuccess}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
