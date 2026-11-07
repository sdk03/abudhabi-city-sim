'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AbuDhabiDistrict,
  PlacedBuilding,
  BuildingDefinition,
  Web3State,
  GameEvent,
  Achievement,
} from '@/types/game';
import { BUILDINGS_CATALOG, DISTRICTS, INITIAL_ACHIEVEMENTS } from '@/lib/buildingsData';
import { calculateCityMetrics, POSSIBLE_EVENTS } from '@/lib/gameEngine';
import { Web3GameManager } from '@/lib/web3';
import { soundSynth } from '@/lib/audioSynth';

import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { CityCanvas } from '@/components/CityCanvas';
import { BuildMenu } from '@/components/BuildMenu';
import { EventsBanner } from '@/components/EventsBanner';
import { Web3Modal } from '@/components/Web3Modal';
import { TokenFaucetModal } from '@/components/TokenFaucetModal';
import { AchievementsModal } from '@/components/AchievementsModal';
import { DistrictSelector } from '@/components/DistrictSelector';

const INITIAL_STARTER_BUILDINGS: Record<AbuDhabiDistrict, PlacedBuilding[]> = {
  saadiyat: [
    {
      instanceId: 'starter-1',
      buildingId: 'saadiyat_villa',
      x: 4,
      y: 4,
      level: 1,
      builtAt: Date.now(),
      lastRevenueClaim: Date.now(),
    },
    {
      instanceId: 'starter-2',
      buildingId: 'corniche_boulevard',
      x: 5,
      y: 4,
      level: 1,
      builtAt: Date.now(),
      lastRevenueClaim: Date.now(),
    },
    {
      instanceId: 'starter-3',
      buildingId: 'mangrove_sanctuary',
      x: 7,
      y: 2,
      level: 1,
      builtAt: Date.now(),
      lastRevenueClaim: Date.now(),
    },
  ],
  yas: [],
  al_reem: [],
  masdar: [],
  corniche: [],
};

