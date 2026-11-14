import { Universe } from '../combat/types.js';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface GladiatorNFT {
  id: string;
  ownerWallet: string;
  name: string;
  universe: Universe;
  archetype: string;
  rarity: Rarity;
  level: number;
  xp: number;
  nextLevelXp: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: string;
  trait: string;
  mintedAt: number;
}

export interface StarterPack {
  packType: 'RECRUIT' | 'SYNDICATE_BUNDLE' | 'APEX_HIGH_ROLLER';
  priceSol: number;
  priceLamports: number;
  gladiatorCount: number;
  guaranteedRarity: Rarity;
  bonusXp: number;
}

export const STARTER_PACKS: Record<string, StarterPack> = {
  RECRUIT: {
    packType: 'RECRUIT',
    priceSol: 0.02,
    priceLamports: 20_000_000,
    gladiatorCount: 1,
    guaranteedRarity: 'COMMON',
    bonusXp: 100
  },
  SYNDICATE_BUNDLE: {
    packType: 'SYNDICATE_BUNDLE',
    priceSol: 0.05,
    priceLamports: 50_000_000,
    gladiatorCount: 3,
    guaranteedRarity: 'RARE',
    bonusXp: 500
  },
  APEX_HIGH_ROLLER: {
    packType: 'APEX_HIGH_ROLLER',
    priceSol: 0.20,
    priceLamports: 200_000_000,
    gladiatorCount: 5,
    guaranteedRarity: 'EPIC',
    bonusXp: 2000
  }
};

export function rollRarity(guaranteed: Rarity): Rarity {
  if (guaranteed === 'EPIC') {
    return Math.random() < 0.25 ? 'LEGENDARY' : 'EPIC';
  }
  if (guaranteed === 'RARE') {
    const roll = Math.random();
    if (roll < 0.10) return 'LEGENDARY';
    if (roll < 0.35) return 'EPIC';
    return 'RARE';
  }
  const roll = Math.random();
  if (roll < 0.05) return 'LEGENDARY';
  if (roll < 0.15) return 'EPIC';
  if (roll < 0.40) return 'RARE';
  return 'COMMON';
}

export function generateGladiator(
  ownerWallet: string,
  universe: Universe,
  guaranteedRarity: Rarity = 'COMMON'
): GladiatorNFT {
  const rarity = rollRarity(guaranteedRarity);
  const rarityMultipliers = {
    COMMON: 1.0,
    RARE: 1.15,
    EPIC: 1.30,
    LEGENDARY: 1.50
  };
  const mult = rarityMultipliers[rarity];

  const traits = {
    COMMON: 'Standard Cybernetics',
    RARE: 'Overclocked Reflexes (+5% Speed)',
    EPIC: 'Subdermal Titanium (+10% Armor)',
    LEGENDARY: 'Apex Neuro-Link (+15% Morale Anchor)'
  };

  const id = `glad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  return {
    id,
    ownerWallet,
    name: `${rarity} ${universe.replace('_', ' ')} Combatant`,
    universe,
    archetype: 'Arena Duelist',
    rarity,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    maxHp: Math.round(100 * mult),
    currentHp: Math.round(100 * mult),
    attack: Math.round(25 * mult),
    defense: Math.round(15 * mult),
    speed: Math.round(10 * mult),
    specialMove: rarity === 'LEGENDARY' ? 'Apex Annihilation' : 'Overload Strike',
    trait: traits[rarity],
    mintedAt: Date.now()
  };
}
