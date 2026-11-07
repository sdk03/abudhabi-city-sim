import {
  PlacedBuilding,
  GameResources,
  AbuDhabiDistrict,
  GameEvent,
  Achievement,
} from '@/types/game';
import { BUILDINGS_CATALOG, DISTRICTS } from '@/lib/buildingsData';

export function calculateCityMetrics(
  placedBuildings: PlacedBuilding[],
  district: AbuDhabiDistrict,
  currentCoins: number,
  activeEvent: GameEvent | null
): { resources: GameResources; revenuePerTick: number } {
  const districtInfo = DISTRICTS[district];

  let energyProduced = 0;
  let energyConsumed = 0;
  let waterProduced = 0;
  let waterConsumed = 0;
  let maxPopulation = 50; // Base baseline
  let baseRevenue = 5; // Base municipal grant
  let totalHappinessBonus = 0;
  let totalSustainabilityBonus = 0;

  placedBuildings.forEach((pb) => {
    const def = BUILDINGS_CATALOG.find((b) => b.id === pb.buildingId);
    if (!def) return;

    const level = pb.level || 1;

    // Energy
    if (def.energyCost < 0) {
      energyProduced += Math.abs(def.energyCost) * level;
    } else {
      energyConsumed += def.energyCost * level;
    }

    // Water
    if (def.waterCost < 0) {
      waterProduced += Math.abs(def.waterCost) * level;
    } else {
      waterConsumed += def.waterCost * level;
    }

    // Population
    maxPopulation += def.populationCap * level;

    // Revenue
    baseRevenue += def.revenuePerTick * level;

    // Bonuses
    totalHappinessBonus += def.happinessBonus;
    totalSustainabilityBonus += def.sustainabilityBonus;
  });

  // Apply district multipliers
  if (districtInfo) {
    baseRevenue *= districtInfo.multiplier.revenue;
    totalSustainabilityBonus *= districtInfo.multiplier.eco;
    totalHappinessBonus *= districtInfo.multiplier.culture;
  }

  // Deficit checks
  const energyShortage = energyConsumed > energyProduced;
  const waterShortage = waterConsumed > waterProduced;

  let happiness = 70 + totalHappinessBonus;
  if (energyShortage) happiness -= 30;
  if (waterShortage) happiness -= 30;
  happiness = Math.max(10, Math.min(100, happiness));

  // Sustainability score
  let sustainability = 50;
  if (energyProduced > 0) {
    const cleanRatio = Math.min(energyProduced / Math.max(energyConsumed, 1), 2.0);
    sustainability += cleanRatio * 25;
  }
  sustainability += totalSustainabilityBonus;
  sustainability = Math.max(10, Math.min(100, sustainability));

  // Event multipliers
  if (activeEvent?.multiplier?.revenue) {
    baseRevenue *= activeEvent.multiplier.revenue;
  }
  if (activeEvent?.multiplier?.happiness) {
    happiness = Math.min(100, happiness * activeEvent.multiplier.happiness);
  }

  // Population grows towards maxPopulation based on happiness
  const targetPop = Math.floor(maxPopulation * (happiness / 100));

  const revenuePerTick = Math.max(1, Math.round(baseRevenue * (happiness / 100)));

  return {
    resources: {
      coins: currentCoins,
      population: targetPop,
      maxPopulation,
      energyProduced,
      energyConsumed,
      waterProduced,
      waterConsumed,
      happiness,
      sustainability,
    },
    revenuePerTick,
  };
}

export const POSSIBLE_EVENTS: Omit<GameEvent, 'expiresAt'>[] = [
  {
    id: 'f1_gp',
    title: 'Abu Dhabi Grand Prix at Yas Marina',
    titleAr: 'سباق جائزة الاتحاد للطيران الكبرى للفورمولا 1',
    description: 'International motorsport fans and yacht owners flock to the emirate!',
    type: 'visitor',
    effectText: '+50% Revenue Boost',
    durationSeconds: 40,
    multiplier: { revenue: 1.5, happiness: 1.2 },
  },
  {
    id: 'masdar_summit',
    title: 'World Future Energy Summit at Masdar',
    titleAr: 'القمة العالمية لطاقة المستقبل في مصدر',
    description: 'Global tech leaders endorse Abu Dhabi net-zero initiatives.',
    type: 'boost',
    effectText: '+40% Sustainability & Green Energy',
    durationSeconds: 35,
    multiplier: { energy: 1.4 },
  },
  {
    id: 'louvre_biennale',
    title: 'Saadiyat International Art Biennale',
    titleAr: 'بينالي الفنون الدولي في السعديات',
    description: 'Breathtaking artistic exhibitions draw visitors from around the world.',
    type: 'boost',
    effectText: '+25% Cultural Happiness',
    durationSeconds: 30,
    multiplier: { happiness: 1.25 },
  },
  {
    id: 'adgm_web3_week',
    title: 'ADGM Sovereign Web3 & Digital Assets Forum',
    titleAr: 'منتدى أبوظبي للأصول الرقمية والويب 3',
    description: 'Institutional crypto capital allocates treasury reserves to local smart contracts.',
    type: 'web3',
    effectText: '+60% $ADX Municipal Staking Yields',
    durationSeconds: 45,
    multiplier: { revenue: 1.6 },
  },
];