export default function AbuDhabiCityApp() {
  // District state
  const [district, setDistrict] = useState<AbuDhabiDistrict>('saadiyat');
  const [buildingsMap, setBuildingsMap] = useState<Record<AbuDhabiDistrict, PlacedBuilding[]>>(
    INITIAL_STARTER_BUILDINGS
  );

  // Economy & Resources state
  const [coins, setCoins] = useState<number>(20000);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Tool states
  const [selectedBuildingToPlace, setSelectedBuildingToPlace] = useState<BuildingDefinition | null>(
    null
  );
  const [selectedPlacedBuilding, setSelectedPlacedBuilding] = useState<PlacedBuilding | null>(
    null
  );
  const [isDemolishMode, setIsDemolishMode] = useState<boolean>(false);

  // Modals state
  const [isWeb3Open, setIsWeb3Open] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isDistrictSelectorOpen, setIsDistrictSelectorOpen] = useState(false);

  // Events & Achievements
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Web3 state
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    chainId: null,
    networkName: 'Not Connected',
    adxTokenBalance: '0',
    nftLandHoldings: [],
    isConnecting: false,
    txPending: false,
    lastTxHash: null,
    error: null,
  });

  const currentBuildings = buildingsMap[district] || [];

  // Compute calculated metrics
  const { resources, revenuePerTick } = calculateCityMetrics(
    currentBuildings,
    district,
    coins,
    activeEvent
  );

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('abudhabi_city_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coins !== undefined) setCoins(parsed.coins);
        if (parsed.buildingsMap) setBuildingsMap(parsed.buildingsMap);
        if (parsed.achievements) setAchievements(parsed.achievements);
      }
    } catch (e) {
      console.warn('LocalStorage save load error:', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      const data = { coins, buildingsMap, achievements };
      localStorage.setItem('abudhabi_city_save_v1', JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }, [coins, buildingsMap, achievements]);

  // Web3 Balance Refresh
  const refreshWeb3Balance = useCallback(async () => {
    if (!web3State.account) return;
    try {
      const mgr = Web3GameManager.getInstance();
      const bal = await mgr.getTokenBalance(web3State.account);
      const nfts = mgr.getNFTLandHoldings(web3State.account);
      setWeb3State((prev) => ({
        ...prev,
        adxTokenBalance: bal,
        nftLandHoldings: nfts,
      }));
    } catch (e) {
      console.error(e);
    }
  }, [web3State.account]);

  // Connect Web3
  const handleConnectWeb3 = async () => {
    try {
      setWeb3State((prev) => ({ ...prev, isConnecting: true, error: null }));
      const mgr = Web3GameManager.getInstance();
      const conn = await mgr.connect();
      const bal = await mgr.getTokenBalance(conn.account);
      const nfts = mgr.getNFTLandHoldings(conn.account);

      setWeb3State({
        isConnected: true,
        account: conn.account,
        chainId: conn.chainId,
        networkName: conn.networkName,
        adxTokenBalance: bal,
        nftLandHoldings: nfts,
        isConnecting: false,
        txPending: false,
        lastTxHash: null,
        error: null,
      });

      soundSynth.playWeb3Success();
    } catch (e: any) {
      setWeb3State((prev) => ({
        ...prev,
        isConnecting: false,
        error: e.message || 'Web3 connection failed',
      }));
    }
  };

  // Convert Web3 Deposit to in-game treasury cash
  const handleDepositToGame = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  // Check Achievements Trigger
  const checkAchievements = useCallback(() => {
    setAchievements((prevAchievements) => {
      let updated = false;
      const next = prevAchievements.map((ach) => {
        if (ach.unlocked) return ach;

        let shouldUnlock = false;
        if (ach.id === 'first_brick' && currentBuildings.length > 0) {
          shouldUnlock = true;
        } else if (
          ach.id === 'sheikh_zayed_built' &&
          Object.values(buildingsMap).some((list) =>
            list.some((b) => b.buildingId === 'grand_mosque')
          )
        ) {
          shouldUnlock = true;
        } else if (
          ach.id === 'net_zero_hero' &&
          resources.energyProduced > resources.energyConsumed &&
          resources.sustainability >= 85
        ) {
          shouldUnlock = true;
        } else if (ach.id === 'metropolis_1000' && resources.population >= 1000) {
          shouldUnlock = true;
        } else if (
          ach.id === 'web3_syndicate' &&
          web3State.isConnected &&
          parseFloat(web3State.adxTokenBalance) >= 200
        ) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          updated = true;
          soundSynth.playAchievement();
          setCoins((c) => c + ach.rewardCoins);
          return { ...ach, unlocked: true, unlockedAt: Date.now() };
        }
        return ach;
      });

      return updated ? next : prevAchievements;
    });
  }, [currentBuildings, buildingsMap, resources, web3State]);

  // Simulation Game Loop
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = Math.floor(1000 / simSpeed);
    const timer = setInterval(() => {
      // 1. Earn Revenue
      setCoins((prev) => prev + revenuePerTick);

      // 2. Event Countdown
      if (activeEvent) {
        if (Date.now() >= activeEvent.expiresAt) {
          setActiveEvent(null);
        }
      } else {
        // 5% chance per tick to spawn an event
        if (Math.random() < 0.05) {
          const randomIndex = Math.floor(Math.random() * POSSIBLE_EVENTS.length);
          const ev = POSSIBLE_EVENTS[randomIndex];
          setActiveEvent({
            ...ev,
            expiresAt: Date.now() + ev.durationSeconds * 1000,
          });
        }
      }

      // 3. Evaluate Achievements
      checkAchievements();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, simSpeed, revenuePerTick, activeEvent, checkAchievements]);

  // Building Placement Handler
  const handlePlaceBuilding = (x: number, y: number) => {
    if (!selectedBuildingToPlace) return;

    if (coins < selectedBuildingToPlace.cost) {
      alert(`Insufficient funds! Need ${selectedBuildingToPlace.cost} $ADX`);
      return;
    }

    const newBuilding: PlacedBuilding = {
      instanceId: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      buildingId: selectedBuildingToPlace.id,
      x,
      y,
      level: 1,
      builtAt: Date.now(),
      lastRevenueClaim: Date.now(),
    };

    setCoins((prev) => prev - selectedBuildingToPlace.cost);
    setBuildingsMap((prev) => ({
      ...prev,
      [district]: [...(prev[district] || []), newBuilding],
    }));

    // Deselect after placement
    setSelectedBuildingToPlace(null);
  };

  // Building Upgrade Handler
  const handleUpgradeBuilding = (pb: PlacedBuilding) => {
    const def = BUILDINGS_CATALOG.find((b) => b.id === pb.buildingId);
    if (!def) return;
    const upgradeCost = def.cost * pb.level;

    if (coins < upgradeCost) {
      alert(`Insufficient funds! Need ${upgradeCost} $ADX to upgrade.`);
      return;
    }

    setCoins((prev) => prev - upgradeCost);
    setBuildingsMap((prev) => ({
      ...prev,
      [district]: prev[district].map((b) =>
        b.instanceId === pb.instanceId ? { ...b, level: b.level + 1 } : b
      ),
    }));
    setSelectedPlacedBuilding((prev) => (prev ? { ...prev, level: prev.level + 1 } : null));
    soundSynth.playBuild();
  };

  // Building Demolish Handler
  const handleDemolishBuilding = (pb: PlacedBuilding) => {
    setBuildingsMap((prev) => ({
      ...prev,
      [district]: prev[district].filter((b) => b.instanceId !== pb.instanceId),
    }));
    setSelectedPlacedBuilding(null);
  };

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* Top Header */}
      <Header
        district={district}
        onSelectDistrict={setDistrict}
        web3State={web3State}
        onOpenWeb3Modal={() => setIsWeb3Open(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        unlockedAchievementsCount={unlockedAchievementsCount}
      />

      {/* Dynamic News / Event Banner */}
      <EventsBanner currentEvent={activeEvent} onDismiss={() => setActiveEvent(null)} />

      {/* City Stats Bar */}
      <StatsBar
        resources={resources}
        revenueRate={revenuePerTick}
        simSpeed={simSpeed}
        onSetSimSpeed={setSimSpeed}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onQuickCollect={() => setCoins((prev) => prev + revenuePerTick * 5)}
      />

      {/* Main Interactive Isometric Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <CityCanvas
          district={district}
          placedBuildings={currentBuildings}
          selectedBuildingToPlace={selectedBuildingToPlace}
          onPlaceBuilding={handlePlaceBuilding}
          onSelectPlacedBuilding={(b) => {
            if (isDemolishMode && b) {
              handleDemolishBuilding(b);
              soundSynth.playDemolish();
            } else {
              setSelectedPlacedBuilding(b);
            }
          }}
          selectedPlacedBuilding={selectedPlacedBuilding}
          timeOfDay={timeOfDay}
        />

        {/* Construction & Building Palette Dock */}
        <BuildMenu
          currentCoins={coins}
          currentPopulation={resources.population}
          selectedBuilding={selectedBuildingToPlace}
          onSelectBuilding={(b) => {
            setSelectedBuildingToPlace(b);
            setIsDemolishMode(false);
            setSelectedPlacedBuilding(null);
          }}
          isDemolishMode={isDemolishMode}
          onToggleDemolish={() => {
            setIsDemolishMode(!isDemolishMode);
            setSelectedBuildingToPlace(null);
            setSelectedPlacedBuilding(null);
          }}
          selectedPlacedBuilding={selectedPlacedBuilding}
          onUpgradeBuilding={handleUpgradeBuilding}
          onDemolishBuilding={handleDemolishBuilding}
          onCloseSelectedPlaced={() => setSelectedPlacedBuilding(null)}
        />
      </main>

      {/* Web3 EVM & Smart Contract Modal */}
      <Web3Modal
        isOpen={isWeb3Open}
        onClose={() => setIsWeb3Open(false)}
        web3State={web3State}
        onConnect={handleConnectWeb3}
        onRefreshBalance={refreshWeb3Balance}
        currentDistrict={district}
      />

      {/* Token Faucet Modal */}
      <TokenFaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
        web3State={web3State}
        onRefreshBalance={refreshWeb3Balance}
        onDepositToGame={handleDepositToGame}
      />

      {/* Vision 2030 Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        onClaimReward={(ach) => setCoins((prev) => prev + ach.rewardCoins)}
      />

      {/* District Selector Modal */}
      <DistrictSelector
        isOpen={isDistrictSelectorOpen}
        onClose={() => setIsDistrictSelectorOpen(false)}
        selectedDistrict={district}
        onSelect={setDistrict}
      />
    </div>
  );
}
