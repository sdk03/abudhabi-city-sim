export type BuildingCategory =
  | 'landmark'
  | 'residential'
  | 'commercial'
  | 'culture'
  | 'energy'
  | 'infrastructure'
  | 'eco';

export interface BuildingDefinition {
  id: string;
  name: string;
  nameAr: string; // Arabic name for authentic Emirati feel
  category: BuildingCategory;
  cost: number;
  energyCost: number; // Positive = consumes, Negative = generates
  waterCost: number; // Positive = consumes, Negative = generates
  revenuePerTick: number; // $ADX generation
  populationCap: number;
  happinessBonus: number;
  sustainabilityBonus: number;
  unlockedAtPop: number;
  isWeb3Special?: boolean; // Requires web3 wallet or on-chain mint
  web3TokenCost?: number; // In on-chain $ADX
  icon: string;
  description: string;
  color: string;
  dimensions: { width: number; height: number }; // In grid tiles
  renderModel: 'mosque' | 'louvre' | 'skyscraper' | 'tower' | 'solar' | 'circuit' | 'mangrove' | 'oasis' | 'villa' | 'adgm' | 'desal' | 'road' | 'park';
}

export interface PlacedBuilding {
  instanceId: string;
  buildingId: string;
  x: number;
  y: number;
  level: number;
  builtAt: number;
  lastRevenueClaim: number;
}

export type AbuDhabiDistrict = 'saadiyat' | 'yas' | 'al_reem' | 'masdar' | 'corniche';

export interface DistrictInfo {
  id: AbuDhabiDistrict;
  name: string;
  nameAr: string;
  tagline: string;
  bonus: string;
  multiplier: {
    revenue: number;
    eco: number;
    culture: number;
  };
  gridSize: { width: number; height: number };
  themeBg: string;
}

export interface GameResources {
  coins: number; // In-game liquid cash (AED / $ADX)
  population: number;
  maxPopulation: number;
  energyProduced: number;
  energyConsumed: number;
  waterProduced: number;
  waterConsumed: number;
  happiness: number; // 0 to 100
  sustainability: number; // 0 to 100 (Vision 2030)
}

export interface GameEvent {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  type: 'boost' | 'visitor' | 'weather' | 'web3';
  effectText: string;
  durationSeconds: number;
  expiresAt: number;
  multiplier?: {
    revenue?: number;
    happiness?: number;
    energy?: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  rewardCoins: number;
  rewardWeb3NFT: boolean;
  nftTokenId?: number;
}

export interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  networkName: string;
  adxTokenBalance: string; // ERC20 $ADX balance
  nftLandHoldings: string[]; // Token IDs of minted district deeds
  isConnecting: boolean;
  txPending: boolean;
  lastTxHash: string | null;
  error: string | null;
}
