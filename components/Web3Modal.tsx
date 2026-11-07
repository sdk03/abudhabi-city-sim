'use client';

import React, { useState } from 'react';
import {
  X,
  Wallet,
  Coins,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Web3State, AbuDhabiDistrict } from '@/types/game';
import { Web3GameManager, ADX_CONTRACT_ADDRESS, LAND_NFT_CONTRACT_ADDRESS } from '@/lib/web3';
import { DISTRICTS } from '@/lib/buildingsData';
import { formatAddress } from '@/lib/utils';
import { soundSynth } from '@/lib/audioSynth';

interface Web3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  web3State: Web3State;
  onConnect: () => Promise<void>;
  onRefreshBalance: () => Promise<void>;
  currentDistrict: AbuDhabiDistrict;
}

export const Web3Modal: React.FC<Web3ModalProps> = ({
  isOpen,
  onClose,
  web3State,
  onConnect,
  onRefreshBalance,
  currentDistrict,
}) => {
  const [copied, setCopied] = useState(false);
  const [decreeText, setDecreeText] = useState('Vision 2030 Net-Zero Energy Modernization');
  const [decreeSignature, setDecreeSignature] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMintNFT = async () => {
    if (!web3State.account) return;
    try {
      setIsMinting(true);
      setMintStatus(null);
      const mgr = Web3GameManager.getInstance();
      const res = await mgr.mintLandNFT(web3State.account, DISTRICTS[currentDistrict].name);
      soundSynth.playWeb3Success();
      setMintStatus(`Successfully minted ${res.tokenId} (Tx: ${formatAddress(res.txHash)})`);
      await onRefreshBalance();
    } catch (err: any) {
      setMintStatus(`Error: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleSignDecree = async () => {
    if (!web3State.account) return;
    try {
      const mgr = Web3GameManager.getInstance();
      const sig = await mgr.signDecree(web3State.account, decreeText);
      soundSynth.playWeb3Success();
      setDecreeSignature(sig);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Abu Dhabi Web3 Portal
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                web3.js v4
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sovereign smart contract registry and on-chain land deeds
            </p>
          </div>
        </div>

        {/* Wallet Connection Status */}
        {!web3State.isConnected ? (
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-center mb-6">
            <p className="text-sm text-slate-300 mb-4">
              Connect your Web3 EVM wallet (MetaMask, Rabby, OKX) or launch instant Sovereign
              Sandbox session to unlock on-chain land staking and special landmarks.
            </p>
            <button
              onClick={onConnect}
              disabled={web3State.isConnecting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{web3State.isConnecting ? 'Initializing Web3...' : 'Connect EVM / Sandbox Wallet'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* Account Card */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Active Sovereign Account</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {web3State.networkName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-amber-200">
                  {formatAddress(web3State.account)}
                </span>
                <button
                  onClick={() => copyToClipboard(web3State.account || '')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy full address"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">$ADX Token Balance</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {web3State.adxTokenBalance} ADX
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Land NFT Holdings</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {web3State.nftLandHoldings.length} Deeds
                  </span>
                </div>
              </div>
            </div>

            {/* Mint District NFT Deed */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">
                    Mint {DISTRICTS[currentDistrict].name} Deed NFT
                  </h4>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold">50 $ADX</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Mint an authentic ERC-721 deed proving sovereign stewardship of this Abu Dhabi
                district on-chain.
              </p>
              <button
                onClick={handleMintNFT}
                disabled={isMinting || parseFloat(web3State.adxTokenBalance) < 50}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isMinting ? 'Minting On-Chain...' : 'Mint Land Deed NFT (ERC-721)'}</span>
              </button>
              {mintStatus && (
                <p className="mt-2 text-xs font-mono text-amber-300 break-all bg-slate-900 p-2 rounded-lg">
                  {mintStatus}
                </p>
              )}
            </div>

            {/* Mayoral Executive Decree Signer (web3.eth.personal.sign) */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Sign Mayoral Executive Decree</h4>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Cryptographically sign Abu Dhabi municipal policies using your wallet private key.
              </p>
              <input
                type="text"
                value={decreeText}
                onChange={(e) => setDecreeText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 mb-3 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSignDecree}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Authorize & Sign with Web3.js</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {decreeSignature && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-300 break-all border border-slate-800">
                  <span className="text-emerald-400 block font-bold mb-0.5">
                    ✓ ECDSA Signature Verified:
                  </span>
                  {decreeSignature}
                </div>
              )}
            </div>

            {/* Smart Contract Addresses */}
            <div className="text-[11px] space-y-1 text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 font-mono">
              <div className="flex justify-between">
                <span>$ADX Token:</span>
                <span className="text-amber-300">{formatAddress(ADX_CONTRACT_ADDRESS)}</span>
              </div>
              <div className="flex justify-between">
                <span>Land NFT:</span>
                <span className="text-cyan-300">{formatAddress(LAND_NFT_CONTRACT_ADDRESS)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
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
